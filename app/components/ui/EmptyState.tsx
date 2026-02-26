import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className = '' }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-[var(--space-3xl)] px-[var(--space-xl)] text-center ${className}`}>
      {icon && (
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[var(--color-neutral-3)] mb-3">
          {icon}
        </div>
      )}
      <h4 className="text-[length:var(--font-size-base)] font-semibold text-[var(--color-neutral-11)]">{title}</h4>
      {description && (
        <p className="mt-1 text-[length:var(--font-size-sm)] text-[var(--color-neutral-8)] max-w-xs">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
