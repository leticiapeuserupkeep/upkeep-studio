'use client'

import { useState, useMemo } from 'react'
import {
  Timer, TrendingUp, TrendingDown, Clock, Activity,
  Zap, Search, ChevronDown,
} from 'lucide-react'
import { KPI } from '@/app/components/ui/KPI'
import { Chip } from '@/app/components/ui/Chip'
import { RuntimeCard } from '@/app/components/edge/RuntimeCard'
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

  return (
    <div className="flex flex-col gap-[var(--space-xl)] p-[var(--space-xl)]">
      {/* Period selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-[var(--space-xs)]">
          {(Object.entries(periodLabels) as [PeriodFilter, string][]).map(([key, label]) => (
            <Chip key={key} active={period === key} onClick={() => setPeriod(key)}>
              {label}
            </Chip>
          ))}
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-4 gap-[var(--space-md)]">
        <KPI
          label="Total Fleet Hours"
          value={`${Math.round(totalFleetHours).toLocaleString()}`}
          subtitle={`${fleetDelta >= 0 ? '+' : ''}${fleetDelta}% vs prev period`}
          icon={<Timer size={18} className="text-[var(--color-accent-9)]" />}
          accent
        />
        <KPI
          label="Avg Uptime"
          value={`${avgUptime}%`}
          subtitle={`${connectedCount} connected sensors`}
          icon={<Activity size={18} className="text-[var(--color-success)]" />}
        />
        <KPI
          label="Most Active"
          value={mostActiveSensor?.name.split(' |')[0] || '-'}
          subtitle={`${mostActiveSensor?.totalHours.toFixed(1)} hrs this period`}
          icon={<Zap size={18} className="text-[var(--color-warning)]" />}
        />
        <KPI
          label="Needs Attention"
          value={`${warningCount + disconnectedCount}`}
          subtitle={`${warningCount} warning, ${disconnectedCount} offline`}
          icon={
            warningCount + disconnectedCount > 0 ? (
              <TrendingDown size={18} className="text-[var(--color-error)]" />
            ) : (
              <TrendingUp size={18} className="text-[var(--color-success)]" />
            )
          }
        />
      </div>

      {/* Filters & Search */}
      <div className="flex items-center justify-between gap-[var(--space-md)]">
        <div className="flex items-center gap-[var(--space-xs)]">
          <Chip active={statusFilter === 'all'} onClick={() => setStatusFilter('all')}>
            All ({runtimeSensors.length})
          </Chip>
          <Chip active={statusFilter === 'connected'} onClick={() => setStatusFilter('connected')}>
            Connected ({connectedCount})
          </Chip>
          <Chip active={statusFilter === 'warning'} onClick={() => setStatusFilter('warning')}>
            Warning ({warningCount})
          </Chip>
          <Chip active={statusFilter === 'disconnected'} onClick={() => setStatusFilter('disconnected')}>
            Disconnected ({disconnectedCount})
          </Chip>
        </div>

        <div className="flex items-center gap-[var(--space-sm)]">
          <div className="flex items-center gap-[var(--space-xs)] px-2.5 py-1.5 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)]">
            <Search size={14} className="text-[var(--color-neutral-7)] shrink-0" />
            <input
              type="text"
              placeholder="Search sensors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-[180px] text-[length:var(--font-size-sm)] bg-transparent outline-none text-[var(--color-neutral-11)] placeholder:text-[var(--color-neutral-7)]"
            />
          </div>

          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="appearance-none pl-2.5 pr-7 py-1.5 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] text-[length:var(--font-size-sm)] font-medium text-[var(--color-neutral-11)] cursor-pointer outline-none"
            >
              <option value="hours_desc">Most Hours</option>
              <option value="hours_asc">Least Hours</option>
              <option value="name">Name A-Z</option>
              <option value="delta">Biggest Change</option>
            </select>
            <ChevronDown
              size={14}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-neutral-7)] pointer-events-none"
            />
          </div>
        </div>
      </div>

      {/* Sensor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[var(--space-md)]">
        {filtered.map((sensor, i) => (
          <div key={sensor.id} className="card-animate" style={{ animationDelay: `${i * 60}ms` }}>
            <RuntimeCard sensor={sensor} />
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
    </div>
  )
}
