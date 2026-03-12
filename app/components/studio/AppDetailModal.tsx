'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import * as Dialog from '@radix-ui/react-dialog'
import {
  X, Heart, Download, Star, Users, CheckCircle2, Sparkles,
  ChevronLeft, ChevronRight, ShieldCheck, Database,
  Pencil,
} from 'lucide-react'
import { Button } from '@/app/components/ui/Button'

type AppStatus = 'install' | 'installed' | 'update' | 'built'

export interface AppDetail {
  title: string
  description: string
  longDescription: string
  likes: number
  downloads: number
  status: AppStatus
  color?: string
  tags: string[]
  rating: number
  ratingCount: number
  size: string
  creator: string
  useCases: string[]
  howItWorks: string[]
  permissions: string[]
  whatsNew: string[]
  lastUpdated?: string
  verified?: boolean
  category?: string
  dataEntities?: string[]
  changelog?: { date: string; description: string }[]
  reviews?: { author: string; role: string; rating: number; comment: string; date: string }[]
  permissionScope?: 'read-only' | 'read-write'
  image?: string
  screenshots?: string[]
  buildStatus?: 'published' | 'in-review' | 'rejected'
  suggestedNote?: string
}

interface AppDetailModalProps {
  app: AppDetail | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

type InstallPhase = 'idle' | 'installing' | 'done'

export function AppDetailModal({ app, open, onOpenChange }: AppDetailModalProps) {
  const router = useRouter()
  const [installPhase, setInstallPhase] = useState<InstallPhase>('idle')
  const [progress, setProgress] = useState(0)
  const [screenshotIdx, setScreenshotIdx] = useState(0)
  const hasScreenshots = !!(app?.screenshots && app.screenshots.length > 0)
  const totalScreenshots = hasScreenshots ? (app?.screenshots?.length ?? 3) : 3

  const resetState = useCallback(() => {
    setInstallPhase('idle')
    setProgress(0)
    setScreenshotIdx(0)
  }, [])

  useEffect(() => {
    if (!open) resetState()
  }, [open, resetState])

  useEffect(() => {
    if (installPhase !== 'installing') return
    const duration = 2800
    const interval = 30
    const step = 100 / (duration / interval)
    let current = 0
    const timer = setInterval(() => {
      current += step + Math.random() * step * 0.5
      if (current >= 100) {
        current = 100
        clearInterval(timer)
        setProgress(100)
        setInstallPhase('done')
      } else {
        setProgress(current)
      }
    }, interval)
    return () => clearInterval(timer)
  }, [installPhase])

  useEffect(() => {
    if (installPhase !== 'done') return
    const timer = setTimeout(() => {
      onOpenChange(false)
      router.push('/studio/browse')
    }, 1200)
    return () => clearTimeout(timer)
  }, [installPhase, onOpenChange, router])

  if (!app) return null

  const handleInstall = () => setInstallPhase('installing')
  const accentColor = app.color || '#3E63DD'
  const prevShot = () => setScreenshotIdx((p) => (p - 1 + totalScreenshots) % totalScreenshots)
  const nextShot = () => setScreenshotIdx((p) => (p + 1) % totalScreenshots)

  return (
    <Dialog.Root open={open} onOpenChange={(v) => { if (installPhase === 'idle') onOpenChange(v) }}>
      <Dialog.Portal>
        <Dialog.Overlay data-dialog-overlay className="fixed inset-0 z-[var(--z-overlay)] bg-black/40" />
        <Dialog.Content
          data-dialog-content
          className="fixed left-1/2 top-1/2 z-[var(--z-modal)] w-full max-w-[800px] h-[85vh] rounded-2xl border border-[var(--border-default)] bg-[var(--surface-primary)] shadow-[var(--shadow-xl)] focus:outline-none flex flex-col overflow-hidden"
        >
          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto">
            {/* Header */}
            <div className="flex items-start gap-[var(--space-md)] px-[var(--space-2xl)] pt-[var(--space-xl)] pb-[var(--space-md)]">
              <div
                className="flex items-center justify-center w-14 h-14 rounded-[var(--radius-xl)] shrink-0"
                style={{ backgroundColor: accentColor }}
              >
                <Sparkles size={24} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-[var(--space-sm)]">
                  <Dialog.Title className="text-[length:var(--font-size-2xl)] font-bold text-[var(--color-neutral-12)]">
                    {app.title}
                  </Dialog.Title>
                  {app.verified && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--color-accent-1)] border border-[var(--color-accent-4)] text-[length:var(--font-size-xs)] font-medium text-[var(--color-accent-9)]">
                      <ShieldCheck size={12} /> Verified by UpKeep
                    </span>
                  )}
                </div>
                <p className="text-[length:var(--font-size-body-1)] text-[var(--color-neutral-8)] mt-1">
                  {app.description}
                </p>
              </div>
              <Dialog.Close asChild>
                <button
                  className="flex items-center justify-center w-8 h-8 rounded-[var(--radius-md)] hover:bg-[var(--color-neutral-3)] transition-colors duration-[var(--duration-fast)] cursor-pointer shrink-0 mt-1"
                  aria-label="Close"
                  disabled={installPhase !== 'idle'}
                >
                  <X size={18} className="text-[var(--color-neutral-7)]" />
                </button>
              </Dialog.Close>
            </div>

            {/* Full description */}
            <div className="px-[var(--space-2xl)] pb-[var(--space-md)]">
              <p className="text-[length:var(--font-size-body-2)] text-[var(--color-neutral-9)] leading-relaxed">
                {app.longDescription}
              </p>
            </div>

            {/* Tags */}
            <div className="flex items-center gap-[var(--space-xs)] px-[var(--space-2xl)] pb-[var(--space-lg)]">
              {app.tags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-[var(--border-default)] text-[length:var(--font-size-sm)] text-[var(--color-neutral-9)]">
                  {tag}
                </span>
              ))}
              {app.category && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[var(--color-neutral-3)] text-[length:var(--font-size-sm)] text-[var(--color-neutral-9)]">
                  {app.category}
                </span>
              )}
            </div>

            {/* Screenshot carousel */}
            <div className="relative px-[var(--space-2xl)] pb-[var(--space-lg)]">
              <div className="relative rounded-[var(--radius-xl)] overflow-hidden h-[260px]">
                <div className="flex h-full transition-transform duration-[var(--duration-slow)] ease-[var(--ease-default)]" style={{ transform: `translateX(-${screenshotIdx * 100}%)` }}>
                  {hasScreenshots ? (
                    app.screenshots!.map((src, i) => (
                      <div key={i} className="min-w-full h-full">
                        <img src={src} alt={`${app.title} screenshot ${i + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="flex items-center justify-center min-w-full h-full px-[var(--space-2xl)] py-[var(--space-lg)]" style={{ backgroundColor: accentColor }}>
                        <div className="w-full max-w-[600px] h-full rounded-[var(--radius-lg)] bg-white/90 flex flex-col gap-2 p-5">
                          <div className="grid grid-cols-3 gap-2 flex-1">
                            <div className="rounded bg-[var(--color-neutral-4)]" />
                            <div className="rounded" style={{ backgroundColor: `${accentColor}20` }} />
                            <div className="rounded bg-[var(--color-neutral-4)]" />
                          </div>
                          <div className="h-10 rounded bg-[var(--color-neutral-4)]" />
                        </div>
                      </div>
                      <div className="flex items-center justify-center min-w-full h-full px-[var(--space-2xl)] py-[var(--space-lg)]" style={{ backgroundColor: accentColor }}>
                        <div className="w-full max-w-[600px] h-full rounded-[var(--radius-lg)] bg-white/90 flex flex-col gap-2 p-5">
                          {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded bg-[var(--color-neutral-4)] shrink-0" />
                              <div className="flex-1 h-3 rounded bg-[var(--color-neutral-4)]" />
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center justify-center min-w-full h-full px-[var(--space-2xl)] py-[var(--space-lg)]" style={{ backgroundColor: accentColor }}>
                        <div className="w-full max-w-[600px] h-full rounded-[var(--radius-lg)] bg-white/90 flex flex-col gap-3 p-5">
                          <div className="h-5 w-2/3 rounded bg-[var(--color-neutral-4)]" />
                          <div className="h-3 w-full rounded bg-[var(--color-neutral-4)]" />
                          <div className="flex gap-2 flex-1">
                            <div className="flex-1 rounded" style={{ backgroundColor: `${accentColor}15` }} />
                            <div className="flex-1 rounded bg-[var(--color-neutral-4)]" />
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
                {/* Carousel arrows */}
                <button onClick={prevShot} className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-[var(--shadow-md)] cursor-pointer hover:bg-white transition-colors duration-[var(--duration-fast)]">
                  <ChevronLeft size={16} className="text-[var(--color-neutral-11)]" />
                </button>
                <button onClick={nextShot} className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-[var(--shadow-md)] cursor-pointer hover:bg-white transition-colors duration-[var(--duration-fast)]">
                  <ChevronRight size={16} className="text-[var(--color-neutral-11)]" />
                </button>
                {/* Carousel dots */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {Array.from({ length: totalScreenshots }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setScreenshotIdx(i)}
                      className={`w-2 h-2 rounded-full transition-colors duration-[var(--duration-fast)] cursor-pointer ${i === screenshotIdx ? 'bg-white' : 'bg-white/50'}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="flex items-start px-[var(--space-2xl)] pb-[var(--space-lg)] gap-[var(--space-lg)]">
              <div className="flex items-center gap-[var(--space-sm)]">
                <span className="text-[length:var(--font-size-xs)] font-medium text-[var(--color-neutral-7)] uppercase tracking-wide">Ratings</span>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={11} className={i < Math.round(app.rating) ? 'text-[var(--color-warning)] fill-[var(--color-warning)]' : 'text-[var(--color-neutral-5)]'} />
                  ))}
                </div>
                <span className="text-[length:var(--font-size-sm)] font-bold text-[var(--color-neutral-12)]">{app.rating.toFixed(1)}</span>
                <span className="text-[length:var(--font-size-xs)] text-[var(--color-neutral-7)]">({app.ratingCount})</span>
              </div>
              <div className="w-px h-4 bg-[var(--border-default)] mt-0.5" />
              <div className="flex items-center gap-[var(--space-xs)]">
                <span className="text-[length:var(--font-size-xs)] font-medium text-[var(--color-neutral-7)] uppercase tracking-wide">Size</span>
                <span className="text-[length:var(--font-size-sm)] font-bold text-[var(--color-neutral-12)]">{app.size}</span>
              </div>
              <div className="w-px h-4 bg-[var(--border-default)] mt-0.5" />
              <div className="flex items-center gap-[var(--space-xs)]">
                <Heart size={12} className="text-[var(--color-accent-9)] fill-[var(--color-accent-9)]" />
                <span className="text-[length:var(--font-size-sm)] font-bold text-[var(--color-neutral-12)]">{formatNumber(app.likes)}</span>
              </div>
              <div className="w-px h-4 bg-[var(--border-default)] mt-0.5" />
              <div className="flex items-center gap-[var(--space-xs)]">
                <Download size={12} className="text-[var(--color-neutral-7)]" />
                <span className="text-[length:var(--font-size-sm)] font-bold text-[var(--color-neutral-12)]">{formatNumber(app.downloads)}</span>
              </div>
              <div className="w-px h-4 bg-[var(--border-default)] mt-0.5" />
              <div className="flex items-center gap-[var(--space-xs)]">
                <div className="w-5 h-5 rounded-full bg-[var(--color-neutral-4)] flex items-center justify-center">
                  <Users size={10} className="text-[var(--color-neutral-8)]" />
                </div>
                <span className="text-[length:var(--font-size-sm)] text-[var(--color-neutral-9)]">{app.creator}</span>
              </div>
            </div>

            <div className="h-px bg-[var(--border-subtle)] mx-[var(--space-2xl)]" />

            {/* What data does this app use? */}
            {app.dataEntities && app.dataEntities.length > 0 && (
              <div className="px-[var(--space-2xl)] py-[var(--space-lg)]">
                <h3 className="flex items-center gap-[var(--space-xs)] text-[length:var(--font-size-body-1)] font-bold text-[var(--color-neutral-12)] mb-[var(--space-sm)]">
                  <Database size={16} className="text-[var(--color-neutral-8)]" />
                  What data does this app use?
                </h3>
                <div className="flex flex-wrap gap-[var(--space-xs)]">
                  {app.dataEntities.map((entity) => (
                    <span key={entity} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-lg)] bg-[var(--color-neutral-3)] text-[length:var(--font-size-sm)] font-medium text-[var(--color-neutral-11)]">
                      {entity}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="h-px bg-[var(--border-subtle)] mx-[var(--space-2xl)]" />


            {/* Use Cases & How It Works */}
            <InfoSection title="Use Cases" items={app.useCases} />
            <InfoSection title="How It Works" items={app.howItWorks} />

            <div className="h-px bg-[var(--border-subtle)] mx-[var(--space-2xl)]" />

            {/* Changelog */}
            {app.changelog && app.changelog.length > 0 && (
              <div className="px-[var(--space-2xl)] py-[var(--space-lg)]">
                <h3 className="text-[length:var(--font-size-body-1)] font-bold text-[var(--color-neutral-12)] mb-[var(--space-sm)]">
                  Changelog
                </h3>
                <div className="flex flex-col gap-[var(--space-md)]">
                  {app.changelog.map((entry) => (
                    <div key={entry.date} className="flex items-start gap-[var(--space-md)]">
                      <span className="text-[length:var(--font-size-sm)] text-[var(--color-neutral-7)] whitespace-nowrap mt-px min-w-[80px]">
                        {entry.date}
                      </span>
                      <p className="text-[length:var(--font-size-body-2)] text-[var(--color-neutral-9)]">
                        {entry.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!app.changelog && <InfoSection title="What's New" items={app.whatsNew} />}

            <div className="h-px bg-[var(--border-subtle)] mx-[var(--space-2xl)]" />

            {/* Reviews */}
            {app.reviews && app.reviews.length > 0 && (
              <div className="px-[var(--space-2xl)] py-[var(--space-lg)]">
                <h3 className="text-[length:var(--font-size-body-1)] font-bold text-[var(--color-neutral-12)] mb-[var(--space-md)]">
                  Reviews
                </h3>
                <div className="flex flex-col gap-[var(--space-md)]">
                  {app.reviews.map((review, idx) => (
                    <div key={idx} className="flex flex-col gap-[var(--space-xs)] p-[var(--space-md)] rounded-[var(--radius-xl)] bg-[var(--color-neutral-2)] border border-[var(--border-subtle)]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-[var(--space-sm)]">
                          <div className="w-7 h-7 rounded-full bg-[var(--color-neutral-4)] flex items-center justify-center">
                            <span className="text-[length:var(--font-size-xs)] font-semibold text-[var(--color-neutral-9)]">
                              {review.author.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <span className="text-[length:var(--font-size-sm)] font-semibold text-[var(--color-neutral-11)]">{review.author}</span>
                            <span className="text-[length:var(--font-size-xs)] text-[var(--color-neutral-7)] ml-2">{review.role}</span>
                          </div>
                        </div>
                        <span className="text-[length:var(--font-size-xs)] text-[var(--color-neutral-7)]">{review.date}</span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={11} className={i < review.rating ? 'text-[var(--color-warning)] fill-[var(--color-warning)]' : 'text-[var(--color-neutral-5)]'} />
                        ))}
                      </div>
                      <p className="text-[length:var(--font-size-body-2)] text-[var(--color-neutral-9)] leading-relaxed">
                        {review.comment}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Fixed footer */}
          <div className="shrink-0 border-t border-[var(--border-subtle)] bg-[var(--surface-primary)]">
            {installPhase === 'idle' && (
              <div className="flex items-center gap-[var(--space-sm)] px-[var(--space-2xl)] py-[var(--space-md)]">
                {(app.status === 'installed' || app.status === 'update') && (
                  <button className="text-[length:var(--font-size-body-2)] font-medium text-[var(--color-error)] hover:underline cursor-pointer transition-colors duration-[var(--duration-fast)]">
                    Uninstall
                  </button>
                )}
                <div className="flex-1" />
                <Button variant="ghost" size="lg" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                {app.status === 'install' && (
                  <Button variant="primary" size="lg" onClick={handleInstall}>Install</Button>
                )}
                {app.status === 'installed' && (
                  <Button
                    variant="secondary"
                    size="lg"
                    className="border-[var(--color-accent-5)] text-[var(--color-accent-9)] hover:bg-[var(--color-accent-1)]"
                    onClick={() => { onOpenChange(false); router.push('/studio/browse') }}
                  >
                    Open
                  </Button>
                )}
                {app.status === 'update' && (
                  <Button variant="primary" size="lg" onClick={handleInstall}>Update</Button>
                )}
                {app.status === 'built' && (
                  <>
                    <Button
                      variant="secondary"
                      size="lg"
                      className="!px-3 border-[var(--color-accent-5)] text-[var(--color-accent-9)] hover:bg-[var(--color-accent-1)]"
                      aria-label="Edit"
                    >
                      <Pencil size={16} />
                    </Button>
                    <Button
                      variant="secondary"
                      size="lg"
                      className="border-[var(--color-accent-5)] text-[var(--color-accent-9)] hover:bg-[var(--color-accent-1)]"
                      onClick={() => { onOpenChange(false); router.push('/studio/browse') }}
                    >
                      Open
                    </Button>
                  </>
                )}
              </div>
            )}

            {installPhase === 'installing' && (
              <div className="px-[var(--space-2xl)] py-[var(--space-lg)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[length:var(--font-size-sm)] font-medium text-[var(--color-neutral-11)]">
                    Installing {app.title}...
                  </span>
                  <span className="text-[length:var(--font-size-sm)] text-[var(--color-neutral-8)]">
                    {Math.round(progress)}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-[var(--color-neutral-3)] overflow-hidden">
                  <div
                    className="h-full rounded-full install-progress-bar transition-[width] duration-75 ease-linear"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-[length:var(--font-size-xs)] text-[var(--color-neutral-7)] mt-2 install-status-text">
                  {progress < 30 && 'Downloading app package...'}
                  {progress >= 30 && progress < 60 && 'Configuring workspace...'}
                  {progress >= 60 && progress < 85 && 'Setting up integrations...'}
                  {progress >= 85 && 'Finalizing installation...'}
                </p>
              </div>
            )}

            {installPhase === 'done' && (
              <div className="flex items-center justify-center gap-[var(--space-sm)] px-[var(--space-2xl)] py-[var(--space-lg)] install-done-animate">
                <CheckCircle2 size={20} className="text-[var(--color-success)]" />
                <span className="text-[length:var(--font-size-body-1)] font-semibold text-[var(--color-success)]">
                  Installed! Opening {app.title}...
                </span>
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function InfoSection({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="px-[var(--space-2xl)] py-[var(--space-lg)]">
      <h3 className="text-[length:var(--font-size-body-1)] font-bold text-[var(--color-neutral-12)] mb-[var(--space-sm)]">
        {title}
      </h3>
      <ul className="flex flex-col gap-[var(--space-xs)]">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-[var(--space-xs)] text-[length:var(--font-size-body-2)] text-[var(--color-neutral-9)]">
            <span className="mt-[5px] w-1.5 h-1.5 rounded-full bg-[var(--color-neutral-6)] shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return n.toString()
}
