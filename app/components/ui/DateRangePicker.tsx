'use client'

import { useState } from 'react'
import { Calendar, ChevronDown } from 'lucide-react'
import { Button } from '@/app/components/ui/Button'

interface Preset {
  key: string
  label: string
}

interface DateRangePickerProps {
  presets: Preset[]
  activePreset: string
  onPresetChange: (key: string) => void
  dateFrom: string
  dateTo: string
  onDateFromChange: (value: string) => void
  onDateToChange: (value: string) => void
  onApplyCustom: () => void
  className?: string
}

export function DateRangePicker({
  presets,
  activePreset,
  onPresetChange,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  onApplyCustom,
  className = '',
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false)

  const activeLabel = activePreset === 'custom'
    ? `${new Date(dateFrom + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(dateTo + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
    : presets.find((p) => p.key === activePreset)?.label ?? ''

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] text-[length:var(--font-size-sm)] font-medium text-[var(--color-neutral-11)] hover:bg-[var(--color-neutral-3)] cursor-pointer transition-colors duration-[var(--duration-fast)]"
      >
        <Calendar size={14} className="text-[var(--color-neutral-7)]" />
        {activeLabel}
        <ChevronDown size={14} className="text-[var(--color-neutral-7)]" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[var(--z-dropdown)]" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-[var(--z-modal)] min-w-[200px] rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-primary)] shadow-[var(--shadow-lg)] p-[var(--space-sm)] pb-4 dropdown-animate">
            <div className="flex flex-col gap-0.5 mb-[var(--space-sm)]">
              {presets.map((p) => (
                <button
                  key={p.key}
                  onClick={() => { onPresetChange(p.key); setOpen(false) }}
                  className={`text-left px-[var(--space-sm)] py-[var(--space-xs)] rounded-[var(--radius-md)] text-[length:var(--font-size-sm)] font-medium cursor-pointer transition-colors duration-[var(--duration-fast)] whitespace-nowrap ${
                    activePreset === p.key
                      ? 'bg-[var(--color-accent-1)] text-[var(--color-accent-9)]'
                      : 'text-[var(--color-neutral-11)] hover:bg-[var(--color-neutral-3)]'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="h-px bg-[var(--border-subtle)] my-[var(--space-xs)]" />

            <div className="px-[var(--space-sm)] pt-3">
              <span className="text-[length:var(--font-size-xs)] font-semibold uppercase tracking-[0.04em] text-[var(--color-neutral-8)]">
                Custom Range
              </span>
              <div className="flex items-center gap-[var(--space-xs)] mt-[var(--space-xs)] py-3">
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => onDateFromChange(e.target.value)}
                  className="flex-1 px-2 py-1.5 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-primary)] text-[length:var(--font-size-sm)] text-[var(--color-neutral-11)] outline-none"
                />
                <span className="text-[length:var(--font-size-xs)] text-[var(--color-neutral-7)]">to</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => onDateToChange(e.target.value)}
                  className="flex-1 px-2 py-1.5 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-primary)] text-[length:var(--font-size-sm)] text-[var(--color-neutral-11)] outline-none"
                />
              </div>
              <Button variant="primary" size="sm" className="w-full mt-[var(--space-sm)]" onClick={() => { onApplyCustom(); setOpen(false) }}>
                Apply
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
