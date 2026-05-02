import { Link, useParams } from 'react-router-dom'
import { useApi } from '@/hooks/useApi.js'
import { getSchema, findSchemaUsages } from '@/lib/spec/select.js'
import { SchemaView } from '@/components/schema/SchemaView.jsx'
import { NotFoundPage } from './NotFoundPage.jsx'

export function SchemaPage() {
  const { name } = useParams()
  const { api, loading } = useApi()
  if (loading) return <div className="text-[color:var(--color-text-muted)]">Loading…</div>
  if (!api) return <NotFoundPage />
  const schema = getSchema(api, name)
  if (!schema) return <NotFoundPage label={`Schema "${name}"`} />
  const usages = findSchemaUsages(api, name)

  return (
    <article className="max-w-3xl space-y-6">
      <header className="space-y-2">
        <div className="text-[11.5px] uppercase tracking-wider font-semibold text-[color:var(--color-text-muted)]">
          Schema
        </div>
        <h1 className="font-mono text-[26px] font-semibold text-[color:var(--color-text)]">{name}</h1>
      </header>

      <SchemaView schema={schema} apiSlug={api.slug} />

      {usages.length > 0 && (
        <section>
          <h2 className="text-[11.5px] uppercase tracking-wider font-semibold text-[color:var(--color-text-muted)] mb-2">
            Used by
          </h2>
          <div className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-bg-elev)]">
            {usages.map((u) => (
              <Link
                key={u.url}
                to={u.url}
                className="block px-3 py-2 border-t border-[color:var(--color-border)] first:border-t-0 hover:bg-[color:color-mix(in_oklab,var(--color-text)_5%,transparent)]"
              >
                <code className="font-mono text-[12.5px]">{u.label}</code>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  )
}

export function SchemaIndexPage() {
  const { api, loading } = useApi()
  if (loading) return <div className="text-[color:var(--color-text-muted)]">Loading…</div>
  if (!api) return <NotFoundPage />
  return (
    <div className="max-w-3xl space-y-6">
      <header>
        <div className="text-[11.5px] uppercase tracking-wider font-semibold text-[color:var(--color-text-muted)]">
          Reference
        </div>
        <h1 className="text-[26px] font-semibold tracking-tight">Schemas</h1>
        <p className="mt-1 text-[14px] text-[color:var(--color-text-muted)]">
          {api.schemaIndex.length} schemas, generated from <code className="font-mono">components/schemas</code>.
        </p>
      </header>
      <div className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-bg-elev)]">
        {api.schemaIndex.map((n) => (
          <Link
            key={n}
            to={`/${api.slug}/schemas/${n}`}
            className="block px-3 py-2 border-t border-[color:var(--color-border)] first:border-t-0 hover:bg-[color:color-mix(in_oklab,var(--color-text)_5%,transparent)]"
          >
            <code className="font-mono text-[13px]">{n}</code>
          </Link>
        ))}
      </div>
    </div>
  )
}
