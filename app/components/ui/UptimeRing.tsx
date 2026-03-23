'use client'

import { type ReactNode } from 'react'

interface UptimeRingProps {
  percent: number
  size?: number
  strokeWidth?: number
  trackColor?: string
  fillColor?: string
  label?: ReactNode
  className?: string
  animated?: boolean
}

export function UptimeRing({
  percent,
  size = 80,
  strokeWidth = 5,
  trackColor = 'var(--color-neutral-4)',
  fillColor = 'var(--color-accent-9)',
  label,
  className = '',
  animated = false,
}: UptimeRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percent / 100) * circumference

  return (
    <div
      className={`relative flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={fillColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={animated ? 'transition-[stroke-dashoffset] duration-1000' : undefined}
        />
      </svg>
      {label != null ? (
        <div className="absolute flex flex-col items-center">{label}</div>
      ) : (
        <span
          className="absolute font-bold"
          style={{ fontSize: Math.round(size * 0.2), color: fillColor === 'white' ? 'white' : undefined }}
        >
          {Math.round(percent)}%
        </span>
      )}
    </div>
  )
}
