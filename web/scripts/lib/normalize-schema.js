/**
 * Normalize an OpenAPI/JSON-Schema node into a `NormalizedSchema`.
 *
 * Rules:
 * - $ref pointing at #/components/schemas/<name> becomes { kind: 'ref', name }.
 * - allOf is preserved as { kind: 'composition', parts, merged } where `merged` is the deep-merged
 *   object form, used by the JSON example synthesizer.
 * - oneOf/anyOf becomes a union; the discriminator is preserved verbatim.
 */
const SCHEMA_REF_PREFIX = '#/components/schemas/'

export function normalizeSchema(node) {
  if (node === null || typeof node !== 'object') {
    return { kind: 'primitive', type: 'string' }
  }

  if (typeof node.$ref === 'string' && node.$ref.startsWith(SCHEMA_REF_PREFIX)) {
    return { kind: 'ref', name: node.$ref.slice(SCHEMA_REF_PREFIX.length) }
  }

  if (Array.isArray(node.allOf)) {
    const parts = node.allOf.map(normalizeSchema)
    const merged = mergeAllOf(node.allOf)
    return { kind: 'composition', variant: 'allOf', parts, merged: normalizeSchema(merged) }
  }

  if (Array.isArray(node.oneOf) || Array.isArray(node.anyOf)) {
    const variant = Array.isArray(node.oneOf) ? 'oneOf' : 'anyOf'
    const options = (node[variant] ?? []).map(normalizeSchema)
    const out = { kind: 'union', variant, options }
    if (node.discriminator && typeof node.discriminator === 'object') {
      out.discriminator = {
        propertyName: node.discriminator.propertyName,
        ...(node.discriminator.mapping
          ? { mapping: simplifyMapping(node.discriminator.mapping) }
          : {}),
      }
    }
    return out
  }

  const inferredType = node.type ?? inferType(node)
  if (inferredType === 'array') {
    return {
      kind: 'array',
      items: normalizeSchema(node.items ?? {}),
      ...optional(node, ['minItems', 'maxItems', 'uniqueItems']),
    }
  }

  if (inferredType === 'object' || node.properties || node.additionalProperties !== undefined) {
    const required = new Set(Array.isArray(node.required) ? node.required : [])
    const props = node.properties ?? {}
    const properties = Object.entries(props).map(([name, sub]) => ({
      name,
      required: required.has(name),
      schema: normalizeSchema(sub),
      description: sub?.description ?? '',
    }))
    const out = { kind: 'object', properties }
    if (node.additionalProperties === false) out.additionalProperties = false
    else if (node.additionalProperties && typeof node.additionalProperties === 'object') {
      out.additionalProperties = normalizeSchema(node.additionalProperties)
    }
    if (typeof node.minProperties === 'number') out.minProperties = node.minProperties
    return out
  }

  // primitive
  const prim = {
    kind: 'primitive',
    type: inferredType ?? 'string',
    ...optional(node, [
      'format',
      'enum',
      'const',
      'pattern',
      'minLength',
      'maxLength',
      'minimum',
      'maximum',
      'default',
      'example',
    ]),
  }
  return prim
}

function inferType(node) {
  if (node.enum) return typeof node.enum[0] === 'number' ? 'number' : 'string'
  if (node.const !== undefined) return typeof node.const === 'number' ? 'number' : 'string'
  return undefined
}

function optional(node, keys) {
  const out = {}
  for (const k of keys) if (node[k] !== undefined) out[k] = node[k]
  return out
}

function simplifyMapping(mapping) {
  const out = {}
  for (const [key, value] of Object.entries(mapping)) {
    if (typeof value === 'string' && value.startsWith(SCHEMA_REF_PREFIX)) {
      out[key] = value.slice(SCHEMA_REF_PREFIX.length)
    } else {
      out[key] = value
    }
  }
  return out
}

function mergeAllOf(parts) {
  const merged = { type: 'object', properties: {}, required: [] }
  const requiredSet = new Set()
  for (const part of parts) {
    if (!part || typeof part !== 'object') continue
    const sub = part.$ref ? part : part
    if (sub.type && sub.type !== 'object') {
      merged.type = sub.type
    }
    if (sub.properties) Object.assign(merged.properties, sub.properties)
    if (Array.isArray(sub.required)) for (const r of sub.required) requiredSet.add(r)
    for (const k of ['format', 'enum', 'const', 'pattern']) {
      if (sub[k] !== undefined) merged[k] = sub[k]
    }
  }
  merged.required = [...requiredSet]
  return merged
}
