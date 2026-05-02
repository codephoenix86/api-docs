import { SchemaTypeLabel } from '@/components/schema/SchemaTypeLabel.jsx'
import { SchemaConstraints } from '@/components/schema/SchemaConstraints.jsx'

const IN_LABEL = { path: 'path', query: 'query', header: 'header', cookie: 'cookie' }

export function ParameterTable({ parameters, apiSlug }) {
  if (!parameters?.length) return null
  // Group by location (path/query/header/cookie) for readability
  const groups = new Map()
  for (const p of parameters) {
    const key = p.in
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(p)
  }
  const order = ['path', 'query', 'header', 'cookie']
  return (
    <div className="space-y-6">
      {order.filter((k) => groups.has(k)).map((key) => (
        <ParamGroup key={key} title={`${IN_LABEL[key]} parameters`} params={groups.get(key)} apiSlug={apiSlug} />
      ))}
    </div>
  )
}

function ParamGroup({ title, params, apiSlug }) {
  return (
    <div>
      <h3 className="text-[11.5px] uppercase tracking-wider font-semibold text-[color:var(--color-text-muted)] mb-2">
        {title}
      </h3>
      <div className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-bg-elev)]">
        {params.map((p) => (
          <div key={`${p.in}-${p.name}`} className="px-4 py-3 border-t border-[color:var(--color-border)] first:border-t-0">
            <div className="flex items-baseline gap-2 flex-wrap">
              <code className="font-mono text-[13px] font-medium text-[color:var(--color-text)]">{p.name}</code>
              {p.required && (
                <span className="text-[10.5px] font-medium uppercase tracking-wide text-rose-600 dark:text-rose-400">required</span>
              )}
              <span className="ml-auto"><SchemaTypeLabel schema={p.schema} apiSlug={apiSlug} /></span>
            </div>
            {p.descriptionHtml && (
              <div
                className="prose-doc text-[13px] mt-1"
                dangerouslySetInnerHTML={{ __html: p.descriptionHtml }}
              />
            )}
            <SchemaConstraints schema={p.schema} />
            {p.example !== undefined && (
              <div className="mt-1.5 text-[11.5px] text-[color:var(--color-text-muted)]">
                Example: <code className="font-mono">{String(p.example)}</code>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
