'use client'

import { useMemo, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, PanelLeft } from 'lucide-react'
import { Button } from '@/app/components/ui/Button'
import { SearchInput } from '@/app/components/ui/SearchInput'
import { Tooltip } from '@/app/components/ui/Tooltip'
import { STAGING_AGENTS, type StagingAgent } from '@/app/(app)/supernova/staging/lib/staging-agents'
import { useSuperNovaStagingNav } from '@/app/components/supernova-staging/supernova-staging-nav-context'

type SuperNovaStagingAgentsWorkspaceProps = {
  selectedAgentId: string
  children: ReactNode
}

const MIN_AGENTS_FOR_SEARCH = 10

const stagingShellHeaderIconButtonClass =
  'flex shrink-0 items-center justify-center w-8 h-8 rounded-[var(--radius-lg)] hover:bg-[var(--color-neutral-3)] cursor-pointer transition-colors duration-[var(--duration-fast)]'

function filterAgents(query: string, agents: StagingAgent[]): StagingAgent[] {
  const q = query.trim().toLowerCase()
  if (!q) return agents
  return agents.filter(
    (a) =>
      a.name.toLowerCase().includes(q) ||
      a.subtitle.toLowerCase().includes(q) ||
      a.stage.toLowerCase().includes(q),
  )
}

export function SuperNovaStagingAgentsWorkspace({
  selectedAgentId,
  children,
}: SuperNovaStagingAgentsWorkspaceProps) {
  const router = useRouter()
  const { sidebarCollapsed: mainNavCollapsed, toggleSidebar } = useSuperNovaStagingNav()
  const [search, setSearch] = useState('')
  const [agentsRailCollapsed, setAgentsRailCollapsed] = useState(false)

  const showSearch = STAGING_AGENTS.length >= MIN_AGENTS_FOR_SEARCH
  const visibleAgents = useMemo(() => filterAgents(search, STAGING_AGENTS), [search])

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 overflow-hidden bg-[var(--surface-canvas)]">
      <aside
        id="supernova-agents-rail"
        className={`relative flex shrink-0 flex-col border-r border-[var(--border-default)] bg-[var(--surface-primary)] transition-[width] duration-[var(--duration-slow)] ease-[var(--ease-default)] ${
          agentsRailCollapsed ? 'w-16' : 'w-[min(100%,280px)]'
        }`}
      >
        <Tooltip
          content={agentsRailCollapsed ? 'Show agents list' : 'Hide agents list'}
          side={agentsRailCollapsed ? 'right' : 'left'}
          sideOffset={4}
        >
          <button
            type="button"
            aria-label={agentsRailCollapsed ? 'Show agents list' : 'Hide agents list'}
            aria-expanded={!agentsRailCollapsed}
            aria-controls="supernova-agents-rail"
            className="absolute right-0 top-1/2 z-20 flex h-9 w-5 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full border border-[var(--border-default)] bg-[var(--surface-primary)] text-[var(--color-neutral-9)] shadow-[var(--shadow-sm)] transition-[color,background-color,box-shadow] duration-[var(--duration-fast)] hover:bg-[var(--color-neutral-3)] hover:text-[var(--color-neutral-12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-7)] focus-visible:ring-offset-2"
            onClick={() => setAgentsRailCollapsed((c) => !c)}
          >
            {agentsRailCollapsed ? (
              <ChevronRight size={14} strokeWidth={2.25} aria-hidden />
            ) : (
              <ChevronLeft size={14} strokeWidth={2.25} aria-hidden />
            )}
          </button>
        </Tooltip>

        {agentsRailCollapsed ? (
          <div className="flex h-[var(--supernova-staging-header-height)] shrink-0 items-center justify-center border-b border-[var(--border-default)] px-2">
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
          </div>
        ) : (
          <div className="flex h-[var(--supernova-staging-header-height)] shrink-0 items-center gap-[var(--space-sm)] border-b border-[var(--border-default)] px-4">
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
            <h2 className="min-w-0 shrink text-[length:var(--font-size-sm)] font-semibold leading-6 text-[var(--color-neutral-12)] truncate">
              Agents
            </h2>
            <div className="min-w-0 flex-1" aria-hidden />
            <Button variant="primary" size="md" type="button" className="shrink-0">
              New Agent
            </Button>
          </div>
        )}

        {showSearch && !agentsRailCollapsed && (
          <div className="p-3">
            <SearchInput value={search} onValueChange={setSearch} placeholder="Search" />
          </div>
        )}

        <nav
          className={`min-h-0 flex-1 overflow-y-auto pb-3 ${
            agentsRailCollapsed
              ? 'flex flex-col items-center gap-2 px-2 pt-2'
              : `px-3 ${!showSearch ? 'pt-3' : ''}`
          }`}
          aria-label="Agents"
        >
          {visibleAgents.length === 0 ? (
            !agentsRailCollapsed && (
              <p className="px-1 text-[length:var(--font-size-sm)] text-[var(--color-neutral-8)]">
                No agents match your search.
              </p>
            )
          ) : (
            visibleAgents.map((a) => {
              const selected = a.id === selectedAgentId
              const row = (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => router.push(`/supernova/staging/agents/${a.id}`)}
                  title={agentsRailCollapsed ? `${a.name} — ${a.subtitle}` : undefined}
                  className={`mb-2 flex w-full items-center gap-3 rounded-[var(--radius-lg)] text-left transition-colors duration-[var(--duration-fast)] last:mb-0 ${
                    agentsRailCollapsed ? 'justify-center px-0 py-1' : 'px-3 py-2.5'
                  } ${
                    selected
                      ? 'border border-[var(--color-accent-7)] bg-[var(--color-accent-1)] shadow-[var(--shadow-xs)]'
                      : 'border border-transparent hover:bg-[var(--color-neutral-3)]'
                  }`}
                >
                  <span className="relative flex shrink-0">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-neutral-4)] text-[length:var(--font-size-sm)] font-semibold text-[var(--color-neutral-11)]">
                      {a.initials}
                    </span>
                    {a.status === 'active' && (
                      <span
                        className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-[var(--color-success)] ring-2 ring-[var(--surface-primary)]"
                        aria-hidden
                      />
                    )}
                  </span>
                  {!agentsRailCollapsed && (
                    <>
                      <div className="min-w-0 flex-1">
                        <div className="text-[length:var(--font-size-base)] font-semibold text-[var(--color-neutral-12)] truncate">
                          {a.name}
                        </div>
                        <div className="text-[length:var(--font-size-sm)] text-[var(--color-neutral-8)] truncate">
                          {a.subtitle}
                        </div>
                      </div>
                      {selected && (
                        <ChevronRight
                          size={18}
                          className="shrink-0 text-[var(--color-accent-10)]"
                          aria-hidden
                        />
                      )}
                    </>
                  )}
                </button>
              )

              if (agentsRailCollapsed) {
                return (
                  <Tooltip key={a.id} content={`${a.name} — ${a.subtitle}`} side="right" sideOffset={8}>
                    {row}
                  </Tooltip>
                )
              }

              return row
            })
          )}
        </nav>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">{children}</div>
    </div>
  )
}
