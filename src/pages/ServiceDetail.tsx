import { useParams } from 'react-router-dom'
import { getService, services } from '@/content/services'
import { home } from '@/content/site'
import { Seo } from '@/components/ui/Seo'
import { PageHero } from '@/components/ui/PageHero'
import { Answer } from '@/components/ui/Answer'
import { ImageBand } from '@/components/ui/ImageBand'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Accordion } from '@/components/ui/Accordion'
import { RevealText } from '@/components/ui/RevealText'
import { Picture } from '@/components/ui/Picture'
import { Button } from '@/components/ui/Button'
import { FeatureColumns, LinkRows, NumberedRows, PlaceGrid } from '@/components/ui/Editorial'
import { QuoteButton } from '@/features/configurator/QuoteLink'
import { FinalCta } from '@/components/home/FinalCta'
import { BeforeAfter } from '@/features/slider/BeforeAfter'
import { YearPlan } from '@/features/tools/YearPlan'
import { locations, shortName } from '@/content/locations'
import { officeCities } from '@/content/officeCities'
import { guides } from '@/content/ratgeber'
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
    { name: 'Startseite', path: '/' },
    { name: 'Leistungen', path: '/leistungen' },
    { name: s.name, path },
  ]
  const main = s.slug === 'bueroreinigung'

  return (
    <>
      <Seo title={s.seoTitle} description={s.seoDescription} path={path} ogType="leistung" schema={[serviceSchema(s, path), breadcrumbSchema(trail), faqSchema(s.faqs)]} />
      <PageHero
        trail={trail}
        eyebrow={s.name}
        title={s.headline}
        lead={s.intro}
        image={s.image}
        actions={
          <>
            <QuoteButton size="lg" arrow />
            <Button to="/kontakt#besichtigung" variant="link">
              Besichtigung buchen
            </Button>
          </>
        }
      />

      {/* Die vier Punkte: einheitliche Spalten mit Haarlinie, auf allen Leistungsseiten gleich */}
      <section className="section-tight" aria-label="Das zeichnet uns aus">
        <div className="container-site">
          <FeatureColumns items={s.highlights} titleAs="h2" />
        </div>
      </section>

      {/* Leistungsverzeichnis */}
      <section className="section" aria-labelledby="scope-title">
        <div className="container-site">
          <SectionHeading
            layout="split"
            eyebrow="Leistungsverzeichnis"
            title="Was genau enthalten ist."
            id="scope-title"
            text="Das ist unser Standard. Im Angebot passen wir das Verzeichnis an Ihr Objekt an. Was drinsteht, wird gemacht. Was nicht drinsteht, besprechen wir vorher."
          />
          <div className="grid-site mt-14 gap-y-12 lg:mt-20">
            {main && (
              <div className="col-span-12 lg:col-span-4">
                <div className="lg:sticky lg:top-28">
                  <Picture id="svc-buero-detail" ratio="4:5" reveal sizes="(min-width:1024px) 30vw, 100vw" />
                </div>
              </div>
            )}
            <div className={main ? 'col-span-12 lg:col-span-7 lg:col-start-6' : 'col-span-12 lg:col-span-9 lg:col-start-4'} data-reveal>
              <Accordion
                defaultOpen={0}
                items={s.scope.map((g) => ({
                  title: (
                    <span className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                      {g.title}
                      <span className="t-label">{g.items.length} Punkte</span>
                    </span>
                  ),
                  content: (
                    <ul className="border-t border-line">
                      {g.items.map((it) => (
                        <li key={it} className="border-b border-line py-2.5 text-ink">
                          {it}
                        </li>
                      ))}
                    </ul>
                  ),
                }))}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Intervalle und Zielgruppen */}
      <section className="section bg-surface" aria-label="Intervalle und Zielgruppen">
        <div className="container-site grid-site gap-y-16">
          <div className="col-span-12 lg:col-span-6">
            <h2 className="t-h3" data-reveal>
              Intervalle
            </h2>
            <NumberedRows className="mt-8" layout="stack" items={s.intervals.map((i) => ({ title: i.label, text: i.text, key: i.label }))} />
          </div>
          <div className="col-span-12 lg:col-span-5 lg:col-start-8">
            <h2 className="t-h3" data-reveal>
              Für wen geeignet
            </h2>
            <ul className="mt-8 border-b border-line">
              {s.suitableFor.map((t) => (
                <li key={t} className="border-t border-line py-4 text-[1.125rem]" data-reveal>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {!main && <ImageBand id="team-work" />}

      {main && (
        <>
          <section id="grundriss" className="section scroll-mt-24" aria-labelledby="plan-title">
            <div className="container-site">
              <SectionHeading
                layout="split"
                eyebrow="Raum für Raum"
                title="Was wird bei Ihnen gereinigt?"
                id="plan-title"
                text="Tippen Sie auf einen Bereich. Sie sehen, was dort gemacht wird und wie oft. Ohne Kleingedrucktes."
              />
              <div className="mt-14 lg:mt-20" data-reveal>
                <FloorPlan />
              </div>
            </div>
          </section>
          <section className="on-dark section bg-night text-paper" aria-labelledby="ba2-title">
            <div className="container-site">
              <SectionHeading layout="split" eyebrow={home.beforeAfter.eyebrow} title={home.beforeAfter.headline} id="ba2-title" text={home.beforeAfter.lead} />
              <div className="mt-14 lg:mt-20" data-reveal>
                <BeforeAfter before="before-office" after="after-office" />
              </div>
            </div>
          </section>
          <section className="section" aria-labelledby="pe-title">
            <div className="container-site">
              <SectionHeading
                layout="split"
                eyebrow="Kosten greifbar machen"
                title="Was kostet das pro Mitarbeiter?"
                id="pe-title"
                text="Ein Monatsbetrag sagt wenig. Umgerechnet auf Ihre Mitarbeiter und Arbeitstage sehen Sie, was ein sauberes Büro pro Kopf wirklich kostet."
              />
              <div className="mt-14 lg:mt-20" data-reveal>
                <PerEmployeeCalculator />
              </div>
            </div>
          </section>
          <ImageBand id="team-work" />
          <section className="section" aria-labelledby="cost-title">
            <div className="container-site">
              <SectionHeading
                layout="split"
                eyebrow="Kostenvergleich"
                title="Eigenes Personal oder CleanStar? Rechnen Sie ehrlich nach."
                id="cost-title"
                text="Eigene Reinigungskräfte kosten mehr als den Stundenlohn. Der Rechner zeigt alle Posten offen. Und wenn eigenes Personal für Sie günstiger ist, sagt er Ihnen das auch."
              />
              <div className="mt-14 lg:mt-20" data-reveal>
                <CostCalculator />
              </div>
            </div>
          </section>
          <section id="jahresplan" className="section scroll-mt-24 pt-0!" aria-labelledby="yplan-title">
            <div className="container-site">
              <SectionHeading
                layout="split"
                eyebrow="Jahres-Reinigungsplan"
                title="Wir denken das ganze Jahr mit."
                id="yplan-title"
                text="Laufende Reinigung, Fenster, Grundreinigung, Teppichpflege: Wählen Sie die Intervalle, und Sie sehen, wann was ansteht. Als PDF zum Weitergeben."
              />
              <div className="mt-14 lg:mt-20" data-reveal>
                <YearPlan />
              </div>
            </div>
          </section>
        </>
      )}

      {/* FAQ */}
      <section className="section bg-surface" aria-labelledby="sfaq-title">
        <div className="container-site grid-site gap-y-10">
          <span aria-hidden data-reveal-rule className="rule col-span-12 mb-4" />
          <div className="col-span-12 lg:col-span-4">
            <p className="t-label mb-6">Fragen</p>
            <RevealText as="h2" text={`${s.name}: häufige Fragen`} id="sfaq-title" className="t-h3" />
          </div>
          <div className="col-span-12 lg:col-span-8" data-reveal>
            <Accordion items={s.faqs.map((f) => ({ title: f.q, content: f.a }))} />
          </div>
        </div>
      </section>

      <section className="section" aria-label="Checkliste zum Herunterladen">
        <div className="container-site">
          <LeadMagnet />
        </div>
      </section>

      {/* Interne Verlinkung: Orte als ausgewogenes Raster, darunter Ratgeber und weitere Leistungen */}
      <section className="section bg-surface" aria-labelledby="near-title">
        <div className="container-site">
          <h2 id="near-title" className="t-h3">
            {s.name} in Ihrer Nähe
          </h2>
          <PlaceGrid
            className="mt-8 lg:mt-10"
            items={(main ? officeCities.map((c) => ({ to: `/bueroreinigung/${c.slug}`, label: `Büroreinigung ${c.name}` })) : [])
              .concat(
                locations
                  .filter((l) => l.focus.some((f) => f.service === s.slug) && !(main && officeCities.some((c) => c.slug === l.slug)))
                  .slice(0, main ? 6 : 11)
                  .map((l) => ({ to: `/einzugsgebiet/${l.slug}`, label: `${s.name} ${shortName(l)}` })),
              )
              .concat([{ to: '/einzugsgebiet', label: 'Alle Orte im Ortenaukreis' }])}
          />
          <div className="grid-site mt-16 gap-y-12 lg:mt-20">
            <div className="col-span-12 md:col-span-6">
              <h2 className="t-label">Aus dem Ratgeber</h2>
              <LinkRows
                className="mt-6"
                items={guides
                  .filter((g) => g.category === 'unternehmen')
                  .slice(0, 4)
                  .map((g) => ({ to: `/ratgeber/${g.slug}`, label: g.title }))}
              />
            </div>
            <div className="col-span-12 md:col-span-6">
              <h2 id="more-title" className="t-label">
                Weitere Leistungen
              </h2>
              <LinkRows className="mt-6" items={services.filter((x) => x.slug !== s.slug).map((x) => ({ to: `/leistungen/${x.slug}`, label: x.name }))} />
            </div>
          </div>
        </div>
      </section>

      <Answer className="pt-20 sm:pt-28 lg:pt-36">{`CleanStar übernimmt die ${s.name} für Unternehmen in Offenburg und im ganzen Ortenaukreis. ${s.short}`}</Answer>
      <FinalCta headline={`Bereit für eine ${s.name}, um die Sie sich nicht kümmern müssen?`} />
    </>
  )
}
