'use client'

import { useState } from 'react'
import Link from 'next/link'
import * as Switch from '@radix-ui/react-switch'
import { Clock, MapPin, Gauge, EllipsisVertical, Pencil, RotateCcw } from 'lucide-react'
import { Badge } from '@/app/components/ui/Badge'
import { MeterConfigModal } from '@/app/components/edge/MeterConfigModal'
import { SyncMeterModal } from '@/app/components/edge/SyncMeterModal'
import type { RuntimeSensor } from '@/app/lib/models'

interface RuntimeCardProps {
  sensor: RuntimeSensor
  selected?: boolean
  onSelectChange?: (selected: boolean) => void
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
  disconnected: { label: 'Disconnected', severity: 'danger' as const },
  warning: { label: 'Overloaded', severity: 'danger' as const },
}

export function RuntimeCard({ sensor, selected = false, onSelectChange }: RuntimeCardProps) {
  const [showMeterModal, setShowMeterModal] = useState(false)
  const [showSyncMeterModal, setShowSyncMeterModal] = useState(false)
  const [showCardMenu, setShowCardMenu] = useState(false)
  const [meterSyncOn, setMeterSyncOn] = useState(sensor.meterSyncEnabled ?? false)
  const delta = getDeltaPercent(sensor.totalHours, sensor.previousPeriodHours)
  const isUp = delta > 0
  const isDown = delta < 0
  const statusInfo = statusConfig[sensor.status]

  const ringColor =
    sensor.status === 'disconnected'
      ? 'var(--color-error)'
      : sensor.status === 'warning'
        ? 'var(--color-warning)'
        : 'var(--color-accent-9)'

  return (
    <>
      <Link
        href={`/edge/runtime/${sensor.id}`}
        className={`group block rounded-[10px] bg-[var(--surface-primary)] shadow-[var(--shadow-xs)] hover:shadow-[var(--shadow-md)] transition-all duration-200 ${
          selected ? 'ring-2 ring-[var(--color-accent-9)]' : ''
        }`}
      >
        <div className="flex flex-col p-5 gap-[18px]">
          {/* Row 1: Status bar */}
          <div className="flex items-center gap-3">
            <div
              onClick={(e) => {
                e.preventDefault()
                onSelectChange?.(!selected)
              }}
              className={`transition-opacity duration-150 ${selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
            >
              <input
                type="checkbox"
                checked={selected}
                readOnly
                className="w-4 h-4 rounded-[3px] border border-[var(--color-neutral-5)] accent-[var(--color-accent-9)] cursor-pointer pointer-events-none"
              />
            </div>
            <div className="flex-1" />
            <div className="flex items-center gap-1.5">
              <Clock size={16} className="text-[var(--color-neutral-7)]" />
              <span className="text-[length:14px] leading-5 tracking-[-0.15px] text-[var(--color-neutral-7)]">
                {sensor.lastReading}
              </span>
            </div>
            <Badge severity={statusInfo.severity} dot>
              {statusInfo.label}
            </Badge>
            <div className="relative">
              <button
                onClick={(e) => {
                  e.preventDefault()
                  setShowCardMenu((v) => !v)
                }}
                className="flex items-center justify-center w-6 h-6 rounded-[4px] hover:bg-[var(--color-neutral-3)] transition-colors cursor-pointer"
              >
                <EllipsisVertical size={16} className="text-[var(--color-neutral-9)]" />
              </button>
              {showCardMenu && (
                <>
                  <div className="fixed inset-0 z-[var(--z-dropdown)]" onClick={(e) => { e.preventDefault(); setShowCardMenu(false) }} />
                  <div className="absolute right-0 top-full mt-1 z-[var(--z-modal)] w-[140px] rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] shadow-[var(--shadow-lg)] py-1">
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        setShowCardMenu(false)
                        setShowMeterModal(true)
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-left text-[length:var(--font-size-sm)] font-medium text-[var(--color-neutral-11)] hover:bg-[var(--color-neutral-3)] cursor-pointer transition-colors"
                    >
                      <Pencil size={14} className="text-[var(--color-neutral-8)]" />
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        setShowCardMenu(false)
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-left text-[length:var(--font-size-sm)] font-medium text-[var(--color-error)] hover:bg-[var(--color-error-light)] cursor-pointer transition-colors"
                    >
                      <RotateCcw size={14} />
                      Reset
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Row 2: Content */}
          <div className="flex items-center gap-3">
            <div className="flex-1 flex flex-col gap-3 min-w-0">
              {/* Name + Location */}
              <div className="flex flex-col gap-1.5">
                <h3 className="text-[length:16px] font-semibold text-[#101828] truncate leading-5 group-hover:text-[var(--color-accent-9)] transition-colors">
                  {sensor.name}
                </h3>
                <div className="flex items-center gap-2">
                  <MapPin size={18} className="text-[var(--color-neutral-8)] shrink-0" />
                  <span className="text-[length:14px] font-medium text-[var(--color-neutral-7)] truncate leading-5">
                    {sensor.locationName}
                  </span>
                </div>
              </div>

              {/* Metrics */}
              <div>
                <div className="flex items-baseline">
                  <span className="text-[length:36px] font-semibold text-[#101828] leading-10 tracking-[0.37px]">
                    {formatHours(sensor.totalHours)}
                  </span>
                  <span className="text-[length:14px] text-[var(--color-neutral-7)] ml-1 leading-5 tracking-[-0.15px]">
                    hrs
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <span
                    className={`text-[length:14px] leading-5 tracking-[-0.15px] ${
                      isDown ? 'text-[var(--color-error)]' : isUp ? 'text-[var(--color-success)]' : 'text-[var(--color-neutral-7)]'
                    }`}
                  >
                    {isUp ? '+' : ''}{delta}%
                  </span>
                  <span className="text-[length:14px] text-[var(--color-neutral-7)] leading-5 tracking-[-0.15px]">
                    vs prev period
                  </span>
                </div>
              </div>
            </div>

            <UptimeRing percent={sensor.uptimePercent} color={ringColor} />
          </div>

          {/* Row 3: Meter */}
          <div
            className="flex items-center gap-1.5 pt-2 border-t border-[var(--border-subtle)]"
            onClick={(e) => {
              e.preventDefault()
              setShowMeterModal(true)
            }}
          >
            <Gauge size={18} className="text-[var(--color-neutral-7)] shrink-0" />
            <span className="text-[length:14px] text-[var(--color-neutral-7)] leading-5">Meter:</span>
            {sensor.meterName ? (
              <>
                <span className="text-[length:14px] text-[var(--color-neutral-8)] leading-5 flex-1 truncate">
                  {sensor.meterName}
                </span>
                <div onClick={(e) => e.stopPropagation()}>
                  <Switch.Root
                    checked={meterSyncOn}
                    onCheckedChange={setMeterSyncOn}
                    className="relative w-[36px] h-[20px] rounded-full cursor-pointer transition-colors duration-200 shrink-0 data-[state=checked]:bg-[var(--color-accent-9)] data-[state=unchecked]:bg-[var(--color-neutral-5)]"
                  >
                    <Switch.Thumb className="block w-[16px] h-[16px] bg-white rounded-full shadow-sm transition-transform duration-200 translate-x-[2px] data-[state=checked]:translate-x-[18px]" />
                  </Switch.Root>
                </div>
              </>
            ) : (
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setShowSyncMeterModal(true)
                }}
                className="text-[length:14px] font-medium text-[var(--color-accent-9)] leading-5 flex-1 text-left hover:underline cursor-pointer"
              >
                Sync Meter
              </button>
            )}
          </div>
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

function UptimeRing({ percent, color }: { percent: number; color: string }) {
  const size = 104
  const stroke = 8
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
          stroke="var(--color-neutral-3)"
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
      <span className="absolute text-[length:20px] font-bold text-[#101828]">
        {Math.round(percent)}%
      </span>
    </div>
  )
}
