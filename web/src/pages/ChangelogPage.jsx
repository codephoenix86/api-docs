import { useApi } from '@/hooks/useApi.js'
import { MDXContent } from '@/components/markdown/MDXContent.jsx'
import { NotFoundPage } from './NotFoundPage.jsx'

export function ChangelogPage() {
  const { api, loading } = useApi()
  if (loading) return <div className="text-[color:var(--color-text-muted)]">Loading…</div>
  if (!api) return <NotFoundPage />
  return (
    <div className="max-w-3xl space-y-6">
      <header>
        <div className="text-[11.5px] uppercase tracking-wider font-semibold text-[color:var(--color-text-muted)]">
          Reference
        </div>
        <h1 className="text-[26px] font-semibold tracking-tight">Changelog</h1>
      </header>
      {api.changelogHtml ? (
        <MDXContent html={api.changelogHtml} />
      ) : (
        <p className="text-[14px] text-[color:var(--color-text-muted)]">No changelog yet.</p>
      )}
    </div>
  )
}
