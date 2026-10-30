import { useEffect, useRef, type ReactNode } from 'react'
import { gsap } from '@/lib/gsap'
import { liteMotion } from '@/lib/motionBudget'
import { cn } from '@/lib/cn'

/**
 * Bilder als versetzte Karten (Referenz: ERA): zwei oder drei Karten, leicht überlappend und in der Höhe versetzt.
 * Beim Scrollen schieben sie sich ruhig übereinander (die zweite Karte holt auf), immer innerhalb ihres Abschnitts.
 * Große, weiche Schatten statt Rahmen. Ohne Bewegung stehen die Karten in ihrer Endlage.
 */
export function OffsetCards({ items, className, overlap }: { items: { key: string; node: ReactNode; caption?: ReactNode }[]; className?: string; overlap?: boolean }) {
  const root = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = root.current
    if (!el || liteMotion()) return
    const cards = Array.from(el.querySelectorAll<HTMLElement>('[data-card]'))
    const ctx = gsap.context(() => {
      cards.forEach((c, i) => {
        if (i === 0) return
        gsap.fromTo(c, { y: 56 * i }, { y: 0, ease: 'none', scrollTrigger: { trigger: el, start: 'top 85%', end: 'bottom 45%', scrub: 0.6 } })
      })
    }, el)
    return () => ctx.revert()
  }, [])
  return (
    <div ref={root} className={cn('offset-cards', overlap && 'is-overlap', className)} data-n={items.length}>
      {items.map((it, i) => (
        <figure key={it.key} data-card className="offset-card" style={{ zIndex: i + 1 }}>
          <div className="card-shadow overflow-hidden rounded-[10px]">{it.node}</div>
          {it.caption && <figcaption className="mt-4">{it.caption}</figcaption>}
        </figure>
      ))}
    </div>
  )
}
