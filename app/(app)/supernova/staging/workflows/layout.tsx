'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import {
  ChevronLeft, ChevronRight, Plus, ChevronDown,
  BarChart3, Search, Thermometer, Package, ShieldCheck,
  Wrench, Bell, Check, Pause, X, Archive, RefreshCw,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/app/components/ui/Button'
import { Tooltip } from '@/app/components/ui'
import { STAGING_WORKFLOWS, type WorkflowStatus } from '../lib/staging-workflows'

// ─── Archived workflows (mock) ────────────────────────────────────────────────
const ARCHIVED_WORKFLOWS = [
  { id: 'a1', title: 'Vendor Onboarding Flow',   scheduleLabel: 'Manual',        iconName: 'Package', steps: 5 },
  { id: 'a2', title: 'Monthly Compliance Report', scheduleLabel: 'Every month',   iconName: 'ShieldCheck', steps: 4 },
  { id: 'a3', title: 'Legacy WO Sync',            scheduleLabel: 'Daily at midnight', iconName: 'Bell', steps: 3 },
]

// ─── Icon registry ────────────────────────────────────────────────────────────
const ICON_MAP: Record<string, LucideIcon> = {
  BarChart3, Search, Thermometer, Package, ShieldCheck, Wrench, Bell,
}

// ─── Status dot config ────────────────────────────────────────────────────────
function StatusBadge({ status, isRunning }: { status: WorkflowStatus; isRunning?: boolean }) {
  // Running takes priority — blue badge with spinner
  if (isRunning) {
    return (
      <span
        className="absolute -bottom-0.5 -right-0.5 z-[2] flex h-4 w-4 items-center justify-center rounded-[5px] ring-[2.5px] ring-[var(--surface-primary)]"
        style={{ background: 'var(--color-accent-9)' }}
        aria-label="Running"
      >
        <RefreshCw size={8} color="white" strokeWidth={3} className="animate-spin" aria-hidden />
      </span>
    )
  }

  if (status === 'draft') return null

  const cfg = {
    active:  { bg: 'var(--color-success)',  Icon: Check,  label: 'Active' },
    paused:  { bg: '#d97706',               Icon: Pause,  label: 'Paused' },
    failed:  { bg: 'var(--color-error)',    Icon: X,      label: 'Failed' },
  }[status]

  if (!cfg) return null
  const { bg, Icon, label } = cfg

  return (
    <span
      className="absolute -bottom-0.5 -right-0.5 z-[2] flex h-4 w-4 items-center justify-center rounded-[5px] ring-[2.5px] ring-[var(--surface-primary)]"
      style={{ background: bg }}
      aria-label={label}
    >
      <Icon size={8} color="white" strokeWidth={3} aria-hidden />
    </span>
  )
}

// ─── Rail item ────────────────────────────────────────────────────────────────
function WorkflowRailItem({
  wf,
  selected,
  collapsed,
  onNavigate,
}: {
  wf: (typeof STAGING_WORKFLOWS)[number]
  selected: boolean
  collapsed: boolean
  onNavigate: (id: string) => void
}) {
  const Icon = ICON_MAP[wf.iconName] ?? BarChart3
  const isRunning = wf.lastRunStatus === 'running'

  const btn = (
    <button
      type="button"
      onClick={() => onNavigate(wf.id)}
      className={`mb-1.5 flex w-full items-center gap-3 rounded-[var(--radius-lg)] text-left transition-colors duration-[var(--duration-fast)] last:mb-0 ${
        collapsed ? 'justify-center px-0 py-1' : 'px-3 py-2.5'
      } ${
        selected
          ? 'border border-[var(--color-accent-7)] bg-[var(--color-accent-1)] shadow-[var(--shadow-xs)]'
          : 'border border-transparent hover:bg-[var(--color-neutral-3)]'
      }`}
    >
      {/* Avatar with status badge */}
      <span className="relative flex shrink-0">
        {/* Avatar square */}
        <span className="relative flex h-10 w-10 items-center justify-center rounded-[16px] bg-[var(--color-accent-1)] border border-[var(--color-accent-4)] z-[1]">
          <Icon size={16} className="text-[var(--color-accent-9)]" aria-hidden />
        </span>
        <StatusBadge status={wf.status} isRunning={isRunning} />
      </span>

      {!collapsed && (
        <>
          <div className="min-w-0 flex-1">
            <div className="text-[length:var(--font-size-base)] font-semibold text-[var(--color-neutral-12)] truncate">
              {wf.title}
            </div>
            <div className="text-[12px] text-[var(--color-neutral-6)] truncate mt-0.5 leading-snug">
              {wf.steps.length} steps · {wf.scheduleLabel}
            </div>
          </div>
          {selected && (
            <ChevronRight size={18} className="shrink-0 text-[var(--color-accent-10)]" aria-hidden />
          )}
        </>
      )}
    </button>
  )

  if (!collapsed) return btn

  return (
    <Tooltip content={`${wf.title} — ${wf.scheduleLabel}`} side="right" sideOffset={8}>
      {btn}
    </Tooltip>
  )
}

// ─── Layout ──────────────────────────────────────────────────────────────────
export default function WorkflowsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [railCollapsed, setRailCollapsed] = useState(false)
  const [archivedOpen, setArchivedOpen] = useState(false)

  const urlSegments = pathname.split('/')
  const lastSegment = urlSegments[urlSegments.length - 1]
  const selectedId = STAGING_WORKFLOWS.some((w) => w.id === lastSegment) ? lastSegment : null
  const isNewWorkflow = lastSegment === 'new'

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 overflow-hidden">

      {/* ── Workflows rail ── */}
      <aside
        id="supernova-workflows-rail"
        className={`relative flex h-full min-h-0 shrink-0 flex-col border-r border-[var(--border-default)] bg-[var(--surface-primary)] transition-[width] duration-[var(--duration-slow)] ease-[var(--ease-default)] ${
          railCollapsed ? 'w-16' : 'w-[min(100%,280px)]'
        }`}
      >
        {/* Header */}
        <div className={`flex h-[var(--supernova-staging-header-height)] shrink-0 items-center border-b border-[var(--border-default)] ${railCollapsed ? 'justify-center px-2' : 'gap-2 px-4'}`}>
          {!railCollapsed ? (
            <>
              <h2 className="flex-1 text-[length:var(--font-size-sm)] font-semibold text-[var(--color-neutral-12)] truncate">
                Workflows
              </h2>
              <Button
                variant="primary"
                size="sm"
                type="button"
                className="gap-1 shrink-0"
                onClick={() => router.push('/supernova/staging/workflows/new')}
              >
                <Plus size={14} aria-hidden />
                New
              </Button>
            </>
          ) : (
            <Tooltip content="New workflow" side="right" sideOffset={8}>
              <button
                type="button"
                onClick={() => router.push('/supernova/staging/workflows/new')}
                className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-accent-9)] text-white hover:bg-[var(--color-accent-10)] transition-colors cursor-pointer"
                aria-label="New workflow"
              >
                <Plus size={16} aria-hidden />
              </button>
            </Tooltip>
          )}
        </div>

        {/* Nav list */}
        <nav
          className={`min-h-0 flex-1 overflow-y-auto py-3 ${railCollapsed ? 'flex flex-col items-center px-2' : 'px-3'}`}
          aria-label="Workflows"
        >
          {/* Active "new workflow" item */}
          {isNewWorkflow && (
            <button
              type="button"
              onClick={() => router.push('/supernova/staging/workflows/new')}
              className={`mb-1.5 flex w-full items-center gap-3 rounded-[var(--radius-lg)] text-left transition-colors ${
                railCollapsed ? 'justify-center px-0 py-1' : 'px-3 py-2.5'
              } border border-[var(--color-accent-7)] bg-[var(--color-accent-1)] shadow-[var(--shadow-xs)]`}
            >
              <span className="relative flex shrink-0">
                <span className="flex h-10 w-10 items-center justify-center rounded-[16px] bg-[var(--color-accent-2)] border border-[var(--color-accent-5)]">
                  <Plus size={16} className="text-[var(--color-accent-10)]" aria-hidden />
                </span>
              </span>
              {!railCollapsed && (
                <>
                  <div className="min-w-0 flex-1">
                    <div className="text-[length:var(--font-size-base)] font-semibold text-[var(--color-accent-11)] truncate">New workflow</div>
                    <div className="text-[length:var(--font-size-xs)] text-[var(--color-accent-9)] truncate mt-0.5">Drafting with SuperNova</div>
                  </div>
                  <ChevronRight size={18} className="shrink-0 text-[var(--color-accent-10)]" aria-hidden />
                </>
              )}
            </button>
          )}

          {STAGING_WORKFLOWS.map((wf) => (
            <WorkflowRailItem
              key={wf.id}
              wf={wf}
              selected={wf.id === selectedId}
              collapsed={railCollapsed}
              onNavigate={(id) => router.push(`/supernova/staging/workflows/${id}`)}
            />
          ))}

          {/* ── Archived section ── */}
          {!railCollapsed && (
            <div className="mt-3">
              <button
                type="button"
                onClick={() => setArchivedOpen((o) => !o)}
                className="flex w-full items-center gap-1.5 px-2 py-1.5 rounded-[var(--radius-md)] text-left hover:bg-[var(--color-neutral-3)] transition-colors cursor-pointer group"
              >
                <Archive size={12} className="text-[var(--color-neutral-6)] shrink-0" aria-hidden />
                <span className="flex-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-neutral-6)]">
                  Archived
                </span>
                <span className="text-[10px] font-medium text-[var(--color-neutral-6)] mr-1">{ARCHIVED_WORKFLOWS.length}</span>
                <ChevronDown
                  size={12}
                  className={`text-[var(--color-neutral-5)] transition-transform duration-[var(--duration-fast)] shrink-0 ${archivedOpen ? 'rotate-180' : ''}`}
                  aria-hidden
                />
              </button>

              {archivedOpen && (
                <div className="mt-1 flex flex-col gap-0">
                  {ARCHIVED_WORKFLOWS.map((aw) => {
                    const Icon = ICON_MAP[aw.iconName] ?? Archive
                    return (
                      <div
                        key={aw.id}
                        className="flex items-center gap-3 px-3 py-2 rounded-[var(--radius-lg)] border border-transparent opacity-60 hover:opacity-80 hover:bg-[var(--color-neutral-2)] transition-all cursor-pointer"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[12px] bg-[var(--color-neutral-3)] border border-[var(--color-neutral-5)]">
                          <Icon size={13} className="text-[var(--color-neutral-7)]" aria-hidden />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="text-[length:var(--font-size-sm)] font-medium text-[var(--color-neutral-9)] truncate">{aw.title}</div>
                          <div className="text-[12px] text-[var(--color-neutral-6)] truncate leading-snug">{aw.steps} steps · {aw.scheduleLabel}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </nav>

        {/* Edge collapse toggle */}
        <Tooltip
          content={railCollapsed ? 'Show workflows' : 'Hide workflows'}
          side="right"
          sideOffset={8}
        >
          <button
            type="button"
            onClick={() => setRailCollapsed((c) => !c)}
            className="absolute right-0 top-1/2 z-20 flex h-9 w-5 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full border border-[var(--border-default)] bg-[var(--surface-primary)] text-[var(--color-neutral-9)] shadow-[var(--shadow-sm)] transition-[color,background-color] hover:bg-[var(--color-neutral-3)] hover:text-[var(--color-neutral-12)]"
            aria-label={railCollapsed ? 'Expand workflows list' : 'Collapse workflows list'}
          >
            {railCollapsed ? <ChevronRight size={12} aria-hidden /> : <ChevronLeft size={12} aria-hidden />}
          </button>
        </Tooltip>
      </aside>

      {/* ── Main content ── */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {children}
      </div>

    </div>
  )
}
