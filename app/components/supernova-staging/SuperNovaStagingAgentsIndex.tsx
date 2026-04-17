'use client'

import { useRouter } from 'next/navigation'
import { useMemo } from 'react'
import { MoreVertical, PanelLeft, Plus, Settings, Shield, Star, Trash2, Zap } from 'lucide-react'
import { Button } from '@/app/components/ui/Button'
import { Badge } from '@/app/components/ui/Badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/app/components/ui/DropdownMenu'
import { Avatar } from '@/app/components/ui/Avatar'
import { IconButton } from '@/app/components/ui/IconButton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/Table'
import { STAGING_AGENTS } from '@/app/(app)/supernova/staging/lib/staging-agents'
import { STAGING_WORKFLOWS } from '@/app/(app)/supernova/staging/lib/staging-workflows'
import { useSuperNovaStagingNav } from '@/app/components/supernova-staging/supernova-staging-nav-context'

const stagingShellHeaderIconButtonClass =
  'flex shrink-0 items-center justify-center w-8 h-8 rounded-[var(--radius-lg)] hover:bg-[var(--color-neutral-3)] cursor-pointer transition-colors duration-[var(--duration-fast)]'

const tableHeadClass =
  '!h-11 !px-4 !py-3 text-left !text-[length:var(--font-size-xs)] !font-semibold uppercase tracking-wide !text-[var(--color-neutral-8)]'

/**
 * Agents directory: table view (stage, status, model, systems, actions). Rows open `/agents/[id]` (tabs + chat).
 */
export function SuperNovaStagingAgentsIndex() {
  const router = useRouter()
  const { sidebarCollapsed: mainNavCollapsed, toggleSidebar } = useSuperNovaStagingNav()

  const { activeCount, pausedCount } = useMemo(() => {
    const active = STAGING_AGENTS.filter((a) => a.status === 'active').length
    const paused = STAGING_AGENTS.filter((a) => a.status === 'paused').length
    return { activeCount: active, pausedCount: paused }
  }, [])

  // Map agent name → assigned workflows
  const agentWorkflowsMap = useMemo(() => {
    const map: Record<string, typeof STAGING_WORKFLOWS> = {}
    for (const wf of STAGING_WORKFLOWS) {
      if (wf.assignedAgent) {
        if (!map[wf.assignedAgent]) map[wf.assignedAgent] = []
        map[wf.assignedAgent].push(wf)
      }
    }
    return map
  }, [])

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden bg-[var(--surface-canvas)]">
      <header className="flex min-h-[var(--supernova-staging-header-height)] shrink-0 items-center gap-[var(--space-sm)] border-b border-[var(--border-default)] bg-[var(--surface-primary)] px-[var(--space-xl)]">
        <button
          type="button"
          className={stagingShellHeaderIconButtonClass}
          aria-label="Toggle sidebar"
          onClick={toggleSidebar}
        >
          <PanelLeft
            size={20}
            className={`text-[color:var(--color-neutral-7)] transition-transform duration-[var(--duration-slow)] ease-[var(--ease-default)] ${
              mainNavCollapsed ? 'rotate-180' : ''
            }`}
            aria-hidden
          />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="text-[length:var(--font-size-lg)] font-bold leading-tight text-[var(--color-neutral-12)]">
            Agents
          </h1>
          <p className="mt-0.5 text-[length:var(--font-size-sm)] text-[var(--color-neutral-8)]">
            {activeCount} active · {pausedCount} paused
          </p>
        </div>
        <Button variant="primary" size="md" type="button" className="shrink-0 gap-1.5">
          <Plus size={18} strokeWidth={2.25} aria-hidden />
          New Agent
        </Button>
      </header>

      <div className="sn-staging-agents-index-enter min-h-0 flex-1 overflow-y-auto px-[var(--space-xl)] py-[var(--space-xl)]">
        <div className="flex w-full min-w-0 flex-col gap-6">
          <p className="max-w-[var(--supernova-staging-prose-max)] text-[length:var(--font-size-body-1)] leading-6 text-[var(--color-neutral-12)]">
            Select an agent to open chat, workflows, and integrations.
          </p>
          <div className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-primary)] shadow-[var(--shadow-xs)]">
            <Table className="overflow-x-auto">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className={`${tableHeadClass} w-[min(28%,320px)]`}>Agent</TableHead>
                  <TableHead className={`${tableHeadClass}`}>Stage</TableHead>
                  <TableHead className={`${tableHeadClass}`}>Status</TableHead>
                  <TableHead className={`${tableHeadClass} min-w-[200px]`}>Model</TableHead>
                  <TableHead className={`${tableHeadClass} min-w-[140px]`}>Connected systems</TableHead>
                  <TableHead className={`${tableHeadClass} min-w-[180px]`}>Workflows</TableHead>
                  <TableHead className={`${tableHeadClass} w-[100px] text-right`}>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {STAGING_AGENTS.map((a) => (
                  <TableRow
                    key={a.id}
                    className="group cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-accent-7)]"
                    tabIndex={0}
                    aria-label={`Open ${a.name}`}
                    onClick={() => router.push(`/supernova/staging/agents/${a.id}`)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        router.push(`/supernova/staging/agents/${a.id}`)
                      }
                    }}
                  >
                    <TableCell className="align-middle py-3 pl-4 pr-3">
                      <div className="flex min-w-0 items-start gap-3">
                        <Avatar name={a.name} size="lg" />
                        <div className="min-w-0 pt-0.5">
                          <span className="text-[length:var(--font-size-base)] font-semibold text-[var(--color-accent-9)] group-hover:text-[var(--color-accent-10)] group-hover:underline">
                            {a.name}
                          </span>
                          <p className="mt-0.5 text-[length:var(--font-size-sm)] leading-snug text-[var(--color-neutral-8)] truncate">
                            {a.subtitle}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="align-middle py-3 px-3">
                      <span className="inline-flex items-center rounded-full bg-[var(--color-neutral-3)] px-2.5 py-1 text-[length:var(--font-size-xs)] font-semibold uppercase tracking-wide text-[var(--color-neutral-11)]">
                        {a.stage}
                      </span>
                    </TableCell>
                    <TableCell className="align-middle py-3 px-3">
                      {a.status === 'active' ? (
                        <Badge severity="success" variant="subtle" size="sm" className="!font-semibold uppercase tracking-wide">
                          Active
                        </Badge>
                      ) : (
                        <Badge severity="neutral" variant="subtle" size="sm" className="!font-semibold uppercase tracking-wide">
                          Paused
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="align-middle py-3 px-3">
                      {(() => {
                        const parts = a.model.split('/')
                        return (
                          <div className="flex items-center gap-1">
                            <span className="inline-flex items-center rounded-[var(--radius-md)] bg-[var(--color-neutral-3)] px-2 py-0.5 font-mono text-[length:var(--font-size-xs)] text-[var(--color-neutral-8)] max-w-[120px] truncate">
                              {parts[0]}
                            </span>
                            {parts.length > 1 && (
                              <span className="inline-flex items-center rounded-[var(--radius-md)] bg-[var(--color-neutral-3)] px-2 py-0.5 font-mono text-[length:var(--font-size-xs)] text-[var(--color-neutral-7)] shrink-0">
                                +{parts.length - 1}
                              </span>
                            )}
                          </div>
                        )
                      })()}
                    </TableCell>
                    <TableCell className="align-middle py-3 px-3">
                      <div className="flex flex-wrap gap-1.5">
                        {a.connectedSystems.map((sys) => (
                          <span
                            key={sys}
                            className="inline-flex items-center rounded-[var(--radius-md)] border border-[var(--color-neutral-4)] bg-[var(--color-neutral-3)] px-2 py-0.5 text-[length:var(--font-size-xs)] font-semibold uppercase tracking-wide text-[var(--color-neutral-8)]"
                          >
                            {sys.toUpperCase()}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="align-middle py-3 px-3" onClick={(e) => e.stopPropagation()}>
                      {(() => {
                        const wfs = agentWorkflowsMap[a.name] ?? []
                        if (wfs.length === 0) {
                          return (
                            <button
                              type="button"
                              onClick={() => router.push('/supernova/staging/workflows/new')}
                              className="inline-flex items-center gap-1 rounded-[var(--radius-md)] border border-dashed border-[var(--color-neutral-5)] px-2 py-0.5 text-[length:var(--font-size-xs)] font-medium text-[var(--color-neutral-6)] hover:border-[var(--color-accent-6)] hover:bg-[var(--color-accent-1)] hover:text-[var(--color-accent-9)] transition-colors cursor-pointer"
                            >
                              <Plus size={10} className="shrink-0" aria-hidden />
                              Assign workflow
                            </button>
                          )
                        }
                        return (
                          <div className="flex flex-wrap gap-1.5">
                            {wfs.slice(0, 1).map((wf) => (
                              <button
                                key={wf.id}
                                type="button"
                                onClick={() => router.push(`/supernova/staging/workflows/${wf.id}`)}
                                className="inline-flex items-center gap-1 rounded-[var(--radius-md)] border border-[var(--color-neutral-4)] bg-[var(--color-neutral-2)] px-2 py-0.5 text-[length:var(--font-size-xs)] font-medium text-[var(--color-neutral-10)] hover:border-[var(--color-accent-5)] hover:bg-[var(--color-accent-1)] hover:text-[var(--color-accent-10)] transition-colors cursor-pointer max-w-[120px]"
                              >
                                <Zap size={10} className="shrink-0" aria-hidden />
                                <span className="truncate">{wf.title}</span>
                              </button>
                            ))}
                            {wfs.length > 1 && (
                              <span className="inline-flex items-center rounded-[var(--radius-md)] bg-[var(--color-neutral-3)] px-2 py-0.5 text-[length:var(--font-size-xs)] font-medium text-[var(--color-neutral-7)]">
                                +{wfs.length - 1}
                              </span>
                            )}
                          </div>
                        )
                      })()}
                    </TableCell>
                    <TableCell
                      className="align-middle py-3 pr-4 pl-3 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex justify-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <IconButton
                              label={`Actions for ${a.name}`}
                              variant="ghost"
                              size="md"
                              type="button"
                              className="text-[var(--color-neutral-7)] hover:text-[var(--color-neutral-11)]"
                            >
                              <MoreVertical size={16} aria-hidden />
                            </IconButton>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" sideOffset={8} minWidth="200px">
                            <DropdownMenuItem
                              textValue="Settings"
                              onSelect={() => {
                                router.push('/supernova/staging/settings')
                              }}
                            >
                              <Settings
                                size={16}
                                strokeWidth={2}
                                className="shrink-0 text-[var(--color-neutral-8)]"
                                aria-hidden
                              />
                              <span className="min-w-0 flex-1 text-left">Settings</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              textValue="Tool Boundaries"
                              onSelect={() => {
                                router.push(`/supernova/staging/agents/${a.id}`)
                              }}
                            >
                              <Shield
                                size={16}
                                strokeWidth={2}
                                className="shrink-0 text-[var(--color-neutral-8)]"
                                aria-hidden
                              />
                              <span className="min-w-0 flex-1 text-left">Tool Boundaries</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem textValue="Delete" className="text-red-600">
                              <Trash2 size={16} strokeWidth={2} className="shrink-0" aria-hidden />
                              <span className="min-w-0 flex-1 text-left">Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  )
}

