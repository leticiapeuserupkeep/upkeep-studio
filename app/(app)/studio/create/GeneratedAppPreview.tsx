'use client'

import {
  BarChart3, Camera,
  Sparkles, Zap, Wrench, ClipboardList, Gauge, Package,
  Check,
} from 'lucide-react'

function deriveAppMeta(prompt: string) {
  const lower = prompt.toLowerCase()
  if (lower.includes('photo') || lower.includes('camera') || lower.includes('scan') || lower.includes('capture')) {
    return { name: 'Photo Intake', icon: Camera, headline: 'Take a photo.', headlineAccent: 'Get the job done.', subtitle: 'Turn handwritten notes, job sheets, or sketches into work orders.', kind: 'upload' as const }
  }
  if (lower.includes('dashboard') || lower.includes('kpi') || lower.includes('report') || lower.includes('metric')) {
    return { name: 'Impact Dashboard', icon: BarChart3, headline: 'See everything.', headlineAccent: 'Decide faster.', subtitle: 'Real-time KPIs, trends, and operational insights across all your sites.', kind: 'dashboard' as const }
  }
  if (lower.includes('inspection') || lower.includes('checklist') || lower.includes('safety') || lower.includes('audit')) {
    return { name: 'Smart Inspections', icon: ClipboardList, headline: 'Inspect once.', headlineAccent: 'Fix everything.', subtitle: 'Mobile-friendly checklists with photo evidence and automatic follow-ups.', kind: 'checklist' as const }
  }
  if (lower.includes('inventory') || lower.includes('parts') || lower.includes('stock') || lower.includes('warehouse')) {
    return { name: 'Parts Tracker', icon: Package, headline: 'Track every part.', headlineAccent: 'Never run out.', subtitle: 'Real-time inventory levels, low-stock alerts, and reorder automation.', kind: 'checklist' as const }
  }
  if (lower.includes('work order') || lower.includes('assign') || lower.includes('dispatch') || lower.includes('task')) {
    return { name: 'Work Order Hub', icon: Wrench, headline: 'Assign work.', headlineAccent: 'Track progress.', subtitle: 'Auto-assign tasks based on skills, location, and workload.', kind: 'dashboard' as const }
  }
  if (lower.includes('asset') || lower.includes('lifecycle') || lower.includes('warranty') || lower.includes('depreciation')) {
    return { name: 'Asset Lifecycle', icon: Gauge, headline: 'Know your assets.', headlineAccent: 'Plan ahead.', subtitle: 'Total cost of ownership, depreciation, and replacement planning.', kind: 'dashboard' as const }
  }
  return { name: 'Custom App', icon: Zap, headline: 'Built for you.', headlineAccent: 'Ready to use.', subtitle: 'A custom app built from your description, connected to your UpKeep data.', kind: 'dashboard' as const }
}

export function GeneratedAppPreview({ prompt }: { prompt: string }) {
  const app = deriveAppMeta(prompt)
  const AppIcon = app.icon

  return (
    <div
      className="flex flex-col h-full rounded-2xl overflow-hidden bg-[var(--surface-primary)] shadow-[var(--shadow-lg)] opacity-0"
      style={{ animation: 'fadeInUp 0.5s var(--ease-default) forwards' }}
    >
      {/* App header — dark gradient */}
      <div
        className="relative flex flex-col items-center justify-center text-center px-8 pt-12 pb-10 overflow-hidden"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(80,80,120,0.25) 0%, rgba(18,18,22,1) 70%)' }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 30% 80%, rgba(140,100,255,0.08) 0%, transparent 50%), radial-gradient(circle at 70% 20%, rgba(100,140,255,0.06) 0%, transparent 50%)' }} />
        <div className="relative z-[1] flex flex-col items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 border border-white/10 backdrop-blur-sm">
              <AppIcon size={20} className="text-white/90" />
            </div>
            <span className="text-[13px] font-semibold tracking-[0.15em] uppercase text-white/70">{app.name}</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <h2 className="text-[28px] font-bold leading-tight text-white/60">
              {app.headline.split(' ').map((word, i) => (
                <span key={i}>{i > 0 ? ' ' : ''}<span className={i === app.headline.split(' ').length - 1 ? 'text-white' : ''}>{word}</span></span>
              ))}
            </h2>
            <h2 className="text-[28px] font-bold leading-tight">
              {app.headlineAccent.split(' ').map((word, i) => (
                <span key={i}>{i > 0 ? ' ' : ''}<span className={i === app.headlineAccent.split(' ').length - 1 ? 'text-transparent bg-clip-text bg-gradient-to-r from-[#a78bfa] to-[#818cf8]' : 'text-white/60'}>{word}</span></span>
              ))}
            </h2>
          </div>
          <p className="text-sm text-white/50 max-w-[360px] leading-relaxed">{app.subtitle}</p>
        </div>
      </div>

      {/* App body — content card */}
      <div className="flex-1 flex flex-col items-center px-8 -mt-4 pb-8 relative z-[1]">
        <div className="w-full max-w-[400px] bg-[var(--surface-primary)] rounded-2xl shadow-[var(--shadow-xl)] border border-[var(--border-default)] p-8 flex flex-col items-center gap-5">
          {app.kind === 'upload' ? (
            <>
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-[var(--color-accent-5)] flex items-center justify-center">
                <Camera size={24} className="text-[var(--color-accent-7)]" />
              </div>
              <div className="flex flex-col items-center gap-1 text-center">
                <p className="text-sm font-semibold text-[var(--color-neutral-12)]">Choose a file or drag & drop it here</p>
                <p className="text-xs text-[var(--color-neutral-7)]">JPEG, PNG, PDF, and MP4 formats, up to 50MB</p>
              </div>
              <button className="px-5 py-2 rounded-lg bg-[var(--color-accent-9)] text-white text-sm font-medium hover:bg-[var(--color-accent-10)] transition-colors duration-[var(--duration-fast)] cursor-pointer">
                Browse File
              </button>
            </>
          ) : app.kind === 'checklist' ? (
            <>
              <div className="w-full flex flex-col gap-3">
                {['Equipment condition check', 'Safety hazards identified', 'PPE compliance verified', 'Area cleanliness confirmed'].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 py-2 px-3 rounded-lg bg-[var(--color-neutral-2)] border border-[var(--border-default)]">
                    <div className={`w-5 h-5 rounded-[5px] border-2 flex items-center justify-center shrink-0 ${i < 2 ? 'bg-[var(--color-accent-9)] border-[var(--color-accent-9)]' : 'border-[var(--color-neutral-6)]'}`}>
                      {i < 2 && <Check size={12} strokeWidth={3} className="text-white" />}
                    </div>
                    <span className={`text-sm ${i < 2 ? 'text-[var(--color-neutral-8)] line-through' : 'text-[var(--color-neutral-12)]'}`}>{item}</span>
                  </div>
                ))}
              </div>
              <div className="w-full flex items-center justify-between pt-2">
                <span className="text-xs text-[var(--color-neutral-7)]">2 of 4 complete</span>
                <div className="w-24 h-1.5 rounded-full bg-[var(--color-neutral-3)]">
                  <div className="w-1/2 h-full rounded-full bg-[var(--color-accent-9)]" />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="w-full grid grid-cols-2 gap-3">
                {[
                  { label: 'Open WOs', value: '24', trend: '+3' },
                  { label: 'Completed', value: '148', trend: '+12' },
                  { label: 'Avg Response', value: '2.4h', trend: '-0.3h' },
                  { label: 'Uptime', value: '96.2%', trend: '+1.1%' },
                ].map((kpi) => (
                  <div key={kpi.label} className="flex flex-col gap-1 p-3 rounded-lg bg-[var(--color-neutral-2)] border border-[var(--border-default)]">
                    <span className="text-[11px] font-medium text-[var(--color-neutral-8)] uppercase tracking-wider">{kpi.label}</span>
                    <span className="text-lg font-bold text-[var(--color-neutral-12)]">{kpi.value}</span>
                    <span className="text-[11px] font-medium text-[var(--color-accent-9)]">{kpi.trend}</span>
                  </div>
                ))}
              </div>
              <div className="w-full h-20 rounded-lg bg-[var(--color-neutral-2)] border border-[var(--border-default)] flex items-end gap-1 px-3 pb-2 pt-3">
                {[40, 65, 50, 80, 60, 75, 90, 55, 70, 85, 45, 95].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-sm bg-[var(--color-accent-9)] opacity-0"
                    style={{ height: `${h}%`, animation: `fadeInUp 0.3s var(--ease-default) ${0.5 + i * 0.04}s forwards` }}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Pagination dots */}
        <div className="flex items-center gap-2 mt-6">
          <div className="w-6 h-2 rounded-full bg-[var(--color-accent-9)]" />
          <div className="w-2 h-2 rounded-full bg-[var(--color-neutral-5)]" />
          <div className="w-2 h-2 rounded-full bg-[var(--color-neutral-5)]" />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-center gap-2 py-4 border-t border-[var(--border-default)]">
        <Sparkles size={14} className="text-[var(--color-neutral-7)]" />
        <span className="text-xs text-[var(--color-neutral-7)]">Created by UpKeep Studio — 2026</span>
      </div>
    </div>
  )
}

export function BuilderSkeletons() {
  const skeletons = [
    { width: '100%', height: 72 },
    { width: 376, height: 72 },
    { width: 497, height: 31 },
    { width: 329, height: 16 },
    { width: 329, height: 16 },
    { width: 329, height: 16 },
    { width: 329, height: 16 },
    { width: '100%', height: 136 },
    { width: '100%', height: 136 },
    { width: '100%', height: 136 },
    { width: '100%', height: 136 },
  ]

  return (
    <>
      {skeletons.map((s, i) => (
        <div
          key={i}
          className="skeleton opacity-0"
          style={{
            width: typeof s.width === 'number' ? s.width : s.width,
            height: s.height,
            animation: `fadeInUp 0.4s var(--ease-default) ${0.1 + i * 0.06}s forwards`,
          }}
        />
      ))}
    </>
  )
}
