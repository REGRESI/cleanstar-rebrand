import { useEffect, useRef } from 'react'
import { Check, X } from 'lucide-react'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { home } from '@/content/site'
import { gsap } from '@/lib/gsap'
import { prefersReducedMotion } from '@/lib/env'

/**
 * Probleme werden beim Scrollen „weggewischt“: Eine Abzieher-Kante fährt über die Karte
 * und legt die Lösung frei.
 */
interface Props {
  eyebrow?: string
  headline?: string
  lead?: string
  items?: { problem: string; solution: string }[]
  id?: string
}

export function ProblemSolution({
  eyebrow = home.problems.eyebrow,
  headline = home.problems.headline,
  lead = 'Wir haben unsere Abläufe so gebaut, dass diese Probleme gar nicht erst entstehen.',
  items = home.problems.items,
  id = 'problems-title',
}: Props) {
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!root.current || prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-wipe]').forEach((card) => {
        const problem = card.querySelector<HTMLElement>('[data-problem]')
        const bar = card.querySelector<HTMLElement>('[data-bar]')
        const sol = card.querySelector<HTMLElement>('[data-solution]')
        if (!problem || !bar || !sol) return
        gsap.set(problem, { clipPath: 'inset(0 0 0 0%)' })
        gsap.set(sol, { opacity: 0.25 })
        const tl = gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 72%', end: 'top 30%', scrub: 0.6 } })
        tl.to(problem, { clipPath: 'inset(0 0 0 100%)', ease: 'none' }, 0)
          .fromTo(bar, { left: '0%', opacity: 1 }, { left: '100%', ease: 'none' }, 0)
          .to(bar, { opacity: 0, duration: 0.05 }, 0.95)
          .to(sol, { opacity: 1, ease: 'none', duration: 0.6 }, 0.2)
      })
    }, root)
    return () => ctx.revert()
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
          </div>
        </div>
        <div ref={root} className="space-y-5 lg:col-span-7">
          {items.map((it, i) => (
            <article key={i} data-wipe className="relative isolate overflow-hidden rounded-card bg-white shadow-soft ring-1 ring-line">
              {/* Lösung (darunter) */}
              <div data-solution className="grid gap-3 p-6 sm:p-8">
                <span className="text-sm text-muted line-through decoration-ink/30">{it.problem}</span>
                <div className="flex items-start gap-4">
                  <span aria-hidden className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-fresh/15 text-fresh-ink">
                    <Check className="size-5" strokeWidth={2.5} />
                  </span>
                  <p className="text-lg font-medium text-ink sm:text-xl">{it.solution}</p>
                </div>
              </div>
              {/* Problem (oben, wird weggewischt) */}
              <div data-problem aria-hidden className="wipe-overlay absolute inset-0 items-center gap-4 bg-[#eceef1] p-6 sm:p-8">
                <div
                  className="absolute inset-0 opacity-60 mix-blend-multiply"
                  style={{ backgroundImage: 'radial-gradient(rgb(120 110 95 / .25) 1px, transparent 1.4px)', backgroundSize: '7px 7px' }}
                />
                <span className="relative grid size-9 shrink-0 place-items-center rounded-full bg-ink/10 text-ink/60">
                  <X className="size-5" strokeWidth={2.5} />
                </span>
                <p className="relative text-lg font-medium text-ink/70 sm:text-xl">„{it.problem}“</p>
              </div>
              {/* Abzieher-Kante */}
              <div data-bar aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-1 -translate-x-1/2 opacity-0">
                <div className="h-full w-full rounded-full bg-gradient-to-b from-fresh via-blue to-fresh shadow-[0_0_24px_6px_rgb(45_212_191/0.45)]" />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
