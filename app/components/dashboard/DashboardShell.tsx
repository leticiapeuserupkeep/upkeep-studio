'use client'

import { type ReactNode, useMemo, useState, useCallback } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { LayoutGrid } from 'lucide-react'
import type { Role } from '@/app/lib/models'
import type { WidgetId, WidgetPlacement, WidgetColumn } from '@/app/lib/dashboard/widget-types'
import { WIDGET_REGISTRY } from '@/app/lib/dashboard/widget-registry'
import { DashboardWidget, DashboardWidgetOverlay } from './DashboardWidget'

interface DashboardShellProps {
  role: Role
  topStrip?: ReactNode
  widgetContent: Partial<Record<WidgetId, ReactNode>>
  placements: WidgetPlacement[]
  onReorderColumn: (column: WidgetColumn, orderedIds: WidgetId[]) => void
  onRemoveWidget: (widgetId: WidgetId) => void
}

function ColumnEmpty() {
  return (
    <div className="widget-empty" role="status">
      <LayoutGrid size={24} className="text-[var(--widget-empty-icon-color)]" />
      <p className="text-[length:var(--font-size-sm)] font-medium">
        No widgets here
      </p>
      <p className="text-[length:var(--font-size-xs)]">
        Use Manage Widgets to add content to this column.
      </p>
    </div>
  )
}

export function DashboardShell({
  role,
  topStrip,
  widgetContent,
  placements,
  onReorderColumn,
  onRemoveWidget,
}: DashboardShellProps) {
  const [activeId, setActiveId] = useState<WidgetId | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const activePlacements = useMemo(() => {
    return placements
      .filter((p) => {
        const config = WIDGET_REGISTRY[p.widgetId]
        if (!config) return false
        if (!config.roles.includes(role)) return false
        return p.visible
      })
      .sort((a, b) => a.order - b.order)
  }, [role, placements])

  const leftWidgets = useMemo(
    () => activePlacements.filter((p) => p.column === 'left' && p.widgetId !== 'kpi-strip'),
    [activePlacements],
  )
  const rightWidgets = useMemo(
    () => activePlacements.filter((p) => p.column === 'right'),
    [activePlacements],
  )

  const leftIds = useMemo(() => leftWidgets.map((p) => p.widgetId), [leftWidgets])
  const rightIds = useMemo(() => rightWidgets.map((p) => p.widgetId), [rightWidgets])

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id) as WidgetId)
  }, [])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveId(null)
      const { active, over } = event
      if (!over || active.id === over.id) return

      const activeIdStr = String(active.id) as WidgetId
      const overIdStr = String(over.id) as WidgetId

      const inLeft = leftIds.includes(activeIdStr)
      const inRight = rightIds.includes(activeIdStr)

      if (inLeft && leftIds.includes(overIdStr)) {
        const oldIndex = leftIds.indexOf(activeIdStr)
        const newIndex = leftIds.indexOf(overIdStr)
        onReorderColumn('left', arrayMove(leftIds, oldIndex, newIndex))
      } else if (inRight && rightIds.includes(overIdStr)) {
        const oldIndex = rightIds.indexOf(activeIdStr)
        const newIndex = rightIds.indexOf(overIdStr)
        onReorderColumn('right', arrayMove(rightIds, oldIndex, newIndex))
      }
    },
    [leftIds, rightIds, onReorderColumn],
  )

  const activeContent = activeId ? widgetContent[activeId] : null

  return (
    <main
      className="flex-1 px-[var(--dashboard-padding-x)] py-[var(--dashboard-padding-y)]"
      aria-label="Dashboard Command Center"
    >
      {topStrip && (
        <div className="mb-[var(--dashboard-grid-gap)]">{topStrip}</div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-12 gap-[var(--dashboard-grid-gap)]">
          <section className="col-span-8" aria-label="Primary widgets">
            <SortableContext items={leftIds} strategy={verticalListSortingStrategy}>
              <div className="flex flex-col gap-[var(--widget-gap)]">
                {leftWidgets.length === 0 && <ColumnEmpty />}
                {leftWidgets.map((p) => {
                  const content = widgetContent[p.widgetId]
                  if (!content) return null
                  const config = WIDGET_REGISTRY[p.widgetId]
                  return (
                    <DashboardWidget
                      key={p.widgetId}
                      widgetId={p.widgetId}
                      title={config?.title ?? p.widgetId}
                      isDraggable={config?.isDraggable ?? false}
                      isRemovable={config?.isRemovable ?? false}
                      onRemove={onRemoveWidget}
                    >
                      {content}
                    </DashboardWidget>
                  )
                })}
              </div>
            </SortableContext>
          </section>

          <section className="col-span-4" aria-label="Secondary widgets">
            <SortableContext items={rightIds} strategy={verticalListSortingStrategy}>
              <div className="flex flex-col gap-[var(--widget-gap)]">
                {rightWidgets.length === 0 && <ColumnEmpty />}
                {rightWidgets.map((p) => {
                  const content = widgetContent[p.widgetId]
                  if (!content) return null
                  const config = WIDGET_REGISTRY[p.widgetId]
                  return (
                    <DashboardWidget
                      key={p.widgetId}
                      widgetId={p.widgetId}
                      title={config?.title ?? p.widgetId}
                      isDraggable={config?.isDraggable ?? false}
                      isRemovable={config?.isRemovable ?? false}
                      onRemove={onRemoveWidget}
                    >
                      {content}
                    </DashboardWidget>
                  )
                })}
              </div>
            </SortableContext>
          </section>
        </div>

        <DragOverlay dropAnimation={{ duration: 200, easing: 'ease' }}>
          {activeContent ? (
            <DashboardWidgetOverlay>{activeContent}</DashboardWidgetOverlay>
          ) : null}
        </DragOverlay>
      </DndContext>
    </main>
  )
}
