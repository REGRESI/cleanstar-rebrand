import { useEffect, useRef, useState } from 'react'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { AnimatedText } from '@/components/ui/AnimatedText'
import { home } from '@/content/site'
import { ScrollTrigger } from '@/lib/gsap'
import { prefersReducedMotion } from '@/lib/env'

interface Props {
  eyebrow?: string
  headline?: string
  lead?: string
  items?: { problem: string; solution: string }[]
  id?: string
}

/**
 * Eine Zeile: Erreicht sie den Blick, wischt eine helle Lichtkante von links über den Problem-Satz. Hinter ihr wird
 * der Satz blass und löst sich auf, eine Linie streicht ihn durch; gleichzeitig färbt sich rechts die Lösung mit der
 * Farbwelle ein. Am Ende bleibt das Problem sehr blass und durchgestrichen lesbar, die Lösung kräftig.
 * An die Scrollposition gekoppelt, Zeile für Zeile. Reduzierte Bewegung: Endzustand sofort.
 */
function Row({ i, problem, solution }: { i: number; problem: string; solution: string }) {
  const ref = useRef<HTMLLIElement>(null)
  const [go, setGo] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (prefersReducedMotion() || !document.documentElement.classList.contains('js-motion')) {
      el.style.setProperty('--w', '1')
      setGo(true)
      return
    }
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top 82%',
      end: 'top 42%',
      scrub: 0.4,
      onUpdate: (s) => {
        el.style.setProperty('--w', s.progress.toFixed(3))
        if (s.progress > 0.3) setGo(true)
      },
    })
    el.style.setProperty('--w', st.progress.toFixed(3))
    if (st.progress > 0.3) setGo(true)
    return () => st.kill()
  }, [])
  return (
    <li ref={ref} className="ps-row grid grid-cols-[2.5rem_1fr] gap-x-4 border-t border-line-dark py-8 sm:grid-cols-[4rem_1fr] lg:grid-cols-12 lg:gap-x-8 lg:py-10">
      <span className="t-label pt-1 lg:col-span-1">{String(i + 1).padStart(2, '0')}</span>
      <p className="ps-problem lg:col-span-5">
        <span className="sr-only">Vorher: </span>
        <span className="ps-problem-text">{problem}</span>
        <span aria-hidden className="ps-edge" />
      </p>
      <div className="col-start-2 mt-3 lg:col-span-6 lg:col-start-7 lg:mt-0">
        <span className="sr-only">Bei uns: </span>
        <AnimatedText as="p" text={solution} trigger={go} orphans={false} className="text-[1.25rem] leading-[1.35] font-medium tracking-[-0.015em] text-paper" />
      </div>
    </li>
  )
}

/**
 * „Das kennen Sie vielleicht“: Probleme und Lösungen als nummerierte Zeilen auf Navy, mit Wisch-Animation je Zeile.
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
        <ol className="mt-16 lg:mt-24">
          {items.map((it, i) => (
            <Row key={i} i={i} problem={it.problem} solution={it.solution} />
          ))}
        </ol>
      </div>
    </section>
  )
}
