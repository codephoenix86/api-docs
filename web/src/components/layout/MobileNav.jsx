import { useEffect } from 'react'
import clsx from 'clsx'
import { X } from 'lucide-react'
import { Sidebar } from './Sidebar.jsx'

export function MobileNav({ open, onClose, api }) {
  useEffect(() => {
    if (!open) return
    const onEsc = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onEsc)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onEsc)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal aria-label="Navigation">
      <button
        type="button"
        onClick={onClose}
        aria-label="Close navigation"
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />
      <div
        className={clsx(
          'absolute left-0 top-0 bottom-0 w-[19rem] max-w-[85vw]',
          'bg-[color:var(--color-bg)] border-r border-[color:var(--color-border)] shadow-xl',
          'flex flex-col',
        )}
      >
        <div className="h-14 flex items-center justify-between px-3 border-b border-[color:var(--color-border)]">
          <span className="font-semibold text-[14px]">Navigate</span>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)]"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 min-h-0">
          <Sidebar api={api} onNavigate={onClose} />
        </div>
      </div>
    </div>
  )
}
