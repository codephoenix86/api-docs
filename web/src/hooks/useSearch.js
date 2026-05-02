import { useEffect, useMemo, useState } from 'react'
import MiniSearch from 'minisearch'

let cachedIndex = null
let cachedDocs = null

async function loadCorpus() {
  if (cachedIndex) return { index: cachedIndex, docs: cachedDocs }
  const mod = await import('@/generated/search.json')
  const docs = mod.default ?? mod
  const index = new MiniSearch({
    fields: ['title', 'subtitle', 'body', 'tag', 'method', 'path', 'operationId'],
    storeFields: ['api', 'kind', 'title', 'subtitle', 'url', 'method', 'tag', 'path', 'direction'],
    searchOptions: {
      boost: { title: 4, subtitle: 2, operationId: 3, path: 2 },
      prefix: true,
      fuzzy: 0.2,
    },
  })
  index.addAll(docs)
  cachedIndex = index
  cachedDocs = docs
  return { index, docs }
}

export function useSearch(query) {
  const [ready, setReady] = useState(Boolean(cachedIndex))
  useEffect(() => {
    if (cachedIndex) { setReady(true); return }
    let cancelled = false
    loadCorpus().then(() => { if (!cancelled) setReady(true) })
    return () => { cancelled = true }
  }, [])

  return useMemo(() => {
    if (!ready || !cachedIndex) return []
    const q = query?.trim()
    if (!q) return []
    return cachedIndex.search(q).slice(0, 25)
  }, [ready, query])
}

export function preloadSearch() {
  loadCorpus().catch(() => {})
}
