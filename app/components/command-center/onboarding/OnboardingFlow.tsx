'use client'

import { useCallback } from 'react'
import { useOnboardingState } from '@/app/lib/hooks/use-onboarding-state'
import { WelcomeScreen } from './WelcomeScreen'
import { DataScanScreen } from './DataScanScreen'
import { IntegrationsScreen } from './IntegrationsScreen'
import { AIActivationScreen } from './AIActivationScreen'
import { RevealScreen } from './RevealScreen'

interface OnboardingFlowProps {
  onComplete: () => void
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const {
    state, loaded,
    setPhase, updateScan, updateAIMate, setPreference, toggleIntegration,
  } = useOnboardingState()

  const handleSkip = useCallback(() => {
    setPhase('complete')
    onComplete()
  }, [setPhase, onComplete])

  const handleFinish = useCallback(() => {
    setPhase('complete')
    onComplete()
  }, [setPhase, onComplete])

  if (!loaded) return null

  switch (state.currentPhase) {
    case 'welcome':
      return (
        <WelcomeScreen
          onStart={() => setPhase('data-scan')}
          onSkip={handleSkip}
        />
      )

    case 'data-scan':
      return (
        <DataScanScreen
          scanState={state.dataScan}
          onUpdateScan={updateScan}
          onComplete={() => setPhase('integrations')}
        />
      )

    case 'integrations':
      return (
        <IntegrationsScreen
          integrationState={state.integrations}
          onToggle={toggleIntegration}
          onComplete={() => setPhase('ai-activation')}
        />
      )

    case 'ai-activation':
      return (
        <AIActivationScreen
          aiMates={state.aiMates}
          onUpdateMate={updateAIMate}
          onSetPreference={setPreference}
          onComplete={() => setPhase('reveal')}
        />
      )

    case 'reveal':
      return <RevealScreen onFinish={handleFinish} />

    case 'complete':
      onComplete()
      return null

    default:
      return null
  }
}
