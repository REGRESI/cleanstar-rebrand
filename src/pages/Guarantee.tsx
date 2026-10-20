import { useEffect, useRef, useState } from 'react'
import { CalendarCheck, Check, Mail, MessageSquareText, Phone, SearchCheck, Sparkles } from 'lucide-react'
import { Seo } from '@/components/ui/Seo'
import { PageHero } from '@/components/ui/PageHero'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Picture } from '@/components/ui/Picture'
import { Fact, Todo } from '@/components/ui/Todo'
import { FinalCta } from '@/components/home/FinalCta'
import { QuoteButton } from '@/features/configurator/QuoteLink'
import { guaranteePoints, complaintSteps } from '@/content/site'
import { company } from '@/content/company'
import { breadcrumbSchema } from '@/lib/schema'
import { gsap, ScrollTrigger } from '@/lib/gsap'
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
      gsap.fromTo('[data-flow-line]', { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: flow.current, start: 'top 70%', end: 'bottom 60%', scrub: 0.5 } })
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
              <SectionHeading eyebrow="Unsere Prüfpunkte" title="Sieben Zusagen, an denen Sie uns messen können." id="points-title" />
              <div className="mt-10 hidden rounded-card bg-glacier p-6 lg:block" aria-live="polite">
                <p className="text-sm text-muted">Abgehakt</p>
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
            </div>
          </div>
          <div className="lg:col-span-8">
            {/* Handy und Tablet: Zähler bleibt beim Scrollen unter der Kopfzeile sichtbar */}
            <div className="sticky top-[4.5rem] z-20 mb-4 lg:hidden" aria-hidden>
              <div className="glass flex items-center gap-4 rounded-full px-5 py-3 shadow-soft ring-1 ring-line">
                <span className="text-sm font-semibold whitespace-nowrap tabular-nums">
                  {done} / {guaranteePoints.length} abgehakt
                </span>
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-glacier-2">
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
                    className={cn('flex gap-5 rounded-card p-6 ring-1 transition-all duration-500 sm:p-8', on ? 'bg-white shadow-soft ring-blue/20' : 'bg-white/60 ring-line')}
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
                    <div>
                      <h3 className="text-xl font-semibold tracking-tight">{p.title}</h3>
                      <p className="mt-2 leading-relaxed text-muted">
                        {p.usesComplaintPeriod ? (
                          <>
                            Passt etwas nicht, melden Sie es Ihrem Ansprechpartner. Wir reinigen kostenlos nach, innerhalb von{' '}
                            <strong className="text-ink">
                              <Fact value={company.complaintPeriod} fallback="der vereinbarten Frist" todo="Reklamationsfrist in company.ts (complaintPeriod) eintragen" />
                            </strong>
                            .
                          </>
                        ) : (
                          p.text
                        )}
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
        <div className="container-site relative grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-32">
              <SectionHeading
                eyebrow="Reklamation"
                title="Wenn etwas fehlt: ein Anruf genügt."
                id="complaint-title"
                text="Kein Formular, kein Ticketsystem, keine Diskussion über Zuständigkeiten. Sie sagen Bescheid, wir kümmern uns. So läuft es ab."
              />
              <div className="mt-10 rounded-panel bg-white/5 p-6 ring-1 ring-white/10 sm:p-7" data-reveal>
                <p className="text-sm text-muted-dark">Ihr direkter Draht</p>
                <a href={company.phone.href} className="mt-3 flex items-center gap-4 rounded-2xl bg-white px-5 py-4 text-ink transition hover:bg-glacier">
                  <span className="grid size-10 place-items-center rounded-full bg-blue text-white">
                    <Phone aria-hidden className="size-5" />
                  </span>
                  <span>
                    <span className="block text-xs text-muted">Anrufen</span>
                    <span className="block text-lg font-semibold">{company.phone.display}</span>
                  </span>
                </a>
                <a href={`mailto:${company.email}`} className="mt-3 flex items-center gap-4 rounded-2xl px-5 py-4 ring-1 ring-white/15 transition hover:bg-white/5">
                  <span className="grid size-10 place-items-center rounded-full bg-white/10">
                    <Mail aria-hidden className="size-5 text-white" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs text-muted-dark">E-Mail</span>
                    <span className="block truncate font-semibold">{company.email}</span>
                  </span>
                </a>
              </div>
            </div>
          </div>
          <ol ref={flow} className="relative lg:col-span-7">
            <span aria-hidden className="absolute top-6 bottom-6 left-6 w-px bg-white/10" />
            <span aria-hidden data-flow-line className="absolute top-6 bottom-6 left-6 w-px origin-top bg-gradient-to-b from-fresh to-blue-on-dark" />
            {complaintSteps.map((s, i) => {
              const Icon = [MessageSquareText, CalendarCheck, Sparkles, SearchCheck][i] ?? Check
              return (
                <li key={s.title} data-flow-step className="flow-step relative flex gap-6 pb-10 last:pb-0">
                  <span className="flow-dot relative z-10 grid size-12 shrink-0 place-items-center rounded-full bg-ink-2 text-white/60 ring-1 ring-white/15 transition-all duration-500">
                    <Icon aria-hidden className="size-5" />
                  </span>
                  <div className="flow-body flex-1 rounded-card bg-white/[0.04] p-6 ring-1 ring-white/10 transition-all duration-500">
                    <p className="text-xs font-semibold tracking-[0.12em] text-white/50 uppercase">Schritt {i + 1}</p>
                    <h3 className="mt-2 text-xl font-semibold">{s.title}</h3>
                    <p className="mt-2 leading-relaxed text-muted-dark">{s.text}</p>
                  </div>
                </li>
              )
            })}
          </ol>
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
              text="Die Objektleitung prüft regelmäßig vor Ort, anhand einer Checkliste, die auf Ihr Leistungsverzeichnis abgestimmt ist. Auffälligkeiten besprechen wir direkt mit dem Team und, wenn nötig, mit Ihnen."
            />
            <p className="mt-4 text-sm text-muted" data-reveal>
              Rhythmus der Kontrollen: <Fact value={null} fallback="nach Vereinbarung" todo="Kontrollrhythmus festlegen, z. B. monatlich" />
            </p>
          </div>
        </div>
      </section>

      <FinalCta />
    </>
  )
}
