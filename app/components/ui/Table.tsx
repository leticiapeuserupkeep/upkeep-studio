import React from 'react'
import type { ReactNode, ThHTMLAttributes, TdHTMLAttributes } from 'react'

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
      className={`text-left text-[length:var(--font-size-sm)] font-semibold text-[var(--color-neutral-12)] py-3 px-5 border-b border-[var(--border-default)] ${className}`}
      {...props}
    >
      {children}
    </th>
  )
}

export function TableCell({ children, className = '', ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={`py-2.5 px-5 text-[length:var(--font-size-sm)] text-[var(--color-neutral-11)] ${className}`}
      {...props}
    >
      {children}
    </td>
  )
}
