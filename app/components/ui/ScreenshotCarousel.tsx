'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ScreenshotCarouselProps {
  screenshots?: string[]
  title: string
  accentColor: string
  height?: string
  className?: string
}

export function ScreenshotCarousel({
  screenshots,
  title,
  accentColor,
  height = '260px',
  className = '',
}: ScreenshotCarouselProps) {
  const hasScreenshots = !!(screenshots && screenshots.length > 0)
  const totalSlides = hasScreenshots ? screenshots.length : 3
  const [index, setIndex] = useState(0)

  const prev = () => setIndex((p) => (p - 1 + totalSlides) % totalSlides)
  const next = () => setIndex((p) => (p + 1) % totalSlides)

  return (
    <div className={`relative ${className}`}>
      <div className="relative rounded-[var(--radius-xl)] overflow-hidden" style={{ height }}>
        <div
          className="flex h-full transition-transform duration-[var(--duration-slow)] ease-[var(--ease-default)]"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {hasScreenshots ? (
            screenshots.map((src, i) => (
              <div key={i} className="min-w-full h-full">
                <img src={src} alt={`${title} screenshot ${i + 1}`} className="w-full h-full object-cover" />
              </div>
            ))
          ) : (
            <>
              <div className="flex items-center justify-center min-w-full h-full px-[var(--space-2xl)] py-[var(--space-lg)]" style={{ backgroundColor: accentColor }}>
                <div className="w-full max-w-[600px] h-full rounded-[var(--radius-lg)] bg-white/90 flex flex-col gap-2 p-5">
                  <div className="grid grid-cols-3 gap-2 flex-1">
                    <div className="rounded bg-[var(--color-neutral-4)]" />
                    <div className="rounded" style={{ backgroundColor: `${accentColor}20` }} />
                    <div className="rounded bg-[var(--color-neutral-4)]" />
                  </div>
                  <div className="h-10 rounded bg-[var(--color-neutral-4)]" />
                </div>
              </div>
              <div className="flex items-center justify-center min-w-full h-full px-[var(--space-2xl)] py-[var(--space-lg)]" style={{ backgroundColor: accentColor }}>
                <div className="w-full max-w-[600px] h-full rounded-[var(--radius-lg)] bg-white/90 flex flex-col gap-2 p-5">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-[var(--color-neutral-4)] shrink-0" />
                      <div className="flex-1 h-3 rounded bg-[var(--color-neutral-4)]" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-center min-w-full h-full px-[var(--space-2xl)] py-[var(--space-lg)]" style={{ backgroundColor: accentColor }}>
                <div className="w-full max-w-[600px] h-full rounded-[var(--radius-lg)] bg-white/90 flex flex-col gap-3 p-5">
                  <div className="h-5 w-2/3 rounded bg-[var(--color-neutral-4)]" />
                  <div className="h-3 w-full rounded bg-[var(--color-neutral-4)]" />
                  <div className="flex gap-2 flex-1">
                    <div className="flex-1 rounded" style={{ backgroundColor: `${accentColor}15` }} />
                    <div className="flex-1 rounded bg-[var(--color-neutral-4)]" />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-[var(--shadow-md)] cursor-pointer hover:bg-white transition-colors duration-[var(--duration-fast)]">
          <ChevronLeft size={16} className="text-[var(--color-neutral-11)]" />
        </button>
        <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-[var(--shadow-md)] cursor-pointer hover:bg-white transition-colors duration-[var(--duration-fast)]">
          <ChevronRight size={16} className="text-[var(--color-neutral-11)]" />
        </button>
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {Array.from({ length: totalSlides }).map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`w-2 h-2 rounded-full transition-colors duration-[var(--duration-fast)] cursor-pointer ${i === index ? 'bg-white' : 'bg-white/50'}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
