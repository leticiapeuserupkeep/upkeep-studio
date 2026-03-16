'use client'

import { useState, useRef, useEffect, useCallback, Fragment } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, ChevronRight, MoreHorizontal, Download, X, Link2, CircleDot, Flag, MapPin, User, Tag } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/app/components/ui/Table'

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
    workOrderCount: 171,
    format: 'PDF',
    status: 'Completed',
    created: 'Mar 11, 2:44 PM',
    completed: 'Mar 11, 2:45 PM',
    duration: '2h 12m',
    totalSize: '8.3 MB',
    filters: [
      { label: 'Status', value: 'Open' },
      { label: 'Priority', value: 'High' },
      { label: 'Location', value: 'Main Campus' },
      { label: 'Assigned', value: 'Team A' },
    ],
    subRows: [
      { id: 'sub-001a', name: 'ReMY70tQ04, J7P4TYRqWi, iMtj0gYcYn... (+37)', status: 'Completed', size: '1.6 MB' },
      { id: 'sub-001b', name: 'WZpSnWhzUv, sbvZWpJLxT, YvBSXAEeeV... (+37)', status: 'Completed', size: '1.6 MB' },
      { id: 'sub-001c', name: '66Kd1THVJp, Crz2C4DMqZ, CJe3DbKWsq... (+37)', status: 'Completed', size: '1.6 MB' },
      { id: 'sub-001d', name: 'X9ZhGiIwXV, dB4HPb8as3, dBrRQN4q2v... (+37)', status: 'Completed', size: '1.9 MB' },
      { id: 'sub-001e', name: 'pjtugY26hR, gxa8dGGVwi, l9hA1dQ2xE... (+8)', status: 'Completed', size: '795.1 KB' },
    ],
  },
  {
    id: 'exp-002',
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
    id: 'exp-003',
    workOrderCount: 1,
    format: 'PDF',
    status: 'Exporting',
    created: 'Mar 11, 1:36 PM',
    completed: '—',
    elapsed: '4m 23s',
    progress: 62,
    totalSize: '1.4 MB',
    filters: [{ label: 'Status', value: 'Open' }],
  },
  {
    id: 'exp-004',
    workOrderCount: 1,
    format: 'PDF',
    status: 'Exporting',
    created: 'Mar 11, 1:34 PM',
    completed: '—',
    elapsed: '6m 10s',
    progress: 84,
    totalSize: '2.8 MB',
    filters: [
      { label: 'Priority', value: 'Low' },
      { label: 'Location', value: 'Warehouse' },
    ],
  },
  {
    id: 'exp-005',
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
      { id: 'sub-005a', name: 'Batch A — WO-1201, WO-1202... (+13)', status: 'Completed', size: '1.8 MB' },
      { id: 'sub-005b', name: 'Batch B — WO-1215, WO-1216... (+13)', status: 'Completed', size: '1.7 MB' },
      { id: 'sub-005c', name: 'Batch C — WO-1229, WO-1230... (+13)', status: 'Completed', size: '1.7 MB' },
    ],
  },
  {
    id: 'exp-006',
    workOrderCount: 1,
    format: 'PDF',
    status: 'Pending',
    created: 'Mar 11, 1:24 PM',
    completed: '—',
    totalSize: '—',
    filters: [{ label: 'Status', value: 'Open' }],
  },
  {
    id: 'exp-007',
    workOrderCount: 1,
    format: 'PDF',
    status: 'Pending',
    created: 'Mar 11, 1:23 PM',
    completed: '—',
    totalSize: '—',
    filters: [],
  },
  {
    id: 'exp-008',
    workOrderCount: 1,
    format: 'PDF',
    status: 'Pending',
    created: 'Mar 11, 1:22 PM',
    completed: '—',
    totalSize: '—',
    filters: [
      { label: 'Priority', value: 'Medium' },
      { label: 'Location', value: 'Plant South' },
      { label: 'Assigned', value: 'Team B' },
      { label: 'Category', value: 'HVAC' },
    ],
  },
  {
    id: 'exp-009',
    workOrderCount: 1,
    format: 'PDF',
    status: 'Pending',
    created: 'Mar 11, 1:07 PM',
    completed: '—',
    totalSize: '—',
    filters: [{ label: 'Status', value: 'In Progress' }],
  },
  {
    id: 'exp-010',
    workOrderCount: 1,
    format: 'PDF',
    status: 'Pending',
    created: 'Mar 11, 1:03 PM',
    completed: '—',
    totalSize: '—',
    filters: [
      { label: 'Location', value: 'Warehouse' },
      { label: 'Priority', value: 'Critical' },
    ],
  },
  {
    id: 'exp-011',
    workOrderCount: 1,
    format: 'PDF',
    status: 'Pending',
    created: 'Mar 11, 1:00 PM',
    completed: '—',
    totalSize: '—',
    filters: [],
  },
  {
    id: 'exp-012',
    workOrderCount: 1,
    format: 'PDF',
    status: 'Pending',
    created: 'Mar 11, 12:58 PM',
    completed: '—',
    totalSize: '—',
    filters: [{ label: 'Status', value: 'Open' }],
  },
  {
    id: 'exp-013',
    workOrderCount: 1,
    format: 'PDF',
    status: 'Pending',
    created: 'Mar 11, 12:51 PM',
    completed: '—',
    totalSize: '—',
    filters: [],
  },
  {
    id: 'exp-014',
    workOrderCount: 1,
    format: 'PDF',
    status: 'Pending',
    created: 'Mar 11, 12:46 PM',
    completed: '—',
    totalSize: '—',
    filters: [{ label: 'Priority', value: 'Low' }],
  },
  {
    id: 'exp-015',
    workOrderCount: 1,
    format: 'PDF',
    status: 'Pending',
    created: 'Mar 11, 12:38 PM',
    completed: '—',
    totalSize: '—',
    filters: [],
  },
]

/* ── Helpers ── */

function pluralize(n: number, singular: string) {
  return `${n} ${singular}${n === 1 ? '' : 's'}`
}

/* ── Status Badge ── */

const statusStyles: Record<ExportStatus, string> = {
  Completed: 'bg-[var(--color-success-light)] text-[var(--color-success)]',
  Exporting: 'bg-[var(--color-info-light)] text-[var(--color-info)]',
  Pending: 'bg-[var(--color-warning-light)] text-[var(--color-warning)]',
}

function StatusBadge({ status, duration, progress }: {
  status: ExportStatus
  duration?: string
  progress?: number
}) {
  if (status === 'Exporting') {
    return (
      <div className="flex items-center gap-2 min-w-[100px]">
        <div className="flex-1 h-1.5 rounded-full bg-[var(--color-info-border)] overflow-hidden">
          <div
            className="h-full rounded-full bg-[var(--color-info)] transition-[width] duration-500 ease-out"
            style={{ width: `${progress ?? 0}%` }}
          />
        </div>
        <span className="text-[11px] font-medium text-[var(--color-info)] whitespace-nowrap tabular-nums shrink-0">
          {progress ?? 0}%
        </span>
      </div>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
      <span className={`inline-flex items-center px-2 py-0.5 rounded-[var(--radius-sm)] text-[length:var(--font-size-xs)] font-medium leading-none ${statusStyles[status]}`}>
        {status}
      </span>
      {status === 'Completed' && duration && (
        <span className="text-[11px] text-[var(--color-neutral-8)] font-normal">(in {duration})</span>
      )}
    </span>
  )
}

/* ── Format Badge (blue) ── */

function FormatBadge({ format }: { format: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-[var(--radius-sm)] bg-[var(--color-info-light)] text-[var(--color-info)] text-[length:var(--font-size-xs)] font-semibold leading-none border border-[var(--color-info-border)]">
      {format}
    </span>
  )
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
          <span
            key={i}
            className="inline-flex items-center gap-1 shrink-0 px-2 h-5 rounded-lg border border-[#E0E1E6] text-[12px] font-medium text-[#1C2024]"
          >
            {Icon && <Icon size={12} className="text-[#1C2024] shrink-0" />}
            {f.value}
          </span>
        )
      })}
      {hidden.length > 0 && (
        <span
          ref={pillRef}
          className="inline-flex items-center shrink-0 px-2 py-0.5 rounded-[var(--radius-full)] border border-[var(--color-neutral-5)] bg-[var(--color-neutral-1)] text-[var(--color-neutral-9)] text-[11px] font-medium cursor-default leading-none"
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
                <div className="w-2.5 h-2.5 bg-white border border-[#F0F0F3] rotate-45 transform origin-bottom-left translate-x-[3px] translate-y-[2px]" />
              </div>
            </div>
            <div className="bg-white border border-[#F0F0F3] rounded-lg shadow-[0px_1px_8px_rgba(0,0,0,0.25)] px-4 py-3">
              <div className="flex flex-wrap items-center gap-2">
                {hidden.map((f, i) => {
                  const Icon = filterIconMap[f.label]
                  return (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2 h-5 rounded-lg border border-[#E0E1E6] text-[12px] font-medium text-[#1C2024]"
                    >
                      {Icon && <Icon size={12} className="text-[#1C2024] shrink-0" />}
                      {f.value}
                    </span>
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
  const [open, setOpen] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const close = useCallback(() => setOpen(false), [])

  const isCompleted = status === 'Completed'
  const showDownload = isCompleted
  const showCancel = !isCompleted && !isSubRow

  useEffect(() => {
    if (!open || !btnRef.current) return
    const r = btnRef.current.getBoundingClientRect()
    setPos({ top: r.bottom + 4, left: r.right - 160 })
  }, [open])

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        btnRef.current && !btnRef.current.contains(e.target as Node)
      ) close()
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close()
    }
    function handleScroll() { close() }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    window.addEventListener('scroll', handleScroll, true)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
      window.removeEventListener('scroll', handleScroll, true)
    }
  }, [open, close])

  const menuEl = open && mounted ? createPortal(
    <div
      ref={menuRef}
      className="fixed z-[9999] w-[160px] rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] shadow-[var(--shadow-lg)] py-1 dropdown-animate"
      style={{ top: pos.top, left: pos.left }}
      onClick={(e) => e.stopPropagation()}
    >
      {showDownload && (
        <>
          <button
            onClick={() => close()}
            className="flex items-center gap-2.5 w-full px-3 py-1.5 text-[length:var(--font-size-sm)] text-[var(--color-neutral-11)] hover:bg-[var(--color-neutral-3)] transition-colors duration-[var(--duration-fast)] cursor-pointer"
          >
            <Download size={14} className="text-[var(--color-neutral-8)]" />
            Download
          </button>
          <button
            onClick={() => close()}
            className="flex items-center gap-2.5 w-full px-3 py-1.5 text-[length:var(--font-size-sm)] text-[var(--color-neutral-11)] hover:bg-[var(--color-neutral-3)] transition-colors duration-[var(--duration-fast)] cursor-pointer"
          >
            <Link2 size={14} className="text-[var(--color-neutral-8)]" />
            Copy link
          </button>
        </>
      )}
      {showCancel && (
        <>
          {showDownload && <div className="h-px bg-[var(--border-subtle)] mx-2 my-1" />}
          <button
            onClick={() => close()}
            className="flex items-center gap-2.5 w-full px-3 py-1.5 text-[length:var(--font-size-sm)] text-[var(--color-error)] hover:bg-[var(--color-error-light)] transition-colors duration-[var(--duration-fast)] cursor-pointer"
          >
            <X size={14} />
            Cancel export
          </button>
        </>
      )}
    </div>,
    document.body,
  ) : null

  return (
    <>
      <button
        ref={btnRef}
        onClick={(e) => { e.stopPropagation(); setOpen(o => !o) }}
        className="inline-flex items-center justify-center w-7 h-7 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-primary)] text-[var(--color-neutral-8)] hover:bg-[var(--color-neutral-3)] hover:text-[var(--color-neutral-11)] transition-colors duration-[var(--duration-fast)] cursor-pointer"
        aria-label="Actions"
      >
        <MoreHorizontal size={14} />
      </button>
      {menuEl}
    </>
  )
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
                  <TableHead>Type</TableHead>
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

                  const typeLabel = isNotComplete && noSize
                    ? pluralize(row.workOrderCount, 'Work Order')
                    : `${pluralize(row.workOrderCount, 'Work Order')} — ${pluralize(fileCount, 'file')}`

                  return (
                    <Fragment key={row.id}>
                      <TableRow
                        className={`opacity-0 ${isExpandable ? 'cursor-pointer select-none' : ''} ${isExpanded ? 'bg-[var(--color-neutral-2)]' : ''}`}
                        style={{ animation: `fadeInUp 0.35s var(--ease-default) ${0.06 + i * 0.025}s forwards` } as React.CSSProperties}
                        onClick={isExpandable ? () => toggleRow(row.id) : undefined}
                      >
                        <TableCell className="font-medium text-[var(--color-neutral-12)] whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5">
                            {isExpandable && (
                              <span className="inline-flex items-center justify-center w-4 h-4 rounded text-[var(--color-neutral-8)] transition-transform duration-[var(--duration-fast)]">
                                {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                              </span>
                            )}
                            {typeLabel}
                          </span>
                        </TableCell>
                        <TableCell className="w-16"><FormatBadge format={row.format} /></TableCell>
                        <TableCell><FilterTags filters={row.filters} /></TableCell>
                        <TableCell className="whitespace-nowrap">{row.created}</TableCell>
                        <TableCell className={`w-20 text-right whitespace-nowrap ${noSize ? 'text-[var(--color-neutral-7)]' : ''}`}>{row.totalSize}</TableCell>
                        <TableCell><StatusBadge status={row.status} duration={row.duration} progress={row.progress} /></TableCell>
                        <TableCell className="w-12 text-center">
                          <RowActionMenu status={row.status} />
                        </TableCell>
                      </TableRow>

                      {isExpanded && isExpandable && row.subRows!.map((sub, j) => (
                        <TableRow
                          key={sub.id}
                          className="bg-[var(--color-neutral-2)] opacity-0"
                          style={{ animation: `fadeInUp 0.25s var(--ease-default) ${j * 0.04}s forwards` } as React.CSSProperties}
                        >
                          <TableCell className="pl-7 text-[var(--color-neutral-9)] truncate max-w-[280px]" colSpan={3}>{sub.name}</TableCell>
                          <TableCell />
                          <TableCell className="w-20 text-right whitespace-nowrap text-[var(--color-neutral-9)]">{sub.size}</TableCell>
                          <TableCell><StatusBadge status={sub.status} /></TableCell>
                          <TableCell className="w-12 text-center">
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
  )
}
