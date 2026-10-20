import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { TiltCard } from '@/components/ui/TiltCard'
import { Picture } from '@/components/ui/Picture'
import { ServiceIcon } from '@/components/ui/ServiceIcon'
import { services } from '@/content/services'
import { cn } from '@/lib/cn'

/** Interaktive Leistungskarten mit 3D-Tilt. Büroreinigung hervorgehoben. */
export function ServicesGrid({ heading = true }: { heading?: boolean }) {
  const Title = heading ? 'h3' : 'h2'
  return (
    <section className="relative bg-glacier py-24 sm:py-32" aria-labelledby={heading ? 'services-title' : undefined}>
      <div aria-hidden className="bg-grid absolute inset-0 opacity-50 [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)]" />
      <div className="container-site relative">
        {heading && (
          <div className="mb-14 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <SectionHeading eyebrow="Leistungen" title="Spezialisiert auf Büros. Und auf alles, was dazugehört." id="services-title" />
            <Link to="/leistungen" className="group inline-flex items-center gap-2 font-semibold text-blue" data-reveal>
              Alle Leistungen
              <ArrowUpRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        )}
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <li key={s.slug} className={cn(s.featured && 'sm:col-span-2 lg:row-span-2')} data-reveal>
              <TiltCard className="group rounded-card">
                <Link
                  to={`/leistungen/${s.slug}`}
                  className={cn(
                    'relative flex h-full flex-col overflow-hidden rounded-card p-6 ring-1 transition-shadow duration-500 hover:shadow-lift sm:p-8',
                    s.featured ? 'bg-ink text-white ring-white/10' : 'bg-white text-ink ring-line',
                  )}
                >
                  {s.featured && (
                    <>
                      <div aria-hidden className="bg-grid-dark absolute inset-0" />
                      <div aria-hidden className="absolute -top-24 -right-24 size-72 rounded-full bg-blue/40 blur-3xl" />
                    </>
                  )}
                  <div className="relative flex items-start justify-between gap-4">
                    <span className={cn('grid size-12 place-items-center rounded-2xl', s.featured ? 'bg-white/10 text-fresh' : 'bg-glacier text-blue')}>
                      <ServiceIcon icon={s.icon} className="size-6" />
                    </span>
                    {s.featured && <span className="rounded-full bg-fresh/15 px-3 py-1 text-xs font-semibold tracking-wide text-fresh">Kernleistung</span>}
                  </div>
                  <Title className={cn('relative mt-6 font-semibold tracking-tight', s.featured ? 'text-3xl sm:text-4xl' : 'text-xl sm:text-2xl')}>{s.name}</Title>
                  <p className={cn('relative mt-3 leading-relaxed', s.featured ? 'max-w-md text-lg text-muted-dark' : 'text-muted')}>{s.short}</p>
                  {s.featured && (
                    <div className="relative mt-8 flex-1">
                      <Picture id={s.image} tone="dark" ratio="16:9" className="w-full" sizes="(min-width:1024px) 60vw, 100vw" />
                    </div>
                  )}
                  <span className={cn('relative mt-6 inline-flex items-center gap-2 text-sm font-semibold', s.featured ? 'text-fresh' : 'text-blue')}>
                    Mehr erfahren
                    <ArrowUpRight aria-hidden className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </Link>
              </TiltCard>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
