'use client'

import { useState } from 'react'
import { ClipboardCopy, Check, Sparkles, CheckCircle2, AlertTriangle, Clock, StickyNote } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/Card'
import { Badge } from '@/app/components/ui/Badge'
import { Button } from '@/app/components/ui/Button'
import type { ShiftHandoff as ShiftHandoffType } from '@/app/lib/models'

interface ShiftHandoffProps {
  handoff: ShiftHandoffType
}

export function ShiftHandoff({ handoff }: ShiftHandoffProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    const text = [
      '## Shift Handoff Summary',
      `Generated: ${new Date(handoff.generatedAt).toLocaleString()}`,
      '',
      '### Completed',
      ...handoff.completed.map((c) => `- ✅ ${c}`),
      '',
      '### Escalated',
      ...handoff.escalated.map((e) => `- ⚠️ ${e}`),
      '',
      '### Unfinished',
      ...handoff.unfinished.map((u) => `- 🕐 ${u}`),
      '',
      '### Notes',
      ...handoff.notes.map((n) => `- 📝 ${n}`),
    ].join('\n')

    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card>
      <CardHeader
        action={
          <Button variant="secondary" size="sm" onClick={handleCopy}>
            {copied ? <Check size={14} /> : <ClipboardCopy size={14} />}
            {copied ? 'Copied' : 'Copy summary'}
          </Button>
        }
      >
        <div className="flex items-center gap-2">
          <CardTitle>Shift Handoff</CardTitle>
          <Badge severity="info" dot><Sparkles size={10} /> AI Generated</Badge>
        </div>
        <CardDescription>
          Generated {new Date(handoff.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </CardDescription>
      </CardHeader>

      <div className="px-[var(--space-lg)] pb-[var(--space-lg)] flex flex-col gap-[var(--space-md)]">
        <Section icon={<CheckCircle2 size={14} className="text-[var(--color-success)]" />} title="Completed" count={handoff.completed.length}>
          {handoff.completed.map((item, i) => (
            <li key={i} className="text-[length:var(--font-size-sm)] text-[var(--color-neutral-9)] py-0.5">{item}</li>
          ))}
        </Section>

        {handoff.escalated.length > 0 && (
          <Section icon={<AlertTriangle size={14} className="text-[var(--color-error)]" />} title="Escalated" count={handoff.escalated.length}>
            {handoff.escalated.map((item, i) => (
              <li key={i} className="text-[length:var(--font-size-sm)] text-[var(--color-error)] font-medium py-0.5">{item}</li>
            ))}
          </Section>
        )}

        <Section icon={<Clock size={14} className="text-[var(--color-warning)]" />} title="Unfinished" count={handoff.unfinished.length}>
          {handoff.unfinished.map((item, i) => (
            <li key={i} className="text-[length:var(--font-size-sm)] text-[var(--color-neutral-9)] py-0.5">{item}</li>
          ))}
        </Section>

        {handoff.notes.length > 0 && (
          <Section icon={<StickyNote size={14} className="text-[var(--color-accent-9)]" />} title="Notes" count={handoff.notes.length}>
            {handoff.notes.map((item, i) => (
              <li key={i} className="text-[length:var(--font-size-sm)] text-[var(--color-neutral-9)] py-0.5">{item}</li>
            ))}
          </Section>
        )}
      </div>
    </Card>
  )
}

function Section({ icon, title, count, children }: { icon: React.ReactNode; title: string; count: number; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1.5">
        {icon}
        <span className="text-[length:var(--font-size-sm)] font-semibold text-[var(--color-neutral-11)]">{title}</span>
        <span className="text-[length:var(--font-size-xs)] text-[var(--color-neutral-7)]">({count})</span>
      </div>
      <ul className="list-none pl-5 flex flex-col">{children}</ul>
    </div>
  )
}
