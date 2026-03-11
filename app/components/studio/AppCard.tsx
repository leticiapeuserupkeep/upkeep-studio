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
  'published': { label: 'Published', color: 'var(--color-success)', bg: 'var(--color-success-light)', border: 'var(--color-success-border)' },
  'in-review': { label: 'In Review', color: 'var(--color-warning)', bg: 'var(--color-warning-light)', border: 'var(--color-warning-border)' },
  'rejected': { label: 'Rejected', color: 'var(--color-error)', bg: 'var(--color-error-light)', border: 'var(--color-error-border)' },
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
          <Button variant="danger" size="md" className="flex-1">Uninstall</Button>
          <Button variant="primary" size="md" className="flex-1">Open</Button>
        </div>
      )
    case 'update':
      return (
        <div className="flex gap-[var(--space-sm)] pt-1">
          <Button variant="danger" size="md" className="flex-1">Uninstall</Button>
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
  color = 'var(--color-accent-9)', onClick, creator, lastUpdated, tags,
  image, screenshots, buildStatus, suggestedNote, rating, ratingCount,
}: AppCardProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="flex flex-col h-full rounded-[20px] border border-[var(--border-default)] bg-[var(--surface-primary)] overflow-hidden cursor-pointer transition-shadow duration-[var(--duration-fast)] hover:shadow-[var(--shadow-md)]"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Top row: downloads + likes */}
      <div className="flex items-center justify-between px-5 pt-3 pb-[var(--space-sm)]">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 px-3 py-1 h-8 rounded-[12px] border border-[var(--color-neutral-3)] text-[length:var(--font-size-body-2)] font-medium text-[var(--color-neutral-8)]">
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
          <span className="text-[length:var(--font-size-caption)] font-medium text-[var(--color-neutral-9)]">{likes}</span>
          <Heart size={24} strokeWidth={1.5} className="text-[var(--color-neutral-12)]" />
        </div>
      </div>

      {/* Image area with hover swap */}
      <div className="px-5 relative">
        <div className="rounded-[16px] overflow-hidden relative aspect-video" style={{ backgroundColor: color }}>
          {image ? (
            <>
              <img
                src={image}
                alt={title}
                className="w-full h-full object-cover transition-opacity duration-[var(--duration-normal)]"
                style={{ opacity: hovered && screenshots && screenshots.length > 1 ? 0 : 1 }}
              />
              {screenshots && screenshots.length > 1 && (
                <img
                  src={screenshots[1]}
                  alt={`${title} preview`}
                  className="absolute inset-0 w-full h-full object-cover transition-opacity duration-[var(--duration-normal)]"
                  style={{ opacity: hovered ? 1 : 0 }}
                />
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full px-[var(--space-2xl)] py-[var(--space-lg)]">
              <div className="w-full h-full rounded-[var(--radius-md)] bg-white/90 flex items-center justify-center">
                <div className="grid grid-cols-2 gap-2 p-4 w-full">
                  <div className="h-8 rounded bg-[var(--color-neutral-4)]" />
                  <div className="h-8 rounded bg-[color:var(--color-accent-3)]" />
                  <div className="h-8 rounded bg-[color:var(--color-accent-3)]" />
                  <div className="h-8 rounded bg-[var(--color-neutral-4)]" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 px-5 pt-5 pb-[var(--space-xs)]">
        <h3 className="text-[length:var(--font-size-body-1)] font-bold text-[var(--color-neutral-12)]">{title}</h3>
        {rating != null && (
          <div className="flex items-center gap-1 mt-1 py-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => {
                const filled = star <= Math.floor(rating)
                const partial = !filled && star === Math.ceil(rating) && rating % 1 > 0
                return (
                  <span key={star} className="relative inline-flex" style={{ width: 14, height: 14 }}>
                    <Star size={14} strokeWidth={0} className="text-[var(--color-neutral-5)]" fill="var(--color-neutral-5)" />
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
            <span className="text-[length:var(--font-size-caption)] font-medium text-[var(--color-neutral-9)]">
              {rating.toFixed(1)}
            </span>
            {ratingCount != null && (
              <span className="text-[length:var(--font-size-caption)] text-[var(--color-neutral-8)]">
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
            <span className="block w-full pb-2 text-[10px] font-medium text-[var(--color-neutral-8)] tracking-wide uppercase">
              Suggested
            </span>
            {suggestedNote && (
              <span className="inline-flex items-center mt-1.5 px-2.5 py-0.5 rounded-full bg-[var(--color-error-light)] border border-[var(--color-error-border)] text-[length:var(--font-size-caption)] font-medium text-[var(--color-error)]">
                {suggestedNote}
              </span>
            )}
          </div>
        )}

        {/* Categories section (installed / update / built cards) */}
        {status !== 'install' && tags && tags.length > 0 && (
          <div className="flex-1 mt-[var(--space-sm)] py-3">
            <span className="block w-full pb-2 text-[10px] font-medium text-[var(--color-neutral-8)] tracking-wide uppercase">
              Categories
            </span>
            <div className="flex flex-wrap gap-1.5 mt-0.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-[var(--border-default)] text-[length:var(--font-size-caption)] text-[var(--color-neutral-9)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Footer: Created By + Date */}
        <div className="flex items-center justify-between px-[var(--space-md)] py-[var(--space-sm)] rounded-[16px] bg-[color:var(--color-neutral-2)] text-[length:var(--font-size-caption)] text-[var(--color-neutral-9)]">
          <span>
            Created By: <strong className={status === 'built' ? 'text-[color:var(--color-accent-9)]' : 'text-[var(--color-neutral-12)]'}>{creator || 'UpKeep'}</strong>
          </span>
          <span>{lastUpdated || ''}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="px-5 pb-5">
        <CardActions status={status} />
      </div>
    </div>
  )
}
