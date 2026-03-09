'use client'

import { useState } from 'react'
import Link from 'next/link'
import * as Switch from '@radix-ui/react-switch'
import { Clock, MapPin, Gauge, EllipsisVertical, Pencil, RotateCcw, TrendingUp, TrendingDown } from 'lucide-react'
import { Badge } from '@/app/components/ui/Badge'
import { MeterConfigModal } from '@/app/components/edge/MeterConfigModal'
import { SyncMeterModal } from '@/app/components/edge/SyncMeterModal'
import type { RuntimeSensor } from '@/app/lib/models'

interface RuntimeCardProps {
  sensor: RuntimeSensor
  selected?: boolean
  onSelectChange?: (selected: boolean) => void
  onEdit?: () => void
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

export function RuntimeCard({ sensor, selected = false, onSelectChange, onEdit }: RuntimeCardProps) {
  const [showMeterModal, setShowMeterModal] = useState(false)
  const [showSyncMeterModal, setShowSyncMeterModal] = useState(false)
  const [showCardMenu, setShowCardMenu] = useState(false)
  const [meterSyncOn, setMeterSyncOn] = useState(sensor.meterSyncEnabled ?? false)
  const delta = getDeltaPercent(sensor.totalHours, sensor.previousPeriodHours)
  const isUp = delta > 0
  const isDown = delta < 0
  const statusInfo = statusConfig[sensor.status]

  const ringColor =
    sensor.status === 'connected'
      ? 'var(--color-accent-9)'
      : '#CE2C31'

  return (
    <>
      <Link
        href={`/edge/runtime/${sensor.id}`}
        className={`group block rounded-[20px] bg-[var(--surface-primary)] shadow-[var(--shadow-xs)] hover:shadow-[var(--shadow-md)] transition-all duration-350 ${
          selected ? 'ring-2 ring-[var(--color-accent-9)]' : ''
        }`}
      >
        <div className="flex flex-col p-5 gap-6">
          {/* Row 1: Status bar */}
          <div className="flex items-center gap-3">
            <div
              onClick={(e) => {
                e.preventDefault()
                onSelectChange?.(!selected)
              }}
              className={`transition-opacity duration-300 ${selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
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
              <Clock size={12} className="text-[#6A7282]" />
              <span className="text-[length:12px] leading-5 tracking-[-0.15px] text-[#6A7282]">
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
                className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-[var(--color-neutral-3)] transition-colors cursor-pointer"
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
                        if (onEdit) onEdit()
                        else setShowMeterModal(true)
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
          <div className="flex items-center gap-6">
            <div className="flex-1 flex flex-col gap-2.5 min-w-0">
              <h3 className="text-[length:20px] font-bold text-[#101828] leading-6 group-hover:text-[var(--color-accent-9)] transition-colors">
                {sensor.name}
              </h3>
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-[#8B8D98] shrink-0" />
                <span className="text-[length:12px] font-medium text-[#6A7282] truncate leading-4">
                  {sensor.locationName}
                </span>
              </div>
              <div className="flex items-center gap-1 pr-0.5">
                {isDown ? (
                  <TrendingDown size={20} className="text-[#CE2C31]" />
                ) : (
                  <TrendingUp size={20} className="text-[#3E63DD]" />
                )}
                <span className={`text-[length:12px] font-medium leading-[140%] ml-0.5 ${isDown ? 'text-[#CE2C31]' : 'text-[#3451B2]'}`}>
                  {isUp ? '+' : ''}{delta}%
                </span>
              </div>
            </div>

            <UptimeRing percent={sensor.uptimePercent} color={ringColor} totalHours={sensor.totalHours} />
          </div>

          {/* Row 3: Meter */}
          <div
            className="flex items-center gap-1.5 pt-4 border-t border-[#F0F0F3]"
            onClick={(e) => {
              e.preventDefault()
              setShowMeterModal(true)
            }}
          >
            <Gauge size={18} className="text-[#1C2024] shrink-0" />
            <span className="text-[length:12px] text-[#60646C] leading-4">Meter:</span>
            {sensor.meterName ? (
              <>
                <span className="text-[length:12px] text-[#60646C] leading-4 flex-1 truncate">
                  {sensor.meterName}
                </span>
                <div onClick={(e) => { e.preventDefault(); e.stopPropagation() }}>
                  <Switch.Root
                    checked={meterSyncOn}
                    onCheckedChange={setMeterSyncOn}
                    className="relative w-7 h-4 rounded-full cursor-pointer transition-colors duration-350 shrink-0 data-[state=checked]:bg-[var(--color-accent-9)] data-[state=unchecked]:bg-[#E0E1E6]"
                  >
                    <Switch.Thumb className="block w-3.5 h-3.5 bg-white rounded-full shadow-[0px_4px_16px_-8px_rgba(0,0,0,0.1),0px_3px_12px_-4px_rgba(0,0,0,0.1),0px_2px_3px_-2px_rgba(0,0,51,0.06)] transition-transform duration-350 translate-x-[1px] data-[state=checked]:translate-x-[13px]" />
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
                className="text-[length:12px] font-medium text-[var(--color-accent-9)] leading-4 flex-1 text-left hover:underline cursor-pointer"
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

function UptimeRing({ percent, color, totalHours }: { percent: number; color: string; totalHours: number }) {
  const size = 136
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
          stroke="#F0F0F3"
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
        <span className="text-[length:28px] font-extrabold leading-9 text-[#101828]">
          {Math.round(percent)}%
        </span>
        <span className="text-[length:14px] font-normal leading-5 text-[#60646C]">
          {formatHours(totalHours)} Hs
        </span>
      </div>
    </div>
  )
}
