import { useEffect, useRef, useState } from 'react'
import { Picture } from '@/components/ui/Picture'
import { MomentHeading } from '@/components/ui/MomentHeading'
import { ScrollTrigger } from '@/lib/gsap'
import { prefersReducedMotion } from '@/lib/env'
import { span, spanEase } from '@/lib/scrollScene'

/**
 * Funken-Portal (Prinzip aus Shopify Editions „Portal“), Seite Leistungen, Vorher/Nachher:
 * Über dem Vorher-Bild blitzt der Glanz-Stern auf, zerfällt in eine Funkenwolke und öffnet ein rundes Portal, das bis
 * zum vollen Nachher-Bild wächst. Am Desktop zeigt vor dem Scrollen ein kleines Portal am Mauszeiger das Nachher-Bild.
 * An die Scrollposition gekoppelt (auch rückwärts). Reduzierte Bewegung: Nachher-Bild mit kleinem Vorher-Bild daneben.
 * Hinter features.sparkPortal (aus), bis ein deckungsgleiches Bildpaar vorliegt (siehe OFFENE-PUNKTE.md).
 */
const SPARKS = Array.from({ length: 18 }, (_, i) => {
  const a = (i / 18) * Math.PI * 2 + (i % 3) * 0.21
  return { a, d: 0.55 + ((i * 7) % 5) * 0.11, s: 3 + (i % 4) }
})

export function SparkPortal() {
  const run = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const [still, setStill] = useState(false)

  useEffect(() => {
    const el = run.current
    const st0 = stage.current
    if (!el || !st0) return
    if (prefersReducedMotion() || !document.documentElement.classList.contains('js-motion')) {
      setStill(true)
      return
    }
    const after = st0.querySelector<HTMLElement>('.sp-after')!
    const star = st0.querySelector<HTMLElement>('.sp-star')!
    const sparks = Array.from(st0.querySelectorAll<HTMLElement>('.sp-spark'))
    let progress = 0
    let cursor: { x: number; y: number } | null = null
    const draw = () => {
      const W = st0.clientWidth
      const H = st0.clientHeight
      const p = progress
      const cx = W / 2
      const cy = H * 0.55
      const full = Math.hypot(Math.max(cx, W - cx), Math.max(cy, H - cy))
      // Stern: blitzt auf (0–.14), zerfällt in Funken (.14–.32), Portal wächst (.24–.86)
      const s = span(p, 0.02, 0.12) * (1 - span(p, 0.14, 0.22))
      star.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%) rotate(${(p * 220).toFixed(1)}deg) scale(${(s * 1.4).toFixed(3)})`
      const burst = spanEase(p, 0.14, 0.34)
      const fade = 1 - span(p, 0.3, 0.42)
      sparks.forEach((k, i) => {
        const sp = SPARKS[i]
        const r = burst * sp.d * Math.min(W, H) * 0.26
        k.style.transform = `translate3d(${(cx + Math.cos(sp.a) * r).toFixed(1)}px, ${(cy + Math.sin(sp.a) * r).toFixed(1)}px, 0) scale(${(burst > 0 ? 1 - burst * 0.4 : 0).toFixed(3)})`
        k.style.opacity = (burst > 0 ? fade : 0).toFixed(3)
      })
      const grow = spanEase(p, 0.24, 0.86)
      let rad = grow * full
      let x = cx
      let y = cy
      // Desktop: kleines Portal am Mauszeiger, solange noch nicht gescrollt wurde
      if (cursor && p < 0.02) {
        rad = 110
        x = cursor.x
        y = cursor.y
      }
      after.style.clipPath = `circle(${rad.toFixed(1)}px at ${x.toFixed(1)}px ${y.toFixed(1)}px)`
      // Rand des Portals: heller Ring, solange es wächst
      st0.style.setProperty('--ring', String(rad > 0 && grow < 1 ? 1 : 0))
    }
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.3,
      onUpdate: (x) => {
        progress = x.progress
        draw()
      },
      onRefresh: (x) => {
        progress = x.progress
        draw()
      },
    })
    progress = st.progress
    draw()
    st0.setAttribute('data-ready', '')
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const move = (e: PointerEvent) => {
      const r = st0.getBoundingClientRect()
      cursor = { x: e.clientX - r.left, y: e.clientY - r.top }
      draw()
    }
    const leave = () => {
      cursor = null
      draw()
    }
    if (fine) {
      st0.addEventListener('pointermove', move)
      st0.addEventListener('pointerleave', leave)
    }
    return () => {
      st.kill()
      st0.removeEventListener('pointermove', move)
      st0.removeEventListener('pointerleave', leave)
      st0.removeAttribute('data-ready')
    }
  }, [])

  const heading = <MomentHeading text="Vorher. Nachher." id="portal-title" />

  if (still)
    return (
      <section className="section" aria-labelledby="portal-title">
        <div className="container-site">
          {heading}
          <div className="mt-10 grid items-end gap-5 md:grid-cols-[3fr_1fr]">
            <Picture id="after-office" sizes="(min-width:768px) 75vw, 100vw" rounded="rounded-[14px]" />
            <figure>
              <Picture id="before-office" sizes="(min-width:768px) 25vw, 50vw" rounded="rounded-[10px]" className="max-md:w-1/2" />
              <figcaption className="mt-2 text-[0.8125rem] text-muted">Vorher</figcaption>
            </figure>
          </div>
        </div>
      </section>
    )

  return (
    <section className="relative bg-night" aria-labelledby="portal-title">
      <div ref={run} className="sp-run">
        <div ref={stage} className="sp-stage">
          <Picture id="before-office" aspect="absolute inset-0 size-full" sizes="100vw" />
          <div className="sp-after">
            <Picture id="after-office" aspect="absolute inset-0 size-full" sizes="100vw" />
          </div>
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <svg className="sp-star" viewBox="0 0 24 24" width="56" height="56">
              <path d="M12 0c.6 6.2 5.8 11.4 12 12-6.2.6-11.4 5.8-12 12-.6-6.2-5.8-11.4-12-12C6.2 11.4 11.4 6.2 12 0Z" fill="#fff" />
            </svg>
            {SPARKS.map((k, i) => (
              <span key={i} className="sp-spark" style={{ width: k.s, height: k.s }} />
            ))}
          </div>
          <div className="sp-head container-site">{heading}</div>
        </div>
      </div>
    </section>
  )
}
