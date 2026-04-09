'use client'

/**
 * 32px SuperNova-style orb: rotating accent conic field + inner radial core (sidebar mark).
 * Uses `var(--color-accent-*)`, `var(--shadow-brand-glow)`, and `.supernova-staging-orb__inner` (globals.css).
 */
export function SuperNovaStagingOrb() {
  return (
    <span
      className="relative inline-flex h-8 w-8 shrink-0 overflow-hidden rounded-full ring-1 ring-[var(--color-accent-7)]/25 shadow-[var(--shadow-brand-glow)]"
      aria-hidden
    >
      <span className="absolute left-1/2 top-1/2 h-[170%] w-[170%] -translate-x-1/2 -translate-y-1/2">
        <span
          className="block h-full w-full animate-[sn-staging-orb-spin_4.5s_linear_infinite]"
          style={{
            background: `conic-gradient(
            from 200deg,
            var(--color-accent-3) 0%,
            var(--color-accent-7) 22%,
            var(--color-accent-4) 44%,
            var(--color-accent-11) 68%,
            var(--color-accent-5) 88%,
            var(--color-accent-3) 100%
          )`,
          }}
        />
      </span>
      <span
        className="supernova-staging-orb__inner absolute inset-[2px] rounded-full animate-[sn-staging-orb-pulse_3.2s_ease-in-out_infinite]"
      />
    </span>
  )
}
