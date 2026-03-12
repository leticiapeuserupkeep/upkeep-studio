'use client'

import { useState, useRef, useCallback } from 'react'
import { Download, Heart, RefreshCw, Star, Check } from 'lucide-react'
import { Button } from '@/app/components/ui/Button'

type AppStatus = 'install' | 'installed' | 'update' | 'built'
export type BuildStatus = 'published' | 'in-review' | 'rejected' | 'draft'
type CardPhase = 'idle' | 'installing' | 'install-success' | 'uninstalling'

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
  lastUpdatedStale?: boolean
}

const buildStatusConfig: Record<BuildStatus, { label: string; color: string; bg: string; border: string }> = {
  'published': { label: 'Published', color: 'var(--color-success)', bg: 'var(--color-success-light)', border: 'var(--color-success-border)' },
  'in-review': { label: 'In Review', color: 'var(--color-warning)', bg: 'var(--color-warning-light)', border: 'var(--color-warning-border)' },
  'rejected': { label: 'Rejected', color: 'var(--color-error)', bg: 'var(--color-error-light)', border: 'var(--color-error-border)' },
  'draft': { label: 'Draft', color: 'var(--color-accent-9)', bg: 'var(--color-accent-1)', border: 'var(--color-accent-5)' },
}

const BURST_COLORS = [
  '#3b5bdb', '#6d9ef9', '#bfd7fe', '#3b63eb',
  '#2f9e44', '#86EFAC',
  '#FDE68A', '#f8f9fa',
]
const BURST_SHAPES = ['rect', 'rect', 'rect', 'circle', 'strip'] as const

function CardConfetti({ active }: { active: boolean }) {
  const particles = useRef(
    Array.from({ length: 40 }, (_, i) => {
      const angle = Math.random() * Math.PI * 2
      const velocity = 60 + Math.random() * 100
      return {
        cx: Math.cos(angle) * velocity,
        cy: Math.sin(angle) * velocity * 0.7,
        cr: (Math.random() - 0.5) * 720,
        size: 4 + Math.random() * 6,
        color: BURST_COLORS[i % BURST_COLORS.length],
        delay: Math.random() * 200,
        shape: BURST_SHAPES[i % BURST_SHAPES.length],
      }
    })
  ).current

  if (!active) return null

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            top: '45%',
            left: '50%',
            width: p.shape === 'strip' ? p.size * 1.6 : p.size,
            height: p.shape === 'circle' ? p.size : p.shape === 'strip' ? p.size * 0.3 : p.size * 0.55,
            marginTop: -(p.size * 0.3),
            marginLeft: -(p.size * 0.5),
            borderRadius: p.shape === 'circle' ? '50%' : p.shape === 'strip' ? '1px' : '2px',
            backgroundColor: p.color,
            '--cx': `${p.cx}px`,
            '--cy': `${p.cy}px`,
            '--cr': `${p.cr}deg`,
            animation: `confetti-burst-card 1.1s ${p.delay}ms cubic-bezier(0.22, 0.61, 0.36, 1) forwards`,
            opacity: 0,
          } as React.CSSProperties}
        />
      ))}
    </div>
  )
}

function CardActions({
  status,
  phase,
  onInstall,
  onUninstall,
}: {
  status: AppStatus
  phase: CardPhase
  onInstall?: () => void
  onUninstall?: () => void
}) {
  if (phase === 'installing') {
    return (
      <div className="pt-[var(--space-sm)]">
        <div
          className="flex items-center justify-center gap-2 h-8 w-full rounded-[var(--radius-lg)] bg-[var(--color-accent-9)] text-white text-[length:var(--font-size-base)] font-medium"
          style={{ animation: 'success-text-fade-up 200ms ease-out forwards' }}
        >
          <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Installing…
        </div>
      </div>
    )
  }

  if (phase === 'install-success') {
    return (
      <div className="pt-[var(--space-sm)]">
        <div
          className="flex items-center justify-center gap-2 h-8 w-full rounded-[var(--radius-lg)] bg-[var(--color-success)] text-white text-[length:var(--font-size-base)] font-medium"
          style={{ animation: 'success-text-fade-up 200ms ease-out forwards' }}
        >
          <Check size={14} strokeWidth={2.5} />
          Installed successfully
        </div>
      </div>
    )
  }

  if (phase === 'uninstalling') {
    return (
      <div className="flex gap-[var(--space-sm)] pt-[var(--space-sm)]">
        <div
          className="flex items-center justify-center gap-2 h-8 w-full rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] text-[var(--color-neutral-9)] text-[length:var(--font-size-base)] font-medium"
          style={{ animation: 'success-text-fade-up 200ms ease-out forwards' }}
        >
          <span className="inline-block w-3.5 h-3.5 border-2 border-[var(--color-neutral-7)] border-t-transparent rounded-full animate-spin" />
          Removing…
        </div>
      </div>
    )
  }

  switch (status) {
    case 'install':
      return (
        <div className="pt-[var(--space-sm)]">
          <Button variant="primary" size="md" className="w-full" onClick={(e) => { e.stopPropagation(); onInstall?.() }}>
            Install
          </Button>
        </div>
      )
    case 'installed':
      return (
        <div className="flex gap-[var(--space-sm)] pt-[var(--space-sm)]">
          <Button variant="danger" size="md" className="flex-1" onClick={(e) => { e.stopPropagation(); onUninstall?.() }}>
            Uninstall
          </Button>
          <Button variant="primary" size="md" className="flex-1" onClick={(e) => e.stopPropagation()}>
            Open
          </Button>
        </div>
      )
    case 'update':
      return (
        <div className="flex gap-[var(--space-sm)] pt-1">
          <Button variant="danger" size="md" className="flex-1" onClick={(e) => { e.stopPropagation(); onUninstall?.() }}>
            Uninstall
          </Button>
          <Button variant="secondary" size="md" className="flex-1" onClick={(e) => e.stopPropagation()}>
            <RefreshCw size={14} /> Update
          </Button>
        </div>
      )
    case 'built':
      return (
        <div className="flex gap-[var(--space-sm)] pt-[var(--space-sm)]">
          <Button variant="secondary" size="md" className="flex-1" onClick={(e) => e.stopPropagation()}>Open</Button>
          <Button variant="primary" size="md" className="flex-1" onClick={(e) => e.stopPropagation()}>Edit</Button>
        </div>
      )
  }
}

export function AppCard({
  title, description, likes, downloads, status,
  color = 'var(--color-accent-9)', onClick, creator, lastUpdated, tags,
  image, screenshots, buildStatus, suggestedNote, rating, ratingCount,
  lastUpdatedStale,
}: AppCardProps) {
  const [hovered, setHovered] = useState(false)
  const [cardStatus, setCardStatus] = useState(status)
  const [phase, setPhase] = useState<CardPhase>('idle')
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(likes)
  const [heartAnimating, setHeartAnimating] = useState(false)

  const handleInstall = useCallback(() => {
    setPhase('installing')

    setTimeout(() => {
      setPhase('install-success')
      setCardStatus('installed')
    }, 1500)

    setTimeout(() => {
      setPhase('idle')
    }, 3300)
  }, [])

  const handleUninstall = useCallback(() => {
    setPhase('uninstalling')

    setTimeout(() => {
      setCardStatus('install')
      setPhase('idle')
    }, 800)
  }, [])

  const handleLike = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setHeartAnimating(true)
    setLiked(prev => !prev)
    setLikeCount(prev => liked ? prev - 1 : prev + 1)
    setTimeout(() => setHeartAnimating(false), 500)
  }, [liked])

  const isProcessing = phase !== 'idle'

  return (
    <div
      className={`flex flex-col h-full rounded-[20px] border bg-[var(--surface-primary)] overflow-hidden cursor-pointer transition-all duration-[var(--duration-normal)] relative ${
        phase === 'uninstalling'
          ? 'border-[var(--border-default)] opacity-70 scale-[0.99]'
          : phase === 'install-success'
          ? 'border-[var(--color-success-border)] shadow-[var(--shadow-md)]'
          : phase === 'installing'
          ? 'border-[var(--color-accent-5)] shadow-[0_0_0_2px_rgba(59,91,219,0.08)]'
          : 'border-[var(--border-default)] hover:shadow-[var(--shadow-md)]'
      }`}
      onClick={isProcessing ? undefined : onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <CardConfetti active={phase === 'install-success'} />

      {/* Processing overlay */}
      {phase === 'installing' && (
        <div
          className="absolute inset-0 z-[5] rounded-[20px] pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, rgba(59,91,219,0.03) 0%, rgba(59,91,219,0.06) 100%)',
            animation: 'success-overlay-in 0.3s ease forwards',
          }}
        />
      )}

      {/* Success glow */}
      {phase === 'install-success' && (
        <div
          className="absolute inset-0 z-[5] rounded-[20px] pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 50% 40%, rgba(47,158,68,0.08) 0%, transparent 70%)',
            animation: 'success-overlay-in 0.3s ease forwards',
          }}
        />
      )}

      {/* Top row: downloads + likes */}
      <div className="flex items-center justify-between px-5 pt-3 pb-[var(--space-sm)]">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 px-3 py-1 h-8 rounded-[12px] border border-[var(--color-neutral-3)] text-[length:var(--font-size-body-2)] font-medium text-[var(--color-neutral-8)]">
            <Download size={16} strokeWidth={1.5} /> {downloads}
          </span>
          {cardStatus === 'built' && buildStatus && (
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
        <button
          onClick={handleLike}
          className="flex items-center gap-1.5 cursor-pointer group/heart"
        >
          <span className={`text-[length:var(--font-size-caption)] font-medium transition-colors duration-[var(--duration-fast)] ${liked ? 'text-[var(--color-accent-9)]' : 'text-[var(--color-neutral-9)]'}`}>
            {likeCount}
          </span>
          <Heart
            size={24}
            strokeWidth={liked ? 0 : 1.5}
            fill={liked ? 'var(--color-accent-9)' : 'none'}
            className={`transition-colors duration-[var(--duration-fast)] ${
              liked ? 'text-[var(--color-accent-9)]' : 'text-[var(--color-neutral-7)] group-hover/heart:text-[var(--color-accent-5)]'
            }`}
            style={heartAnimating ? { animation: 'heart-bounce 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards' } : undefined}
          />
        </button>
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
        {cardStatus === 'install' && (
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
        {cardStatus !== 'install' && tags && tags.length > 0 && (
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
            Created By: <strong className={cardStatus === 'built' ? 'text-[color:var(--color-accent-9)]' : 'text-[var(--color-neutral-12)]'}>{creator || 'UpKeep'}</strong>
          </span>
          <span className={lastUpdatedStale ? 'text-[var(--color-error)] font-medium' : ''}>{lastUpdated || ''}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="px-5 pb-5">
        <CardActions
          status={cardStatus}
          phase={phase}
          onInstall={handleInstall}
          onUninstall={handleUninstall}
        />
      </div>
    </div>
  )
}
