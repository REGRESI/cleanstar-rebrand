import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Picture } from '@/components/ui/Picture'
import { Button } from '@/components/ui/Button'
import { services } from '@/content/services'
import { home } from '@/content/site'
import { cn } from '@/lib/cn'

const featuredAreas = ['Arbeitsplätze und Besprechung', 'Teeküche und Sanitär', 'Böden und Papierkörbe']

/**
 * Leistungen als editoriale Liste.
 * Büroreinigung als großer Abschnitt mit randlosem Foto, die übrigen Leistungen als Zeilen mit Nummer,
 * großem Titel und Kurztext. Desktop: Beim Überfahren einer Zeile erscheint das passende Foto an fester Position.
 */
export function ServicesGrid({ heading = true, index }: { heading?: boolean; index?: string }) {
  const Title = heading ? 'h3' : 'h2'
  const featured = services.find((s) => s.featured) ?? services[0]
  const rest = services.filter((s) => s !== featured)
  const [active, setActive] = useState(0)

  return (
    <section className="section" aria-labelledby={heading ? 'services-title' : undefined} aria-label={heading ? undefined : 'Leistungen'}>
      <div className="container-site">
        {heading && <SectionHeading layout="rail" index={index} eyebrow={home.services.eyebrow} title={home.services.headline} text={home.services.lead} id="services-title" />}

        {/* Kernleistung: großer Abschnitt mit randlosem Foto */}
        <div className={cn('grid-site gap-y-8', heading && 'mt-16 lg:mt-24')}>
          <Link to={`/leistungen/${featured.slug}`} className="group col-span-12 block" aria-label={`${featured.name}: Leistungsverzeichnis ansehen`}>
            <Picture
              id={featured.image}
              reveal
              aspect="aspect-[4/5] sm:aspect-[3/2] lg:aspect-[21/9]"
              sizes="(min-width:1600px) 1472px, 100vw"
              caption="01 / Unsere Kernleistung"
              className="[&_img]:transition-transform [&_img]:duration-[1200ms] [&_img]:ease-cs group-hover:[&_img]:scale-[1.02]"
            />
          </Link>
          <div className="col-span-12 lg:col-span-6">
            <Title className="t-h2">
              <Link to={`/leistungen/${featured.slug}`} className="ulink">
                {featured.name}
              </Link>
            </Title>
          </div>
          <div className="col-span-12 lg:col-span-5 lg:col-start-8" data-reveal>
            <p className="t-lead text-ink">{featured.short}</p>
            <ul className="mt-8 border-t border-line">
              {featuredAreas.map((t) => (
                <li key={t} className="border-b border-line py-3 text-ink-2">
                  {t}
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <Button to={`/leistungen/${featured.slug}`} variant="link">
                Leistungsverzeichnis ansehen
              </Button>
            </div>
          </div>
        </div>

        {/* Weitere Leistungen als Zeilen; Foto erscheint beim Überfahren (Desktop) */}
        <div className="grid-site mt-24 lg:mt-36">
          <ol className="col-span-12 border-b border-line lg:col-span-7" aria-label="Weitere Leistungen">
            {rest.map((s, i) => (
              <li key={s.slug} className="relative">
                <span aria-hidden data-reveal-rule className="rule absolute inset-x-0 top-0" />
                <Link
                  to={`/leistungen/${s.slug}`}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  className="group grid grid-cols-[2.75rem_1fr_auto] items-baseline gap-x-4 py-7 sm:grid-cols-[4rem_1fr_auto] sm:py-9"
                  data-reveal
                >
                  <span className="t-label">{String(i + 2).padStart(2, '0')}</span>
                  <span className="min-w-0">
                    <Title
                      className={cn('t-h3 max-[400px]:text-[1.125rem] transition-colors duration-300', active === i ? 'lg:text-ink' : 'lg:text-ink/55', 'group-hover:text-ink')}
                    >
                      {s.name}
                    </Title>
                    <span className="mt-2 block max-w-[46ch] text-ink-2">{s.short}</span>
                  </span>
                  <ArrowUpRight
                    aria-hidden
                    className="size-5 self-center text-ink transition-transform duration-500 ease-cs group-hover:translate-x-1 group-hover:-translate-y-1"
                    strokeWidth={1.5}
                  />
                </Link>
              </li>
            ))}
          </ol>
          <div className="hidden lg:col-span-4 lg:col-start-9 lg:block">
            <div className="sticky top-28">
              <div className="relative aspect-[4/5] overflow-hidden bg-surface">
                {rest.map((s, i) => (
                  <div key={s.slug} aria-hidden className={cn('absolute inset-0 transition-opacity duration-700 ease-cs', active === i ? 'opacity-100' : 'opacity-0')}>
                    <Picture id={s.image} compact aspect="h-full w-full" sizes="33vw" />
                  </div>
                ))}
              </div>
              <p className="caption">{rest[active]?.name}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
