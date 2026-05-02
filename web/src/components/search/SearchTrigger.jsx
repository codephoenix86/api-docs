import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { KBD } from '@/components/ui/KBD.jsx'
import { preloadSearch } from '@/hooks/useSearch.js'

export function SearchTrigger({ onClick }) {
  const [mac, setMac] = useState(false)
  useEffect(() => {
    setMac(typeof navigator !== 'undefined' && /Mac/i.test(navigator.platform))
    preloadSearch()
  }, [])
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Open search"
      className="inline-flex items-center gap-2 h-9 rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-bg-elev)] px-2.5 text-[12.5px] text-[color:var(--color-text-muted)] hover:border-[color:var(--color-border-strong)]"
    >
      <Search size={14} />
      <span className="hidden sm:inline">Search</span>
      <span className="hidden md:inline-flex items-center gap-0.5 ml-2">
        <KBD>{mac ? '⌘' : 'Ctrl'}</KBD><KBD>K</KBD>
      </span>
    </button>
  )
}

export function useGlobalSearchShortcut(open) {
  useEffect(() => {
    const onKey = (e) => {
      const isCmdK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k'
      if (isCmdK) {
        e.preventDefault()
        open()
      } else if (e.key === '/' && !isInputTarget(e.target)) {
        e.preventDefault()
        open()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])
}

function isInputTarget(t) {
  if (!t) return false
  const tag = t.tagName?.toLowerCase()
  return tag === 'input' || tag === 'textarea' || t.isContentEditable
}
