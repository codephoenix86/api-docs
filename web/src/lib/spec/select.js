/** @typedef {import('./types.js').NormalizedApi} NormalizedApi */
/** @typedef {import('./types.js').NormalizedOperation} NormalizedOperation */
/** @typedef {import('./types.js').NormalizedAsyncOperation} NormalizedAsyncOperation */

/**
 * Group REST operations by tag, preserving the tag order declared in the spec.
 * Operations with an unknown tag bucket into "Other".
 */
export function operationsByTag(api) {
  if (!api?.rest) return []
  const tagOrder = api.rest.tags.map((t) => t.name)
  const tagMeta = new Map(api.rest.tags.map((t) => [t.name, t]))
  const groups = new Map()
  for (const op of api.rest.operations) {
    const tag = op.tag ?? 'Other'
    if (!groups.has(tag)) groups.set(tag, [])
    groups.get(tag).push(op)
  }
  const ordered = []
  for (const tag of tagOrder) {
    if (groups.has(tag)) {
      ordered.push({ tag, meta: tagMeta.get(tag), operations: groups.get(tag) })
      groups.delete(tag)
    }
  }
  for (const [tag, ops] of groups) {
    ordered.push({ tag, meta: { name: tag, descriptionHtml: '' }, operations: ops })
  }
  return ordered
}

export function findOperation(api, operationId) {
  return api?.rest?.operations.find((o) => o.id === operationId)
}

export function findAsyncOperation(api, operationId) {
  return api?.async?.operations.find((o) => o.id === operationId)
}

export function findOperationsByTag(api, tag) {
  return api?.rest?.operations.filter((o) => o.tag === tag) ?? []
}

/**
 * Group async operations by direction.
 * @returns {{pub: NormalizedAsyncOperation[], sub: NormalizedAsyncOperation[]}}
 */
export function channelsByDirection(api) {
  const out = { pub: [], sub: [] }
  if (!api?.async) return out
  for (const op of api.async.operations) {
    if (op.direction === 'pub') out.pub.push(op)
    else if (op.direction === 'sub') out.sub.push(op)
  }
  return out
}

export function getSchema(api, name) {
  return api?.schemas?.[name]
}

/**
 * Find every REST operation and async operation that references a given named schema.
 * Used by SchemaPage's "Used by" section.
 */
export function findSchemaUsages(api, name) {
  const usages = []
  const seen = new Set()

  const visit = (schema, opLabel, opUrl) => {
    if (!schema) return
    switch (schema.kind) {
      case 'ref':
        if (schema.name === name) {
          const key = `${opLabel}|${opUrl}`
          if (!seen.has(key)) {
            seen.add(key)
            usages.push({ label: opLabel, url: opUrl })
          }
        }
        break
      case 'object':
        for (const p of schema.properties) visit(p.schema, opLabel, opUrl)
        break
      case 'array':
        visit(schema.items, opLabel, opUrl)
        break
      case 'union':
        for (const o of schema.options) visit(o, opLabel, opUrl)
        break
      case 'composition':
        for (const p of schema.parts) visit(p, opLabel, opUrl)
        break
      default:
        break
    }
  }

  for (const op of api?.rest?.operations ?? []) {
    const url = `/${api.slug}/rest/${encodeURIComponent(op.tag)}/${op.id}`
    const label = `${op.method.toUpperCase()} ${op.path}`
    for (const p of op.parameters) visit(p.schema, label, url)
    if (op.requestBody) for (const c of op.requestBody.contents) visit(c.schema, label, url)
    for (const r of op.responses) for (const c of r.contents) visit(c.schema, label, url)
  }
  for (const op of api?.async?.operations ?? []) {
    const url = `/${api.slug}/events/${op.id}`
    const label = op.channel
    visit(op.message.payload, label, url)
  }
  return usages
}
