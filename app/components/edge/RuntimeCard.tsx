'use client'

import Link from 'next/link'
import { Clock, TrendingUp, TrendingDown, Minus, MapPin, Wifi, WifiOff, AlertTriangle } from 'lucide-react'
import { Badge } from '@/app/components/ui/Badge'
import { Sparkline } from '@/app/components/ui/Sparkline'
import type { RuntimeSensor } from '@/app/lib/models'

interface RuntimeCardProps {
  sensor: RuntimeSensor
}

function getDeltaPercent(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 1000) / 10
}

function formatHours(h: number): string {
  if (h >= 1000) return `${(h / 1000).toFixed(1)}k`
  return h.toFixed(1)
}

const statusConfig = {
  connected: { label: 'Connected', severity: 'success' as const, icon: Wifi },
  disconnected: { label: 'Disconnected', severity: 'danger' as const, icon: WifiOff },
  warning: { label: 'Warning', severity: 'warning' as const, icon: AlertTriangle },
}

export function RuntimeCard({ sensor }: RuntimeCardProps) {
  const delta = getDeltaPercent(sensor.totalHours, sensor.previousPeriodHours)
  const isUp = delta > 0
  const isDown = delta < 0
  const statusInfo = statusConfig[sensor.status]
  const StatusIcon = statusInfo.icon
  const sparkData = sensor.dailyRuntime.map((d) => d.hours)

  const sparkColor =
    sensor.status === 'disconnected'
      ? 'var(--color-neutral-6)'
      : sensor.status === 'warning'
        ? 'var(--color-warning)'
        : 'var(--color-accent-9)'

  return (
    <Link
      href={`/edge/runtime/${sensor.id}`}
      className="group block rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-primary)] shadow-[var(--shadow-xs)] hover:shadow-[var(--shadow-md)] hover:border-[var(--color-accent-5)] transition-all duration-200 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-start justify-between px-[var(--space-lg)] pt-[var(--space-md)] pb-[var(--space-xs)]">
        <div className="flex-1 min-w-0">
          <h3 className="text-[length:var(--font-size-base)] font-semibold text-[var(--color-neutral-11)] truncate group-hover:text-[var(--color-accent-9)] transition-colors">
            {sensor.name}
          </h3>
          <p className="text-[length:var(--font-size-sm)] text-[var(--color-neutral-8)] truncate mt-0.5">
            {sensor.assetName}
          </p>
        </div>
        <Badge severity={statusInfo.severity} dot>
          {statusInfo.label}
        </Badge>
      </div>

      {/* Metrics */}
      <div className="px-[var(--space-lg)] py-[var(--space-sm)]">
        <div className="flex items-end gap-[var(--space-xl)]">
          <div className="flex-1">
            <div className="flex items-baseline gap-2">
              <span className="text-[length:var(--font-size-2xl)] font-bold text-[var(--color-neutral-12)] leading-none">
                {formatHours(sensor.totalHours)}
              </span>
              <span className="text-[length:var(--font-size-sm)] text-[var(--color-neutral-8)]">hrs</span>
            </div>
            <div className="flex items-center gap-1 mt-1.5">
              {isUp ? (
                <TrendingUp size={12} className="text-[var(--color-success)]" />
              ) : isDown ? (
                <TrendingDown size={12} className="text-[var(--color-error)]" />
              ) : (
                <Minus size={12} className="text-[var(--color-neutral-7)]" />
              )}
              <span
                className={`text-[length:var(--font-size-xs)] font-medium ${
                  isUp ? 'text-[var(--color-success)]' : isDown ? 'text-[var(--color-error)]' : 'text-[var(--color-neutral-7)]'
                }`}
              >
                {isUp ? '+' : ''}{delta}%
              </span>
              <span className="text-[length:var(--font-size-xs)] text-[var(--color-neutral-7)]">vs prev period</span>
            </div>
          </div>

          <Sparkline data={sparkData} width={100} height={36} color={sparkColor} />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-[var(--space-lg)] py-[var(--space-sm)] border-t border-[var(--border-subtle)] bg-[var(--color-neutral-2)]/50">
        <div className="flex items-center gap-1 text-[length:var(--font-size-xs)] text-[var(--color-neutral-8)]">
          <MapPin size={11} className="shrink-0" />
          <span className="truncate">{sensor.locationName}</span>
        </div>
        <div className="flex items-center gap-1 text-[length:var(--font-size-xs)] text-[var(--color-neutral-7)]">
          <Clock size={11} />
          <span>{sensor.lastReading}</span>
        </div>
      </div>
    </Link>
  )
}
