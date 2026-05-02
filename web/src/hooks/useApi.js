import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { loadApi } from '@/lib/spec/load.js'

/**
 * Returns the currently-routed API. While loading returns { api: null, loading: true }.
 * On unknown slug returns { api: null, loading: false, error }.
 */
export function useApi() {
  const { api: slug } = useParams()
  const [state, setState] = useState({ api: null, loading: true, error: null })

  useEffect(() => {
    let cancelled = false
    if (!slug) {
      setState({ api: null, loading: false, error: null })
      return
    }
    setState({ api: null, loading: true, error: null })
    loadApi(slug)
      .then((api) => { if (!cancelled) setState({ api, loading: false, error: null }) })
      .catch((err) => { if (!cancelled) setState({ api: null, loading: false, error: err }) })
    return () => { cancelled = true }
  }, [slug])

  return state
}
