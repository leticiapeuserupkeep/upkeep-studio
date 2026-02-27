'use client'

import { useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  Clock, Wifi, WifiOff, AlertTriangle,
  TrendingUp, TrendingDown, Minus, Timer, Activity, BarChart3,
  ClipboardList, Plus, Share2, XCircle, Calendar, ChevronDown,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardBody } from '@/app/components/ui/Card'
import { Badge } from '@/app/components/ui/Badge'
import { Button } from '@/app/components/ui/Button'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/app/components/ui/Table'
import { RuntimeBarChart } from '@/app/components/edge/RuntimeBarChart'
import { runtimeSensors } from '@/app/lib/edge-data'
import type { RuntimeSensor, DailyRuntime } from '@/app/lib/models'

const statusConfig = {
  connected: { label: 'Connected', severity: 'success' as const, icon: Wifi },
  disconnected: { label: 'Disconnected', severity: 'neutral' as const, icon: WifiOff },
  warning: { label: 'Overloaded', severity: 'danger' as const, icon: AlertTriangle },
}

const urgencyColors = {
  critical: 'danger' as const,
  high: 'warning' as const,
  medium: 'info' as const,
  low: 'neutral' as const,
}

const woStatusLabels = {
  open: 'Open',
  in_progress: 'In Progress',
  on_hold: 'On Hold',
  completed: 'Completed',
}

const woStatusSeverity = {
  open: 'danger' as const,
  in_progress: 'warning' as const,
  on_hold: 'neutral' as const,
  completed: 'success' as const,
}

function getDeltaPercent(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 1000) / 10
}

type RangePreset = '7d' | '14d' | '30d' | 'custom'

const rangePresets: { key: RangePreset; label: string; days: number }[] = [
  { key: '7d', label: 'Past 7 Days', days: 7 },
  { key: '14d', label: 'Past 14 Days', days: 14 },
  { key: '30d', label: 'Past 30 Days', days: 30 },
]

function getDefaultRange() {
  const to = new Date('2026-02-26')
  const from = new Date(to)
  from.setDate(from.getDate() - 29)
  return { from: from.toISOString().split('T')[0], to: to.toISOString().split('T')[0] }
}

export default function RuntimeDetailPage() {
  const params = useParams()
  const sensorId = params.sensorId as string
  const [rangePreset, setRangePreset] = useState<RangePreset>('30d')
  const [customFrom, setCustomFrom] = useState(getDefaultRange().from)
  const [customTo, setCustomTo] = useState(getDefaultRange().to)
  const [showRangePicker, setShowRangePicker] = useState(false)

  const sensor = runtimeSensors.find((s) => s.id === sensorId)

  const chartData = useMemo(() => {
    if (!sensor) return []
    if (rangePreset === 'custom') {
      return sensor.dailyRuntime.filter((d) => d.date >= customFrom && d.date <= customTo)
    }
    const days = rangePresets.find((p) => p.key === rangePreset)?.days ?? 30
    return sensor.dailyRuntime.slice(-days)
  }, [sensor, rangePreset, customFrom, customTo])

  function getRangeLabel() {
    if (rangePreset === 'custom') {
      const f = new Date(customFrom + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      const t = new Date(customTo + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      return `${f} - ${t}`
    }
    return rangePresets.find((p) => p.key === rangePreset)?.label ?? ''
  }

  function selectPreset(key: RangePreset) {
    setRangePreset(key)
    setShowRangePicker(false)
  }

  function applyCustomRange() {
    setRangePreset('custom')
    setShowRangePicker(false)
  }

  if (!sensor) {
    return (
      <div className="flex flex-col items-center justify-center py-[var(--space-5xl)]">
        <h2 className="text-[length:var(--font-size-lg)] font-semibold text-[var(--color-neutral-11)]">
          Sensor not found
        </h2>
        <Link href="/edge/runtime" className="mt-3 text-[length:var(--font-size-sm)] text-[var(--color-accent-9)] hover:underline">
          Back to Runtime
        </Link>
      </div>
    )
  }

  const delta = getDeltaPercent(sensor.totalHours, sensor.previousPeriodHours)
  const statusInfo = statusConfig[sensor.status]

  const chartMin = chartData.length > 0
    ? Math.min(...chartData.map((d) => d.hours))
    : 0

  return (
    <div className="flex flex-col gap-[var(--space-xl)] p-[var(--space-xl)] max-w-[1240px]">
      {/* Header */}
      <div className="flex items-start justify-between gap-[var(--space-lg)]">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-[var(--space-sm)] mb-1">
            {/* back arrow moved to TopBar */}
            <h1 className="text-[length:var(--font-size-xl)] font-bold text-[var(--color-neutral-12)] truncate">
              {sensor.name}
            </h1>
            <Badge severity={statusInfo.severity} dot>
              {statusInfo.label}
            </Badge>
          </div>
          <div className="hidden">
          </div>
        </div>
        <div className="flex items-center gap-[var(--space-sm)]">
          {/* Date range picker */}
          <div className="relative">
            <button
              onClick={() => setShowRangePicker((v) => !v)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] text-[length:var(--font-size-sm)] font-medium text-[var(--color-neutral-11)] hover:bg-[var(--color-neutral-3)] cursor-pointer transition-colors"
            >
              <Calendar size={14} className="text-[var(--color-neutral-7)]" />
              {getRangeLabel()}
              <ChevronDown size={14} className="text-[var(--color-neutral-7)]" />
            </button>

            {showRangePicker && (
              <>
                <div className="fixed inset-0 z-[var(--z-dropdown)]" onClick={() => setShowRangePicker(false)} />
                <div className="absolute right-0 top-full mt-1 z-[var(--z-modal)] w-[280px] rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-primary)] shadow-[var(--shadow-lg)] p-[var(--space-sm)]">
                  {/* Presets */}
                  <div className="flex flex-col gap-0.5 mb-[var(--space-sm)]">
                    {rangePresets.map((p) => (
                      <button
                        key={p.key}
                        onClick={() => selectPreset(p.key)}
                        className={`text-left px-[var(--space-sm)] py-[var(--space-xs)] rounded-[var(--radius-md)] text-[length:var(--font-size-sm)] font-medium cursor-pointer transition-colors ${
                          rangePreset === p.key
                            ? 'bg-[var(--color-accent-1)] text-[var(--color-accent-9)]'
                            : 'text-[var(--color-neutral-11)] hover:bg-[var(--color-neutral-3)]'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>

                  {/* Separator */}
                  <div className="h-px bg-[var(--border-subtle)] my-[var(--space-xs)]" />

                  {/* Custom range */}
                  <div className="px-[var(--space-sm)]">
                    <span className="text-[length:var(--font-size-xs)] font-semibold uppercase tracking-[0.04em] text-[var(--color-neutral-8)]">
                      Custom Range
                    </span>
                    <div className="flex items-center gap-[var(--space-xs)] mt-[var(--space-xs)]">
                      <input
                        type="date"
                        value={customFrom}
                        onChange={(e) => setCustomFrom(e.target.value)}
                        className="flex-1 px-2 py-1.5 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-primary)] text-[length:var(--font-size-sm)] text-[var(--color-neutral-11)] outline-none"
                      />
                      <span className="text-[length:var(--font-size-xs)] text-[var(--color-neutral-7)]">to</span>
                      <input
                        type="date"
                        value={customTo}
                        onChange={(e) => setCustomTo(e.target.value)}
                        className="flex-1 px-2 py-1.5 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-primary)] text-[length:var(--font-size-sm)] text-[var(--color-neutral-11)] outline-none"
                      />
                    </div>
                    <Button variant="primary" size="sm" className="w-full mt-[var(--space-sm)]" onClick={applyCustomRange}>
                      Apply
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>

          <Button variant="secondary" size="sm">
            <Share2 size={14} />
            Share
          </Button>
        </div>
      </div>

      {/* Summary KPIs */}
      {(() => {
        const days = chartData.length || 30
        const maxPossibleHours = days * 24
        const downtimeHours = Math.round((maxPossibleHours - sensor.totalHours) * 10) / 10
        const prevDowntime = Math.round((maxPossibleHours - sensor.previousPeriodHours) * 10) / 10
        const downtimeDelta = getDeltaPercent(downtimeHours, prevDowntime)
        const dailyAvgDelta = getDeltaPercent(
          sensor.avgDailyHours,
          sensor.previousPeriodHours > 0 ? Math.round((sensor.previousPeriodHours / days) * 10) / 10 : 0
        )

        return (
          <div className="grid gap-[var(--space-md)]" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr' }}>
            {/* Runtime — hero card */}
            <div className="flex items-center justify-between rounded-[var(--radius-xl)] bg-[var(--color-accent-9)] p-[var(--space-lg)] text-white">
              <div className="flex flex-col gap-1">
                <span className="text-[length:var(--font-size-sm)] font-medium opacity-80">Runtime</span>
                <span className="text-[length:var(--font-size-3xl)] font-bold leading-none">
                  {Math.round(sensor.totalHours)} h
                </span>
                <DeltaLabel delta={delta} light />
              </div>
              <UptimeRing percent={sensor.uptimePercent} />
            </div>

            {/* Downtime Hours */}
            <div className="flex flex-col gap-1 rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-[var(--space-lg)]">
              <div className="flex items-center gap-2 mb-1">
                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-[var(--color-error-light)]">
                  <XCircle size={14} className="text-[var(--color-error)]" />
                </div>
                <span className="text-[length:var(--font-size-sm)] font-medium text-[var(--color-neutral-8)]">Downtime Hours</span>
              </div>
              <span className="text-[length:var(--font-size-2xl)] font-bold text-[#0044cc] leading-none">
                {downtimeHours} h
              </span>
              <DeltaLabel delta={downtimeDelta} invert />
            </div>

            {/* Daily Average */}
            <div className="flex flex-col gap-1 rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-[var(--space-lg)]">
              <div className="flex items-center gap-2 mb-1">
                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-[var(--color-accent-1)]">
                  <BarChart3 size={14} className="text-[var(--color-accent-9)]" />
                </div>
                <span className="text-[length:var(--font-size-sm)] font-medium text-[var(--color-neutral-8)]">Daily Average</span>
              </div>
              <span className="text-[length:var(--font-size-2xl)] font-bold text-[var(--color-neutral-12)] leading-none">
                {sensor.avgDailyHours.toFixed(1)} h
              </span>
              <DeltaLabel delta={dailyAvgDelta} />
            </div>

            {/* Peak + Minimum stacked */}
            <div className="flex flex-col gap-[var(--space-sm)]">
              <div className="flex items-center gap-[var(--space-sm)] flex-1 rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-primary)] px-[var(--space-md)] py-[var(--space-sm)]">
                <TrendingUp size={16} className="text-[var(--color-error)] shrink-0" />
                <span className="text-[length:var(--font-size-sm)] text-[var(--color-neutral-8)] font-medium">Peak day</span>
                <span className="text-[length:var(--font-size-base)] font-bold text-[var(--color-error)] ml-auto">{sensor.peakDay.hours} h</span>
              </div>
              <div className="flex items-center gap-[var(--space-sm)] flex-1 rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-primary)] px-[var(--space-md)] py-[var(--space-sm)]">
                <Minus size={16} className="text-[var(--color-neutral-7)] shrink-0" />
                <span className="text-[length:var(--font-size-sm)] text-[var(--color-neutral-8)] font-medium">Minimum</span>
                <span className="text-[length:var(--font-size-base)] font-bold text-[var(--color-neutral-12)] ml-auto">{chartMin} h</span>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Main Content: 2-column layout */}
      <div className="grid grid-cols-3 gap-[var(--space-lg)]">
        {/* Left column (2 cols) */}
        <div className="col-span-2 flex flex-col gap-[var(--space-lg)]">
          {/* Daily Runtime Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Runtime</CardTitle>
              <p className="text-[length:var(--font-size-sm)] text-[var(--color-neutral-8)]">
                Hours of operation per day
              </p>
            </CardHeader>
            <CardBody>
              <RuntimeBarChart data={chartData} height={280} />
            </CardBody>
          </Card>

          {/* Meter */}
          <MeterCard sensor={sensor} chartData={chartData} />
        </div>

        {/* Right column (1 col) */}
        <div className="flex flex-col gap-[var(--space-lg)]">
          {/* Sensor Details */}
          <Card>
            <CardHeader>
              <CardTitle>Sensor Details</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="flex flex-col gap-[var(--space-xs)]">
                <DetailRow label="Sensor ID" value={sensor.id} />
                <DetailRow label="Asset ID" value={sensor.assetId} />
                <DetailRow label="Gateway" value={sensor.gatewayName} />
                <DetailRow label="Type" value={sensor.type} />
                <DetailRow label="Location" value={sensor.locationName} />
                <DetailRow label="Last Reading" value={sensor.lastReading} />
              </div>
            </CardBody>
          </Card>

          {/* Work Orders */}
          <Card>
            <CardHeader
              action={
                <Button variant="primary" size="sm">
                  <Plus size={14} />
                  Create Work Order
                </Button>
              }
            >
              <CardTitle>Work Orders</CardTitle>
              <p className="text-[length:var(--font-size-sm)] text-[var(--color-neutral-8)]">
                Linked to this sensor
              </p>
            </CardHeader>
            <CardBody className="!pt-0">
              {sensor.workOrders.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sensor.workOrders.map((wo) => (
                      <TableRow key={wo.id} className="cursor-pointer">
                        <TableCell>
                          <span className="font-medium text-[var(--color-accent-9)]">{wo.id}</span>
                        </TableCell>
                        <TableCell>
                          <span className="truncate block max-w-[140px]">{wo.title}</span>
                        </TableCell>
                        <TableCell>
                          <Badge severity={woStatusSeverity[wo.status]}>{woStatusLabels[wo.status]}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center py-[var(--space-xl)] text-center">
                  <ClipboardList size={32} className="text-[var(--color-neutral-5)] mb-2" />
                  <p className="text-[length:var(--font-size-sm)] text-[var(--color-neutral-8)]">
                    No work orders linked
                  </p>
                  <Button variant="secondary" size="sm" className="mt-3">
                    <Plus size={14} />
                    Create Work Order
                  </Button>
                </div>
              )}
            </CardBody>
          </Card>

        </div>
      </div>
    </div>
  )
}

function MeterCard({ sensor, chartData }: { sensor: RuntimeSensor; chartData: DailyRuntime[] }) {
  const meterName = `${sensor.assetName} Runtime`
  const currentValue = sensor.meter.currentReading
  const unit = sensor.meter.unit

  const last7 = chartData.slice(-7)
  const maxH = Math.max(...last7.map((d) => d.hours), 1)

  return (
    <Card>
      <div className="px-[var(--space-lg)] pt-[var(--space-lg)] pb-[var(--space-sm)]">
        {/* Top row: label + last reading */}
        <div className="flex items-center justify-between mb-[var(--space-sm)]">
          <span className="text-[length:var(--font-size-xs)] font-semibold uppercase tracking-[0.04em] text-[var(--color-neutral-8)]">
            Meter
          </span>
          <span className="text-[length:var(--font-size-sm)] text-[var(--color-neutral-7)]">
            Last reading: {sensor.lastReading}
          </span>
        </div>

        {/* Name + current value */}
        <div className="flex items-end justify-between pt-[15px] pb-[20px] mt-[20px] mb-[20px]">
          <h3 className="text-[length:var(--font-size-lg)] font-bold text-[var(--color-neutral-12)]">
            {meterName}
          </h3>
          <div className="text-right">
            <span className="text-[length:var(--font-size-2xl)] font-bold text-[var(--color-error)] leading-none">
              {currentValue.toLocaleString()}
            </span>
            <span className="text-[length:var(--font-size-base)] text-[var(--color-error)] ml-1 font-medium">
              {unit}
            </span>
          </div>
        </div>

        {/* Line chart — last 7 data points */}
        <MeterLineChart data={last7} />
      </div>

      <div className="pb-[var(--space-md)]" />
    </Card>
  )
}

function MeterLineChart({ data }: { data: DailyRuntime[] }) {
  if (data.length < 2) return null

  const values = data.map((d) => d.hours)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1

  const w = 600
  const h = 120
  const padX = 8
  const padY = 12
  const chartW = w - padX * 2
  const chartH = h - padY * 2

  const yTickCount = 4
  const niceMin = Math.floor(min / 5) * 5
  const niceMax = Math.ceil(max / 5) * 5
  const niceRange = niceMax - niceMin || 1
  const yTicks = Array.from({ length: yTickCount + 1 }, (_, i) => Math.round(niceMin + (niceRange / yTickCount) * i))

  const points = values.map((v, i) => {
    const x = padX + (i / (values.length - 1)) * chartW
    const y = padY + chartH - ((v - niceMin) / niceRange) * chartH
    return { x, y }
  })

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] px-[var(--space-md)] py-[29px]">
      <svg viewBox={`0 0 ${w} ${h + 28}`} width="100%" className="block">
        {/* Grid lines + Y labels */}
        {yTicks.map((tick) => {
          const y = padY + chartH - ((tick - niceMin) / niceRange) * chartH
          return (
            <g key={tick}>
              <line x1={padX} y1={y} x2={w - padX} y2={y} stroke="var(--color-neutral-3)" strokeWidth={1} />
              <text
                x={padX + 2}
                y={y - 4}
                fill="var(--color-neutral-7)"
                fontSize={11}
                fontFamily="var(--font-family-base)"
              >
                {tick}
              </text>
            </g>
          )
        })}

        {/* Line */}
        <path d={pathD} fill="none" stroke="var(--color-accent-7)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

        {/* X-axis labels */}
        {data.map((day, i) => {
          const x = padX + (i / (data.length - 1)) * chartW
          const dt = new Date(day.date + 'T00:00:00')
          const label = dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          return (
            <text
              key={day.date}
              x={x}
              y={h + 18}
              fill="var(--color-neutral-7)"
              fontSize={11}
              fontFamily="var(--font-family-base)"
              textAnchor="middle"
            >
              {label}
            </text>
          )
        })}
      </svg>
    </div>
  )
}

function UptimeRing({ percent }: { percent: number }) {
  const size = 72
  const stroke = 6
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percent / 100) * circumference

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="white"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700"
        />
      </svg>
      <span className="absolute text-[length:var(--font-size-sm)] font-bold text-white">
        {Math.round(percent)}%
      </span>
    </div>
  )
}

function DeltaLabel({ delta, light = false, invert = false }: { delta: number; light?: boolean; invert?: boolean }) {
  const isPositive = invert ? delta < 0 : delta > 0
  const isNegative = invert ? delta > 0 : delta < 0

  return (
    <div className="flex items-center gap-1 mt-0.5">
      {delta > 0 ? (
        <TrendingUp size={11} className={light ? 'opacity-80' : isPositive ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'} />
      ) : delta < 0 ? (
        <TrendingDown size={11} className={light ? 'opacity-80' : isNegative ? 'text-[var(--color-error)]' : 'text-[var(--color-success)]'} />
      ) : (
        <Minus size={11} className={light ? 'opacity-60' : 'text-[var(--color-neutral-7)]'} />
      )}
      <span
        className={`text-[length:var(--font-size-xs)] font-medium ${
          light
            ? 'opacity-80'
            : isPositive
              ? 'text-[var(--color-success)]'
              : isNegative
                ? 'text-[var(--color-error)]'
                : 'text-[var(--color-neutral-7)]'
        }`}
      >
        {delta > 0 ? '+' : ''}{delta}%
        <span className={light ? 'opacity-70' : 'text-[var(--color-neutral-7)]'}> vs prev period</span>
      </span>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-[var(--space-xs)] border-b border-[var(--border-subtle)] last:border-0">
      <span className="text-[length:var(--font-size-sm)] text-[var(--color-neutral-8)]">{label}</span>
      <span className="text-[length:var(--font-size-sm)] font-medium text-[var(--color-neutral-11)]">{value}</span>
    </div>
  )
}

function formatShortDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}
