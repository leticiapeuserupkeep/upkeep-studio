import Image from 'next/image'
import { Button } from '@/app/components/ui/Button'
import { SideNav } from '@/app/components/studio/SideNav'
import { TopBar } from '@/app/components/studio/TopBar'

export default function StudioPage() {
  return (
    <div className="flex min-h-screen">
      <SideNav />

      <div className="flex flex-col flex-1">
        <TopBar />

        <main className="relative flex-1 flex items-center justify-center overflow-hidden">
          {/* Dual radial gradient background */}
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

          {/* Content */}
          <div className="flex flex-col items-center text-center px-[var(--space-md)] gap-[var(--space-xl)]">
            <Image
              src="/images/studio-illustration.png"
              alt="Studio apps illustration"
              width={400}
              height={320}
              priority
            />

            <div className="flex flex-col gap-[var(--space-sm)]">
              <h1 className="text-4xl font-extrabold text-[var(--color-neutral-11)]">
                Unlock Studio
              </h1>
              <p className="text-base font-semibold text-[var(--color-neutral-11)] max-w-md">
                Install ready-made apps or build your own, in just a few clicks.
              </p>
            </div>

            <Button variant="gradient" size="lg">
              Upgrade Today
            </Button>
          </div>
        </main>
      </div>
    </div>
  )
}