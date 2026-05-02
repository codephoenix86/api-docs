import clsx from 'clsx'
import { SchemaRow } from './SchemaRow.jsx'
import { SchemaTypeLabel } from './SchemaTypeLabel.jsx'
import { SchemaConstraints } from './SchemaConstraints.jsx'
import { DiscriminatorTabs } from './DiscriminatorTabs.jsx'
import { SchemaRefLink } from './SchemaRefLink.jsx'

/**
 * Recursive schema renderer. Routes by `kind` and delegates the property-row layout to SchemaRow.
 *
 * Props:
 *  - schema: NormalizedSchema
 *  - apiSlug: string  (used to build links to /:api/schemas/:name)
 *  - compact: boolean — drop the surrounding border/padding (used inside expanded SchemaRows)
 *  - depth: number    — internal recursion depth for indentation in nested arrays/objects
 */
export function SchemaView({ schema, apiSlug, compact = false, depth = 0 }) {
  if (!schema) return null

  switch (schema.kind) {
    case 'ref':
      return (
        <RefBlock>
          <SchemaRefLink apiSlug={apiSlug} name={schema.name} />
        </RefBlock>
      )

    case 'primitive':
      return (
        <div className={clsx(!compact && 'rounded-lg border border-[color:var(--color-border)] p-3')}>
          <div className="flex items-center gap-2">
            <SchemaTypeLabel schema={schema} apiSlug={apiSlug} />
          </div>
          <SchemaConstraints schema={schema} />
        </div>
      )

    case 'array': {
      const items = schema.items
      // For arrays of refs/objects/unions, render the items inline as a nested block.
      return (
        <div className={clsx(!compact && 'rounded-lg border border-[color:var(--color-border)] p-3')}>
          <div className="text-[11.5px] uppercase tracking-wider text-[color:var(--color-text-muted)] mb-1.5">
            Array of
          </div>
          <div className="rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-bg-elev)] p-3">
            <SchemaView schema={items} apiSlug={apiSlug} compact depth={depth + 1} />
          </div>
        </div>
      )
    }

    case 'object': {
      if (schema.properties.length === 0) {
        return (
          <div className={clsx(!compact && 'rounded-lg border border-[color:var(--color-border)] p-3 text-[12.5px] text-[color:var(--color-text-muted)]')}>
            Empty object.
          </div>
        )
      }
      return (
        <div
          className={clsx(
            !compact && 'rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-bg-elev)] p-2.5',
          )}
        >
          {schema.properties.map((p) => (
            <SchemaRow
              key={p.name}
              name={p.name}
              required={p.required}
              schema={p.schema}
              description={p.description}
              apiSlug={apiSlug}
              depth={depth}
              defaultExpanded={depth === 0 && p.schema.kind === 'object' && (p.schema.properties?.length ?? 0) <= 3}
            />
          ))}
        </div>
      )
    }

    case 'union': {
      if (schema.discriminator) {
        return (
          <div className={clsx(!compact && 'rounded-lg border border-[color:var(--color-border)] p-3')}>
            <DiscriminatorTabs schema={schema} apiSlug={apiSlug} />
          </div>
        )
      }
      return (
        <div className={clsx('space-y-2', !compact && 'rounded-lg border border-[color:var(--color-border)] p-3')}>
          <div className="text-[11.5px] uppercase tracking-wider text-[color:var(--color-text-muted)]">
            {schema.variant === 'anyOf' ? 'Any of' : 'One of'}
          </div>
          <div className="space-y-3">
            {schema.options.map((opt, i) => (
              <div key={i} className="space-y-1">
                {i > 0 && (
                  <div className="my-2 flex items-center gap-2">
                    <div className="h-px flex-1 bg-[color:var(--color-border)]" />
                    <span className="text-[10.5px] uppercase tracking-wider text-[color:var(--color-text-muted)]">or</span>
                    <div className="h-px flex-1 bg-[color:var(--color-border)]" />
                  </div>
                )}
                <SchemaView schema={opt} apiSlug={apiSlug} compact depth={depth + 1} />
              </div>
            ))}
          </div>
        </div>
      )
    }

    case 'composition': {
      // allOf: render the merged object inline, but also surface "extends X" for each named ref.
      const refs = (schema.parts ?? []).filter((p) => p.kind === 'ref')
      return (
        <div className={clsx(!compact && 'rounded-lg border border-[color:var(--color-border)] p-3')}>
          {refs.length > 0 && (
            <div className="mb-2 flex flex-wrap items-center gap-1.5 text-[11.5px] text-[color:var(--color-text-muted)]">
              <span>Extends</span>
              {refs.map((r, i) => (
                <span key={r.name} className="inline-flex items-center gap-1">
                  <SchemaRefLink apiSlug={apiSlug} name={r.name} />
                  {i < refs.length - 1 && <span>+</span>}
                </span>
              ))}
              <span>plus:</span>
            </div>
          )}
          <SchemaView schema={schema.merged} apiSlug={apiSlug} compact depth={depth + 1} />
        </div>
      )
    }

    default:
      return null
  }
}

function RefBlock({ children }) {
  return (
    <div className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-bg-elev)] px-3 py-2 text-[13px]">
      <span className="text-[color:var(--color-text-muted)] mr-1.5">Schema:</span>
      {children}
    </div>
  )
}
