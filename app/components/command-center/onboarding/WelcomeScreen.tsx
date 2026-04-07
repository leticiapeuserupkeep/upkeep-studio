'use client'

import { Button } from '@/app/components/ui/Button'
import { ProgressDots } from './ProgressDots'
import SupernovaOrb from '@/components/SupernovaOrb'

interface WelcomeScreenProps {
  onStart: () => void
  onSkip: () => void
}

export function WelcomeScreen({ onStart, onSkip }: WelcomeScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 bg-[var(--surface-canvas)]">
      <div
        className="flex flex-col items-center gap-6 max-w-[440px] text-center opacity-0"
        style={{ animation: 'fadeInUp 0.6s var(--ease-default) 0.1s forwards' }}
      >
        {/* Orb */}
        <div className="relative flex justify-center -my-2">
          <SupernovaOrb />
        </div>

        {/* Title */}
        <h1 className="text-[32px] font-medium text-[var(--color-neutral-12)] tracking-[1px]">
          Supernova
        </h1>

        {/* Subtitle */}
        <p className="text-[18px] text-[var(--color-neutral-9)] leading-relaxed -mt-2">
          Your AI operations command center
        </p>

        {/* Description */}
        <p className="text-[14px] text-[var(--color-neutral-8)] leading-relaxed">
          Supernova connects to your MES, ERP, CMMS, and existing tools — then sets up an AI team that works across all of them, so nothing falls through the cracks.
        </p>

        {/* CTA */}
        <Button
          variant="primary"
          size="lg"
          className="px-8 text-[16px] gap-2"
          onClick={onStart}
        >
          Get Started
        </Button>

        {/* Skip */}
        <button
          onClick={onSkip}
          className="text-[13px] text-[var(--color-neutral-7)] hover:text-[var(--color-neutral-9)] cursor-pointer transition-colors"
        >
          Skip for now
        </button>

        {/* Dots */}
        <div className="mt-4">
          <ProgressDots currentPhase="welcome" />
        </div>
      </div>
    </div>
  )
}
