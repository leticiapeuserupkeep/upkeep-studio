import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div
      className={`rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-primary)] shadow-[var(--shadow-xs)] ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  action?: ReactNode
}

export function CardHeader({ children, action, className = '', ...props }: CardHeaderProps) {
  return (
    <div
      className={`flex items-center justify-between px-[var(--space-lg)] py-[var(--space-md)] ${className}`}
      {...props}
    >
      <div className="flex flex-col gap-0.5">{children}</div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  )
}

export function CardTitle({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <h3 className={`text-[length:var(--font-size-base)] font-semibold text-[var(--color-neutral-11)] ${className}`}>
      {children}
    </h3>
  )
}

export function CardDescription({ children }: { children: ReactNode }) {
  return (
    <p className="text-[length:var(--font-size-sm)] text-[var(--color-neutral-8)]">{children}</p>
  )
}

export function CardBody({ children, className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`px-[var(--space-lg)] pb-[var(--space-lg)] ${className}`} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`flex items-center gap-2 px-[var(--space-lg)] py-[var(--space-sm)] border-t border-[var(--border-subtle)] ${className}`}
    >
      {children}
    </div>
  )
}
