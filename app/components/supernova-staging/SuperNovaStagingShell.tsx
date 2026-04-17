'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import * as Avatar from '@radix-ui/react-avatar'
import {
  Zap, LayoutDashboard, Bot, Database,
  ScrollText, Terminal, Settings, ChevronLeft, RefreshCw,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button } from '@/app/components/ui/Button'
import { Tooltip, TooltipProvider } from '@/app/components/ui'
import { SuperNovaStagingNavProvider, useSuperNovaStagingNav } from './supernova-staging-nav-context'
import { SuperNovaStagingOrb } from './SuperNovaStagingOrb'
import { STAGING_WORKFLOWS } from '@/app/(app)/supernova/staging/lib/staging-workflows'

// ─── Live sidebar indicators ──────────────────────────────────────────────────

// Workflows: running spinner or failed dot
function WorkflowsIndicator() {
  const running = STAGING_WORKFLOWS.filter((w) => w.lastRunStatus === 'running').length
  const failed = STAGING_WORKFLOWS.filter((w) => w.status === 'failed').length

  if (running > 0) {
    return (
      <span className="ml-auto flex items-center gap-1 shrink-0" title={`${running} running`}>
        <RefreshCw size={11} className="text-[var(--color-accent-9)] animate-spin" aria-hidden />
        <span className="text-[10px] font-semibold text-[var(--color-accent-9)] tabular-nums leading-none">{running}</span>
      </span>
    )
  }
  if (failed > 0) {
    return (
      <span className="ml-auto shrink-0 flex items-center gap-1" title={`${failed} failed`}>
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-error)]">
          <span className="text-[9px] font-bold text-white leading-none">{failed}</span>
        </span>
      </span>
    )
  }
  return null
}

// Agents: blue dot for unread messages (mock: 1 unread on Demo agent)
const MOCK_AGENT_UNREAD = 1

function AgentsIndicator() {
  if (!MOCK_AGENT_UNREAD) return null
  return (
    <span className="ml-auto shrink-0" title={`${MOCK_AGENT_UNREAD} new message`}>
      <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[var(--color-accent-9)] px-1">
        <span className="text-[9px] font-bold text-white leading-none tabular-nums">{MOCK_AGENT_UNREAD}</span>
      </span>
    </span>
  )
}

// ─── Nav config ───────────────────────────────────────────────────────────────

const stagingNav: {
  label: string
  href: string
  icon: LucideIcon
  Indicator?: React.ComponentType
}[] = [
  { label: 'Dashboard',  href: '/supernova/staging/dashboard', icon: LayoutDashboard },
  { label: 'Agents',     href: '/supernova/staging/agents',    icon: Bot,             Indicator: AgentsIndicator },
  { label: 'Data',       href: '/supernova/staging/data',      icon: Database },
  { label: 'Workflows',  href: '/supernova/staging',           icon: Zap,             Indicator: WorkflowsIndicator },
  { label: 'Audit Log',  href: '/supernova/staging/audit',     icon: ScrollText },
  { label: 'Terminal',   href: '/supernova/staging/terminal',  icon: Terminal },
  { label: 'Settings',   href: '/supernova/staging/settings',  icon: Settings },
]

// ─── Active helper ────────────────────────────────────────────────────────────

function navIsActive(pathname: string, href: string) {
  if (href === '/supernova/staging') {
    return (
      pathname === '/supernova/staging' ||
      pathname === '/supernova/staging/' ||
      pathname.startsWith('/supernova/staging/workflows')
    )
  }
  return pathname === href || pathname.startsWith(`${href}/`)
}

// ─── Nav link ─────────────────────────────────────────────────────────────────

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
        <>
          <span className="flex-1 text-left text-[length:var(--font-size-base)] leading-5 truncate">
            {item.label}
          </span>
          {item.Indicator && <item.Indicator />}
        </>
      )}
    </Link>
  )

  if (!collapsed) return link

  // Collapsed: wrap in tooltip, optionally show a small dot overlay for indicators
  return (
    <Tooltip content={item.label} side="right" sideOffset={8}>
      <span className="relative block">
        {link}
        {/* Collapsed indicator dot */}
        {item.Indicator && (
          <span className="pointer-events-none absolute -right-0.5 -top-0.5">
            <CollapsedIndicatorDot href={item.href} />
          </span>
        )}
      </span>
    </Tooltip>
  )
}

function CollapsedIndicatorDot({ href }: { href: string }) {
  if (href === '/supernova/staging') {
    const running = STAGING_WORKFLOWS.some((w) => w.lastRunStatus === 'running')
    const failed = STAGING_WORKFLOWS.some((w) => w.status === 'failed')
    if (running) return <span className="flex h-2 w-2 rounded-full bg-[var(--color-accent-9)] animate-pulse" />
    if (failed) return <span className="flex h-2 w-2 rounded-full bg-[var(--color-error)]" />
  }
  if (href === '/supernova/staging/agents' && MOCK_AGENT_UNREAD > 0) {
    return <span className="flex h-2 w-2 rounded-full bg-[var(--color-accent-9)]" />
  }
  return null
}

// ─── Shell ────────────────────────────────────────────────────────────────────

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
