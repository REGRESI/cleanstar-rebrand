import { useEffect, useRef, type ReactNode } from 'react'
import { Breadcrumbs } from './Breadcrumbs'
import { Picture } from './Picture'
import type { ImageId } from '@/content/images'
import { ScrollTrigger } from '@/lib/gsap'
import { prefersReducedMotion } from '@/lib/env'
import { span, spanEase } from '@/lib/scrollScene'

/**
 * Kapitel-Wort (Prinzip aus Shopify Editions „Kapitelwort“), Kopf der Leistungs-Unterseiten:
 * Das Leistungsfoto füllt den Bildschirm, der Leistungsname steigt riesig aus dem unteren Rand auf (Instrument Sans,
 * so breit wie möglich, immer eine Zeile), darunter der Kernsatz mit Schreibschrift-Anfangsbuchstaben. Beim
 * Weiterscrollen wandert das Wort nach oben und wird kleiner, bis es die normale Seitenüberschrift ist; das Foto
 * zieht sich zur Bildkarte darunter zusammen. Läuft bei jedem Durchqueren, auch rückwärts (an die Scrollposition
 * gekoppelt).
 * Endzustand ist ein gewöhnlicher Seitenkopf (H1 = Leistungsname, Kernsatz, Bild): So steht er auch ohne JavaScript
 * und bei reduzierter Bewegung. Die Bewegung entsteht nur aus Transformationen vom großen Anfang zu diesem Endzustand.
 */
export function ChapterHero({
  trail,
  word,
  line,
  image,
  children,
}: {
  trail: { name: string; path: string }[]
  /** Leistungsname, wird zur H1 */
  word: string
  /** Kernsatz, erster Buchstabe in Schreibschrift */
  line: string
  image: ImageId
  /** Einleitung und Aktionen unter dem Kopf */
  children?: ReactNode
}) {
  const run = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const title = useRef<HTMLHeadingElement>(null)
  const sub = useRef<HTMLParagraphElement>(null)
  const card = useRef<HTMLDivElement>(null)
  const layer = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = run.current
    const st0 = stage.current
    if (!el || !st0 || prefersReducedMotion() || !document.documentElement.classList.contains('js-motion')) return
    const apply = (p: number) => {
      const W = st0.clientWidth
      const H = st0.clientHeight
      const t = title.current
      const s = sub.current
      const c = card.current
      const l = layer.current
      if (!t || !s || !c || !l) return
      // Endlagen ohne Transformation (offset* kennt keine Transformationen), bezogen auf die Bühne
      const head = t.parentElement as HTMLElement
      const tl = head.offsetLeft + t.offsetLeft
      const tt = head.offsetTop + t.offsetTop
      const m = Math.max(16, W * 0.03)
      const giant = Math.min((W - 2 * m) / t.offsetWidth, (H * 0.3) / t.offsetHeight)
      const rise = spanEase(p, 0, 0.22)
      const dock = spanEase(p, 0.42, 1)
      // Wort: groß über dem unteren Drittel (steigt aus dem unteren Rand auf), dann an seinen Platz oben links
      const k = giant + (1 - giant) * dock
      const gx = m - tl
      const gy = H * 0.68 - tt - t.offsetHeight * giant + (1 - rise) * H * 0.45
      t.style.transform = `translate3d(${(gx * (1 - dock)).toFixed(1)}px, ${(gy * (1 - dock)).toFixed(1)}px, 0) scale(${k.toFixed(4)})`
      // Kernsatz: unter dem großen Wort, dann an seinen Platz unter der Überschrift
      const sx = m - (head.offsetLeft + s.offsetLeft)
      const sy = H * 0.72 - (head.offsetTop + s.offsetTop) + (1 - rise) * H * 0.25
      // solange das Wort noch größer ist als am Ende, rückt der Kernsatz um diese zusätzliche Höhe nach unten
      const extra = t.offsetHeight * (k - 1) * dock
      s.style.transform = `translate3d(${(sx * (1 - dock)).toFixed(1)}px, ${(sy * (1 - dock) + extra).toFixed(1)}px, 0)`
      s.style.opacity = String(Math.max(span(p, 0.12, 0.28), dock))
      // Farbe: Weiß über dem Foto, Tinte auf Papier
      const ink = span(p, 0.62, 0.92).toFixed(3)
      t.style.setProperty('--ink', ink)
      s.style.setProperty('--ink', ink)
      // Foto: bildschirmfüllend, zieht sich zur Bildkarte zusammen
      const ct = head.offsetTop + c.offsetTop
      const cl = head.offsetLeft + c.offsetLeft
      const top = ct * dock
      const left = cl * dock
      const right = (W - cl - c.offsetWidth) * dock
      const bottom = Math.max(0, H - ct - c.offsetHeight) * dock
      l.style.clipPath = `inset(${top.toFixed(1)}px ${right.toFixed(1)}px ${bottom.toFixed(1)}px ${left.toFixed(1)}px round ${(dock * 14).toFixed(1)}px)`
      l.style.setProperty('--shade', String(1 - dock))
      el.setAttribute('data-ready', '')
    }
    const st = ScrollTrigger.create({ trigger: el, start: 'top top', end: 'bottom bottom', scrub: 0.3, onUpdate: (x) => apply(x.progress), onRefresh: (x) => apply(x.progress) })
    apply(st.progress)
    return () => {
      st.kill()
      el.removeAttribute('data-ready')
    }
  }, [])

  const [cap, ...rest] = Array.from(line)
  return (
    <section className="chapter relative bg-paper" data-tone-end="paper">
      <div ref={run} className="chapter-run">
        <div ref={stage} className="chapter-stage">
          {/* Foto als eigene Ebene (zieht sich zur Bildkarte zusammen); ohne Bewegung ausgeblendet, dann zeigt die Karte das Bild */}
          <div ref={layer} aria-hidden className="chapter-layer">
            <Picture id={image} priority aspect="absolute inset-0 size-full" sizes="100vw" />
            <span className="chapter-shade" />
          </div>
          <div className="container-site chapter-head relative">
            <h1 ref={title} className="chapter-word">
              {word}
            </h1>
            <p ref={sub} className="chapter-sub">
              <span className="sr-only">{line}</span>
              <span aria-hidden>
                <span className="chapter-cap">{cap}</span>
                {rest.join('')}
              </span>
            </p>
            <div ref={card} className="chapter-card">
              <Picture id={image} aspect="size-full" sizes="(min-width:1600px) 1472px, 100vw" />
            </div>
          </div>
        </div>
      </div>
      <div className="container-site pt-10 sm:pt-12">
        <Breadcrumbs trail={trail} />
        {children && <div className="grid-site mt-8"><div className="col-span-12 md:col-span-9 lg:col-span-7">{children}</div></div>}
      </div>
    </section>
  )
}
