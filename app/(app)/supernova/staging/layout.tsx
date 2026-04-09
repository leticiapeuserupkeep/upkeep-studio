import { SuperNovaStagingShell } from '@/app/components/supernova-staging/SuperNovaStagingShell'

export default function SuperNovaStagingLayout({ children }: { children: React.ReactNode }) {
  return <SuperNovaStagingShell>{children}</SuperNovaStagingShell>
}
