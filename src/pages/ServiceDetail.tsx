import { Link, useParams } from 'react-router-dom'
import { ArrowUpRight, Check, CalendarClock, Users2 } from 'lucide-react'
import { getService, services } from '@/content/services'
import { home } from '@/content/site'
import { Seo } from '@/components/ui/Seo'
import { PageHero } from '@/components/ui/PageHero'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Accordion } from '@/components/ui/Accordion'
import { Picture } from '@/components/ui/Picture'
import { Button } from '@/components/ui/Button'
import { ServiceIcon } from '@/components/ui/ServiceIcon'
import { QuoteButton } from '@/features/configurator/QuoteLink'
import { FinalCta } from '@/components/home/FinalCta'
import { BeforeAfter } from '@/features/slider/BeforeAfter'
import { CostCalculator } from '@/features/cost/CostCalculator'
import { PerEmployeeCalculator } from '@/features/cost/PerEmployeeCalculator'
import { FloorPlan } from '@/features/floorplan/FloorPlan'
import { LeadMagnet } from '@/features/forms/LeadMagnet'
import { breadcrumbSchema, faqSchema, serviceSchema } from '@/lib/schema'
import NotFound from './NotFound'

export default function ServiceDetail() {
  const { slug = '' } = useParams()
  const s = getService(slug)
  if (!s) return <NotFound />
  const path = `/leistungen/${s.slug}`
  const trail = [
    { name: 'Start', path: '/' },
    { name: 'Leistungen', path: '/leistungen' },
    { name: s.name, path },
  ]
  const main = s.slug === 'bueroreinigung'

  return (
    <>
      <Seo title={s.seoTitle} description={s.seoDescription} path={path} schema={[serviceSchema(s, path), breadcrumbSchema(trail), faqSchema(s.faqs)]} />
      <PageHero
        trail={trail}
        eyebrow={s.name}
        title={s.headline}
        lead={s.intro}
        image={s.image}
        actions={
          <>
            <QuoteButton size="lg" arrow />
            <Button to="/kontakt#besichtigung" variant="secondary" size="lg">
              Besichtigung buchen
            </Button>
          </>
        }
      />

      {/* Highlights */}
      <section className="py-20 sm:py-28" aria-label="Das zeichnet uns aus">
        <div className="container-site">
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {s.highlights.map((h) => (
              <li key={h.title} className="rounded-card bg-white p-6 ring-1 ring-line" data-reveal>
                <span aria-hidden className="grid size-10 place-items-center rounded-xl bg-glacier text-blue">
                  <Check className="size-5" strokeWidth={2.5} />
                </span>
                <h2 className="mt-5 text-lg font-semibold tracking-tight">{h.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted">{h.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Leistungsverzeichnis */}
      <section className="bg-glacier py-24 sm:py-32" aria-labelledby="scope-title">
        <div className="container-site grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeading
              eyebrow="Leistungsverzeichnis"
              title="Was genau enthalten ist."
              id="scope-title"
              text="Das ist unser Standard. Im Angebot passen wir das Verzeichnis an Ihr Objekt an. Was drinsteht, wird gemacht. Was nicht drinsteht, besprechen wir vorher."
            />
            {main && (
              <div className="mt-8 hidden lg:block" data-reveal>
                <Picture id="svc-buero-detail" sizes="40vw" />
              </div>
            )}
          </div>
          <div className="lg:col-span-7" data-reveal>
            <Accordion
              defaultOpen={0}
              items={s.scope.map((g) => ({
                title: (
                  <span className="flex items-baseline gap-3">
                    {g.title}
                    <span className="text-sm font-normal text-muted">{g.items.length} Punkte</span>
                  </span>
                ),
                content: (
                  <ul className="space-y-2.5">
                    {g.items.map((it) => (
                      <li key={it} className="flex items-start gap-3">
                        <Check aria-hidden className="mt-1 size-4 shrink-0 text-fresh-ink" strokeWidth={3} />
                        <span className="text-ink/85">{it}</span>
                      </li>
                    ))}
                  </ul>
                ),
              }))}
            />
          </div>
        </div>
      </section>

      {/* Intervalle + Zielgruppe */}
      <section className="py-24 sm:py-32" aria-label="Intervalle und Zielgruppen">
        <div className="container-site grid grid-cols-1 gap-14 lg:grid-cols-2">
          <div>
            <h2 className="flex items-center gap-3 text-2xl font-semibold tracking-tight sm:text-3xl" data-reveal>
              <CalendarClock aria-hidden className="size-7 text-blue" />
              Intervalle
            </h2>
            <ul className="mt-8 space-y-4">
              {s.intervals.map((i) => (
                <li key={i.label} className="grid gap-1 border-l-2 border-blue pl-5" data-reveal>
                  <span className="font-semibold">{i.label}</span>
                  <span className="text-muted">{i.text}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="flex items-center gap-3 text-2xl font-semibold tracking-tight sm:text-3xl" data-reveal>
              <Users2 aria-hidden className="size-7 text-blue" />
              Für wen geeignet
            </h2>
            <ul className="mt-8 flex flex-wrap gap-2.5">
              {s.suitableFor.map((t) => (
                <li key={t} className="rounded-full bg-glacier px-4 py-2.5 text-sm font-medium text-ink" data-reveal>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {main && (
        <>
          <section className="bg-glacier py-24 sm:py-32" aria-labelledby="plan-title">
            <div className="container-site">
              <SectionHeading
                eyebrow="Raum für Raum"
                title="Was wird bei Ihnen gereinigt?"
                id="plan-title"
                text="Tippen Sie auf einen Bereich. Sie sehen, was dort gemacht wird und wie oft. Ohne Kleingedrucktes."
              />
              <div className="mt-12" data-reveal>
                <FloorPlan />
              </div>
            </div>
          </section>
          <section className="py-24 sm:py-32" aria-labelledby="pe-title">
            <div className="container-site">
              <SectionHeading
                eyebrow="Kosten greifbar machen"
                title="Was kostet das pro Mitarbeiter?"
                id="pe-title"
                text="Ein Monatsbetrag sagt wenig. Umgerechnet auf Ihre Mitarbeiter und Arbeitstage sehen Sie, was ein sauberes Büro pro Kopf wirklich kostet."
              />
              <div className="mt-12" data-reveal>
                <PerEmployeeCalculator />
              </div>
            </div>
          </section>
          <section className="bg-glacier py-24 sm:py-32" aria-labelledby="cost-title">
            <div className="container-site">
              <SectionHeading
                eyebrow="Kostenvergleich"
                title="Eigenes Personal oder CleanStar? Rechnen Sie ehrlich nach."
                id="cost-title"
                text="Eigene Reinigungskräfte kosten mehr als den Stundenlohn. Der Rechner zeigt alle Posten offen. Und wenn eigenes Personal für Sie günstiger ist, sagt er Ihnen das auch."
              />
              <div className="mt-12" data-reveal>
                <CostCalculator />
              </div>
            </div>
          </section>
          <section className="py-24 sm:py-32" aria-labelledby="ba2-title">
            <div className="container-site grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-4">
                <SectionHeading eyebrow={home.beforeAfter.eyebrow} title={home.beforeAfter.headline} id="ba2-title" text={home.beforeAfter.lead} />
              </div>
              <div className="lg:col-span-8" data-reveal>
                <BeforeAfter before="before-office" after="after-office" />
              </div>
            </div>
          </section>
        </>
      )}

      {/* FAQ */}
      <section className={main ? 'bg-glacier py-24 sm:py-32' : 'bg-glacier py-24 sm:py-32'} aria-labelledby="sfaq-title">
        <div className="container-site grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionHeading eyebrow="Fragen" title={`Häufige Fragen zur ${s.name}`} id="sfaq-title" />
          </div>
          <div className="lg:col-span-8" data-reveal>
            <Accordion items={s.faqs.map((f) => ({ title: f.q, content: f.a }))} />
          </div>
        </div>
      </section>

      <section className="py-24 sm:py-32">
        <div className="container-site">
          <LeadMagnet />
        </div>
      </section>

      {/* Weitere Leistungen */}
      <section className="pb-24 sm:pb-32" aria-labelledby="more-title">
        <div className="container-site">
          <h2 id="more-title" className="text-2xl font-semibold tracking-tight" data-reveal>
            Weitere Leistungen
          </h2>
          <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {services
              .filter((x) => x.slug !== s.slug)
              .map((x) => (
                <li key={x.slug} data-reveal>
                  <Link
                    to={`/leistungen/${x.slug}`}
                    className="group flex h-full items-center gap-3 rounded-2xl bg-white p-4 ring-1 ring-line transition hover:shadow-soft hover:ring-blue/30"
                  >
                    <ServiceIcon icon={x.icon} className="size-5 text-blue" />
                    <span className="flex-1 font-medium">{x.name}</span>
                    <ArrowUpRight aria-hidden className="size-4 text-muted transition group-hover:text-blue" />
                  </Link>
                </li>
              ))}
          </ul>
        </div>
      </section>

      <FinalCta headline={`Bereit für eine ${s.name}, um die Sie sich nicht kümmern müssen?`} />
    </>
  )
}
