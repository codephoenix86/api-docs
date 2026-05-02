import { useEffect, useState } from 'react'
import { Tabs } from '@/components/ui/Tabs.jsx'
import { CodeBlock } from './CodeBlock.jsx'

const STORAGE_KEY = 'docs.lang'

const LANG_LABELS = {
  curl: 'cURL',
  'js-fetch': 'JS · fetch',
  'js-axios': 'JS · axios',
  python: 'Python',
}

const ORDER = ['curl', 'js-fetch', 'js-axios', 'python']

function readStored() {
  try { return localStorage.getItem(STORAGE_KEY) ?? 'curl' }
  catch { return 'curl' }
}

/** `samples` is { 'curl': {raw, html}, 'js-fetch': {...}, ... } */
export function CodeTabs({ samples, ariaLabel = 'Request samples' }) {
  const [activeKey, setActiveKey] = useState(readStored)
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, activeKey) } catch {}
  }, [activeKey])

  const present = ORDER.filter((k) => samples?.[k])
  if (!present.length) return null
  const initialIndex = Math.max(0, present.indexOf(activeKey))

  const tabs = present.map((k) => ({
    id: k,
    label: LANG_LABELS[k] ?? k,
    content: (
      <CodeBlock
        raw={samples[k].raw}
        html={samples[k].html}
        className="rounded-t-none border-t-0"
      />
    ),
  }))

  return (
    <Tabs
      ariaLabel={ariaLabel}
      tabs={tabs}
      defaultIndex={initialIndex}
      onChange={(i) => setActiveKey(present[i])}
    />
  )
}
