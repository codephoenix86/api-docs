/**
 * Synthesize a JSON example from a NormalizedSchema. Used when a content/response has no
 * explicit example. Resolves named refs against the per-API schema dictionary.
 */
export function synthesizeExample(schema, schemas, depth = 0) {
  if (depth > 6) return null
  if (!schema) return null

  switch (schema.kind) {
    case 'ref': {
      const target = schemas[schema.name]
      if (!target) return null
      return synthesizeExample(target, schemas, depth + 1)
    }
    case 'primitive': {
      if (schema.example !== undefined) return schema.example
      if (schema.const !== undefined) return schema.const
      if (Array.isArray(schema.enum) && schema.enum.length) return schema.enum[0]
      if (schema.default !== undefined) return schema.default
      return primitiveSample(schema)
    }
    case 'array':
      return [synthesizeExample(schema.items, schemas, depth + 1)].filter((v) => v !== null)
    case 'object': {
      const out = {}
      for (const p of schema.properties) {
        const v = synthesizeExample(p.schema, schemas, depth + 1)
        if (v !== null) out[p.name] = v
      }
      return out
    }
    case 'union': {
      const first = schema.options[0]
      return synthesizeExample(first, schemas, depth + 1)
    }
    case 'composition':
      return synthesizeExample(schema.merged, schemas, depth + 1)
    default:
      return null
  }
}

function primitiveSample(schema) {
  switch (schema.type) {
    case 'integer':
    case 'number':
      if (schema.minimum !== undefined) return schema.minimum
      return 0
    case 'boolean':
      return true
    case 'null':
      return null
    case 'string':
    default:
      switch (schema.format) {
        case 'uuid':
          return '00000000-0000-0000-0000-000000000000'
        case 'date-time':
          return '2024-01-21T10:30:00.000Z'
        case 'email':
          return 'user@example.com'
        case 'uri':
          return 'https://example.com/'
        case 'binary':
          return '<binary>'
        default:
          return 'string'
      }
  }
}
