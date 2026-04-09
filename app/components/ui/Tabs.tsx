'use client'

import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'

/**
 * Underline tabs — same interaction pattern as fleet detail / in-app navigation:
 * bottom accent border on the active tab, neutral text on others.
 */
const underlineTriggerClass =
  'shrink-0 px-[var(--space-md)] py-[var(--space-sm)] text-[length:var(--font-size-sm)] font-medium whitespace-nowrap border-b-2 border-transparent text-[var(--color-neutral-8)] transition-colors duration-[var(--duration-fast)] cursor-pointer outline-none hover:text-[var(--color-neutral-10)] hover:border-[var(--color-neutral-5)] focus-visible:ring-2 focus-visible:ring-[var(--color-accent-7)] focus-visible:ring-offset-2 data-[state=active]:border-[var(--color-accent-9)] data-[state=active]:text-[var(--color-accent-9)]'

export const Tabs = TabsPrimitive.Root

export const TabsList = forwardRef<
  ElementRef<typeof TabsPrimitive.List>,
  ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className = '', ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={`-mb-px flex items-center gap-0 overflow-x-auto ${className}`}
    {...props}
  />
))
TabsList.displayName = 'TabsList'

export const TabsTrigger = forwardRef<
  ElementRef<typeof TabsPrimitive.Trigger>,
  ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className = '', ...props }, ref) => (
  <TabsPrimitive.Trigger ref={ref} className={`${underlineTriggerClass} ${className}`} {...props} />
))
TabsTrigger.displayName = 'TabsTrigger'

export const TabsContent = TabsPrimitive.Content
