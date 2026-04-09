'use client'

import Link from 'next/link'
import {
  Box,
  MapPin,
  Wifi,
  WifiHigh,
  WifiLow,
  WifiOff,
  WifiZero,
  Battery,
  BatteryLow,
  ChevronDown,
  ChevronUp,
  EllipsisVertical,
  Pencil,
} from 'lucide-react'
import { Badge } from '@/app/components/ui/Badge'
import { Button } from '@/app/components/ui/Button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/app/components/ui/DropdownMenu'
import { MeterConfigModal } from '@/app/components/edge/MeterConfigModal'
import { SensorInsightsModal } from '@/app/components/edge/SensorInsightsModal'
import { Tooltip, TooltipProvider } from '@/app/components/ui/Tooltip'
import type { RuntimeSensor, TelemetryReading, TelemetryReadingVariant } from '@/app/lib/models'
import { useLayoutEffect, useRef, useState } from 'react'

const statusConfig = {
  connected: { label: 'Connected', severity: 'success' as const },
  disconnected: { label: 'Disconnected', severity: 'neutral' as const },
  warning: { label: 'Overloaded', severity: 'warning' as const },
}

const readingShell: Record<TelemetryReadingVariant, string> = {
  success:
    'bg-[var(--color-success-light)] border-[var(--color-success-border)]',
  warning:
    'bg-[var(--color-warning-light)] border-[var(--color-warning-border)]',
  danger: 'bg-[var(--color-error-light)] border-[var(--color-error-border)]',
  neutral:
    'bg-[var(--surface-secondary)] border-[var(--border-default)]',
}

const readingValue: Record<TelemetryReadingVariant, string> = {
  success: 'text-[var(--color-success)]',
  warning: 'text-[var(--color-warning)]',
  danger: 'text-[var(--color-error)]',
  neutral: 'text-[var(--color-neutral-11)]',
}

/** Values that are unknown / N/A — render as neutral gray tiles, not error. */
function isUnavailableReadingValue(value: string): boolean {
  const t = value.trim()
  if (t.length === 0) return true
  const lower = t.toLowerCase()
  if (lower === 'unknown' || lower === 'n/a' || lower === 'na') return true
  if (t === '\u2014' || t === '\u2013' || t === '-') return true
  if (t === '0' || t === '0%' || t === '0.0') return true
  return false
}

function effectiveReadingVariant(r: TelemetryReading): TelemetryReadingVariant {
  if (isUnavailableReadingValue(r.value)) return 'neutral'
  return r.variant
}

/** 3-column grid: collapsed shows 2 rows; expanded viewport shows 4 rows before scroll. */
const READINGS_GRID_COLS = 3
const READINGS_COLLAPSED_ROWS = 2
const READINGS_COLLAPSED_COUNT = READINGS_GRID_COLS * READINGS_COLLAPSED_ROWS

/** Static max-heights for Tailwind (expanded ≈4 tile rows visible, then scroll). Must match `gap-3` row gaps. */
const READINGS_REGION_COLLAPSED_MAX_H_CLASS = 'max-h-[calc(2*5.25rem+0.75rem)]'
const READINGS_REGION_EXPANDED_MAX_H_CLASS =
  'max-h-[min(52vh,calc(4*5.25rem+3*0.75rem))]'
function fallbackReadings(sensor: RuntimeSensor): TelemetryReading[] {
  return [
    {
      id: 'fb-runtime',
      label: 'Total runtime',
      value: `${Math.round(sensor.totalHours).toLocaleString()} h`,
      variant: sensor.status === 'disconnected' ? 'danger' : 'success',
    },
    {
      id: 'fb-uptime',
      label: 'Uptime',
      value: `${Math.round(sensor.uptimePercent)}%`,
      variant:
        sensor.uptimePercent >= 95
          ? 'success'
          : sensor.uptimePercent >= 85
            ? 'warning'
            : 'danger',
    },
  ]
}

/** Card frame tone: disconnected is neutral; then telemetry/status severity; else healthy (green). */
type CardFrameTone = 'success' | 'warning' | 'danger' | 'muted'

function getCardFrameTone(sensor: RuntimeSensor, readings: TelemetryReading[]): CardFrameTone {
  if (sensor.status === 'disconnected') return 'muted'
  const tones = readings.map(effectiveReadingVariant)
  if (tones.some((t) => t === 'danger')) return 'danger'
  if (sensor.status === 'warning' || tones.some((t) => t === 'warning')) return 'warning'
  return 'success'
}

/** Wi‑Fi arcs mirror signal strength (full → minimal dot). */
function SignalStrengthIcon({
  percent,
  disconnected,
}: {
  percent: number
  disconnected: boolean
}) {
  const common = 'shrink-0'
  if (disconnected) {
    return <WifiOff size={14} className={`text-[var(--color-neutral-6)] ${common}`} aria-hidden />
  }
  if (percent <= 0) {
    return <WifiZero size={14} className={`text-[var(--color-neutral-6)] ${common}`} aria-hidden />
  }
  if (percent >= 67) {
    return <Wifi size={14} className={`text-[var(--color-success)] ${common}`} aria-hidden />
  }
  if (percent >= 34) {
    return <WifiHigh size={14} className={`text-[var(--color-neutral-8)] ${common}`} aria-hidden />
  }
  return <WifiLow size={14} className={`text-[var(--color-warning)] ${common}`} aria-hidden />
}

function ReadingTileLabel({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [isTruncated, setIsTruncated] = useState(false)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => {
      const node = ref.current
      if (!node) return
      // Any overflow (including subpixel) → ellipsis; avoid `+ 1` which hid 1px overflows.
      setIsTruncated(node.scrollWidth > node.clientWidth)
    }
    measure()
    const raf = requestAnimationFrame(measure)
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [text, isTruncated])

  const span = (
    <span
      ref={ref}
      className="block min-w-0 truncate text-[12px] leading-3 text-[var(--color-neutral-8)]"
    >
      {text}
    </span>
  )

  if (!isTruncated) return span

  return (
    <Tooltip content={text} side="top" maxWidth="min(280px,90vw)">
      {span}
    </Tooltip>
  )
}

function ReadingTile({ r }: { r: TelemetryReading }) {
  const tone = effectiveReadingVariant(r)
  return (
    <div
      className={`flex flex-col gap-1 rounded-[var(--radius-lg)] border p-2 min-w-0 w-full ${readingShell[tone]}`}
    >
      <ReadingTileLabel text={r.label} />
      <span className={`text-[14px] font-semibold leading-snug ${readingValue[tone]}`}>
        {r.value}
      </span>
    </div>
  )
}

interface EdgeSensorCardProps {
  sensor: RuntimeSensor
}

export function EdgeSensorCard({ sensor }: EdgeSensorCardProps) {
  const [showEdit, setShowEdit] = useState(false)
  const [insightsOpen, setInsightsOpen] = useState(false)
  const [readingsExpanded, setReadingsExpanded] = useState(false)
  const statusInfo = statusConfig[sensor.status]
  const readings =
    sensor.telemetryReadings?.length ? sensor.telemetryReadings : fallbackReadings(sensor)
  const cardFrameTone = getCardFrameTone(sensor, readings)
  const hasMoreReadings = readings.length > READINGS_COLLAPSED_COUNT
  const hiddenCount = readings.length - READINGS_COLLAPSED_COUNT
  const visibleReadings =
    readingsExpanded || !hasMoreReadings
      ? readings
      : readings.slice(0, READINGS_COLLAPSED_COUNT)

  const signal = sensor.signalStrength ?? (sensor.status === 'disconnected' ? 0 : 100)
  const battery = sensor.batteryPercent

  const detailHref = `/edge/runtime/${sensor.id}`

  /** 4px left corners (--radius-sm); 16px right corners (--radius-2xl). 1px border + 3px left bar. */
  const shellCorners =
    'rounded-tl-[var(--radius-sm)] rounded-bl-[var(--radius-sm)] rounded-tr-[var(--radius-2xl)] rounded-br-[var(--radius-2xl)]'
  const shellFrameClass = {
    success: `${shellCorners} border border-[var(--border-default)] border-l-[3px] border-l-[var(--color-success)]`,
    warning: `${shellCorners} border border-[var(--border-default)] border-l-[3px] border-l-[var(--color-warning)]`,
    danger: `${shellCorners} border border-[var(--border-default)] border-l-[3px] border-l-[var(--color-error)]`,
    muted: `${shellCorners} border border-[var(--border-default)] border-l-[3px] border-l-[var(--border-subtle)]`,
  }[cardFrameTone]

  return (
    <TooltipProvider delayDuration={250}>
      <div
        className={`flex flex-col gap-4 w-[min(100%,400px)] min-w-0 bg-[var(--surface-primary)] p-4 h-full min-h-0 shadow-[var(--shadow-xs)] ${shellFrameClass}`}
      >
        <div className="flex flex-wrap items-center justify-end gap-3 gap-y-2">
          <span className="text-[10px] font-normal leading-4 tracking-wide text-[var(--color-neutral-8)] mr-auto">
            {sensor.lastReading}
          </span>
          <Badge severity={statusInfo.severity} className="shrink-0">
            {statusInfo.label}
          </Badge>
          <div
            className="flex items-center gap-1 text-[length:var(--font-size-xs)] text-[var(--color-neutral-8)]"
            title={`Signal strength ${signal}%`}
          >
            <SignalStrengthIcon
              percent={signal}
              disconnected={sensor.status === 'disconnected'}
            />
            <span className="tabular-nums">{signal}%</span>
          </div>
          <div className="flex items-center gap-1 text-[length:var(--font-size-xs)] shrink-0">
            {battery == null ? (
              <>
                <Battery
                  size={14}
                  className="text-[var(--color-neutral-5)] shrink-0"
                  aria-hidden
                />
                <span
                  className="text-[var(--color-neutral-6)] tabular-nums"
                  title="Battery level not reported (may be line-powered)"
                >
                  —
                </span>
              </>
            ) : battery === 0 ? (
              <>
                <Battery
                  size={14}
                  className="text-[var(--color-neutral-5)] shrink-0"
                  aria-hidden
                />
                <span
                  className="text-[var(--color-neutral-6)] tabular-nums"
                  title="Battery empty or disconnected"
                >
                  0%
                </span>
              </>
            ) : battery < 20 ? (
              <>
                <BatteryLow size={14} className="text-[var(--color-warning)] shrink-0" aria-hidden />
                <span className="text-[var(--color-neutral-8)] tabular-nums">{battery}%</span>
              </>
            ) : (
              <>
                <Battery size={14} className="text-[var(--color-neutral-7)] shrink-0" aria-hidden />
                <span className="text-[var(--color-neutral-8)] tabular-nums">{battery}%</span>
              </>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center justify-center w-8 h-8 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-primary)] hover:bg-[var(--color-neutral-3)] transition-colors cursor-pointer"
                aria-label="Sensor actions"
              >
                <EllipsisVertical size={16} className="text-[var(--color-neutral-9)]" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" minWidth="160px">
              <DropdownMenuItem onSelect={() => setShowEdit(true)}>
                <Pencil size={14} className="text-[var(--color-neutral-8)]" />
                Edit sensor
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex flex-col gap-1 min-w-0">
          <h3 className="text-[length:var(--font-size-md)] font-semibold text-[var(--color-neutral-12)] leading-6">
            {sensor.name}
          </h3>
          <div className="flex flex-col gap-[10px] min-w-0 text-[12px] leading-4 text-[var(--color-neutral-8)]">
            <span>Type: {sensor.type}</span>
            <div className="flex min-w-0 items-center gap-2 font-medium text-[var(--color-neutral-12)]">
              <span className="inline-flex min-w-0 flex-1 items-center gap-1">
                <MapPin
                  size={16}
                  className="h-[16px] w-[16px] shrink-0 text-[var(--color-neutral-7)]"
                  aria-hidden
                />
                <span className="truncate">{sensor.locationName}</span>
              </span>
              <span className="shrink-0 select-none text-[var(--color-neutral-5)]" aria-hidden>
                ·
              </span>
              <span className="inline-flex min-w-0 flex-1 items-center gap-1">
                <Box
                  size={16}
                  className="h-[16px] w-[16px] shrink-0 text-[var(--color-neutral-7)]"
                  aria-hidden
                />
                <span className="truncate">{sensor.assetName}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 min-w-0">
          {hasMoreReadings ? (
            <div
              role={readingsExpanded ? 'region' : undefined}
              aria-label={readingsExpanded ? 'All telemetry readings' : undefined}
              className={`min-w-0 rounded-[var(--radius-md)] pr-0.5 transition-[max-height,border-color] duration-[var(--duration-normal)] motion-reduce:transition-none [transition-timing-function:var(--ease-default)] ${
                readingsExpanded
                  ? `border border-[var(--border-subtle)] overflow-y-auto overscroll-y-contain ${READINGS_REGION_EXPANDED_MAX_H_CLASS}`
                  : `border border-transparent overflow-hidden ${READINGS_REGION_COLLAPSED_MAX_H_CLASS}`
              }`}
            >
              <div className="grid grid-cols-3 gap-3">
                {visibleReadings.map((r) => (
                  <ReadingTile key={r.id} r={r} />
                ))}
              </div>
            </div>
          ) : (
            <div className="min-w-0">
              <div className="grid grid-cols-3 gap-3">
                {visibleReadings.map((r) => (
                  <ReadingTile key={r.id} r={r} />
                ))}
              </div>
            </div>
          )}
          {hasMoreReadings && (
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={() => setReadingsExpanded((e) => !e)}
              aria-expanded={readingsExpanded}
              className="w-full text-[var(--color-neutral-8)] hover:text-[var(--color-neutral-11)] active:text-[var(--color-neutral-12)] disabled:text-[var(--color-neutral-7)]"
            >
              {readingsExpanded ? (
                <>
                  Show less
                  <ChevronUp size={14} className="shrink-0" aria-hidden />
                </>
              ) : (
                <>
                  Show {hiddenCount} more
                  <ChevronDown size={14} className="shrink-0" aria-hidden />
                </>
              )}
            </Button>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 mt-auto pt-1">
          {sensor.insights.length > 0 ? (
            <button
              type="button"
              onClick={() => setInsightsOpen(true)}
              className="text-[12px] font-medium text-[var(--color-neutral-12)] underline underline-offset-2 hover:text-[var(--color-accent-9)] cursor-pointer bg-transparent border-none p-0 text-left"
            >
              View insights
            </button>
          ) : null}
          <Button variant="primary" size="sm" asChild>
            <Link href={detailHref}>More details</Link>
          </Button>
        </div>
      </div>

      {sensor.insights.length > 0 ? (
        <SensorInsightsModal
          open={insightsOpen}
          onOpenChange={setInsightsOpen}
          sensorName={sensor.name}
          insights={sensor.insights}
        />
      ) : null}

      <MeterConfigModal
        open={showEdit}
        onOpenChange={setShowEdit}
        sensorName={sensor.name}
        totalRuntime={sensor.totalHours}
        existingMeterName={sensor.meterName}
        syncEnabled={sensor.meterSyncEnabled}
        runtimeThreshold={sensor.runtimeThreshold}
      />
    </TooltipProvider>
  )
}
