'use client'

import { type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { Button } from './Button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from './DropdownMenu'

export interface FilterSelectOption {
  value: string
  label: string
}

export interface FilterSelectProps {
  /** Accessible name for the control (e.g. "Group by", "Filter by location") */
  ariaLabel: string
  /** Optional leading icon (e.g. MapPin) */
  icon?: ReactNode
  /**
   * Static label before the current value (muted). Omit for icon-only triggers
   * where the placeholder is the first option’s label.
   */
  prefix?: ReactNode
  value: string
  options: FilterSelectOption[]
  onChange: (value: string) => void
  align?: 'start' | 'end' | 'center'
  contentMinWidth?: string
  /** Classes for the trigger (e.g. max-width for long values) */
  triggerClassName?: string
}

export function FilterSelect({
  ariaLabel,
  icon,
  prefix,
  value,
  options,
  onChange,
  align = 'start',
  contentMinWidth = '180px',
  triggerClassName = '',
}: FilterSelectProps) {
  const displayLabel = options.find((o) => o.value === value)?.label ?? value

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          aria-label={ariaLabel}
          className={`!h-7 min-h-7 px-3 rounded-[var(--radius-md)] gap-1.5 text-[length:var(--font-size-sm)] font-medium shadow-none ${triggerClassName}`}
        >
          {icon != null && (
            <span className="shrink-0 text-[var(--color-neutral-7)] [&>svg]:shrink-0">{icon}</span>
          )}
          {prefix != null && (
            <span className="shrink-0 font-normal text-[var(--color-neutral-8)]">{prefix}</span>
          )}
          <span className="min-w-0 truncate text-[var(--color-neutral-11)]">{displayLabel}</span>
          <ChevronDown size={14} className="shrink-0 text-[var(--color-neutral-7)]" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} minWidth={contentMinWidth}>
        {options.map((opt) => (
          <DropdownMenuItem
            key={opt.value === '' ? '__empty' : opt.value}
            onSelect={() => onChange(opt.value)}
            className={
              value === opt.value
                ? 'bg-[var(--color-accent-1)] text-[var(--color-accent-9)] font-medium'
                : ''
            }
          >
            {opt.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
