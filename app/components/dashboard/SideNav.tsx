'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import * as Avatar from '@radix-ui/react-avatar'
import * as Collapsible from '@radix-ui/react-collapsible'
import * as ScrollArea from '@radix-ui/react-scroll-area'
import * as Separator from '@radix-ui/react-separator'
import * as Tooltip from '@radix-ui/react-tooltip'
import {
  Home, ClipboardList, Wrench, CalendarClock,
  BarChart3, Inbox, MapPin, HardDrive,
  Package, FileText, ShoppingCart,
  Gauge, Users, Building2,
  Gem, Wand2, Download, Hammer,
  Bell, ChevronUp,
  LayoutGrid, CircleHelp, MessageCircle, Settings,
  Radio, Router, AlertTriangle, Timer,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface NavItem {
  label: string
  icon: LucideIcon
  href?: string
}

interface NavSection {
  title: string
  badge?: string
  defaultClosed?: boolean
  items: NavItem[]
}

interface SideNavProps {
  collapsed: boolean
}

const sections: NavSection[] = [
  {
    title: 'MAIN',
    items: [
      { label: 'Dashboard', icon: Home, href: '/dashboard' },
      { label: 'Work Orders', icon: ClipboardList },
      { label: 'Preventive Maintenance', icon: CalendarClock },
      { label: 'Analytics', icon: BarChart3 },
      { label: 'Requests', icon: Inbox },
    ],
  },
  {
    title: 'ASSETS',
    items: [
      { label: 'Locations', icon: MapPin },
      { label: 'Assets', icon: HardDrive },
      { label: 'Parts & Inventory', icon: Package },
      { label: 'Purchase Orders', icon: ShoppingCart },
      { label: 'Meters', icon: Gauge },
    ],
  },
  {
    title: 'PEOPLE',
    defaultClosed: true,
    items: [
      { label: 'People & Teams', icon: Users },
      { label: 'Vendors & Customers', icon: Building2 },
    ],
  },
  {
    title: 'RESOURCES',
    defaultClosed: true,
    items: [
      { label: 'Checklists', icon: FileText },
      { label: 'Files', icon: FileText },
      { label: 'Import & Export', icon: Wrench },
    ],
  },
  {
    title: 'EDGE',
    items: [
      { label: 'Sensors', icon: Radio, href: '/edge/sensors' },
      { label: 'Gateways', icon: Router, href: '/edge/gateways' },
      { label: 'Alerts', icon: AlertTriangle, href: '/edge/alerts' },
      { label: 'Runtime', icon: Timer, href: '/edge/runtime' },
      { label: 'Settings', icon: Settings, href: '/edge/settings' },
    ],
  },
  {
    title: 'STUDIO',
    badge: 'NEW',
    items: [
      { label: 'Browse Apps', icon: Gem, href: '/studio' },
      { label: 'Installed Apps', icon: Download },
      { label: 'Apps I Built', icon: Hammer },
      { label: 'Create New App', icon: Wand2 },
    ],
  },
]

const footerIcons = [
  { icon: LayoutGrid, label: 'Apps' },
  { icon: CircleHelp, label: 'Help' },
  { icon: MessageCircle, label: 'Feedback' },
  { icon: Settings, label: 'Settings' },
]

function isActive(pathname: string, href?: string): boolean {
  if (!href) return false
  if (href === '/dashboard') return pathname === '/dashboard' || pathname === '/'
  return pathname.startsWith(href)
}

function CollapsedIcon({ item, active, label }: { item: NavItem; active: boolean; label: string }) {
  const Icon = item.icon
  const inner = (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <span
          className={`flex items-center justify-center w-9 h-9 rounded-[var(--radius-lg)] cursor-pointer transition-colors ${
            active
              ? 'bg-[var(--color-neutral-4)] text-[var(--color-neutral-12)]'
              : 'text-[var(--color-neutral-9)] hover:bg-[var(--color-neutral-4)]'
          }`}
          aria-label={label}
        >
          <Icon size={18} />
        </span>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          side="right"
          sideOffset={8}
          className="px-2.5 py-1 rounded-[var(--radius-md)] bg-[var(--color-neutral-12)] text-white text-[length:var(--font-size-sm)] shadow-[var(--shadow-lg)] z-[var(--z-toast)]"
        >
          {label}
          <Tooltip.Arrow className="fill-[var(--color-neutral-12)]" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  )

  if (item.href) {
    return <Link href={item.href}>{inner}</Link>
  }
  return inner
}

export function SideNav({ collapsed }: SideNavProps) {
  const pathname = usePathname()

  return (
    <Tooltip.Provider delayDuration={300}>
      <aside
        className={`flex flex-col h-screen sticky top-0 border-r border-[var(--border-default)] bg-[#F0F0F3] transition-[width] duration-200 shrink-0 ${
          collapsed ? 'w-16' : 'w-[260px]'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center h-14 shrink-0 border-b border-[var(--border-default)] ${
            collapsed ? 'justify-center px-0' : 'justify-between px-[var(--space-md)]'
          }`}
        >
          {!collapsed && (
            <Link href="/dashboard">
              <Image src="/images/logo-upkeep.svg" alt="UpKeep" width={96} height={24} priority />
            </Link>
          )}
          {collapsed && (
            <Link href="/dashboard" className="flex items-center justify-center w-8 h-8 rounded-[var(--radius-lg)] bg-[var(--color-accent-9)]">
              <span className="text-white text-[length:var(--font-size-sm)] font-bold">U</span>
            </Link>
          )}
          {!collapsed && (
            <div className="flex items-center gap-1.5">
              <button
                className="relative flex items-center justify-center w-8 h-8 rounded-[var(--radius-lg)] hover:bg-[var(--color-neutral-4)] cursor-pointer transition-colors"
                aria-label="Notifications"
              >
                <Bell size={16} className="text-[var(--color-neutral-9)]" />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[var(--color-error)]" />
              </button>
              <Avatar.Root className="w-7 h-7 rounded-full overflow-hidden shrink-0">
                <Avatar.Fallback className="flex items-center justify-center w-full h-full bg-[#e8d5f5] text-[#7C3AED] text-[length:var(--font-size-xs)] font-semibold">
                  AM
                </Avatar.Fallback>
              </Avatar.Root>
            </div>
          )}
        </div>

        {/* Scrollable nav */}
        <ScrollArea.Root className="flex-1 overflow-hidden">
          <ScrollArea.Viewport className="h-full w-full px-[var(--space-xs)]">
            <nav
              className={`flex flex-col gap-2 py-[var(--space-xs)] ${
                collapsed ? 'items-center' : ''
              }`}
            >
              {sections.map((section) =>
                collapsed ? (
                  <div key={section.title} className="flex flex-col items-center gap-1">
                    {section.items.slice(0, 1).map((item) => (
                      <CollapsedIcon
                        key={item.label}
                        item={item}
                        active={isActive(pathname, item.href)}
                        label={item.label}
                      />
                    ))}
                  </div>
                ) : (
                  <Collapsible.Root key={section.title} defaultOpen={!section.defaultClosed}>
                    <Collapsible.Trigger className="flex items-center gap-[var(--space-xs)] w-full px-[var(--space-xs)] pt-[var(--space-xs)] pb-1 h-7 rounded-[var(--radius-sm)] cursor-pointer group">
                      <span className="flex-1 text-left text-[length:var(--font-size-xs)] font-semibold uppercase tracking-[0.04em] text-[color:var(--color-neutral-8)]">
                        {section.title}
                      </span>
                      {section.badge && (
                        <span className="px-1.5 py-0.5 rounded-[var(--radius-sm)] bg-[var(--color-accent-2)] text-[var(--color-accent-9)] text-[length:9px] font-bold uppercase leading-none">
                          {section.badge}
                        </span>
                      )}
                      <ChevronUp
                        size={14}
                        className="text-[color:var(--color-neutral-7)] transition-transform group-data-[state=closed]:rotate-180"
                      />
                    </Collapsible.Trigger>
                    <Collapsible.Content className="overflow-hidden">
                      {section.items.map((item) => {
                        const active = isActive(pathname, item.href)
                        const classes = `flex items-center gap-[var(--space-xs)] w-full px-[var(--space-xs)] h-8 rounded-[var(--radius-md)] cursor-pointer transition-colors ${
                          active
                            ? 'bg-[var(--color-neutral-4)] font-semibold text-[var(--color-neutral-12)]'
                            : 'font-medium text-[var(--color-neutral-9)] hover:bg-[var(--color-neutral-4)]/50'
                        }`

                        const inner = (
                          <>
                            <item.icon size={16} className="shrink-0" />
                            <span className="text-[length:var(--font-size-sm)] leading-5 truncate">
                              {item.label}
                            </span>
                          </>
                        )

                        if (item.href) {
                          return (
                            <Link key={item.label} href={item.href} className={classes}>
                              {inner}
                            </Link>
                          )
                        }

                        return (
                          <button key={item.label} className={classes}>
                            {inner}
                          </button>
                        )
                      })}
                    </Collapsible.Content>
                  </Collapsible.Root>
                )
              )}
            </nav>
          </ScrollArea.Viewport>
          <ScrollArea.Scrollbar
            orientation="vertical"
            className="flex w-1 touch-none select-none p-0.5"
          >
            <ScrollArea.Thumb className="relative flex-1 rounded-full bg-[var(--color-neutral-5)]" />
          </ScrollArea.Scrollbar>
        </ScrollArea.Root>

        <Separator.Root className="h-px bg-[var(--border-default)]" />

        {/* Footer */}
        <div
          className={`flex items-center h-14 shrink-0 ${
            collapsed ? 'justify-center p-3' : 'justify-between px-3 py-3'
          }`}
        >
          {collapsed ? (
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <button
                  className="flex items-center justify-center w-9 h-9 rounded-[var(--radius-lg)] text-[var(--color-neutral-8)] hover:bg-[var(--color-neutral-4)] cursor-pointer transition-colors"
                  aria-label="Settings"
                >
                  <Settings size={18} />
                </button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  side="right"
                  sideOffset={8}
                  className="px-2.5 py-1 rounded-[var(--radius-md)] bg-[var(--color-neutral-12)] text-white text-[length:var(--font-size-sm)] shadow-[var(--shadow-lg)] z-[var(--z-toast)]"
                >
                  Settings
                  <Tooltip.Arrow className="fill-[var(--color-neutral-12)]" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          ) : (
            <div className="flex items-center gap-1">
              {footerIcons.map(({ icon: Icon, label }) => (
                <Tooltip.Root key={label}>
                  <Tooltip.Trigger asChild>
                    <button
                      className="flex items-center justify-center w-8 h-8 rounded-[var(--radius-lg)] text-[var(--color-neutral-8)] hover:bg-[var(--color-neutral-4)] hover:text-[var(--color-neutral-11)] cursor-pointer transition-colors"
                      aria-label={label}
                    >
                      <Icon size={16} />
                    </button>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content
                      side="top"
                      sideOffset={6}
                      className="px-2 py-1 rounded-[var(--radius-md)] bg-[var(--color-neutral-12)] text-white text-[length:var(--font-size-xs)] shadow-[var(--shadow-lg)] z-[var(--z-toast)]"
                    >
                      {label}
                      <Tooltip.Arrow className="fill-[var(--color-neutral-12)]" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              ))}
            </div>
          )}
        </div>
      </aside>
    </Tooltip.Provider>
  )
}
