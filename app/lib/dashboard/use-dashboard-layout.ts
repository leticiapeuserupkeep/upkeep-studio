'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import type { Role } from '../models'
import type { WidgetId, WidgetColumn, WidgetPlacement, DashboardLayout } from './widget-types'
import { WIDGET_REGISTRY } from './widget-registry'
import { getDefaultLayout } from './default-layouts'

const STORAGE_PREFIX = 'upkeep-dashboard-'

function storageKey(role: Role): string {
  return `${STORAGE_PREFIX}${role}`
}

function loadLayout(role: Role): DashboardLayout | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(storageKey(role))
    if (!raw) return null
    const parsed = JSON.parse(raw) as DashboardLayout
    if (!Array.isArray(parsed.widgets)) return null
    return parsed
  } catch {
    return null
  }
}

function saveLayout(role: Role, layout: DashboardLayout): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(storageKey(role), JSON.stringify(layout))
  } catch { /* quota exceeded — silent fail */ }
}

function buildLayout(placements: WidgetPlacement[]): DashboardLayout {
  return { widgets: placements, lastModified: new Date().toISOString() }
}

export interface UseDashboardLayoutReturn {
  placements: WidgetPlacement[]
  reorderColumn: (column: WidgetColumn, orderedIds: WidgetId[]) => void
  toggleWidget: (widgetId: WidgetId) => void
  removeWidget: (widgetId: WidgetId) => void
  addWidget: (widgetId: WidgetId) => void
  resetLayout: () => void
}

export function useDashboardLayout(role: Role): UseDashboardLayoutReturn {
  const [placements, setPlacements] = useState<WidgetPlacement[]>(() => {
    const saved = loadLayout(role)
    return saved?.widgets ?? getDefaultLayout(role)
  })

  const roleRef = useRef(role)

  useEffect(() => {
    if (roleRef.current !== role) {
      roleRef.current = role
      const saved = loadLayout(role)
      setPlacements(saved?.widgets ?? getDefaultLayout(role))
    }
  }, [role])

  const persist = useCallback(
    (next: WidgetPlacement[]) => {
      setPlacements(next)
      saveLayout(roleRef.current, buildLayout(next))
    },
    [],
  )

  const reorderColumn = useCallback(
    (column: WidgetColumn, orderedIds: WidgetId[]) => {
      setPlacements((prev) => {
        const otherColumn = prev.filter((p) => p.column !== column)
        const reordered = orderedIds
          .map((id, idx) => {
            const existing = prev.find((p) => p.widgetId === id)
            if (!existing) return null
            return { ...existing, order: idx, column }
          })
          .filter(Boolean) as WidgetPlacement[]

        const maxOrder = reordered.length
        const renumbered = otherColumn.map((p, i) => ({ ...p, order: maxOrder + i }))
        const next = [...reordered, ...renumbered]
        saveLayout(roleRef.current, buildLayout(next))
        return next
      })
    },
    [],
  )

  const toggleWidget = useCallback(
    (widgetId: WidgetId) => {
      setPlacements((prev) => {
        const next = prev.map((p) =>
          p.widgetId === widgetId ? { ...p, visible: !p.visible } : p,
        )
        saveLayout(roleRef.current, buildLayout(next))
        return next
      })
    },
    [],
  )

  const removeWidget = useCallback(
    (widgetId: WidgetId) => {
      const config = WIDGET_REGISTRY[widgetId]
      if (config && !config.isRemovable) return
      setPlacements((prev) => {
        const next = prev.map((p) =>
          p.widgetId === widgetId ? { ...p, visible: false } : p,
        )
        saveLayout(roleRef.current, buildLayout(next))
        return next
      })
    },
    [],
  )

  const addWidget = useCallback(
    (widgetId: WidgetId) => {
      setPlacements((prev) => {
        const exists = prev.find((p) => p.widgetId === widgetId)
        if (exists) {
          const next = prev.map((p) =>
            p.widgetId === widgetId ? { ...p, visible: true } : p,
          )
          saveLayout(roleRef.current, buildLayout(next))
          return next
        }
        const config = WIDGET_REGISTRY[widgetId]
        if (!config) return prev
        const maxOrder = Math.max(...prev.map((p) => p.order), -1)
        const next: WidgetPlacement[] = [
          ...prev,
          {
            widgetId,
            visible: true,
            order: maxOrder + 1,
            column: config.defaultColumn,
          },
        ]
        saveLayout(roleRef.current, buildLayout(next))
        return next
      })
    },
    [],
  )

  const resetLayout = useCallback(() => {
    const defaults = getDefaultLayout(roleRef.current)
    persist(defaults)
  }, [persist])

  return { placements, reorderColumn, toggleWidget, removeWidget, addWidget, resetLayout }
}
