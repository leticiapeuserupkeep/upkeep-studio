'use client'

import { Check, Minus } from 'lucide-react'

interface CheckboxProps {
  checked: boolean
  indeterminate?: boolean
  onChange: () => void
  className?: string
}

export function Checkbox({ checked, indeterminate, onChange, className = '' }: CheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={indeterminate ? 'mixed' : checked}
      onClick={(e) => {
        e.stopPropagation()
        onChange()
      }}
      className={`w-[18px] h-[18px] rounded-[var(--radius-sm)] border flex items-center justify-center cursor-pointer transition-all duration-[var(--duration-fast)] select-none ${
        checked || indeterminate
          ? 'bg-[var(--color-accent-9)] border-[var(--color-accent-9)]'
          : 'border-[var(--color-neutral-5)] bg-[var(--surface-primary)] hover:border-[var(--color-neutral-7)]'
      } ${className}`}
    >
      {checked && !indeterminate && (
        <Check size={11} className="text-white" strokeWidth={3} />
      )}
      {indeterminate && (
        <Minus size={11} className="text-white" strokeWidth={3} />
      )}
    </button>
  )
}
