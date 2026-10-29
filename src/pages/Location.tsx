import { Link, Navigate, useParams } from 'react-router-dom'
import { getLocation, locations, shortName } from '@/content/locations'
import { locationExtra } from '@/content/locationsExtra'
import { pricing } from '@/content/pricing'
import { officeCities } from '@/content/officeCities'
import { services, getService } from '@/content/services'
import { company } from '@/content/company'
import { Seo } from '@/components/ui/Seo'
import { PageHero } from '@/components/ui/PageHero'
import { Answer } from '@/components/ui/Answer'
import { ImageBand } from '@/components/ui/ImageBand'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { FaqBlock } from '@/components/ui/FaqBlock'
import { DotList, LinkRows, NumberedRows } from '@/components/ui/Editorial'
import { RevealText } from '@/components/ui/RevealText'
import { FinalCta } from '@/components/home/FinalCta'
import { QuoteButton } from '@/features/configurator/QuoteLink'
import { Button } from '@/components/ui/Button'
import { breadcrumbSchema, faqSchema, serviceSchema } from '@/lib/schema'
import { fitDescription, fitTitle } from '@/components/ui/Seo'
import NotFound from './NotFound'
import { CallbackButton } from '@/features/callback/Callback'

export default function Location() {
  const { ort = '' } = useParams()
  const l = getLocation(ort)
  if (!l) return <NotFound />
  // Orte ohne eigene Seite stehen gesammelt auf der Einzugsgebiet-Seite (alte Adressen leiten dorthin weiter)
  if (!l.page) return <Navigate to={`/einzugsgebiet#ort-${l.slug}`} replace />
  const short = shortName(l)
  const path = `/einzugsgebiet/${l.slug}`
  const trail = [
    { name: 'Startseite', path: '/' },
    { name: 'Einzugsgebiet', path: '/einzugsgebiet' },
    { name: short, path },
  ]
  const hq = l.minutes === 0
  // Drei eigene Fragen je Ort (keine Vorlagen mit ausgetauschtem Ortsnamen)
  const extra = locationExtra[l.slug]
  const faqs = [l.faq, ...(extra?.faqs ?? [])]
  const office = getService('bueroreinigung')!
  const nearby = l.nearby.map((s) => getLocation(s)).filter((n) => n?.page)
  const city = officeCities.find((c) => c.slug === l.slug)

  return (
    <>
      <Seo
        title={fitTitle(
          city
            ? [`Reinigungsfirma ${short}: Büro & Gewerbe`, `Reinigungsfirma ${short}`]
            : [`Büroreinigung ${short}: Firma vor Ort`, `Büroreinigung ${short}: vor Ort`, `Büroreinigung ${short}`],
        )}
        description={fitDescription([
          `Reinigungsfirma für ${short}${hq ? ' mit Sitz vor Ort' : ` (ca. ${l.minutes} Min. ab Offenburg)`}: Büroreinigung, Fenster, Treppenhaus und Halle. Fester Ansprechpartner, Angebot in 48 Stunden.`,
          `Reinigungsfirma für ${short} (ca. ${l.minutes} Min. ab Offenburg): Büroreinigung, Fenster und Halle. Fester Ansprechpartner, Angebot in 48 Stunden.`,
        ])}
        ogType="standort"
        path={path}
        schema={[serviceSchema(office, path, short), breadcrumbSchema(trail), faqSchema(faqs)]}
      />
      <PageHero
        trail={trail}
        eyebrow={`Einzugsgebiet · ${short}`}
        title={city ? `Ihre Reinigungsfirma für ${short}.` : `Büroreinigung in ${short}.`}
        lead={l.intro}
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
        <p className="t-meta fade-up-now mt-10 border-t border-line pt-4" style={{ ['--d' as string]: '0.7s' }}>
          {hq ? 'Unser Sitz' : `ca.\u00A0${l.minutes}\u00A0Min. von Offenburg`} · {company.serviceArea}
        </p>
      </PageHero>

      <section className="section" aria-labelledby="loc-detail">
        <div className="container-site grid-site gap-y-10">
          <span aria-hidden data-reveal-rule className="rule col-span-12 mb-4" />
          <div className="col-span-12 lg:col-span-4">
            <p className="t-label mb-6">Für Unternehmen in {short}</p>
            <RevealText as="h2" text="So arbeiten wir bei Ihnen." id="loc-detail" className="t-h3" />
          </div>
          <div className="col-span-12 lg:col-span-7 lg:col-start-6" data-reveal>
            <p className="t-lead">{l.detail}</p>
            <div className="mt-12 grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2">
              <div className="border-t border-line pt-5">
                <h3 className="t-label">Lage und Anfahrt</h3>
                <p className="mt-3 text-ink-2">{l.route}</p>
              </div>
              <div className="border-t border-line pt-5">
                <h3 className="t-label">Betriebe in {short}</h3>
                <p className="mt-3 text-ink-2">{l.economy}</p>
              </div>
            </div>
            {extra && (
              <div className="mt-8 border-t border-line pt-5">
                <h3 className="t-label">{short} in Kürze</h3>
                <p className="mt-3 text-ink-2">{extra.character}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <ImageBand id="region" />

      <section className="on-dark section bg-night text-paper" aria-labelledby="loc-focus">
        <div className="container-site">
          <SectionHeading layout="rail" eyebrow={`Gefragt in ${short}`} title={`Was Unternehmen in ${short} bei uns buchen.`} id="loc-focus" />
          <NumberedRows
            dark
            className="mt-14 lg:mt-20"
            items={l.focus.map((f) => {
              const sv = getService(f.service)!
              return {
                key: f.service,
                title: (
                  <Link to={`/leistungen/${sv.slug}`} className="ulink">
                    {sv.name} in {short}
                  </Link>
                ),
                text: f.why,
              }
            })}
          />
          {city && (
            <p className="mt-10">
              <Button to={`/bueroreinigung/${city.slug}`} variant="link">
                Alles zur Büroreinigung in {short}: Ablauf, Preise und Beispiele
              </Button>
            </p>
          )}
        </div>
      </section>

      <section className="section" aria-labelledby="loc-services">
        <div className="container-site grid-site gap-y-10">
          <div className="col-span-12 lg:col-span-4">
            <p className="t-label mb-6">Leistungen</p>
            <RevealText as="h2" text={`Unsere Leistungen in ${short}.`} id="loc-services" className="t-h3" />
          </div>
          <div className="col-span-12 lg:col-span-8">
            <LinkRows items={services.map((s) => ({ to: `/leistungen/${s.slug}`, label: `${s.name} ${short}` }))} numbered />
          </div>
        </div>
      </section>

      <FaqBlock className="section bg-surface" title={`Reinigung in ${short}: kurz beantwortet.`} id="loc-faq" items={faqs.map((f) => ({ title: f.q, content: f.a }))} />

      {nearby.length > 0 && (
        <nav className="container-site pt-20 pb-12 sm:pt-28 lg:pt-36 lg:pb-14" aria-labelledby="loc-near">
          <div className="grid-site gap-y-5 border-t border-line pt-6">
            <h2 id="loc-near" className="t-label col-span-12 lg:col-span-4">
              Auch in der Nähe
            </h2>
            <DotList
              className="col-span-12 lg:col-span-8"
              items={nearby
                .map((n) => ({ to: `/einzugsgebiet/${n!.slug}`, label: `Reinigungsfirma ${shortName(n!)}` }))
                .concat([{ to: '/einzugsgebiet', label: `Alle ${locations.length} Orte` }])}
            />
          </div>
        </nav>
      )}
      <Answer
        className={nearby.length > 0 ? undefined : 'pt-20 sm:pt-28 lg:pt-36'}
        facts={[
          ['Ort', `${l.name}, ${company.serviceArea}`],
          ['Fahrzeit', hq ? 'Unser Sitz' : `ca. ${l.minutes} Minuten ab Offenburg`],
          ['Gefragt', l.focus.map((f) => getService(f.service)!.name).join(', ')],
          ['Stundensatz', `${pricing.hourlyRateGrossMin} bis ${pricing.hourlyRateGrossMax} € brutto je Mitarbeiterstunde`],
          ['Erreichbarkeit', 'Rund um die Uhr, Antwort innerhalb von 24 Stunden'],
        ]}
      >
        {hq
          ? `CleanStar ist eine Reinigungsfirma mit Sitz in Offenburg und reinigt Büros, Praxen und Gewerbeflächen in der ganzen Stadt, mit festem Team und festem Ansprechpartner.`
          : `CleanStar ist eine Reinigungsfirma aus Offenburg und reinigt Büros, Praxen und Gewerbeflächen in ${short}, rund ${l.minutes} Minuten von unserem Sitz entfernt, mit festem Team und festem Ansprechpartner.`}
      </Answer>
      <FinalCta headline={`Ihr Büro in ${short}. Sauber, ohne dass Sie sich kümmern müssen.`} />
    </>
  )
}
