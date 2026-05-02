import clsx from 'clsx'

export function KBD({ children, className }) {
  return (
    <kbd
      className={clsx(
        'inline-flex items-center justify-center min-w-[1.4em] h-[1.4em] px-1 rounded',
        'border border-[color:var(--color-border)] bg-[color:var(--color-bg-elev)]',
        'text-[10.5px] font-medium text-[color:var(--color-text-muted)]',
        'shadow-[0_1px_0_color-mix(in_oklab,var(--color-text)_8%,transparent)]',
        className,
      )}
    >
      {children}
    </kbd>
  )
}
