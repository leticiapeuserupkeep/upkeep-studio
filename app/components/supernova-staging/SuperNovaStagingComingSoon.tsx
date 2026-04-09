'use client'

import { EmptyState } from '@/app/components/ui/EmptyState'
import { SuperNovaStagingOrb } from '@/app/components/supernova-staging/SuperNovaStagingOrb'

type SuperNovaStagingComingSoonProps = {
  title: string
  description: string
}

/** Centered empty state for staging routes that are not built yet (orb + copy aligned with agent Inbox/Workbench). */
export function SuperNovaStagingComingSoon({ title, description }: SuperNovaStagingComingSoonProps) {
  return (
    <div className="sn-staging-agent-coming-soon-panel-enter mx-auto flex min-h-[min(100%,480px)] w-full max-w-[min(100%,720px)] flex-col justify-center px-[var(--space-xl)] py-[var(--space-3xl)]">
      <EmptyState
        iconPresentation="orb"
        icon={<SuperNovaStagingOrb size="xl" />}
        title={title}
        titleClassName="text-[length:var(--font-size-xl)]"
        description={description}
        descriptionClassName="text-[length:var(--font-size-md)] max-w-[360px]"
      />
    </div>
  )
}
