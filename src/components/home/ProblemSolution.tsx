import { Fragment, useEffect, useRef, useState } from 'react'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Sparkle } from '@/components/ui/Sparkle'
import { Letters } from '@/components/ui/ScrubText'
import { home } from '@/content/site'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { paintLetters, span } from '@/lib/scrollScene'
import { prefersReducedMotion } from '@/lib/env'

interface Props {
  eyebrow?: string
  headline?: string
  lead?: string
  items?: { problem: string; solution: string }[]
  id?: string
}

/** Text als Wörter aus einzelnen Buchstaben; Wörter brechen nie in sich um */
function Words({ text, cls }: { text: string; cls: string }) {
  return (
    <span aria-hidden>
      {text.split(' ').map((w, i) => (
        <Fragment key={i}>
          {i > 0 && ' '}
          <span className="whitespace-nowrap">
            <Letters text={w} className={cls} ghost />
          </span>
        </Fragment>
      ))}
    </span>
  )
}

/**
 * Eine Zeile: Erreicht sie die Bildschirmmitte, wird das Problem Buchstabe für Buchstabe „weggewischt“ (blasst aus,
 * die Durchstreichung läuft mit), danach färbt sich die Lösung im Färbeeffekt ein; zum Schluss blitzt einmal der
 * Glanz-Stern. An die Scrollposition gekoppelt, Zeile für Zeile nacheinander.
 */
function Row({ i, problem, solution }: { i: number; problem: string; solution: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [done, setDone] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion() || !document.documentElement.classList.contains('js-motion')) return
    const wipe = Array.from(el.querySelectorAll<HTMLElement>('.wipe-l'))
    const sol = Array.from(el.querySelectorAll<HTMLElement>('.sol-l'))
    const a = new Float32Array(wipe.length).fill(-1)
    const b = new Float32Array(sol.length).fill(-1)
    let fired = false
    const apply = (t: number) => {
      // erste Hälfte: Problem wischt weg (--w), zweite Hälfte: Lösung färbt sich (--p)
      const x = span(t, 0, 0.55) * (wipe.length + 8)
      wipe.forEach((l, k) => {
        const w = Math.max(0, Math.min(1, (x - k) / 8))
        if (Math.abs(w - a[k]) > 0.002 || (w === 1 && a[k] !== 1) || (w === 0 && a[k] !== 0)) {
          a[k] = w
          l.style.setProperty('--w', w.toFixed(3))
        }
      })
      paintLetters(sol, span(t, 0.4, 1), b)
      if (!fired && b[sol.length - 1] >= 1) {
        fired = true
        setDone(true)
      }
    }
    apply(0)
    const st = ScrollTrigger.create({ trigger: el, start: 'top 78%', end: 'top 34%', scrub: 0.5, animation: gsap.to({}, { duration: 1 }), onUpdate: (s) => apply(s.progress) })
    apply(st.progress)
    return () => st.kill()
  }, [])

  return (
    <li className="relative border-t border-line-dark">
      <div ref={ref} className="grid-site gap-y-3 py-8 sm:py-10">
        <p className="t-label col-span-12 lg:col-span-3 lg:pt-1.5">{String(i + 1).padStart(2, '0')}</p>
        <div className="col-span-12 lg:col-span-8">
          <p className="text-lg text-muted-dark sm:text-xl">
            <span className="sr-only">Problem: „{problem}“</span>
            <Words text={`„${problem}“`} cls="wipe-l" />
          </p>
          <p className="mt-3 text-[1.5rem] leading-[1.2] font-medium tracking-[-0.022em] text-paper sm:text-[1.875rem]">
            <span className="sr-only">Bei uns: {solution}</span>
            <Words text={solution} cls="sol-l scrub-l" />
            <span aria-hidden className="relative inline-block w-0">
              <Sparkle play={done} className="absolute bottom-[0.2em] left-[0.3em] size-[0.62em]" />
            </span>
          </p>
        </div>
      </div>
    </li>
  )
}

/**
 * Probleme und Lösungen als nummerierte Zeilen mit Haarlinien auf dunklem Grund. Ohne Karten, ohne Icons.
 * Ohne Bewegung: Problem durchgestrichen, Lösung in voller Farbe.
 */
export function ProblemSolution({
  eyebrow = home.problems.eyebrow,
  headline = home.problems.headline,
  lead = home.problems.lead,
  items = home.problems.items,
  id = 'problems-title',
}: Props) {
  return (
    <section className="on-dark section bg-night text-paper" aria-labelledby={id}>
      <div className="container-site">
        <SectionHeading layout="split" eyebrow={eyebrow} title={headline} text={lead} id={id} />
        <ol className="mt-16 border-b border-line-dark lg:mt-24">
          {items.map((it, i) => (
            <Row key={i} i={i} problem={it.problem} solution={it.solution} />
          ))}
        </ol>
      </div>
    </section>
  )
}
