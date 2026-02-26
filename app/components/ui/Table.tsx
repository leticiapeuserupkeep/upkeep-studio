import type { ReactNode, ThHTMLAttributes, TdHTMLAttributes } from 'react'

export function Table({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full border-collapse">{children}</table>
    </div>
  )
}

export function TableHeader({ children }: { children: ReactNode }) {
  return <thead>{children}</thead>
}

export function TableBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-[var(--border-subtle)]">{children}</tbody>
}

export function TableRow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <tr className={`transition-colors hover:bg-[var(--color-neutral-2)] ${className}`}>{children}</tr>
}

export function TableHead({ children, className = '', ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={`text-left text-[length:var(--font-size-xs)] font-semibold text-[var(--color-neutral-8)] uppercase tracking-wider py-2 px-3 border-b border-[var(--border-default)] ${className}`}
      {...props}
    >
      {children}
    </th>
  )
}

export function TableCell({ children, className = '', ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={`py-2.5 px-3 text-[length:var(--font-size-sm)] text-[var(--color-neutral-11)] ${className}`}
      {...props}
    >
      {children}
    </td>
  )
}
