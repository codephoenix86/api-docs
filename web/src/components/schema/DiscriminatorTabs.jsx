import { Tabs } from '@/components/ui/Tabs.jsx'
import { SchemaView } from './SchemaView.jsx'

/**
 * Renders a oneOf with a discriminator. One tab per discriminator mapping value (or per option's
 * inferred label if no mapping is supplied).
 */
export function DiscriminatorTabs({ schema, apiSlug }) {
  const { discriminator, options } = schema
  const mapping = discriminator?.mapping ?? null

  const tabs = options.map((opt, i) => {
    const label =
      // If there's a mapping, find the entry whose value matches this option's referenced name.
      (mapping && opt.kind === 'ref' && Object.entries(mapping).find(([, v]) => v === opt.name)?.[0]) ??
      (opt.kind === 'ref' ? opt.name : `variant ${i + 1}`)
    return {
      id: String(label),
      label,
      content: (
        <div className="pt-3">
          <SchemaView schema={opt} apiSlug={apiSlug} />
        </div>
      ),
    }
  })

  return (
    <div>
      <div className="text-[11.5px] text-[color:var(--color-text-muted)] mb-2">
        Discriminated by{' '}
        <code className="font-mono text-[12px] text-[color:var(--color-text)]">{discriminator.propertyName}</code>
      </div>
      <Tabs tabs={tabs} ariaLabel="Schema variants" />
    </div>
  )
}
