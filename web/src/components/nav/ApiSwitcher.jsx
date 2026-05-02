import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import clsx from 'clsx'
import { Check, ChevronsUpDown } from 'lucide-react'
import { getRegistry } from '@/lib/spec/load.js'

export function ApiSwitcher({ currentSlug }) {
  const registry = getRegistry()
  if (registry.length <= 1) {
    const cur = registry.find((r) => r.slug === currentSlug)
    if (!cur) return null
    return (
      <span className="font-semibold text-[14px] text-[color:var(--color-text)]">{cur.name}</span>
    )
  }

  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const cur = registry.find((r) => r.slug === currentSlug) ?? registry[0]

  useEffect(() => {
    const onClick = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    const onEsc = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onEsc)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onEsc)
    }
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={clsx(
          'inline-flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] font-medium',
          'border border-[color:var(--color-border)] bg-[color:var(--color-bg-elev)] hover:border-[color:var(--color-border-strong)]',
        )}
      >
        <span className="size-2 rounded-full" style={{ background: cur.brand }} aria-hidden />
        <span>{cur.name}</span>
        <ChevronsUpDown size={13} className="opacity-60" />
      </button>
      {open && (
        <div
          role="listbox"
          className={clsx(
            'absolute left-0 top-full mt-1 min-w-[14rem] z-30',
            'rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-bg-elev)] shadow-lg p-1',
          )}
        >
          {registry.map((r) => {
            const selected = r.slug === currentSlug
            return (
              <Link
                key={r.slug}
                to={`/${r.slug}`}
                onClick={() => setOpen(false)}
                role="option"
                aria-selected={selected}
                className={clsx(
                  'flex items-center gap-2 px-2 py-1.5 rounded-md text-[13px]',
                  'hover:bg-[color:color-mix(in_oklab,var(--color-text)_6%,transparent)]',
                )}
              >
                <span className="size-2 rounded-full" style={{ background: r.brand }} aria-hidden />
                <span className="flex-1 truncate">{r.name}</span>
                {selected && <Check size={13} className="opacity-70" />}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
