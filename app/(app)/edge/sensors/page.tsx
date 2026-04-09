'use client'

import { useMemo, useState, useEffect, useCallback } from 'react'
import * as Collapsible from '@radix-ui/react-collapsible'
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
  Bookmark,
} from 'lucide-react'
import {
  Tooltip,
  TooltipProvider,
  Button,
  FilterSelect,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/app/components/ui'
import { Badge } from '@/app/components/ui/Badge'
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

const GROUP_BY_OPTIONS: { value: GroupBy; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'location', label: 'Locations' },
  { value: 'asset', label: 'Assets' },
]

const STATUS_FILTER_OPTIONS: { value: 'all' | SensorStatus; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'connected', label: 'Connected' },
  { value: 'disconnected', label: 'Disconnected' },
  { value: 'warning', label: 'Overloaded' },
]

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

/** Primary section (e.g. location), each with secondary buckets (e.g. asset). */
interface NestedSensorSection {
  primary: string
  secondary: Array<{ label: string; sensors: RuntimeSensor[] }>
}

function groupSensorsByLocationThenAsset(sensors: RuntimeSensor[]): NestedSensorSection[] {
  const byLocation = new Map<string, RuntimeSensor[]>()
  for (const s of sensors) {
    const loc = s.locationName
    if (!byLocation.has(loc)) byLocation.set(loc, [])
    byLocation.get(loc)!.push(s)
  }
  const locations = [...byLocation.keys()].sort((a, b) => a.localeCompare(b))
  return locations.map((primary) => {
    const inLoc = byLocation.get(primary)!
    const byAsset = new Map<string, RuntimeSensor[]>()
    for (const s of inLoc) {
      const an = s.assetName
      if (!byAsset.has(an)) byAsset.set(an, [])
      byAsset.get(an)!.push(s)
    }
    const secondary = [...byAsset.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([label, sens]) => ({ label, sensors: sens }))
    return { primary, secondary }
  })
}

function pluralCount(n: number, singular: string, plural: string) {
  return `${n} ${n === 1 ? singular : plural}`
}

function groupSensorsByAssetThenLocation(sensors: RuntimeSensor[]): NestedSensorSection[] {
  const byAsset = new Map<string, RuntimeSensor[]>()
  for (const s of sensors) {
    const an = s.assetName
    if (!byAsset.has(an)) byAsset.set(an, [])
    byAsset.get(an)!.push(s)
  }
  const assets = [...byAsset.keys()].sort((a, b) => a.localeCompare(b))
  return assets.map((primary) => {
    const inAsset = byAsset.get(primary)!
    const byLoc = new Map<string, RuntimeSensor[]>()
    for (const s of inAsset) {
      const loc = s.locationName
      if (!byLoc.has(loc)) byLoc.set(loc, [])
      byLoc.get(loc)!.push(s)
    }
    const secondary = [...byLoc.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([label, sens]) => ({ label, sensors: sens }))
    return { primary, secondary }
  })
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
      'bg-[var(--surface-primary)] border-[var(--border-default)]',
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
      className={`flex w-[240px] max-w-full shrink-0 min-w-0 items-center gap-3 rounded-[var(--radius-lg)] border px-4 py-2.5 text-left transition-shadow cursor-pointer ${shell} ${
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

  const locationFilterOptions = useMemo(
    () => [
      { value: '', label: 'Location' },
      ...locations.map((l) => ({ value: l, label: l })),
    ],
    [locations],
  )
  const assetFilterOptions = useMemo(
    () => [
      { value: '', label: 'Asset' },
      ...assets.map((a) => ({ value: a, label: a })),
    ],
    [assets],
  )
  const tagFilterOptions = useMemo(
    () => [
      { value: '', label: 'Asset custom fields' },
      ...tags.map((t) => ({ value: t, label: t })),
    ],
    [tags],
  )

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

  const nestedSections = useMemo(() => {
    if (groupBy === 'location') return groupSensorsByLocationThenAsset(filtered)
    if (groupBy === 'asset') return groupSensorsByAssetThenLocation(filtered)
    return null
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

  /** Fixed max 400px tracks + start justify so cards hug the left; extra row space stays on the right. */
  const gridClass =
    columns === 3
      ? 'grid grid-cols-1 gap-[24px] justify-items-start justify-content-start md:[grid-template-columns:repeat(2,minmax(0,400px))] xl:[grid-template-columns:repeat(3,minmax(0,400px))]'
      : 'grid grid-cols-1 gap-[24px] justify-items-start justify-content-start md:[grid-template-columns:repeat(2,minmax(0,400px))]'

  return (
    <TooltipProvider delayDuration={250}>
      <div className="w-full min-w-0 px-6 py-6 flex flex-col gap-6">
        <div className="flex flex-wrap items-stretch gap-5 w-full justify-start">
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

        <div className="flex flex-col gap-4 w-full min-w-0">
          <div className="flex flex-wrap items-center gap-2 justify-between gap-y-3 w-full min-w-0">
            <div className="flex flex-wrap items-center gap-2 min-w-0">
              <Button
                type="button"
                variant={showFiltersPanel ? 'subtle' : 'secondary'}
                size="sm"
                onClick={() => setShowFiltersPanel((v) => !v)}
                className="!h-7 min-h-7 px-3 rounded-[var(--radius-md)] gap-2 text-[length:var(--font-size-sm)] font-medium shadow-none"
                aria-expanded={showFiltersPanel}
                aria-controls="edge-sensors-search-panel"
              >
                <SlidersHorizontal size={14} />
                Filters
              </Button>

              <FilterSelect
                ariaLabel="Filter by connection status"
                prefix="Status"
                value={statusFilter}
                options={STATUS_FILTER_OPTIONS}
                onChange={(v) => setStatusFilter(v as 'all' | SensorStatus)}
                triggerClassName="max-w-[200px]"
              />

              <FilterSelect
                ariaLabel="Filter by location"
                icon={<MapPin size={14} />}
                value={location}
                options={locationFilterOptions}
                onChange={setLocation}
                triggerClassName="max-w-[160px]"
              />

              <FilterSelect
                ariaLabel="Filter by asset"
                icon={<Box size={14} />}
                value={asset}
                options={assetFilterOptions}
                onChange={setAsset}
                triggerClassName="max-w-[160px]"
              />

              <FilterSelect
                ariaLabel="Filter by asset custom field"
                icon={<Tag size={14} />}
                value={tag}
                options={tagFilterOptions}
                onChange={setTag}
                triggerClassName="max-w-[180px]"
              />

              <button
                type="button"
                onClick={resetFilters}
                className="text-[length:var(--font-size-sm)] font-medium text-[var(--color-accent-9)] hover:underline cursor-pointer px-2"
              >
                Reset
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <FilterSelect
                ariaLabel="Group sensors by"
                prefix="Group by"
                value={groupBy}
                options={GROUP_BY_OPTIONS}
                onChange={(v) => setGroupBy(v as GroupBy)}
              />

              <div className="w-px h-6 bg-[var(--border-default)] mx-1 hidden sm:block" />

              <button
                type="button"
                onClick={saveCurrentView}
                className="inline-flex items-center gap-1.5 h-7 px-2 text-[length:var(--font-size-sm)] font-semibold text-[var(--color-accent-9)] hover:underline cursor-pointer"
              >
                <Bookmark size={14} />
                Save view
              </button>

              <DropdownMenu open={savedMenuOpen} onOpenChange={setSavedMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="!h-7 min-h-7 px-2 gap-1 text-[length:var(--font-size-sm)] font-medium !text-[var(--color-neutral-11)] hover:!text-[var(--color-neutral-12)] shadow-none"
                    aria-label="Saved views"
                  >
                    Saved views
                    <ChevronDown
                      size={14}
                      className={savedMenuOpen ? 'rotate-180 transition-transform duration-[var(--duration-fast)]' : 'transition-transform duration-[var(--duration-fast)]'}
                      aria-hidden
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" minWidth="200px" className="max-h-[280px] overflow-y-auto">
                  {savedViews.length === 0 ? (
                    <div className="px-[var(--space-md)] py-2 text-[length:var(--font-size-sm)] text-[var(--color-neutral-8)]">
                      No saved views yet
                    </div>
                  ) : (
                    savedViews.map((v) => (
                      <DropdownMenuItem key={v.id} onSelect={() => applySavedView(v)}>
                        {v.name}
                      </DropdownMenuItem>
                    ))
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {showFiltersPanel && (
            <div
              id="edge-sensors-search-panel"
              className="w-full rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] px-4 py-3"
            >
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

        {groupBy === 'none' ? (
          <div className={`${gridClass} w-full min-w-0`}>
            {filtered.map((sensor) => (
              <EdgeSensorCard key={sensor.id} sensor={sensor} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4 w-full min-w-0">
            {nestedSections?.map((section) => {
              const sensorCount = section.secondary.reduce((n, g) => n + g.sensors.length, 0)
              const bucketCount = section.secondary.length
              return (
                <Collapsible.Root key={`${groupBy}-${section.primary}`} defaultOpen>
                  <div className="rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-primary)] shadow-[var(--shadow-xs)] overflow-hidden">
                    <Collapsible.Trigger
                      type="button"
                      className="flex w-full min-w-0 items-center gap-3 px-4 py-3 text-left hover:bg-[var(--color-neutral-2)] transition-colors duration-[var(--duration-fast)] cursor-pointer data-[state=open]:[&_.section-chevron]:rotate-180"
                    >
                      <h2 className="flex-1 min-w-0 truncate text-[length:var(--font-size-base)] font-semibold text-[var(--color-neutral-12)]">
                        {section.primary}
                      </h2>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge severity="neutral" variant="outline" size="sm">
                          {pluralCount(sensorCount, 'sensor', 'sensors')}
                        </Badge>
                        <Badge severity="neutral" variant="outline" size="sm">
                          {groupBy === 'location'
                            ? pluralCount(bucketCount, 'asset', 'assets')
                            : pluralCount(bucketCount, 'location', 'locations')}
                        </Badge>
                        <ChevronDown
                          className="section-chevron h-5 w-5 shrink-0 text-[var(--color-neutral-7)] transition-transform duration-300 [transition-timing-function:var(--ease-default)]"
                          aria-hidden
                        />
                      </div>
                    </Collapsible.Trigger>
                    <Collapsible.Content>
                      <div className="border-t border-[var(--border-subtle)] px-4 pb-4 pt-4">
                        <div className={`${gridClass} w-full min-w-0`}>
                          {section.secondary.flatMap((sub) => sub.sensors).map((sensor) => (
                            <EdgeSensorCard key={sensor.id} sensor={sensor} />
                          ))}
                        </div>
                      </div>
                    </Collapsible.Content>
                  </div>
                </Collapsible.Root>
              )
            })}
          </div>
        )}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center w-full py-16 text-center rounded-[var(--radius-xl)] border border-dashed border-[var(--border-default)] bg-[var(--surface-secondary)]">
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
