import { useCallback, useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'rounders-theme'

function systemPrefersDark() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function getStored(): Theme | null {
  const v = localStorage.getItem(STORAGE_KEY)
  return v === 'light' || v === 'dark' ? v : null
}

// The index.html inline script already applies a stored choice before
// React mounts, so there's no flash on load. This hook keeps React's own
// state in sync with that, and tracks the system preference live for
// anyone who hasn't made an explicit choice yet.
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => getStored() ?? (systemPrefersDark() ? 'dark' : 'light'))

  useEffect(() => {
    if (getStored()) return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => setTheme(mq.matches ? 'dark' : 'light')
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark'
      document.documentElement.setAttribute('data-theme', next)
      localStorage.setItem(STORAGE_KEY, next)
      return next
    })
  }, [])

  return { theme, toggle }
}
