import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'theme'

function readStored() {
  try { return localStorage.getItem(STORAGE_KEY) ?? 'system' }
  catch { return 'system' }
}

function applyTheme(mode) {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const dark = mode === 'dark' || (mode === 'system' && prefersDark)
  document.documentElement.classList.toggle('dark', dark)
}

export function useTheme() {
  const [theme, setThemeState] = useState(readStored)

  useEffect(() => {
    applyTheme(theme)
    try { localStorage.setItem(STORAGE_KEY, theme) } catch {}
  }, [theme])

  useEffect(() => {
    if (theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => applyTheme('system')
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [theme])

  const setTheme = useCallback((next) => setThemeState(next), [])
  const cycleTheme = useCallback(() => {
    setThemeState((cur) => (cur === 'light' ? 'dark' : cur === 'dark' ? 'system' : 'light'))
  }, [])

  return { theme, setTheme, cycleTheme }
}
