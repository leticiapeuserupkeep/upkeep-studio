'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search, Plus, MoreVertical, Zap, Clock, Play,
  GitBranch, CheckCircle2, AlertCircle, PauseCircle,
  FileEdit, ChevronRight, RefreshCw, Trash2,
  Copy, Settings, BarChart3, Thermometer, Package,
  ShieldCheck, Wrench, Bell,
  type LucideIcon,
} from 'lucide-react'
import { StagingPageHeader } from '@/app/components/supernova-staging/StagingPageHeader'
import { Badge } from '@/app/components/ui/Badge'
import { Button } from '@/app/components/ui/Button'
import { IconButton } from '@/app/components/ui/IconButton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/app/components/ui/DropdownMenu'
import { STAGING_WORKFLOWS, type WorkflowStatus, type TriggerType } from './lib/staging-workflows'

// ─── Icon registry ────────────────────────────────────────────────────────────
const ICON_MAP: Record<string, LucideIcon> = {
  BarChart3, Search, Thermometer, Package, ShieldCheck, Wrench, Bell,
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: WorkflowStatus }) {
  if (status === 'active')
    return <Badge severity="success" variant="subtle" size="sm" className="!font-semibold uppercase tracking-wide shrink-0">Active</Badge>
  if (status === 'paused')
    return <Badge severity="warning" variant="subtle" size="sm" className="!font-semibold uppercase tracking-wide shrink-0">Paused</Badge>
  if (status === 'failed')
    return <Badge severity="danger" variant="subtle" size="sm" className="!font-semibold uppercase tracking-wide shrink-0">Failed</Badge>
  return <Badge severity="neutral" variant="subtle" size="sm" className="!font-semibold uppercase tracking-wide shrink-0">Draft</Badge>
}

function TriggerBadge({ type }: { type: TriggerType }) {
  if (type === 'scheduled')
    return (
      <span className="inline-flex items-center gap-1 px-2 h-5 rounded-[var(--radius-md)] bg-[var(--color-accent-1)] border border-[var(--color-accent-4)] text-[11px] font-semibold text-[var(--color-accent-11)] shrink-0">
        <Clock size={10} aria-hidden /> Scheduled
      </span>
    )
  if (type === 'event')
    return (
      <span className="inline-flex items-center gap-1 px-2 h-5 rounded-[var(--radius-md)] bg-[#fdf4ff] border border-[#e9d5ff] text-[11px] font-semibold text-[#7c3aed] shrink-0">
        <Zap size={10} aria-hidden /> Event
      </span>
    )
  return (
    <span className="inline-flex items-center gap-1 px-2 h-5 rounded-[var(--radius-md)] bg-[var(--color-neutral-3)] border border-[var(--border-default)] text-[11px] font-semibold text-[var(--color-neutral-9)] shrink-0">
      <Play size={10} aria-hidden /> Manual
    </span>
  )
}

function LastRunCell({ status, lastRun, lastRunDuration }: {
  status: 'completed' | 'failed' | 'running' | null
  lastRun: string | null
  lastRunDuration: string | null
}) {
  if (!lastRun) return <span className="text-[var(--color-neutral-6)]">—</span>
  if (status === 'running')
    return (
      <span className="inline-flex items-center gap-1.5 text-[var(--color-accent-9)]">
        <RefreshCw size={12} className="animate-spin shrink-0" aria-hidden />
        <span>Running</span>
      </span>
    )
  if (status === 'failed')
    return (
      <span className="inline-flex items-center gap-1.5">
        <AlertCircle size={12} className="text-[var(--color-error)] shrink-0" aria-hidden />
        <span className="text-[var(--color-neutral-9)]">{lastRun}</span>
      </span>
    )
  return (
    <span className="inline-flex items-center gap-1.5">
      <CheckCircle2 size={12} className="text-[var(--color-success)] shrink-0" aria-hidden />
      <span className="text-[var(--color-neutral-9)]">{lastRun}{lastRunDuration ? ` · ${lastRunDuration}` : ''}</span>
    </span>
  )
}

// ─── Filter constants ────────────────────────────────────────────────────────

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'draft', label: 'Draft' },
  { value: 'paused', label: 'Paused' },
  { value: 'failed', label: 'Failed' },
]

const TRIGGER_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'All triggers' },
  { value: 'manual', label: 'Manual' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'event', label: 'Event-based' },
]

const AGENT_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'All agents' },
  { value: 'Demo', label: 'Demo' },
  { value: '__none__', label: 'Unassigned' },
]

const selectCls =
  'h-8 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 pr-7 text-[length:var(--font-size-sm)] font-medium text-[var(--color-neutral-11)] appearance-none cursor-pointer transition-colors hover:border-[var(--color-neutral-6)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-7)] focus:border-[var(--color-accent-7)]'

// ─── Page ────────────────────────────────────────────────────────────────────

export default function SuperNovaStagingWorkflowsPage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [triggerFilter, setTriggerFilter] = useState('')
  const [agentFilter, setAgentFilter] = useState('')

  const filtered = useMemo(() => {
    let list = [...STAGING_WORKFLOWS]
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (w) => w.title.toLowerCase().includes(q) || w.description.toLowerCase().includes(q),
      )
    }
    if (statusFilter) list = list.filter((w) => w.status === statusFilter)
    if (triggerFilter) list = list.filter((w) => w.triggerType === triggerFilter)
    if (agentFilter === '__none__') list = list.filter((w) => !w.assignedAgent)
    else if (agentFilter) list = list.filter((w) => w.assignedAgent === agentFilter)
    return list
  }, [search, statusFilter, triggerFilter, agentFilter])

  const activeCount = STAGING_WORKFLOWS.filter((w) => w.status === 'active').length
  const hasFilters = !!(search || statusFilter || triggerFilter || agentFilter)

  return (
    <div className="sn-staging-agents-index-enter flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden bg-[var(--surface-canvas)]">

      {/* Header */}
      <StagingPageHeader
        title="Workflows"
        actions={
          <Button variant="primary" size="md" type="button" className="shrink-0 gap-1.5">
            <Plus size={16} strokeWidth={2.25} aria-hidden />
            New Workflow
          </Button>
        }
      />

      {/* Scrollable body */}
      <div className="flex-1 min-h-0 overflow-y-auto px-[var(--space-2xl)] py-[var(--space-xl)]">
        <div className="flex flex-col gap-6 w-full max-w-[var(--supernova-staging-content-max)]" style={{ maxWidth: 960 }}>

          {/* Intro */}
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <p className="text-[length:var(--font-size-body-1)] text-[var(--color-neutral-9)] leading-6 max-w-[var(--supernova-staging-prose-max)]">
              {activeCount} active workflow{activeCount !== 1 ? 's' : ''} · agents create and manage these automatically. Review, assign, or run them manually from here.
            </p>
          </div>

          {/* Search + Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px] max-w-[300px]">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-neutral-7)] pointer-events-none"
                aria-hidden
              />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search workflows…"
                className="h-8 w-full rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] pl-8 pr-3 text-[length:var(--font-size-sm)] text-[var(--color-neutral-11)] placeholder:text-[var(--color-neutral-6)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-7)] focus:border-[var(--color-accent-7)] transition-colors"
              />
            </div>

            {/* Status */}
            <div className="relative">
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={selectCls}>
                {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <ChevronRight size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 rotate-90 text-[var(--color-neutral-7)] pointer-events-none" aria-hidden />
            </div>

            {/* Trigger */}
            <div className="relative">
              <select value={triggerFilter} onChange={(e) => setTriggerFilter(e.target.value)} className={selectCls}>
                {TRIGGER_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <ChevronRight size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 rotate-90 text-[var(--color-neutral-7)] pointer-events-none" aria-hidden />
            </div>

            {/* Agent */}
            <div className="relative">
              <select value={agentFilter} onChange={(e) => setAgentFilter(e.target.value)} className={selectCls}>
                {AGENT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <ChevronRight size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 rotate-90 text-[var(--color-neutral-7)] pointer-events-none" aria-hidden />
            </div>

            {hasFilters && (
              <button
                type="button"
                onClick={() => { setSearch(''); setStatusFilter(''); setTriggerFilter(''); setAgentFilter('') }}
                className="text-[length:var(--font-size-sm)] font-medium text-[var(--color-neutral-8)] hover:text-[var(--color-neutral-11)] transition-colors cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-primary)] shadow-[var(--shadow-xs)]">

            {/* Table header */}
            <div className="grid border-b border-[var(--border-default)] bg-[var(--surface-secondary)] px-4 py-2.5"
              style={{ gridTemplateColumns: '1fr 90px 110px 110px 80px 160px 60px 40px' }}>
              {['Workflow', 'Status', 'Trigger', 'Agent', 'Steps', 'Last run', 'Runs', ''].map((h) => (
                <span key={h} className="text-[length:var(--font-size-xs)] font-semibold uppercase tracking-wide text-[var(--color-neutral-7)] truncate">
                  {h}
                </span>
              ))}
            </div>

            {/* Rows */}
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                <div className="w-10 h-10 rounded-full bg-[var(--color-neutral-3)] flex items-center justify-center">
                  <Zap size={18} className="text-[var(--color-neutral-7)]" aria-hidden />
                </div>
                <div>
                  <p className="text-[length:var(--font-size-base)] font-semibold text-[var(--color-neutral-11)]">No workflows found</p>
                  <p className="mt-1 text-[length:var(--font-size-sm)] text-[var(--color-neutral-7)]">
                    {hasFilters ? 'Try adjusting your filters.' : 'Agents will create workflows automatically.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="sn-staging-workflow-cards divide-y divide-[var(--border-subtle)]">
                {filtered.map((wf) => (
                  <div
                    key={wf.id}
                    className="sn-staging-workflow-card-enter group grid items-center px-4 py-3 cursor-pointer hover:bg-[var(--color-neutral-2)] transition-colors duration-[var(--duration-fast)]"
                    style={{ gridTemplateColumns: '1fr 90px 110px 110px 80px 160px 60px 40px' }}
                    onClick={() => router.push(`/supernova/staging/workflows/${wf.id}`)}
                    role="row"
                  >
                    {/* Name + description */}
                    <div className="flex items-center gap-3 min-w-0 pr-4">
                      {/* Workflow icon thumbnail */}
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-[var(--color-accent-1)] border border-[var(--color-accent-4)]">
                        {(() => { const Icon = ICON_MAP[wf.iconName] ?? BarChart3; return <Icon size={15} className="text-[var(--color-accent-9)]" aria-hidden /> })()}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-[length:var(--font-size-base)] font-semibold text-[var(--color-neutral-12)] group-hover:text-[var(--color-neutral-12)] truncate">
                            {wf.title}
                          </span>
                          {wf.automation && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 h-4 rounded-[var(--radius-sm)] bg-[var(--color-neutral-3)] text-[10px] font-semibold text-[var(--color-neutral-8)] shrink-0">
                              AUTO
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-[length:var(--font-size-sm)] text-[var(--color-neutral-7)] truncate">
                          {wf.description}
                        </p>
                      </div>
                    </div>

                    {/* Status */}
                    <div><StatusBadge status={wf.status} /></div>

                    {/* Trigger */}
                    <div><TriggerBadge type={wf.triggerType} /></div>

                    {/* Agent */}
                    <div className="min-w-0">
                      {wf.assignedAgent ? (
                        <span className="inline-flex items-center gap-1.5 text-[length:var(--font-size-sm)] text-[var(--color-neutral-11)] truncate">
                          <span className="w-5 h-5 rounded-full bg-[var(--color-accent-9)] flex items-center justify-center shrink-0 text-white font-bold" style={{ fontSize: 9 }}>
                            {wf.assignedAgent.charAt(0).toUpperCase()}
                          </span>
                          <span className="truncate">{wf.assignedAgent}</span>
                        </span>
                      ) : (
                        <span className="text-[length:var(--font-size-sm)] text-[var(--color-neutral-6)]">Unassigned</span>
                      )}
                    </div>

                    {/* Steps */}
                    <div>
                      <span className="inline-flex items-center gap-1 text-[length:var(--font-size-sm)] text-[var(--color-neutral-9)]">
                        <GitBranch size={12} className="text-[var(--color-neutral-6)] shrink-0" aria-hidden />
                        {wf.steps.length}
                      </span>
                    </div>

                    {/* Last run */}
                    <div className="text-[length:var(--font-size-sm)]">
                      <LastRunCell
                        status={wf.lastRunStatus}
                        lastRun={wf.lastRun}
                        lastRunDuration={wf.lastRunDuration}
                      />
                    </div>

                    {/* Total runs */}
                    <div>
                      <span className="text-[length:var(--font-size-sm)] font-medium text-[var(--color-neutral-9)] tabular-nums">
                        {wf.totalRuns > 0 ? wf.totalRuns : <span className="text-[var(--color-neutral-5)]">0</span>}
                      </span>
                    </div>

                    {/* Actions */}
                    <div onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <IconButton
                            label={`Actions for ${wf.title}`}
                            variant="ghost"
                            size="md"
                            type="button"
                            className="text-[var(--color-neutral-6)] hover:text-[var(--color-neutral-11)]"
                          >
                            <MoreVertical size={16} aria-hidden />
                          </IconButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" sideOffset={8} minWidth="180px">
                          <DropdownMenuItem textValue="Run now" onSelect={() => router.push(`/supernova/staging/workflows/${wf.id}`)}>
                            <Play size={15} strokeWidth={2} className="shrink-0 text-[var(--color-neutral-8)]" aria-hidden />
                            <span className="min-w-0 flex-1 text-left">Run now</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem textValue="View detail" onSelect={() => router.push(`/supernova/staging/workflows/${wf.id}`)}>
                            <FileEdit size={15} strokeWidth={2} className="shrink-0 text-[var(--color-neutral-8)]" aria-hidden />
                            <span className="min-w-0 flex-1 text-left">View detail</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem textValue="Duplicate">
                            <Copy size={15} strokeWidth={2} className="shrink-0 text-[var(--color-neutral-8)]" aria-hidden />
                            <span className="min-w-0 flex-1 text-left">Duplicate</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem textValue="Settings">
                            <Settings size={15} strokeWidth={2} className="shrink-0 text-[var(--color-neutral-8)]" aria-hidden />
                            <span className="min-w-0 flex-1 text-left">Settings</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem textValue="Delete" className="text-red-600">
                            <Trash2 size={15} strokeWidth={2} className="shrink-0" aria-hidden />
                            <span className="min-w-0 flex-1 text-left">Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Footer count */}
            {filtered.length > 0 && (
              <div className="border-t border-[var(--border-subtle)] px-4 py-2.5">
                <span className="text-[length:var(--font-size-xs)] text-[var(--color-neutral-7)]">
                  {filtered.length} workflow{filtered.length !== 1 ? 's' : ''}
                  {hasFilters && STAGING_WORKFLOWS.length !== filtered.length && ` of ${STAGING_WORKFLOWS.length}`}
                </span>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
