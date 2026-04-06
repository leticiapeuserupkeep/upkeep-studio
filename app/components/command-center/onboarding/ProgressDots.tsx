'use client'

import type { OnboardingPhase } from '@/app/lib/hooks/use-onboarding-state'

const phases: OnboardingPhase[] = ['welcome', 'data-scan', 'integrations', 'ai-activation', 'reveal', 'complete']

interface ProgressDotsProps {
  currentPhase: OnboardingPhase
}

export function ProgressDots({ currentPhase }: ProgressDotsProps) {
  const currentIdx = phases.indexOf(currentPhase)

  return (
    <div className="flex items-center gap-2" role="progressbar" aria-valuenow={currentIdx + 1} aria-valuemin={1} aria-valuemax={phases.length}>
      {phases.map((_, i) => (
        <span
          key={i}
          className={`w-2 h-2 rounded-full transition-all duration-300 ${
            i <= currentIdx
              ? 'bg-[var(--color-accent-9)] scale-110'
              : 'bg-[var(--color-neutral-4)]'
          }`}
        />
      ))}
    </div>
  )
}
