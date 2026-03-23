'use client'

import { useState, useCallback } from 'react'

type InstallPhase = 'idle' | 'installing' | 'install-success'

export function useInstallFlow(initialStatus: string) {
  const [status, setStatus] = useState(initialStatus)
  const [phase, setPhase] = useState<InstallPhase>('idle')

  const install = useCallback(() => {
    setPhase('installing')

    setTimeout(() => {
      setPhase('install-success')
      setStatus('installed')
    }, 1500)

    setTimeout(() => {
      setPhase('idle')
    }, 3300)
  }, [])

  return { status, phase, install, isProcessing: phase !== 'idle' } as const
}
