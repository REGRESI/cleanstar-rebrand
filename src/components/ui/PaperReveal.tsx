import { useEffect, useRef, type ReactNode } from 'react'
import { Picture } from './Picture'
import type { ImageId } from '@/content/images'
import { ScrollTrigger } from '@/lib/gsap'
import { prefersReducedMotion } from '@/lib/env'
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
  useEffect(() => {
    const el = run.current
    const t = text.current
    if (!el || !t || prefersReducedMotion() || !document.documentElement.classList.contains('js-motion')) return
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
  }, [])
  const [cap, ...rest] = Array.from(line)
  return (
    <div className="pr">
      <div className="pr-sheet">
        {sheet}
        <div aria-hidden className="pr-edge">
          <picture>
            <source type="image/avif" srcSet="/images/deko/papierkante-1920.avif 1920w, /images/deko/papierkante-3840.avif 3840w" sizes="130vw" />
            <img src="/images/deko/papierkante-1920.webp" srcSet="/images/deko/papierkante-1920.webp 1920w, /images/deko/papierkante-3840.webp 3840w" sizes="130vw" width={3840} height={420} alt="" loading="lazy" decoding="async" />
          </picture>
        </div>
      </div>
      <section ref={run} className="pr-run on-dark" aria-labelledby={id} data-tone-start="dark" data-tone-end="dark">
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
