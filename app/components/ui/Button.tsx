'use client'

import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { Slot } from '@radix-ui/react-slot'

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'outline'
  | 'subtle'
  | 'ghost'
  | 'danger'
  | 'success'

type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  asChild?: boolean
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-[#3E63DD] text-white hover:bg-[#3A5BC7] active:bg-[#1F2D5C] disabled:bg-[#F0F0F3] disabled:text-[#8B8D98]',
  secondary:
    'bg-white border border-[#E0E1E6] text-[#1C2024] hover:bg-[#E0E1E6] hover:border-[#D9D9E0] active:bg-[#CDCED6] active:border-[#CDCED6] disabled:bg-[#F0F0F3] disabled:border-transparent disabled:text-[#8B8D98]',
  tertiary:
    'text-[#3A5BC7] hover:text-[#1F2D5C] active:text-[#1F2D5C] disabled:text-[#B9BBC6]',
  outline:
    'border border-[#E0E1E6] text-[#1C2024] hover:border-[#D9D9E0] active:border-[#CDCED6] disabled:text-[#B9BBC6]',
  subtle:
    'bg-[#EDF2FE] text-[#1C2024] hover:bg-[#E1E9FF] active:bg-[#D2DEFF] disabled:bg-[#F0F0F3] disabled:text-[#B9BBC6]',
  ghost:
    'text-[#3A5BC7] hover:text-[#1F2D5C] active:text-[#1F2D5C] disabled:text-[#B9BBC6]',
  danger:
    'bg-[#E5484D] text-white hover:bg-[#DC3E42] active:bg-[#641723] disabled:bg-[#F0F0F3] disabled:text-[#8B8D98]',
  success:
    'bg-[#30A46C] text-white hover:bg-[#2B9A66] active:bg-[#193B2D] disabled:bg-[#F0F0F3] disabled:text-[#8B8D98]',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-6 px-1.5 text-[12px] leading-4 gap-1 rounded-[4px]',
  md: 'h-8 px-2 text-[14px] leading-5 gap-1 rounded-[8px]',
  lg: 'h-10 px-3 text-[16px] leading-6 gap-2 rounded-[12px]',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', asChild = false, className = '', ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        ref={ref}
        className={`inline-flex items-center justify-center font-medium tracking-[0.01em] transition-colors duration-[var(--duration-fast)] cursor-pointer whitespace-nowrap select-none disabled:pointer-events-none ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'
