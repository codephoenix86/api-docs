import { Link, useParams } from 'react-router-dom'
import { useApi } from '@/hooks/useApi.js'
import { findOperationsByTag, operationsByTag } from '@/lib/spec/select.js'
import { operationUrl } from '@/lib/url.js'
import { MethodBadge } from '@/components/ui/Badge.jsx'
import { NotFoundPage } from './NotFoundPage.jsx'

export function TagPage() {
  const { tag } = useParams()
  const decodedTag = decodeURIComponent(tag ?? '')
  const { api, loading } = useApi()
  if (loading) return <div className="text-[color:var(--color-text-muted)]">Loading…</div>
  if (!api) return <NotFoundPage />
  const ops = findOperationsByTag(api, decodedTag)
  if (ops.length === 0) return <NotFoundPage label={`Tag "${decodedTag}"`} />
  const meta = operationsByTag(api).find((g) => g.tag === decodedTag)?.meta

  return (
    <div className="max-w-3xl space-y-6">
      <header>
        <div className="text-[11.5px] uppercase tracking-wider font-semibold text-[color:var(--color-text-muted)]">
          REST · {decodedTag}
        </div>
        <h1 className="text-[26px] font-semibold tracking-tight">{decodedTag}</h1>
        {meta?.descriptionHtml && (
          <div className="prose-doc mt-2" dangerouslySetInnerHTML={{ __html: meta.descriptionHtml }} />
        )}
      </header>
      <div className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-bg-elev)]">
        {ops.map((op) => (
          <Link
            key={op.id}
            to={operationUrl(api.slug, op)}
            className="flex items-center gap-3 px-4 py-3 border-t border-[color:var(--color-border)] first:border-t-0 hover:bg-[color:color-mix(in_oklab,var(--color-text)_5%,transparent)]"
          >
            <MethodBadge method={op.method} />
            <code className="font-mono text-[13px] truncate">{op.path}</code>
            <span className="ml-auto text-[12.5px] text-[color:var(--color-text-muted)] truncate">{op.summary}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
