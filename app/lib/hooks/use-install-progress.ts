'use client'

import { useState, useEffect, useCallback } from 'react'

type InstallPhase = 'idle' | 'installing' | 'done'

interface UseInstallProgressOptions {
  duration?: number
  onDone?: () => void
}

export function useInstallProgress({ duration = 2800, onDone }: UseInstallProgressOptions = {}) {
  const [phase, setPhase] = useState<InstallPhase>('idle')
  const [progress, setProgress] = useState(0)

  const start = useCallback(() => setPhase('installing'), [])

  const reset = useCallback(() => {
    setPhase('idle')
    setProgress(0)
  }, [])

  useEffect(() => {
    if (phase !== 'installing') return
    const interval = 30
    const step = 100 / (duration / interval)
    let current = 0
    const timer = setInterval(() => {
      current += step + Math.random() * step * 0.5
      if (current >= 100) {
        current = 100
        clearInterval(timer)
        setProgress(100)
        setPhase('done')
      } else {
        setProgress(current)
      }
    }, interval)
    return () => clearInterval(timer)
  }, [phase, duration])

  useEffect(() => {
    if (phase !== 'done') return
    const timer = setTimeout(() => onDone?.(), 1200)
    return () => clearTimeout(timer)
  }, [phase, onDone])

  const statusMessage =
    progress < 30 ? 'Downloading app package...'
    : progress < 60 ? 'Configuring workspace...'
    : progress < 85 ? 'Setting up integrations...'
    : 'Finalizing installation...'

  return { phase, progress, statusMessage, start, reset } as const
}
