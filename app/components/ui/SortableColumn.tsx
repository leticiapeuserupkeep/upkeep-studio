'use client'

import { type ReactNode, useState, useCallback } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'

interface DashboardItem {
  id: string
  content: ReactNode
}

interface SortableColumnProps {
  items: DashboardItem[]
  onReorder: (ids: string[]) => void
  className?: string
}

export function SortableColumn({ items, onReorder, className = '' }: SortableColumnProps) {
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id))
  }, [])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveId(null)
      const { active, over } = event
      if (over && active.id !== over.id) {
        const oldIndex = items.findIndex((i) => i.id === active.id)
        const newIndex = items.findIndex((i) => i.id === over.id)
        const newItems = arrayMove(items, oldIndex, newIndex)
        onReorder(newItems.map((i) => i.id))
      }
    },
    [items, onReorder]
  )

  const activeItem = activeId ? items.find((i) => i.id === activeId) : null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <div className={`flex flex-col gap-[var(--space-lg)] ${className}`}>
          {items.map((item) => (
            <SortableCard key={item.id} id={item.id} isOverlay={false}>
              {item.content}
            </SortableCard>
          ))}
        </div>
      </SortableContext>

      <DragOverlay dropAnimation={{ duration: 200, easing: 'ease' }}>
        {activeItem ? (
          <div className="opacity-90 shadow-[var(--shadow-xl)] rounded-[var(--radius-xl)] rotate-[1deg] scale-[1.02]">
            {activeItem.content}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

function SortableCard({ id, children, isOverlay }: { id: string; children: ReactNode; isOverlay: boolean }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group ${isDragging ? 'opacity-40 z-0' : 'z-[1]'}`}
      {...attributes}
    >
      {!isOverlay && (
        <button
          ref={setActivatorNodeRef}
          {...listeners}
          className="absolute -left-1 top-4 z-10 flex items-center justify-center w-6 h-8 rounded-[var(--radius-md)] bg-[var(--surface-primary)] border border-[var(--border-default)] shadow-[var(--shadow-sm)] opacity-0 group-hover:opacity-100 transition-opacity duration-[var(--duration-fast)] cursor-grab active:cursor-grabbing"
          aria-label={`Drag to reorder ${id}`}
        >
          <GripVertical size={14} className="text-[var(--color-neutral-7)]" />
        </button>
      )}
      {children}
    </div>
  )
}
