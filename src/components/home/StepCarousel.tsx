import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/cn'

export interface Step {
  title: string
  duration: string
  text: string
}

/**
 * Schritte als wischbare Kartenreihe (Handy und Tablet). Native Scroll-Snap-Technik: läuft flüssig,
 * mit Tastatur bedienbar und ohne Animation, wenn reduzierte Bewegung gewünscht ist.
 */
export function StepCarousel({ steps, label }: { steps: Step[]; label: string }) {
  const track = useRef<HTMLOListElement>(null)
  const [active, setActive] = useState(0)

  useEffect(() => {
    const el = track.current
    if (!el) return
    const onScroll = () => {
      const cards = Array.from(el.children) as HTMLElement[]
      const left = el.scrollLeft + el.clientWidth * 0.3
      let idx = 0
      cards.forEach((c, i) => {
        if (c.offsetLeft - el.offsetLeft <= left) idx = i
      })
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 4) idx = cards.length - 1
      setActive(idx)
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  const go = (i: number) => {
    const el = track.current
    const card = el?.children[Math.max(0, Math.min(steps.length - 1, i))] as HTMLElement | undefined
    if (!el || !card) return
    el.scrollTo({ left: card.offsetLeft - el.offsetLeft - parseFloat(getComputedStyle(el).paddingLeft), behavior: 'smooth' })
  }

  return (
    <div>
      <ol
        ref={track}
        aria-label={label}
        className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-5 pb-2 sm:px-8"
        style={{ scrollPaddingLeft: '1.25rem' }}
      >
        {steps.map((s, i) => (
          <li key={s.title} className="w-[82%] shrink-0 snap-start sm:w-[46%]">
            <article
              className={cn(
                'flex h-full flex-col rounded-card p-6 ring-1 transition-colors duration-300',
                i === active ? 'bg-white shadow-lift ring-blue/20' : 'bg-white/70 ring-line',
              )}
            >
              <div className="flex items-center justify-between">
                <span className={cn('text-4xl font-semibold tracking-tight tabular-nums transition-colors', i === active ? 'text-blue' : 'text-ink/20')}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="rounded-full bg-glacier px-3 py-1 text-xs font-medium text-muted">{s.duration}</span>
              </div>
              <h3 className="mt-6 text-xl font-semibold tracking-tight">{s.title}</h3>
              <p className="mt-2 flex-1 leading-relaxed text-muted">{s.text}</p>
            </article>
          </li>
        ))}
        <li aria-hidden className="w-1 shrink-0" />
      </ol>

      <div className="mt-6 flex items-center justify-between px-5 sm:px-8">
        <div className="flex items-center gap-3">
          <span className="flex gap-1.5">
            {steps.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => go(i)}
                aria-label={`Schritt ${i + 1} anzeigen`}
                aria-current={i === active ? 'step' : undefined}
                className={cn('h-2 rounded-full transition-all duration-300', i === active ? 'w-6 bg-blue' : 'w-2 bg-ink/15')}
              />
            ))}
          </span>
          <span className="text-sm text-muted tabular-nums" aria-live="polite">
            Schritt {active + 1} von {steps.length}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => go(active - 1)}
            disabled={active === 0}
            aria-label="Vorheriger Schritt"
            className="grid size-11 place-items-center rounded-full bg-white text-ink ring-1 ring-line transition disabled:opacity-35"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => go(active + 1)}
            disabled={active === steps.length - 1}
            aria-label="Nächster Schritt"
            className="grid size-11 place-items-center rounded-full bg-blue text-white shadow-glow transition disabled:opacity-35"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
