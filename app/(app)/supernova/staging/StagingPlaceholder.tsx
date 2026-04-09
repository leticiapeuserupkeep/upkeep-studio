export function StagingPlaceholder({ title }: { title: string }) {
  return (
    <div className="w-full max-w-2xl px-[var(--space-2xl)] py-[var(--space-xl)]">
      <h1 className="text-[length:var(--font-size-title-2)] font-bold text-[var(--color-neutral-12)] mb-2">
        {title}
      </h1>
      <p className="text-[length:var(--font-size-body-2)] text-[var(--color-neutral-8)]">
        This staging section is a placeholder. Use the sidebar to open Workflows or go back to UpKeep.
      </p>
    </div>
  )
}
