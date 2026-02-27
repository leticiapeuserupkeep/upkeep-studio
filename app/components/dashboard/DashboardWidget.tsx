'use client'

import { type ReactNode } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, X } from 'lucide-react'
import type { WidgetId } from '@/app/lib/dashboard/widget-types'

interface DashboardWidgetProps {
  widgetId: WidgetId
  title: string
  isDraggable: boolean
  isRemovable: boolean
  onRemove?: (id: WidgetId) => void
  children: ReactNode
}

export function DashboardWidget({
  widgetId,
  title,
  isDraggable,
  isRemovable,
  onRemove,
  children,
}: DashboardWidgetProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widgetId, disabled: !isDraggable })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-widget-id={widgetId}
      data-dragging={isDragging || undefined}
      className={`relative group widget-enter ${isDragging ? 'widget-drag-placeholder z-0' : 'z-[1]'}`}
      {...attributes}
      role="article"
      aria-label={`${title} widget`}
    >
      {isDraggable && (
        <button
          ref={setActivatorNodeRef}
          {...listeners}
          className="widget-drag-handle absolute -left-1 top-4 z-10"
          aria-label={`Drag to reorder ${title}`}
          aria-roledescription="sortable"
        >
          <GripVertical size={14} />
        </button>
      )}

      {isRemovable && onRemove && (
        <button
          onClick={() => onRemove(widgetId)}
          className="absolute top-2 right-2 z-10 flex items-center justify-center w-6 h-6 rounded-[var(--radius-md)] text-[var(--color-neutral-7)] hover:text-[var(--color-error)] hover:bg-[var(--color-error-light)] opacity-0 group-hover:opacity-100 transition-all duration-[var(--duration-fast)] cursor-pointer"
          aria-label={`Remove ${title} from dashboard`}
        >
          <X size={14} />
        </button>
      )}

      {children}
    </div>
  )
}

interface DashboardWidgetOverlayProps {
  children: ReactNode
}

export function DashboardWidgetOverlay({ children }: DashboardWidgetOverlayProps) {
  return (
    <div className="widget-drag-overlay" aria-hidden="true">
      {children}
    </div>
  )
}
