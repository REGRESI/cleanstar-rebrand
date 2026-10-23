import { useParams } from 'react-router-dom'
import { getOfficeCity } from '@/content/officeCities'
import { getLocation, shortName } from '@/content/locations'
import { getService } from '@/content/services'
import { company } from '@/content/company'
import { monthlyRange, pricing } from '@/content/pricing'
import { formatNumber, formatEuroRange } from '@/lib/format'
import { Seo } from '@/components/ui/Seo'
import { PageHero } from '@/components/ui/PageHero'
import { Answer } from '@/components/ui/Answer'
import { FaqBlock } from '@/components/ui/FaqBlock'
import { InlineLinks } from '@/components/ui/Editorial'
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
            <Button href={company.phone.href} variant="link">
              {company.phone.display}
            </Button>
          </>
        }
      >
        <div className="fade-up-now mt-5" style={{ ['--d' as string]: '0.65s' }}>
          <CallbackButton />
        </div>
      </PageHero>

      <Answer className="pt-4">{c.answer}</Answer>

      <section className="section" aria-label={`Büroreinigung in ${c.name} im Detail`}>
        <div className="container-site grid-site gap-y-16">
          <div className="col-span-12 space-y-16 lg:col-span-7">
            {c.sections.map((s, i) => (
              <article key={s.title} className="border-t border-line pt-6" data-reveal>
                <p className="t-label">{String(i + 1).padStart(2, '0')}</p>
                <h2 className="t-h3 mt-5">{s.title}</h2>
                {s.paragraphs.map((p) => (
                  <p key={p.slice(0, 24)} className="measure mt-5 text-ink-2">
                    {p}
                  </p>
                ))}
                {s.list && (
                  <ul className="mt-6 border-t border-line">
                    {s.list.map((i) => (
                      <li key={i} className="border-b border-line py-3">
                        {i}
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
          </div>
          <aside className="col-span-12 space-y-16 lg:col-span-4 lg:col-start-9">
            <div className="lg:sticky lg:top-28" data-reveal>
              <div className="on-dark bg-night p-6 text-paper sm:p-8">
                <p className="t-label">Beispielrechnung {c.name}</p>
                <p className="mt-4 text-[1.25rem] font-medium tracking-[-0.015em]">{c.example.label}</p>
                <p className="mt-1 text-[0.9375rem] text-muted-dark">Annahme: {c.example.note}.</p>
                <p className="mt-8 text-[clamp(1.875rem,1.5rem+1.4vw,2.75rem)] leading-none font-medium tracking-[-0.04em] whitespace-nowrap tabular-nums">
                  {formatEuroRange(ex.grossMin, ex.grossMax)}
                </p>
                <p className="mt-3 text-[0.9375rem] text-muted-dark">
                  pro Monat brutto, bei rund {formatNumber(Math.round(ex.hours))} Stunden ({pricing.hourlyRateGrossMin} bis {pricing.hourlyRateGrossMax} € brutto pro Stunde). Netto{' '}
                  {formatEuroRange(ex.netMin, ex.netMax)}.
                </p>
                <p className="mt-5 font-mono text-[0.75rem] leading-relaxed text-muted-dark">
                  Unverbindliches Rechenbeispiel. Ihren tatsächlichen Stundenbedarf ermitteln wir bei der kostenlosen Besichtigung.
                </p>
                <div className="mt-6">
                  <Button to="/ratgeber/bueroreinigung-kosten" variant="link" className="text-paper">
                    Wie sich die Kosten zusammensetzen
                  </Button>
                </div>
              </div>
              <ContactPerson className="mt-12" />
            </div>
          </aside>
        </div>
      </section>

      <FaqBlock className="section pt-0!" title={`Büroreinigung ${c.name}: Ihre Fragen.`} id="oc-faq" items={c.faqs.map((f) => ({ title: f.q, content: f.a }))} />

      <nav className="container-site pb-24 lg:pb-36" aria-labelledby="oc-more">
        <div className="grid-site gap-y-5 border-t border-line pt-6">
          <h2 id="oc-more" className="t-label col-span-12 lg:col-span-4">
            Mehr zu {c.name} und Umgebung
          </h2>
          <InlineLinks
            className="col-span-12 lg:col-span-8"
            items={[
              { to: `/einzugsgebiet/${loc.slug}`, label: `Alle Leistungen in ${c.name}` },
              { to: '/leistungen/bueroreinigung', label: 'Leistungsverzeichnis Büroreinigung' },
              ...nearby.map((n) => ({ to: `/einzugsgebiet/${n.slug}`, label: `Reinigungsfirma ${shortName(n)}` })),
            ]}
          />
        </div>
      </nav>
      <FinalCta headline={`Büroreinigung in ${c.name}: Lernen wir uns kennen.`} />
    </>
  )
}
