'use client'

import { type ReactNode } from 'react'
import { ChevronDown, X } from 'lucide-react'

interface FilterChipProps {
  children: ReactNode
  active?: boolean
  icon?: ReactNode
  hasDropdown?: boolean
  onRemove?: () => void
  onClick?: () => void
  className?: string
}

export function FilterChip({
  children,
  active,
  icon,
  hasDropdown,
  onRemove,
  onClick,
  className = '',
}: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 h-7 px-3 rounded-[var(--radius-md)] border text-[length:var(--font-size-sm)] font-medium whitespace-nowrap transition-colors duration-[var(--duration-fast)] cursor-pointer ${
        active
          ? 'border-[var(--color-accent-9)] text-[var(--color-accent-9)] bg-[var(--color-accent-1)]'
          : 'border-[var(--border-default)] text-[var(--color-neutral-9)] bg-[var(--surface-primary)] hover:bg-[var(--color-neutral-3)]'
      } ${className}`}
    >
      {icon}
      {children}
      {hasDropdown && <ChevronDown size={12} />}
      {onRemove && (
        <X
          size={12}
          className="ml-0.5 opacity-60 hover:opacity-100"
          onClick={(e) => { e.stopPropagation(); onRemove() }}
        />
      )}
    </button>
  )
}
