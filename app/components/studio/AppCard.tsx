import { Heart, Download, RefreshCw } from 'lucide-react'
import { Button } from '@/app/components/ui/Button'

type AppStatus = 'install' | 'installed' | 'update' | 'built'

interface AppCardProps {
  title: string
  description: string
  likes: number
  downloads: number
  status: AppStatus
  color?: string
}

function CardActions({ status }: { status: AppStatus }) {
  switch (status) {
    case 'install':
      return (
        <div className="pt-[var(--space-sm)]">
          <Button variant="primary" size="md" className="w-full">Install</Button>
        </div>
      )
    case 'installed':
      return (
        <div className="flex gap-[var(--space-sm)] pt-[var(--space-sm)]">
          <Button variant="destructive" size="md" className="flex-1">Uninstall</Button>
          <Button variant="primary" size="md" className="flex-1">Open</Button>
        </div>
      )
    case 'update':
      return (
        <div className="flex gap-[var(--space-sm)] pt-[var(--space-sm)]">
          <Button variant="destructive" size="md" className="flex-1">Uninstall</Button>
          <Button variant="secondary" size="md" className="flex-1">
            Update <RefreshCw size={14} className="ml-1" />
          </Button>
        </div>
      )
    case 'built':
      return (
        <div className="flex gap-[var(--space-sm)] pt-[var(--space-sm)]">
          <Button variant="secondary" size="md" className="flex-1">Edit</Button>
          <Button variant="primary" size="md" className="flex-1">Open</Button>
        </div>
      )
  }
}

export function AppCard({ title, description, likes, downloads, status, color = '#3E63DD' }: AppCardProps) {
  return (
    <div className="flex flex-col rounded-[var(--radius-xl)] border border-[#E0E1E6] bg-white overflow-hidden">
      {/* Stats row */}
      <div className="flex items-center justify-between px-[var(--space-md)] pt-[var(--space-md)] pb-[var(--space-xs)]">
        <div className="flex items-center gap-[var(--space-xs)]">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-[#E0E1E6] text-[length:var(--font-size-caption)] text-[#60646C]">
            <Heart size={12} /> {likes}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-[#E0E1E6] text-[length:var(--font-size-caption)] text-[#60646C]">
            <Download size={12} /> {downloads}
          </span>
        </div>
        <Heart size={20} className="text-[#1C2024] cursor-pointer hover:text-[color:var(--color-error)]" />
      </div>

      {/* Image area */}
      <div className="px-[var(--space-md)]">
        <div className="rounded-[var(--radius-lg)] overflow-hidden" style={{ backgroundColor: color }}>
          <div className="flex items-center justify-center h-[180px] px-[var(--space-2xl)] py-[var(--space-lg)]">
            <div className="w-full h-full rounded-[var(--radius-md)] bg-white/90 flex items-center justify-center">
              <div className="grid grid-cols-2 gap-2 p-4 w-full">
                <div className="h-8 rounded bg-[#E0E1E6]" />
                <div className="h-8 rounded bg-[color:var(--color-accent-3)]" />
                <div className="h-8 rounded bg-[color:var(--color-accent-3)]" />
                <div className="h-8 rounded bg-[#E0E1E6]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col px-[var(--space-md)] py-[var(--space-md)]">
        <h3 className="text-[length:var(--font-size-body-1)] font-bold text-[#1C2024]">{title}</h3>
        <p className="mt-[var(--space-xs)] text-[length:var(--font-size-body-2)] text-[color:var(--color-neutral-8)] line-clamp-2">
          {description}
        </p>
        <CardActions status={status} />
      </div>
    </div>
  )
}
