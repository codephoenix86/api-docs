import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { useSearch } from '@/hooks/useSearch.js'
import { SearchResultRow } from './SearchResultRow.jsx'
import { KBD } from '@/components/ui/KBD.jsx'

export function SearchDialog({ open, onClose }) {
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef(null)
  const navigate = useNavigate()
  const results = useSearch(query)

  useEffect(() => { if (open) requestAnimationFrame(() => inputRef.current?.focus()) }, [open])
  useEffect(() => { setActive(0) }, [query, open])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose() }
      else if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => Math.min(i + 1, results.length - 1)) }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)) }
      else if (e.key === 'Enter') {
        const r = results[active]
        if (r) { onClose(); navigate(r.url) }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, results, active, navigate, onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal aria-label="Search">
      <button
        type="button"
        onClick={onClose}
        aria-label="Close search"
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />
      <div className="absolute inset-x-3 top-[12vh] mx-auto max-w-xl">
        <div className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-elev)] shadow-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-3 border-b border-[color:var(--color-border)]">
            <Search size={15} className="text-[color:var(--color-text-muted)]" />
            <input
              ref={inputRef}
              type="text"
              autoComplete="off"
              spellCheck={false}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search operations, schemas, guides…"
              className="flex-1 h-12 bg-transparent outline-none text-[14px] placeholder:text-[color:var(--color-text-muted)]/70"
            />
            <span className="hidden sm:inline-flex items-center gap-1 text-[10.5px] text-[color:var(--color-text-muted)]">
              <KBD>esc</KBD>
            </span>
          </div>
          <div role="listbox" aria-label="Search results" className="max-h-[60vh] overflow-y-auto scrollbar-thin p-1.5">
            {!query && (
              <div className="p-6 text-center text-[13px] text-[color:var(--color-text-muted)]">
                Start typing to search across operations, events, schemas, and guides.
              </div>
            )}
            {query && results.length === 0 && (
              <div className="p-6 text-center text-[13px] text-[color:var(--color-text-muted)]">
                No matches for <code className="font-mono">{query}</code>.
              </div>
            )}
            {results.map((r, i) => (
              <SearchResultRow
                key={r.id}
                result={r}
                active={i === active}
                onMouseEnter={() => setActive(i)}
                onClick={() => { onClose(); navigate(r.url) }}
              />
            ))}
          </div>
          <div className="flex items-center justify-between gap-2 px-3 py-2 border-t border-[color:var(--color-border)] text-[11px] text-[color:var(--color-text-muted)]">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1"><KBD>↑</KBD><KBD>↓</KBD> navigate</span>
              <span className="inline-flex items-center gap-1"><KBD>↵</KBD> open</span>
            </div>
            <span>{results.length ? `${results.length} result${results.length === 1 ? '' : 's'}` : ''}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
