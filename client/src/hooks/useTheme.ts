'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

/**
 * Custom hook to manage theme in the application
 * @returns {object} Theme state and methods
 */
export function useThemeMode() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme, resolvedTheme, themes, systemTheme } = useTheme()

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  return {
    // Current theme ('light', 'dark', or 'system')
    theme,
    // Change theme
    setTheme,
    // Resolved theme considering system preference
    resolvedTheme,
    // All available themes
    themes,
    // System theme preference
    systemTheme,
    // Whether component is mounted (safe to render theme-aware content)
    mounted,
    // Is dark mode active
    isDark: resolvedTheme === 'dark',
    // Is light mode active
    isLight: resolvedTheme === 'light',
    // Toggle between light and dark
    toggleTheme: () => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark'),
  }
}

/**
 * Hook to safely access theme in client components
 * Handles hydration mismatch prevention automatically
 */
export function useSafeTheme() {
  const themeMode = useThemeMode()

  // Return a safe default while mounting
  if (!themeMode.mounted) {
    return {
      ...themeMode,
      isDark: false,
      isLight: true,
    }
  }

  return themeMode
}
