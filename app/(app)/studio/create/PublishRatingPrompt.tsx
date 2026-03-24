'use client'

import { useState, useCallback } from 'react'
import { X } from 'lucide-react'

const ratingOptions = [
  { value: 1, emoji: '😟', label: 'Terrible' },
  { value: 2, emoji: '😕', label: 'Bad' },
  { value: 3, emoji: '🙂', label: 'Ok' },
  { value: 4, emoji: '😊', label: 'Good' },
  { value: 5, emoji: '😁', label: 'Great' },
]

export function PublishRatingPrompt({ onDismiss }: { onDismiss: () => void }) {
  const [selected, setSelected] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [showFollowUp, setShowFollowUp] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [exiting, setExiting] = useState(false)

  const dismiss = useCallback(() => {
    setExiting(true)
    setTimeout(onDismiss, 300)
  }, [onDismiss])

  const handleSelect = useCallback((value: number) => {
    setSelected(value)
    if (value <= 2) {
      setShowFollowUp(true)
    } else {
      setSubmitted(true)
      setTimeout(dismiss, 1600)
    }
  }, [dismiss])

  const handleSubmitFeedback = useCallback(() => {
    setShowFollowUp(false)
    setSubmitted(true)
    setTimeout(dismiss, 1600)
  }, [dismiss])

  return (
    <div
      className="fixed bottom-6 right-6 z-[var(--z-toast)]"
      style={{
        animation: exiting
          ? 'rating-prompt-out 0.3s ease forwards'
          : 'rating-prompt-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }}
    >
      <div
        className="bg-[var(--surface-primary)] rounded-2xl border border-[var(--border-default)] py-5 px-6"
        style={{ boxShadow: '0 8px 40px -8px rgba(0,0,0,0.15), 0 4px 16px -4px rgba(0,0,0,0.08)' }}
      >
        {submitted ? (
          <div className="flex flex-col items-center gap-1 px-4 py-2">
            <span className="text-base">🙏</span>
            <p className="text-[length:var(--font-size-base)] font-medium text-[var(--color-neutral-12)]">Thanks for your feedback!</p>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-6 mb-5">
              <h3 className="text-[length:var(--font-size-md)] font-semibold text-[var(--color-neutral-12)] leading-snug">
                How was your experience using Studio?
              </h3>
              <button
                onClick={dismiss}
                className="flex items-center justify-center w-6 h-6 rounded-lg hover:bg-[var(--color-neutral-3)] transition-colors duration-[var(--duration-fast)] cursor-pointer shrink-0 -mt-0.5 -mr-1"
                aria-label="Dismiss"
              >
                <X size={14} className="text-[var(--color-neutral-8)]" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              {ratingOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleSelect(opt.value)}
                  className={`flex flex-col items-center gap-2 px-3 py-2.5 rounded-xl transition-all duration-[var(--duration-fast)] cursor-pointer group ${
                    selected === opt.value
                      ? 'bg-[var(--color-accent-2)] ring-2 ring-[var(--color-accent-7)] scale-105'
                      : 'hover:bg-[var(--color-neutral-2)] hover:scale-105'
                  }`}
                >
                  <span
                    className={`text-[length:var(--font-size-3xl)] leading-none transition-transform duration-[var(--duration-fast)] ${
                      selected === opt.value ? 'scale-110' : 'group-hover:scale-110'
                    }`}
                  >
                    {opt.emoji}
                  </span>
                  <span className={`text-[length:var(--font-size-sm)] font-medium transition-colors duration-[var(--duration-fast)] ${
                    selected === opt.value ? 'text-[var(--color-accent-9)]' : 'text-[var(--color-neutral-8)]'
                  }`}>
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>

            {showFollowUp && (
              <div
                className="mt-4 flex flex-col gap-2.5"
                style={{ animation: 'success-text-fade-up 200ms ease-out forwards' }}
              >
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="What could we improve? (optional)"
                  className="w-full resize-none text-[length:var(--font-size-base)] text-[var(--color-neutral-12)] placeholder:text-[var(--color-neutral-7)] bg-[var(--color-neutral-2)] rounded-xl px-3 py-2.5 leading-5 border border-[var(--border-default)] outline-none focus:border-[var(--color-accent-8)] transition-colors duration-[var(--duration-fast)]"
                  rows={2}
                  autoFocus
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleSubmitFeedback}
                    className="px-3.5 py-1.5 rounded-lg bg-[var(--color-accent-9)] hover:bg-[var(--color-accent-10)] text-white text-[length:var(--font-size-base)] font-medium transition-colors duration-[var(--duration-fast)] cursor-pointer"
                  >
                    Submit
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
