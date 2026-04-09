'use client'

import Link from 'next/link'
import {
  MapPin,
  Wifi,
  WifiOff,
  Battery,
  BatteryLow,
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
import type { RuntimeSensor, TelemetryReading, TelemetryReadingVariant } from '@/app/lib/models'
import { useState } from 'react'

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
}

const readingValue: Record<TelemetryReadingVariant, string> = {
  success: 'text-[var(--color-success)]',
  warning: 'text-[var(--color-warning)]',
  danger: 'text-[var(--color-error)]',
}

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

interface EdgeSensorCardProps {
  sensor: RuntimeSensor
}

export function EdgeSensorCard({ sensor }: EdgeSensorCardProps) {
  const [showEdit, setShowEdit] = useState(false)
  const statusInfo = statusConfig[sensor.status]
  const readings =
    sensor.telemetryReadings?.length ? sensor.telemetryReadings : fallbackReadings(sensor)

  const signal = sensor.signalStrength ?? (sensor.status === 'disconnected' ? 0 : 100)
  const battery = sensor.batteryPercent

  const detailHref = `/edge/runtime/${sensor.id}`

  return (
    <>
      <div className="flex flex-col gap-4 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-secondary)] p-4 h-full min-h-0 shadow-[var(--shadow-xs)]">
        <div className="flex flex-wrap items-center justify-end gap-3 gap-y-2">
          <span className="text-[10px] font-normal leading-4 tracking-wide text-[var(--color-neutral-8)] mr-auto">
            {sensor.lastReading}
          </span>
          <Badge severity={statusInfo.severity} className="shrink-0">
            {statusInfo.label}
          </Badge>
          <div className="flex items-center gap-1 text-[length:var(--font-size-xs)] text-[var(--color-neutral-8)]">
            {signal > 0 ? (
              <Wifi size={14} className="text-[var(--color-success)] shrink-0" />
            ) : (
              <WifiOff size={14} className="text-[var(--color-neutral-6)] shrink-0" />
            )}
            <span>{signal}%</span>
          </div>
          {battery != null ? (
            <div className="flex items-center gap-1 text-[length:var(--font-size-xs)] text-[var(--color-neutral-8)]">
              {battery < 20 ? (
                <BatteryLow size={14} className="text-[var(--color-warning)] shrink-0" />
              ) : (
                <Battery size={14} className="text-[var(--color-neutral-7)] shrink-0" />
              )}
              <span>{battery}%</span>
            </div>
          ) : (
            <span
              className="text-[length:var(--font-size-xs)] text-[var(--color-neutral-6)]"
              title="Line-powered"
            >
              AC
            </span>
          )}
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

        <div className="h-px bg-[var(--border-subtle)] w-full" />

        <div className="flex flex-col gap-1 min-w-0">
          <h3 className="text-[length:var(--font-size-md)] font-semibold text-[var(--color-neutral-12)] leading-6">
            {sensor.name}
          </h3>
          <div className="flex flex-wrap items-center gap-2 text-[length:var(--font-size-xs)] text-[var(--color-neutral-8)]">
            <span>
              Type: {sensor.type}
            </span>
            <span className="hidden sm:inline w-px h-4 bg-[var(--border-default)]" aria-hidden />
            <span className="inline-flex items-center gap-1 min-w-0">
              <MapPin size={14} className="shrink-0 text-[var(--color-neutral-7)]" />
              <span className="truncate">{sensor.locationName}</span>
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {readings.map((r) => (
            <div
              key={r.id}
              className={`flex flex-col gap-1 rounded-[var(--radius-lg)] border px-3 py-3 w-[104px] shrink-0 ${readingShell[r.variant]}`}
            >
              <span className="text-[12px] leading-3 text-[var(--color-neutral-8)]">{r.label}</span>
              <span className={`text-[14px] font-semibold leading-snug ${readingValue[r.variant]}`}>
                {r.value}
              </span>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 mt-auto pt-1">
          <Link
            href={detailHref}
            className="text-[12px] font-medium text-[var(--color-neutral-12)] underline underline-offset-2 hover:text-[var(--color-accent-9)]"
          >
            View insights
          </Link>
          <Button variant="primary" size="sm" asChild>
            <Link href={detailHref}>More details</Link>
          </Button>
        </div>
      </div>

      <MeterConfigModal
        open={showEdit}
        onOpenChange={setShowEdit}
        sensorName={sensor.name}
        totalRuntime={sensor.totalHours}
        existingMeterName={sensor.meterName}
        syncEnabled={sensor.meterSyncEnabled}
        runtimeThreshold={sensor.runtimeThreshold}
      />
    </>
  )
}
