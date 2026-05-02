import { OperationHeader } from './OperationHeader.jsx'
import { ParameterTable } from './ParameterTable.jsx'
import { RequestBodyPanel } from './RequestBodyPanel.jsx'
import { ResponsesPanel } from './ResponsesPanel.jsx'
import { DeprecatedBanner } from './DeprecatedBanner.jsx'
import { TryItPlaceholder } from './TryItPlaceholder.jsx'
import { CodeTabs } from '@/components/codeblock/CodeTabs.jsx'
import { ResponseExample } from '@/components/codeblock/ResponseExample.jsx'
import { MDXContent } from '@/components/markdown/MDXContent.jsx'

/**
 * Two-column layout on lg+: doc on the left, code rail (sticky) on the right.
 * Below lg the rail unsticks and stacks under the doc.
 */
export function OperationLayout({ operation, apiSlug }) {
  if (!operation) return null
  const firstResponse = operation.responses?.[0]
  const exampleResponse = firstResponse?.contents?.[0]?.examples?.[0]

  return (
    <article>
      <OperationHeader
        method={operation.method}
        path={operation.path}
        security={operation.security}
        deprecated={operation.deprecated}
      />

      <div className="mt-5 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] gap-x-10 gap-y-8">
        <div className="min-w-0 space-y-8">
          {operation.deprecated && <DeprecatedBanner />}
          {operation.summary && (
            <h1 className="text-[26px] font-semibold tracking-tight leading-tight">{operation.summary}</h1>
          )}
          {operation.descriptionHtml && <MDXContent html={operation.descriptionHtml} />}
          {operation.parameters?.length > 0 && (
            <ParameterTable parameters={operation.parameters} apiSlug={apiSlug} />
          )}
          {operation.requestBody && (
            <RequestBodyPanel requestBody={operation.requestBody} apiSlug={apiSlug} />
          )}
          {operation.responses?.length > 0 && (
            <ResponsesPanel responses={operation.responses} apiSlug={apiSlug} />
          )}
        </div>

        <aside className="min-w-0 lg:sticky lg:top-32 lg:self-start space-y-4">
          <div>
            <div className="text-[11.5px] uppercase tracking-wider font-semibold text-[color:var(--color-text-muted)] mb-2">
              Request
            </div>
            <CodeTabs samples={operation.samples} />
          </div>

          {exampleResponse?.html && (
            <div>
              <div className="text-[11.5px] uppercase tracking-wider font-semibold text-[color:var(--color-text-muted)] mb-2">
                Example response
              </div>
              <ResponseExample example={exampleResponse} />
            </div>
          )}

          <TryItPlaceholder />
        </aside>
      </div>
    </article>
  )
}
