import { Link } from 'react-router-dom'
import { ArrowRight, Radio, Server } from 'lucide-react'
import { useApi } from '@/hooks/useApi.js'
import { MDXContent } from '@/components/markdown/MDXContent.jsx'
import { operationsByTag, channelsByDirection } from '@/lib/spec/select.js'
import { tagUrl, asyncOperationUrl, operationUrl } from '@/lib/url.js'
import { MethodDot, DirectionBadge } from '@/components/ui/Badge.jsx'

export function ApiOverviewPage() {
  const { api, loading } = useApi()
  if (loading) return <div className="text-[color:var(--color-text-muted)]">Loading…</div>
  if (!api) return <div className="text-[color:var(--color-text-muted)]">API not found.</div>

  const restGroups = operationsByTag(api)
  const events = channelsByDirection(api)

  return (
    <div className="space-y-12">
      <header className="space-y-3">
        <div className="flex items-center gap-3">
          <span
            className="inline-flex items-center justify-center size-8 rounded-md text-white text-base font-bold"
            style={{ background: api.brand }}
            aria-hidden
          >
            {api.name.slice(0, 1).toUpperCase()}
          </span>
          <div>
            <h1 className="text-[28px] font-semibold tracking-tight leading-tight">{api.name}</h1>
            {api.version && <div className="text-[12.5px] text-[color:var(--color-text-muted)]">v{api.version}</div>}
          </div>
        </div>
        {api.summary && <p className="text-[15.5px] text-[color:var(--color-text-muted)]">{api.summary}</p>}
        {api.servers?.length > 0 && (
          <div className="flex flex-wrap gap-2 text-[12.5px]">
            {api.servers.map((s) => (
              <code
                key={s.url}
                className="font-mono px-2 py-1 rounded bg-[color:var(--color-bg-elev)] border border-[color:var(--color-border)] text-[color:var(--color-text-muted)]"
                title={s.description}
              >
                {s.url}
              </code>
            ))}
          </div>
        )}
      </header>

      {api.overviewHtml && <MDXContent html={api.overviewHtml} />}
      {api.descriptionHtml && <MDXContent html={api.descriptionHtml} />}

      {restGroups.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Server size={16} className="text-[color:var(--color-text-muted)]" />
            <h2 className="text-[18px] font-semibold tracking-tight">REST API</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {restGroups.map((g) => (
              <Link
                key={g.tag}
                to={tagUrl(api.slug, g.tag)}
                className="group rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-bg-elev)] p-4 hover:border-[color:var(--color-border-strong)]"
              >
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-[14.5px]">{g.tag}</div>
                  <ArrowRight size={14} className="text-[color:var(--color-text-muted)] group-hover:translate-x-0.5 transition-transform" />
                </div>
                {g.meta?.descriptionHtml && (
                  <div
                    className="mt-1.5 text-[12.5px] text-[color:var(--color-text-muted)] prose-doc"
                    dangerouslySetInnerHTML={{ __html: g.meta.descriptionHtml }}
                  />
                )}
                <div className="mt-3 space-y-0.5">
                  {g.operations.slice(0, 4).map((op) => (
                    <Link
                      key={op.id}
                      to={operationUrl(api.slug, op)}
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-2 text-[12.5px] text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)]"
                    >
                      <MethodDot method={op.method} />
                      <span className="font-mono truncate">{op.path}</span>
                    </Link>
                  ))}
                  {g.operations.length > 4 && (
                    <div className="text-[11.5px] text-[color:var(--color-text-muted)] mt-1">
                      + {g.operations.length - 4} more
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {api.hasAsync && (events.pub.length > 0 || events.sub.length > 0) && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Radio size={16} className="text-[color:var(--color-text-muted)]" />
            <h2 className="text-[18px] font-semibold tracking-tight">WebSocket events</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <EventColumn title="Client → Server" direction="pub" ops={events.pub} apiSlug={api.slug} />
            <EventColumn title="Server → Client" direction="sub" ops={events.sub} apiSlug={api.slug} />
          </div>
        </section>
      )}
    </div>
  )
}

function EventColumn({ title, direction, ops, apiSlug }) {
  if (!ops?.length) return null
  return (
    <div className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-bg-elev)] p-4">
      <div className="flex items-center justify-between mb-2.5">
        <div className="font-semibold text-[14.5px]">{title}</div>
        <DirectionBadge direction={direction} />
      </div>
      <div className="space-y-0.5">
        {ops.map((op) => (
          <Link
            key={op.id}
            to={asyncOperationUrl(apiSlug, op)}
            className="block font-mono text-[12.5px] text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)] truncate"
          >
            {op.channel}
          </Link>
        ))}
      </div>
    </div>
  )
}
