import { useEffect, useRef, useState } from 'react'
import { noOrphan } from '@/lib/format'
import { Seo } from '@/components/ui/Seo'
import { PageHero } from '@/components/ui/PageHero'
import { Answer } from '@/components/ui/Answer'
import { ImageBand } from '@/components/ui/ImageBand'
import { Sparkle } from '@/components/ui/Sparkle'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Picture } from '@/components/ui/Picture'
import { Todo } from '@/components/ui/Todo'
import { FinalCta } from '@/components/home/FinalCta'
import { QuoteButton } from '@/features/configurator/QuoteLink'
import { RevealText } from '@/components/ui/RevealText'
import { guaranteePoints, complaintSteps } from '@/content/site'
import { company } from '@/content/company'
import { breadcrumbSchema } from '@/lib/schema'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { RiskFreeSeal } from '@/components/ui/RiskFreeSeal'
import { useReducedMotion } from '@/lib/env'
import { cn } from '@/lib/cn'
import { CallbackButton } from '@/features/callback/Callback'

const trail = [
  { name: 'Startseite', path: '/' },
  { name: 'Qualitätsgarantie', path: '/qualitaetsgarantie' },
]

const pad = (n: number) => String(n).padStart(2, '0')

export default function Guarantee() {
  const reduced = useReducedMotion()
  const list = useRef<HTMLOListElement>(null)
  const flow = useRef<HTMLOListElement>(null)
  const [checked, setChecked] = useState(0)
  const done = reduced ? guaranteePoints.length : checked

  // Prüfpunkte werden beim Scrollen nacheinander abgehakt
  useEffect(() => {
    if (reduced || !list.current) return
    const items = Array.from(list.current.querySelectorAll('li'))
    const triggers = items.map((el, i) =>
      ScrollTrigger.create({
        trigger: el,
        start: 'top 62%',
        onEnter: () => setChecked((c) => Math.max(c, i + 1)),
        onLeaveBack: () => setChecked(i),
      }),
    )
    return () => triggers.forEach((t) => t.kill())
  }, [reduced])

  // Reklamation: Verbindungslinie füllt sich beim Scrollen, Schritte leuchten nacheinander auf
  useEffect(() => {
    if (reduced || !flow.current) return
    const ctx = gsap.context(() => {
      gsap.fromTo('[data-flow-line]', { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: flow.current, start: 'top 75%', end: 'top 35%', scrub: 0.5 } })
    }, flow)
    return () => ctx.revert()
  }, [reduced])

  return (
    <>
      <Seo
        title="Qualitätsgarantie Büroreinigung"
        description="Qualitätsgarantie von CleanStar: kostenlose Nachreinigung bei Reklamation, eigene Kontrollen, fester Ansprechpartner und Vertretung bei Ausfall."
        path="/qualitaetsgarantie"
        schema={[breadcrumbSchema(trail)]}
      />
      <PageHero
        trail={trail}
        eyebrow="Qualitätsgarantie"
        title="Was wir zusagen. Und was passiert, wenn es einmal nicht klappt."
        lead="Eine Garantie ist nur so viel wert wie der Ablauf dahinter. Hier steht, worauf Sie sich verlassen können, und was wir tun, wenn doch einmal etwas fehlt."
        image="quality-check"
        caption="Qualitätskontrolle vor Ort"
        actions={<QuoteButton size="lg" arrow />}
      />

      <section className="section" aria-labelledby="points-title">
        <div className="container-site grid-site gap-y-12">
          <div className="col-span-12 lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <SectionHeading
                eyebrow="Unsere Prüfpunkte"
                title={`${['Sieben', 'Acht', 'Neun'][guaranteePoints.length - 7] ?? guaranteePoints.length} Zusagen, an denen Sie uns messen können.`}
                id="points-title"
                size="h3"
              />
              <div className="mt-12 hidden lg:block" aria-live="polite">
                <p className="t-label">Geprüft</p>
                <p className="mt-2 font-mono text-[2.5rem] leading-none tracking-[-0.04em] tabular-nums">
                  {pad(done)} / {pad(guaranteePoints.length)}
                </p>
                <span className="mt-5 block h-px bg-line">
                  <span className="block h-px origin-left bg-ink transition-transform duration-700 ease-cs" style={{ transform: `scaleX(${done / guaranteePoints.length})` }} />
                </span>
              </div>
              <RiskFreeSeal variant="card" className="mt-12" />
            </div>
          </div>
          <div className="col-span-12 lg:col-span-7 lg:col-start-6">
            {/* Handy und Tablet: schlanke Fortschrittszeile klebt oben, solange die Liste im Bild ist */}
            <div className="sticky top-0 z-20 -mx-5 mb-2 border-b border-line bg-paper px-5 py-3 sm:-mx-8 sm:px-8 lg:hidden" aria-hidden>
              <p className="flex justify-between font-mono text-[0.8125rem]">
                <span>
                  {pad(done)} / {pad(guaranteePoints.length)} geprüft
                </span>
                <span className="text-muted">Qualitätsgarantie</span>
              </p>
              <span className="mt-2 block h-px bg-line">
                <span className="block h-px origin-left bg-ink transition-transform duration-700 ease-cs" style={{ transform: `scaleX(${done / guaranteePoints.length})` }} />
              </span>
            </div>
            <ol ref={list} className="border-b border-line">
              {guaranteePoints.map((p, i) => {
                const on = i < done
                return (
                  <li key={p.title} className="grid grid-cols-[4.5rem_1fr] gap-x-4 border-t border-line py-7 sm:grid-cols-[6rem_1fr] sm:py-9">
                    <span className={cn('font-mono text-[0.8125rem] transition-colors duration-500', on ? 'text-ink' : 'text-muted')}>
                      {pad(i + 1)} / {pad(guaranteePoints.length)}
                    </span>
                    <div className="min-w-0">
                      <h3
                        className={cn(
                          'text-[1.25rem] leading-[1.2] font-medium tracking-[-0.02em] transition-colors duration-500 min-[400px]:text-[1.5rem] sm:text-[1.75rem]',
                          on ? 'text-ink' : 'text-ink/55',
                        )}
                      >
                        {noOrphan(p.title, 16)}
                        <span aria-hidden className="relative inline-block w-0">
                          <Sparkle play={on} delay={0.15} className="absolute bottom-[0.2em] left-[0.3em] size-[0.6em]" />
                        </span>
                      </h3>
                      <p className="measure mt-3 text-ink-2">
                        {p.usesComplaintPeriod && company.complaintPeriod
                          ? `Passt etwas nicht, melden Sie es Ihrem Ansprechpartner. Wir reinigen kostenlos nach, innerhalb von ${company.complaintPeriod}.`
                          : p.text}
                        {p.todo && <Todo title={p.todo}>{p.todo}</Todo>}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ol>
          </div>
        </div>
      </section>

      <ImageBand id="after-office" />

      <section className="on-dark section bg-night text-paper" aria-labelledby="complaint-title">
        <div className="container-site">
          <SectionHeading
            layout="split"
            eyebrow="Reklamation"
            title="Wenn etwas fehlt: ein Anruf genügt."
            id="complaint-title"
            text="Kein Formular, kein Ticketsystem, keine Diskussion über Zuständigkeiten. Drei Schritte, dann ist es erledigt. Die Nachreinigung kostet Sie nichts."
          />

          <ol ref={flow} className="relative mt-16 grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-3 lg:mt-24">
            <span aria-hidden className="absolute top-0 right-0 left-0 hidden h-px bg-line-dark md:block" />
            <span aria-hidden data-flow-line className="absolute top-0 right-0 left-0 hidden h-px origin-left bg-paper md:block" />
            {complaintSteps.map((s, i) => (
              <li key={s.title} className="relative border-t border-line-dark pt-6 md:border-t-0 md:pt-8">
                <p className="t-num text-paper">{pad(i + 1)}</p>
                <h3 className="mt-8 text-[1.5rem] leading-[1.2] font-medium tracking-[-0.02em]">{noOrphan(s.title, 16)}</h3>
                <p className="mt-3 text-muted-dark">{s.text}</p>
              </li>
            ))}
          </ol>

          <div className="mt-16 flex flex-col gap-5 border-t border-line-dark pt-8 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-8" data-reveal>
            <span className="t-label">Melden Sie es direkt</span>
            <a href={company.phone.href} className="btn btn-light">
              {company.phone.display}
            </a>
            <CallbackButton dark />
            <a href={`mailto:${company.email}`} className="ulink min-w-0 break-all text-paper">
              {company.email}
            </a>
            {company.whatsapp.enabled && (
              <a href={`https://wa.me/${company.whatsapp.number}`} className="ulink text-paper">
                WhatsApp
              </a>
            )}
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="qc-title">
        <div className="container-site grid-site gap-y-12 lg:items-end">
          <div className="col-span-12 lg:col-span-5">
            <Picture id="team-briefing" ratio="4:5" reveal sizes="(min-width:1024px) 40vw, 100vw" caption="Abstimmung mit dem Team" />
          </div>
          <div className="col-span-12 lg:col-span-6 lg:col-start-7">
            <p className="t-label mb-6">Qualitätskontrolle</p>
            <RevealText as="h2" text="Wir kontrollieren selbst. Bevor Sie es müssen." id="qc-title" className="t-h2" />
            <p className="t-lead measure mt-8" data-reveal>
              Wir prüfen regelmäßig vor Ort, anhand einer Checkliste, die auf Ihr Leistungsverzeichnis abgestimmt ist. Auffälligkeiten besprechen wir direkt mit dem Team und, wenn
              nötig, mit Ihnen.
            </p>
            <p className="mt-6 text-ink-2" data-reveal>
              Die Kontrollen führt {company.founders[1]?.name ?? 'Ihr Ansprechpartner'} persönlich durch. Den Rhythmus legen wir gemeinsam mit Ihnen im Angebot fest.
            </p>
          </div>
        </div>
      </section>

      <Answer>
        Die Qualitätsgarantie von CleanStar bedeutet: Passt etwas nicht, reinigen wir kostenlos nach und klären die Ursache mit dem Team. Dazu kommen eigene Qualitätskontrollen,
        ein fester Ansprechpartner und eine Ersatzkraft bei Ausfall.
      </Answer>
      <FinalCta />
    </>
  )
}
