import { Link, useParams } from 'react-router-dom'
import { ArrowUpRight, Clock, MapPin, Phone } from 'lucide-react'
import { getLocation, locations } from '@/content/locations'
import { services, getService } from '@/content/services'
import { company } from '@/content/company'
import { Seo } from '@/components/ui/Seo'
import { PageHero } from '@/components/ui/PageHero'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Accordion } from '@/components/ui/Accordion'
import { ServiceIcon } from '@/components/ui/ServiceIcon'
import { FinalCta } from '@/components/home/FinalCta'
import { QuoteButton } from '@/features/configurator/QuoteLink'
import { Button } from '@/components/ui/Button'
import { breadcrumbSchema, faqSchema, serviceSchema } from '@/lib/schema'
import NotFound from './NotFound'

export default function Location() {
  const { ort = '' } = useParams()
  const l = getLocation(ort)
  if (!l) return <NotFound />
  const short = l.name.replace(' im Kinzigtal', '')
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
        ? 'Offenburg ist unser Sitz. Wir sind in der Regel innerhalb kurzer Zeit bei Ihnen.'
        : `Die Fahrzeit von Offenburg nach ${short} beträgt ungefähr ${l.minutes} Minuten. Für die Besichtigung vereinbaren wir einen Termin, der Ihnen passt.`,
    },
    {
      q: `Was kostet eine Büroreinigung in ${short}?`,
      a: `Für ${short} gelten dieselben Stundensätze wie überall im Ortenaukreis: 35 bis 45 € brutto pro Mitarbeiterstunde. Wie viele Stunden Ihr Objekt braucht, klären wir bei einer kostenlosen Besichtigung. Das Angebot erhalten Sie innerhalb von 48 Stunden.`,
    },
    {
      q: `Wer ist mein Ansprechpartner in ${short}?`,
      a: `Sie bekommen einen festen Ansprechpartner mit direkter Telefonnummer, der Ihr Objekt in ${short} kennt. Keine Hotline, kein Ticketsystem.`,
    },
  ]
  const office = getService('bueroreinigung')!
  const nearby = l.nearby.map((s) => getLocation(s)).filter(Boolean)

  return (
    <>
      <Seo
        title={`Büroreinigung ${short}: Reinigungsfirma für Unternehmen`}
        description={`Büroreinigung in ${short} vom Reinigungsbetrieb aus Offenburg${hq ? '' : ` (ca. ${l.minutes} Min. entfernt)`}. Fester Ansprechpartner, Ersatzkraft bei Ausfall, Qualitätsgarantie. Kostenlose Besichtigung, Angebot in 48 Stunden.`}
        path={path}
        schema={[serviceSchema(office, path, short), breadcrumbSchema(trail), faqSchema(faqs)]}
      />
      <PageHero
        trail={trail}
        eyebrow={`Einzugsgebiet · ${short}`}
        title={`Büroreinigung in ${short}.`}
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
        <ul className="fade-up-now mt-10 flex flex-wrap gap-3 text-sm" style={{ ['--d' as string]: '0.7s' }}>
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

      <section className="py-24 sm:py-32" aria-labelledby="loc-detail">
        <div className="container-site grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeading eyebrow={`Für Unternehmen in ${short}`} title="So arbeiten wir bei Ihnen." id="loc-detail" />
          </div>
          <div className="lg:col-span-7" data-reveal>
            <p className="text-lg leading-relaxed text-ink/85">{l.detail}</p>
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
            <SectionHeading eyebrow="Fragen" title={`Büroreinigung ${short}: kurz beantwortet.`} id="loc-faq" />
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
                    Büroreinigung {n!.name.replace(' im Kinzigtal', '')}
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
