'use client'

import { useState, useRef, useEffect, Fragment } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, ChevronRight, Download, Link2, X, Check, CircleDot, Flag, MapPin, User, Tag, CheckCircle2, Clock, Loader2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import * as Tooltip from '@radix-ui/react-tooltip'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/app/components/ui/Table'
import { Badge } from '@/app/components/ui/Badge'
import { IconButton } from '@/app/components/ui/IconButton'

/* ── Types ── */

type ExportStatus = 'Completed' | 'Exporting' | 'Pending'

interface FilterTag {
  label: string
  value: string
}

interface ExportSubRow {
  id: string
  name: string
  status: ExportStatus
  size: string
}

interface ExportRow {
  id: string
  workOrderCount: number
  format: string
  status: ExportStatus
  created: string
  completed: string
  duration?: string
  elapsed?: string
  progress?: number
  totalSize: string
  filters: FilterTag[]
  subRows?: ExportSubRow[]
}

/* ── Mock data ── */

const mockExports: ExportRow[] = [
  {
    id: 'exp-001',
    workOrderCount: 12,
    format: 'PDF',
    status: 'Pending',
    created: 'Mar 11, 2:48 PM',
    completed: '—',
    totalSize: '—',
    filters: [
      { label: 'Status', value: 'Open' },
      { label: 'Priority', value: 'High' },
    ],
  },
  {
    id: 'exp-002',
    workOrderCount: 3,
    format: 'PDF',
    status: 'Pending',
    created: 'Mar 11, 2:46 PM',
    completed: '—',
    totalSize: '—',
    filters: [{ label: 'Status', value: 'Open' }],
  },
  {
    id: 'exp-003',
    workOrderCount: 1,
    format: 'PDF',
    status: 'Exporting',
    created: 'Mar 11, 2:44 PM',
    completed: '—',
    elapsed: '4m 23s',
    progress: 62,
    totalSize: '1.4 MB',
    filters: [
      { label: 'Priority', value: 'Medium' },
      { label: 'Location', value: 'Plant South' },
    ],
  },
  {
    id: 'exp-004',
    workOrderCount: 45,
    format: 'PDF',
    status: 'Exporting',
    created: 'Mar 11, 2:42 PM',
    completed: '—',
    elapsed: '6m 10s',
    progress: 84,
    totalSize: '2.8 MB',
    filters: [
      { label: 'Priority', value: 'Low' },
      { label: 'Location', value: 'Warehouse' },
    ],
    subRows: [
      { id: 'sub-004a', name: 'Batch A — WO-1301, WO-1302... (+13)', status: 'Exporting', size: '—' },
      { id: 'sub-004b', name: 'Batch B — WO-1315, WO-1316... (+13)', status: 'Exporting', size: '—' },
      { id: 'sub-004c', name: 'Batch C — WO-1329, WO-1330... (+13)', status: 'Pending', size: '—' },
    ],
  },
  {
    id: 'exp-005',
    workOrderCount: 171,
    format: 'PDF',
    status: 'Completed',
    created: 'Mar 11, 2:30 PM',
    completed: 'Mar 11, 2:32 PM',
    duration: '2h 12m',
    totalSize: '8.3 MB',
    filters: [
      { label: 'Status', value: 'Open' },
      { label: 'Priority', value: 'High' },
      { label: 'Location', value: 'Main Campus' },
      { label: 'Assigned', value: 'Team A' },
    ],
    subRows: [
      { id: 'sub-005a', name: 'ReMY70tQ04, J7P4TYRqWi, iMtj0gYcYn... (+37)', status: 'Completed', size: '1.6 MB' },
      { id: 'sub-005b', name: 'WZpSnWhzUv, sbvZWpJLxT, YvBSXAEeeV... (+37)', status: 'Completed', size: '1.6 MB' },
      { id: 'sub-005c', name: '66Kd1THVJp, Crz2C4DMqZ, CJe3DbKWsq... (+37)', status: 'Completed', size: '1.6 MB' },
      { id: 'sub-005d', name: 'X9ZhGiIwXV, dB4HPb8as3, dBrRQN4q2v... (+37)', status: 'Completed', size: '1.9 MB' },
      { id: 'sub-005e', name: 'pjtugY26hR, gxa8dGGVwi, l9hA1dQ2xE... (+8)', status: 'Completed', size: '795.1 KB' },
    ],
  },
  {
    id: 'exp-006',
    workOrderCount: 21,
    format: 'PDF',
    status: 'Completed',
    created: 'Mar 11, 1:36 PM',
    completed: 'Mar 11, 1:37 PM',
    duration: '1m 12s',
    totalSize: '2.1 MB',
    filters: [
      { label: 'Status', value: 'Open' },
      { label: 'Priority', value: 'Low' },
    ],
  },
  {
    id: 'exp-007',
    workOrderCount: 45,
    format: 'PDF',
    status: 'Completed',
    created: 'Mar 11, 1:33 PM',
    completed: 'Mar 11, 1:34 PM',
    duration: '48m 5s',
    totalSize: '5.2 MB',
    filters: [
      { label: 'Status', value: 'Closed' },
      { label: 'Location', value: 'Plant North' },
      { label: 'Category', value: 'Electrical' },
    ],
    subRows: [
      { id: 'sub-007a', name: 'Batch A — WO-1201, WO-1202... (+13)', status: 'Completed', size: '1.8 MB' },
      { id: 'sub-007b', name: 'Batch B — WO-1215, WO-1216... (+13)', status: 'Completed', size: '1.7 MB' },
      { id: 'sub-007c', name: 'Batch C — WO-1229, WO-1230... (+13)', status: 'Completed', size: '1.7 MB' },
    ],
  },
  {
    id: 'exp-008',
    workOrderCount: 1,
    format: 'PDF',
    status: 'Completed',
    created: 'Mar 11, 1:24 PM',
    completed: 'Mar 11, 1:25 PM',
    duration: '32s',
    totalSize: '480 KB',
    filters: [{ label: 'Status', value: 'Open' }],
  },
  {
    id: 'exp-009',
    workOrderCount: 8,
    format: 'PDF',
    status: 'Completed',
    created: 'Mar 11, 1:07 PM',
    completed: 'Mar 11, 1:08 PM',
    duration: '1m 45s',
    totalSize: '1.2 MB',
    filters: [{ label: 'Status', value: 'In Progress' }],
  },
  {
    id: 'exp-010',
    workOrderCount: 5,
    format: 'PDF',
    status: 'Completed',
    created: 'Mar 11, 1:03 PM',
    completed: 'Mar 11, 1:04 PM',
    duration: '55s',
    totalSize: '890 KB',
    filters: [
      { label: 'Location', value: 'Warehouse' },
      { label: 'Priority', value: 'Critical' },
    ],
  },
  {
    id: 'exp-011',
    workOrderCount: 14,
    format: 'PDF',
    status: 'Completed',
    created: 'Mar 11, 1:00 PM',
    completed: 'Mar 11, 1:02 PM',
    duration: '2m 10s',
    totalSize: '1.8 MB',
    filters: [
      { label: 'Priority', value: 'Medium' },
      { label: 'Location', value: 'Plant South' },
      { label: 'Assigned', value: 'Team B' },
      { label: 'Category', value: 'HVAC' },
    ],
  },
  {
    id: 'exp-012',
    workOrderCount: 3,
    format: 'PDF',
    status: 'Completed',
    created: 'Mar 11, 12:58 PM',
    completed: 'Mar 11, 12:59 PM',
    duration: '28s',
    totalSize: '340 KB',
    filters: [{ label: 'Status', value: 'Open' }],
  },
  {
    id: 'exp-013',
    workOrderCount: 1,
    format: 'PDF',
    status: 'Completed',
    created: 'Mar 11, 12:51 PM',
    completed: 'Mar 11, 12:52 PM',
    duration: '18s',
    totalSize: '210 KB',
    filters: [{ label: 'Priority', value: 'Low' }],
  },
]

/* ── Helpers ── */

function pluralize(n: number, singular: string) {
  return `${n} ${singular}${n === 1 ? '' : 's'}`
}

/* ── Status Badge ── */

const statusSeverityMap: Record<ExportStatus, 'success' | 'info' | 'warning'> = {
  Completed: 'success',
  Exporting: 'info',
  Pending: 'warning',
}

const statusIconMap: Record<ExportStatus, typeof CheckCircle2> = {
  Completed: CheckCircle2,
  Exporting: Loader2,
  Pending: Clock,
}

function formatDurationLabel(duration: string) {
  return `Completed in ${duration.replace('h', ' hs').replace('m', ' min').replace('s', ' sec')}`
}

function StatusBadge({ status, duration }: {
  status: ExportStatus
  duration?: string
  progress?: number
}) {
  const Icon = statusIconMap[status]

  const badge = (
    <Badge severity={statusSeverityMap[status]}>
      <Icon size={12} className={status === 'Exporting' ? 'animate-spin' : ''} />
      {status === 'Exporting' ? 'In Progress' : status}
    </Badge>
  )

  if (status === 'Completed' && duration) {
    return (
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <span className="inline-flex cursor-default">{badge}</span>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            side="top"
            sideOffset={6}
            className="px-2.5 py-1.5 rounded-[var(--radius-md)] bg-[var(--color-neutral-12)] text-white text-[length:var(--font-size-xs)] shadow-[var(--shadow-lg)] z-[var(--z-toast)]"
          >
            {formatDurationLabel(duration)}
            <Tooltip.Arrow className="fill-[var(--color-neutral-12)]" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    )
  }

  return badge
}

/* ── Format Badge (blue) ── */

function FormatBadge({ format }: { format: string }) {
  return <Badge severity="info" className="font-semibold">{format}</Badge>
}

/* ── Filter Tags ── */

const filterIconMap: Record<string, LucideIcon> = {
  Status: CircleDot,
  Priority: Flag,
  Location: MapPin,
  Assigned: User,
  Category: Tag,
}

const MAX_VISIBLE_FILTERS = 2

function FilterTags({ filters }: { filters: FilterTag[] }) {
  const [showTooltip, setShowTooltip] = useState(false)
  const pillRef = useRef<HTMLSpanElement>(null)
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 })
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!showTooltip || !pillRef.current) return
    const r = pillRef.current.getBoundingClientRect()
    setTooltipPos({ top: r.bottom + 8, left: r.left + r.width / 2 })
  }, [showTooltip])

  if (filters.length === 0) {
    return <span className="text-[var(--color-neutral-6)]">—</span>
  }

  const visible = filters.slice(0, MAX_VISIBLE_FILTERS)
  const hidden = filters.slice(MAX_VISIBLE_FILTERS)

  return (
    <div className="flex items-center gap-1.5 overflow-hidden">
      {visible.map((f, i) => {
        const Icon = filterIconMap[f.label]
        return (
          <Badge key={i} severity="neutral" variant="outline" className="shrink-0">
            {Icon && <Icon size={12} className="shrink-0" />}
            {f.value}
          </Badge>
        )
      })}
      {hidden.length > 0 && (
        <span
          ref={pillRef}
          className="inline-flex items-center shrink-0 px-2 py-0.5 rounded-[var(--radius-full)] border border-[var(--color-neutral-5)] bg-[var(--color-neutral-1)] text-[var(--color-neutral-9)] text-[length:var(--font-size-xs)] font-medium cursor-default leading-none"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          +{hidden.length}
        </span>
      )}
      {showTooltip && hidden.length > 0 && mounted && createPortal(
        <>
          {/* Subtle backdrop */}
          <div
            className="fixed inset-0 z-[9998] pointer-events-none"
            style={{ animation: 'filter-backdrop-in 0.2s ease-out forwards' }}
          />
          {/* Tooltip */}
          <div
            className="fixed z-[9999] pointer-events-none"
            style={{
              top: tooltipPos.top,
              left: tooltipPos.left,
              transform: 'translateX(-50%)',
              animation: 'filter-tooltip-in 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            }}
          >
            {/* Arrow pointing up */}
            <div className="flex justify-center mb-[-1px]">
              <div className="w-3 h-1.5 overflow-hidden">
                <div className="w-2.5 h-2.5 bg-[var(--surface-primary)] border border-[var(--border-subtle)] rotate-45 transform origin-bottom-left translate-x-[3px] translate-y-[2px]" />
              </div>
            </div>
            <div className="bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-lg shadow-[var(--shadow-lg)] px-4 py-3">
              <div className="flex flex-wrap items-center gap-2">
                {hidden.map((f, i) => {
                  const Icon = filterIconMap[f.label]
                  return (
                    <Badge key={i} severity="neutral" variant="outline">
                      {Icon && <Icon size={12} className="shrink-0" />}
                      {f.value}
                    </Badge>
                  )
                })}
              </div>
            </div>
          </div>
        </>,
        document.body,
      )}
    </div>
  )
}

/* ── Row Action Menu (portal-based) ── */

function RowActionMenu({ status, isSubRow }: { status: ExportStatus; isSubRow?: boolean }) {
  const [copied, setCopied] = useState(false)
  const isCompleted = status === 'Completed'
  const showCancel = !isCompleted && !isSubRow

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (isCompleted) {
    return (
      <div className="flex items-center justify-end gap-1.5">
        <Tooltip.Root open={copied || undefined}>
          <Tooltip.Trigger asChild>
            <IconButton
              variant="secondary"
              size="sm"
              label="Copy link"
              onClick={handleCopyLink}
            >
              {copied ? (
                <Check size={14} className="text-[var(--color-success)]" />
              ) : (
                <Link2 size={14} />
              )}
            </IconButton>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              side="top"
              sideOffset={6}
              className="px-2.5 py-1.5 rounded-[var(--radius-md)] bg-[var(--color-neutral-12)] text-white text-xs font-medium shadow-[var(--shadow-lg)] animate-in fade-in-0 zoom-in-95"
            >
              {copied ? 'Copied!' : 'Copy link'}
              <Tooltip.Arrow className="fill-[var(--color-neutral-12)]" width={10} height={5} />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <IconButton
              variant="secondary"
              size="sm"
              label="Download PDF"
              onClick={(e) => e.stopPropagation()}
            >
              <Download size={14} />
            </IconButton>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              side="top"
              sideOffset={6}
              className="px-2.5 py-1.5 rounded-[var(--radius-md)] bg-[var(--color-neutral-12)] text-white text-xs font-medium shadow-[var(--shadow-lg)] animate-in fade-in-0 zoom-in-95"
            >
              Download PDF
              <Tooltip.Arrow className="fill-[var(--color-neutral-12)]" width={10} height={5} />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </div>
    )
  }

  if (showCancel) {
    return (
      <div className="flex items-center justify-end gap-1.5">
        <IconButton
          variant="secondary"
          size="sm"
          label="Copy link"
          disabled
          onClick={(e) => e.stopPropagation()}
        >
          <Link2 size={14} />
        </IconButton>
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <IconButton
              variant="secondary"
              size="sm"
              label="Cancel export"
              className="!text-[var(--color-error)] hover:bg-[var(--color-error-light)] hover:border-[var(--color-error)]"
              onClick={(e) => e.stopPropagation()}
            >
              <X size={14} />
            </IconButton>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              side="top"
              sideOffset={6}
              className="px-2.5 py-1.5 rounded-[var(--radius-md)] bg-[var(--color-neutral-12)] text-white text-xs font-medium shadow-[var(--shadow-lg)] animate-in fade-in-0 zoom-in-95"
            >
              Cancel export
              <Tooltip.Arrow className="fill-[var(--color-neutral-12)]" width={10} height={5} />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </div>
    )
  }

  return null
}

/* ── Main Page ── */

export default function ExportsPage() {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  function toggleRow(id: string) {
    setExpandedRows(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <Tooltip.Provider delayDuration={300}>
    <div className="flex flex-col flex-1 w-full">
      <main className="flex-1 overflow-y-auto">
        <div className="w-full px-[var(--space-2xl)] py-[var(--space-xl)]">
          <div
            className="bg-[var(--surface-primary)] rounded-[var(--widget-radius)] border border-[var(--widget-border)] shadow-[var(--widget-shadow)] overflow-hidden opacity-0"
            style={{ animation: 'fadeInUp 0.4s var(--ease-default) 0.05s forwards' }}
          >
            <Table>
              <TableHeader>
                <tr>
                  <TableHead className="w-10 !px-0" />
                  <TableHead className="!pl-2">Work Orders</TableHead>
                  <TableHead className="w-16">Format</TableHead>
                  <TableHead>Filters</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-20 text-right">Size</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12" />
                </tr>
              </TableHeader>
              <TableBody>
                {mockExports.map((row, i) => {
                  const isExpanded = expandedRows.has(row.id)
                  const fileCount = row.subRows?.length || 1
                  const isExpandable = fileCount > 1
                  const isNotComplete = row.status !== 'Completed'
                  const noSize = row.totalSize === '—'

                  const showFileCount = !(isNotComplete && noSize) && !(fileCount === 1 && row.workOrderCount === 1)

                  return (
                    <Fragment key={row.id}>
                      <TableRow
                        className={`opacity-0 ${isExpandable ? 'cursor-pointer select-none' : ''} ${isExpanded ? 'bg-[var(--color-neutral-2)]' : ''}`}
                        style={{ animation: `fadeInUp 0.35s var(--ease-default) ${0.06 + i * 0.025}s forwards` } as React.CSSProperties}
                        onClick={isExpandable ? () => toggleRow(row.id) : undefined}
                      >
                        <TableCell className="w-10 !pl-2 !pr-0 text-center">
                          {isExpandable && (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded text-[var(--color-neutral-8)] transition-transform duration-[var(--duration-fast)]">
                              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="font-medium text-[var(--color-neutral-12)] whitespace-nowrap !pl-2">
                          <span className="inline-flex items-center gap-2">
                            {row.workOrderCount} WOs
                            {showFileCount && (
                              <Badge severity="neutral" variant="subtle">
                                {pluralize(fileCount, 'file')}
                              </Badge>
                            )}
                          </span>
                        </TableCell>
                        <TableCell className="w-16"><FormatBadge format={row.format} /></TableCell>
                        <TableCell><FilterTags filters={row.filters} /></TableCell>
                        <TableCell className="whitespace-nowrap">{row.created}</TableCell>
                        <TableCell className={`w-20 text-right whitespace-nowrap ${noSize ? 'text-[var(--color-neutral-7)]' : ''}`}>{row.totalSize}</TableCell>
                        <TableCell><StatusBadge status={row.status} duration={row.duration} progress={row.progress} /></TableCell>
                        <TableCell className="text-right">
                          <RowActionMenu status={row.status} />
                        </TableCell>
                      </TableRow>

                      {isExpanded && isExpandable && row.subRows!.map((sub, j) => (
                        <TableRow
                          key={sub.id}
                          className="bg-[var(--color-neutral-2)] opacity-0"
                          style={{ animation: `fadeInUp 0.25s var(--ease-default) ${j * 0.04}s forwards` } as React.CSSProperties}
                        >
                          <TableCell className="w-10 !px-0" />
                          <TableCell className="text-[var(--color-neutral-9)] truncate max-w-[280px]" colSpan={3}>{sub.name}</TableCell>
                          <TableCell />
                          <TableCell className="w-20 text-right whitespace-nowrap text-[var(--color-neutral-9)]">{sub.size}</TableCell>
                          <TableCell><StatusBadge status={sub.status} /></TableCell>
                          <TableCell className="text-right">
                            <RowActionMenu status={sub.status} isSubRow />
                          </TableCell>
                        </TableRow>
                      ))}
                    </Fragment>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>
    </div>
    </Tooltip.Provider>
  )
}
