import { useState } from 'react'
import clsx from 'clsx'
import { ChevronDown } from 'lucide-react'

export function SidebarSection({ title, defaultOpen = true, children, sticky = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="px-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={clsx(
          'w-full flex items-center justify-between gap-2 px-1.5 py-1 text-[10.5px] uppercase tracking-wider font-semibold',
          'text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)]',
          sticky && 'sticky top-0 bg-[color:var(--color-bg)] z-10',
        )}
      >
        <span>{title}</span>
        <ChevronDown
          size={13}
          className={clsx('transition-transform shrink-0', !open && '-rotate-90')}
          aria-hidden
        />
      </button>
      {open && <div className="mt-1 space-y-px pb-2">{children}</div>}
    </div>
  )
}

export function SidebarGroup({ title, children }) {
  return (
    <div className="mt-1">
      {title && (
        <div className="px-2 mt-2 mb-0.5 text-[10.5px] font-medium uppercase tracking-wide text-[color:var(--color-text-muted)]/80">
          {title}
        </div>
      )}
      <div className="space-y-px">{children}</div>
    </div>
  )
}
