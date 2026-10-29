import { useEffect, useRef } from 'react'
import { noOrphan } from '@/lib/format'
import { Seo } from '@/components/ui/Seo'
import { PageHero } from '@/components/ui/PageHero'
import { Answer } from '@/components/ui/Answer'
import { ImageBand } from '@/components/ui/ImageBand'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Picture } from '@/components/ui/Picture'
import { FinalCta } from '@/components/home/FinalCta'
import { QuoteButton } from '@/features/configurator/QuoteLink'
import { RevealText } from '@/components/ui/RevealText'
import { complaintSteps } from '@/content/site'
import { GuaranteeChecks } from '@/components/scenes/GuaranteeChecks'
import { company } from '@/content/company'
import { breadcrumbSchema } from '@/lib/schema'
import { gsap } from '@/lib/gsap'
import { useReducedMotion } from '@/lib/env'
import { CallbackButton } from '@/features/callback/Callback'

const trail = [
  { name: 'Startseite', path: '/' },
  { name: 'Qualitätsgarantie', path: '/qualitaetsgarantie' },
]

const pad = (n: number) => String(n).padStart(2, '0')

export default function Guarantee() {
  const reduced = useReducedMotion()
  const flow = useRef<HTMLOListElement>(null)

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
        actions={<QuoteButton size="lg" arrow />}
      />

      <GuaranteeChecks />

      <ImageBand id="after-office" />

      <section className="on-dark section bg-night text-paper" aria-labelledby="complaint-title">
        <div className="container-site">
          <SectionHeading
            scrub
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
            <Picture id="team-briefing" ratio="4:5" reveal sizes="(min-width:1024px) 40vw, 100vw" />
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
        eine Person, die Sie direkt erreichen, und Vertretung, wenn jemand aus dem Team ausfällt.
      </Answer>
      <FinalCta />
    </>
  )
}
