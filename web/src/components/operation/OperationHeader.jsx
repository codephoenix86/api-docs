import { useState } from 'react'
import clsx from 'clsx'
import { Check, Copy, Lock, Unlock } from 'lucide-react'
import { MethodBadge, Badge } from '@/components/ui/Badge.jsx'
import { copyToClipboard } from '@/lib/clipboard.js'

export function OperationHeader({ method, path, security, deprecated }) {
  const [copied, setCopied] = useState(false)
  const isAuth = security && security.length > 0

  const onCopy = async () => {
    if (await copyToClipboard(`${method.toUpperCase()} ${path}`)) {
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
        <MethodBadge method={method} className="text-[11px] px-2 py-1.5" />
        <button
          type="button"
          onClick={onCopy}
          className="group inline-flex items-center gap-2 max-w-full"
          title="Copy method + path"
        >
          <code className="font-mono text-[14px] truncate text-[color:var(--color-text)]">{path}</code>
          <span className="text-[color:var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity">
            {copied ? <Check size={13} /> : <Copy size={13} />}
          </span>
        </button>

        <span className="ml-auto inline-flex items-center gap-2">
          {deprecated && (
            <Badge variant="warn">deprecated</Badge>
          )}
          {isAuth ? (
            <Badge variant="brand"><Lock size={11} /> Bearer JWT</Badge>
          ) : (
            <Badge variant="success"><Unlock size={11} /> Public</Badge>
          )}
        </span>
      </div>
    </div>
  )
}
