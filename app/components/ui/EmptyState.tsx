import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  /** Use `orb` for animated SuperNova staging orb — no gray icon disc. */
  iconPresentation?: 'default' | 'orb'
  title: string
  /** Defaults to body emphasis size; override for larger titles (e.g. `text-[length:var(--font-size-xl)]`). */
  titleClassName?: string
  description?: string
  /** Defaults to small body + `max-w-xs`; override size and/or width (e.g. `… max-w-[360px]`). */
  descriptionClassName?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({
  icon,
  iconPresentation = 'default',
  title,
  titleClassName = 'text-[length:var(--font-size-base)]',
  description,
  descriptionClassName = 'text-[length:var(--font-size-sm)] max-w-xs',
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-[var(--space-md)] py-[var(--space-3xl)] px-[var(--space-xl)] text-center ${className}`}
    >
      {icon && (
        <div
          className={
            iconPresentation === 'orb'
              ? 'flex items-center justify-center'
              : 'flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-neutral-3)]'
          }
        >
          {icon}
        </div>
      )}
      <h4 className={`font-semibold text-[var(--color-neutral-11)] ${titleClassName}`}>{title}</h4>
      {description && (
        <p className={`text-[var(--color-neutral-8)] ${descriptionClassName}`}>{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  )
}
