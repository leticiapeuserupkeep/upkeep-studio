'use client'

import { useRef } from 'react'

const BURST_COLORS = [
  '#3b5bdb', '#6d9ef9', '#bfd7fe', '#3b63eb',
  '#2f9e44', '#86EFAC',
  '#FDE68A', '#f8f9fa',
]
const BURST_SHAPES = ['rect', 'rect', 'rect', 'circle', 'strip'] as const

interface ConfettiBurstProps {
  active: boolean
  count?: number
  className?: string
}

export function ConfettiBurst({ active, count = 40, className = '' }: ConfettiBurstProps) {
  const particles = useRef(
    Array.from({ length: count }, (_, i) => {
      const angle = Math.random() * Math.PI * 2
      const velocity = 60 + Math.random() * 100
      return {
        cx: Math.cos(angle) * velocity,
        cy: Math.sin(angle) * velocity * 0.7,
        cr: (Math.random() - 0.5) * 720,
        size: 4 + Math.random() * 6,
        color: BURST_COLORS[i % BURST_COLORS.length],
        delay: Math.random() * 200,
        shape: BURST_SHAPES[i % BURST_SHAPES.length],
      }
    })
  ).current

  if (!active) return null

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none z-10 ${className}`}>
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            top: '45%',
            left: '50%',
            width: p.shape === 'strip' ? p.size * 1.6 : p.size,
            height: p.shape === 'circle' ? p.size : p.shape === 'strip' ? p.size * 0.3 : p.size * 0.55,
            marginTop: -(p.size * 0.3),
            marginLeft: -(p.size * 0.5),
            borderRadius: p.shape === 'circle' ? '50%' : p.shape === 'strip' ? '1px' : '2px',
            backgroundColor: p.color,
            '--cx': `${p.cx}px`,
            '--cy': `${p.cy}px`,
            '--cr': `${p.cr}deg`,
            animation: `confetti-burst-card 1.1s ${p.delay}ms cubic-bezier(0.22, 0.61, 0.36, 1) forwards`,
            opacity: 0,
          } as React.CSSProperties}
        />
      ))}
    </div>
  )
}
