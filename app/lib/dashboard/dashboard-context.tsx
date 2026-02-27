'use client'

import { createContext, useContext } from 'react'
import type { Role } from '../models'

interface DashboardContextValue {
  role: Role
  site: string
}

const DashboardContext = createContext<DashboardContextValue | null>(null)

export function DashboardProvider({
  role,
  site,
  children,
}: DashboardContextValue & { children: React.ReactNode }) {
  return (
    <DashboardContext.Provider value={{ role, site }}>
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboardContext(): DashboardContextValue {
  const ctx = useContext(DashboardContext)
  if (!ctx) {
    throw new Error('useDashboardContext must be used within a DashboardProvider')
  }
  return ctx
}
