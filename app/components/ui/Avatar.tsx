'use client'

import * as AvatarPrimitive from '@radix-ui/react-avatar'

type AvatarSize = 'sm' | 'md' | 'lg'

interface AvatarProps {
  src?: string
  name: string
  size?: AvatarSize
  className?: string
}

const sizeStyles: Record<AvatarSize, string> = {
  sm: 'w-6 h-6 text-[length:var(--font-size-xs)]',
  md: 'w-8 h-8 text-[length:var(--font-size-sm)]',
  lg: 'w-10 h-10 text-[length:var(--font-size-base)]',
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const avatarColors = [
  'bg-[#e8d5f5] text-[#7C3AED]',
  'bg-[#d5e8f5] text-[#1971c2]',
  'bg-[#d5f5e8] text-[#2f9e44]',
  'bg-[#f5e8d5] text-[#e8890c]',
  'bg-[#f5d5d5] text-[#e03131]',
]

function getColorFromName(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return avatarColors[Math.abs(hash) % avatarColors.length]
}

export function Avatar({ src, name, size = 'md', className = '' }: AvatarProps) {
  return (
    <AvatarPrimitive.Root
      className={`inline-flex items-center justify-center rounded-full overflow-hidden shrink-0 ${sizeStyles[size]} ${className}`}
    >
      <AvatarPrimitive.Image src={src} alt={name} className="w-full h-full object-cover" />
      <AvatarPrimitive.Fallback
        className={`flex items-center justify-center w-full h-full font-semibold ${getColorFromName(name)}`}
        delayMs={200}
      >
        {getInitials(name)}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  )
}
