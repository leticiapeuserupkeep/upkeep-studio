import { PanelLeft } from 'lucide-react'

export function TopBar() {
  return (
    <header className="flex items-center gap-[var(--space-sm)] h-[52px] px-[var(--space-md)] border-b border-[var(--color-neutral-4)] bg-[var(--color-neutral-1)]">
      <PanelLeft size={20} className="text-[var(--color-neutral-7)] cursor-pointer" />
      <h1 className="text-[var(--font-size-title-3)] font-semibold text-[var(--color-neutral-11)]">
        Studio
      </h1>
    </header>
  )
}
