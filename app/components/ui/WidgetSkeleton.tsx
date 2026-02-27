import { Skeleton } from './Skeleton'

interface WidgetSkeletonProps {
  /** Number of content rows to simulate. */
  rows?: number
  className?: string
}

export function WidgetSkeleton({ rows = 3, className = '' }: WidgetSkeletonProps) {
  return (
    <div
      className={`rounded-[var(--widget-radius)] border border-[var(--widget-border)] bg-[var(--widget-bg)] shadow-[var(--widget-shadow)] ${className}`}
    >
      <div className="flex items-center justify-between px-[var(--widget-padding)] py-[var(--widget-header-padding-y)]">
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-40" />
        </div>
        <Skeleton className="h-7 w-7" rounded="lg" />
      </div>

      <div className="flex flex-col gap-3 px-[var(--widget-padding)] pb-[var(--widget-padding)]">
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 shrink-0" rounded="full" />
            <div className="flex-1 flex flex-col gap-1.5">
              <Skeleton className="h-3.5 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
