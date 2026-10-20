import { useEffect, useRef, useState } from 'react'
import { Check } from 'lucide-react'
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
import { ScrollTrigger } from '@/lib/gsap'
import { useReducedMotion } from '@/lib/env'
import { cn } from '@/lib/cn'

const trail = [
  { name: 'Start', path: '/' },
  { name: 'Qualitätsgarantie', path: '/qualitaetsgarantie' },
]

export default function Guarantee() {
  const reduced = useReducedMotion()
  const list = useRef<HTMLOListElement>(null)
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
        lead="Eine Garantie ist nur so gut wie ihr Ablauf im Alltag. Deshalb steht hier konkret, worauf Sie sich verlassen können."
        image="quality-check"
        actions={<QuoteButton size="lg" arrow />}
      />

      <section className="py-24 sm:py-32" aria-labelledby="points-title">
        <div className="container-site grid grid-cols-1 gap-14 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-32">
              <SectionHeading eyebrow="Unsere Prüfpunkte" title="Sieben Zusagen, die im Vertrag stehen." id="points-title" />
              <div className="mt-10 rounded-card bg-glacier p-6" aria-live="polite">
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
              <p className="mt-4 text-xs text-muted">
                Ob alle Punkte Vertragsbestandteil werden, bestätigen wir im Angebot schriftlich.
                <Todo title="Formulierung „im Vertrag“ bitte bestätigen">bitte bestätigen</Todo>
              </p>
            </div>
          </div>
          <ol ref={list} className="space-y-4 lg:col-span-8">
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
      </section>

      <section className="on-dark relative overflow-hidden bg-ink py-24 text-white sm:py-32" aria-labelledby="complaint-title">
        <div aria-hidden className="bg-grid-dark absolute inset-0" />
        <div className="container-site relative">
          <SectionHeading eyebrow="Reklamation" title="Wenn etwas nicht passt: vier Schritte, kein Papierkrieg." id="complaint-title" />
          <ol className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {complaintSteps.map((s, i) => (
              <li key={s.title} className="relative rounded-card bg-white/5 p-6 ring-1 ring-white/10" data-reveal>
                <span className="text-sm font-semibold text-fresh">0{i + 1}</span>
                <h3 className="mt-3 text-xl font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-dark">{s.text}</p>
              </li>
            ))}
          </ol>
          <p className="mt-10 max-w-2xl text-muted-dark" data-reveal>
            Ihr Ansprechpartner erreicht Sie unter{' '}
            <a href={company.phone.href} className="font-semibold text-white underline decoration-fresh/50 underline-offset-4">
              {company.phone.display}
            </a>{' '}
            oder per E-Mail an{' '}
            <a href={`mailto:${company.email}`} className="font-semibold text-white underline decoration-fresh/50 underline-offset-4">
              {company.email}
            </a>
            .
          </p>
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
