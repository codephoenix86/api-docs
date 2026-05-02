import { useMemo } from 'react'
import { SidebarSection, SidebarGroup } from '@/components/nav/SidebarSection.jsx'
import { SidebarLink } from '@/components/nav/SidebarLink.jsx'
import { operationsByTag, channelsByDirection } from '@/lib/spec/select.js'
import { operationUrl, asyncOperationUrl, schemaUrl, guideUrl, apiHomeUrl } from '@/lib/url.js'

export function Sidebar({ api, onNavigate }) {
  if (!api) return <div className="p-4 text-sm text-[color:var(--color-text-muted)]">Loading…</div>

  const restGroups = useMemo(() => operationsByTag(api), [api])
  const events = useMemo(() => channelsByDirection(api), [api])

  return (
    <nav className="h-full overflow-y-auto scrollbar-thin pr-1 pb-12 pt-3 text-[color:var(--color-text)]">
      <SidebarSection title="Get started" defaultOpen>
        <SidebarLink to={apiHomeUrl(api.slug)} label="Overview" end onNavigate={onNavigate} />
        {api.guides.length > 0 && (
          <SidebarGroup title="Guides">
            {api.guides.map((g) => (
              <SidebarLink key={g.slug} to={guideUrl(api.slug, g.slug)} label={g.title} onNavigate={onNavigate} />
            ))}
          </SidebarGroup>
        )}
      </SidebarSection>

      {api.hasRest && (
        <SidebarSection title="REST API" defaultOpen>
          {restGroups.map((group) => (
            <SidebarGroup key={group.tag} title={group.tag}>
              {group.operations.map((op) => (
                <SidebarLink
                  key={op.id}
                  to={operationUrl(api.slug, op)}
                  label={op.summary || op.id}
                  method={op.method}
                  onNavigate={onNavigate}
                />
              ))}
            </SidebarGroup>
          ))}
        </SidebarSection>
      )}

      {api.hasAsync && (
        <SidebarSection title="WebSocket events" defaultOpen>
          {events.pub.length > 0 && (
            <SidebarGroup title="Client → Server">
              {events.pub.map((op) => (
                <SidebarLink
                  key={op.id}
                  to={asyncOperationUrl(api.slug, op)}
                  label={op.channel}
                  direction="pub"
                  mono
                  onNavigate={onNavigate}
                />
              ))}
            </SidebarGroup>
          )}
          {events.sub.length > 0 && (
            <SidebarGroup title="Server → Client">
              {events.sub.map((op) => (
                <SidebarLink
                  key={op.id}
                  to={asyncOperationUrl(api.slug, op)}
                  label={op.channel}
                  direction="sub"
                  mono
                  onNavigate={onNavigate}
                />
              ))}
            </SidebarGroup>
          )}
        </SidebarSection>
      )}

      {api.schemaIndex.length > 0 && (
        <SidebarSection title="Schemas" defaultOpen={false}>
          {api.schemaIndex.map((name) => (
            <SidebarLink key={name} to={schemaUrl(api.slug, name)} label={name} mono onNavigate={onNavigate} />
          ))}
        </SidebarSection>
      )}

      <SidebarSection title="Reference" defaultOpen={false}>
        <SidebarLink to={`/${api.slug}/errors`} label="Errors" onNavigate={onNavigate} />
        <SidebarLink to={`/${api.slug}/changelog`} label="Changelog" onNavigate={onNavigate} />
      </SidebarSection>
    </nav>
  )
}
