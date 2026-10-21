import { lazy, Suspense, useEffect, useState } from 'react'
import { Check, MessagesSquare, Phone, FileDown } from 'lucide-react'
import { Seo } from '@/components/ui/Seo'
import { PageHero } from '@/components/ui/PageHero'
import { Answer } from '@/components/ui/Answer'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Accordion } from '@/components/ui/Accordion'
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
  { name: 'Start', path: '/' },
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
        image="partner-hero"
        actions={
          <>
            <Button href="#bewerbung" size="lg" arrow icon={<MessagesSquare aria-hidden className="size-5" />} onClick={(e) => (e.preventDefault(), toForm())}>
              Unverbindliches Erstgespräch
            </Button>
            <Button href="#infomappe" size="lg" variant="secondary" icon={<FileDown aria-hidden className="size-5 text-blue" />} onClick={(e) => (e.preventDefault(), toInfo())}>
              Partner-Infomappe anfordern
            </Button>
          </>
        }
      >
        <p className="fade-up-now mt-6 text-sm text-muted" style={{ ['--d' as string]: '0.7s' }}>
          {page.hero.note}
        </p>
      </PageHero>
      <Answer className="pt-12 sm:pt-16">Das CleanStar-Partnerprogramm richtet sich an Reinigungsfirmen und Gründer in ganz Deutschland, die mit erprobten Abläufen, Vorlagen und Werkzeugen aus unserem Betrieb in Offenburg arbeiten möchten. Konditionen klären wir im persönlichen Gespräch.</Answer>

      <Chunk>
        <ProblemSolution id="partner-problems" eyebrow={page.problems.eyebrow} headline={page.problems.headline} lead={page.problems.lead} items={page.problems.items} />
      </Chunk>
      <Chunk>
        <section className="bg-glacier py-24 sm:py-32" aria-labelledby="ways-title">
          <div className="container-site">
            <SectionHeading
              eyebrow="Zwei Wege"
              title="Wo stehen Sie gerade?"
              id="ways-title"
              text="Das Partnerprogramm passt zu zwei Ausgangslagen. Wählen Sie Ihre, wir übernehmen die Auswahl in Ihre Anfrage."
            />
            <div className="mt-12">
              <WaysToggle way={way} onChange={setWay} onApply={toForm} />
            </div>
          </div>
        </section>
      </Chunk>
      <Chunk>
        <section className="py-24 sm:py-32" aria-labelledby="modules-title">
          <div className="container-site">
            <SectionHeading
              eyebrow="Was Partner bekommen"
              title="Ein Baukasten aus dem, was in Offenburg täglich funktioniert."
              id="modules-title"
              text="Diese Module bilden den Leistungsumfang des Partnerprogramms. Klicken Sie auf ein Modul, um die Inhalte zu sehen. Was genau Sie erhalten, regelt der Partnervertrag."
            />
            <div className="mt-12">
              <ModuleGrid />
            </div>
          </div>
        </section>
      </Chunk>
      <Chunk>
        <section className="bg-glacier py-24 sm:py-32" aria-labelledby="expect-title">
          <div className="container-site grid grid-cols-1 gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <SectionHeading eyebrow={page.expectations.eyebrow} title={page.expectations.headline} id="expect-title" text={page.expectations.lead} />
            </div>
            <ul className="grid grid-cols-1 gap-3 lg:col-span-7">
              {page.expectations.items.map((e) => (
                <li key={e.title} className="flex gap-4 rounded-card bg-white p-5 ring-1 ring-line sm:p-6" data-reveal>
                  <span aria-hidden className="grid size-8 shrink-0 place-items-center rounded-full bg-ink text-white">
                    <Check className="size-4" strokeWidth={3} />
                  </span>
                  <span>
                    <span className="block font-semibold">{e.title}</span>
                    <span className="mt-1 block text-muted">{e.text}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </Chunk>
      <Chunk>
        <section className="py-24 sm:py-32" aria-labelledby="regions-title">
          <div className="container-site">
            <SectionHeading
              eyebrow="Regionen"
              title="Wo wir Partner suchen."
              id="regions-title"
              text="Jede Wabe steht für einen Stadt- oder Landkreis in Baden-Württemberg. Wählen Sie Ihre Region, sie wird direkt in Ihre Anfrage übernommen."
            />
            <div className="mt-12">
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
        <ProcessTimeline eyebrow="Ablauf" title="In sieben Schritten zum Partner." steps={partnerSteps} id="partner-process-title" />
      </Chunk>
      <Chunk>
        <section className="bg-glacier py-20 sm:py-24" aria-labelledby="conditions-title">
          <div className="container-site grid grid-cols-1 gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <SectionHeading eyebrow="Konditionen" title="Klare Zahlen. Im Gespräch, nicht im Kleingedruckten." id="conditions-title" />
            </div>
            <div className="lg:col-span-7" data-reveal>
              {partnerFlags.showConditions ? (
                <dl className="divide-y divide-line rounded-card bg-white px-6 ring-1 ring-line">
                  {partnerConditions.map((c) => (
                    <div key={c.label} className="flex items-baseline justify-between gap-6 py-4">
                      <dt className="text-muted">{c.label}</dt>
                      <dd className="text-right font-semibold">
                        <Fact value={c.value} fallback="im Gespräch" todo={`${c.label} in partner.ts eintragen`} />
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="text-lg leading-relaxed text-ink/85">
                  {page.conditionsFallback} Bevor Sie sich entscheiden, erhalten Sie alle Kosten, die Laufzeit und die Regelungen zu Ihrem Gebiet schriftlich und mit ausreichend
                  Zeit zur Prüfung.
                </p>
              )}
            </div>
          </div>
        </section>
      </Chunk>
      <Chunk>
        <section id="bewerbung" className="scroll-mt-24 py-24 sm:py-32" aria-labelledby="apply-title">
          <div className="container-site grid grid-cols-1 gap-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <SectionHeading
                eyebrow="Partneranfrage"
                title="Unverbindlich anfragen."
                id="apply-title"
                text="Ein paar Angaben zu Ihnen und Ihrer Region. Wir melden uns persönlich und vereinbaren ein Erstgespräch."
              />
              <ul className="mt-8 space-y-3 text-sm" data-reveal>
                {['Unverbindlich und kostenlos', 'Persönliche Rückmeldung', 'Verbindlich ist erst ein schriftlicher Partnervertrag'].map((t) => (
                  <li key={t} className="flex items-center gap-3 font-medium">
                    <span aria-hidden className="grid size-6 place-items-center rounded-full bg-fresh/15 text-fresh-ink">
                      <Check className="size-3.5" strokeWidth={3} />
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
              <a href={company.phone.href} className="mt-8 inline-flex items-center gap-3 text-sm text-muted" data-reveal>
                <Phone aria-hidden className="size-4 text-blue" />
                Lieber direkt sprechen? <span className="font-semibold text-ink">{company.phone.display}</span>
              </a>
            </div>
            <div className="lg:col-span-8">
              <div className="overflow-hidden rounded-panel bg-white shadow-lift ring-1 ring-line">
                <PartnerForm way={way} region={region} />
              </div>
            </div>
          </div>
        </section>
      </Chunk>
      <Chunk>
        <section id="infomappe" className="scroll-mt-24 pb-24 sm:pb-32" aria-label="Partner-Infomappe">
          <div className="container-site">
            <InfoPackForm region={region} />
          </div>
        </section>

        {partnerFlags.showTestimonials && (
          <section className="bg-glacier py-24" aria-labelledby="pt-title">
            <div className="container-site">
              <SectionHeading eyebrow="Partnerstimmen" title="Was Partner sagen." id="pt-title" />
              <ul className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
                {partnerTestimonials.map((t, i) => (
                  <li key={i} className="rounded-card bg-white p-8 ring-1 ring-line">
                    <blockquote className="text-lg">„{t.quote}“</blockquote>
                    <p className="mt-6 text-sm font-semibold">{t.name}</p>
                    <p className="text-sm text-muted">{t.role}</p>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </Chunk>
      <Chunk>
        <section className="bg-glacier py-24 sm:py-32" aria-labelledby="pfaq-title">
          <div className="container-site grid grid-cols-1 gap-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <SectionHeading eyebrow="Partner-FAQ" title="Ehrliche Antworten auf die wichtigsten Fragen." id="pfaq-title" />
            </div>
            <div className="lg:col-span-8" data-reveal>
              <Accordion
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
            </div>
          </div>
        </section>
      </Chunk>
      <Chunk>
        <section className="on-dark relative overflow-hidden bg-ink py-24 text-white sm:py-32" aria-labelledby="pcta-title">
          <div aria-hidden className="absolute -bottom-40 -left-20 size-[36rem] [background:radial-gradient(closest-side,rgb(31_94_255/0.48),transparent)]" />
          <div className="container-site relative grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <p className="eyebrow mb-5" data-reveal>
                {page.closing.eyebrow}
              </p>
              <RevealText as="h2" id="pcta-title" text={page.closing.headline} className="heading-1" />
              <p className="lead mt-6 max-w-xl" data-reveal>
                {page.closing.text}
              </p>
            </div>
            <div className="flex flex-col gap-4 lg:col-span-5 lg:items-end" data-reveal>
              <Button href="#bewerbung" size="lg" variant="light" arrow onClick={(e) => (e.preventDefault(), toForm())}>
                Zur Partneranfrage
              </Button>
              <a href={company.phone.href} className="inline-flex items-center gap-3 text-white">
                <span className="grid size-12 place-items-center rounded-full bg-white/10 ring-1 ring-white/15">
                  <Phone aria-hidden className="size-5 text-fresh" />
                </span>
                <span className="text-2xl font-semibold tracking-tight">{company.phone.display}</span>
              </a>
            </div>
          </div>
        </section>
      </Chunk>
      <Chunk>
        <section aria-label="Rechtlicher Hinweis" className="py-10">
          <p className="container-site max-w-4xl text-xs leading-relaxed text-muted">
            {page.legalNote}
            <Todo title="Rechtlichen Hinweis anwaltlich prüfen lassen">anwaltlich prüfen</Todo>
          </p>
        </section>
      </Chunk>
    </>
  )
}
