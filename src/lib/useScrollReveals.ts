import { useEffect } from 'react'
import { gsap, ScrollTrigger } from './gsap'
import { prefersReducedMotion } from './env'
import { onIdle } from './idle'
import { markLines } from '@/components/ui/RevealText'

import { EASE_CS as EASE } from './ease'

const done = (el: Element) => el.setAttribute('data-revealed', '')

/**
 * Scroll-Reveals, einmalig je Element:
 * [data-reveal-text]  Überschrift Zeile für Zeile aus der Maske
 * [data-reveal]       Absatz oder Block blendet dezent ein
 * [data-reveal-img]   Bild deckt sich von unten auf (clip-path)
 * [data-reveal-rule]  Haarlinie zeichnet sich von links nach rechts
 * Wird bei jedem Seitenwechsel neu aufgerufen.
 */
export function useScrollReveals(key: string) {
  useEffect(() => {
    if (prefersReducedMotion()) return
    let ctx: gsap.Context | null = null
    let t = 0
    let t2 = 0
    // Erst im Leerlauf starten, damit das Hydrieren nicht blockiert wird
    const cancel = onIdle(() => {
      ctx = gsap.context(() => {
        // Bereits gelaufene Reveals (Flag data-revealed) nicht noch einmal animieren
        document.querySelectorAll<HTMLElement>('[data-reveal-text]:not([data-revealed])').forEach((el) => {
          markLines(el)
          const words = el.querySelectorAll<HTMLElement>('[data-reveal-word]')
          gsap.to(words, {
            y: 0,
            duration: 0.9,
            ease: EASE,
            stagger: (_i, w: HTMLElement) => Number(w.style.getPropertyValue('--l') || 0) * 0.11,
            scrollTrigger: { trigger: el, start: 'top 90%', once: true },
            onComplete: () => done(el),
          })
        })
        ScrollTrigger.batch('[data-reveal]:not([data-revealed])', {
          start: 'top 92%',
          once: true,
          onEnter: (els) =>
            gsap.to(els, {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: EASE,
              stagger: 0.08,
              overwrite: true,
              onComplete: () => els.forEach(done),
            }),
        })
        ScrollTrigger.batch('[data-reveal-img]:not([data-revealed])', {
          start: 'top 92%',
          once: true,
          onEnter: (els) =>
            gsap.to(els, {
              clipPath: 'inset(0% 0px 0px 0px)',
              duration: 0.9,
              ease: EASE,
              stagger: 0.1,
              overwrite: true,
              onComplete: () => els.forEach(done),
            }),
        })
        ScrollTrigger.batch('[data-reveal-rule]:not([data-revealed])', {
          start: 'top 95%',
          once: true,
          onEnter: (els) =>
            gsap.to(els, {
              scaleX: 1,
              duration: 0.9,
              ease: EASE,
              stagger: 0.06,
              overwrite: true,
              onComplete: () => els.forEach(done),
            }),
        })
      })
      t = window.setTimeout(() => ScrollTrigger.refresh(), 300)
      // Späte Layoutänderungen (Hero-Sequenz, nachgeladene Abschnitte, Vorhänge) noch einmal abfangen
      t2 = window.setTimeout(() => ScrollTrigger.refresh(), 2500)
    })
    const onLoad = () => window.setTimeout(() => ScrollTrigger.refresh(), 100)
    if (document.readyState !== 'complete') window.addEventListener('load', onLoad, { once: true })
    // Ändert sich die Höhe des Inhalts später (nachgeladene Abschnitte, Bilder, Vorhänge), stimmen die Startpunkte
    // nicht mehr; dann einmal gebündelt neu berechnen. Sonst bleiben Einblendungen nach einem Sprung (Anker, Zurück) aus.
    let lastH = 0
    const since = performance.now()
    let r = 0
    const main = document.getElementById('main')
    const ro =
      main && 'ResizeObserver' in window
        ? new ResizeObserver(([e]) => {
            const h = Math.round(e.contentRect.height)
            if (Math.abs(h - lastH) < 2) return
            lastH = h
            // direkt nach einem Seitenwechsel stellt das Layout die Scrollposition wieder her: nicht dazwischenfunken
            if (performance.now() - since < 1800) return
            window.clearTimeout(r)
            r = window.setTimeout(() => ScrollTrigger.refresh(), 250)
          })
        : null
    if (main) ro?.observe(main)
    return () => {
      cancel()
      window.clearTimeout(t)
      window.clearTimeout(t2)
      window.clearTimeout(r)
      window.removeEventListener('load', onLoad)
      ro?.disconnect()
      ctx?.revert()
    }
  }, [key])
}
