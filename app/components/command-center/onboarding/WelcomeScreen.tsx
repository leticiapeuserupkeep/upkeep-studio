'use client'

import { Sparkles } from 'lucide-react'
import { Button } from '@/app/components/ui/Button'
import { ProgressDots } from './ProgressDots'

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
        {/* Icon */}
        <div className="relative">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#4F46E5] shadow-[0_0_40px_rgba(124,58,237,0.3)]">
            <Sparkles size={28} className="text-white" />
          </div>
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#4F46E5] opacity-30 blur-xl animate-pulse" />
        </div>

        {/* Title */}
        <h1 className="text-[32px] font-medium text-[var(--color-neutral-12)] tracking-[1px]">
          Supernova
        </h1>

        {/* Subtitle */}
        <p className="text-[18px] text-[var(--color-neutral-9)] leading-relaxed -mt-2">
          Your AI maintenance team
        </p>

        {/* Description */}
        <p className="text-[14px] text-[var(--color-neutral-8)] leading-relaxed">
          We&apos;ll connect to your UpKeep data, set up your AI teammates, and have them ready to work alongside you in just a few minutes.
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
