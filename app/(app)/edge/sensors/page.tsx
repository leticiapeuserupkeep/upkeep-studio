'use client'

import { useMemo, useState, useEffect, useCallback } from 'react'
import {
  Siren,
  AlertTriangle,
  Wifi,
  WifiOff,
  Info,
  SlidersHorizontal,
  ChevronDown,
  MapPin,
  Box,
  Tag,
  LayoutGrid,
  Bookmark,
} from 'lucide-react'
import { Tooltip, TooltipProvider } from '@/app/components/ui'
import { EdgeSensorCard } from '@/app/components/edge/EdgeSensorCard'
import { runtimeSensors } from '@/app/lib/edge-data'
import type { RuntimeSensor, SensorStatus } from '@/app/lib/models'
import {
  countSensorsWithCriticalAlerts,
  countSensorsWithWarnings,
  countSensorsByStatus,
  uniqueLocations,
  uniqueAssetNames,
  allAssetTags,
} from '@/app/lib/edge-sensor-utils'

const STORAGE_VIEWS = 'edge-sensor-saved-views'

type KpiFilter = null | 'alert' | 'warning' | 'connected' | 'disconnected'
type GroupBy = 'none' | 'location' | 'asset'

interface SavedViewState {
  kpiFilter: KpiFilter
  statusFilter: 'all' | SensorStatus
  location: string
  asset: string
  tag: string
  search: string
  groupBy: GroupBy
  columns: 2 | 3
}

interface SavedViewRow extends SavedViewState {
  id: string
  name: string
}

function woIsActive(wo: { status: string }) {
  return wo.status === 'open' || wo.status === 'in_progress' || wo.status === 'on_hold'
}

function sensorMatchesAlert(s: RuntimeSensor) {
  return s.workOrders.some((wo) => wo.urgency === 'critical' && woIsActive(wo))
}

function sensorMatchesWarningRow(s: RuntimeSensor) {
  return (
    s.status === 'warning' ||
    s.workOrders.some((wo) => wo.urgency === 'high' && woIsActive(wo))
  )
}

function loadSavedViews(): SavedViewRow[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_VIEWS)
    if (!raw) return []
    const parsed = JSON.parse(raw) as SavedViewRow[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function KpiCard({
  tone,
  icon: Icon,
  label,
  value,
  tooltip,
  active,
  onClick,
}: {
  tone: 'danger' | 'warning' | 'success' | 'neutral'
  icon: typeof Siren
  label: string
  value: number
  tooltip: string
  active: boolean
  onClick: () => void
}) {
  const shell = {
    danger:
      'bg-[var(--color-error-light)] border-[var(--color-error-border)]',
    warning:
      'bg-[var(--color-warning-light)] border-[var(--color-warning-border)]',
    success:
      'bg-[var(--color-success-light)] border-[var(--color-success-border)]',
    neutral:
      'bg-[var(--surface-secondary)] border-[var(--border-default)]',
  }[tone]

  const valueColor = {
    danger: 'text-[var(--color-error)]',
    warning: 'text-[var(--color-warning)]',
    success: 'text-[var(--color-neutral-11)]',
    neutral: 'text-[var(--color-neutral-11)]',
  }[tone]

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-1 min-w-[200px] items-center gap-3 rounded-[var(--radius-lg)] border px-4 py-2.5 text-left transition-shadow cursor-pointer ${shell} ${
        active ? 'ring-2 ring-[var(--color-accent-9)] ring-offset-2 ring-offset-[var(--surface-canvas)]' : 'hover:shadow-sm'
      }`}
    >
      <Icon
        size={22}
        className={
          tone === 'danger'
            ? 'text-[var(--color-error)]'
            : tone === 'warning'
              ? 'text-[var(--color-warning)]'
              : tone === 'success'
                ? 'text-[var(--color-success)]'
                : 'text-[var(--color-neutral-8)]'
        }
      />
      <span className="text-[length:var(--font-size-sm)] text-[var(--color-neutral-8)] flex-1 min-w-0">
        {label}
      </span>
      <span className={`text-[22px] font-semibold leading-none tabular-nums ${valueColor}`}>
        {value}
      </span>
      <Tooltip content={tooltip} side="top">
        <span className="inline-flex p-0.5 rounded-full hover:bg-black/5 cursor-default">
          <Info size={14} className="text-[var(--color-neutral-7)]" />
        </span>
      </Tooltip>
    </button>
  )
}

export default function EdgeSensorsPage() {
  const [kpiFilter, setKpiFilter] = useState<KpiFilter>(null)
  const [statusFilter, setStatusFilter] = useState<'all' | SensorStatus>('all')
  const [location, setLocation] = useState('')
  const [asset, setAsset] = useState('')
  const [tag, setTag] = useState('')
  const [search, setSearch] = useState('')
  const [showFiltersPanel, setShowFiltersPanel] = useState(false)
  const [groupBy, setGroupBy] = useState<GroupBy>('none')
  const [columns, setColumns] = useState<2 | 3>(3)
  const [savedViews, setSavedViews] = useState<SavedViewRow[]>([])
  const [savedMenuOpen, setSavedMenuOpen] = useState(false)

  useEffect(() => {
    // Hydrate from localStorage after mount (SSR has no storage).
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read from localStorage
    setSavedViews(loadSavedViews())
  }, [])

  const persistViews = useCallback((rows: SavedViewRow[]) => {
    setSavedViews(rows)
    localStorage.setItem(STORAGE_VIEWS, JSON.stringify(rows))
  }, [])

  const alerts = countSensorsWithCriticalAlerts(runtimeSensors)
  const warnings = countSensorsWithWarnings(runtimeSensors)
  const connected = countSensorsByStatus(runtimeSensors, 'connected')
  const disconnected = countSensorsByStatus(runtimeSensors, 'disconnected')

  const locations = useMemo(() => uniqueLocations(runtimeSensors), [])
  const assets = useMemo(() => uniqueAssetNames(runtimeSensors), [])
  const tags = useMemo(() => allAssetTags(runtimeSensors), [])

  const filtered = useMemo(() => {
    let list = [...runtimeSensors]

    if (kpiFilter === 'alert') list = list.filter(sensorMatchesAlert)
    if (kpiFilter === 'warning') list = list.filter(sensorMatchesWarningRow)
    if (kpiFilter === 'connected') list = list.filter((s) => s.status === 'connected')
    if (kpiFilter === 'disconnected') list = list.filter((s) => s.status === 'disconnected')

    if (statusFilter !== 'all') {
      list = list.filter((s) => s.status === statusFilter)
    }
    if (location) list = list.filter((s) => s.locationName === location)
    if (asset) list = list.filter((s) => s.assetName === asset)
    if (tag) list = list.filter((s) => s.assetTags?.includes(tag) ?? false)

    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.assetName.toLowerCase().includes(q) ||
          s.locationName.toLowerCase().includes(q) ||
          s.type.toLowerCase().includes(q) ||
          s.id.toLowerCase().includes(q),
      )
    }

    return list
  }, [kpiFilter, statusFilter, location, asset, tag, search])

  const grouped = useMemo(() => {
    if (groupBy === 'none') return [['', filtered]] as [string, RuntimeSensor[]][]
    const keyFn = groupBy === 'location' ? (s: RuntimeSensor) => s.locationName : (s: RuntimeSensor) => s.assetName
    const map = new Map<string, RuntimeSensor[]>()
    for (const s of filtered) {
      const k = keyFn(s)
      if (!map.has(k)) map.set(k, [])
      map.get(k)!.push(s)
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b))
  }, [filtered, groupBy])

  function toggleKpi(key: Exclude<KpiFilter, null>) {
    setKpiFilter((prev) => (prev === key ? null : key))
  }

  function resetFilters() {
    setKpiFilter(null)
    setStatusFilter('all')
    setLocation('')
    setAsset('')
    setTag('')
    setSearch('')
  }

  const currentState = useCallback(
    (): SavedViewState => ({
      kpiFilter,
      statusFilter,
      location,
      asset,
      tag,
      search,
      groupBy,
      columns,
    }),
    [kpiFilter, statusFilter, location, asset, tag, search, groupBy, columns],
  )

  function applySavedView(row: SavedViewRow) {
    setKpiFilter(row.kpiFilter ?? null)
    setStatusFilter(row.statusFilter ?? 'all')
    setLocation(row.location ?? '')
    setAsset(row.asset ?? '')
    setTag(row.tag ?? '')
    setSearch(row.search ?? '')
    setGroupBy(row.groupBy ?? 'none')
    setColumns(row.columns === 2 ? 2 : 3)
    setSavedMenuOpen(false)
  }

  function saveCurrentView() {
    const name = window.prompt('Name this view')
    if (!name?.trim()) return
    const row: SavedViewRow = {
      id: `v-${Date.now()}`,
      name: name.trim(),
      ...currentState(),
    }
    persistViews([...savedViews, row])
  }

  const gridClass =
    columns === 3
      ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5'
      : 'grid grid-cols-1 md:grid-cols-2 gap-5'

  return (
    <TooltipProvider delayDuration={250}>
      <div className="w-full max-w-[1200px] mx-auto px-6 py-6 flex flex-col gap-6">
        <div className="flex flex-wrap gap-5">
          <KpiCard
            tone="danger"
            icon={Siren}
            label="Alert"
            value={alerts}
            tooltip="Sensors with at least one active critical work order."
            active={kpiFilter === 'alert'}
            onClick={() => toggleKpi('alert')}
          />
          <KpiCard
            tone="warning"
            icon={AlertTriangle}
            label="Warning"
            value={warnings}
            tooltip="Sensors in overloaded state or with an active high-urgency work order."
            active={kpiFilter === 'warning'}
            onClick={() => toggleKpi('warning')}
          />
          <KpiCard
            tone="success"
            icon={Wifi}
            label="Connected"
            value={connected}
            tooltip="Sensors reporting a connected status."
            active={kpiFilter === 'connected'}
            onClick={() => toggleKpi('connected')}
          />
          <KpiCard
            tone="neutral"
            icon={WifiOff}
            label="Disconnected"
            value={disconnected}
            tooltip="Sensors currently disconnected from the gateway."
            active={kpiFilter === 'disconnected'}
            onClick={() => toggleKpi('disconnected')}
          />
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2 justify-between gap-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowFiltersPanel((v) => !v)}
                className={`inline-flex items-center gap-2 h-7 px-3 rounded-[var(--radius-md)] border text-[length:var(--font-size-sm)] font-medium cursor-pointer transition-colors ${
                  showFiltersPanel
                    ? 'bg-[var(--color-accent-1)] border-[var(--color-accent-4)] text-[var(--color-accent-11)]'
                    : 'bg-[var(--surface-primary)] border-[var(--border-default)] text-[var(--color-neutral-11)] hover:bg-[var(--color-neutral-3)]'
                }`}
              >
                <SlidersHorizontal size={14} />
                Filters
              </button>

              <label className="inline-flex items-center gap-1.5 h-7 px-3 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-primary)] text-[length:var(--font-size-sm)] cursor-pointer">
                <span className="text-[var(--color-neutral-8)]">Status</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as 'all' | SensorStatus)}
                  className="bg-transparent font-medium text-[var(--color-neutral-11)] outline-none cursor-pointer max-w-[120px]"
                >
                  <option value="all">All</option>
                  <option value="connected">Connected</option>
                  <option value="disconnected">Disconnected</option>
                  <option value="warning">Overloaded</option>
                </select>
                <ChevronDown size={14} className="text-[var(--color-neutral-7)] shrink-0" />
              </label>

              <label className="inline-flex items-center gap-1.5 h-7 px-3 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-primary)] text-[length:var(--font-size-sm)] cursor-pointer">
                <MapPin size={14} className="text-[var(--color-neutral-7)]" />
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="bg-transparent font-medium text-[var(--color-neutral-11)] outline-none cursor-pointer max-w-[140px]"
                >
                  <option value="">Location</option>
                  {locations.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="text-[var(--color-neutral-7)] shrink-0" />
              </label>

              <label className="inline-flex items-center gap-1.5 h-7 px-3 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-primary)] text-[length:var(--font-size-sm)] cursor-pointer">
                <Box size={14} className="text-[var(--color-neutral-7)]" />
                <select
                  value={asset}
                  onChange={(e) => setAsset(e.target.value)}
                  className="bg-transparent font-medium text-[var(--color-neutral-11)] outline-none cursor-pointer max-w-[140px]"
                >
                  <option value="">Asset</option>
                  {assets.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="text-[var(--color-neutral-7)] shrink-0" />
              </label>

              <label className="inline-flex items-center gap-1.5 h-7 px-3 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-primary)] text-[length:var(--font-size-sm)] cursor-pointer">
                <Tag size={14} className="text-[var(--color-neutral-7)]" />
                <select
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  className="bg-transparent font-medium text-[var(--color-neutral-11)] outline-none cursor-pointer max-w-[160px]"
                >
                  <option value="">Asset custom fields</option>
                  {tags.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="text-[var(--color-neutral-7)] shrink-0" />
              </label>

              <button
                type="button"
                onClick={resetFilters}
                className="text-[length:var(--font-size-sm)] font-medium text-[var(--color-accent-9)] hover:underline cursor-pointer px-2"
              >
                Reset
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <label className="inline-flex items-center gap-1.5 h-7 px-3 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-primary)] text-[length:var(--font-size-sm)] cursor-pointer">
                <span className="text-[var(--color-neutral-8)]">Group by</span>
                <select
                  value={groupBy}
                  onChange={(e) => setGroupBy(e.target.value as GroupBy)}
                  className="bg-transparent font-medium text-[var(--color-neutral-11)] outline-none cursor-pointer"
                >
                  <option value="none">All</option>
                  <option value="location">Location</option>
                  <option value="asset">Asset</option>
                </select>
                <ChevronDown size={14} className="text-[var(--color-neutral-7)] shrink-0" />
              </label>

              <button
                type="button"
                onClick={() => setColumns(columns === 3 ? 2 : 3)}
                className="inline-flex items-center gap-1.5 h-7 px-3 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-primary)] text-[length:var(--font-size-sm)] font-medium text-[var(--color-neutral-11)] hover:bg-[var(--color-neutral-3)] cursor-pointer"
                title="Toggle column count"
              >
                <LayoutGrid size={14} />
                {columns} cols
              </button>

              <div className="w-px h-6 bg-[var(--border-default)] mx-1 hidden sm:block" />

              <button
                type="button"
                onClick={saveCurrentView}
                className="inline-flex items-center gap-1.5 h-7 px-2 text-[length:var(--font-size-sm)] font-semibold text-[var(--color-accent-9)] hover:underline cursor-pointer"
              >
                <Bookmark size={14} />
                Save view
              </button>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setSavedMenuOpen((o) => !o)}
                  className="inline-flex items-center gap-1 h-7 px-2 text-[length:var(--font-size-sm)] font-medium text-[var(--color-neutral-11)] hover:text-[var(--color-neutral-12)] cursor-pointer"
                >
                  Saved views
                  <ChevronDown size={14} className={savedMenuOpen ? 'rotate-180' : ''} />
                </button>
                {savedMenuOpen && (
                  <>
                    <button
                      type="button"
                      className="fixed inset-0 z-[var(--z-dropdown)] cursor-default"
                      aria-label="Close menu"
                      onClick={() => setSavedMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-1 z-[var(--z-modal)] min-w-[200px] max-h-[280px] overflow-auto rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] shadow-[var(--shadow-lg)] py-1">
                      {savedViews.length === 0 ? (
                        <div className="px-3 py-2 text-[length:var(--font-size-sm)] text-[var(--color-neutral-8)]">
                          No saved views yet
                        </div>
                      ) : (
                        savedViews.map((v) => (
                          <button
                            key={v.id}
                            type="button"
                            onClick={() => applySavedView(v)}
                            className="w-full text-left px-3 py-2 text-[length:var(--font-size-sm)] hover:bg-[var(--color-neutral-3)] cursor-pointer"
                          >
                            {v.name}
                          </button>
                        ))
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {showFiltersPanel && (
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] px-4 py-3">
              <label className="block text-[length:var(--font-size-xs)] font-semibold uppercase tracking-wide text-[var(--color-neutral-8)] mb-1.5">
                Search sensors
              </label>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Name, asset, location, type, or ID"
                className="w-full max-w-md px-3 py-2 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-secondary)] text-[length:var(--font-size-sm)] text-[var(--color-neutral-12)] outline-none focus:ring-2 focus:ring-[var(--color-accent-6)]"
              />
            </div>
          )}
        </div>

        {grouped.map(([heading, sensors]) => (
          <div key={heading || 'all'} className="flex flex-col gap-4">
            {heading ? (
              <h2 className="text-[length:var(--font-size-base)] font-semibold text-[var(--color-neutral-12)]">
                {heading}
              </h2>
            ) : null}
            <div className={gridClass}>
              {sensors.map((sensor) => (
                <EdgeSensorCard key={sensor.id} sensor={sensor} />
              ))}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center rounded-[var(--radius-xl)] border border-dashed border-[var(--border-default)] bg-[var(--surface-secondary)]">
            <WifiOff size={36} className="text-[var(--color-neutral-5)] mb-2" />
            <p className="text-[length:var(--font-size-base)] font-semibold text-[var(--color-neutral-11)]">
              No sensors match your filters
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-3 text-[length:var(--font-size-sm)] font-medium text-[var(--color-accent-9)] hover:underline cursor-pointer"
            >
              Reset filters
            </button>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}
