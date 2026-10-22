import { Link, useParams } from 'react-router-dom'
import { ArrowUpRight, Calculator, Check, MapPin, Phone } from 'lucide-react'
import { getOfficeCity } from '@/content/officeCities'
import { getLocation, shortName } from '@/content/locations'
import { getService } from '@/content/services'
import { company } from '@/content/company'
import { monthlyRange, pricing } from '@/content/pricing'
import { formatNumber, formatEuroRange } from '@/lib/format'
import { Seo } from '@/components/ui/Seo'
import { PageHero } from '@/components/ui/PageHero'
import { Answer } from '@/components/ui/Answer'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Accordion } from '@/components/ui/Accordion'
import { Button } from '@/components/ui/Button'
import { FinalCta } from '@/components/home/FinalCta'
import { ContactPerson } from '@/components/ui/ContactPerson'
import { QuoteButton } from '@/features/configurator/QuoteLink'
import { CallbackButton } from '@/features/callback/Callback'
import { breadcrumbSchema, faqSchema, serviceSchema } from '@/lib/schema'
import NotFound from './NotFound'

/** Kombiseite „Büroreinigung [Ort]“ für die fünf größten Orte */
export default function OfficeCity() {
  const { ort = '' } = useParams()
  const c = getOfficeCity(ort)
  const loc = getLocation(ort)
  if (!c || !loc) return <NotFound />
  const path = `/bueroreinigung/${c.slug}`
  const trail = [
    { name: 'Startseite', path: '/' },
    { name: 'Büroreinigung', path: '/leistungen/bueroreinigung' },
    { name: c.name, path },
  ]
  const office = getService('bueroreinigung')!
  const ex = monthlyRange(c.example.staff, c.example.hours, c.example.visits)
  const nearby = loc.nearby.map((s) => getLocation(s)).filter((l) => !!l)

  return (
    <>
      <Seo
        title={c.seoTitle}
        description={c.seoDescription}
        path={path}
        ogType="standort"
        schema={[serviceSchema(office, path, c.name), breadcrumbSchema(trail), faqSchema(c.faqs)]}
      />
      <PageHero
        trail={trail}
        eyebrow={`Büroreinigung · ${c.name}`}
        title={`Büroreinigung in ${c.name}.`}
        lead={c.intro}
        actions={
          <>
            <QuoteButton size="lg" arrow />
            <Button href={company.phone.href} variant="secondary" size="lg" icon={<Phone aria-hidden className="size-4 text-blue" />}>
              {company.phone.display}
            </Button>
          </>
        }
      >
        <div className="fade-up-now mt-5" style={{ ['--d' as string]: '0.65s' }}>
          <CallbackButton />
        </div>
      </PageHero>

      <Answer className="pt-14 sm:pt-20">{c.answer}</Answer>

      <section className="py-16 sm:py-24" aria-label={`Büroreinigung in ${c.name} im Detail`}>
        <div className="container-site grid grid-cols-1 gap-14 lg:grid-cols-12">
          <div className="space-y-12 lg:col-span-7">
            {c.sections.map((s) => (
              <article key={s.title} data-reveal>
                <h2 className="heading-3">{s.title}</h2>
                {s.paragraphs.map((p) => (
                  <p key={p.slice(0, 24)} className="mt-4 text-lg leading-relaxed text-ink/85">
                    {p}
                  </p>
                ))}
                {s.list && (
                  <ul className="mt-5 space-y-3">
                    {s.list.map((i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check aria-hidden className="mt-1 size-4 shrink-0 text-fresh-ink" strokeWidth={3} />
                        <span>{i}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
          </div>
          <aside className="space-y-6 lg:col-span-5">
            <div className="rounded-panel bg-ink p-6 text-white sm:p-8" data-reveal>
              <p className="flex items-center gap-2 text-sm font-semibold text-white/70">
                <Calculator aria-hidden className="size-4" />
                Beispielrechnung {c.name}
              </p>
              <p className="mt-3 text-lg font-semibold">{c.example.label}</p>
              <p className="mt-1 text-sm text-white/70">Annahme: {c.example.note}.</p>
              <p className="mt-6 text-2xl font-semibold tracking-tight whitespace-nowrap tabular-nums min-[360px]:text-3xl">{formatEuroRange(ex.grossMin, ex.grossMax)}</p>
              <p className="mt-1 text-sm text-white/70">
                pro Monat brutto, bei rund {formatNumber(Math.round(ex.hours))} Stunden ({pricing.hourlyRateGrossMin} bis {pricing.hourlyRateGrossMax} € brutto pro Stunde). Netto{' '}
                {formatEuroRange(ex.netMin, ex.netMax)}.
              </p>
              <p className="mt-4 text-xs leading-relaxed text-white/60">
                Unverbindliches Rechenbeispiel. Ihren tatsächlichen Stundenbedarf ermitteln wir bei der kostenlosen Besichtigung.
              </p>
              <Link to="/ratgeber/bueroreinigung-kosten" className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-fresh hover:underline">
                Wie sich die Kosten zusammensetzen <ArrowUpRight aria-hidden className="size-4" />
              </Link>
            </div>
            <ContactPerson />
          </aside>
        </div>
      </section>

      <section className="bg-glacier py-24 sm:py-32" aria-labelledby="oc-faq">
        <div className="container-site grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionHeading eyebrow="Fragen" title={`Büroreinigung ${c.name}: Ihre Fragen.`} id="oc-faq" />
          </div>
          <div className="lg:col-span-8" data-reveal>
            <Accordion items={c.faqs.map((f) => ({ title: f.q, content: f.a }))} />
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24" aria-labelledby="oc-more">
        <div className="container-site">
          <h2 id="oc-more" className="text-xl font-semibold tracking-tight">
            Mehr zu {c.name} und Umgebung
          </h2>
          <ul className="mt-6 flex flex-wrap gap-2.5">
            <li>
              <Link
                to={`/einzugsgebiet/${loc.slug}`}
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-medium ring-1 ring-line transition hover:ring-blue/40 active:bg-blue-soft"
              >
                <MapPin aria-hidden className="size-4 text-blue" />
                Alle Leistungen in {c.name}
              </Link>
            </li>
            <li>
              <Link
                to="/leistungen/bueroreinigung"
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-medium ring-1 ring-line transition hover:ring-blue/40 active:bg-blue-soft"
              >
                Leistungsverzeichnis Büroreinigung
              </Link>
            </li>
            {nearby.map((n) => (
              <li key={n.slug}>
                <Link
                  to={`/einzugsgebiet/${n.slug}`}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-medium ring-1 ring-line transition hover:ring-blue/40 active:bg-blue-soft"
                >
                  Reinigungsfirma {shortName(n)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <FinalCta headline={`Büroreinigung in ${c.name}: Lernen wir uns kennen.`} />
    </>
  )
}
