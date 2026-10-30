import type { CSSProperties } from 'react'
import { Button } from '@/components/ui/Button'
import { OrbitButton } from '@/components/ui/OrbitButton'
import { SectionHeading } from '@/components/ui/SectionHeading'

/** Hinweis auf die Leistungsmappe: Standbild des Buchs auf dem Tisch als Karte mit Reiter (Aktenordner), Link zum Blättern */
export function MappeTeaser() {
  return (
    <section className="on-dark section bg-night text-paper" aria-labelledby="mappe-title">
      <div className="container-site grid-site gap-y-12 lg:items-center">
        <div className="col-span-12 lg:col-span-5">
          <SectionHeading
            eyebrow="Leistungsmappe"
            title="Alles Wichtige zum Blättern."
            id="mappe-title"
            text="Team, Leistungen, Ablauf, Garantie und Konditionen in einer Mappe. Zum Durchblättern am Bildschirm, als PDF für Ihre Unterlagen oder zum Weitergeben."
          />
          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
            <Button to="/leistungsmappe" arrow>
              Mappe aufschlagen
            </Button>
          </div>
        </div>
        <div className="relative col-span-12 lg:col-span-6 lg:col-start-7">
          <a href="/leistungsmappe" tabIndex={-1} aria-hidden className="tab-shadow group block">
            <span className="tab-card block p-0" style={{ '--tab-bg': 'var(--color-night-2)' } as CSSProperties}>
              <img src="/mappe/teaser.webp" alt="" width={1200} height={800} loading="lazy" decoding="async" className="block h-auto w-full rounded-[0_14px_14px_14px]" />
            </span>
          </a>
          <OrbitButton className="absolute right-5 bottom-5 sm:right-8 sm:bottom-8" />
        </div>
      </div>
    </section>
  )
}
