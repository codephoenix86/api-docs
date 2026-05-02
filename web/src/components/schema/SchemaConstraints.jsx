import { EnumChips } from './EnumChips.jsx'

/** A line of small constraint chips (min/max/pattern/format/enum) under a property. */
export function SchemaConstraints({ schema }) {
  if (!schema || schema.kind !== 'primitive') return null
  const chips = []
  if (schema.format) chips.push({ label: 'format', value: schema.format })
  if (schema.minLength !== undefined || schema.maxLength !== undefined) {
    chips.push({ label: 'length', value: lenRange(schema.minLength, schema.maxLength) })
  }
  if (schema.minimum !== undefined || schema.maximum !== undefined) {
    chips.push({ label: 'range', value: lenRange(schema.minimum, schema.maximum) })
  }
  if (schema.pattern) chips.push({ label: 'pattern', value: schema.pattern, mono: true })
  if (schema.default !== undefined) chips.push({ label: 'default', value: String(schema.default), mono: true })

  const hasEnum = Array.isArray(schema.enum) && schema.enum.length > 0
  if (chips.length === 0 && !hasEnum) return null

  return (
    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-[color:var(--color-text-muted)]">
      {chips.map((c, i) => (
        <span key={i} className="inline-flex items-baseline gap-1">
          <span className="opacity-70">{c.label}:</span>
          <code className={c.mono ? 'font-mono break-all' : 'font-mono'}>{c.value}</code>
        </span>
      ))}
      {hasEnum && (
        <span className="inline-flex items-baseline gap-1.5">
          <span className="opacity-70">enum:</span>
          <EnumChips values={schema.enum} />
        </span>
      )}
    </div>
  )
}

function lenRange(min, max) {
  if (min !== undefined && max !== undefined) return `${min}..${max}`
  if (min !== undefined) return `≥ ${min}`
  if (max !== undefined) return `≤ ${max}`
  return ''
}
