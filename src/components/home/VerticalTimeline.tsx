import { useEffect, useRef, useState } from 'react'
import { ScrollTrigger } from '@/lib/gsap'
import { useReducedMotion } from '@/lib/env'
import { cn } from '@/lib/cn'

/**
 * Ablauf als vertikale Timeline (Handy und Tablet): Linie links füllt sich beim Scrollen,
 * Schritte erscheinen nacheinander, der aktuelle Schritt ist hervorgehoben.
 * Ohne Bewegung bzw. ohne JavaScript: alle Schritte sichtbar, Linie voll.
 */
export function VerticalTimeline({ steps }: { steps: { title: string; duration: string; text: string }[] }) {
  const reduced = useReducedMotion()
  const list = useRef<HTMLOListElement>(null)
  const fill = useRef<HTMLSpanElement>(null)
  // -1 = noch nicht gestartet bzw. ohne Bewegung (alles sichtbar)
  const [active, setActive] = useState(-1)
  const [live, setLive] = useState(false)

  useEffect(() => {
    if (reduced || !list.current) {
      setLive(false)
      return
    }
    const ol = list.current
    const items = Array.from(ol.querySelectorAll<HTMLElement>('[data-step]'))
    setLive(true)
    const st = ScrollTrigger.create({
      trigger: ol,
      start: 'top 65%',
      end: 'bottom 65%',
      onUpdate: (s) => {
        if (fill.current) fill.current.style.transform = `scaleY(${s.progress})`
        const mark = window.innerHeight * 0.65
        setActive(items.filter((el) => el.getBoundingClientRect().top < mark).length - 1)
      },
    })
    st.update()
    return () => st.kill()
  }, [reduced])

  return (
    <ol ref={list} className="relative">
      <span aria-hidden className="absolute top-5 bottom-5 left-[1.375rem] w-0.5 rounded-full bg-line" />
      <span
        ref={fill}
        aria-hidden
        className="absolute top-5 bottom-5 left-[1.375rem] w-0.5 origin-top rounded-full bg-gradient-to-b from-blue to-fresh"
        style={live ? { transform: 'scaleY(0)' } : undefined}
      />
      {steps.map((s, i) => {
        const reached = !live || i <= active
        const current = live && i === active
        return (
          <li key={s.title} data-step className="relative flex gap-5 pb-6 last:pb-0">
            <span
              aria-hidden
              className={cn(
                'relative z-10 grid size-11 shrink-0 place-items-center rounded-full text-sm font-semibold ring-4 ring-glacier transition-colors duration-500',
                reached ? 'bg-blue text-white' : 'bg-white text-muted ring-glacier',
              )}
            >
              {String(i + 1).padStart(2, '0')}
            </span>
            <div
              className={cn(
                'flex-1 rounded-card p-5 ring-1 transition-all duration-500 ease-out sm:p-6',
                current ? 'bg-white shadow-lift ring-blue/25' : 'bg-white/70 ring-line',
                reached ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
              )}
            >
              <p className="text-xs font-semibold tracking-[0.12em] text-fresh-ink uppercase">{s.duration}</p>
              <h3 className="mt-1.5 text-xl font-semibold tracking-tight">{s.title}</h3>
              <p className="mt-2 leading-relaxed text-muted">{s.text}</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
