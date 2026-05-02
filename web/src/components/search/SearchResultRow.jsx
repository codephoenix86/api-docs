import clsx from 'clsx'
import { ArrowRight, Box, Code2, FileText, Radio, Server } from 'lucide-react'
import { MethodBadge, DirectionBadge } from '@/components/ui/Badge.jsx'

const KIND_META = {
  operation: { Icon: Server, label: 'REST' },
  event: { Icon: Radio, label: 'Event' },
  schema: { Icon: Box, label: 'Schema' },
  guide: { Icon: FileText, label: 'Guide' },
  page: { Icon: Code2, label: 'Page' },
}

export function SearchResultRow({ result, active, onMouseEnter, onClick }) {
  const meta = KIND_META[result.kind] ?? KIND_META.page
  const { Icon } = meta
  return (
    <button
      type="button"
      role="option"
      aria-selected={active}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      className={clsx(
        'w-full text-left flex items-center gap-3 px-3 py-2 rounded-md text-[13px]',
        active ? 'bg-[color:color-mix(in_oklab,var(--color-brand)_12%,transparent)]' : 'hover:bg-[color:color-mix(in_oklab,var(--color-text)_5%,transparent)]',
      )}
    >
      <Icon size={14} className="shrink-0 text-[color:var(--color-text-muted)]" />
      {result.kind === 'operation' && result.method && <MethodBadge method={result.method} />}
      {result.kind === 'event' && <DirectionBadge direction={result.direction} />}
      <div className="min-w-0 flex-1">
        <div className="truncate font-medium">
          {result.kind === 'schema' || result.kind === 'event' ? (
            <code className="font-mono">{result.title}</code>
          ) : (
            result.title
          )}
        </div>
        {result.subtitle && (
          <div className="truncate text-[12px] text-[color:var(--color-text-muted)]">{result.subtitle}</div>
        )}
      </div>
      <ArrowRight size={13} className="shrink-0 text-[color:var(--color-text-muted)]" />
    </button>
  )
}
