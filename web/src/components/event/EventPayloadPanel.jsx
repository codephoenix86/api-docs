import { SchemaView } from '@/components/schema/SchemaView.jsx'
import { ResponseExample } from '@/components/codeblock/ResponseExample.jsx'

export function EventPayloadPanel({ message, apiSlug }) {
  if (!message) return null
  return (
    <section className="space-y-4">
      <h2 className="text-[11.5px] uppercase tracking-wider font-semibold text-[color:var(--color-text-muted)]">
        Payload
      </h2>
      <SchemaView schema={message.payload} apiSlug={apiSlug} />
      {message.examples?.[0]?.html && (
        <div>
          <div className="text-[11.5px] uppercase tracking-wider font-semibold text-[color:var(--color-text-muted)] mb-1">
            Example payload
          </div>
          <ResponseExample example={message.examples[0]} />
        </div>
      )}
    </section>
  )
}
