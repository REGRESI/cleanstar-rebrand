import { useEffect, useRef, type CSSProperties } from 'react'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { ScrubText } from '@/components/ui/ScrubText'
import { CountUp } from '@/components/ui/CountUp'
import { home, processSteps } from '@/content/site'
import { gsap } from '@/lib/gsap'
import { prefersReducedMotion } from '@/lib/env'
import { cn } from '@/lib/cn'

type Step = { title: string; duration: string; text: string }
const pad = (v: number) => String(Math.round(v)).padStart(2, '0')

/**
 * Ablauf in zwei Varianten:
 * line: senkrechte Linie, die sich beim Scrollen zeichnet; je Schritt zählt die Nummer hoch, der Titel färbt sich
 *       Buchstabe für Buchstabe, die kurze Beschreibung blendet danach ein (Seite „Ablauf“).
 * rows: Raster, dessen Zeilen sich nacheinander von links aufdecken (Partnerseite).
 * Ohne Bewegung: alles sofort sichtbar.
 */
export function ProcessTimeline({
  title = home.process.headline,
  eyebrow = home.process.eyebrow,
  steps = processSteps,
  id = 'process-title',
  variant = 'line',
}: {
  title?: string
  eyebrow?: string
  steps?: Step[]
  id?: string
  variant?: 'line' | 'rows'
}) {
  return (
    <section className="section" aria-labelledby={id}>
      <div className="container-site">
        <SectionHeading layout="rail" eyebrow={eyebrow} title={title} id={id} />
        {variant === 'line' ? <Line steps={steps} /> : <Rows steps={steps} />}
      </div>
    </section>
  )
}

function Line({ steps }: { steps: Step[] }) {
  const list = useRef<HTMLOListElement>(null)
  useEffect(() => {
    const el = list.current
    if (!el || prefersReducedMotion() || !document.documentElement.classList.contains('js-motion')) return
    const ctx = gsap.context(() => {
      gsap.fromTo('[data-line]', { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top 70%', end: 'bottom 60%', scrub: 0.5 } })
    }, el)
    return () => ctx.revert()
  }, [])
  return (
    <div className="grid-site mt-16 lg:mt-24">
      <ol ref={list} className="relative col-span-12 lg:col-span-9 lg:col-start-4">
        <span aria-hidden className="absolute top-2 bottom-2 left-[1.15rem] w-px bg-line sm:left-[1.6rem]" />
        <span aria-hidden data-line className="absolute top-2 bottom-2 left-[1.15rem] w-px origin-top bg-blue sm:left-[1.6rem]" />
        {steps.map((s, i) => (
          <li key={s.title} className="relative grid grid-cols-[2.5rem_1fr] gap-x-5 pb-12 last:pb-0 sm:grid-cols-[3.4rem_1fr] sm:gap-x-8 sm:pb-16">
            <span className="relative z-10 grid size-[2.3rem] place-items-center bg-paper font-medium tabular-nums text-[0.9375rem] text-ink ring-1 ring-line sm:size-[3.2rem] sm:text-[1.125rem]">
              <CountUp value={i + 1} duration={900} format={pad} />
            </span>
            <div className="pt-1 sm:pt-2.5">
              <p className="t-meta">{s.duration}</p>
              <ScrubText as="h3" text={s.title} start="top 85%" end="top 60%" className="mt-2 text-[1.5rem] leading-[1.2] font-medium tracking-[-0.02em] sm:text-[1.75rem]" />
              <p className="measure mt-3 text-ink-2" data-reveal>
                {s.text}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}

function Rows({ steps }: { steps: Step[] }) {
  return (
    <ol className="mt-16 border-b border-line lg:mt-24">
      {steps.map((s, i) => (
        <li
          key={s.title}
          className="row-reveal relative grid grid-cols-1 gap-x-8 gap-y-2 border-t border-line py-7 lg:grid-cols-12 lg:py-9"
          data-reveal
          style={{ '--i': i % 3 } as CSSProperties}
        >
          <p className="font-medium tabular-nums text-[2.25rem] leading-none tracking-[-0.04em] text-blue lg:col-span-2 lg:text-[3rem]">{pad(i + 1)}</p>
          <div className="lg:col-span-4">
            <p className="t-meta">{s.duration}</p>
            <h3 className="mt-2 text-[1.375rem] leading-[1.2] font-medium tracking-[-0.02em] sm:text-[1.5rem]">{s.title}</h3>
          </div>
          <p className={cn('measure text-ink-2 lg:col-span-5 lg:col-start-8 lg:pt-6')}>{s.text}</p>
          {/* Abdeckung in Flächenfarbe, die beim Einblenden nach rechts abfährt (nur transform) */}
          <span aria-hidden className="row-mask" />
        </li>
      ))}
    </ol>
  )
}
