'use client'

import { type ReactNode } from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'

interface TooltipProps {
  children: ReactNode
  content: ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
  sideOffset?: number
  delayDuration?: number
  open?: boolean
  maxWidth?: string
  className?: string
}

export function TooltipProvider({
  children,
  delayDuration = 300,
}: {
  children: ReactNode
  delayDuration?: number
}) {
  return (
    <TooltipPrimitive.Provider delayDuration={delayDuration}>
      {children}
    </TooltipPrimitive.Provider>
  )
}

export function Tooltip({
  children,
  content,
  side = 'top',
  sideOffset = 6,
  delayDuration,
  open,
  maxWidth,
  className = '',
}: TooltipProps) {
  return (
    <TooltipPrimitive.Root delayDuration={delayDuration} open={open}>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          sideOffset={sideOffset}
          className={`px-2.5 py-1.5 rounded-[var(--radius-md)] bg-[var(--color-neutral-12)] text-white text-[length:var(--font-size-sm)] shadow-[var(--shadow-lg)] z-[var(--z-toast)] ${className}`}
          style={maxWidth ? { maxWidth } : undefined}
        >
          {content}
          <TooltipPrimitive.Arrow className="fill-[var(--color-neutral-12)]" />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  )
}
