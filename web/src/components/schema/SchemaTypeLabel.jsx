import { SchemaRefLink } from './SchemaRefLink.jsx'

/**
 * Compact, link-aware "what type is this?" label, shown next to a property name.
 *   - { kind: 'ref' } → linked schema name
 *   - primitive → "string", "string · uuid", "integer · 1..100"
 *   - array → "Foo[]" (recurses on items)
 *   - object → "object"
 *   - union → "oneOf"
 *   - composition → "allOf" (or the merged ref name if there's exactly one ref)
 */
export function SchemaTypeLabel({ schema, apiSlug }) {
  if (!schema) return <span className="text-[color:var(--color-text-muted)]">unknown</span>
  switch (schema.kind) {
    case 'ref':
      return <SchemaRefLink apiSlug={apiSlug} name={schema.name} />
    case 'primitive': {
      let type = schema.type ?? 'string'
      const parts = [type]
      if (schema.format) parts.push(schema.format)
      if (schema.const !== undefined) parts.push(`= ${formatLit(schema.const)}`)
      return <span className="font-mono text-[12.5px] text-[color:var(--color-text-muted)]">{parts.join(' · ')}</span>
    }
    case 'array':
      return (
        <span className="font-mono text-[12.5px] text-[color:var(--color-text-muted)]">
          <SchemaTypeLabel schema={schema.items} apiSlug={apiSlug} />[]
        </span>
      )
    case 'object':
      return <span className="font-mono text-[12.5px] text-[color:var(--color-text-muted)]">object</span>
    case 'union':
      return (
        <span className="font-mono text-[12.5px] text-[color:var(--color-text-muted)]">
          {schema.variant ?? 'oneOf'}
        </span>
      )
    case 'composition': {
      // If allOf merges exactly one ref + extras, show that ref to be helpful.
      const refs = (schema.parts ?? []).filter((p) => p.kind === 'ref')
      if (refs.length === 1) {
        return (
          <span className="font-mono text-[12.5px] text-[color:var(--color-text-muted)]">
            <SchemaRefLink apiSlug={apiSlug} name={refs[0].name} /> + …
          </span>
        )
      }
      return <span className="font-mono text-[12.5px] text-[color:var(--color-text-muted)]">allOf</span>
    }
    default:
      return <span className="text-[color:var(--color-text-muted)]">unknown</span>
  }
}

function formatLit(v) {
  if (typeof v === 'string') return JSON.stringify(v)
  return String(v)
}
