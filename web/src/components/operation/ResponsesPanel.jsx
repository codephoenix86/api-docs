import { Tabs } from '@/components/ui/Tabs.jsx'
import { Badge } from '@/components/ui/Badge.jsx'
import { SchemaView } from '@/components/schema/SchemaView.jsx'
import { ResponseExample } from '@/components/codeblock/ResponseExample.jsx'
import { MDXContent } from '@/components/markdown/MDXContent.jsx'

export function ResponsesPanel({ responses, apiSlug }) {
  if (!responses?.length) return null

  const tabs = responses.map((r) => ({
    id: r.status,
    label: (
      <span className="inline-flex items-center gap-1.5">
        <Badge variant={statusVariant(r.status)}>{r.status}</Badge>
      </span>
    ),
    content: (
      <div className="pt-3 space-y-4">
        {r.descriptionHtml && <MDXContent html={r.descriptionHtml} className="text-[14px]" />}
        {r.headers?.length > 0 && <ResponseHeaders headers={r.headers} apiSlug={apiSlug} />}
        {r.contents.length === 0 ? (
          <div className="text-[13px] text-[color:var(--color-text-muted)]">No response body.</div>
        ) : r.contents.map((c) => (
          <div key={c.mediaType} className="space-y-3">
            {r.contents.length > 1 && (
              <div className="text-[11.5px] uppercase tracking-wider text-[color:var(--color-text-muted)]">
                {c.mediaType}
              </div>
            )}
            <SchemaView schema={c.schema} apiSlug={apiSlug} />
            {c.examples?.[0]?.html && (
              <div>
                <div className="text-[11.5px] uppercase tracking-wider text-[color:var(--color-text-muted)] mb-1">
                  Example response
                </div>
                <ResponseExample example={c.examples[0]} />
              </div>
            )}
          </div>
        ))}
      </div>
    ),
  }))

  return (
    <section>
      <h2 className="text-[11.5px] uppercase tracking-wider font-semibold text-[color:var(--color-text-muted)] mb-2">
        Responses
      </h2>
      <Tabs tabs={tabs} ariaLabel="Response status codes" />
    </section>
  )
}

function ResponseHeaders({ headers, apiSlug }) {
  return (
    <div>
      <div className="text-[11.5px] uppercase tracking-wider text-[color:var(--color-text-muted)] mb-1">
        Response headers
      </div>
      <div className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-bg-elev)]">
        {headers.map((h) => (
          <div key={h.name} className="px-3 py-2 border-t border-[color:var(--color-border)] first:border-t-0">
            <code className="font-mono text-[12.5px] font-medium">{h.name}</code>
            {h.description && (
              <div className="text-[12.5px] text-[color:var(--color-text-muted)] mt-0.5">{h.description}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function statusVariant(status) {
  const n = parseInt(status, 10)
  if (n >= 200 && n < 300) return 'success'
  if (n >= 300 && n < 400) return 'brand'
  if (n >= 400 && n < 500) return 'warn'
  if (n >= 500) return 'delete'
  return 'muted'
}
