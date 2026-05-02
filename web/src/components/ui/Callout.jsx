import clsx from 'clsx'
import { Info, AlertTriangle, Lightbulb } from 'lucide-react'

const VARIANTS = {
  info: {
    cls: 'border-[color:color-mix(in_oklab,var(--color-brand)_30%,var(--color-border))] bg-[color:color-mix(in_oklab,var(--color-brand)_6%,transparent)]',
    Icon: Info,
    accent: 'var(--color-brand)',
  },
  warn: {
    cls: 'border-amber-500/40 bg-amber-50 dark:bg-amber-400/5',
    Icon: AlertTriangle,
    accent: '#f59e0b',
  },
  tip: {
    cls: 'border-[color:color-mix(in_oklab,var(--color-accent)_30%,var(--color-border))] bg-[color:color-mix(in_oklab,var(--color-accent)_5%,transparent)]',
    Icon: Lightbulb,
    accent: 'var(--color-accent)',
  },
}

export function Callout({ variant = 'info', title, children, className }) {
  const v = VARIANTS[variant] ?? VARIANTS.info
  const { Icon } = v
  return (
    <div className={clsx('flex gap-3 rounded-lg border px-4 py-3 text-sm', v.cls, className)}>
      <Icon size={16} className="shrink-0 mt-0.5" style={{ color: v.accent }} aria-hidden />
      <div className="min-w-0 flex-1">
        {title && <div className="font-semibold mb-0.5">{title}</div>}
        <div className="text-[color:var(--color-text-muted)]">{children}</div>
      </div>
    </div>
  )
}
