import { Link, useParams } from 'react-router-dom'
import { ArrowUpRight, Clock, MapPin, Phone } from 'lucide-react'
import { getLocation, locations, shortName } from '@/content/locations'
import { officeCities } from '@/content/officeCities'
import { services, getService } from '@/content/services'
import { company } from '@/content/company'
import { Seo } from '@/components/ui/Seo'
import { PageHero } from '@/components/ui/PageHero'
import { Answer } from '@/components/ui/Answer'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Accordion } from '@/components/ui/Accordion'
import { ServiceIcon } from '@/components/ui/ServiceIcon'
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
  const short = shortName(l)
  const path = `/einzugsgebiet/${l.slug}`
  const trail = [
    { name: 'Start', path: '/' },
    { name: 'Einzugsgebiet', path: '/einzugsgebiet' },
    { name: short, path },
  ]
  const hq = l.minutes === 0
  const faqs = [
    {
      q: `Wie schnell sind Sie in ${short} vor Ort?`,
      a: hq
        ? 'Offenburg ist unser Sitz. Wir sind in der Regel innerhalb kurzer Zeit bei Ihnen. ' + l.route
        : `In ${short} sind wir in ungefähr ${l.minutes} Minuten vor Ort. ${l.route} Für die Besichtigung vereinbaren wir einen Termin, der Ihnen passt.`,
    },
    {
      q: `Welche Reinigungsleistungen sind in ${short} am meisten gefragt?`,
      a: `In ${short} fragen Unternehmen vor allem ${l.focus.map((f) => getService(f.service)!.name).join(', ').replace(/, ([^,]*)$/, ' und $1')} an. ${l.focus[0].why} Alle Leistungen bekommen Sie mit einem Ansprechpartner und einem Angebot.`,
    },
    {
      q: `Was kostet eine Büroreinigung in ${short}?`,
      a: `Eine Büroreinigung in ${short} kostet bei uns 35 bis 45 € brutto pro Mitarbeiterstunde, dieselben Sätze wie überall im Ortenaukreis. Wie viele Stunden Ihr Objekt braucht, klären wir bei einer kostenlosen Besichtigung. Das Angebot erhalten Sie innerhalb von 48 Stunden.`,
    },
    l.faq,
  ]
  const office = getService('bueroreinigung')!
  const nearby = l.nearby.map((s) => getLocation(s)).filter(Boolean)
  const city = officeCities.find((c) => c.slug === l.slug)

  return (
    <>
      <Seo
        title={fitTitle(city ? [`Reinigungsfirma ${short}: Büro & Gewerbe`, `Reinigungsfirma ${short}`] : [`Büroreinigung ${short}: Firma vor Ort`, `Büroreinigung ${short}: vor Ort`, `Büroreinigung ${short}`])}
        description={fitDescription([
          `Reinigungsfirma für ${short}${hq ? ' mit Sitz vor Ort' : ` (ca. ${l.minutes} Min. ab Offenburg)`}: Büroreinigung, Fenster, Treppenhaus und Halle. Fester Ansprechpartner, Angebot in 48 Stunden.`,
          `Reinigungsfirma für ${short} (ca. ${l.minutes} Min. ab Offenburg): Büroreinigung, Fenster und Halle. Fester Ansprechpartner, Angebot in 48 Stunden.`,
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
            <Button href={company.phone.href} variant="secondary" size="lg" icon={<Phone aria-hidden className="size-4 text-blue" />}>
              {company.phone.display}
            </Button>
          </>
        }
      >
        <div className="fade-up-now mt-4" style={{ ['--d' as string]: '0.65s' }}>
          <CallbackButton />
        </div>
        <ul className="fade-up-now mt-8 flex flex-wrap gap-3 text-sm" style={{ ['--d' as string]: '0.7s' }}>
          <li className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 ring-1 ring-line">
            <Clock aria-hidden className="size-4 text-blue" />
            {hq ? 'Unser Sitz' : `ca. ${l.minutes} Min. von Offenburg`}
          </li>
          <li className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 ring-1 ring-line">
            <MapPin aria-hidden className="size-4 text-blue" />
            Ortenaukreis
          </li>
        </ul>
      </PageHero>
      <Answer className="pt-12 sm:pt-16">{hq ? `CleanStar ist eine Reinigungsfirma mit Sitz in Offenburg und reinigt Büros, Praxen und Gewerbeflächen in der ganzen Stadt, mit festem Team und festem Ansprechpartner.` : `CleanStar ist eine Reinigungsfirma aus Offenburg und reinigt Büros, Praxen und Gewerbeflächen in ${short}, rund ${l.minutes} Minuten von unserem Sitz entfernt, mit festem Team und festem Ansprechpartner.`}</Answer>

      <section className="py-24 sm:py-32" aria-labelledby="loc-detail">
        <div className="container-site grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeading eyebrow={`Für Unternehmen in ${short}`} title="So arbeiten wir bei Ihnen." id="loc-detail" />
          </div>
          <div className="lg:col-span-7" data-reveal>
            <p className="text-lg leading-relaxed text-ink/85">{l.detail}</p>
            <h3 className="mt-10 text-lg font-semibold tracking-tight">Lage und Anfahrt</h3>
            <p className="mt-2 leading-relaxed text-ink/85">{l.route}</p>
            <h3 className="mt-8 text-lg font-semibold tracking-tight">Betriebe in {short}</h3>
            <p className="mt-2 leading-relaxed text-ink/85">{l.economy}</p>
            <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {['Fester Ansprechpartner', 'Festes, eingewiesenes Team', 'Ersatzkraft bei Ausfall', 'Kostenlose Nachreinigung'].map((t) => (
                <li key={t} className="flex items-center gap-3 rounded-2xl bg-glacier px-4 py-3 font-medium">
                  <span aria-hidden className="size-2 rounded-full bg-fresh" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="pb-24 sm:pb-32" aria-labelledby="loc-focus">
        <div className="container-site">
          <SectionHeading eyebrow={`Gefragt in ${short}`} title={`Was Unternehmen in ${short} bei uns buchen.`} id="loc-focus" />
          <ul className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
            {l.focus.map((f) => {
              const sv = getService(f.service)!
              return (
                <li key={f.service} data-reveal>
                  <Link
                    to={`/leistungen/${sv.slug}`}
                    className="group flex h-full flex-col rounded-card bg-white p-6 shadow-soft ring-1 ring-line transition hover:ring-blue/30 active:ring-blue"
                  >
                    <span className="grid size-11 place-items-center rounded-xl bg-glacier text-blue">
                      <ServiceIcon icon={sv.icon} className="size-5" />
                    </span>
                    <span className="mt-4 text-lg font-semibold tracking-tight">
                      {sv.name} in {short}
                    </span>
                    <span className="mt-2 flex-1 text-muted">{f.why}</span>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-blue">
                      Zur Leistung <ArrowUpRight aria-hidden className="size-4" />
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
          {city && (
            <p className="mt-8">
              <Link to={`/bueroreinigung/${city.slug}`} className="inline-flex items-center gap-2 font-semibold text-blue underline-offset-4 hover:underline">
                Alles zur Büroreinigung in {short}: Ablauf, Preise und Beispiele <ArrowUpRight aria-hidden className="size-4" />
              </Link>
            </p>
          )}
        </div>
      </section>

      <section className="bg-glacier py-24 sm:py-32" aria-labelledby="loc-services">
        <div className="container-site">
          <SectionHeading eyebrow="Leistungen" title={`Unsere Leistungen in ${short}.`} id="loc-services" />
          <ul className="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <li key={s.slug} data-reveal>
                <Link
                  to={`/leistungen/${s.slug}`}
                  className="group flex h-full items-start gap-4 rounded-card bg-white p-5 ring-1 ring-line transition hover:shadow-soft hover:ring-blue/30"
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-glacier text-blue">
                    <ServiceIcon icon={s.icon} className="size-5" />
                  </span>
                  <span className="flex-1">
                    <span className="block font-semibold">
                      {s.name} {short}
                    </span>
                    <span className="mt-1 block text-sm text-muted">{s.short}</span>
                  </span>
                  <ArrowUpRight aria-hidden className="size-4 text-muted transition group-hover:text-blue" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-24 sm:py-32" aria-labelledby="loc-faq">
        <div className="container-site grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionHeading eyebrow="Fragen" title={`Reinigung in ${short}: kurz beantwortet.`} id="loc-faq" />
          </div>
          <div className="lg:col-span-8" data-reveal>
            <Accordion items={faqs.map((f) => ({ title: f.q, content: f.a }))} />
          </div>
        </div>
      </section>

      {nearby.length > 0 && (
        <section className="pb-24 sm:pb-32" aria-labelledby="loc-near">
          <div className="container-site">
            <h2 id="loc-near" className="text-xl font-semibold tracking-tight">
              Auch in der Nähe
            </h2>
            <ul className="mt-6 flex flex-wrap gap-2.5">
              {nearby.map((n) => (
                <li key={n!.slug}>
                  <Link
                    to={`/einzugsgebiet/${n!.slug}`}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-medium ring-1 ring-line transition hover:ring-blue/40"
                  >
                    Reinigungsfirma {shortName(n!)}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/einzugsgebiet" className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-blue">
                  Alle {locations.length} Orte
                </Link>
              </li>
            </ul>
          </div>
        </section>
      )}
      <FinalCta headline={`Ihr Büro in ${short}. Sauber, ohne dass Sie sich kümmern müssen.`} />
    </>
  )
}
