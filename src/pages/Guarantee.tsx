import { useEffect, useRef, useState } from 'react'
import { CalendarCheck, Check, Mail, MessageSquareText, Phone, Sparkles } from 'lucide-react'
import { Seo } from '@/components/ui/Seo'
import { PageHero } from '@/components/ui/PageHero'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Picture } from '@/components/ui/Picture'
import { Todo } from '@/components/ui/Todo'
import { FinalCta } from '@/components/home/FinalCta'
import { QuoteButton } from '@/features/configurator/QuoteLink'
import { guaranteePoints, complaintSteps } from '@/content/site'
import { company } from '@/content/company'
import { breadcrumbSchema } from '@/lib/schema'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { RiskFreeSeal, SealMark } from '@/components/ui/RiskFreeSeal'
import { useReducedMotion } from '@/lib/env'
import { cn } from '@/lib/cn'

const trail = [
  { name: 'Start', path: '/' },
  { name: 'Qualitätsgarantie', path: '/qualitaetsgarantie' },
]

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
      gsap.utils
        .toArray<HTMLElement>('[data-flow-step]')
        .forEach((el) => ScrollTrigger.create({ trigger: el, start: 'top 68%', onToggle: (t) => el.classList.toggle('is-on', t.isActive || t.progress > 0), end: 'bottom -100%' }))
    }, flow)
    return () => ctx.revert()
  }, [reduced])

  return (
    <>
      <Seo
        title="Qualitätsgarantie: kostenlose Nachreinigung, feste Ansprechpartner"
        description="Die Qualitätsgarantie von CleanStar: kostenlose Nachreinigung bei Reklamation, regelmäßige Qualitätskontrollen, fester Ansprechpartner, Vertretung bei Ausfall, Schlüsselmanagement und Diskretion."
        path="/qualitaetsgarantie"
        schema={[breadcrumbSchema(trail)]}
      />
      <PageHero
        trail={trail}
        eyebrow="Qualitätsgarantie"
        title="Was wir zusagen. Und was passiert, wenn es einmal nicht klappt."
        lead="Eine Garantie ist nur so viel wert wie der Ablauf dahinter. Hier steht, worauf Sie sich verlassen können, und was wir tun, wenn doch einmal etwas fehlt."
        image="quality-check"
        actions={<QuoteButton size="lg" arrow />}
      />

      <section className="py-24 sm:py-32" aria-labelledby="points-title">
        <div className="container-site grid grid-cols-1 gap-14 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-32">
              <SectionHeading
                eyebrow="Unsere Prüfpunkte"
                title={`${['Sieben', 'Acht', 'Neun'][guaranteePoints.length - 7] ?? guaranteePoints.length} Zusagen, an denen Sie uns messen können.`}
                id="points-title"
              />
              <div className="mt-10 hidden rounded-card bg-glacier p-6 lg:block" aria-live="polite">
                <p className="text-sm text-muted">Geprüft</p>
                <p className="mt-1 text-5xl font-semibold tracking-tight tabular-nums">
                  {done}
                  <span className="text-2xl text-muted"> / {guaranteePoints.length}</span>
                </p>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue to-fresh transition-[width] duration-700 ease-out"
                    style={{ width: `${(done / guaranteePoints.length) * 100}%` }}
                  />
                </div>
              </div>
              <RiskFreeSeal variant="card" className="mt-6" />
            </div>
          </div>
          <div className="lg:col-span-8">
            {/* Handy und Tablet: schlanke Fortschrittsleiste klebt unter der Kopfzeile, solange die Liste im Bild ist */}
            <div className="sticky top-[4.75rem] z-20 -mx-2 mb-5 lg:hidden" aria-hidden>
              <div className="glass rounded-2xl px-4 py-3 shadow-soft ring-1 ring-line">
                <div className="flex items-baseline justify-between text-sm">
                  <span className="font-semibold tabular-nums">
                    {done} von {guaranteePoints.length} geprüft
                  </span>
                  <span className="text-xs text-muted">Qualitätsgarantie</span>
                </div>
                <span className="mt-2 block h-1 overflow-hidden rounded-full bg-glacier-2">
                  <span
                    className="block h-full rounded-full bg-gradient-to-r from-blue to-fresh transition-[width] duration-700 ease-out"
                    style={{ width: `${(done / guaranteePoints.length) * 100}%` }}
                  />
                </span>
              </div>
            </div>
            <ol ref={list} className="space-y-4">
              {guaranteePoints.map((p, i) => {
                const on = i < done
                return (
                  <li
                    key={p.title}
                    className={cn(
                      'flex gap-4 rounded-card p-5 ring-1 transition-all duration-500 sm:gap-5 sm:p-8',
                      on ? 'bg-white shadow-soft ring-blue/20' : 'bg-white/60 ring-line',
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        'grid size-11 shrink-0 place-items-center rounded-full transition-all duration-500',
                        on ? 'scale-100 bg-blue text-white shadow-glow' : 'scale-90 bg-glacier text-transparent ring-1 ring-line',
                      )}
                    >
                      <Check className="size-5" strokeWidth={3} />
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-xl font-semibold tracking-tight">{p.title}</h3>
                      <p className="mt-2 leading-relaxed text-muted">
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

      <section className="on-dark relative overflow-hidden bg-ink py-24 text-white sm:py-32" aria-labelledby="complaint-title">
        <div aria-hidden className="absolute -top-40 -left-40 size-[34rem] rounded-full bg-blue/25 blur-[120px]" />
        <div className="container-site relative">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <SectionHeading
                eyebrow="Reklamation"
                title="Wenn etwas fehlt: ein Anruf genügt."
                id="complaint-title"
                text="Kein Formular, kein Ticketsystem, keine Diskussion über Zuständigkeiten. Drei Schritte, dann ist es erledigt."
              />
            </div>
            <div className="flex items-center gap-4 lg:col-span-4 lg:justify-end" data-reveal>
              <SealMark dark text="QUALITÄTSGARANTIE · KOSTENLOSE NACHREINIGUNG ·" className="size-28 shrink-0 sm:size-32" />
              <p className="max-w-[12rem] text-sm leading-relaxed text-white/70">Die Nachreinigung kostet Sie nichts. Ohne Wenn und Aber.</p>
            </div>
          </div>

          <ol ref={flow} className="relative mt-14 grid grid-cols-1 gap-5 md:grid-cols-3">
            <span aria-hidden className="absolute top-7 right-[16.66%] left-[16.66%] hidden h-px bg-white/10 md:block" />
            <span aria-hidden data-flow-line className="absolute top-7 right-[16.66%] left-[16.66%] hidden h-px origin-left bg-gradient-to-r from-fresh to-blue-on-dark md:block" />
            {complaintSteps.map((s, i) => {
              const Icon = [MessageSquareText, CalendarCheck, Sparkles][i] ?? Check
              return (
                <li key={s.title} data-flow-step className="flow-step relative flex gap-5 md:flex-col md:items-center md:text-center">
                  <span className="flow-dot relative z-10 grid size-14 shrink-0 place-items-center rounded-full bg-ink-2 text-white/60 ring-1 ring-white/15 transition-all duration-500">
                    <Icon aria-hidden className="size-6" />
                  </span>
                  <div className="flow-body flex-1 rounded-card bg-white/[0.04] p-6 ring-1 ring-white/10 transition-all duration-500 md:w-full">
                    <p className="text-xs font-semibold tracking-[0.12em] text-white/50 uppercase">Schritt {i + 1}</p>
                    <h3 className="mt-2 text-xl font-semibold">{s.title}</h3>
                    <p className="mt-2 leading-relaxed text-muted-dark">{s.text}</p>
                  </div>
                </li>
              )
            })}
          </ol>

          <div className="mt-12 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center" data-reveal>
            <span className="text-sm text-white/60">Melden Sie es direkt:</span>
            <a href={company.phone.href} className="inline-flex min-h-12 items-center gap-3 rounded-full bg-white px-5 font-semibold text-ink transition hover:bg-glacier">
              <Phone aria-hidden className="size-4 text-blue" />
              {company.phone.display}
            </a>
            <a
              href={`mailto:${company.email}`}
              className="inline-flex min-h-12 min-w-0 items-center gap-3 rounded-full px-5 font-semibold ring-1 ring-white/20 transition hover:bg-white/10"
            >
              <Mail aria-hidden className="size-4 shrink-0" />
              <span className="truncate">{company.email}</span>
            </a>
            {company.whatsapp.enabled && (
              <a
                href={`https://wa.me/${company.whatsapp.number}`}
                className="inline-flex min-h-12 items-center gap-3 rounded-full px-5 font-semibold ring-1 ring-white/20 transition hover:bg-white/10"
              >
                WhatsApp
              </a>
            )}
          </div>
        </div>
      </section>

      <section className="py-24 sm:py-32" aria-labelledby="qc-title">
        <div className="container-site grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
          <div data-reveal>
            <Picture id="team-briefing" sizes="(min-width:1024px) 50vw, 100vw" />
          </div>
          <div>
            <SectionHeading
              eyebrow="Qualitätskontrolle"
              title="Wir kontrollieren selbst. Bevor Sie es müssen."
              id="qc-title"
              text="Wir prüfen regelmäßig vor Ort, anhand einer Checkliste, die auf Ihr Leistungsverzeichnis abgestimmt ist. Auffälligkeiten besprechen wir direkt mit dem Team und, wenn nötig, mit Ihnen."
            />
            <p className="mt-4 text-sm text-muted" data-reveal>
              Die Kontrollen führt {company.founders[1]?.name ?? 'Ihr Ansprechpartner'} persönlich durch. Den Rhythmus legen wir gemeinsam mit Ihnen im Angebot fest.
            </p>
          </div>
        </div>
      </section>

      <FinalCta />
    </>
  )
}
