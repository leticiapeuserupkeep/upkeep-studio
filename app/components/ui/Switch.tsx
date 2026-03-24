'use client'

import { forwardRef } from 'react'
import * as SwitchPrimitive from '@radix-ui/react-switch'

type SwitchSize = 'sm' | 'md' | 'lg'

interface SwitchProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  size?: SwitchSize
  disabled?: boolean
  'aria-label'?: string
  className?: string
}

const rootSizes: Record<SwitchSize, string> = {
  sm: 'w-7 h-4',
  md: 'w-9 h-5',
  lg: 'w-10 h-[22px]',
}

const thumbSizes: Record<SwitchSize, string> = {
  sm: 'w-3 h-3 translate-x-0.5 data-[state=checked]:translate-x-[13px]',
  md: 'w-4 h-4 translate-x-0.5 data-[state=checked]:translate-x-[18px]',
  lg: 'w-[18px] h-[18px] translate-x-0.5 data-[state=checked]:translate-x-[20px]',
}

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked, onCheckedChange, size = 'md', disabled, className = '', ...props }, ref) => {
    return (
      <SwitchPrimitive.Root
        ref={ref}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className={`relative inline-flex items-center rounded-full cursor-pointer transition-colors duration-[var(--duration-fast)] shrink-0 data-[state=checked]:bg-[var(--color-accent-9)] data-[state=unchecked]:bg-[var(--color-neutral-5)] disabled:opacity-50 disabled:cursor-not-allowed ${rootSizes[size]} ${className}`}
        {...props}
      >
        <SwitchPrimitive.Thumb
          className={`block rounded-full bg-white shadow-[var(--shadow-sm)] transition-transform duration-[var(--duration-fast)] ${thumbSizes[size]}`}
        />
      </SwitchPrimitive.Root>
    )
  },
)
Switch.displayName = 'Switch'
