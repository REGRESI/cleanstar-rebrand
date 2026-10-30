import { useEffect, useRef, useState } from 'react'
import { AnimatedText } from '@/components/ui/AnimatedText'
import { officeCheckpoints } from '@/features/hero/checkpoints'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { prefersReducedMotion } from '@/lib/env'
import { cn } from '@/lib/cn'
import { LineSwap, type LineSwapHandle } from './LineSwap'

/**
 * Prüfpunkt-Ansicht (Referenz: Terminal), Seite Büroreinigung: rechts steht ein festes Foto eines Arbeitsplatzes,
 * links eine nummerierte Liste aus dem Leistungsverzeichnis. Beim Scrollen wird das Foto zur Linienansicht (dasselbe
 * Linien-Modul wie im Hero), und der Punkt, der in der Liste gerade an der Reihe ist, leuchtet auf dem Plan auf.
 * Handy: Foto oben stehend, Liste darunter. Ohne Bewegung: Plan mit allen Punkten, Liste vollständig.
 */
export function CheckpointView() {
  const root = useRef<HTMLElement>(null)
  const swap = useRef<LineSwapHandle>(null)
  const [active, setActive] = useState(-1)
  const [still, setStill] = useState(false)

  useEffect(() => {
    const el = root.current
    if (!el) return
    if (prefersReducedMotion() || !document.documentElement.classList.contains('js-motion')) {
      swap.current?.set(1)
      setStill(true)
      return
    }
    const st = ScrollTrigger.create({
      trigger: el.querySelector('[data-list]'),
      start: 'top 70%',
      end: 'bottom 55%',
      scrub: 0.4,
      animation: gsap.to({}, { duration: 1 }),
      onUpdate: (s) => {
        swap.current?.set(Math.min(1, s.progress / 0.22))
        const n = officeCheckpoints.length
        setActive(s.progress < 0.18 ? -1 : Math.min(n - 1, Math.floor(((s.progress - 0.18) / 0.8) * n)))
      },
    })
    return () => st.kill()
  }, [])

  return (
    <section ref={root} className="section" aria-labelledby="checkpoints-title">
      <div className="container-site">
        <p className="t-label">Prüfpunkte</p>
        <AnimatedText as="h2" id="checkpoints-title" text="Jeder Arbeitsplatz, Punkt für Punkt." className="t-h2 mt-5 max-w-[18ch]" />
        <div className="mt-14 lg:mt-20 lg:grid lg:grid-cols-12 lg:gap-x-8">
          <div className="sticky top-16 z-10 -mx-5 bg-paper px-5 pt-2 pb-4 sm:mx-0 sm:px-0 lg:top-28 lg:col-span-7 lg:col-start-6 lg:row-start-1 lg:self-start lg:bg-transparent lg:p-0">
            <div>
              <div className="card-shadow relative aspect-video overflow-hidden rounded-[14px] bg-night">
                <picture>
                  <source media="(max-width: 767px)" srcSet="/images/buero-am-morgen-1024.webp" />
                  <img src="/images/buero-am-morgen-1600.webp" alt="Aufgeräumter Arbeitsplatz am Morgen: Schreibtisch, Stuhl, Papierkorb, Fensterfront" width={1600} height={900} loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover" />
                </picture>
                <LineSwap ref={swap} lines="/images/lines/buero-am-morgen-1600.webp" linesMobile="/images/lines/buero-am-morgen-1024.webp" width={1600} height={900} />
                <div aria-hidden className="absolute inset-0">
                  {officeCheckpoints.map((c, i) => (
                    <span
                      key={i}
                      data-on={still || i <= active || undefined}
                      data-done={still || i < active || undefined}
                      className={cn('cp absolute', c.x > 0.6 && 'cp-left', i === active && 'is-active')}
                      style={{ left: `${c.x * 100}%`, top: `${c.y * 100}%` }}
                    >
                      <span className="cp-dot">
                        <span className="cp-n">{i + 1}</span>
                        <svg viewBox="0 0 16 16" className="cp-check" aria-hidden>
                          <path d="M3.5 8.4 6.6 11.3 12.6 4.9" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <ol data-list className="mt-6 lg:col-span-4 lg:col-start-1 lg:row-start-1 lg:mt-0">
            {officeCheckpoints.map((c, i) => (
              <li key={i} className={cn('grid grid-cols-[2.5rem_1fr] gap-x-3 border-t border-line py-6 transition-colors duration-500 lg:py-9', !still && i !== active ? 'text-muted' : 'text-ink')}>
                <span className="font-medium tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                <span className="text-[1.125rem] leading-[1.35] font-medium tracking-[-0.01em] lg:text-[1.25rem]">{c.task}</span>
              </li>
            ))}
          </ol>
        </div>
        <p className="mt-8 max-w-[60ch] text-[0.9375rem] text-ink-2">Aus dem Muster-Leistungsverzeichnis für Arbeitsplätze. Im Angebot passen wir es an Ihr Objekt an.</p>
      </div>
    </section>
  )
}
