import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Picture } from '@/components/ui/Picture'
import { Roll } from '@/components/ui/Roll'
import { services } from '@/content/services'
import { ScrollTrigger } from '@/lib/gsap'
import { prefersReducedMotion } from '@/lib/env'

/**
 * Übergang C „Horizontal-Scroll“ (Referenz: ERA, era/04): Beim Scrollen nach unten fährt der Abschnitt nach rechts
 * (der Inhalt wandert nach links, die Bühne steht). Erst gleitet ein großer Titel herein, dann folgen die sechs
 * Leistungen nacheinander: großes Foto (kommt von rechts und wird größer), daneben Nummer, Name, zwei Sätze und ein
 * Pfeil. Jede Leistung ist als Ganzes ein Link. Titel „6 Leistungen. Ein Team.“ (Zahl aus den Daten). Unten eine feine Fortschrittslinie mit „01 / 06“.
 * Im Dokument ist es eine normale Liste von Links (Tastatur, Screenreader); Fokus scrollt die Leistung ins Bild.
 * Reduzierte Bewegung: dieselben Leistungen untereinander.
 */

export function ServicesHorizontal() {
  const list = [...services].sort((a, b) => Number(!!b.featured) - Number(!!a.featured))
  const n = list.length
  const run = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const bar = useRef<HTMLSpanElement>(null)
  const title = useRef<HTMLDivElement>(null)
  const [idx, setIdx] = useState(0)
  const [flat, setFlat] = useState(false)
  const stRef = useRef<ScrollTrigger | null>(null)

  useEffect(() => {
    const el = run.current
    const tr = track.current
    if (!el || !tr) return
    if (prefersReducedMotion() || !document.documentElement.classList.contains('js-motion')) {
      setFlat(true)
      return
    }
    const mobile = window.matchMedia('(max-width: 767px)').matches
    const stage = tr.parentElement!
    let stageHeight = stage.clientHeight
    let measuredWidth = window.innerWidth
    let dist = 0
    const measure = () => {
      if (window.innerWidth !== measuredWidth) { stageHeight = stage.clientHeight; measuredWidth = window.innerWidth }
      dist = mobile ? (n - 1) * stageHeight * .85 : Math.max(0, tr.scrollWidth - window.innerWidth)
      el.style.height = `${stageHeight + dist}px`
    }
    measure()
    const panels = Array.from(tr.querySelectorAll<HTMLElement>('[data-panel]'))
    const apply = (p: number) => {
      if (mobile) {
        const position = p * (n - 1)
        panels.forEach((pn, i) => {
          const delta = i - position
          pn.style.transform = `translate3d(${Math.max(-5, delta * 105)}%,0,0)`
          pn.style.opacity = delta < -1 ? '0' : '1'
          pn.style.pointerEvents = Math.abs(delta) < .5 ? 'auto' : 'none'
          pn.inert = Math.abs(delta) >= .5
        })
        setIdx(Math.round(position))
        if (bar.current) bar.current.style.transform = `scaleX(${p})`
        return
      }
      const x = -p * dist
      tr.style.transform = `translate3d(${x.toFixed(1)}px, 0, 0)`
      const vw = window.innerWidth
      // Fotos kommen von rechts und werden größer, bis sie ihren Platz erreicht haben
      for (const pn of panels) {
        const left = pn.offsetLeft + x
        const k = Math.max(0, Math.min(1, 1 - (left - vw * 0.12) / (vw * 0.88)))
        pn.style.setProperty('--k', k.toFixed(3))
      }
      if (title.current) title.current.style.transform = `translate3d(${(-p * dist * 0.25).toFixed(1)}px, 0, 0)`
      if (bar.current) bar.current.style.transform = `scaleX(${p.toFixed(4)})`
      // aktuelle Leistung: die, deren Mitte der Bildschirmmitte am nächsten ist
      let best = 0
      let bd = Infinity
      panels.forEach((pn, i) => {
        const d = Math.abs(pn.offsetLeft + x + pn.offsetWidth / 2 - vw / 2)
        if (d < bd) {
          bd = d
          best = i
        }
      })
      setIdx(best)
    }
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: () => `+=${dist}`,
      invalidateOnRefresh: true,
      onRefreshInit: measure,
      onUpdate: (s) => apply(s.progress),
      onRefresh: (s) => apply(s.progress),
    })
    stRef.current = st
    apply(st.progress)
    return () => {
      st.kill()
      el.style.height = ''
      tr.style.transform = ''
    }
  }, [n])

  // Tastatur: fokussierte Leistung ins Bild scrollen
  const onFocus = (i: number) => {
    const st = stRef.current
    const tr = track.current
    if (!st || !tr) return
    const pn = tr.querySelectorAll<HTMLElement>('[data-panel]')[i]
    const dist = st.end - st.start
    const total = Math.max(1, tr.scrollWidth - window.innerWidth)
    const p = window.innerWidth < 768 ? i / Math.max(1, n - 1) : Math.max(0, Math.min(1, (pn.offsetLeft - window.innerWidth * 0.1) / total))
    window.scrollTo({ top: st.start + p * dist, behavior: 'instant' as ScrollBehavior })
  }

  return (
    <section className="bg-surface text-ink [overflow-x:clip]" aria-labelledby="services-title" data-tone="surface" data-services-stage>
      <div ref={run} className="relative">
        <div className={flat ? 'py-24' : 'sticky top-0 h-[100svh] overflow-hidden'}>
          <div ref={track} className={flat ? 'container-site flex flex-col gap-16' : 'svh-track flex h-full items-center'}>
            {/* Großer Titel gleitet herein */}
            <div className="svh-title shrink-0" data-title>
              <div ref={title}>
                <p className="t-label">Leistungen</p>
                <h2 id="services-title" className="svh-title-text mt-6 text-blue">
                  {/* Anzahl aus den Daten gezählt, nicht fest geschrieben */}
                  {n} Leistungen.
                  <br />{' '}
                  Ein Team.
                </h2>
                <p className="mt-6 max-w-[34ch] text-[1.0625rem] text-ink-2">Büroreinigung ist unser Kern. Die übrigen Leistungen kommen dazu, wenn Sie sie brauchen.</p>
              </div>
            </div>
            <ol className={flat ? 'flex flex-col gap-16' : 'flex h-full items-center'} aria-label="Leistungen">
              {list.map((s, i) => (
                <li key={s.slug} data-panel className="svh-panel shrink-0" style={{ '--k': 1 } as CSSProperties}>
                  <Link to={`/leistungen/${s.slug}`} className="svh-link group" onFocus={() => onFocus(i)}>
                    <span className="svh-photo">
                      <Picture id={s.image} aspect="size-full" sizes="(min-width:1024px) 42vw, 90vw" />
                    </span>
                    <span className="svh-text">
                      <span className="t-label block tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                      <span className="mt-3 block text-[1.75rem] leading-[1.1] font-medium tracking-[-0.025em] sm:text-[2.25rem]">{s.name}</span>
                      <span className="mt-4 block max-w-[34ch] text-[1rem] leading-[1.5] text-ink-2">{s.short}</span>
                      <span className="svh-arrow mt-6 inline-flex items-center gap-3 font-medium">
                        <Roll text="Zur Leistung" />
                        <ArrowRight aria-hidden className="size-5" strokeWidth={1.5} />
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
          {!flat && (
            <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 pb-8 sm:pb-10">
              <div className="container-site flex items-center gap-5">
                <span className="t-meta tabular-nums text-ink">
                  {String(idx + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
                </span>
                <span className="relative h-px flex-1 bg-line">
                  <span ref={bar} className="absolute inset-0 origin-left bg-ink" style={{ transform: 'scaleX(0)' }} />
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
      <a href="#cost-title" className="svh-cost-bridge container-site block py-10 text-blue">Ein festes Team. Ein klarer Preis. <span className="block mt-3 text-2xl text-ink">Was kostet Ihre Reinigung? ↓</span></a>
    </section>
  )
}
