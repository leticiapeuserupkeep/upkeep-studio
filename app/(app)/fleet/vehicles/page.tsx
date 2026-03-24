'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Search, SlidersHorizontal, Plus, ChevronDown,
  MapPin, Car,
} from 'lucide-react'
import { Badge } from '@/app/components/ui/Badge'
import { Button } from '@/app/components/ui/Button'
import { vehicles } from '@/app/lib/fleet-data'
import type { VehicleStatus } from '@/app/lib/models'

const statusConfig: Record<VehicleStatus, { label: string; severity: 'success' | 'warning' | 'danger' | 'neutral' }> = {
  operational: { label: 'Operational', severity: 'success' },
  in_shop: { label: 'In Shop', severity: 'warning' },
  out_of_service: { label: 'Out of Service', severity: 'danger' },
  idle: { label: 'Idle', severity: 'neutral' },
}

export default function VehiclesPage() {
  const [search, setSearch] = useState('')

  const filtered = vehicles.filter((v) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      v.make.toLowerCase().includes(q) ||
      v.model.toLowerCase().includes(q) ||
      v.vin.toLowerCase().includes(q) ||
      v.licensePlate.toLowerCase().includes(q)
    )
  })

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[var(--surface-canvas)]">
      {/* Header */}
      <div className="flex items-center justify-between px-[var(--space-2xl)] py-[var(--space-lg)] border-b border-[var(--border-default)] bg-[var(--surface-primary)] shrink-0">
        <div className="flex items-center gap-[var(--space-sm)]">
          <Car size={20} className="text-[var(--color-neutral-9)]" />
          <h1 className="text-[length:var(--font-size-xl)] font-semibold text-[var(--color-neutral-12)]">Vehicles</h1>
          <Badge severity="neutral" variant="surface" size="sm">{vehicles.length}</Badge>
        </div>
        <div className="flex items-center gap-[var(--space-sm)]">
          <Button variant="outline" size="sm">
            <SlidersHorizontal size={14} />
            Filters
          </Button>
          <Button variant="primary" size="sm">
            <Plus size={14} />
            Add Vehicle
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="px-[var(--space-2xl)] py-[var(--space-md)] border-b border-[var(--border-subtle)] bg-[var(--surface-primary)] shrink-0">
        <div className="flex items-center gap-[var(--space-xs)] px-3 py-2 border border-[var(--border-default)] rounded-[var(--radius-lg)] bg-[var(--color-neutral-2)] max-w-[400px]">
          <Search size={16} className="text-[var(--color-neutral-7)] shrink-0" />
          <input
            type="text"
            placeholder="Search by make, model, VIN, plate…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 text-[length:var(--font-size-base)] outline-none bg-transparent placeholder:text-[var(--color-neutral-7)]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-[var(--z-sticky)]">
            <tr className="bg-[var(--color-neutral-2)] border-b border-[var(--border-default)]">
              <th className="text-left px-[var(--space-2xl)] py-[var(--space-sm)] text-[length:var(--font-size-sm)] font-medium text-[var(--color-neutral-8)]">Vehicle</th>
              <th className="text-left px-[var(--space-md)] py-[var(--space-sm)] text-[length:var(--font-size-sm)] font-medium text-[var(--color-neutral-8)]">VIN</th>
              <th className="text-left px-[var(--space-md)] py-[var(--space-sm)] text-[length:var(--font-size-sm)] font-medium text-[var(--color-neutral-8)]">Type</th>
              <th className="text-left px-[var(--space-md)] py-[var(--space-sm)] text-[length:var(--font-size-sm)] font-medium text-[var(--color-neutral-8)]">Status</th>
              <th className="text-left px-[var(--space-md)] py-[var(--space-sm)] text-[length:var(--font-size-sm)] font-medium text-[var(--color-neutral-8)]">Location</th>
              <th className="text-left px-[var(--space-md)] py-[var(--space-sm)] text-[length:var(--font-size-sm)] font-medium text-[var(--color-neutral-8)]">Assigned To</th>
              <th className="text-left px-[var(--space-md)] py-[var(--space-sm)] text-[length:var(--font-size-sm)] font-medium text-[var(--color-neutral-8)]">Plate</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((v) => {
              const st = statusConfig[v.status]
              return (
                <tr
                  key={v.id}
                  className="border-b border-[var(--border-subtle)] hover:bg-[var(--color-neutral-2)] transition-colors duration-[var(--duration-fast)] cursor-pointer"
                >
                  <td className="px-[var(--space-2xl)] py-[var(--space-md)]">
                    <Link href={`/fleet/vehicles/${v.id}`} className="flex items-center gap-[var(--space-sm)]">
                      <div className="w-[48px] h-[36px] rounded-[var(--radius-md)] overflow-hidden bg-[var(--color-neutral-3)] shrink-0">
                        <img src={v.image} alt={`${v.year} ${v.make} ${v.model}`} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-[length:var(--font-size-base)] font-medium text-[var(--color-neutral-12)]">
                          {v.year} {v.make} {v.model}
                        </p>
                        <p className="text-[length:var(--font-size-sm)] text-[var(--color-neutral-8)]">
                          {v.drivetrain} · {v.doors}DR
                        </p>
                      </div>
                    </Link>
                  </td>
                  <td className="px-[var(--space-md)] py-[var(--space-md)]">
                    <span className="text-[length:var(--font-size-sm)] font-mono text-[var(--color-neutral-9)]">{v.vin}</span>
                  </td>
                  <td className="px-[var(--space-md)] py-[var(--space-md)]">
                    <span className="text-[length:var(--font-size-base)] text-[var(--color-neutral-12)]">{v.type}</span>
                  </td>
                  <td className="px-[var(--space-md)] py-[var(--space-md)]">
                    <Badge severity={st.severity} variant="subtle" size="sm" dot>{st.label}</Badge>
                  </td>
                  <td className="px-[var(--space-md)] py-[var(--space-md)]">
                    <div className="flex items-center gap-1">
                      <MapPin size={12} className="text-[var(--color-neutral-7)]" />
                      <span className="text-[length:var(--font-size-sm)] text-[var(--color-neutral-9)]">{v.location}</span>
                    </div>
                  </td>
                  <td className="px-[var(--space-md)] py-[var(--space-md)]">
                    <span className="text-[length:var(--font-size-base)] text-[var(--color-accent-9)]">{v.classification.assignedTo.name}</span>
                  </td>
                  <td className="px-[var(--space-md)] py-[var(--space-md)]">
                    <span className="text-[length:var(--font-size-sm)] font-mono text-[var(--color-neutral-9)]">{v.licensePlate}</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-[var(--space-5xl)] gap-[var(--space-sm)]">
            <Car size={40} className="text-[var(--color-neutral-5)]" />
            <p className="text-[length:var(--font-size-base)] text-[var(--color-neutral-8)]">No vehicles match your search.</p>
          </div>
        )}
      </div>
    </div>
  )
}
