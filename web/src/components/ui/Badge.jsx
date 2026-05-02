import clsx from 'clsx'

const VARIANT_CLASSES = {
  get: 'text-[color:var(--color-method-get)] bg-[color:color-mix(in_oklab,var(--color-method-get)_14%,transparent)] ring-[color:color-mix(in_oklab,var(--color-method-get)_30%,transparent)]',
  post: 'text-[color:var(--color-method-post)] bg-[color:color-mix(in_oklab,var(--color-method-post)_14%,transparent)] ring-[color:color-mix(in_oklab,var(--color-method-post)_30%,transparent)]',
  put: 'text-[color:var(--color-method-put)] bg-[color:color-mix(in_oklab,var(--color-method-put)_14%,transparent)] ring-[color:color-mix(in_oklab,var(--color-method-put)_30%,transparent)]',
  patch: 'text-[color:var(--color-method-patch)] bg-[color:color-mix(in_oklab,var(--color-method-patch)_14%,transparent)] ring-[color:color-mix(in_oklab,var(--color-method-patch)_30%,transparent)]',
  delete: 'text-[color:var(--color-method-delete)] bg-[color:color-mix(in_oklab,var(--color-method-delete)_14%,transparent)] ring-[color:color-mix(in_oklab,var(--color-method-delete)_30%,transparent)]',
  pub: 'text-[color:var(--color-event-pub)] bg-[color:color-mix(in_oklab,var(--color-event-pub)_14%,transparent)] ring-[color:color-mix(in_oklab,var(--color-event-pub)_30%,transparent)]',
  sub: 'text-[color:var(--color-event-sub)] bg-[color:color-mix(in_oklab,var(--color-event-sub)_14%,transparent)] ring-[color:color-mix(in_oklab,var(--color-event-sub)_30%,transparent)]',
  brand: 'text-[color:var(--color-brand)] bg-[color:color-mix(in_oklab,var(--color-brand)_12%,transparent)] ring-[color:color-mix(in_oklab,var(--color-brand)_25%,transparent)]',
  muted: 'text-[color:var(--color-text-muted)] bg-[color:color-mix(in_oklab,var(--color-text)_8%,transparent)] ring-[color:var(--color-border)]',
  warn: 'text-amber-700 dark:text-amber-300 bg-amber-100/60 dark:bg-amber-400/10 ring-amber-500/30',
  success: 'text-[color:var(--color-accent)] bg-[color:color-mix(in_oklab,var(--color-accent)_14%,transparent)] ring-[color:color-mix(in_oklab,var(--color-accent)_30%,transparent)]',
}

export function Badge({ children, variant = 'muted', className, mono = false, size = 'sm' }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-md ring-1 font-medium uppercase tracking-wide leading-none',
        size === 'sm' ? 'text-[10.5px] px-1.5 py-1' : 'text-xs px-2 py-1.5',
        mono && 'font-mono normal-case tracking-normal',
        VARIANT_CLASSES[variant] ?? VARIANT_CLASSES.muted,
        className,
      )}
    >
      {children}
    </span>
  )
}

export function MethodBadge({ method, className }) {
  const variant = method?.toLowerCase()
  return (
    <Badge variant={VARIANT_CLASSES[variant] ? variant : 'muted'} className={className}>
      {method?.toUpperCase()}
    </Badge>
  )
}

export function MethodDot({ method, className }) {
  return (
    <span
      className={clsx('inline-block size-2 rounded-full shrink-0', className)}
      style={{ background: `var(--color-method-${(method ?? 'get').toLowerCase()})` }}
      aria-hidden
    />
  )
}

export function DirectionBadge({ direction, className }) {
  if (direction === 'pub') {
    return <Badge variant="pub" className={className}>Client → Server</Badge>
  }
  if (direction === 'sub') {
    return <Badge variant="sub" className={className}>Server → Client</Badge>
  }
  return null
}
