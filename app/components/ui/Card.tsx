import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div
      className={`rounded-[var(--widget-radius)] border border-[var(--widget-border)] bg-[var(--widget-bg)] shadow-[var(--widget-shadow)] ${className}`}
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
      className={`flex items-center justify-between px-[var(--widget-padding)] py-[var(--widget-header-padding-y)] ${className}`}
      {...props}
    >
      <div className="flex flex-col gap-[var(--space-2xs)]">{children}</div>
      {action && <div className="flex items-center gap-[var(--space-xs)]">{action}</div>}
    </div>
  )
}

export function CardTitle({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <h3 className={`text-[length:var(--font-size-md)] font-semibold text-[var(--color-neutral-12)] ${className}`}>
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
    <div className={`px-[var(--widget-padding)] pb-[var(--widget-padding)] ${className}`} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`flex items-center gap-[var(--space-xs)] px-[var(--widget-padding)] py-[var(--space-sm)] border-t border-[var(--border-subtle)] ${className}`}
    >
      {children}
    </div>
  )
}
