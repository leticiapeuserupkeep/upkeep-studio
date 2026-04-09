'use client'

import { Star, Lock, Trash2 } from 'lucide-react'
import { Button } from '@/app/components/ui/Button'
import { Badge } from '@/app/components/ui/Badge'
import { IconButton } from '@/app/components/ui/IconButton'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/app/components/ui/Table'
import { StagingPageHeader } from '@/app/components/supernova-staging/StagingPageHeader'

type StagingAgent = {
  id: string
  name: string
  subtitle: string
  initials: string
  stage: string
  status: 'active' | 'paused'
  model: string
  connectedSystems: string[]
}

const stagingAgents: StagingAgent[] = [
  {
    id: 'demo-1',
    name: 'Demo',
    subtitle: 'Demo agent',
    initials: 'D',
    stage: 'WATCH',
    status: 'active',
    model: 'anthropic/claude-3-5-sonnet-20241022',
    connectedSystems: ['UpKeep'],
  },
]

export default function SuperNovaStagingAgentsPage() {
  const active = stagingAgents.filter((a) => a.status === 'active').length
  const paused = stagingAgents.filter((a) => a.status === 'paused').length

  return (
    <div className="w-full flex flex-col min-h-0">
      <StagingPageHeader
        title="Agents"
        actions={
          <Button variant="primary" size="md" type="button">
            + New Agent
          </Button>
        }
      />

      <div className="w-full px-[var(--space-2xl)] py-[var(--space-xl)] flex flex-col gap-6">
        <p className="text-[length:var(--font-size-sm)] text-[var(--color-neutral-8)]">
          {active} active · {paused} paused
        </p>

        <div className="rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-primary)] shadow-[var(--shadow-xs)] overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Agent</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Connected systems</TableHead>
                <TableHead className="text-right w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stagingAgents.map((agent) => (
                <TableRow key={agent.id}>
                  <TableCell>
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="flex items-center justify-center w-9 h-9 rounded-full bg-[var(--color-neutral-4)] text-[length:var(--font-size-sm)] font-semibold text-[var(--color-neutral-11)] shrink-0">
                        {agent.initials}
                      </span>
                      <div className="min-w-0 flex flex-col gap-0.5">
                        <span className="text-[length:var(--font-size-base)] font-semibold text-[var(--color-accent-9)] truncate">
                          {agent.name}
                        </span>
                        <span className="text-[length:var(--font-size-sm)] text-[var(--color-neutral-8)] truncate">
                          {agent.subtitle}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--color-neutral-3)] text-[length:var(--font-size-xs)] font-medium text-[var(--color-neutral-11)] uppercase tracking-wide">
                      <Star size={12} className="shrink-0 text-[var(--color-neutral-8)]" aria-hidden />
                      {agent.stage}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge severity="success" variant="subtle" size="sm">
                      {agent.status === 'active' ? 'ACTIVE' : 'PAUSED'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span
                      className="text-[length:var(--font-size-sm)] font-mono text-[var(--color-neutral-11)] max-w-[min(100%,280px)] truncate block"
                      title={agent.model}
                    >
                      {agent.model}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {agent.connectedSystems.map((sys) => (
                        <Badge key={sys} severity="info" variant="subtle" size="sm">
                          {sys.toUpperCase()}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex items-center justify-end gap-1">
                      <IconButton label="Lock agent" variant="secondary" size="md">
                        <Lock size={16} />
                      </IconButton>
                      <IconButton label="Delete agent" variant="secondary" size="md">
                        <Trash2 size={16} />
                      </IconButton>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
