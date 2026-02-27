'use client'

import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import * as Switch from '@radix-ui/react-switch'
import { Settings2, X, RotateCcw, LayoutGrid, Lock } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardBody } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Button'
import { Badge } from '@/app/components/ui/Badge'
import type { Role } from '@/app/lib/models'
import type { WidgetId, WidgetPlacement } from '@/app/lib/dashboard/widget-types'
import { getWidgetsForRole, WIDGET_REGISTRY } from '@/app/lib/dashboard/widget-registry'

interface ManageWidgetsProps {
  role: Role
  placements: WidgetPlacement[]
  onToggleWidget: (widgetId: WidgetId) => void
  onResetLayout: () => void
}

export function ManageWidgets({
  role,
  placements,
  onToggleWidget,
  onResetLayout,
}: ManageWidgetsProps) {
  const [open, setOpen] = useState(false)
  const availableWidgets = getWidgetsForRole(role)
  const visibleCount = placements.filter((p) => {
    const config = WIDGET_REGISTRY[p.widgetId]
    return p.visible && config?.roles.includes(role)
  }).length
  const totalForRole = availableWidgets.length

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Manage Widgets</CardTitle>
          <CardDescription>Customize your dashboard layout</CardDescription>
        </CardHeader>
        <CardBody>
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-[var(--radius-lg)] bg-[var(--color-accent-1)]">
              <LayoutGrid size={20} className="text-[var(--color-accent-9)]" />
            </div>
            <div>
              <p className="text-[length:var(--font-size-sm)] font-semibold text-[var(--color-neutral-11)]">
                {visibleCount} of {totalForRole} widgets active
              </p>
              <p className="text-[length:var(--font-size-xs)] text-[var(--color-neutral-8)]">
                Role: {role.charAt(0).toUpperCase() + role.slice(1)}
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            size="md"
            className="w-full"
            onClick={() => setOpen(true)}
          >
            <Settings2 size={14} /> Manage Widgets
          </Button>
        </CardBody>
      </Card>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-[var(--surface-overlay)] z-[var(--z-overlay)] fade-in" />
          <Dialog.Content
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md max-h-[85vh] rounded-[var(--radius-xl)] bg-[var(--surface-primary)] border border-[var(--border-default)] shadow-[var(--shadow-xl)] z-[var(--z-modal)] flex flex-col fade-in"
          >
            <div className="flex items-center justify-between px-[var(--space-lg)] py-[var(--space-md)] border-b border-[var(--border-subtle)]">
              <div>
                <Dialog.Title className="text-[length:var(--font-size-md)] font-semibold text-[var(--color-neutral-12)]">
                  Manage Widgets
                </Dialog.Title>
                <Dialog.Description className="text-[length:var(--font-size-sm)] text-[var(--color-neutral-8)]">
                  Toggle widgets on or off for your dashboard.
                </Dialog.Description>
              </div>
              <Dialog.Close asChild>
                <button
                  className="flex items-center justify-center w-8 h-8 rounded-[var(--radius-md)] text-[var(--color-neutral-8)] hover:bg-[var(--color-neutral-3)] hover:text-[var(--color-neutral-11)] transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </Dialog.Close>
            </div>

            <div className="flex-1 overflow-y-auto px-[var(--space-lg)] py-[var(--space-md)]">
              <div className="flex flex-col gap-1">
                {availableWidgets
                  .filter((w) => w.id !== 'manage-widgets')
                  .map((widget) => {
                    const placement = placements.find((p) => p.widgetId === widget.id)
                    const isVisible = placement?.visible ?? false
                    const isPinned = !widget.isRemovable

                    return (
                      <div
                        key={widget.id}
                        className="flex items-center gap-3 py-2.5 px-2 rounded-[var(--radius-lg)] hover:bg-[var(--color-neutral-2)] transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[length:var(--font-size-sm)] font-medium text-[var(--color-neutral-11)]">
                              {widget.title}
                            </span>
                            {isPinned && (
                              <Badge severity="neutral">
                                <Lock size={10} /> Pinned
                              </Badge>
                            )}
                          </div>
                          {widget.description && (
                            <p className="text-[length:var(--font-size-xs)] text-[var(--color-neutral-8)] mt-0.5 truncate">
                              {widget.description}
                            </p>
                          )}
                        </div>

                        <Switch.Root
                          checked={isVisible}
                          onCheckedChange={() => {
                            if (!isPinned) onToggleWidget(widget.id)
                          }}
                          disabled={isPinned}
                          className="relative w-9 h-5 rounded-full bg-[var(--color-neutral-5)] data-[state=checked]:bg-[var(--color-accent-9)] transition-colors duration-[var(--duration-fast)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
                          aria-label={`Toggle ${widget.title}`}
                        >
                          <Switch.Thumb className="block w-4 h-4 rounded-full bg-white shadow-[var(--shadow-sm)] translate-x-0.5 data-[state=checked]:translate-x-[18px] transition-transform duration-[var(--duration-fast)]" />
                        </Switch.Root>
                      </div>
                    )
                  })}
              </div>
            </div>

            <div className="flex items-center justify-between px-[var(--space-lg)] py-[var(--space-md)] border-t border-[var(--border-subtle)]">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onResetLayout()
                  setOpen(false)
                }}
              >
                <RotateCcw size={14} /> Reset to Default
              </Button>
              <Dialog.Close asChild>
                <Button variant="primary" size="sm">
                  Done
                </Button>
              </Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}
