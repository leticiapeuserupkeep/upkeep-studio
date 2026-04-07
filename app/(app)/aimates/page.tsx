'use client'

import { useState } from 'react'
import { Plus, MoreHorizontal, MessageCircle, Pencil, Trash2, Power, Eye } from 'lucide-react'
import { Button } from '@/app/components/ui/Button'
import {
  Table, TableHead, TableBody, TableRow, TableHeader, TableCell,
} from '@/app/components/ui/Table'
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
} from '@/app/components/ui/DropdownMenu'
import { EXISTING_AGENTS, AVAILABLE_AGENTS } from '@/app/lib/agents-data'

interface IntegrationRef {
  name: string
  logo: string
}

interface AIMateRow {
  id: string
  name: string
  photo: string
  role: string
  skill: string
  skillColor: string
  skillBg: string
  mode: string
  status: 'active' | 'learning' | 'inactive'
  integrations: IntegrationRef[]
  tasksToday: number
  totalTasks: number
}

const aiMates: AIMateRow[] = [
  {
    id: 'sofia',
    name: 'Sofia Chen',
    photo: EXISTING_AGENTS.find(a => a.id === 'sofia')?.photo ?? '',
    role: 'Work Order Specialist',
    skill: 'Scheduling',
    skillColor: 'text-blue-700',
    skillBg: 'bg-blue-50 border-blue-200',
    mode: 'Auto-assign',
    status: 'active',
    integrations: [
      { name: 'Google Calendar', logo: '/images/integrations/google-calendar.svg' },
      { name: 'Slack', logo: '/images/integrations/slack.svg' },
    ],
    tasksToday: 14,
    totalTasks: 1247,
  },
  {
    id: 'marcus',
    name: 'Marcus Johnson',
    photo: EXISTING_AGENTS.find(a => a.id === 'marcus')?.photo ?? '',
    role: 'Maintenance Analyst',
    skill: 'Triage',
    skillColor: 'text-amber-700',
    skillBg: 'bg-amber-50 border-amber-200',
    mode: 'Auto-escalate · 4h threshold',
    status: 'active',
    integrations: [
      { name: 'Gmail', logo: '/images/integrations/gmail.svg' },
      { name: 'Slack', logo: '/images/integrations/slack.svg' },
    ],
    tasksToday: 8,
    totalTasks: 892,
  },
  {
    id: 'elena',
    name: 'Elena Rodriguez',
    photo: AVAILABLE_AGENTS.find(a => a.id === 'elena')?.photo ?? '',
    role: 'Request Coordinator',
    skill: 'Inventory',
    skillColor: 'text-emerald-700',
    skillBg: 'bg-emerald-50 border-emerald-200',
    mode: 'Auto-reorder · approval >$500',
    status: 'active',
    integrations: [
      { name: 'QuickBooks', logo: '/images/integrations/quickbooks.svg' },
      { name: 'Google Sheets', logo: '/images/integrations/google-sheets.svg' },
    ],
    tasksToday: 3,
    totalTasks: 564,
  },
  {
    id: 'david',
    name: 'David Park',
    photo: AVAILABLE_AGENTS.find(a => a.id === 'david')?.photo ?? '',
    role: 'Inventory Specialist',
    skill: 'Inventory',
    skillColor: 'text-emerald-700',
    skillBg: 'bg-emerald-50 border-emerald-200',
    mode: 'Suggest only',
    status: 'active',
    integrations: [
      { name: 'QuickBooks', logo: '/images/integrations/quickbooks.svg' },
    ],
    tasksToday: 5,
    totalTasks: 340,
  },
  {
    id: 'amanda',
    name: 'Amanda Torres',
    photo: AVAILABLE_AGENTS.find(a => a.id === 'amanda')?.photo ?? '',
    role: 'Compliance Officer',
    skill: 'Compliance',
    skillColor: 'text-purple-700',
    skillBg: 'bg-purple-50 border-purple-200',
    mode: 'Suggest only',
    status: 'learning',
    integrations: [
      { name: 'Google Sheets', logo: '/images/integrations/google-sheets.svg' },
      { name: 'Gmail', logo: '/images/integrations/gmail.svg' },
    ],
    tasksToday: 0,
    totalTasks: 12,
  },
]

const statusConfig = {
  active: { label: 'Active', dot: 'bg-[var(--color-success)]', text: 'text-emerald-700' },
  learning: { label: 'Learning', dot: 'bg-amber-400', text: 'text-amber-700' },
  inactive: { label: 'Inactive', dot: 'bg-[var(--color-neutral-5)]', text: 'text-[var(--color-neutral-7)]' },
}

export default function AIMatesPage() {
  const [search, setSearch] = useState('')

  const filtered = aiMates.filter(m => {
    if (!search) return true
    return `${m.name} ${m.role} ${m.skill}`.toLowerCase().includes(search.toLowerCase())
  })

  const activeCount = aiMates.filter(m => m.status === 'active').length
  const totalToday = aiMates.reduce((sum, m) => sum + m.tasksToday, 0)

  return (
    <div className="flex flex-col flex-1 w-full">
      <div className="flex flex-col flex-1 w-full relative">
        <main className="flex-1 overflow-y-auto">
          <div className="w-full px-[var(--space-2xl)] py-[var(--space-xl)]">

            {/* Stats */}
            <div
              className="grid grid-cols-3 gap-4 mb-6 opacity-0"
              style={{ animation: 'fadeInUp 0.35s var(--ease-default) 0.02s forwards' }}
            >
              <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-4">
                <p className="text-[12px] font-medium text-[var(--color-neutral-8)] mb-1">Total Agents</p>
                <p className="text-[24px] font-semibold text-[var(--color-neutral-12)]">{aiMates.length}</p>
              </div>
              <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-4">
                <p className="text-[12px] font-medium text-[var(--color-neutral-8)] mb-1">Active</p>
                <p className="text-[24px] font-semibold text-emerald-600">{activeCount}</p>
              </div>
              <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-4">
                <p className="text-[12px] font-medium text-[var(--color-neutral-8)] mb-1">Tasks Today</p>
                <p className="text-[24px] font-semibold text-[var(--color-neutral-12)]">{totalToday}</p>
              </div>
            </div>

            {/* Table */}
            <div
              className="bg-[var(--surface-primary)] rounded-[var(--widget-radius)] border border-[var(--widget-border)] overflow-hidden opacity-0"
              style={{ animation: 'fadeInUp 0.35s var(--ease-default) 0.06s forwards' }}
            >
              {/* Toolbar */}
              <div className="flex items-center justify-between px-5 py-2.5 border-b border-[var(--border-subtle)]">
                <span className="text-[var(--font-size-sm)] text-[var(--color-neutral-8)] font-medium">
                  {filtered.length} Agents
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search Agents…"
                    className="h-8 px-3 text-[13px] rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-primary)] text-[var(--color-neutral-12)] placeholder:text-[var(--color-neutral-6)] focus:outline-none focus:border-[var(--color-accent-8)] transition-colors w-[200px]"
                  />
                  <Button variant="primary" size="sm" className="gap-1.5">
                    <Plus size={14} />
                    Create Agent
                  </Button>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agent</TableHead>
                    <TableHead>Skill</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Integrations</TableHead>
                    <TableHead className="text-center">Today</TableHead>
                    <TableHead className="text-center">Total Tasks</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((mate) => {
                    const status = statusConfig[mate.status]
                    return (
                      <TableRow key={mate.id} className="group">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="relative shrink-0">
                              <img src={mate.photo} alt={mate.name} className="w-9 h-9 rounded-full object-cover" />
                              <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${status.dot}`} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[13px] font-medium text-[var(--color-neutral-12)] truncate">{mate.name}</p>
                              <p className="text-[11px] text-[var(--color-neutral-7)] truncate">{mate.role}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${mate.skillBg} ${mate.skillColor}`}>
                            {mate.skill}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-[11px] text-[var(--color-neutral-7)]">{mate.mode}</span>
                        </TableCell>
                        <TableCell>
                          <span className={`text-[12px] font-medium ${status.text}`}>{status.label}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {mate.integrations.map((integ) => (
                              <img key={integ.name} src={integ.logo} alt={integ.name} title={integ.name} className="w-4 h-4 rounded-[2px] object-cover" />
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="text-[13px] font-medium text-[var(--color-neutral-11)]">{mate.tasksToday}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="text-[13px] text-[var(--color-neutral-8)]">{mate.totalTasks.toLocaleString()}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="flex items-center justify-center w-7 h-7 rounded-[var(--radius-md)] hover:bg-[var(--color-neutral-3)] cursor-pointer transition-colors">
                              <MessageCircle size={14} className="text-[var(--color-neutral-7)]" />
                            </button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="flex items-center justify-center w-7 h-7 rounded-[var(--radius-md)] hover:bg-[var(--color-neutral-3)] cursor-pointer transition-colors">
                                  <MoreHorizontal size={15} className="text-[var(--color-neutral-7)]" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" minWidth="160px">
                                <DropdownMenuItem>
                                  <Eye size={13} className="text-[var(--color-neutral-7)]" />
                                  View Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Pencil size={13} className="text-[var(--color-neutral-7)]" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Power size={13} className="text-[var(--color-neutral-7)]" />
                                  {mate.status === 'active' ? 'Deactivate' : 'Activate'}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">
                                  <Trash2 size={13} />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
