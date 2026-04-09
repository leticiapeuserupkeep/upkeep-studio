'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'

type SuperNovaStagingNavContextValue = {
  sidebarCollapsed: boolean
  toggleSidebar: () => void
}

const SuperNovaStagingNavContext = createContext<SuperNovaStagingNavContextValue | null>(null)

export function SuperNovaStagingNavProvider({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((c) => !c)
  }, [])

  const value = useMemo(
    () => ({ sidebarCollapsed, toggleSidebar }),
    [sidebarCollapsed, toggleSidebar],
  )

  return (
    <SuperNovaStagingNavContext.Provider value={value}>{children}</SuperNovaStagingNavContext.Provider>
  )
}

export function useSuperNovaStagingNav(): SuperNovaStagingNavContextValue {
  const ctx = useContext(SuperNovaStagingNavContext)
  if (!ctx) {
    return { sidebarCollapsed: false, toggleSidebar: () => {} }
  }
  return ctx
}
