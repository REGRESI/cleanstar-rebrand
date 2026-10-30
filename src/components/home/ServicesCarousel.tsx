import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { AnimatedText } from '@/components/ui/AnimatedText'
import { Picture } from '@/components/ui/Picture'
import { Roll } from '@/components/ui/Roll'
import { services } from '@/content/services'
import { home } from '@/content/site'
import { cn } from '@/lib/cn'

/**
 * Leistungen als Karten-Karussell (Referenz: Terminal): oben Chips mit den Leistungen, darunter große Karten.
 * Die aktive Karte steht in Navy mit klarem Foto, die übrigen grau mit unscharfem Foto; beim Wechsel gleiten die
 * Karten weich nach. Steuerung: Chips, Pfeile, Tastatur (Pfeiltasten), Wischen auf dem Handy.
 * Die Details stehen auf den Leistungsseiten; hier je Karte Titel, zwei Sätze und „Mehr erfahren“.
 */
export function ServicesCarousel() {
  const list = [...services].sort((a, b) => Number(!!b.featured) - Number(!!a.featured))
  const [i, setI] = useState(0)
  const [dx, setDx] = useState(0)
  const drag = useRef<{ x: number; y: number; id: number; lock: 'x' | 'y' | null } | null>(null)
  const n = list.length
  const go = (k: number) => setI(Math.max(0, Math.min(n - 1, k)))

  // Fokus folgt der aktiven Karte nicht automatisch; Ansage für Screenreader über aria-live
  const live = useRef<HTMLParagraphElement>(null)
  useEffect(() => {
    if (live.current) live.current.textContent = `${list[i].name}, ${i + 1} von ${n}`
  }, [i, n, list])

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      go(i + 1)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      go(i - 1)
    }
  }

  return (
    <section className="section bg-surface text-ink [overflow-x:clip]" aria-labelledby="services-title" aria-roledescription="Karussell">
      <div className="container-site">
        <p className="t-label">{home.services.eyebrow}</p>
        <AnimatedText as="h2" id="services-title" text={home.services.headline} className="t-h2 mt-5 max-w-[18ch]" />
        <p className="t-lead mt-6 max-w-[48ch] text-ink-2">{home.services.lead}</p>

        {/* Chips */}
        <div className="no-scrollbar -mx-5 mt-12 overflow-x-auto px-5 sm:mx-0 sm:px-0 lg:mt-16">
          <div className="flex w-max gap-2" role="group" aria-label="Leistung wählen">
            {list.map((s, k) => (
              <button key={s.slug} type="button" aria-pressed={k === i} onClick={() => go(k)} className="chip">
                <Roll text={s.name} />
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between gap-4">
          <p className="t-meta tabular-nums">
            {String(i + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
          </p>
          <div className="flex gap-2">
            <button type="button" className="round-btn" onClick={() => go(i - 1)} disabled={i === 0} aria-label="Vorherige Leistung">
              <ArrowLeft className="size-5" strokeWidth={1.5} aria-hidden />
            </button>
            <button type="button" className="round-btn" onClick={() => go(i + 1)} disabled={i === n - 1} aria-label="Nächste Leistung">
              <ArrowRight className="size-5" strokeWidth={1.5} aria-hidden />
            </button>
          </div>
        </div>

        {/* Karten */}
        <div
          className="svc-track mt-6"
          style={{ '--i': i, '--dx': `${dx}px` } as CSSProperties}
          data-drag={dx !== 0 || undefined}
          onKeyDown={onKey}
          onPointerDown={(e) => {
            if (e.pointerType === 'mouse') return
            drag.current = { x: e.clientX, y: e.clientY, id: e.pointerId, lock: null }
          }}
          onPointerMove={(e) => {
            const d = drag.current
            if (!d || d.id !== e.pointerId) return
            const mx = e.clientX - d.x
            const my = e.clientY - d.y
            if (!d.lock && Math.hypot(mx, my) > 8) d.lock = Math.abs(mx) > Math.abs(my) ? 'x' : 'y'
            if (d.lock === 'x') setDx(mx)
          }}
          onPointerUp={() => {
            const d = drag.current
            drag.current = null
            if (d?.lock === 'x' && Math.abs(dx) > 50) go(i + (dx < 0 ? 1 : -1))
            setDx(0)
          }}
          onPointerCancel={() => {
            drag.current = null
            setDx(0)
          }}
        >
          {list.map((s, k) => {
            const on = k === i
            return (
              <article
                key={s.slug}
                aria-roledescription="Karte"
                aria-label={`${k + 1} von ${n}: ${s.name}`}
                className={cn('svc-card', on && 'is-on')}
                onClick={() => !on && go(k)}
              >
                <div className="svc-photo">
                  <Picture id={s.image} aspect="aspect-[4/3]" sizes="(min-width:1024px) 38rem, 82vw" />
                </div>
                <div className="flex flex-1 flex-col p-6 sm:p-8">
                  <h3 className="text-[1.5rem] leading-[1.15] font-medium tracking-[-0.02em] sm:text-[1.75rem]">{s.name}</h3>
                  <p className="svc-text mt-3 text-[1rem] leading-[1.5]">{s.short}</p>
                  <Link to={`/leistungen/${s.slug}`} className="tlink mt-auto self-start pt-6" tabIndex={on ? 0 : -1} aria-hidden={on ? undefined : true}>
                    <Roll text="Mehr erfahren" />
                    <ArrowRight aria-hidden className="size-4" strokeWidth={1.75} />
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
        <p ref={live} className="sr-only" aria-live="polite" />
      </div>
    </section>
  )
}
