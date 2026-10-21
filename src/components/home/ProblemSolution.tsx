import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ClipboardCheck } from 'lucide-react'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { home } from '@/content/site'
import { prefersReducedMotion } from '@/lib/env'

interface Props {
  eyebrow?: string
  headline?: string
  lead?: string
  items?: { problem: string; solution: string }[]
  id?: string
  /** Link zum Reinigungs-Check zeigen */
  checkLink?: boolean
}

/**
 * Probleme und Lösungen: Kommt eine Karte ins Bild (auf dem Handy etwa in der Bildschirmmitte), wird das Problem
 * durchgestrichen, die Lösung blendet ein, der Haken zeichnet sich und die Karte wird weiß mit feinem blauen Rand.
 * Mehrere Karten gleichzeitig: gestaffelt nacheinander. Ohne Bewegung: Endzustand sofort (siehe .ps-card in index.css).
 */
export function ProblemSolution({
  eyebrow = home.problems.eyebrow,
  headline = home.problems.headline,
  lead = home.problems.lead,
  items = home.problems.items,
  id = 'problems-title',
  checkLink = false,
}: Props) {
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const cards = Array.from(root.current?.querySelectorAll<HTMLElement>('.ps-card') ?? [])
    if (!cards.length) return
    if (prefersReducedMotion() || typeof IntersectionObserver === 'undefined') {
      cards.forEach((c) => c.classList.add('is-solved'))
      return
    }
    const mobile = window.matchMedia('(max-width: 767px)').matches
    const timers: number[] = []
    const io = new IntersectionObserver(
      (entries) => {
        entries
          .filter((e) => e.isIntersecting)
          .forEach((e, i) => {
            io.unobserve(e.target)
            timers.push(window.setTimeout(() => e.target.classList.add('is-solved'), i * 280))
          })
      },
      // Handy: erst wenn die Karte die Bildschirmmitte erreicht; Desktop: etwas früher
      { rootMargin: mobile ? '0px 0px -45% 0px' : '0px 0px -18% 0px' },
    )
    cards.forEach((c) => io.observe(c))
    return () => {
      io.disconnect()
      timers.forEach((t) => window.clearTimeout(t))
    }
  }, [])

  return (
    <section className="relative py-24 sm:py-32" aria-labelledby={id}>
      <div className="container-site grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-32">
            <SectionHeading eyebrow={eyebrow} title={headline} id={id} />
            <p className="lead mt-6" data-reveal>
              {lead}
            </p>
            {checkLink && (
              <Link
                to="/reinigungs-check"
                className="group mt-8 flex items-center gap-4 rounded-card bg-glacier p-5 ring-1 ring-transparent transition hover:ring-blue/30"
                data-reveal
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-white text-blue shadow-soft">
                  <ClipboardCheck aria-hidden className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-ink">Wie gut ist Ihre aktuelle Reinigung?</span>
                  <span className="block text-sm text-muted">8 Fragen, 2 Minuten. Mit ehrlicher Auswertung.</span>
                </span>
                <ArrowRight aria-hidden className="size-5 shrink-0 text-blue transition-transform group-hover:translate-x-1" />
              </Link>
            )}
          </div>
        </div>
        <div ref={root} className="space-y-4 lg:col-span-7">
          {items.map((it, i) => (
            <article key={i} className="ps-card flex items-start gap-4 rounded-card p-6 sm:gap-5 sm:p-7">
              <span aria-hidden className="ps-icon mt-0.5 grid size-10 shrink-0 place-items-center rounded-full text-fresh-ink">
                <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round">
                  <path className="ps-check" d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
              </span>
              <div className="min-w-0">
                <p className="text-base sm:text-lg">
                  <span className="sr-only">Problem: </span>
                  <span className="ps-strike">„{it.problem}“</span>
                </p>
                <p className="ps-solution mt-2 text-lg leading-snug font-medium text-ink sm:text-xl">
                  <span className="sr-only">Bei uns: </span>
                  {it.solution}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
