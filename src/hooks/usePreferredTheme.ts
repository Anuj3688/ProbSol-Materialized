import { useEffect } from 'react'
import type { ThemeMode } from '../types'

export function usePreferredTheme(themeMode: ThemeMode) {
  useEffect(() => {
    const root = document.documentElement

    if (themeMode === 'system') {
      root.removeAttribute('data-theme')
      return
    }

    root.dataset.theme = themeMode
  }, [themeMode])
}
