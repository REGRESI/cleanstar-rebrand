import { useEffect, useRef, useState } from 'react'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { processSteps } from '@/content/site'
import { ScrollTrigger } from '@/lib/gsap'
import { useIsDesktop, useReducedMotion } from '@/lib/env'
import { cn } from '@/lib/cn'

/**
 * Ablauf als horizontale Scroll-Timeline (Desktop, Sektion bleibt stehen).
 * Auf dem Handy und bei reduzierter Bewegung: vertikale Timeline.
 */
export function ProcessTimeline({ title = 'Vom ersten Anruf bis zur sauberen Routine.', eyebrow = 'So arbeiten wir zusammen' }: { title?: string; eyebrow?: string }) {
  const desktop = useIsDesktop()
  const reduced = useReducedMotion()
  const horizontal = desktop && !reduced
  const section = useRef<HTMLElement>(null)
  const track = useRef<HTMLOListElement>(null)
  const bar = useRef<HTMLDivElement>(null)
  const [dist, setDist] = useState(0)
  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    if (!horizontal || !track.current) return
    const measure = () => setDist(Math.max(0, track.current!.scrollWidth - window.innerWidth + 96))
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [horizontal])

  useEffect(() => {
    if (!horizontal || !section.current) return
    const st = ScrollTrigger.create({
      trigger: section.current,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (s) => {
        if (track.current) track.current.style.transform = `translate3d(${-s.progress * dist}px,0,0)`
        if (bar.current) bar.current.style.transform = `scaleX(${s.progress})`
        setActiveStep(Math.min(processSteps.length - 1, Math.floor(s.progress * processSteps.length * 0.999)))
      },
    })
    ScrollTrigger.refresh()
    return () => st.kill()
  }, [horizontal, dist])

  if (!horizontal) {
    return (
      <section className="py-24 sm:py-32" aria-labelledby="process-title">
        <div className="container-site">
          <SectionHeading eyebrow={eyebrow} title={title} id="process-title" />
          <ol className="relative mt-14 space-y-10 border-l border-line pl-8 sm:pl-10">
            {processSteps.map((s, i) => (
              <li key={s.title} className="relative" data-reveal>
                <span
                  aria-hidden
                  className="absolute top-0 -left-[calc(2rem+1px)] grid size-8 -translate-x-1/2 place-items-center rounded-full bg-blue text-sm font-semibold text-white ring-4 ring-white sm:-left-[calc(2.5rem+1px)]"
                >
                  {i + 1}
                </span>
                <p className="text-xs font-semibold tracking-[0.12em] text-fresh-ink uppercase">{s.duration}</p>
                <h3 className="mt-1 text-xl font-semibold tracking-tight">{s.title}</h3>
                <p className="mt-2 max-w-xl text-muted">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    )
  }

  return (
    <section ref={section} className="relative" style={{ height: `calc(100vh + ${dist}px)` }} aria-labelledby="process-title">
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <div className="container-site">
          <SectionHeading eyebrow={eyebrow} title={title} id="process-title" />
        </div>
        <div className="relative mt-16">
          <div aria-hidden className="absolute top-[1.375rem] right-0 left-0 h-px bg-line" />
          <div ref={bar} aria-hidden className="absolute top-[1.375rem] right-0 left-0 h-px origin-left scale-x-0 bg-gradient-to-r from-blue to-fresh" />
          <ol ref={track} className="flex gap-6 pr-12 pl-[max(3rem,calc((100vw-84rem)/2+3rem))] will-change-transform">
            {processSteps.map((s, i) => (
              <li key={s.title} className="w-[24rem] shrink-0">
                <span
                  aria-hidden
                  className={cn(
                    'relative z-10 grid size-11 place-items-center rounded-full text-sm font-semibold ring-8 ring-white transition-colors duration-500',
                    i <= activeStep ? 'bg-blue text-white' : 'bg-glacier text-muted',
                  )}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className={cn('mt-8 rounded-card p-8 ring-1 transition-all duration-500', i === activeStep ? 'bg-white shadow-lift ring-blue/20' : 'bg-white/60 ring-line')}>
                  <p className="text-xs font-semibold tracking-[0.12em] text-fresh-ink uppercase">{s.duration}</p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-tight">{s.title}</h3>
                  <p className="mt-3 leading-relaxed text-muted">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
