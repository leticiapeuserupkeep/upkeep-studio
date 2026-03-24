'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Switch } from '@/app/components/ui'
import { MapPin, Gauge, EllipsisVertical, Pencil, TrendingUp, TrendingDown } from 'lucide-react'
import { Badge } from '@/app/components/ui/Badge'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/app/components/ui/DropdownMenu'
import { MeterConfigModal } from '@/app/components/edge/MeterConfigModal'
import { SyncMeterModal } from '@/app/components/edge/SyncMeterModal'
import { useAnimatedValue } from '@/app/lib/hooks/use-animated-value'
import type { RuntimeSensor } from '@/app/lib/models'

interface RuntimeCardProps {
  sensor: RuntimeSensor
  selected?: boolean
  onSelectChange?: (selected: boolean) => void
  onEdit?: () => void
  reset?: boolean
}

function getDeltaPercent(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 1000) / 10
}

function formatHours(h: number): string {
  return Math.round(h).toLocaleString('en-US')
}

const statusConfig = {
  connected: { label: 'Connected', severity: 'success' as const },
  disconnected: { label: 'Disconnected', severity: 'neutral' as const },
  warning: { label: 'Overloaded', severity: 'warning' as const },
}

const RESET_DURATION = 1800

export function RuntimeCard({ sensor, selected = false, onSelectChange, onEdit, reset = false }: RuntimeCardProps) {
  const [showMeterModal, setShowMeterModal] = useState(false)
  const [showSyncMeterModal, setShowSyncMeterModal] = useState(false)
  
  const [localReset, setLocalReset] = useState(false)
  const isReset = localReset || reset

  const [meterSyncOn, setMeterSyncOn] = useState(sensor.meterSyncEnabled ?? false)
  const rawDelta = getDeltaPercent(sensor.totalHours, sensor.previousPeriodHours)
  const totalHours = useAnimatedValue(sensor.totalHours, RESET_DURATION, isReset)
  const uptimePercent = useAnimatedValue(sensor.uptimePercent, RESET_DURATION, isReset)
  const delta = useAnimatedValue(rawDelta, RESET_DURATION, isReset)
  const isUp = delta > 0
  const isDown = delta < 0
  const statusInfo = statusConfig[sensor.status]

  const ringColor =
    sensor.status === 'connected'
      ? 'var(--color-accent-9)'
      : 'var(--color-error)'

  return (
    <>
      <Link
        href={`/edge/runtime/${sensor.id}`}
        className={`group flex flex-col rounded-[var(--radius-xl)] bg-[var(--surface-primary)] shadow-[var(--shadow-xs)] hover:shadow-none border border-transparent hover:border-[var(--color-neutral-6)] transition-all duration-[var(--duration-normal)] ease-[var(--ease-default)] h-full ${
          selected ? 'ring-2 ring-[var(--color-accent-9)]' : ''
        }`}
      >
        <div className="flex flex-col p-5 gap-6 h-full">
          {/* Row 1: Status bar */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center">
              <div
                onClick={(e) => {
                  e.preventDefault()
                  onSelectChange?.(!selected)
                }}
                className={`flex items-center justify-center rounded-[4px] bg-[var(--surface-primary)] transition-opacity duration-[var(--duration-fast)] ${selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
              >
                <input
                  type="checkbox"
                  checked={selected}
                  readOnly
                  className="w-5 h-5 rounded-[3px] border border-[var(--color-neutral-5)] accent-[var(--color-accent-9)] cursor-pointer pointer-events-none"
                />
              </div>
            </div>
            <div className="flex-1" />
            <span className="text-[length:var(--font-size-sm)] leading-5 tracking-[-0.15px] text-[var(--widget-empty-text-color)]">
              {sensor.lastReading}
            </span>
            <Badge severity={isReset ? 'neutral' : statusInfo.severity} dot>
              {isReset ? 'Disconnected' : statusInfo.label}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  onClick={(e) => e.preventDefault()}
                  className="flex items-center justify-center w-8 h-8 rounded-lg border border-[var(--border-default)] hover:bg-[var(--color-neutral-3)] transition-colors duration-[var(--duration-fast)] cursor-pointer"
                >
                  <EllipsisVertical size={16} className="text-[var(--color-neutral-9)]" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" minWidth="140px">
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault()
                    if (onEdit) onEdit()
                    else setShowMeterModal(true)
                  }}
                >
                  <Pencil size={14} className="text-[var(--color-neutral-8)]" />
                  Edit
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Row 2: Content */}
          {isReset ? (
            <div className="flex flex-col items-center justify-center text-center gap-3 py-2 flex-1 fade-animate">
              <span className="text-[length:var(--font-size-sm)] font-semibold text-[var(--color-neutral-11)]">
                {sensor.name}
              </span>
              <span className="text-[length:var(--font-size-sm)] text-[var(--color-neutral-8)] leading-relaxed">
                Runtime was reset. Reconfigure to resume tracking.
              </span>
              <span
                onClick={(e) => { e.preventDefault(); setShowMeterModal(true) }}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-[var(--radius-lg)] bg-[var(--color-accent-9)] text-white text-[length:var(--font-size-sm)] font-medium cursor-pointer hover:bg-[var(--color-accent-10)] transition-colors duration-[var(--duration-fast)]"
              >
                <Pencil size={13} />
                Edit Details
              </span>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-6">
                <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                  <h3 className="text-[length:var(--font-size-md)] font-bold text-[var(--color-neutral-12)] leading-5 group-hover:text-[var(--color-accent-9)] transition-colors duration-[var(--duration-fast)]">
                    {sensor.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-[var(--color-neutral-8)] shrink-0" />
                    <span className="text-[length:var(--font-size-base)] font-medium text-[var(--color-neutral-7)] truncate leading-4">
                      {sensor.locationName}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 pr-0.5">
                    {isDown ? (
                      <TrendingDown size={20} className="text-[var(--color-error)]" />
                    ) : (
                      <TrendingUp size={20} className="text-[var(--color-accent-9)]" />
                    )}
                    <span className={`text-[length:var(--font-size-sm)] font-medium leading-[140%] ml-0.5 ${isDown ? 'text-[var(--color-error)]' : 'text-[var(--color-accent-9)]'}`}>
                      {isUp ? '+' : ''}{Math.round(delta * 10) / 10}%
                    </span>
                  </div>
                </div>

                <UptimeRing percent={uptimePercent} color={ringColor} totalHours={totalHours} />
              </div>

              {/* Row 3: Meter */}
              <div
                className="flex items-center gap-1.5 pt-4 border-t border-[var(--border-subtle)]"
                onClick={(e) => {
                  e.preventDefault()
                  setShowMeterModal(true)
                }}
              >
                <Gauge size={18} className="text-[var(--color-neutral-12)] shrink-0" />
                <span className="text-[length:var(--font-size-sm)] text-[var(--color-neutral-7)] leading-4">Meter:</span>
                {sensor.meterName ? (
                  <>
                    <span className="text-[length:var(--font-size-sm)] text-[var(--color-neutral-7)] leading-4 flex-1 truncate">
                      {sensor.meterName}
                    </span>
                    <div onClick={(e) => { e.preventDefault(); e.stopPropagation() }}>
                      <Switch
                        checked={meterSyncOn}
                        onCheckedChange={setMeterSyncOn}
                        size="sm"
                        className="shrink-0"
                      />
                    </div>
                  </>
                ) : (
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setShowSyncMeterModal(true)
                    }}
                    className="text-[length:var(--font-size-sm)] font-medium text-[var(--color-accent-9)] leading-4 flex-1 text-left hover:underline cursor-pointer"
                  >
                    Sync Meter
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </Link>

      <MeterConfigModal
        open={showMeterModal}
        onOpenChange={setShowMeterModal}
        sensorName={sensor.name}
        totalRuntime={sensor.totalHours}
        existingMeterName={sensor.meterName}
        syncEnabled={sensor.meterSyncEnabled}
        runtimeThreshold={sensor.runtimeThreshold}
        onReset={() => setLocalReset(true)}
      />

      <SyncMeterModal
        open={showSyncMeterModal}
        onOpenChange={setShowSyncMeterModal}
        sensorName={sensor.name}
        totalRuntime={sensor.totalHours}
      />
    </>
  )
}

function UptimeRing({ percent, color, totalHours }: { percent: number; color: string; totalHours: number }) {
  const size = 108
  const stroke = 4
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percent / 100) * circumference

  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border-subtle)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-[length:var(--font-size-xl)] font-extrabold leading-5 text-[var(--color-neutral-12)]">
          {Math.round(percent)}%
        </span>
        <span className="text-[length:var(--font-size-base)] font-normal leading-[18px] text-[var(--color-neutral-7)]">
          {formatHours(totalHours)} Hs
        </span>
      </div>
    </div>
  )
}
