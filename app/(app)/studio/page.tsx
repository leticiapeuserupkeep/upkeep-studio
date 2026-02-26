import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/app/components/ui/Button'

export default function StudioPage() {
  return (
    <main className="relative flex-1 flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: [
            'radial-gradient(ellipse 80% 55% at 50% 42%, rgba(220, 212, 248, 0.55) 0%, transparent 70%)',
            'radial-gradient(ellipse 50% 38% at 50% 48%, rgba(200, 190, 245, 0.40) 0%, transparent 65%)',
            'white',
          ].join(', '),
        }}
      />

      <div className="flex flex-col items-center text-center px-[var(--space-md)] gap-[var(--space-xl)]">
        <Image
          src="/images/studio-illustration.png"
          alt="Studio apps illustration"
          width={400}
          height={320}
          priority
        />

        <div className="flex flex-col gap-[var(--space-sm)]">
          <h1 className="text-4xl font-extrabold text-[color:var(--color-neutral-11)]">
            Unlock Studio
          </h1>
          <p className="text-base font-semibold text-[color:var(--color-neutral-11)] max-w-md">
            Install ready-made apps or build your own, in just a few clicks.
          </p>
        </div>

        <Button variant="gradient" size="lg" asChild>
          <Link href="/studio/browse">Upgrade Today</Link>
        </Button>
      </div>
    </main>
  )
}
