import { useId, useState } from 'react'
import clsx from 'clsx'

export function Tabs({ tabs, defaultIndex = 0, value, onChange, ariaLabel, className, panelClassName }) {
  const [internal, setInternal] = useState(defaultIndex)
  const idBase = useId()
  const isControlled = value !== undefined
  const active = isControlled ? value : internal
  const select = (i) => {
    if (!isControlled) setInternal(i)
    onChange?.(i)
  }
  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); select((active + 1) % tabs.length) }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); select((active - 1 + tabs.length) % tabs.length) }
    else if (e.key === 'Home') { e.preventDefault(); select(0) }
    else if (e.key === 'End') { e.preventDefault(); select(tabs.length - 1) }
  }
  return (
    <div className={className}>
      <div
        role="tablist"
        aria-label={ariaLabel}
        onKeyDown={onKeyDown}
        className="flex items-center gap-1 border-b border-[color:var(--color-border)] overflow-x-auto scrollbar-thin"
      >
        {tabs.map((tab, i) => {
          const selected = i === active
          return (
            <button
              key={tab.id ?? i}
              type="button"
              role="tab"
              id={`${idBase}-tab-${i}`}
              aria-selected={selected}
              aria-controls={`${idBase}-panel-${i}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => select(i)}
              className={clsx(
                'shrink-0 -mb-px px-3 py-2 text-[13px] font-medium border-b-2 transition-colors',
                selected
                  ? 'border-[color:var(--color-brand)] text-[color:var(--color-text)]'
                  : 'border-transparent text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)]',
              )}
            >
              {tab.label}
              {tab.badge != null && (
                <span className="ml-1.5 text-[10.5px] tabular-nums opacity-70">{tab.badge}</span>
              )}
            </button>
          )
        })}
      </div>
      <div
        role="tabpanel"
        id={`${idBase}-panel-${active}`}
        aria-labelledby={`${idBase}-tab-${active}`}
        className={panelClassName}
      >
        {tabs[active]?.content}
      </div>
    </div>
  )
}
