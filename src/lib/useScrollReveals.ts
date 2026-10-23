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
    })
    return () => {
      cancel()
      window.clearTimeout(t)
      ctx?.revert()
    }
  }, [key])
}
