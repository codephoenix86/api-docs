import { useState } from 'react'
import clsx from 'clsx'
import { Check, Copy } from 'lucide-react'
import { copyToClipboard } from '@/lib/clipboard.js'

/**
 * Renders pre-highlighted Shiki HTML with a copy-to-clipboard button.
 * `html` is fully sanitized at build time.
 */
export function CodeBlock({ raw, html, lang, className, dense = false }) {
  const [copied, setCopied] = useState(false)
  const onCopy = async () => {
    if (await copyToClipboard(raw ?? '')) {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }
  }
  return (
    <div
      className={clsx(
        'group relative rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-bg-elev)] overflow-hidden',
        className,
      )}
    >
      {lang && (
        <div className="absolute top-2 left-3 text-[10.5px] font-mono uppercase tracking-wider text-[color:var(--color-text-muted)] pointer-events-none">
          {lang}
        </div>
      )}
      <button
        type="button"
        onClick={onCopy}
        aria-label="Copy code"
        className={clsx(
          'absolute top-1.5 right-1.5 inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium',
          'border border-[color:var(--color-border)] bg-[color:var(--color-bg)] text-[color:var(--color-text-muted)]',
          'opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity',
        )}
      >
        {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
      </button>
      <div
        className={clsx(
          'overflow-x-auto scrollbar-thin',
          dense ? 'text-[12.5px]' : 'text-[13px]',
          lang && 'pt-6',
        )}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}
