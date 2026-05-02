import { useState } from 'react'
import clsx from 'clsx'
import { Check, Copy } from 'lucide-react'
import { DirectionBadge, Badge } from '@/components/ui/Badge.jsx'
import { copyToClipboard } from '@/lib/clipboard.js'

export function EventHeader({ channel, direction, operationId }) {
  const [copied, setCopied] = useState(false)
  const onCopy = async () => {
    if (await copyToClipboard(channel)) {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }
  }
  return (
    <div
      className={clsx(
        'sticky top-14 z-20 -mx-4 sm:-mx-6 lg:-mx-10 px-4 sm:px-6 lg:px-10 py-3',
        'bg-[color:color-mix(in_oklab,var(--color-bg)_85%,transparent)] backdrop-blur',
        'border-b border-[color:var(--color-border)]',
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <DirectionBadge direction={direction} />
        <button
          type="button"
          onClick={onCopy}
          className="group inline-flex items-center gap-2 max-w-full"
          title="Copy event name"
        >
          <code className="font-mono text-[14px] truncate text-[color:var(--color-text)]">{channel}</code>
          <span className="text-[color:var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity">
            {copied ? <Check size={13} /> : <Copy size={13} />}
          </span>
        </button>
        {operationId && (
          <Badge variant="muted" className="ml-auto" mono>{operationId}</Badge>
        )}
      </div>
    </div>
  )
}
