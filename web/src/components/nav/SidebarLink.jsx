import { NavLink } from 'react-router-dom'
import clsx from 'clsx'
import { MethodDot } from '@/components/ui/Badge.jsx'
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react'

export function SidebarLink({ to, label, method, direction, mono, end = false, onNavigate }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      className={({ isActive }) => clsx(
        'group relative flex items-center gap-2 rounded-md px-2 py-1 text-[13px] leading-tight',
        'text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)]',
        'hover:bg-[color:color-mix(in_oklab,var(--color-text)_5%,transparent)]',
        isActive && 'text-[color:var(--color-text)] bg-[color:color-mix(in_oklab,var(--color-brand)_10%,transparent)] font-medium',
        mono && 'font-mono text-[12px]',
      )}
    >
      {({ isActive }) => (
        <>
          <span
            className={clsx(
              'absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full transition-opacity',
              isActive ? 'opacity-100' : 'opacity-0',
            )}
            style={{ background: 'var(--color-brand)' }}
            aria-hidden
          />
          {method && <MethodDot method={method} />}
          {direction === 'pub' && <ArrowUpRight size={12} className="shrink-0" style={{ color: 'var(--color-event-pub)' }} />}
          {direction === 'sub' && <ArrowDownLeft size={12} className="shrink-0" style={{ color: 'var(--color-event-sub)' }} />}
          <span className="truncate">{label}</span>
        </>
      )}
    </NavLink>
  )
}
