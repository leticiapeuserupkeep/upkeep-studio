'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import * as Avatar from '@radix-ui/react-avatar'
import {
  Zap,
  LayoutDashboard,
  Bot,
  Database,
  ScrollText,
  Terminal,
  Settings,
  ChevronLeft,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button } from '@/app/components/ui/Button'
import { Tooltip, TooltipProvider } from '@/app/components/ui'
import { SuperNovaStagingNavProvider, useSuperNovaStagingNav } from './supernova-staging-nav-context'
import { SuperNovaStagingOrb } from './SuperNovaStagingOrb'

const stagingNav: { label: string; href: string; icon: LucideIcon }[] = [
  { label: 'Dashboard', href: '/supernova/staging/dashboard', icon: LayoutDashboard },
  { label: 'Agents', href: '/supernova/staging/agents', icon: Bot },
  { label: 'Data', href: '/supernova/staging/data', icon: Database },
  { label: 'Workflows', href: '/supernova/staging', icon: Zap },
  { label: 'Audit Log', href: '/supernova/staging/audit', icon: ScrollText },
  { label: 'Terminal', href: '/supernova/staging/terminal', icon: Terminal },
  { label: 'Settings', href: '/supernova/staging/settings', icon: Settings },
]

function navIsActive(pathname: string, href: string) {
  if (href === '/supernova/staging') {
    return pathname === '/supernova/staging' || pathname === '/supernova/staging/'
  }
  return pathname === href || pathname.startsWith(`${href}/`)
}

function StagingNavLink({
  item,
  pathname,
  collapsed,
}: {
  item: (typeof stagingNav)[number]
  pathname: string
  collapsed: boolean
}) {
  const Icon = item.icon
  const active = navIsActive(pathname, item.href)
  const classes = `flex items-center gap-2 w-full rounded-[var(--radius-sm)] transition-colors duration-[var(--duration-fast)] ease-[var(--ease-default)] ${
    collapsed ? 'justify-center px-0 h-9 w-9 mx-auto' : 'px-2 h-8'
  } ${
    active
      ? 'bg-[var(--color-neutral-5)] font-semibold text-[var(--color-neutral-12)] cursor-pointer'
      : 'font-medium text-[var(--color-neutral-12)] hover:bg-[var(--color-neutral-4)] cursor-pointer'
  }`

  const link = (
    <Link href={item.href} className={classes} aria-current={active ? 'page' : undefined}>
      <Icon size={16} className="shrink-0" aria-hidden />
      {!collapsed && (
        <span className="flex-1 text-left text-[length:var(--font-size-base)] leading-5 truncate">
          {item.label}
        </span>
      )}
    </Link>
  )

  if (!collapsed) return link

  return (
    <Tooltip content={item.label} side="right" sideOffset={8}>
      {link}
    </Tooltip>
  )
}

function SuperNovaStagingShellInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { sidebarCollapsed } = useSuperNovaStagingNav()

  return (
    <div className="flex h-screen min-h-0 w-full overflow-hidden bg-[var(--surface-canvas)]">
      <aside
        className={`sticky top-0 flex h-full min-h-0 shrink-0 flex-col border-r border-[var(--border-default)] bg-[var(--surface-sidebar)] transition-[width] duration-[var(--duration-slow)] ease-[var(--ease-default)] ${
          sidebarCollapsed ? 'w-16' : 'w-[260px]'
        }`}
      >
        <div
          className={`flex items-center h-[var(--supernova-staging-header-height)] shrink-0 border-b border-[var(--border-default)] ${
            sidebarCollapsed ? 'justify-center px-0' : 'gap-2 px-4'
          }`}
        >
          <SuperNovaStagingOrb />
          {!sidebarCollapsed && (
            <div className="min-w-0 flex flex-col">
              <span className="text-[length:var(--font-size-sm)] font-semibold text-[var(--color-neutral-12)] leading-tight truncate">
                SuperNova
              </span>
              <span className="text-[11px] font-medium text-[var(--color-neutral-8)] leading-tight truncate">
                Executive View
              </span>
            </div>
          )}
        </div>

        <nav
          className={`flex-1 overflow-y-auto py-3 flex flex-col gap-0.5 ${sidebarCollapsed ? 'px-1 items-center' : 'px-2'}`}
          aria-label="SuperNova staging"
        >
          {stagingNav.map((item) => (
            <StagingNavLink key={item.href} item={item} pathname={pathname} collapsed={sidebarCollapsed} />
          ))}
        </nav>

        <div
          className={`shrink-0 border-t border-[var(--border-default)] flex flex-col gap-3 ${sidebarCollapsed ? 'p-2 items-center' : 'p-3'}`}
        >
          {!sidebarCollapsed ? (
            <>
              <div className="flex items-center gap-3 rounded-[var(--radius-lg)] px-2 py-2">
                <Avatar.Root className="w-9 h-9 rounded-full overflow-hidden shrink-0 ring-1 ring-[var(--border-default)]">
                  <Avatar.Fallback className="flex items-center justify-center w-full h-full bg-[var(--color-neutral-4)] text-[length:var(--font-size-sm)] font-semibold text-[var(--color-neutral-12)]">
                    LP
                  </Avatar.Fallback>
                </Avatar.Root>
                <div className="min-w-0 flex-1">
                  <p className="text-[length:var(--font-size-sm)] font-semibold text-[var(--color-neutral-12)] truncate">
                    Leti Peuser
                  </p>
                  <p className="text-[length:var(--font-size-xs)] text-[var(--color-neutral-8)]">Administrator</p>
                </div>
              </div>
              <Button variant="secondary" size="sm" asChild className="w-full justify-center gap-1.5">
                <Link href="/dashboard">
                  <ChevronLeft size={16} aria-hidden />
                  Back to UpKeep
                </Link>
              </Button>
            </>
          ) : (
            <>
              <Tooltip content="Leti Peuser · Administrator" side="right" sideOffset={8}>
                <div className="flex justify-center">
                  <Avatar.Root className="w-9 h-9 rounded-full overflow-hidden shrink-0 ring-1 ring-[var(--border-default)]">
                    <Avatar.Fallback className="flex items-center justify-center w-full h-full bg-[var(--color-neutral-4)] text-[length:var(--font-size-sm)] font-semibold text-[var(--color-neutral-12)]">
                      LP
                    </Avatar.Fallback>
                  </Avatar.Root>
                </div>
              </Tooltip>
              <Tooltip content="Back to UpKeep" side="right" sideOffset={8}>
                <Button variant="secondary" size="sm" asChild className="w-9 h-9 p-0 justify-center">
                  <Link href="/dashboard" aria-label="Back to UpKeep">
                    <ChevronLeft size={16} aria-hidden />
                  </Link>
                </Button>
              </Tooltip>
            </>
          )}
        </div>
      </aside>

      <div className="flex min-h-0 flex-1 min-w-0 flex-col overflow-hidden">
        <div className="h-full min-h-0 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}

export function SuperNovaStagingShell({ children }: { children: React.ReactNode }) {
  return (
    <SuperNovaStagingNavProvider>
      <TooltipProvider delayDuration={300}>
        <SuperNovaStagingShellInner>{children}</SuperNovaStagingShellInner>
      </TooltipProvider>
    </SuperNovaStagingNavProvider>
  )
}
