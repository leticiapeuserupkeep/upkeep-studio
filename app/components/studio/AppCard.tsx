'use client'

import { useState } from 'react'
import { Download, Heart, RefreshCw, Star } from 'lucide-react'
import { Button } from '@/app/components/ui/Button'

type AppStatus = 'install' | 'installed' | 'update' | 'built'
type BuildStatus = 'published' | 'in-review' | 'rejected'

interface AppCardProps {
  title: string
  description: string
  likes: number
  downloads: number
  status: AppStatus
  color?: string
  onClick?: () => void
  creator?: string
  lastUpdated?: string
  tags?: string[]
  image?: string
  screenshots?: string[]
  buildStatus?: BuildStatus
  suggestedNote?: string
  rating?: number
  ratingCount?: number
}

const buildStatusConfig: Record<BuildStatus, { label: string; color: string; bg: string; border: string }> = {
  'published': { label: 'Published', color: '#2F9E44', bg: '#EBFBEE', border: '#B2F2BB' },
  'in-review': { label: 'In Review', color: '#E8590C', bg: '#FFF4E6', border: '#FFD8A8' },
  'rejected': { label: 'Rejected', color: '#E03131', bg: '#FFF5F5', border: '#FFC9C9' },
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
        <div className="flex gap-[var(--space-sm)] pt-1">
          <Button variant="destructive" size="md" className="flex-1">Uninstall</Button>
          <Button variant="secondary" size="md" className="flex-1">
            <RefreshCw size={14} /> Update
          </Button>
        </div>
      )
    case 'built':
      return (
        <div className="flex gap-[var(--space-sm)] pt-[var(--space-sm)]">
          <Button variant="secondary" size="md" className="flex-1">Open</Button>
          <Button variant="primary" size="md" className="flex-1">Edit</Button>
        </div>
      )
  }
}

export function AppCard({
  title, description, likes, downloads, status,
  color = '#3E63DD', onClick, creator, lastUpdated, tags,
  image, screenshots, buildStatus, suggestedNote, rating, ratingCount,
}: AppCardProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="flex flex-col rounded-[20px] border border-[#E0E1E6] bg-white overflow-hidden cursor-pointer transition-shadow duration-200 hover:shadow-[var(--shadow-md)]"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Top row: downloads + likes */}
      <div className="flex items-center justify-between px-[var(--space-md)] pt-[var(--space-md)] pb-[var(--space-sm)]">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 px-3 py-1 h-8 rounded-[12px] border border-[#F0F0F3] text-[length:var(--font-size-body-2)] font-medium text-[#8B8D98]">
            <Download size={16} strokeWidth={1.5} /> {downloads}
          </span>
          {status === 'built' && buildStatus && (
            <span
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[length:var(--font-size-caption)] font-medium"
              style={{
                color: buildStatusConfig[buildStatus].color,
                backgroundColor: buildStatusConfig[buildStatus].bg,
                border: `1px solid ${buildStatusConfig[buildStatus].border}`,
              }}
            >
              {buildStatusConfig[buildStatus].label}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[length:var(--font-size-caption)] font-medium text-[#60646C]">{likes}</span>
          <Heart size={24} strokeWidth={1.5} className="text-[#1C2024]" />
        </div>
      </div>

      {/* Image area with hover swap */}
      <div className="px-[var(--space-md)] relative">
        <div className="rounded-[16px] overflow-hidden relative aspect-video" style={{ backgroundColor: color }}>
          {image ? (
            <>
              <img
                src={image}
                alt={title}
                className="w-full h-full object-cover transition-opacity duration-300"
                style={{ opacity: hovered && screenshots && screenshots.length > 1 ? 0 : 1 }}
              />
              {screenshots && screenshots.length > 1 && (
                <img
                  src={screenshots[1]}
                  alt={`${title} preview`}
                  className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
                  style={{ opacity: hovered ? 1 : 0 }}
                />
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full px-[var(--space-2xl)] py-[var(--space-lg)]">
              <div className="w-full h-full rounded-[var(--radius-md)] bg-white/90 flex items-center justify-center">
                <div className="grid grid-cols-2 gap-2 p-4 w-full">
                  <div className="h-8 rounded bg-[#E0E1E6]" />
                  <div className="h-8 rounded bg-[color:var(--color-accent-3)]" />
                  <div className="h-8 rounded bg-[color:var(--color-accent-3)]" />
                  <div className="h-8 rounded bg-[#E0E1E6]" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 px-[var(--space-md)] pt-[var(--space-md)] pb-[var(--space-xs)]">
        <h3 className="text-[length:var(--font-size-body-1)] font-bold text-[#1C2024]">{title}</h3>
        {rating != null && (
          <div className="flex items-center gap-1 mt-1 py-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => {
                const filled = star <= Math.floor(rating)
                const partial = !filled && star === Math.ceil(rating) && rating % 1 > 0
                return (
                  <span key={star} className="relative inline-flex" style={{ width: 14, height: 14 }}>
                    <Star size={14} strokeWidth={0} className="text-[#D4D7E0]" fill="#D4D7E0" />
                    {(filled || partial) && (
                      <span
                        className="absolute inset-0 overflow-hidden"
                        style={{ width: filled ? '100%' : `${(rating % 1) * 100}%` }}
                      >
                        <Star size={14} strokeWidth={0} className="text-[color:var(--color-accent-9)]" fill="var(--color-accent-9)" />
                      </span>
                    )}
                  </span>
                )
              })}
            </div>
            <span className="text-[length:var(--font-size-caption)] font-medium text-[#60646C]">
              {rating.toFixed(1)}
            </span>
            {ratingCount != null && (
              <span className="text-[length:var(--font-size-caption)] text-[#8B8D98]">
                ({ratingCount})
              </span>
            )}
          </div>
        )}
        <p className="mt-[var(--space-xs)] text-[length:var(--font-size-body-2)] text-[color:var(--color-neutral-8)] line-clamp-2">
          {description}
        </p>

        {/* Suggested section (install cards) */}
        {status === 'install' && (
          <div className="flex-1 mt-[var(--space-sm)] py-3">
            <span className="block w-full pb-2 text-[10px] font-medium text-[#8B8D98] tracking-wide uppercase">
              Suggested
            </span>
            {suggestedNote && (
              <span className="inline-flex items-center mt-1.5 px-2.5 py-0.5 rounded-full bg-[#FFF5F5] border border-[#FFC9C9] text-[length:var(--font-size-caption)] font-medium text-[#E5484D]">
                {suggestedNote}
              </span>
            )}
          </div>
        )}

        {/* Categories section (installed / update / built cards) */}
        {status !== 'install' && tags && tags.length > 0 && (
          <div className="flex-1 mt-[var(--space-sm)] py-3">
            <span className="block w-full pb-2 text-[10px] font-medium text-[#8B8D98] tracking-wide uppercase">
              Categories
            </span>
            <div className="flex flex-wrap gap-1.5 mt-0.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-[#E0E1E6] text-[length:var(--font-size-caption)] text-[#60646C]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Footer: Created By + Date */}
        <div className="flex items-center justify-between px-[var(--space-md)] py-[var(--space-sm)] mx-[var(--space-md)] rounded-[16px] bg-[color:var(--color-neutral-2)] text-[length:var(--font-size-caption)] text-[#60646C]">
          <span>
            Created By: <strong className={status === 'built' ? 'text-[color:var(--color-accent-9)]' : 'text-[#1C2024]'}>{creator || 'UpKeep'}</strong>
          </span>
          <span>{lastUpdated || ''}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="px-[var(--space-md)] pb-[var(--space-md)]">
        <CardActions status={status} />
      </div>
    </div>
  )
}
