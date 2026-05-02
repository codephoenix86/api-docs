import { Tabs } from '@/components/ui/Tabs.jsx'
import { SchemaView } from '@/components/schema/SchemaView.jsx'
import { CodeBlock } from '@/components/codeblock/CodeBlock.jsx'

export function RequestBodyPanel({ requestBody, apiSlug }) {
  if (!requestBody) return null
  const tabs = requestBody.contents.map((c, i) => ({
    id: c.mediaType,
    label: c.mediaType,
    content: (
      <div className="pt-3 space-y-4">
        <SchemaView schema={c.schema} apiSlug={apiSlug} />
        {c.examples?.length > 0 && <Examples examples={c.examples} />}
      </div>
    ),
  }))
  return (
    <section>
      <h2 className="text-[11.5px] uppercase tracking-wider font-semibold text-[color:var(--color-text-muted)] mb-2">
        Request body {requestBody.required && <span className="text-rose-600 dark:text-rose-400">· required</span>}
      </h2>
      {tabs.length > 1 ? (
        <Tabs tabs={tabs} ariaLabel="Request body media type" />
      ) : (
        <div>{tabs[0]?.content}</div>
      )}
    </section>
  )
}

function Examples({ examples }) {
  // Render all examples; usually just one or two.
  return (
    <div className="space-y-2">
      <div className="text-[11.5px] uppercase tracking-wider font-semibold text-[color:var(--color-text-muted)]">
        Example{examples.length > 1 ? 's' : ''}
      </div>
      {examples.map((ex) => {
        const json = JSON.stringify(ex.value, null, 2)
        return (
          <div key={ex.name}>
            {(ex.summary || ex.name !== 'default') && (
              <div className="text-[12.5px] text-[color:var(--color-text-muted)] mb-1">
                {ex.summary || ex.name}
              </div>
            )}
            <CodeBlock raw={json} html={`<pre class="shiki"><code>${escapeHtml(json)}</code></pre>`} lang="json" />
          </div>
        )
      })}
    </div>
  )
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
}
