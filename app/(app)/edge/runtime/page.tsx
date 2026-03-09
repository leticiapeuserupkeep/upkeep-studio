'use client'

import { useState, useMemo, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  Timer, TrendingUp, TrendingDown, Clock, Activity,
  Zap, Search, ChevronDown, Calendar, XCircle, ArrowUpDown, Radio,
  Pencil, RotateCcw, X, Share2, Bookmark, SlidersHorizontal, MapPin, Box,
} from 'lucide-react'
import { RuntimeCard } from '@/app/components/edge/RuntimeCard'
import { MeterConfigModal } from '@/app/components/edge/MeterConfigModal'
import { runtimeSensors } from '@/app/lib/edge-data'
import type { SensorStatus } from '@/app/lib/models'

type PeriodFilter = '7d' | '30d' | '90d'
type StatusFilter = 'all' | SensorStatus
type SortBy = 'hours_desc' | 'hours_asc' | 'name' | 'delta'

const periodLabels: Record<PeriodFilter, string> = {
  '7d': 'Past 7 Days',
  '30d': 'Past 30 Days',
  '90d': 'Past 90 Days',
}

export default function RuntimePage() {
  const [period, setPeriod] = useState<PeriodFilter>('30d')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [sortBy, setSortBy] = useState<SortBy>('hours_desc')
  const [searchQuery, setSearchQuery] = useState('')
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [dateFrom, setDateFrom] = useState('2026-01-28')
  const [dateTo, setDateTo] = useState('2026-02-26')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showEditModal, setShowEditModal] = useState(false)
  const [editSensorId, setEditSensorId] = useState<string | null>(null)
  const [kpiPortal, setKpiPortal] = useState<HTMLElement | null>(null)

  useEffect(() => {
    setKpiPortal(document.getElementById('runtime-kpi-portal'))
  }, [])

  function toggleSelection(id: string, value: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (value) next.add(id)
      else next.delete(id)
      return next
    })
  }

  const filtered = useMemo(() => {
    let list = [...runtimeSensors]

    if (statusFilter !== 'all') {
      list = list.filter((s) => s.status === statusFilter)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.assetName.toLowerCase().includes(q) ||
          s.locationName.toLowerCase().includes(q)
      )
    }

    switch (sortBy) {
      case 'hours_desc':
        list.sort((a, b) => b.totalHours - a.totalHours)
        break
      case 'hours_asc':
        list.sort((a, b) => a.totalHours - b.totalHours)
        break
      case 'name':
        list.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'delta': {
        const getDelta = (s: typeof list[0]) =>
          s.previousPeriodHours > 0
            ? ((s.totalHours - s.previousPeriodHours) / s.previousPeriodHours) * 100
            : 0
        list.sort((a, b) => getDelta(b) - getDelta(a))
        break
      }
    }

    return list
  }, [statusFilter, sortBy, searchQuery])

  const totalFleetHours = runtimeSensors.reduce((sum, s) => sum + s.totalHours, 0)
  const previousFleetHours = runtimeSensors.reduce((sum, s) => sum + s.previousPeriodHours, 0)
  const fleetDelta = previousFleetHours > 0
    ? Math.round(((totalFleetHours - previousFleetHours) / previousFleetHours) * 100 * 10) / 10
    : 0
  const avgUptime = Math.round(
    runtimeSensors.filter((s) => s.status !== 'disconnected').reduce((sum, s) => sum + s.uptimePercent, 0) /
    runtimeSensors.filter((s) => s.status !== 'disconnected').length * 10
  ) / 10
  const connectedCount = runtimeSensors.filter((s) => s.status === 'connected').length
  const warningCount = runtimeSensors.filter((s) => s.status === 'warning').length
  const disconnectedCount = runtimeSensors.filter((s) => s.status === 'disconnected').length
  const mostActiveSensor = [...runtimeSensors].sort((a, b) => b.totalHours - a.totalHours)[0]
  const avgDowntime = Math.round((100 - avgUptime) * 10) / 10

  const kpiStrip = (
    <div className="flex flex-col items-center gap-3 pb-6">
      {/* Sensor count row */}
      <div className="flex items-center justify-between bg-[var(--color-neutral-1)] border-t border-[var(--border-default)] px-6 py-2 w-full">
        <span className="text-[length:var(--font-size-base)] font-semibold text-[var(--color-neutral-12)]">
          {runtimeSensors.length} Sensors
        </span>
        <div className="flex items-center gap-[var(--space-sm)]">
          {/* Date range picker */}
          <div className="relative">
            <button
              onClick={() => setShowDatePicker((v) => !v)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] text-[length:var(--font-size-sm)] font-medium text-[var(--color-neutral-11)] hover:bg-[var(--color-neutral-3)] cursor-pointer transition-colors"
            >
              <Calendar size={14} className="text-[var(--color-neutral-7)]" />
              {new Date(dateFrom + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              {' - '}
              {new Date(dateTo + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              <ChevronDown size={14} className="text-[var(--color-neutral-7)]" />
            </button>

            {showDatePicker && (
              <>
                <div className="fixed inset-0 z-[var(--z-dropdown)]" onClick={() => setShowDatePicker(false)} />
                <div className="absolute right-0 top-full mt-1 z-[var(--z-modal)] w-[260px] rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-primary)] shadow-[var(--shadow-lg)] p-[var(--space-sm)] dropdown-animate">
                  <span className="block px-[var(--space-sm)] text-[length:var(--font-size-xs)] font-semibold uppercase tracking-[0.04em] text-[var(--color-neutral-8)] mb-[var(--space-xs)]">
                    Date Range
                  </span>
                  <div className="flex items-center gap-[var(--space-xs)] px-[var(--space-sm)]">
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="flex-1 px-2 py-1.5 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-primary)] text-[length:var(--font-size-sm)] text-[var(--color-neutral-11)] outline-none"
                    />
                    <span className="text-[length:var(--font-size-xs)] text-[var(--color-neutral-7)]">to</span>
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="flex-1 px-2 py-1.5 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-primary)] text-[length:var(--font-size-sm)] text-[var(--color-neutral-11)] outline-none"
                    />
                  </div>
                  <button
                    onClick={() => setShowDatePicker(false)}
                    className="w-[calc(100%-var(--space-md))] mx-[var(--space-sm)] mt-[var(--space-sm)] px-3 py-1.5 rounded-[var(--radius-md)] bg-[var(--color-accent-9)] text-white text-[length:var(--font-size-sm)] font-medium cursor-pointer hover:opacity-90 transition-opacity"
                  >
                    Apply
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Search */}
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

      {/* Filter chips + Sort + Actions */}
      <div className="flex items-center justify-between px-6 w-full max-w-[1280px]">
        <div className="flex items-center gap-[var(--space-xs)]">
          <button
            onClick={() => setStatusFilter(statusFilter === 'connected' ? 'all' : 'connected')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-lg)] border text-[length:var(--font-size-sm)] font-medium cursor-pointer transition-colors ${
              statusFilter === 'connected'
                ? 'bg-[#EEF1FF] border-[#ABBDF9] text-[#3A5BC7]'
                : 'bg-[var(--surface-primary)] border-[var(--border-default)] text-[var(--color-neutral-11)] hover:bg-[var(--color-neutral-3)]'
            }`}
          >
            <SlidersHorizontal size={13} />
            Status: Connected
            <ChevronDown size={13} />
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] text-[length:var(--font-size-sm)] font-medium text-[var(--color-neutral-11)] hover:bg-[var(--color-neutral-3)] cursor-pointer transition-colors">
            <MapPin size={13} />
            Location
            <ChevronDown size={13} />
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] text-[length:var(--font-size-sm)] font-medium text-[var(--color-neutral-11)] hover:bg-[var(--color-neutral-3)] cursor-pointer transition-colors">
            <Box size={13} />
            Asset
            <ChevronDown size={13} />
          </button>
          <button
            onClick={() => { setStatusFilter('all'); setSearchQuery('') }}
            className="text-[length:var(--font-size-sm)] font-medium text-[var(--color-accent-9)] hover:text-[var(--color-accent-11)] cursor-pointer transition-colors ml-1"
          >
            Reset
          </button>
        </div>

        <div className="flex items-center gap-[var(--space-sm)]">
          {/* Sort */}
          <div className="relative flex items-center">
            <ArrowUpDown size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-neutral-7)] pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="appearance-none pl-8 pr-7 py-1.5 rounded-[var(--radius-lg)] text-[length:var(--font-size-sm)] font-medium text-[var(--color-neutral-11)] cursor-pointer outline-none bg-transparent"
            >
              <option value="hours_desc">Most Hours</option>
              <option value="hours_asc">Least Hours</option>
              <option value="name">Name A-Z</option>
              <option value="delta">Biggest Change</option>
            </select>
            <ChevronDown size={14} className="absolute right-1 top-1/2 -translate-y-1/2 text-[var(--color-neutral-7)] pointer-events-none" />
          </div>

          <button className="text-[length:var(--font-size-sm)] font-semibold text-[var(--color-accent-9)] hover:underline cursor-pointer">
            Save View
          </button>
          <button className="flex items-center gap-1 text-[length:var(--font-size-sm)] font-medium text-[var(--color-neutral-11)] hover:text-[var(--color-neutral-12)] cursor-pointer">
            Saved Views
            <ChevronDown size={13} />
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] text-[length:var(--font-size-sm)] font-medium text-[var(--color-neutral-11)] hover:bg-[var(--color-neutral-3)] cursor-pointer transition-colors">
            <Share2 size={13} />
            Share
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-4 gap-[var(--space-md)] px-6 pt-3 w-full max-w-[1280px]">
        {/* Total Runtime */}
        <div className="flex items-center justify-between rounded-[20px] bg-[#EEF1FF] border border-[#D6DEFF] px-5 py-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center justify-center w-[56px] h-[56px] shrink-0 rounded-[16px] bg-white/70">
              <Clock size={20} className="text-[#5B6AD0]" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[length:11px] font-semibold uppercase tracking-[0.06em] text-[var(--color-neutral-11)]">Total<br />Runtime</span>
              <div className="flex items-center gap-1 mt-0.5 hidden">
                <TrendingUp size={12} className="text-[#2F9E44]" />
                <span className="text-[length:11px] font-medium text-[#2F9E44]">+2%</span>
              </div>
            </div>
          </div>
          <div className="shrink-0 flex flex-col items-center">
            <span className="text-[length:var(--font-size-3xl)] font-bold text-[#1C2024] leading-none">{Math.round(totalFleetHours).toLocaleString()}</span>
            <span className="text-[length:var(--font-size-sm)] font-medium text-[#60646C] mt-1">Hours</span>
          </div>
        </div>

        {/* Average Uptime */}
        <div className="flex items-center justify-between rounded-[20px] bg-[#E6F9EE] border border-[#C3ECD3] px-5 py-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center justify-center w-[56px] h-[56px] shrink-0 rounded-[16px] bg-white/70">
              <Activity size={20} className="text-[#2F9E44]" />
            </div>
            <div className="flex flex-col min-w-0 max-w-[80px]">
              <span className="text-[length:11px] font-semibold uppercase tracking-[0.06em] text-[var(--color-neutral-11)]">Average Uptime</span>
            </div>
          </div>
          <div className="shrink-0">
            <UptimeRingSmall percent={avgUptime} />
          </div>
        </div>

        {/* Total Downtime */}
        <div className="flex items-center justify-between rounded-[20px] bg-[#FFF0F0] border border-[#FECDD3] px-5 py-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center justify-center w-[56px] h-[56px] shrink-0 rounded-[16px] bg-white/70">
              <XCircle size={20} className="text-[#E03131]" />
            </div>
            <div className="flex flex-col min-w-0 max-w-[80px]">
              <span className="text-[length:11px] font-semibold uppercase tracking-[0.06em] text-[var(--color-neutral-11)]">Total Downtime</span>
            </div>
          </div>
          <div className="shrink-0 flex flex-col items-center">
            <span className="text-[length:var(--font-size-3xl)] font-bold text-[#1C2024] leading-none">{avgDowntime}</span>
            <span className="text-[length:var(--font-size-sm)] font-medium text-[#60646C] mt-1">Hours</span>
          </div>
        </div>

        {/* Overloaded */}
        <div className="flex items-center justify-between rounded-[20px] bg-[#FFF8E1] border border-[#FFE5A0] px-4 py-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center justify-center w-[56px] h-[56px] shrink-0 rounded-[16px] bg-white/70">
              <Radio size={20} className="text-[#E8890C]" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[length:11px] font-semibold uppercase tracking-[0.06em] text-[var(--color-neutral-11)]">Overloaded<br />Sensors</span>
            </div>
          </div>
          <div className="shrink-0 flex flex-col items-center">
            <span className="text-[length:var(--font-size-3xl)] font-bold text-[#1C2024] leading-none">{warningCount}</span>
            <span className="text-[length:var(--font-size-sm)] font-medium text-[#60646C] mt-1">Sensors</span>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col items-center w-full">
      {kpiPortal && createPortal(kpiStrip, kpiPortal)}

      {/* Sensor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[var(--space-md)] px-6 pb-6 w-full max-w-[1280px]">
        {filtered.map((sensor, i) => (
          <div key={sensor.id} className="card-animate" style={{ animationDelay: `${i * 60}ms` }}>
            <RuntimeCard
              sensor={sensor}
              selected={selectedIds.has(sensor.id)}
              onSelectChange={(val) => toggleSelection(sensor.id, val)}
              onEdit={() => { setEditSensorId(sensor.id); setShowEditModal(true) }}
            />
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-[var(--space-3xl)] text-center">
          <Clock size={40} className="text-[var(--color-neutral-5)] mb-3" />
          <h4 className="text-[length:var(--font-size-base)] font-semibold text-[var(--color-neutral-11)]">
            No sensors found
          </h4>
          <p className="mt-1 text-[length:var(--font-size-sm)] text-[var(--color-neutral-8)]">
            Try adjusting your filters or search query
          </p>
        </div>
      )}

      {/* Floating selection banner */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[var(--z-sticky)] flex items-center gap-4 px-5 py-3 rounded-[var(--radius-xl)] bg-[var(--color-neutral-12)] text-white shadow-[var(--shadow-lg)]">
          <span className="text-[length:14px] font-medium whitespace-nowrap">
            {selectedIds.size} Sensor{selectedIds.size !== 1 ? 's' : ''} selected
          </span>
          <div className="w-px h-5 bg-white/20" />
          <button
            onClick={() => { setEditSensorId([...selectedIds][0]); setShowEditModal(true) }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-md)] bg-white/10 hover:bg-white/20 text-[length:14px] font-medium cursor-pointer transition-colors"
          >
            <Pencil size={14} />
            Edit
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-md)] bg-[var(--color-error)]/80 hover:bg-[var(--color-error)] text-[length:14px] font-medium cursor-pointer transition-colors">
            <RotateCcw size={14} />
            Reset
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="flex items-center justify-center w-7 h-7 rounded-full hover:bg-white/15 cursor-pointer transition-colors ml-1"
            aria-label="Clear selection"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Edit Runtime Modal */}
      {editSensorId && (() => {
        const s = runtimeSensors.find((s) => s.id === editSensorId)
        if (!s) return null
        return (
          <MeterConfigModal
            open={showEditModal}
            onOpenChange={(open) => { setShowEditModal(open); if (!open) setEditSensorId(null) }}
            sensorName={s.name}
            totalRuntime={s.totalHours}
            existingMeterName={s.meterName}
            syncEnabled={s.meterSyncEnabled}
            runtimeThreshold={s.runtimeThreshold}
          />
        )
      })()}
    </div>
  )
}

function UptimeRingSmall({ percent }: { percent: number }) {
  const size = 80
  const stroke = 5
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percent / 100) * circumference

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#D4EDDA" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke="#2F9E44" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-1000"
        />
      </svg>
      <span className="absolute text-[length:var(--font-size-md)] font-bold text-[#1C2024]">
        {Math.round(percent)}%
      </span>
    </div>
  )
}
