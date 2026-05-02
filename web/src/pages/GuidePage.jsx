import { Link, useParams } from 'react-router-dom'
import { useApi } from '@/hooks/useApi.js'
import { MDXContent } from '@/components/markdown/MDXContent.jsx'
import { NotFoundPage } from './NotFoundPage.jsx'

export function GuidePage() {
  const { slug: guideSlug } = useParams()
  const { api, loading } = useApi()
  if (loading) return <div className="text-[color:var(--color-text-muted)]">Loading…</div>
  if (!api) return <NotFoundPage />
  const guide = api.guides.find((g) => g.slug === guideSlug)
  if (!guide) return <NotFoundPage label={`Guide "${guideSlug}"`} />

  return (
    <article className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,200px)] gap-x-10 max-w-4xl">
      <div className="min-w-0">
        <MDXContent html={guide.html} />
      </div>
      {guide.tocHtml && (
        <aside className="hidden lg:block">
          <div className="sticky top-32">
            <div className="text-[11.5px] uppercase tracking-wider font-semibold text-[color:var(--color-text-muted)] mb-2">
              On this page
            </div>
            <div className="text-[12.5px]" dangerouslySetInnerHTML={{ __html: guide.tocHtml }} />
          </div>
        </aside>
      )}
    </article>
  )
}

export function GuideIndexPage() {
  const { api, loading } = useApi()
  if (loading) return <div className="text-[color:var(--color-text-muted)]">Loading…</div>
  if (!api) return <NotFoundPage />
  return (
    <div className="max-w-3xl space-y-6">
      <header>
        <div className="text-[11.5px] uppercase tracking-wider font-semibold text-[color:var(--color-text-muted)]">
          Guides
        </div>
        <h1 className="text-[26px] font-semibold tracking-tight">{api.name} guides</h1>
      </header>
      <div className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-bg-elev)]">
        {api.guides.length === 0 ? (
          <div className="p-4 text-[13px] text-[color:var(--color-text-muted)]">No guides yet.</div>
        ) : api.guides.map((g) => (
          <Link
            key={g.slug}
            to={`/${api.slug}/guides/${g.slug}`}
            className="block px-3 py-2 border-t border-[color:var(--color-border)] first:border-t-0 hover:bg-[color:color-mix(in_oklab,var(--color-text)_5%,transparent)]"
          >
            <span className="text-[13.5px]">{g.title}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
