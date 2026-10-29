import { Button } from '@/components/ui/Button'
import { SectionHeading } from '@/components/ui/SectionHeading'

/** Hinweis auf die Leistungsmappe: ruhiges Standbild des geschlossenen Buchs auf dem Tisch, Link zum Blättern */
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
        <a href="/leistungsmappe" tabIndex={-1} aria-hidden className="group col-span-12 block overflow-hidden lg:col-span-6 lg:col-start-7" data-reveal>
          <img
            src="/mappe/teaser.webp"
            alt=""
            width={1200}
            height={800}
            loading="lazy"
            decoding="async"
            className="block h-auto w-full transition-transform duration-[1200ms] ease-cs group-hover:scale-[1.02]"
          />
        </a>
      </div>
    </section>
  )
}
