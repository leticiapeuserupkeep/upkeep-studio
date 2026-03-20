'use client'

import { useState, useRef, useEffect, useMemo, Fragment } from 'react'
import { createPortal } from 'react-dom'
import { Search, ArrowUpDown, ChevronDown, ChevronRight, Download, Link2, X, Check, CircleDot, Flag, MapPin, User, Tag, CheckCircle2, Clock, Loader2 } from 'lucide-react'
import * as Dialog from '@radix-ui/react-dialog'
import type { LucideIcon } from 'lucide-react'
import * as Tooltip from '@radix-ui/react-tooltip'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/app/components/ui/Table'
import { Badge } from '@/app/components/ui/Badge'
import { IconButton } from '@/app/components/ui/IconButton'
import { Button } from '@/app/components/ui/Button'

/* ── Types ── */

type ExportStatus = 'Completed' | 'Exporting' | 'Pending' | 'Expired'

interface FilterTag {
  label: string
  value: string
}

interface WorkOrderItem {
  number: string
  title: string
}

interface ExportSubRow {
  id: string
  name: string
  status: ExportStatus
  size: string
  workOrders?: WorkOrderItem[]
}

interface ExportRow {
  id: string
  workOrderCount: number
  format: string
  status: ExportStatus
  created: string
  completed: string
  expires?: string
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
      { id: 'sub-004a', name: 'Batch A — WO-1301, WO-1302...', status: 'Exporting', size: '—', workOrders: [
        { number: 'WO-1301', title: 'HVAC Filter Replacement – Building A' },
        { number: 'WO-1302', title: 'Conveyor Belt Tension Adjustment' },
        { number: 'WO-1303', title: 'Fire Suppression System Inspection' },
        { number: 'WO-1304', title: 'Loading Dock Door Repair' },
        { number: 'WO-1305', title: 'Electrical Panel Labeling – Zone 3' },
        { number: 'WO-1306', title: 'Roof Leak Repair – Warehouse B' },
        { number: 'WO-1307', title: 'Forklift Battery Replacement' },
        { number: 'WO-1308', title: 'Emergency Lighting Test – Floor 2' },
        { number: 'WO-1309', title: 'Compressed Air Line Leak Fix' },
        { number: 'WO-1310', title: 'Restroom Plumbing Repair – East Wing' },
        { number: 'WO-1311', title: 'Parking Lot Striping' },
        { number: 'WO-1312', title: 'Generator Monthly Service' },
        { number: 'WO-1313', title: 'Boiler Pressure Valve Calibration' },
        { number: 'WO-1314', title: 'Security Camera Replacement – Gate 2' },
        { number: 'WO-1315', title: 'Floor Drain Cleaning – Production' },
      ] },
      { id: 'sub-004b', name: 'Batch B — WO-1316, WO-1317...', status: 'Exporting', size: '—', workOrders: [
        { number: 'WO-1316', title: 'Cooling Tower Chemical Treatment' },
        { number: 'WO-1317', title: 'Overhead Crane Annual Inspection' },
        { number: 'WO-1318', title: 'Paint Booth Exhaust Fan Repair' },
        { number: 'WO-1319', title: 'Pallet Racking Damage Assessment' },
        { number: 'WO-1320', title: 'Water Heater Replacement – Break Room' },
        { number: 'WO-1321', title: 'Elevator Annual Certification' },
        { number: 'WO-1322', title: 'Welding Station Ventilation Check' },
        { number: 'WO-1323', title: 'Landscaping Irrigation Repair' },
        { number: 'WO-1324', title: 'Server Room AC Unit Service' },
        { number: 'WO-1325', title: 'Roll-Up Door Motor Replacement' },
        { number: 'WO-1326', title: 'Dust Collection System Filter Change' },
        { number: 'WO-1327', title: 'Exterior Signage Lighting Fix' },
        { number: 'WO-1328', title: 'ADA Ramp Handrail Repair' },
        { number: 'WO-1329', title: 'Break Room Refrigerator Replacement' },
        { number: 'WO-1330', title: 'Warehouse Epoxy Floor Patch' },
      ] },
      { id: 'sub-004c', name: 'Batch C — WO-1331, WO-1332...', status: 'Pending', size: '—', workOrders: [
        { number: 'WO-1331', title: 'Sprinkler Head Replacement – Office' },
        { number: 'WO-1332', title: 'Compressor Oil Change' },
        { number: 'WO-1333', title: 'Dock Leveler Hydraulic Service' },
        { number: 'WO-1334', title: 'Roof Hatch Lock Repair' },
        { number: 'WO-1335', title: 'Ventilation Duct Cleaning – Lab' },
        { number: 'WO-1336', title: 'Emergency Eye Wash Station Test' },
        { number: 'WO-1337', title: 'Parking Garage Light Replacement' },
        { number: 'WO-1338', title: 'Machine Guard Installation – Line 4' },
        { number: 'WO-1339', title: 'Backflow Preventer Annual Test' },
        { number: 'WO-1340', title: 'Cafeteria Hood Cleaning' },
        { number: 'WO-1341', title: 'Fence Repair – South Perimeter' },
        { number: 'WO-1342', title: 'UPS Battery Bank Replacement' },
        { number: 'WO-1343', title: 'Pneumatic Tool Air Line Repair' },
        { number: 'WO-1344', title: 'Stairwell Handrail Tightening' },
        { number: 'WO-1345', title: 'Loading Bay Bumper Replacement' },
      ] },
    ],
  },
  {
    id: 'exp-005',
    workOrderCount: 171,
    format: 'PDF',
    status: 'Completed',
    created: 'Mar 11, 2:30 PM',
    completed: 'Mar 11, 2:32 PM',
    expires: 'Apr 10, 2026',
    duration: '2h 12m',
    totalSize: '8.3 MB',
    filters: [
      { label: 'Status', value: 'Open' },
      { label: 'Priority', value: 'High' },
      { label: 'Location', value: 'Main Campus' },
      { label: 'Assigned', value: 'Team A' },
    ],
    subRows: [
      { id: 'sub-005a', name: 'Batch A — WO-2001, WO-2002...', status: 'Completed', size: '1.6 MB', workOrders: Array.from({ length: 40 }, (_, i) => ({ number: `WO-${2001 + i}`, title: `Preventive Maintenance Task ${i + 1}` })) },
      { id: 'sub-005b', name: 'Batch B — WO-2041, WO-2042...', status: 'Completed', size: '1.6 MB', workOrders: Array.from({ length: 40 }, (_, i) => ({ number: `WO-${2041 + i}`, title: `Corrective Maintenance Task ${i + 1}` })) },
      { id: 'sub-005c', name: 'Batch C — WO-2081, WO-2082...', status: 'Completed', size: '1.6 MB', workOrders: Array.from({ length: 40 }, (_, i) => ({ number: `WO-${2081 + i}`, title: `Inspection Task ${i + 1}` })) },
      { id: 'sub-005d', name: 'Batch D — WO-2121, WO-2122...', status: 'Completed', size: '1.9 MB', workOrders: Array.from({ length: 40 }, (_, i) => ({ number: `WO-${2121 + i}`, title: `Safety Check Task ${i + 1}` })) },
      { id: 'sub-005e', name: 'Batch E — WO-2161, WO-2162...', status: 'Completed', size: '795.1 KB', workOrders: Array.from({ length: 11 }, (_, i) => ({ number: `WO-${2161 + i}`, title: `Equipment Calibration ${i + 1}` })) },
    ],
  },
  {
    id: 'exp-006',
    workOrderCount: 21,
    format: 'PDF',
    status: 'Completed',
    created: 'Mar 11, 1:36 PM',
    completed: 'Mar 11, 1:37 PM',
    expires: 'Apr 10, 2026',
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
    expires: 'Apr 10, 2026',
    duration: '48m 5s',
    totalSize: '5.2 MB',
    filters: [
      { label: 'Status', value: 'Closed' },
      { label: 'Location', value: 'Plant North' },
      { label: 'Category', value: 'Electrical' },
    ],
    subRows: [
      { id: 'sub-007a', name: 'Batch A — WO-1201, WO-1202...', status: 'Completed', size: '1.8 MB', workOrders: [
        { number: 'WO-1201', title: 'Electrical Panel Inspection' },
        { number: 'WO-1202', title: 'Motor Bearing Replacement' },
        { number: 'WO-1203', title: 'Circuit Breaker Testing' },
        { number: 'WO-1204', title: 'Transformer Oil Analysis' },
        { number: 'WO-1205', title: 'Wiring Harness Replacement' },
        { number: 'WO-1206', title: 'Ground Fault Testing' },
        { number: 'WO-1207', title: 'Conduit Repair – Zone 1' },
        { number: 'WO-1208', title: 'VFD Programming Update' },
        { number: 'WO-1209', title: 'Busbar Tightening' },
        { number: 'WO-1210', title: 'Junction Box Seal Replacement' },
        { number: 'WO-1211', title: 'Cable Tray Inspection' },
        { number: 'WO-1212', title: 'PLC Battery Replacement' },
        { number: 'WO-1213', title: 'Switchgear Cleaning' },
        { number: 'WO-1214', title: 'Arc Flash Label Update' },
        { number: 'WO-1215', title: 'Emergency Disconnect Testing' },
      ] },
      { id: 'sub-007b', name: 'Batch B — WO-1216, WO-1217...', status: 'Completed', size: '1.7 MB', workOrders: [
        { number: 'WO-1216', title: 'Control Panel Rewiring' },
        { number: 'WO-1217', title: 'Outlet Installation – Office 12' },
        { number: 'WO-1218', title: 'Lighting Ballast Replacement' },
        { number: 'WO-1219', title: 'Power Factor Correction' },
        { number: 'WO-1220', title: 'UPS Load Testing' },
        { number: 'WO-1221', title: 'Receptacle GFCI Test' },
        { number: 'WO-1222', title: 'High-Voltage Cable Splice' },
        { number: 'WO-1223', title: 'Photocell Sensor Adjustment' },
        { number: 'WO-1224', title: 'Motor Starter Replacement' },
        { number: 'WO-1225', title: 'Fire Alarm Panel Battery Swap' },
        { number: 'WO-1226', title: 'LED Retrofit – Hallway B' },
        { number: 'WO-1227', title: 'Electrical Meter Calibration' },
        { number: 'WO-1228', title: 'Transfer Switch Exercise' },
        { number: 'WO-1229', title: 'Surge Protector Installation' },
        { number: 'WO-1230', title: 'Panel Schedule Update' },
      ] },
      { id: 'sub-007c', name: 'Batch C — WO-1231, WO-1232...', status: 'Completed', size: '1.7 MB', workOrders: [
        { number: 'WO-1231', title: 'Conduit Expansion Joint Repair' },
        { number: 'WO-1232', title: 'Relay Replacement – Line 5' },
        { number: 'WO-1233', title: 'Thermal Imaging – Switchboard A' },
        { number: 'WO-1234', title: 'Grounding Rod Resistance Test' },
        { number: 'WO-1235', title: 'Capacitor Bank Replacement' },
        { number: 'WO-1236', title: 'Disconnect Switch Replacement' },
        { number: 'WO-1237', title: 'Wire Nut Re-termination' },
        { number: 'WO-1238', title: 'Emergency Generator Load Bank' },
        { number: 'WO-1239', title: 'Power Distribution Unit Service' },
        { number: 'WO-1240', title: 'Exit Sign Battery Replacement' },
        { number: 'WO-1241', title: 'Motor Insulation Resistance Test' },
        { number: 'WO-1242', title: 'Lug Torque Verification' },
        { number: 'WO-1243', title: 'Feeder Cable Megger Test' },
        { number: 'WO-1244', title: 'Lighting Timer Replacement' },
        { number: 'WO-1245', title: 'Neutral-Ground Bond Check' },
      ] },
    ],
  },
  {
    id: 'exp-008',
    workOrderCount: 1,
    format: 'PDF',
    status: 'Completed',
    created: 'Mar 11, 1:24 PM',
    completed: 'Mar 11, 1:25 PM',
    expires: 'Apr 10, 2026',
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
    expires: 'Apr 10, 2026',
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
    expires: 'Apr 10, 2026',
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
    expires: 'Apr 10, 2026',
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
    status: 'Expired',
    created: 'Feb 25, 12:58 PM',
    completed: 'Feb 25, 12:59 PM',
    expires: 'Mar 11, 2026',
    duration: '28s',
    totalSize: '340 KB',
    filters: [{ label: 'Status', value: 'Open' }],
  },
  {
    id: 'exp-013',
    workOrderCount: 1,
    format: 'PDF',
    status: 'Expired',
    created: 'Feb 20, 12:51 PM',
    completed: 'Feb 20, 12:52 PM',
    expires: 'Mar 6, 2026',
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

const statusSeverityMap: Record<ExportStatus, 'success' | 'info' | 'warning' | 'neutral'> = {
  Completed: 'success',
  Exporting: 'info',
  Pending: 'warning',
  Expired: 'neutral',
}

const statusIconMap: Record<ExportStatus, typeof CheckCircle2> = {
  Completed: CheckCircle2,
  Exporting: Loader2,
  Pending: Clock,
  Expired: Clock,
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
      {status === 'Exporting' ? 'In Progress' : status === 'Expired' ? 'Expired' : status}
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

/* ── Sub-row Name with WO count tag ── */

function SubRowName({ name, workOrders }: { name: string; workOrders?: WorkOrderItem[] }) {
  const [open, setOpen] = useState(false)
  const count = workOrders?.length ?? 0

  const displayText = workOrders && workOrders.length > 0
    ? workOrders.map(wo => `${wo.number} ${wo.title}`).join(', ')
    : name

  return (
    <>
      <span className="inline-flex items-center gap-2 w-full min-w-0">
        <span className="truncate flex-1 min-w-0">{displayText}</span>
        {count > 0 && (
          <span
            className="inline-flex items-center shrink-0 px-2 py-0.5 rounded-[var(--radius-full)] border border-[var(--color-neutral-5)] bg-[var(--color-neutral-1)] text-[var(--color-neutral-9)] text-[length:var(--font-size-xs)] font-medium cursor-pointer leading-none hover:bg-[var(--color-neutral-3)] transition-colors duration-[var(--duration-fast)]"
            onClick={(e: React.MouseEvent) => { e.stopPropagation(); setOpen(true) }}
          >
            +{count}
          </span>
        )}
      </span>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
          <Dialog.Content
            className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[520px] max-h-[70vh] flex flex-col bg-[var(--surface-primary)] rounded-[var(--radius-xl)] shadow-[var(--shadow-xl)] border border-[var(--border-default)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-subtle)]">
              <Dialog.Title className="text-[length:var(--font-size-md)] font-semibold text-[var(--color-neutral-12)]">
                Work Orders ({count})
              </Dialog.Title>
              <Dialog.Close asChild>
                <IconButton variant="ghost" size="sm" label="Close">
                  <X size={16} />
                </IconButton>
              </Dialog.Close>
            </div>
            <div className="flex-1 overflow-y-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border-default)]">
                    <th className="text-left text-[length:var(--font-size-xs)] font-semibold text-[var(--color-neutral-8)] uppercase tracking-wider py-2.5 px-5">WO #</th>
                    <th className="text-left text-[length:var(--font-size-xs)] font-semibold text-[var(--color-neutral-8)] uppercase tracking-wider py-2.5 px-5">Title</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {workOrders?.map((wo) => (
                    <tr key={wo.number} className="hover:bg-[var(--color-neutral-2)] transition-colors duration-[var(--duration-fast)]">
                      <td className="py-2.5 px-5 text-[length:var(--font-size-sm)] font-medium text-[var(--color-accent-9)] whitespace-nowrap">{wo.number}</td>
                      <td className="py-2.5 px-5 text-[length:var(--font-size-sm)] text-[var(--color-neutral-11)]">{wo.title}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end px-5 py-3 border-t border-[var(--border-subtle)]">
              <Dialog.Close asChild>
                <Button variant="primary" size="md">Close</Button>
              </Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}

/* ── Row Action Menu (portal-based) ── */

function RowActionMenu({ status, isSubRow }: { status: ExportStatus; isSubRow?: boolean }) {
  const [copied, setCopied] = useState(false)
  const isCompleted = status === 'Completed'
  const isExpired = status === 'Expired'
  const showCancel = !isCompleted && !isExpired && !isSubRow

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (isExpired) {
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
        <IconButton
          variant="secondary"
          size="sm"
          label="Download PDF"
          disabled
          onClick={(e) => e.stopPropagation()}
        >
          <Download size={14} />
        </IconButton>
      </div>
    )
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
      <button
        onClick={(e) => e.stopPropagation()}
        className="inline-flex items-center justify-center h-7 px-3 rounded-[var(--radius-md)] border border-[var(--border-default)] text-[length:var(--font-size-sm)] font-medium text-[var(--color-error)] bg-[var(--surface-primary)] hover:bg-[var(--color-neutral-2)] transition-colors duration-[var(--duration-fast)] cursor-pointer whitespace-nowrap"
      >
        Cancel
      </button>
    )
  }

  return null
}

/* ── Main Page ── */

export default function ExportsPage() {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [hideExpired, setHideExpired] = useState(true)
  const [toolbarPortal, setToolbarPortal] = useState<HTMLElement | null>(null)

  useEffect(() => {
    setToolbarPortal(document.getElementById('page-toolbar-portal'))
  }, [])

  function toggleRow(id: string) {
    setExpandedRows(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toolbarBar = (
    <div className="flex justify-center w-full bg-white border-y border-[var(--border-default)]">
      <div className="flex items-center justify-between px-6 py-2 w-full">
        <span className="text-[length:var(--font-size-base)] font-semibold text-[var(--color-neutral-12)]">
          {hideExpired ? mockExports.filter(r => r.status !== 'Expired').length : mockExports.length} Exports
        </span>
        <div className="flex items-center gap-[var(--space-sm)]">
          <button className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[length:var(--font-size-sm)] font-medium text-[var(--color-neutral-9)] hover:bg-[var(--color-neutral-3)] rounded-[var(--radius-md)] transition-colors duration-[var(--duration-fast)] cursor-pointer">
            <ArrowUpDown size={14} />
            Sort
          </button>
          <button
            onClick={() => setHideExpired(v => !v)}
            className="inline-flex items-center gap-2 px-2.5 py-1 text-[length:var(--font-size-sm)] font-medium text-[var(--color-neutral-9)] hover:bg-[var(--color-neutral-3)] rounded-[var(--radius-md)] transition-colors duration-[var(--duration-fast)] cursor-pointer"
          >
            <span
              className={`relative inline-flex h-[18px] w-[32px] shrink-0 items-center rounded-full transition-colors duration-200 ${
                hideExpired ? 'bg-[var(--color-accent-9)]' : 'bg-[var(--color-neutral-5)]'
              }`}
            >
              <span
                className={`inline-block h-[14px] w-[14px] rounded-full bg-white shadow-sm transition-transform duration-200 ${
                  hideExpired ? 'translate-x-[16px]' : 'translate-x-[2px]'
                }`}
              />
            </span>
            Hide Expired
          </button>
          <div className="flex items-center gap-[var(--space-xs)] px-3 py-1.5 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)]">
            <Search size={14} className="text-[var(--color-neutral-7)] shrink-0" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-[120px] text-[length:var(--font-size-sm)] bg-transparent outline-none text-[var(--color-neutral-11)] placeholder:text-[var(--color-neutral-7)]"
            />
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <Tooltip.Provider delayDuration={300}>
    {toolbarPortal && createPortal(toolbarBar, toolbarPortal)}
    <div className="flex flex-col flex-1 w-full">
      <main className="flex-1 overflow-y-auto">
        <div className="w-full px-[var(--space-2xl)] py-[var(--space-xl)]">
          <div
            className="bg-[var(--surface-primary)] rounded-[var(--widget-radius)] border border-[var(--widget-border)] overflow-hidden opacity-0"
            style={{ animation: 'fadeInUp 0.4s var(--ease-default) 0.05s forwards' }}
          >
            <Table>
              <TableHeader>
                <tr>
                  <TableHead className="w-10 !px-0" />
                  <TableHead className="!pl-2">Items</TableHead>
                  <TableHead className="w-16">Format</TableHead>
                  <TableHead>Filters</TableHead>
                  <TableHead className="w-20 text-right">Size</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12" />
                </tr>
              </TableHeader>
              <TableBody>
                {mockExports.filter(row => !(hideExpired && row.status === 'Expired')).map((row, i) => {
                  const isExpanded = expandedRows.has(row.id)
                  const fileCount = row.subRows?.length || 1
                  const isExpandable = fileCount > 1
                  const isExpired = row.status === 'Expired'
                  const isNotComplete = row.status !== 'Completed' && !isExpired
                  const noSize = row.totalSize === '—'

                  const showFileCount = !(isNotComplete && noSize) && !(fileCount === 1 && row.workOrderCount === 1)

                  return (
                    <Fragment key={row.id}>
                      <TableRow
                        className={`opacity-0 ${isExpandable ? 'cursor-pointer select-none' : ''} ${isExpanded ? 'bg-[var(--color-neutral-2)]' : ''} ${isExpired ? '[&_td]:!text-[var(--color-neutral-6)] [&_td_span]:opacity-50 [&_td_button]:opacity-50' : ''}`}
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
                            {row.workOrderCount} Items
                            {showFileCount && (
                              <Badge severity="neutral" variant="subtle">
                                {pluralize(fileCount, 'file')}
                              </Badge>
                            )}
                          </span>
                        </TableCell>
                        <TableCell className="w-16"><FormatBadge format={row.format} /></TableCell>
                        <TableCell><FilterTags filters={row.filters} /></TableCell>
                        <TableCell className={`w-20 text-right whitespace-nowrap ${noSize ? 'text-[var(--color-neutral-7)]' : ''}`}>{row.totalSize}</TableCell>
                        <TableCell className="whitespace-nowrap">{row.created}</TableCell>
                        <TableCell className="whitespace-nowrap">{row.expires || '—'}</TableCell>
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
                          <TableCell className="text-[var(--color-neutral-9)] max-w-0" colSpan={3}>
                            <SubRowName name={sub.name} workOrders={sub.workOrders} />
                          </TableCell>
                          <TableCell className="w-20 text-right whitespace-nowrap text-[var(--color-neutral-9)]">{sub.size}</TableCell>
                          <TableCell />
                          <TableCell />
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
