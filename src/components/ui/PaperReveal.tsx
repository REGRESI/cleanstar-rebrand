import { whenNear } from '@/lib/whenNear'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Picture } from './Picture'
import type { ImageId } from '@/content/images'
import { ScrollTrigger } from '@/lib/gsap'
import { prefersReducedMotion } from '@/lib/env'
import { effectTier } from '@/lib/deviceClass'
import { span, spanEase } from '@/lib/scrollScene'

/**
 * Papier-Reveal (Prinzip aus Shopify Editions „Papier-Reveal“): Der helle Abschnitt davor ist ein Blatt Papier. Seine
 * Unterkante ist unregelmäßig gerissen (heller Faserrand, weicher Schatten). Beim Scrollen schiebt sich das Blatt nach
 * oben weg; darunter liegt das Vollbild FEST (es bewegt sich nicht, es wird freigelegt). Ist das Bild frei, steigt groß
 * das Kapitelwort darüber auf, darunter ein Satz mit Schreibschrift-Anfangsbuchstaben. Danach scrollt es normal weiter.
 * Technik: Das Blatt liegt über der Bühne (z-index), die Bühne steht per position: sticky und beginnt eine Bildschirm-
 * höhe vor dem Ende des Blatts (negativer Abstand). Die Kante ist ein Bild (scripts/deko/papierkante.py).
 * Reduzierte Bewegung oder ohne JavaScript: Blatt, Kante und Bild mit Text liegen einfach untereinander.
 */
export function PaperReveal({ sheet, image, word, line, id }: { sheet: ReactNode; image: ImageId; word: string; line: string; id?: string }) {
  const run = useRef<HTMLDivElement>(null)
  const text = useRef<HTMLDivElement>(null)
  const gl = useRef<HTMLCanvasElement>(null)
  const seqBox = useRef<HTMLDivElement>(null)
  // Handy (ohne WebGL-Kante): vorberechnete Kantenformen (scripts/deko/papierkante-serie.py) mit Faserrand und
  // Schatten, beim Scrollen überblendet; die Form wandert dadurch wie am Desktop
  const [seq, setSeq] = useState(false)
  useEffect(() => {
    if (prefersReducedMotion() || !document.documentElement.classList.contains('js-motion') || effectTier() === 'full') return
    setSeq(true)
  }, [])
  useEffect(() => {
    const box = seqBox.current
    if (!seq || !box) return
    const frames = Array.from(box.querySelectorAll<HTMLElement>('img'))
    const n = frames.length
    let last = -1
    const apply = (p: number) => {
      const f = p * (n - 1)
      const i = Math.min(n - 2, Math.floor(f))
      const k = Math.round((f - i) * 20) / 20
      const key = i * 100 + k * 20
      if (key === last) return
      last = key
      // das aktuelle Bild bleibt deckend, das nächste (im DOM darüber) blendet ein; so wird das Papier nie durchscheinend
      frames.forEach((im, j) => (im.style.opacity = j === i ? '1' : j === i + 1 ? String(k) : '0'))
    }
    // vom Erscheinen der Kante unten bis zu ihrem Verschwinden oben
    const st = ScrollTrigger.create({ trigger: box, start: 'top bottom', end: 'top top', onUpdate: (x) => apply(x.progress), onRefresh: (x) => apply(x.progress) })
    apply(st.progress)
    box.closest('.pr')?.setAttribute('data-seq', '')
    return () => {
      st.kill()
      box.closest('.pr')?.removeAttribute('data-seq')
    }
  }, [seq])
  // lebende Kante (WebGL, eigener Chunk); bis sie steht und ohne WebGL bleibt die feste Kante als Bild
  useEffect(() => {
    const cv = gl.current
    // nur am Desktop mit voller Effektstufe; am Handy die feste Kante (keine zusätzliche WebGL-Szene)
    if (!cv || prefersReducedMotion() || !document.documentElement.classList.contains('js-motion') || effectTier() !== 'full') return
    let stop: (() => void) | null = null
    let dead = false
    const cancelNear = whenNear(cv.closest('.pr')!, () => { import('./paperEdge').then(({ startPaperEdge }) => {
      if (dead) return
      stop = startPaperEdge(cv, () => cv.closest('.pr')?.setAttribute('data-gl', ''))
    })
    })
    return () => {
      cancelNear()
      dead = true
      stop?.()
      cv.closest('.pr')?.removeAttribute('data-gl')
    }
  }, [])
  useEffect(() => {
    const el = run.current
    const t = text.current
    if (!el || !t || id === 'morning-title' || prefersReducedMotion() || !document.documentElement.classList.contains('js-motion')) return
    const w = t.querySelector<HTMLElement>('.pr-word')
    const l = t.querySelector<HTMLElement>('.pr-line')
    const apply = (p: number) => {
      // Bühne steht ab p = 0; das Blatt ist nach 100 svh Scrollweg ganz weg (bei 260 svh Lauf: p ≈ 0,62)
      const rise = spanEase(p, 0.56, 0.84)
      if (w) {
        w.style.transform = `translate3d(0, ${((1 - rise) * 60).toFixed(2)}svh, 0)`
        w.style.opacity = String(Math.min(1, rise * 1.6))
      }
      if (l) {
        const r2 = spanEase(p, 0.66, 0.9)
        l.style.transform = `translate3d(0, ${((1 - r2) * 18).toFixed(2)}svh, 0)`
        l.style.opacity = String(r2)
      }
      el.style.setProperty('--dim', span(p, 0.45, 0.8).toFixed(3))
    }
    const st = ScrollTrigger.create({ trigger: el, start: 'top top', end: 'bottom bottom', scrub: 0.3, onUpdate: (x) => apply(x.progress), onRefresh: (x) => apply(x.progress) })
    apply(st.progress)
    el.setAttribute('data-ready', '')
    return () => {
      st.kill()
      el.removeAttribute('data-ready')
    }
  }, [id])
  const [cap, ...rest] = Array.from(line)
  return (
    <div className="pr">
      <div className="pr-sheet">
        {sheet}
        <canvas ref={gl} aria-hidden className="pr-gl" />
        {seq && (
          <div ref={seqBox} aria-hidden className="pr-seq">
            {Array.from({ length: 10 }, (_, i) => (
              <img key={i} src={`/images/deko/papierkante-mobil/kante-${String(i).padStart(2, '0')}.webp`} width={1200} height={297} alt="" decoding="async" style={{ opacity: i === 0 ? 1 : 0 }} />
            ))}
          </div>
        )}
        <div aria-hidden className="pr-edge">
          <picture>
            <source type="image/avif" srcSet="/images/deko/papierkante-1920.avif 1920w, /images/deko/papierkante-3840.avif 3840w" sizes="130vw" />
            <img src="/images/deko/papierkante-1920.webp" srcSet="/images/deko/papierkante-1920.webp 1920w, /images/deko/papierkante-3840.webp 3840w" sizes="130vw" width={3840} height={420} alt="" loading="lazy" decoding="async" />
          </picture>
        </div>
      </div>
      <section ref={run} className="pr-run on-dark" data-home-internal={id === 'morning-title' ? 'morning' : undefined} data-transition="paper-reveal" aria-labelledby={id} data-tone-start="dark" data-tone-end="dark">
        <div className="pr-stage">
          <Picture id={image} aspect="absolute inset-0 size-full" sizes="100vw" />
          <span aria-hidden className="pr-shade" />
          <div ref={text} className="pr-text container-site">
            <h2 id={id} className="pr-word">
              {word}
            </h2>
            <p className="pr-line">
              <span className="sr-only">{line}</span>
              <span aria-hidden>
                <span className="chapter-cap">{cap}</span>
                {rest.join('')}
              </span>
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
