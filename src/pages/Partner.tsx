import { lazy, Suspense, useEffect, useState } from 'react'
import { ScrubStatement } from '@/components/ui/ScrubStatement'
import { statements } from '@/content/statements'
import { Seo } from '@/components/ui/Seo'
import { PageHero } from '@/components/ui/PageHero'
import { Answer } from '@/components/ui/Answer'
import { ImageBand } from '@/components/ui/ImageBand'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { FaqBlock } from '@/components/ui/FaqBlock'
import { NumberedRows } from '@/components/ui/Editorial'
import { Button } from '@/components/ui/Button'
import { RevealText } from '@/components/ui/RevealText'
import { Fact, Todo } from '@/components/ui/Todo'
import { ProblemSolution } from '@/components/home/ProblemSolution'
import { ProcessTimeline } from '@/components/home/ProcessTimeline'
import { WaysToggle } from '@/features/partner/WaysToggle'
import { ModuleGrid } from '@/features/partner/ModuleGrid'
import { PartnerForm } from '@/features/partner/PartnerForm'
import { InfoPackForm } from '@/features/partner/InfoPackForm'
import { partnerPage as page, partnerConditions, partnerFaqs, partnerFlags, partnerSteps, partnerTestimonials, type PartnerWay } from '@/content/partner'
import { company } from '@/content/company'
import { breadcrumbSchema, faqSchema } from '@/lib/schema'
import { scrollToId } from '@/lib/smooth-scroll'

// Karte erst im Browser laden: hält das vorgerenderte HTML schlank (schnellerer erster Seitenaufbau)
const RegionMap = lazy(() => import('@/features/partner/RegionMap').then((m) => ({ default: m.RegionMap })))

const Chunk = ({ children }: { children: React.ReactNode }) => <Suspense fallback={null}>{children}</Suspense>

const trail = [
  { name: 'Startseite', path: '/' },
  { name: 'Partner werden', path: '/partner' },
]

export default function Partner() {
  const [way, setWay] = useState<PartnerWay>('bestand')
  const [region, setRegion] = useState('')
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const toForm = () => scrollToId('bewerbung')
  const toInfo = () => scrollToId('infomappe')

  return (
    <>
      <Seo
        title={page.seoTitle}
        description={page.seoDescription}
        ogType="partner"
        path="/partner"
        schema={[breadcrumbSchema(trail), faqSchema(partnerFaqs.filter((f) => !f.todo).map(({ q, a }) => ({ q, a })))]}
      />

      <PageHero
        trail={trail}
        eyebrow={page.hero.eyebrow}
        title={page.hero.headline}
        lead={page.hero.sub}
        image="partner-onboarding"
        actions={
          <>
            <Button href="#bewerbung" size="lg" arrow onClick={(e) => (e.preventDefault(), toForm())}>
              Unverbindliches Erstgespräch
            </Button>
            <Button href="#infomappe" variant="link" onClick={(e) => (e.preventDefault(), toInfo())}>
              Partner-Infomappe anfordern
            </Button>
          </>
        }
      >
        <p className="t-label mt-8">
          {page.hero.note}
        </p>
      </PageHero>

      <ScrubStatement {...statements.partner} id="statement-title" />
      <Chunk>
        <ProblemSolution id="partner-problems" eyebrow={page.problems.eyebrow} headline={page.problems.headline} lead={page.problems.lead} items={page.problems.items} />
      </Chunk>
      <Chunk>
        <section className="section" aria-labelledby="ways-title">
          <div className="container-site">
            <SectionHeading
              layout="split"
              eyebrow="Zwei Wege"
              title="Wo stehen Sie gerade?"
              id="ways-title"
              text="Das Partnerprogramm passt zu zwei Ausgangslagen. Wählen Sie Ihre, wir übernehmen die Auswahl in Ihre Anfrage."
            />
            <div className="mt-14 lg:mt-20">
              <WaysToggle way={way} onChange={setWay} onApply={toForm} />
            </div>
          </div>
        </section>
      </Chunk>
      <Chunk>
        <section className="section bg-surface" aria-labelledby="modules-title">
          <div className="container-site">
            <SectionHeading
              layout="split"
              eyebrow="Was Partner bekommen"
              title="Ein Baukasten aus dem, was in Offenburg täglich funktioniert."
              id="modules-title"
              text="Diese Module bilden den Leistungsumfang des Partnerprogramms. Klicken Sie auf ein Modul, um die Inhalte zu sehen. Was genau Sie erhalten, regelt der Partnervertrag."
            />
            <div className="mt-14 lg:mt-20">
              <ModuleGrid />
            </div>
          </div>
        </section>
      </Chunk>
      <Chunk>
        <section className="on-dark section bg-night text-paper" aria-labelledby="expect-title">
          <div className="container-site">
            <SectionHeading layout="split" eyebrow={page.expectations.eyebrow} title={page.expectations.headline} id="expect-title" text={page.expectations.lead} />
            <NumberedRows className="mt-14 lg:mt-20" dark items={page.expectations.items.map((e) => ({ title: e.title, text: e.text, key: e.title }))} />
          </div>
        </section>
      </Chunk>
      <Chunk>
        <section className="section" aria-labelledby="regions-title">
          <div className="container-site">
            <SectionHeading
              layout="split"
              eyebrow="Regionen"
              title="Wo wir Partner suchen."
              id="regions-title"
              text="Jede Wabe steht für einen Stadt- oder Landkreis in Baden-Württemberg. Wählen Sie Ihre Region, sie wird direkt in Ihre Anfrage übernommen."
            />
            <div className="mt-14 lg:mt-20">
              {mounted ? (
                <Suspense fallback={<div className="min-h-[36rem]" />}>
                  <RegionMap
                    onSelect={(name) => {
                      setRegion(name)
                      toForm()
                    }}
                  />
                </Suspense>
              ) : (
                <div className="min-h-[36rem]" />
              )}
            </div>
          </div>
        </section>
      </Chunk>
      <Chunk>
        <ImageBand id="svc-halle" />
        <ProcessTimeline variant="rows" eyebrow="Ablauf" title="In sieben Schritten zum Partner." steps={partnerSteps} id="partner-process-title" />
      </Chunk>
      <Chunk>
        <section className="section bg-surface" aria-labelledby="conditions-title">
          <div className="container-site grid-site gap-y-10">
            <span aria-hidden className="rule col-span-12 mb-4" />
            <div className="col-span-12 lg:col-span-4">
              <p className="t-label mb-6">Konditionen</p>
              <RevealText as="h2" text="Klare Zahlen. Im Gespräch, nicht im Kleingedruckten." id="conditions-title" className="t-h3" />
            </div>
            <div className="col-span-12 lg:col-span-7 lg:col-start-6">
              {partnerFlags.showConditions ? (
                <dl className="border-t border-line">
                  {partnerConditions.map((c) => (
                    <div key={c.label} className="flex items-baseline justify-between gap-6 border-b border-line py-4">
                      <dt className="text-ink-2">{c.label}</dt>
                      <dd className="text-right font-medium">
                        <Fact value={c.value} fallback="im Gespräch" todo={`${c.label} in partner.ts eintragen`} />
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="t-lead">
                  {page.conditionsFallback} Bevor Sie sich entscheiden, erhalten Sie alle Kosten, die Laufzeit und die Regelungen zu Ihrem Gebiet schriftlich und mit ausreichend
                  Zeit zur Prüfung.
                </p>
              )}
            </div>
          </div>
        </section>
      </Chunk>
      <Chunk>
        <section id="bewerbung" className="section scroll-mt-24" aria-labelledby="apply-title">
          <div className="container-site grid-site gap-y-14">
            <span aria-hidden className="rule col-span-12" />
            <div className="col-span-12 lg:col-span-4">
              <SectionHeading
                eyebrow="Partneranfrage"
                title="Unverbindlich anfragen."
                id="apply-title"
                size="h3"
                text="Ein paar Angaben zu Ihnen und Ihrer Region. Wir melden uns persönlich und vereinbaren ein Erstgespräch."
              />
              <ol className="mt-10 border-t border-line">
                {['Unverbindlich und kostenlos', 'Persönliche Rückmeldung', 'Verbindlich ist erst ein schriftlicher Partnervertrag'].map((t, i) => (
                  <li key={t} className="flex gap-5 border-b border-line py-3.5">
                    <span className="t-label w-6 shrink-0 pt-0.5">{String(i + 1).padStart(2, '0')}</span>
                    {t}
                  </li>
                ))}
              </ol>
              <a href={company.phone.href} className="ulink mt-8 inline-block text-ink">
                Lieber direkt sprechen? {company.phone.display}
              </a>
            </div>
            <div className="col-span-12 lg:col-span-7 lg:col-start-6">
              <PartnerForm way={way} region={region} />
            </div>
          </div>
        </section>
      </Chunk>
      <Chunk>
        <section id="infomappe" className="scroll-mt-24 pb-24 lg:pb-40" aria-label="Partner-Infomappe">
          <div className="container-site">
            <InfoPackForm region={region} />
          </div>
        </section>

        {partnerFlags.showTestimonials && (
          <section className="section pt-0!" aria-labelledby="pt-title">
            <div className="container-site">
              <SectionHeading layout="rail" eyebrow="Partnerstimmen" title="Was Partner sagen." id="pt-title" />
              <ul className="mt-14 grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-3">
                {partnerTestimonials.map((t, i) => (
                  <li key={i} className="border-t border-line pt-6">
                    <blockquote className="t-h4">„{t.quote}“</blockquote>
                    <p className="t-label mt-6">
                      {t.name}, {t.role}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </Chunk>
      <Chunk>
        <FaqBlock
          className="section bg-surface"
          label="Partner-FAQ"
          title="Ehrliche Antworten auf die wichtigsten Fragen."
          id="pfaq-title"
          items={partnerFaqs.map((f) => ({
            title: f.q,
            content: (
              <>
                {f.a}
                {f.todo && <Todo title={f.todo}>{f.todo}</Todo>}
              </>
            ),
          }))}
        />
      </Chunk>
      <Chunk>
        <Answer dark>
          Das CleanStar-Partnerprogramm richtet sich an Reinigungsfirmen und Gründer in ganz Deutschland, die mit erprobten Abläufen, Vorlagen und Werkzeugen aus unserem Betrieb in
          Offenburg arbeiten möchten. Konditionen klären wir im persönlichen Gespräch.
        </Answer>
      </Chunk>
      <Chunk>
        {/* Abschluss hell, damit sich der dunkle Footer klar absetzt; der rechtliche Hinweis gehört mit hinein */}
        <section className="section bg-surface text-ink" aria-labelledby="pcta-title">
          <div className="container-site grid-site gap-y-10 lg:items-end">
            <span aria-hidden className="rule col-span-12 mb-4" />
            <div className="col-span-12 lg:col-span-8">
              <p className="t-label mb-6">
                {page.closing.eyebrow}
              </p>
              <RevealText as="h2" id="pcta-title" text={page.closing.headline} className="t-h1" />
              <p className="t-lead measure mt-8">
                {page.closing.text}
              </p>
            </div>
            <div className="col-span-12 flex flex-col gap-6 lg:col-span-4 lg:items-end">
              <Button href="#bewerbung" size="lg" arrow onClick={(e) => (e.preventDefault(), toForm())}>
                Zur Partneranfrage
              </Button>
              <a href={company.phone.href} className="ulink text-[1.75rem] font-medium tracking-[-0.03em] text-ink">
                {company.phone.display}
              </a>
            </div>
            <p className="measure col-span-12 mt-10 border-t border-line pt-6 font-medium tabular-nums text-[0.75rem] leading-relaxed text-muted">
              {page.legalNote}
              <Todo title="Rechtlichen Hinweis anwaltlich prüfen lassen">anwaltlich prüfen</Todo>
            </p>
          </div>
        </section>
      </Chunk>
    </>
  )
}
