'use client'

import { useState, useEffect, useCallback } from 'react'
import { Link2 } from 'lucide-react'

export function PublishSuccessOverlay({ appTitle, onDismiss }: { appTitle: string; onDismiss: () => void }) {
  const [exiting, setExiting] = useState(false)

  const handleDismiss = useCallback(() => {
    setExiting(true)
    setTimeout(onDismiss, 300)
  }, [onDismiss])

  useEffect(() => {
    const timer = setTimeout(handleDismiss, 4000)
    return () => clearTimeout(timer)
  }, [handleDismiss])

  return (
    <div
      className="success-overlay fixed inset-0 z-[var(--z-toast)] flex items-center justify-center cursor-pointer"
      onClick={handleDismiss}
      style={{
        animation: exiting
          ? 'success-overlay-out 0.3s ease forwards'
          : 'success-overlay-in 0.3s ease forwards',
        backgroundColor: 'rgba(0, 0, 20, 0.55)',
        backdropFilter: 'blur(6px)',
      }}
    >
      <div className="flex flex-col items-center gap-5 relative z-10" onClick={(e) => e.stopPropagation()}>
        {/* Filled checkmark */}
        <div style={{ width: 80, height: 80 }}>
          <svg
            viewBox="0 0 80 80"
            fill="none"
            width={80}
            height={80}
          >
            <circle
              cx={40} cy={40} r={36}
              fill="#22C55E"
              style={{
                transformOrigin: 'center',
                animation: 'success-circle-fill 500ms ease-out forwards',
              }}
            />
            <path
              d="M27 40 L36 50 L54 30"
              stroke="white"
              strokeWidth={4}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              style={{
                strokeDasharray: 42,
                strokeDashoffset: 42,
                animation: 'success-check-stroke 300ms ease-out 450ms forwards',
              }}
            />
          </svg>
        </div>

        {/* Title */}
        <p
          className="text-lg font-semibold text-white"
          style={{ opacity: 0, animation: 'success-text-fade-up 250ms ease-out 750ms forwards' }}
        >
          Published!
        </p>

        {/* Subtitle */}
        <p
          className="text-sm text-white/50 -mt-2"
          style={{ opacity: 0, animation: 'success-text-fade-up 250ms ease-out 850ms forwards' }}
        >
          Your app is now live and accessible
        </p>

        {/* Copy link button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            navigator.clipboard.writeText(`https://upkeep.app/apps/${appTitle.toLowerCase().replace(/\s+/g, '-')}`)
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-white/15 bg-white/10 text-sm font-medium text-white hover:bg-white/15 transition-colors duration-[var(--duration-fast)] cursor-pointer"
          style={{ opacity: 0, animation: 'success-text-fade-up 250ms ease-out 950ms forwards' }}
        >
          <Link2 size={14} />
          Copy link
        </button>
      </div>
    </div>
  )
}
