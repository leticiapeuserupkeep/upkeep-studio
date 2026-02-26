'use client'

import type { ReactNode } from 'react'

interface ChipProps {
  children: ReactNode
  active?: boolean
  onClick?: () => void
  className?: string
}

export function Chip({ children, active = false, onClick, className = '' }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center px-3 py-1 rounded-[var(--radius-full)] text-[length:var(--font-size-sm)] font-medium whitespace-nowrap transition-colors duration-[var(--duration-fast)] cursor-pointer ${
        active
          ? 'bg-[var(--color-accent-9)] text-white'
          : 'bg-[var(--surface-primary)] border border-[var(--border-default)] text-[var(--color-neutral-9)] hover:bg-[var(--color-neutral-3)]'
      } ${className}`}
    >
      {children}
    </button>
  )
}
