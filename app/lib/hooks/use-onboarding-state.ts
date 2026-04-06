'use client'

import { useState, useCallback, useEffect } from 'react'

/* ── Types ── */

export type OnboardingPhase = 'welcome' | 'data-scan' | 'integrations' | 'ai-activation' | 'reveal' | 'complete'

export interface ScanStatus {
  status: 'pending' | 'scanning' | 'complete' | 'issue'
  count: number | null
  insight: string | null
}

export interface AIMateActivation {
  status: 'waiting' | 'learning' | 'needs-input' | 'ready'
  progress: number
  learningText: string
  summary: string | null
}

export type PreferenceMode = 'auto' | 'suggest' | 'notify' | 'skip' | null

export interface UserPreferences {
  schedulingMode: PreferenceMode
  inventoryMode: PreferenceMode
  escalationMode: PreferenceMode
}

export interface IntegrationStatus {
  id: string
  connected: boolean
}

export interface OnboardingState {
  currentPhase: OnboardingPhase
  dataScan: {
    workOrders: ScanStatus
    assets: ScanStatus
    inventory: ScanStatus
    preventiveMaintenance: ScanStatus
    vendors: ScanStatus
    teamMembers: ScanStatus
  }
  integrations: Record<string, IntegrationStatus>
  aiMates: {
    sam: AIMateActivation
    elena: AIMateActivation
    marcus: AIMateActivation
  }
  userPreferences: UserPreferences
}

/* ── Defaults ── */

const defaultScan = (): ScanStatus => ({ status: 'pending', count: null, insight: null })

const defaultMate = (): AIMateActivation => ({
  status: 'waiting', progress: 0, learningText: '', summary: null,
})

function initialState(): OnboardingState {
  return {
    currentPhase: 'welcome',
    dataScan: {
      workOrders: defaultScan(),
      assets: defaultScan(),
      inventory: defaultScan(),
      preventiveMaintenance: defaultScan(),
      vendors: defaultScan(),
      teamMembers: defaultScan(),
    },
    integrations: {
      slack: { id: 'slack', connected: false },
      gmail: { id: 'gmail', connected: false },
      'google-calendar': { id: 'google-calendar', connected: false },
      'microsoft-teams': { id: 'microsoft-teams', connected: false },
      'google-sheets': { id: 'google-sheets', connected: false },
      quickbooks: { id: 'quickbooks', connected: false },
    },
    aiMates: {
      sam: defaultMate(),
      elena: defaultMate(),
      marcus: defaultMate(),
    },
    userPreferences: {
      schedulingMode: null,
      inventoryMode: null,
      escalationMode: null,
    },
  }
}

const STORAGE_KEY = 'upkeep-supernova-onboarding'

function loadPersistedState(): OnboardingState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as OnboardingState
  } catch {
    return null
  }
}

function persistState(state: OnboardingState) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch { /* quota exceeded, ignore */ }
}

/* ── Hook ── */

export type ScanCategory = keyof OnboardingState['dataScan']
export type AIMateId = keyof OnboardingState['aiMates']

export function useOnboardingState() {
  const [state, setState] = useState<OnboardingState>(initialState)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const persisted = loadPersistedState()
    if (persisted) setState(persisted)
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (loaded) persistState(state)
  }, [state, loaded])

  const setPhase = useCallback((phase: OnboardingPhase) => {
    setState(prev => ({ ...prev, currentPhase: phase }))
  }, [])

  const updateScan = useCallback((category: ScanCategory, update: Partial<ScanStatus>) => {
    setState(prev => ({
      ...prev,
      dataScan: {
        ...prev.dataScan,
        [category]: { ...prev.dataScan[category], ...update },
      },
    }))
  }, [])

  const updateAIMate = useCallback((mateId: AIMateId, update: Partial<AIMateActivation>) => {
    setState(prev => ({
      ...prev,
      aiMates: {
        ...prev.aiMates,
        [mateId]: { ...prev.aiMates[mateId], ...update },
      },
    }))
  }, [])

  const setPreference = useCallback((key: keyof UserPreferences, value: PreferenceMode) => {
    setState(prev => ({
      ...prev,
      userPreferences: { ...prev.userPreferences, [key]: value },
    }))
  }, [])

  const toggleIntegration = useCallback((integrationId: string) => {
    setState(prev => ({
      ...prev,
      integrations: {
        ...prev.integrations,
        [integrationId]: {
          ...prev.integrations[integrationId],
          connected: !prev.integrations[integrationId]?.connected,
        },
      },
    }))
  }, [])

  const resetOnboarding = useCallback(() => {
    const fresh = initialState()
    setState(fresh)
    if (typeof window !== 'undefined') localStorage.removeItem(STORAGE_KEY)
  }, [])

  return {
    state,
    loaded,
    setPhase,
    updateScan,
    updateAIMate,
    setPreference,
    toggleIntegration,
    resetOnboarding,
  }
}
