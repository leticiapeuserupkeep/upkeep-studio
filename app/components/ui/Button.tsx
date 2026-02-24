type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'gradient'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  disabled?: boolean
  onClick?: () => void
  children: React.ReactNode
  className?: string
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-8 py-3 text-base',
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-[var(--color-accent-9)] text-white hover:bg-[var(--color-accent-10)]',
  secondary: 'border border-[var(--color-neutral-5)] text-[var(--color-neutral-11)] hover:bg-[var(--color-neutral-3)]',
  ghost: 'text-[var(--color-accent-9)] hover:bg-[var(--color-accent-1)]',
  gradient: 'bg-gradient-to-r from-[#7C3AED] to-[#4F7EF5] text-white font-semibold hover:opacity-90 shadow-md',
}

export function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  children,
  className = '',
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center
        font-semibold rounded-full
        transition-all duration-150
        cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {children}
    </button>
  )
}