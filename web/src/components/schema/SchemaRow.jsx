import { useState } from 'react'
import clsx from 'clsx'
import { ChevronDown } from 'lucide-react'
import { SchemaTypeLabel } from './SchemaTypeLabel.jsx'
import { SchemaConstraints } from './SchemaConstraints.jsx'
import { SchemaView } from './SchemaView.jsx'

/**
 * Single row in an object's property table. Expands to nested SchemaView for object/array/union.
 */
export function SchemaRow({ name, required, schema, description, apiSlug, defaultExpanded = false, depth = 0 }) {
  const expandable = isExpandable(schema)
  const [open, setOpen] = useState(defaultExpanded)

  return (
    <div className={clsx('group', depth > 0 && 'pl-4')}>
      <div className="py-2.5 border-t border-[color:var(--color-border)] first:border-t-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          {expandable ? (
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              className="-ml-1.5 inline-flex items-center gap-1 text-left"
              aria-expanded={open}
            >
              <ChevronDown
                size={12}
                aria-hidden
                className={clsx('text-[color:var(--color-text-muted)] transition-transform', !open && '-rotate-90')}
              />
              <code className="font-mono text-[13px] text-[color:var(--color-text)] font-medium">{name}</code>
            </button>
          ) : (
            <code className="font-mono text-[13px] text-[color:var(--color-text)] font-medium">{name}</code>
          )}
          {required && <span className="text-[10.5px] font-medium uppercase tracking-wide text-rose-600 dark:text-rose-400">required</span>}
          <span className="ml-auto"><SchemaTypeLabel schema={schema} apiSlug={apiSlug} /></span>
        </div>

        {description && (
          <div className="mt-1 text-[13px] text-[color:var(--color-text-muted)] leading-snug">{description}</div>
        )}

        <SchemaConstraints schema={schema} />

        {expandable && open && (
          <div className="mt-2 ml-1.5 pl-3 border-l border-dashed border-[color:var(--color-border-strong)]">
            <SchemaView schema={schema} apiSlug={apiSlug} compact depth={depth + 1} />
          </div>
        )}
      </div>
    </div>
  )
}

function isExpandable(schema) {
  if (!schema) return false
  switch (schema.kind) {
    case 'object': return schema.properties.length > 0
    case 'array': return schema.items.kind === 'object' || schema.items.kind === 'union' || schema.items.kind === 'composition'
    case 'union': return true
    case 'composition': return true
    default: return false
  }
}
