import { Link } from 'react-router-dom'
import { useApi } from '@/hooks/useApi.js'
import { MDXContent } from '@/components/markdown/MDXContent.jsx'
import { findOperation } from '@/lib/spec/select.js'
import { operationUrl } from '@/lib/url.js'
import { NotFoundPage } from './NotFoundPage.jsx'

export function ErrorsPage() {
  const { api, loading } = useApi()
  if (loading) return <div className="text-[color:var(--color-text-muted)]">Loading…</div>
  if (!api) return <NotFoundPage />
  return (
    <div className="max-w-4xl space-y-8">
      <header>
        <div className="text-[11.5px] uppercase tracking-wider font-semibold text-[color:var(--color-text-muted)]">
          Reference
        </div>
        <h1 className="text-[26px] font-semibold tracking-tight">Errors</h1>
      </header>
      {api.errorsHtml && <MDXContent html={api.errorsHtml} />}
      {api.errors.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-bg-elev)]">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-[11.5px] uppercase tracking-wider text-[color:var(--color-text-muted)]">
                <th className="py-2 px-3">Code</th>
                <th className="py-2 px-3">Message</th>
                <th className="py-2 px-3">Used by</th>
              </tr>
            </thead>
            <tbody>
              {api.errors.map((e) => (
                <tr key={e.code} className="border-t border-[color:var(--color-border)]">
                  <td className="py-2 px-3 align-top">
                    <code className="font-mono text-[12.5px] font-medium text-[color:var(--color-text)]">{e.code}</code>
                  </td>
                  <td className="py-2 px-3 align-top text-[color:var(--color-text-muted)]">
                    {e.messages.join(' · ')}
                  </td>
                  <td className="py-2 px-3 align-top">
                    <div className="flex flex-wrap gap-1.5">
                      {e.sourceOps.map((id) => {
                        const op = findOperation(api, id)
                        if (!op) return <code key={id} className="font-mono text-[11.5px] text-[color:var(--color-text-muted)]">{id}</code>
                        return (
                          <Link
                            key={id}
                            to={operationUrl(api.slug, op)}
                            className="font-mono text-[11.5px] text-[color:var(--color-brand)] hover:underline"
                          >
                            {id}
                          </Link>
                        )
                      })}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
