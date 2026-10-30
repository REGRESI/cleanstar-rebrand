import { useEffect, useRef, useState } from 'react'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { AnimatedText } from '@/components/ui/AnimatedText'
import { RevealText } from '@/components/ui/RevealText'
import { Sparkle } from '@/components/ui/Sparkle'
import { home, processSteps } from '@/content/site'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { prefersReducedMotion } from '@/lib/env'
import { cn } from '@/lib/cn'

type Step = { title: string; duration: string; text: string }
const pad = (v: number) => String(Math.round(v)).padStart(2, '0')

/**
 * Ablauf in zwei Varianten:
 * line: nummerierte Schritte an einer senkrechten Linie (Startseite, Seite „Ablauf“), scroll-gesteuert: Die Linie
 *       zeichnet sich von oben nach unten; erreicht sie einen Schritt, füllt sich dessen Nummernkästchen in Markenblau
 *       (weiße Zahl), der Glanz-Stern funkelt, der Titel kommt mit der Farbwelle, der Text blendet ein. Der aktuelle
 *       Schritt ist kräftig, durchlaufene bleiben gefüllt, kommende sind blass. Beim Hochscrollen alles rückwärts.
 *       Desktop: Überschrift links bleibt stehen, solange die Schritte durchlaufen.
 * rows: Raster mit großen Nummern (Partnerseite)
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
  if (variant === 'rows')
    return (
      <section className="section" aria-labelledby={id}>
        <div className="container-site">
          <SectionHeading layout="rail" eyebrow={eyebrow} title={title} id={id} />
          <Rows steps={steps} />
        </div>
      </section>
    )
  return (
    <section className="section" aria-labelledby={id}>
      <div className="container-site grid-site gap-y-14 lg:items-start">
        <div className="col-span-12 lg:sticky lg:top-32 lg:col-span-4">
          <p className="t-label">{eyebrow}</p>
          <RevealText as="h2" id={id} text={title} className="t-h2 mt-5 max-w-[16ch]" />
        </div>
        <Line steps={steps} />
      </div>
    </section>
  )
}

function Line({ steps }: { steps: Step[] }) {
  const list = useRef<HTMLOListElement>(null)
  const bar = useRef<HTMLSpanElement>(null)
  // Index des zuletzt erreichten Schritts (-1: keiner); ohne Bewegung alle erreicht
  const [at, setAt] = useState(-1)
  const [still, setStill] = useState(false)

  useEffect(() => {
    const ol = list.current
    if (!ol) return
    if (prefersReducedMotion() || !document.documentElement.classList.contains('js-motion')) {
      setStill(true)
      setAt(steps.length - 1)
      return
    }
    const boxes = Array.from(ol.querySelectorAll<HTMLElement>('[data-box]'))
    const apply = (p: number) => {
      const h = ol.offsetHeight
      const tip = p * h
      if (bar.current) bar.current.style.transform = `scaleY(${p.toFixed(4)})`
      // erreicht, sobald die Spitze der Linie die Mitte des Kästchens passiert
      let k = -1
      boxes.forEach((b, i) => {
        if (tip >= b.offsetTop + b.offsetHeight / 2 - 1) k = i
      })
      setAt(k)
    }
    const st = ScrollTrigger.create({
      trigger: ol,
      start: 'top 62%',
      end: 'bottom 62%',
      scrub: 0.4,
      animation: gsap.to({}, { duration: 1 }),
      onUpdate: (s) => apply(s.progress),
      onRefresh: (s) => apply(s.progress),
    })
    apply(st.progress)
    return () => st.kill()
  }, [steps.length])

  return (
    <ol ref={list} className="steps relative col-span-12 lg:col-span-7 lg:col-start-6">
      <span aria-hidden className="steps-rail">
        <span ref={bar} className="steps-bar" style={still ? { transform: 'scaleY(1)' } : undefined} />
      </span>
      {steps.map((s, i) => {
        const state = i > at ? 'next' : i === at ? 'now' : 'past'
        return (
          <li key={s.title} data-state={state} className="step relative grid grid-cols-[2.5rem_1fr] gap-x-5 pb-12 last:pb-0 sm:grid-cols-[3.4rem_1fr] sm:gap-x-8 sm:pb-16">
            <span data-box className="step-box relative z-10 grid size-[2.3rem] place-items-center font-medium tabular-nums text-[0.9375rem] sm:size-[3.2rem] sm:text-[1.125rem]">
              {pad(i + 1)}
              <Sparkle play={i <= at && !still} className="absolute -top-2 -right-2 size-4 sm:size-5" />
            </span>
            <div className="pt-1 sm:pt-2.5">
              <p className="step-meta t-meta">{s.duration}</p>
              <AnimatedText as="h3" text={s.title} trigger={still || i <= at} orphans={false} className={cn('step-title at-soft mt-2 text-[1.5rem] leading-[1.2] font-medium tracking-[-0.02em] sm:text-[1.75rem]')} />
              <p className="step-text measure mt-3 text-ink-2">{s.text}</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

function Rows({ steps }: { steps: Step[] }) {
  return (
    <ol className="mt-16 border-b border-line lg:mt-24">
      {steps.map((s, i) => (
        <li key={s.title} className="relative grid grid-cols-1 gap-x-8 gap-y-2 border-t border-line py-7 lg:grid-cols-12 lg:py-9">
          <p className="font-medium tabular-nums text-[2.25rem] leading-none tracking-[-0.04em] text-ink lg:col-span-2 lg:text-[3rem]">{pad(i + 1)}</p>
          <div className="lg:col-span-4">
            <p className="t-meta">{s.duration}</p>
            <h3 className="mt-2 text-[1.375rem] leading-[1.2] font-medium tracking-[-0.02em] sm:text-[1.5rem]">{s.title}</h3>
          </div>
          <p className="measure text-ink-2 lg:col-span-5 lg:col-start-8 lg:pt-6">{s.text}</p>
        </li>
      ))}
    </ol>
  )
}
