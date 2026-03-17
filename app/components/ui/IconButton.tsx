'use client'

import { type ButtonHTMLAttributes, forwardRef } from 'react'

type IconButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'subtle'
  | 'ghost'
  | 'danger'
  | 'success'

type IconButtonSize = 'sm' | 'md' | 'lg'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: IconButtonVariant
  size?: IconButtonSize
  label: string
}

const variantStyles: Record<IconButtonVariant, string> = {
  primary:
    'bg-[#3E63DD] text-white hover:bg-[#3A5BC7] active:bg-[#1F2D5C] disabled:bg-[#F0F0F3] disabled:text-[#8B8D98]',
  secondary:
    'bg-[#F0F0F3] border border-[#E0E1E6] text-[#1C2024] hover:bg-[#E0E1E6] hover:border-[#D9D9E0] active:bg-[#CDCED6] active:border-[#CDCED6] disabled:bg-[#F0F0F3] disabled:border-transparent disabled:text-[#8B8D98]',
  outline:
    'border border-[#E0E1E6] text-[#1C2024] hover:border-[#D9D9E0] active:border-[#CDCED6] disabled:text-[#B9BBC6]',
  subtle:
    'bg-[#EDF2FE] text-[#1C2024] hover:bg-[#E1E9FF] active:bg-[#D2DEFF] disabled:bg-[#FCFCFD] disabled:text-[#8B8D98]',
  ghost:
    'text-[#3A5BC7] hover:text-[#1F2D5C] active:text-[#1F2D5C] disabled:text-[#B9BBC6]',
  danger:
    'bg-[#E5484D] text-white hover:bg-[#DC3E42] active:bg-[#641723] disabled:bg-[#F0F0F3] disabled:text-[#8B8D98]',
  success:
    'bg-[#30A46C] text-white hover:bg-[#2B9A66] active:bg-[#193B2D] disabled:bg-[#F0F0F3] disabled:text-[#8B8D98]',
}

const sizeStyles: Record<IconButtonSize, string> = {
  sm: 'w-6 h-6 rounded-[4px]',
  md: 'w-8 h-8 rounded-[8px]',
  lg: 'w-10 h-10 rounded-[12px]',
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ variant = 'ghost', size = 'md', label, className = '', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        aria-label={label}
        className={`inline-flex items-center justify-center shrink-0 transition-colors duration-[var(--duration-fast)] cursor-pointer select-none disabled:pointer-events-none ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    )
  },
)
IconButton.displayName = 'IconButton'
