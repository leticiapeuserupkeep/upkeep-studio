'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ChevronLeft, MapPin, Clock, ChevronUp, ChevronDown,
  Settings, MoreHorizontal, Pencil, Plus, RefreshCw,
  AlertTriangle, Info, PanelLeft,
} from 'lucide-react'
import { Badge } from '@/app/components/ui/Badge'
import { Button } from '@/app/components/ui/Button'
import { DonutChart } from '@/app/components/ui/DonutChart'
import { vehicles } from '@/app/lib/fleet-data'

/* ── Tabs ── */

const tabs = [
  'Overview',
  'Vehicle Details',
  'Preventive Maintenance',
  'Work Orders',
  'Recalls (1)',
  'Inspections',
  'Financials',
  'More',
] as const

type Tab = (typeof tabs)[number]

/* ── Reliability status config ── */

const reliabilityStatusConfig = {
  operational: { label: 'Operations', severity: 'success' as const },
  maintenance: { label: 'Maintenance', severity: 'warning' as const },
  critical: { label: 'Critical', severity: 'danger' as const },
}

/* ── Detail Row component ── */

function DetailRow({ label, value, isLink }: { label: string; value?: string | number | null; isLink?: boolean }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-[var(--border-subtle)] last:border-b-0">
      <span className="text-[length:var(--font-size-base)] text-[var(--color-neutral-8)]">{label}</span>
      {value != null && value !== '' ? (
        isLink ? (
          <a href="#" className="text-[length:var(--font-size-base)] text-[var(--color-accent-9)] hover:underline font-medium">{value}</a>
        ) : (
          <span className="text-[length:var(--font-size-base)] text-[var(--color-neutral-12)] font-medium">{String(value)}</span>
        )
      ) : (
        <span className="text-[length:var(--font-size-base)] text-[var(--color-neutral-7)]">—</span>
      )}
    </div>
  )
}

/* ── Collapsible section ── */

function Section({ title, defaultOpen = true, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-[var(--border-subtle)]">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full py-[var(--space-lg)] cursor-pointer group"
      >
        <h3 className="text-[length:var(--font-size-md)] font-semibold text-[var(--color-neutral-12)]">{title}</h3>
        {open ? (
          <ChevronUp size={18} className="text-[var(--color-neutral-7)] group-hover:text-[var(--color-neutral-9)] transition-colors" />
        ) : (
          <ChevronDown size={18} className="text-[var(--color-neutral-7)] group-hover:text-[var(--color-neutral-9)] transition-colors" />
        )}
      </button>
      {open && (
        <div className="pb-[var(--space-lg)]">
          {children}
        </div>
      )}
    </div>
  )
}

/* ── Main Page ── */

export default function VehicleDetailPage() {
  const params = useParams()
  const vehicleId = params.vehicleId as string
  const vehicle = vehicles.find((v) => v.id === vehicleId)
  const [activeTab, setActiveTab] = useState<Tab>('Overview')

  if (!vehicle) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-[var(--space-md)]">
        <AlertTriangle size={40} className="text-[var(--color-neutral-5)]" />
        <p className="text-[length:var(--font-size-lg)] text-[var(--color-neutral-8)]">Vehicle not found</p>
        <Link href="/fleet/vehicles">
          <Button variant="outline" size="sm">
            <ChevronLeft size={14} />
            Back to Vehicles
          </Button>
        </Link>
      </div>
    )
  }

  const rel = vehicle.reliability
  const relStatus = reliabilityStatusConfig[rel.status]
  const lastUpdated = new Date(vehicle.lastUpdated)
  const formattedDate = lastUpdated.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const formattedTime = lastUpdated.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZoneName: 'short' })

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[var(--surface-canvas)]">
      {/* Top bar */}
      <div className="flex items-center justify-between px-[var(--space-md)] py-[var(--space-sm)] border-b border-[var(--border-default)] bg-[var(--surface-primary)] shrink-0">
        <div className="flex items-center gap-[var(--space-sm)] text-[length:var(--font-size-sm)] text-[var(--color-neutral-8)]">
          <button
            onClick={() => window.dispatchEvent(new Event('toggle-sidebar'))}
            className="flex items-center justify-center w-8 h-8 rounded-[var(--radius-lg)] hover:bg-[var(--color-neutral-3)] cursor-pointer transition-colors duration-[var(--duration-fast)]"
            aria-label="Toggle sidebar"
          >
            <PanelLeft size={20} className="text-[color:var(--color-neutral-7)]" />
          </button>
          <span>Vehicles</span>
          <span>/</span>
          <span className="text-[var(--color-neutral-12)] font-medium">{vehicle.year} {vehicle.make} {vehicle.model} (VIN)</span>
        </div>
        <div className="flex items-center gap-[var(--space-xs)]">
          <Button variant="ghost" size="sm"><Pencil size={14} /></Button>
          <Button variant="ghost" size="sm"><Settings size={14} /></Button>
          <Button variant="ghost" size="sm"><MoreHorizontal size={14} /></Button>
          <span className="w-px h-5 bg-[var(--border-default)]" />
          <span className="text-[length:var(--font-size-sm)] text-[var(--color-neutral-8)]">Quick Actions</span>
          <ChevronDown size={14} className="text-[var(--color-neutral-7)]" />
          <Button variant="outline" size="sm">Create Work Order</Button>
          <Button variant="primary" size="sm">
            <Plus size={14} />
            Add Asset
          </Button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Main content */}
        <div className="flex-1 overflow-y-auto">
          {/* Vehicle hero */}
          <div className="px-[var(--space-2xl)] pt-[var(--space-lg)] pb-0 bg-[var(--surface-primary)]">
            <Link
              href="/fleet/vehicles"
              className="inline-flex items-center gap-1 text-[length:var(--font-size-sm)] text-[var(--color-accent-9)] hover:text-[var(--color-accent-11)] mb-[var(--space-md)] transition-colors"
            >
              <ChevronLeft size={14} />
              Back to Vehicles
            </Link>

            <div className="flex items-start gap-[var(--space-xl)]">
              <div className="w-[160px] h-[120px] rounded-[var(--radius-xl)] overflow-hidden bg-[var(--color-neutral-3)] shrink-0 border border-[var(--border-default)]">
                <img
                  src={vehicle.image}
                  alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex flex-col flex-1 min-w-0">
                <p className="text-[length:var(--font-size-xs)] text-[var(--color-neutral-8)] font-mono mb-0.5">
                  VIN: {vehicle.vin}
                </p>
                <h1 className="text-[length:var(--font-size-2xl)] leading-[24px] font-bold text-[var(--color-neutral-12)] mb-1">
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </h1>
                <div className="flex items-center gap-[var(--space-sm)] text-[length:var(--font-size-sm)] text-[var(--color-neutral-8)] mb-1 pt-[7px]">
                  <span>{vehicle.drivetrain}</span>
                  <span className="text-[length:26px] leading-[12px] font-extrabold text-[var(--color-neutral-7)]">·</span>
                  <button
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 -mx-1.5 -my-0.5 rounded-[var(--radius-sm)] bg-[var(--color-neutral-3)] hover:bg-[var(--color-neutral-4)] hover:scale-[1.03] active:scale-[0.97] cursor-pointer transition-all duration-[var(--duration-fast)] ease-out group/odo"
                    title="Edit odometer"
                  >
                    {vehicle.odometer != null ? `${vehicle.odometer.toLocaleString()} mi` : '— mi'}
                    <Pencil size={12} className="shrink-0 w-0 group-hover/odo:w-3 opacity-0 group-hover/odo:opacity-100 transition-all duration-[var(--duration-fast)] ease-out text-[var(--color-neutral-7)]" />
                  </button>
                </div>
                <div className="flex items-center gap-[var(--space-sm)] text-[length:var(--font-size-sm)] text-[var(--color-neutral-8)] pt-[20px]">
                  <div className="flex items-center gap-1 text-[var(--color-neutral-9)]">
                    <MapPin size={12} />
                    <span>{vehicle.location}</span>
                  </div>
                  <span className="italic">(Last Updated {formattedDate} {formattedTime})</span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-0 mt-[var(--space-xl)] -mb-px overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-[var(--space-md)] py-[var(--space-sm)] text-[length:var(--font-size-sm)] font-medium whitespace-nowrap border-b-2 transition-colors duration-[var(--duration-fast)] cursor-pointer ${
                    activeTab === tab
                      ? 'border-[var(--color-accent-9)] text-[var(--color-accent-9)]'
                      : 'border-transparent text-[var(--color-neutral-8)] hover:text-[var(--color-neutral-10)] hover:border-[var(--color-neutral-5)]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-[var(--border-default)]" />

          {/* Tab content */}
          {activeTab === 'Overview' && (
            <div className="px-[var(--space-2xl)] py-[var(--space-lg)] w-full">
              <Section title="Basic Information">
                <DetailRow label="VIN" value={vehicle.vin} />
                <DetailRow label="Make" value={vehicle.make} />
                <DetailRow label="Model" value={vehicle.model} />
                <DetailRow label="Year" value={vehicle.year} />
                <DetailRow label="Type" value={vehicle.type} />
                <DetailRow label="Title" value={vehicle.title} />
                <DetailRow label="Body Style" value={vehicle.bodyStyle} />
                <DetailRow label="Fuel Type" value={vehicle.fuelType} />
                <DetailRow label="Color" value={vehicle.color} />
                <DetailRow label="License Plate" value={vehicle.licensePlate} />
                <DetailRow label="Registration Expiry" value={vehicle.registrationExpiry} />
              </Section>

              <Section title="Engine & Performance">
                <DetailRow label="Engine Type" value={vehicle.engine.type} />
                <DetailRow label="Displacement" value={vehicle.engine.displacement} />
                <DetailRow label="Cylinders" value={vehicle.engine.cylinders} />
                <DetailRow label="Horsepower" value={vehicle.engine.horsepower} />
                <DetailRow label="Torque" value={vehicle.engine.torque} />
              </Section>

              <Section title="Transmission & Drivetrain">
                <DetailRow label="Transmission" value={vehicle.transmission.type} />
                <DetailRow label="Drivetrain" value={vehicle.transmission.drivetrain} />
              </Section>

              <Section title="Fuel & Emissions">
                <DetailRow label="City MPG" value={vehicle.fuel.cityMpg} />
                <DetailRow label="Highway MPG" value={vehicle.fuel.highwayMpg} />
                <DetailRow label="Combined MPG" value={vehicle.fuel.combinedMpg} />
              </Section>

              <Section title="Dimensions & Weight">
                <DetailRow label="Length (ft)" value={vehicle.dimensions.lengthFt} />
                <DetailRow label="Width (ft)" value={vehicle.dimensions.widthFt} />
                <DetailRow label="Height (ft)" value={vehicle.dimensions.heightFt} />
                <DetailRow label="Wheelbase (in)" value={vehicle.dimensions.wheelbaseIn} />
                <DetailRow label="Weight (lbs)" value={vehicle.dimensions.weightLbs} />
                <DetailRow label="Passenger Volume" value={vehicle.dimensions.passengerVolume} />
                <DetailRow label="Cargo Volume" value={vehicle.dimensions.cargoVolume} />
              </Section>

              <Section title="Classification">
                <DetailRow label="Dealership" value={vehicle.classification.dealership} />
                <DetailRow label="Assigned To" value={vehicle.classification.assignedTo.name} isLink />
              </Section>
            </div>
          )}

          {activeTab !== 'Overview' && (
            <div className="flex flex-col items-center justify-center py-[var(--space-5xl)] gap-[var(--space-sm)]">
              <p className="text-[length:var(--font-size-lg)] font-medium text-[var(--color-neutral-9)]">{activeTab}</p>
              <p className="text-[length:var(--font-size-base)] text-[var(--color-neutral-7)]">Content coming soon.</p>
            </div>
          )}
        </div>

        {/* Right sidebar: Reliability */}
        <div className="w-[280px] shrink-0 border-l border-[var(--border-default)] bg-[var(--surface-primary)] overflow-y-auto">
          <div className="px-[var(--space-lg)] pt-[var(--space-xl)]">
            {/* Sidebar header */}
            <div className="flex items-center justify-between mb-[var(--space-xl)]">
              <h2 className="text-[length:var(--font-size-md)] font-semibold text-[var(--color-neutral-12)]">Reliability</h2>
              <div className="flex items-center gap-1">
                <button className="flex items-center justify-center w-7 h-7 rounded-[var(--radius-md)] hover:bg-[var(--color-neutral-3)] transition-colors cursor-pointer">
                  <RefreshCw size={14} className="text-[var(--color-neutral-7)]" />
                </button>
                <button className="flex items-center justify-center w-7 h-7 rounded-[var(--radius-md)] hover:bg-[var(--color-neutral-3)] transition-colors cursor-pointer">
                  <Settings size={14} className="text-[var(--color-neutral-7)]" />
                </button>
              </div>
            </div>

            {/* Status */}
            <div className="mb-[var(--space-xl)]">
              <p className="text-[length:var(--font-size-sm)] font-medium text-[var(--color-neutral-8)] mb-[var(--space-xs)]">Status</p>
              <Badge severity={relStatus.severity} variant="subtle" size="md" dot>
                {relStatus.label}
              </Badge>
            </div>

            {/* Availability */}
            <div className="mb-[var(--space-xl)] pb-[var(--space-xl)] border-b border-[var(--border-subtle)]">
              <div className="flex items-center justify-between mb-[var(--space-sm)]">
                <p className="text-[length:var(--font-size-sm)] font-medium text-[var(--color-neutral-8)]">Availability</p>
                <span className="text-[length:var(--font-size-xs)] text-[var(--color-neutral-7)]">{rel.availabilityPeriod}</span>
              </div>

              <div className="flex justify-center py-[var(--space-md)]">
                <DonutChart
                  segments={[
                    { value: rel.uptimePercent, color: 'var(--color-success)', label: 'Uptime' },
                    ...(rel.downtimePercent > 0 ? [{ value: rel.downtimePercent, color: 'var(--color-error)', label: 'Downtime' }] : []),
                  ]}
                  size={140}
                  strokeWidth={14}
                  centerValue={`${rel.uptimePercent}%`}
                  centerLabel="Uptime"
                />
              </div>

              <div className="flex items-center justify-center gap-[var(--space-xl)] mt-[var(--space-sm)]">
                <div className="flex items-center gap-[var(--space-xs)]">
                  <span className="text-[length:var(--font-size-sm)] font-semibold text-[var(--color-neutral-12)]">Uptime</span>
                  <span className="text-[length:var(--font-size-sm)] text-[var(--color-success)] font-medium">{rel.uptimePercent}%</span>
                </div>
                <div className="flex items-center gap-[var(--space-xs)]">
                  <span className="text-[length:var(--font-size-sm)] font-semibold text-[var(--color-neutral-12)]">Downtime</span>
                  <span className="text-[length:var(--font-size-sm)] text-[var(--color-error)] font-medium">{rel.downtimePercent}%</span>
                </div>
              </div>
            </div>

            {/* Depreciation */}
            <div className="mb-[var(--space-xl)]">
              <p className="text-[length:var(--font-size-sm)] font-medium text-[var(--color-neutral-8)] mb-[var(--space-xs)]">Depreciation</p>
              {rel.depreciation ? (
                <p className="text-[length:var(--font-size-base)] font-semibold text-[var(--color-neutral-12)]">{rel.depreciation}</p>
              ) : (
                <div>
                  <p className="text-[length:var(--font-size-sm)] text-[var(--color-neutral-8)] italic mb-[var(--space-sm)]">
                    {rel.depreciationNote || "Depreciation can't be calculated because data is missing."}
                  </p>
                  <button className="flex items-center gap-1 text-[length:var(--font-size-sm)] text-[var(--color-accent-9)] hover:text-[var(--color-accent-11)] font-medium cursor-pointer transition-colors">
                    <Plus size={12} />
                    Add Missing Data
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
