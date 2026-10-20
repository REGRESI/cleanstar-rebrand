import { useEffect, useRef } from 'react'
import { Check, X } from 'lucide-react'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { home } from '@/content/site'
import { gsap } from '@/lib/gsap'
import { prefersReducedMotion } from '@/lib/env'

interface Props {
  eyebrow?: string
  headline?: string
  lead?: string
  items?: { problem: string; solution: string }[]
  id?: string
}

/**
 * Probleme werden „weggewischt“: Sobald eine Karte ins Bild kommt, wird das Problem durchgestrichen,
 * ein Abzieher fährt über die Karte und legt die Lösung frei, der Haken springt auf.
 * Die Animation läuft einmal pro Karte und hängt nicht von der Scrollgeschwindigkeit ab.
 * Ohne Bewegung (reduzierte Bewegung, kein JavaScript): Endzustand sofort sichtbar.
 */
export function ProblemSolution({
  eyebrow = home.problems.eyebrow,
  headline = home.problems.headline,
  lead = home.problems.lead,
  items = home.problems.items,
  id = 'problems-title',
}: Props) {
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!root.current || prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-wipe]').forEach((card) => {
        const q = (s: string) => card.querySelector<HTMLElement>(s)
        const cover = q('[data-cover]')
        const strike = q('[data-strike]')
        const squeegee = q('[data-squeegee]')
        const solution = q('[data-solution-text]')
        const check = q('[data-check]')
        const label = q('[data-label]')
        if (!cover || !strike || !squeegee || !solution || !check || !label) return
        gsap.set(card, { '--wipe': '0%' })
        gsap.set(strike, { '--strike': '0%' })
        gsap.set(solution, { clipPath: 'inset(0 100% 0 0)' })
        gsap.set(check, { scale: 0, rotate: -30 })
        gsap.set(label, { opacity: 0 })
        const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' }, scrollTrigger: { trigger: card, start: 'top 78%', toggleActions: 'play none none none' } })
        tl.to(strike, { '--strike': '100%', duration: 0.5, ease: 'power2.out' })
          .to(strike, { color: 'rgb(15 23 42 / 0.45)', duration: 0.3 }, '<0.25')
          .set(squeegee, { opacity: 1 })
          .to(card, { '--wipe': '100%', duration: 0.85 })
          .to(solution, { clipPath: 'inset(0 0% 0 0)', duration: 0.85 }, '<')
          .to(squeegee, { opacity: 0, duration: 0.2 }, '>-0.1')
          .to(check, { scale: 1, rotate: 0, duration: 0.5, ease: 'back.out(2.4)' }, '<-0.2')
          .to(label, { opacity: 1, duration: 0.4 }, '<')
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
        <div ref={root} className="space-y-4 lg:col-span-7">
          {items.map((it, i) => (
            <article key={i} data-wipe className="wipe-card relative isolate overflow-hidden rounded-card bg-white shadow-soft ring-1 ring-line">
              {/* Lösung (Endzustand) */}
              <div className="flex items-start gap-4 p-6 sm:p-7">
                <span data-check aria-hidden className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-full bg-fresh/15 text-fresh-ink">
                  <Check className="size-5" strokeWidth={2.75} />
                </span>
                <div className="min-w-0">
                  <p data-label className="text-sm text-muted line-through decoration-ink/25">
                    {it.problem}
                  </p>
                  <p data-solution-text className="mt-1.5 text-lg leading-snug font-medium text-ink sm:text-xl">
                    {it.solution}
                  </p>
                </div>
              </div>

              {/* Problem: liegt darüber und wird nach rechts weggewischt */}
              <div data-cover aria-hidden className="wipe-overlay absolute inset-0 items-center gap-4 bg-[#eef0f3] p-6 sm:p-7">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-ink/8 text-ink/50">
                  <X className="size-5" strokeWidth={2.5} />
                </span>
                <p className="text-lg font-medium text-ink/75 sm:text-xl">
                  <span data-strike className="strike-text">
                    „{it.problem}“
                  </span>
                </p>
              </div>

              {/* Abzieher: helle Kante mit Glanz, fährt mit der Wischkante */}
              <div data-squeegee aria-hidden className="wipe-squeegee pointer-events-none absolute inset-y-0 w-16 opacity-0" />
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
