'use client'

import { useState, useRef, useEffect } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import * as Switch from '@radix-ui/react-switch'
import { X, ChevronDown, Check } from 'lucide-react'
import { Button } from '@/app/components/ui/Button'

interface SyncMeterModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sensorName: string
  totalRuntime: number
}

const SAMPLE_METERS = [
  'Odometer for 2023 Ford Transit-350 Crew 98795',
  'Odometer for 2022 Chevrolet Express 3500',
  'Odometer for 2024 RAM ProMaster 2500',
  'Engine Hours — CAT 320',
  'Compressor Runtime — Unit 14',
]

export function SyncMeterModal({ open, onOpenChange, sensorName, totalRuntime }: SyncMeterModalProps) {
  const [meterName, setMeterName] = useState('')
  const [runtimeValue, setRuntimeValue] = useState(totalRuntime.toFixed(2))
  const [enabled, setEnabled] = useState(true)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [search, setSearch] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const defaultOption = sensorName ? `${sensorName} Runtime` : 'Runtime Meter'
  const allOptions = [defaultOption, ...SAMPLE_METERS]
  const filtered = allOptions.filter((o) =>
    o.toLowerCase().includes(search.toLowerCase())
  )

  useEffect(() => {
    if (open) {
      setMeterName('')
      setRuntimeValue(totalRuntime.toFixed(2))
      setEnabled(true)
      setSearch('')
    }
  }, [open, totalRuntime])

  useEffect(() => {
    if (!dropdownOpen) return
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [dropdownOpen])

  function selectOption(option: string) {
    setMeterName(option)
    setSearch(option)
    setDropdownOpen(false)
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay data-dialog-overlay className="fixed inset-0 z-[var(--z-overlay)] bg-black/40" />
        <Dialog.Content data-dialog-content className="fixed left-1/2 top-1/2 z-[var(--z-modal)] w-full max-w-[480px] rounded-2xl border border-[var(--border-default)] bg-[var(--surface-primary)] shadow-[var(--shadow-lg)] focus:outline-none overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-[var(--space-xl)] pt-[var(--space-xl)] pb-[var(--space-md)] border-b border-[var(--border-subtle)]">
            <Dialog.Title className="text-[length:var(--font-size-lg)] font-bold text-[var(--color-neutral-12)]">
              Sync Meter
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="flex items-center justify-center w-8 h-8 rounded-[var(--radius-md)] hover:bg-[var(--color-neutral-3)] transition-colors cursor-pointer" aria-label="Close">
                <X size={18} className="text-[var(--color-neutral-7)]" />
              </button>
            </Dialog.Close>
          </div>

          <div className="px-[var(--space-xl)] pt-[var(--space-lg)] pb-[var(--space-xl)] flex flex-col gap-[var(--space-lg)]">
            {/* Meter name combobox */}
            <div>
              <label className="block text-[length:var(--font-size-sm)] font-medium text-[var(--color-neutral-12)] mb-[var(--space-sm)] pb-1">
                Meter name
              </label>
              <div className="relative" ref={dropdownRef}>
                <div className="relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value)
                      setMeterName(e.target.value)
                      setDropdownOpen(true)
                    }}
                    onFocus={() => setDropdownOpen(true)}
                    placeholder="Select or type a meter name…"
                    className="w-full px-[var(--space-md)] py-[10px] pr-9 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] text-[length:var(--font-size-sm)] text-[var(--color-neutral-11)] outline-none focus:border-[var(--color-accent-7)] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setDropdownOpen((v) => !v)}
                    className="absolute right-0 top-0 h-full px-3 flex items-center cursor-pointer"
                    tabIndex={-1}
                  >
                    <ChevronDown size={14} className="text-[var(--color-neutral-7)]" />
                  </button>
                </div>
                {dropdownOpen && filtered.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 z-10 max-h-[200px] overflow-y-auto rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] shadow-[var(--shadow-lg)] py-1 dropdown-animate">
                    {filtered.map((option) => (
                      <button
                        key={option}
                        onClick={() => selectOption(option)}
                        className="flex items-center gap-2 w-full px-[var(--space-md)] py-2 text-left text-[length:var(--font-size-sm)] text-[var(--color-neutral-11)] hover:bg-[var(--color-neutral-3)] cursor-pointer transition-colors"
                      >
                        {meterName === option && (
                          <Check size={14} className="text-[var(--color-accent-9)] shrink-0" />
                        )}
                        <span className={meterName === option ? 'font-medium' : ''}>{option}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Total runtime */}
            <div>
              <label className="block text-[length:var(--font-size-sm)] font-medium text-[var(--color-neutral-12)] mb-[var(--space-sm)] pb-1">
                Total runtime
              </label>
              <div className="flex items-center rounded-[var(--radius-lg)] border border-[var(--border-default)] overflow-hidden">
                <input
                  type="number"
                  value={runtimeValue}
                  onChange={(e) => setRuntimeValue(e.target.value)}
                  className="flex-1 px-[var(--space-md)] py-[10px] bg-[var(--surface-primary)] text-[length:var(--font-size-sm)] text-[var(--color-neutral-11)] outline-none min-w-0"
                />
                <span className="px-[var(--space-md)] py-[10px] text-[length:var(--font-size-sm)] text-[var(--color-neutral-7)] bg-[var(--surface-secondary)] border-l border-[var(--border-default)]">
                  hours
                </span>
              </div>
            </div>

            {/* Enable toggle */}
            <div className="flex items-center justify-between py-[var(--space-xs)]">
              <label className="text-[length:var(--font-size-sm)] font-medium text-[var(--color-neutral-11)] cursor-pointer select-none">
                Enable meter syncing
              </label>
              <Switch.Root
                checked={enabled}
                onCheckedChange={setEnabled}
                className="relative w-[36px] h-[20px] rounded-full cursor-pointer transition-colors duration-350 data-[state=checked]:bg-[var(--color-accent-9)] data-[state=unchecked]:bg-[var(--color-neutral-5)]"
              >
                <Switch.Thumb className="block w-[16px] h-[16px] bg-white rounded-full shadow-sm transition-transform duration-350 translate-x-[2px] data-[state=checked]:translate-x-[18px]" />
              </Switch.Root>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-[var(--space-sm)] px-[var(--space-xl)] py-[var(--space-md)] border-t border-[var(--border-subtle)]">
            <Button variant="ghost" size="md" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" onClick={() => onOpenChange(false)}>
              Sync Meter
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
