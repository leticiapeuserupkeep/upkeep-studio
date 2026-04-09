import { redirect } from 'next/navigation'

/** Open the staging agent workspace (demo) directly. */
export default function SuperNovaStagingAgentsPage() {
  redirect('/supernova/staging/agents/demo-1')
}
