import React from 'react'
import type { ReactNode, ThHTMLAttributes, TdHTMLAttributes } from 'react'
import { Search, ArrowUpDown, Columns3 } from 'lucide-react'

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
    <div className="flex items-center justify-between px-5 h-[52px] border-b border-[var(--border-default)] bg-[var(--surface-primary)]">
      <span className="text-[12px] leading-4 font-medium text-[var(--color-neutral-12)] tracking-[0.01em] shrink-0">
        {itemCountLabel}
      </span>
      <div className="flex items-center gap-4">
        {children}
        <button
          type="button"
          onClick={onSortClick}
          className="inline-flex items-center gap-2 px-2 py-1.5 rounded-[var(--radius-sm)] bg-[var(--color-neutral-1)] text-[13px] leading-4 font-semibold text-[var(--color-neutral-12)] tracking-[0.01em] hover:bg-[var(--color-neutral-3)] transition-colors cursor-pointer whitespace-nowrap"
        >
          <ArrowUpDown size={20} className="text-[var(--color-neutral-12)] shrink-0" />
          {sortLabel}
        </button>
        {showColumns && (
          <button
            type="button"
            onClick={onColumnsClick}
            className="inline-flex items-center gap-2 px-2 py-1.5 rounded-[var(--radius-sm)] bg-[var(--color-neutral-1)] text-[13px] leading-4 font-semibold text-[var(--color-neutral-12)] tracking-[0.01em] hover:bg-[var(--color-neutral-3)] transition-colors cursor-pointer whitespace-nowrap"
          >
            <Columns3 size={20} className="text-[var(--color-neutral-12)] shrink-0" />
            Columns
          </button>
        )}
        {onSearchChange !== undefined && (
          <>
            <div className="w-px h-9 bg-[var(--border-default)] shrink-0" />
            <div className="flex items-center gap-2 w-[240px] h-9 px-3 rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--color-neutral-1)]">
              <Search size={20} className="text-[var(--color-neutral-7)] shrink-0" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchValue ?? ''}
                onChange={(e) => onSearchChange(e.target.value)}
                className="flex-1 text-[13px] leading-5 font-medium tracking-[0.01em] bg-transparent outline-none text-[var(--color-neutral-11)] placeholder:text-[var(--color-neutral-7)]"
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
      className={`text-left text-[13px] leading-4 font-bold text-[var(--color-neutral-12)] tracking-[0.01em] h-12 px-6 border-b border-[var(--border-default)] whitespace-nowrap align-middle ${className}`}
      {...props}
    >
      {children}
    </th>
  )
}

export function TableCell({ children, className = '', ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={`py-4 px-6 text-[14px] leading-5 font-medium text-[var(--color-neutral-9)] tracking-[0.01em] ${className}`}
      {...props}
    >
      {children}
    </td>
  )
}
