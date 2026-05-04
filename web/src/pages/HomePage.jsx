import { Link } from 'react-router-dom'
import { ArrowRight, Github, Radio, Server } from 'lucide-react'
import { getRegistry } from '@/lib/spec/load.js'

export function HomePage() {
  const registry = getRegistry()
  return (
    <div className="space-y-16">
      <section className="pt-8 pb-4">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 text-[11.5px] uppercase tracking-wider font-semibold text-[color:var(--color-brand)]">
            <span className="size-1.5 rounded-full" style={{ background: 'var(--color-brand)' }} aria-hidden />
            API Documentation
          </div>
          <h1 className="mt-3 text-[44px] sm:text-[52px] font-semibold tracking-tight leading-[1.05]">
            Beautiful, browsable docs for every API I ship.
          </h1>
          <p className="mt-5 text-[17px] text-[color:var(--color-text-muted)] leading-relaxed">
            Open the API you're working with. Each one carries its REST surface, its WebSocket
            channels, every schema, and copy-pasteable code samples — all generated from the spec
            on every commit.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href="#apis"
              className="inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-[14px] font-medium text-white"
              style={{ background: 'var(--color-brand)' }}
            >
              Browse APIs <ArrowRight size={14} />
            </a>
            <a
              href="https://github.com/codephoenix86/api-docs"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-[color:var(--color-border)] px-4 py-2.5 text-[14px] font-medium text-[color:var(--color-text)] hover:border-[color:var(--color-border-strong)]"
            >
              <Github size={14} /> View on GitHub
            </a>
          </div>
        </div>
      </section>

      <section id="apis" className="scroll-mt-20">
        <h2 className="text-[11.5px] uppercase tracking-wider font-semibold text-[color:var(--color-text-muted)] mb-3">
          APIs
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {registry.map((r) => (
            <ApiCard key={r.slug} entry={r} />
          ))}
        </div>
      </section>
    </div>
  )
}

function ApiCard({ entry }) {
  return (
    <Link
      to={`/${entry.slug}`}
      className="group rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-elev)] p-5 transition-colors hover:border-[color:var(--color-border-strong)]"
    >
      <div className="flex items-center gap-3">
        <span
          className="inline-flex items-center justify-center size-8 rounded-md text-white text-sm font-bold"
          style={{ background: entry.brand }}
          aria-hidden
        >
          {entry.name.slice(0, 1).toUpperCase()}
        </span>
        <div className="min-w-0">
          <div className="text-[15px] font-semibold truncate">{entry.name}</div>
          {entry.version && <div className="text-[11.5px] text-[color:var(--color-text-muted)]">v{entry.version}</div>}
        </div>
        <ArrowRight size={16} className="ml-auto text-[color:var(--color-text-muted)] group-hover:translate-x-0.5 transition-transform" />
      </div>
      {entry.tagline && <p className="mt-3 text-[13.5px] text-[color:var(--color-text-muted)]">{entry.tagline}</p>}
      <div className="mt-4 flex flex-wrap items-center gap-3 text-[12.5px] text-[color:var(--color-text-muted)]">
        {entry.hasRest && (
          <span className="inline-flex items-center gap-1.5"><Server size={13} /> {entry.restCount} REST</span>
        )}
        {entry.hasAsync && (
          <span className="inline-flex items-center gap-1.5"><Radio size={13} /> {entry.asyncCount} events</span>
        )}
        <span>{entry.schemaCount} schemas</span>
      </div>
    </Link>
  )
}
