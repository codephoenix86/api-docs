import { useParams } from 'react-router-dom'
import { useApi } from '@/hooks/useApi.js'
import { findAsyncOperation } from '@/lib/spec/select.js'
import { EventHeader } from '@/components/event/EventHeader.jsx'
import { EventPayloadPanel } from '@/components/event/EventPayloadPanel.jsx'
import { HandshakeNote } from '@/components/event/HandshakeNote.jsx'
import { CodeTabs } from '@/components/codeblock/CodeTabs.jsx'
import { MDXContent } from '@/components/markdown/MDXContent.jsx'
import { NotFoundPage } from './NotFoundPage.jsx'

export function EventPage() {
  const { operationId } = useParams()
  const { api, loading } = useApi()
  if (loading) return <div className="text-[color:var(--color-text-muted)]">Loading…</div>
  if (!api) return <NotFoundPage />
  const op = findAsyncOperation(api, operationId)
  if (!op) return <NotFoundPage label={`Event "${operationId}"`} />

  return (
    <article>
      <EventHeader channel={op.channel} direction={op.direction} operationId={op.id} />

      <div className="mt-5 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] gap-x-10 gap-y-8">
        <div className="min-w-0 space-y-6">
          {op.summary && (
            <h1 className="text-[26px] font-semibold tracking-tight leading-tight">{op.summary}</h1>
          )}
          {op.descriptionHtml && <MDXContent html={op.descriptionHtml} />}
          <EventPayloadPanel message={op.message} apiSlug={api.slug} />
        </div>

        <aside className="min-w-0 lg:sticky lg:top-32 lg:self-start space-y-4">
          <div>
            <div className="text-[11.5px] uppercase tracking-wider font-semibold text-[color:var(--color-text-muted)] mb-2">
              {op.direction === 'pub' ? 'Emit from client' : 'Listen on client'}
            </div>
            <CodeTabs samples={op.samples} ariaLabel="Socket.io samples" />
          </div>
          <HandshakeNote />
        </aside>
      </div>
    </article>
  )
}
