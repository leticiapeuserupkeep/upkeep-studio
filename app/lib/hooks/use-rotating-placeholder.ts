'use client'

import { useState, useEffect } from 'react'

export function useRotatingPlaceholder(items: string[], intervalMs = 4000) {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % items.length)
        setVisible(true)
      }, 300)
    }, intervalMs)
    return () => clearInterval(id)
  }, [items.length, intervalMs])

  return { text: items[index], visible }
}
