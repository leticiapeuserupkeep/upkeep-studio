'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  Clock, Wifi, WifiOff, AlertTriangle,
  TrendingUp, TrendingDown, Minus, Timer, BarChart3,
  ClipboardList, Plus, Download, XCircle, Calendar, ChevronDown, Zap, Trash2,
  MousePointerClick,
} from 'lucide-react'
import * as Switch from '@radix-ui/react-switch'
import { Card, CardHeader, CardTitle, CardBody } from '@/app/components/ui/Card'
import { Badge } from '@/app/components/ui/Badge'
import { Button } from '@/app/components/ui/Button'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/app/components/ui/Table'
import { RuntimeBarChart } from '@/app/components/edge/RuntimeBarChart'
import { MeterConfigModal } from '@/app/components/edge/MeterConfigModal'
import { SyncMeterModal } from '@/app/components/edge/SyncMeterModal'
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

const RESET_DURATION = 1800

function useAnimatedValue(target: number, duration: number, trigger: boolean) {
  const [value, setValue] = useState(target)
  const rafRef = useRef<number>(0)
  const startRef = useRef<{ from: number; start: number } | null>(null)

  useEffect(() => {
    if (!trigger) { setValue(target); return }
    const from = target
    startRef.current = { from, start: performance.now() }

    const tick = (now: number) => {
      if (!startRef.current) return
      const elapsed = now - startRef.current.start
      const t = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setValue(startRef.current.from * (1 - eased))
      if (t < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [trigger, duration, target])

  return value
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
  const [showMeterModal, setShowMeterModal] = useState(false)
  const [showSyncMeterModal, setShowSyncMeterModal] = useState(false)
  const [meterDeleted, setMeterDeleted] = useState(false)
  const [meterSyncOn, setMeterSyncOn] = useState(true)
  const [selectedDay, setSelectedDay] = useState<DailyRuntime | null>(null)
  const [showChartHint, setShowChartHint] = useState(true)
  const [isReset, setIsReset] = useState(false)

  useEffect(() => {
    const handler = () => setShowMeterModal(true)
    window.addEventListener('open-edit-runtime', handler)
    return () => window.removeEventListener('open-edit-runtime', handler)
  }, [])

  

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
    setSelectedDay(null)
  }

  function applyCustomRange() {
    setRangePreset('custom')
    setShowRangePicker(false)
    setSelectedDay(null)
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

  const displayTotalHours = useAnimatedValue(sensor.totalHours, RESET_DURATION, isReset)
  const displayUptimePercent = useAnimatedValue(sensor.uptimePercent, RESET_DURATION, isReset)
  const displayAvgDailyHours = useAnimatedValue(sensor.avgDailyHours, RESET_DURATION, isReset)
  const displayPreviousPeriodHours = useAnimatedValue(sensor.previousPeriodHours, RESET_DURATION, isReset)
  const rawDelta = getDeltaPercent(sensor.totalHours, sensor.previousPeriodHours)
  const delta = useAnimatedValue(rawDelta, RESET_DURATION, isReset)
  const statusInfo = statusConfig[sensor.status]

  const chartMin = chartData.length > 0
    ? Math.min(...chartData.map((d) => d.hours))
    : 0

  return (
    <div className="flex flex-col gap-[var(--space-xl)] p-[var(--space-xl)] max-w-[1240px] mx-auto w-full">
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
          <Button variant="secondary" size="sm">
            <Download size={14} />
            Export
          </Button>
          {/* Date range picker */}
          <div className="relative">
            <button
              onClick={() => setShowRangePicker((v) => !v)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] text-[length:var(--font-size-sm)] font-medium text-[var(--color-neutral-11)] hover:bg-[var(--color-neutral-3)] cursor-pointer transition-colors duration-[var(--duration-fast)]"
            >
              <Calendar size={14} className="text-[var(--color-neutral-7)]" />
              {getRangeLabel()}
              <ChevronDown size={14} className="text-[var(--color-neutral-7)]" />
            </button>

            {showRangePicker && (
              <>
                <div className="fixed inset-0 z-[var(--z-dropdown)]" onClick={() => setShowRangePicker(false)} />
                <div className="absolute right-0 top-full mt-1 z-[var(--z-modal)] min-w-[200px] rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-primary)] shadow-[var(--shadow-lg)] p-[var(--space-sm)] pb-4 dropdown-animate">
                  {/* Presets */}
                  <div className="flex flex-col gap-0.5 mb-[var(--space-sm)]">
                    {rangePresets.map((p) => (
                      <button
                        key={p.key}
                        onClick={() => selectPreset(p.key)}
                        className={`text-left px-[var(--space-sm)] py-[var(--space-xs)] rounded-[var(--radius-md)] text-[length:var(--font-size-sm)] font-medium cursor-pointer transition-colors duration-[var(--duration-fast)] whitespace-nowrap ${
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
                  <div className="px-[var(--space-sm)] pt-[var(--space-sm)]">
                    <span className="text-[length:var(--font-size-xs)] font-semibold uppercase tracking-[0.04em] text-[var(--color-neutral-8)]">
                      Custom Range
                    </span>
                    <div className="flex items-center gap-[var(--space-xs)] mt-[var(--space-xs)] py-3">
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

        </div>
      </div>

      {/* Summary KPIs */}
      {(() => {
        const days = chartData.length || 30
        const maxPossibleHours = days * 24
        const downtimeHours = isReset ? 0 : Math.round((maxPossibleHours - displayTotalHours) * 10) / 10
        const prevDowntime = Math.round((maxPossibleHours - displayPreviousPeriodHours) * 10) / 10
        const downtimeDelta = isReset ? 0 : getDeltaPercent(downtimeHours, prevDowntime)
        const dailyAvgDelta = isReset ? 0 : getDeltaPercent(
          displayAvgDailyHours,
          displayPreviousPeriodHours > 0 ? Math.round((displayPreviousPeriodHours / days) * 10) / 10 : 0
        )

        return (
          <div className="grid grid-cols-3 gap-[var(--space-md)]">
            {/* Runtime — hero card */}
            <div className="flex items-center justify-between rounded-[20px] bg-[var(--color-accent-9)] p-[var(--space-lg)] text-white">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-[56px] h-[56px] shrink-0 rounded-[16px] border border-white/20">
                  <Timer size={20} className="text-white" />
                </div>
                <div className="flex flex-col gap-1">
                <span className="text-[length:11px] font-semibold opacity-80 uppercase">Runtime</span>
                <span className="text-[length:var(--font-size-3xl)] font-bold leading-none">
                  {Math.round(displayTotalHours)} h
                </span>
                <DeltaLabel delta={delta} light />
                </div>
              </div>
              <UptimeRing percent={displayUptimePercent} />
            </div>

            {/* Downtime Hours */}
            <div className="flex items-center justify-between rounded-[20px] bg-[var(--color-error-light)] border border-[#FECDD3] px-5 py-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex items-center justify-center w-[56px] h-[56px] shrink-0 rounded-[16px] border border-[var(--color-error-border)]">
                  <XCircle size={20} className="text-[#E03131]" />
                </div>
                <div className="flex flex-col min-w-0 max-w-[80px]">
                  <span className="text-[length:11px] font-semibold uppercase tracking-[0.06em] text-[var(--color-neutral-11)]">Downtime Hours</span>
                </div>
              </div>
              <div className="shrink-0 flex flex-col items-center">
                <span className="text-[length:var(--font-size-3xl)] font-bold text-[var(--color-neutral-12)] leading-none">{downtimeHours}</span>
                <span className="text-[length:var(--font-size-sm)] font-medium text-[var(--color-neutral-7)] mt-1">Hours</span>
              </div>
            </div>

            {/* Daily Average */}
            <div className="flex items-center justify-between rounded-[20px] bg-[var(--color-accent-1)] border border-[#D6DEFF] px-5 py-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex items-center justify-center w-[56px] h-[56px] shrink-0 rounded-[16px] border border-[var(--color-accent-3)]">
                  <BarChart3 size={20} className="text-[#5B6AD0]" />
                </div>
                <div className="flex flex-col min-w-0 max-w-[80px]">
                  <span className="text-[length:11px] font-semibold uppercase tracking-[0.06em] text-[var(--color-neutral-11)]">Daily Average</span>
                </div>
              </div>
              <div className="shrink-0 flex flex-col items-center">
                <span className="text-[length:var(--font-size-3xl)] font-bold text-[#1C2024] leading-none">{displayAvgDailyHours.toFixed(1)}</span>
                <span className="text-[length:var(--font-size-sm)] font-medium text-[#60646C] mt-1">Hours</span>
              </div>
            </div>

            {/* Peak + Minimum stacked */}
            <div className="flex flex-col gap-[var(--space-sm)] hidden">
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
        {/* Daily Runtime Chart */}
        <Card className="col-span-2 flex flex-col">
          <CardHeader
            action={
              sensor.runtimeThreshold != null ? (
                <span className="inline-flex items-center gap-1 px-3 py-2 rounded-[var(--radius-md)] bg-[var(--color-white)] border border-[var(--border-default)] text-[length:var(--font-size-xs)] font-semibold text-[var(--color-neutral-11)]">
                  <Zap size={11} className="text-[var(--color-warning)]" />
                  Threshold: {sensor.runtimeThreshold} AMP
                </span>
              ) : undefined
            }
          >
            <CardTitle>Daily Runtime</CardTitle>
            <p className="text-[length:var(--font-size-sm)] text-[var(--color-neutral-8)]">
              Hours of operation per day
            </p>
          </CardHeader>
          <CardBody className="flex-1 flex flex-col">
            <div className="relative flex-1">
              <RuntimeBarChart
                data={chartData}
                onDayClick={(day) => {
                  setSelectedDay((prev) => prev?.date === day.date ? null : day)
                  setShowChartHint(false)
                }}
                selectedDate={selectedDay?.date}
                resetting={isReset}
              />
              {showChartHint && (
                <button
                  onClick={() => setShowChartHint(false)}
                  className="absolute inset-0 z-10 flex items-center justify-center cursor-pointer bg-transparent group/hint"
                >
                  <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[var(--color-neutral-12)]/85 text-white text-[length:var(--font-size-sm)] font-medium shadow-[var(--shadow-lg)] backdrop-blur-sm animate-pulse pointer-events-none select-none">
                    <MousePointerClick size={15} className="opacity-90" />
                    Click a bar to view daily details
                  </span>
                </button>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Sensor Details */}
        <Card>
            <CardHeader>
              <CardTitle>Sensor Details</CardTitle>
            </CardHeader>
            <CardBody>
              {isReset ? (
                <div className="flex flex-col items-center justify-center text-center py-[var(--space-xl)] gap-[var(--space-md)] fade-animate">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--color-neutral-3)]">
                    <Timer size={18} className="text-[var(--color-neutral-7)]" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[length:var(--font-size-sm)] font-semibold text-[var(--color-neutral-11)]">
                      Runtime was reset
                    </span>
                    <span className="text-[length:var(--font-size-sm)] text-[var(--color-neutral-8)]">
                      Reconfigure this sensor's threshold, meter, and details to start tracking again.
                    </span>
                  </div>
                  <Button variant="primary" size="sm" onClick={() => setShowMeterModal(true)}>
                    Edit Details
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-[var(--space-xs)]">
                  <DetailRow label="Sensor ID" value={sensor.id} />
                  <DetailRow label="Asset ID" value={sensor.assetId} />
                  <DetailRow label="Gateway" value={sensor.gatewayName} />
                  <DetailRow label="Type" value={sensor.type} />
                  <DetailRow label="Location" value={sensor.locationName} />
                  <DetailRow label="Last Reading" value={sensor.lastReading} />

                  {/* Runtime Threshold row */}
                  <div className="flex items-center justify-between py-[var(--space-xs)] border-b border-[var(--border-subtle)]">
                    <span className="text-[length:var(--font-size-sm)] text-[var(--color-neutral-8)]">Runtime Threshold</span>
                    {sensor.runtimeThreshold != null ? (
                      <span className="text-[length:var(--font-size-sm)] font-medium text-[var(--color-neutral-11)]">
                        {sensor.runtimeThreshold} AMP
                      </span>
                    ) : (
                      <span className="text-[length:var(--font-size-sm)] text-[var(--color-neutral-7)]">Not set</span>
                    )}
                  </div>

                  {/* Meter row */}
                  <div className="group/meter flex items-center justify-between py-[var(--space-xs)] border-b border-[var(--border-subtle)] last:border-0">
                    <span className="text-[length:var(--font-size-sm)] text-[var(--color-neutral-8)]">Meter</span>
                    {sensor.meterName && !meterDeleted ? (
                      <div className="flex items-center gap-[var(--space-xs)]">
                        <button
                          onClick={() => setShowMeterModal(true)}
                          className="text-[length:var(--font-size-sm)] font-medium text-[var(--color-accent-9)] hover:underline cursor-pointer truncate max-w-[120px]"
                        >
                          {sensor.meterName}
                        </button>
                        <Switch.Root
                          checked={meterSyncOn}
                          onCheckedChange={setMeterSyncOn}
                          className="relative w-[32px] h-[18px] rounded-full cursor-pointer transition-colors duration-[var(--duration-fast)] shrink-0 data-[state=checked]:bg-[var(--color-accent-9)] data-[state=unchecked]:bg-[var(--color-neutral-5)]"
                        >
                          <Switch.Thumb className="block w-[14px] h-[14px] bg-white rounded-full shadow-sm transition-transform duration-[var(--duration-fast)] translate-x-[2px] data-[state=checked]:translate-x-[16px]" />
                        </Switch.Root>
                        <button
                          onClick={() => setMeterDeleted(true)}
                          className="flex items-center justify-center w-6 h-6 rounded-[var(--radius-sm)] hover:bg-[var(--color-error-light)] cursor-pointer shrink-0 hidden"
                          aria-label="Delete meter"
                        >
                          <Trash2 size={13} className="text-[var(--color-error)]" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowSyncMeterModal(true)}
                        className="text-[length:var(--font-size-sm)] font-medium text-[var(--color-accent-9)] hover:underline cursor-pointer"
                      >
                        Sync Meter
                      </button>
                    )}
                  </div>
                </div>
              )}
            </CardBody>
        </Card>

        {/* Day detail readings */}
        {selectedDay && (
          <div className="col-span-2 panel-animate">
            <DayReadingsTable day={selectedDay} threshold={sensor.runtimeThreshold} avgDailyHours={sensor.avgDailyHours} />
          </div>
        )}
      </div>

      {/* Edit Runtime Configuration Modal */}
      <MeterConfigModal
        open={showMeterModal}
        onOpenChange={setShowMeterModal}
        sensorName={sensor.name}
        totalRuntime={sensor.totalHours}
        existingMeterName={sensor.meterName}
        syncEnabled={sensor.meterSyncEnabled}
        runtimeThreshold={sensor.runtimeThreshold}
        onReset={() => {
          setIsReset(true)
          setSelectedDay(null)
        }}
      />

      {/* Sync Meter Modal */}
      <SyncMeterModal
        open={showSyncMeterModal}
        onOpenChange={setShowSyncMeterModal}
        sensorName={sensor.name}
        totalRuntime={sensor.totalHours}
      />
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
          className="transition-[stroke-dashoffset] duration-1000"
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
        <span className={`${light ? 'opacity-70' : 'text-[var(--color-neutral-7)]'} hidden`}> vs prev period</span>
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

interface IntervalReading {
  time: string
  amps: number
  running: boolean
  duration: string
}

function generateIntervalReadings(day: DailyRuntime, threshold?: number): IntervalReading[] {
  const th = threshold ?? 10
  const readings: IntervalReading[] = []
  const rng = seedRandom(day.date)
  const totalActiveIntervals = Math.round((day.hours / 24) * 144)

  const active = new Array(144).fill(false)

  if (totalActiveIntervals > 0) {
    let blockStart = Math.floor(rng() * 20)
    let filled = 0
    while (filled < totalActiveIntervals && blockStart < 144) {
      const blockLen = Math.min(
        Math.floor(rng() * 30) + 6,
        totalActiveIntervals - filled,
        144 - blockStart
      )
      for (let j = blockStart; j < blockStart + blockLen && j < 144; j++) {
        active[j] = true
        filled++
      }
      blockStart += blockLen + Math.floor(rng() * 12) + 1
    }
  }

  for (let i = 0; i < 144; i++) {
    const hour = Math.floor(i / 6)
    const minute = (i % 6) * 10
    const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`

    const isRunning = active[i]
    const amps = isRunning
      ? Math.round((th + rng() * th * 0.8) * 10) / 10
      : Math.round(rng() * (th * 0.3) * 10) / 10

    readings.push({
      time,
      amps,
      running: isRunning,
      duration: '10 min',
    })
  }

  return readings
}

function seedRandom(str: string) {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0
  }
  return () => {
    h = (h * 16807 + 0) % 2147483647
    return (h & 0x7fffffff) / 2147483647
  }
}

function DayPieChart({ dayHours, avgDailyHours }: { dayHours: number; avgDailyHours: number }) {
  const pct = avgDailyHours > 0 ? Math.round((dayHours / avgDailyHours) * 100) : 0
  const ringPct = Math.min(pct, 100)
  const size = 88
  const stroke = 6
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const connectedOffset = circumference - (ringPct / 100) * circumference

  return (
    <div className="flex items-center gap-[var(--space-md)] pt-1 pb-3">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--color-neutral-4)" strokeWidth={stroke} />
          <circle
            cx={size / 2} cy={size / 2} r={radius} fill="none"
            stroke="var(--color-accent-9)" strokeWidth={stroke} strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={connectedOffset}
          />
        </svg>
        <span className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[length:16px] font-bold text-[var(--color-accent-9)] leading-none">
            {pct}%
          </span>
          <span className="text-[length:12px] font-medium text-[var(--color-neutral-8)] leading-none mt-1">
            {dayHours}h
          </span>
        </span>
      </div>
      <div className="flex flex-col gap-1 hidden">
        <span className="inline-flex items-center gap-1.5 text-[length:var(--font-size-xs)] font-medium text-[var(--color-success)]">
          <span className="w-2 h-2 rounded-full bg-[var(--color-success)]" />
          Runtime: {dayHours}h
        </span>
        <span className="inline-flex items-center gap-1.5 text-[length:var(--font-size-xs)] font-medium text-[var(--color-neutral-7)]">
          <span className="w-2 h-2 rounded-full bg-[var(--color-neutral-4)]" />
          Avg: {avgDailyHours}h
        </span>
      </div>
    </div>
  )
}

function DayReadingsTable({ day, threshold, avgDailyHours }: { day: DailyRuntime; threshold?: number; avgDailyHours: number }) {
  const readings = useMemo(() => generateIntervalReadings(day, threshold), [day, threshold])
  const dt = new Date(day.date + 'T00:00:00')
  const dateLabel = dt.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })

  return (
    <Card>
      <CardHeader
        action={
          <DayPieChart dayHours={day.hours} avgDailyHours={avgDailyHours} />
        }
      >
        <CardTitle>{dateLabel}</CardTitle>
        <p className="text-[length:var(--font-size-sm)] text-[var(--color-neutral-8)]">
          10-minute interval readings
        </p>
      </CardHeader>
      <CardBody>
        {/* Timeline visualisation */}
        <div className="flex gap-[2px] mb-[var(--space-md)] rounded-[var(--radius-md)] overflow-hidden">
          {readings.map((r, i) => (
            <div
              key={i}
              className="flex-1 h-3 transition-colors"
              style={{
                backgroundColor: r.running ? 'var(--color-accent-9)' : 'var(--color-neutral-3)',
              }}
              title={`${r.time} — ${r.running ? 'Connected' : 'Disconnected'} (${r.amps} A)`}
            />
          ))}
        </div>

        {/* Hour labels */}
        <div className="flex justify-between mb-[var(--space-md)] px-0.5 pt-1 pb-5">
          {[0, 4, 8, 12, 16, 20, 24].map((h) => (
            <span key={h} className="text-[length:var(--font-size-xs)] text-[var(--color-neutral-7)]">
              {h.toString().padStart(2, '0')}:00
            </span>
          ))}
        </div>

        {/* Scrollable table */}
        <div className="max-h-[320px] overflow-y-auto rounded-[var(--radius-md)] border border-[var(--border-subtle)]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Current (A)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Duration</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {readings.map((r, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <span className="font-medium text-[var(--color-neutral-11)]">{r.time}</span>
                  </TableCell>
                  <TableCell>
                    <span className={r.running ? 'text-[var(--color-neutral-11)] font-medium' : 'text-[var(--color-neutral-7)]'}>
                      {r.amps} A
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge severity={r.running ? 'success' : 'neutral'}>
                      {r.running ? 'Connected' : 'Disconnected'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-[var(--color-neutral-8)]">{r.duration}</span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardBody>
    </Card>
  )
}
