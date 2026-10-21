import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, Check } from 'lucide-react'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Picture } from '@/components/ui/Picture'
import { services } from '@/content/services'
import { home } from '@/content/site'
import type { ImageId } from '@/content/images'
import { cn } from '@/lib/cn'

/** Bild füllt die Fläche des Elternelements (überschreibt das feste Seitenverhältnis des Platzhalters) */
const FILL = 'h-full w-full aspect-auto! transition-transform duration-700 ease-out group-hover:scale-[1.04]'

/**
 * Leistungen: Büroreinigung als große Bildkarte, die übrigen Leistungen mit Bild.
 * Handy: große Karte für die Büroreinigung, darunter eine kompakte Liste zum schnellen Überblick.
 */
export function ServicesGrid({ heading = true }: { heading?: boolean }) {
  const Title = heading ? 'h3' : 'h2'
  const featured = services.find((s) => s.featured) ?? services[0]
  const rest = services.filter((s) => s !== featured)

  return (
    <section className="relative bg-glacier py-24 sm:py-32" aria-labelledby={heading ? 'services-title' : undefined}>
      <div className="container-site relative">
        {heading && (
          <div className="mb-12 flex flex-col justify-between gap-6 sm:mb-14 lg:flex-row lg:items-end">
            <SectionHeading eyebrow={home.services.eyebrow} title={home.services.headline} text={home.services.lead} id="services-title" />
            <Link to="/leistungen" className="group inline-flex shrink-0 items-center gap-2 font-semibold text-blue" data-reveal>
              Alle Leistungen
              <ArrowUpRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:grid-rows-[auto_auto_auto]">
          {/* Kernleistung: großes Bild, Text unten auf dunklem Verlauf */}
          <Link
            to={`/leistungen/${featured.slug}`}
            className="group relative isolate flex min-h-[30rem] flex-col justify-end overflow-hidden rounded-panel bg-ink text-white shadow-lift sm:col-span-2 sm:min-h-[34rem] lg:row-span-2 lg:min-h-0"
            data-reveal
          >
            <div className="absolute inset-0 -z-10">
              <Picture id={featured.image as ImageId} tone="dark" rounded="rounded-none" className={FILL} sizes="(min-width:1024px) 66vw, 100vw" />
            </div>
            <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/75 to-ink/0" />
            <div className="p-6 sm:p-9">
              <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold tracking-wide text-white backdrop-blur">Unsere Kernleistung</span>
              <Title className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">{featured.name}</Title>
              <p className="mt-3 max-w-lg text-white/80 sm:text-lg">{featured.short}</p>
              <ul className="mt-5 flex flex-wrap gap-2 text-sm">
                {['Arbeitsplätze und Besprechung', 'Teeküche und Sanitär', 'Böden und Papierkörbe'].map((t) => (
                  <li key={t} className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 ring-1 ring-white/15">
                    <Check aria-hidden className="size-3.5 text-fresh" strokeWidth={3} />
                    {t}
                  </li>
                ))}
              </ul>
              <span className="mt-7 inline-flex items-center gap-2 font-semibold">
                Leistungsverzeichnis ansehen
                <ArrowRight aria-hidden className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </div>
          </Link>

          {/* Handy: übrige Leistungen als Wisch-Slider, die nächste Karte ist angeschnitten */}
          <div className="-mx-5 sm:hidden" data-reveal>
            <ul
              className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-5 px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              aria-label="Weitere Leistungen"
            >
              {rest.map((s) => (
                <li key={s.slug} className="w-[76%] shrink-0 snap-start">
                  <Link to={`/leistungen/${s.slug}`} className="flex h-full flex-col overflow-hidden rounded-card bg-white ring-1 ring-line active:ring-blue/40">
                    <span className="block aspect-[4/3] overflow-hidden">
                      <Picture id={s.image as ImageId} compact rounded="rounded-none" className="h-full w-full aspect-auto!" sizes="76vw" />
                    </span>
                    <span className="flex flex-1 flex-col p-4">
                      <span className="font-semibold text-ink">{s.name}</span>
                      <span className="mt-1 line-clamp-3 flex-1 text-sm leading-snug text-muted">{s.short}</span>
                      <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-blue">
                        Mehr erfahren <ArrowRight aria-hidden className="size-4" />
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-2 px-5 text-xs text-muted">Wischen für weitere Leistungen</p>
          </div>

          {/* Ab Tablet: Karten mit Bild */}
          {rest.map((s) => (
            <Link
              key={s.slug}
              to={`/leistungen/${s.slug}`}
              className="group hidden flex-col overflow-hidden rounded-card bg-white ring-1 ring-line transition-shadow duration-500 hover:shadow-lift sm:flex"
              data-reveal
            >
              <div className="aspect-[16/10] overflow-hidden">
                <Picture id={s.image as ImageId} compact rounded="rounded-none" className={FILL} sizes="(min-width:1024px) 33vw, 50vw" />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <Title className="text-xl font-semibold tracking-tight">{s.name}</Title>
                <p className="mt-2 flex-1 leading-relaxed text-muted">{s.short}</p>
                <span className={cn('mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue')}>
                  Mehr erfahren
                  <ArrowRight aria-hidden className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
