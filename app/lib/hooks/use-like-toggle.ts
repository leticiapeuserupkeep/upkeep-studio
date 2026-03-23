'use client'

import { useState, useCallback } from 'react'

export function useLikeToggle(initialCount: number) {
  const [liked, setLiked] = useState(false)
  const [count, setCount] = useState(initialCount)
  const [animating, setAnimating] = useState(false)

  const toggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setAnimating(true)
    setLiked(prev => !prev)
    setCount(prev => liked ? prev - 1 : prev + 1)
    setTimeout(() => setAnimating(false), 500)
  }, [liked])

  return { liked, count, animating, toggle } as const
}
