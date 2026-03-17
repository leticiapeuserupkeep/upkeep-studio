'use client'

import { useState, useEffect, useRef } from 'react'

export function useAnimatedValue(target: number, duration: number, trigger: boolean) {
  const [value, setValue] = useState(target)
  const rafRef = useRef<number>(0)
  const startRef = useRef<{ from: number; start: number } | null>(null)

  useEffect(() => {
    if (!trigger) { setValue(target); return }
    const from = target
    startRef.current = { from, start: performance.now() }

    const tick = (now: number) => {
      if (!startRef.current) return
      const elapsed = now - startRef.current.start
      const t = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setValue(startRef.current.from * (1 - eased))
      if (t < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [trigger, duration, target])

  return value
}
