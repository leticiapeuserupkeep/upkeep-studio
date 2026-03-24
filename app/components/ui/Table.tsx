import React from 'react'
import type { ReactNode, ThHTMLAttributes, TdHTMLAttributes } from 'react'
import { Search, ArrowUpDown, Columns3 } from 'lucide-react'
import { Button } from './Button'

/* ── Toolbar ── */

interface TableToolbarProps {
  /** e.g. "8 of 8 items" */
  itemCountLabel: string
  sortLabel?: string
  onSortClick?: () => void
  showColumns?: boolean
  onColumnsClick?: () => void
  searchValue?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  children?: ReactNode
}

export function TableToolbar({
  itemCountLabel,
  sortLabel = 'Sort: Work Order Title',
  onSortClick,
  showColumns = true,
  onColumnsClick,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search',
  children,
}: TableToolbarProps) {
  return (
    <div className="flex items-center justify-between px-[var(--space-lg)] h-[52px] border-b border-[var(--border-default)] bg-[var(--surface-primary)]">
      <span className="text-[length:var(--font-size-sm)] leading-4 font-medium text-[var(--color-neutral-12)] tracking-[0.01em] shrink-0">
        {itemCountLabel}
      </span>
      <div className="flex items-center gap-[var(--space-md)]">
        {children}
        <Button variant="secondary" size="sm" onClick={onSortClick}>
          <ArrowUpDown size={16} className="shrink-0" />
          {sortLabel}
        </Button>
        {showColumns && (
          <Button variant="secondary" size="sm" onClick={onColumnsClick}>
            <Columns3 size={16} className="shrink-0" />
            Columns
          </Button>
        )}
        {onSearchChange !== undefined && (
          <>
            <div className="w-px h-9 bg-[var(--border-default)] shrink-0" />
            <div className="flex items-center gap-[var(--space-xs)] w-[240px] h-9 px-[var(--space-sm)] rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--surface-primary)]">
              <Search size={16} className="text-[var(--color-neutral-7)] shrink-0" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchValue ?? ''}
                onChange={(e) => onSearchChange(e.target.value)}
                className="flex-1 text-[length:var(--font-size-sm)] leading-5 font-medium tracking-[0.01em] bg-transparent outline-none text-[var(--color-neutral-11)] placeholder:text-[var(--color-neutral-7)]"
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

/* ── Table ── */

export function Table({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full border-collapse">{children}</table>
    </div>
  )
}

export function TableHeader({ children }: { children: ReactNode }) {
  return <thead className="[&>tr]:py-2">{children}</thead>
}

export function TableBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-[var(--border-subtle)]">{children}</tbody>
}

export function TableRow({ children, className = '', ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={`transition-colors duration-[var(--duration-fast)] hover:bg-[var(--color-neutral-2)] ${className}`} {...props}>{children}</tr>
}

export function TableHead({ children, className = '', ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={`text-left text-[length:var(--font-size-sm)] leading-4 font-bold text-[var(--color-neutral-12)] tracking-[0.01em] h-12 px-[var(--space-xl)] border-b border-[var(--border-default)] whitespace-nowrap align-middle ${className}`}
      {...props}
    >
      {children}
    </th>
  )
}

export function TableCell({ children, className = '', ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={`py-[var(--space-md)] px-[var(--space-xl)] text-[length:var(--font-size-base)] leading-5 font-medium text-[var(--color-neutral-9)] tracking-[0.01em] ${className}`}
      {...props}
    >
      {children}
    </td>
  )
}
