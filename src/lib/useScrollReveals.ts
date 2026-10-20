import { useEffect } from 'react'
import { gsap, ScrollTrigger } from './gsap'
import { prefersReducedMotion } from './env'
import { onIdle } from './idle'

/**
 * Aktiviert Scroll-Reveals für alle Elemente mit [data-reveal] und [data-reveal-text]
 * innerhalb des Containers. Wird bei jedem Seitenwechsel neu aufgerufen.
 */
export function useScrollReveals(key: string) {
  useEffect(() => {
    if (prefersReducedMotion()) return
    let ctx: gsap.Context | null = null
    let t = 0
    // Erst im Leerlauf starten, damit das Hydrieren nicht blockiert wird
    const cancel = onIdle(() => {
      ctx = gsap.context(() => {
        document.querySelectorAll<HTMLElement>('[data-reveal-text]').forEach((el) => {
          const words = el.querySelectorAll('[data-reveal-word]')
          gsap.to(words, {
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: 'expo.out',
            stagger: 0.035,
            scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          })
        })
        ScrollTrigger.batch('[data-reveal]', {
          start: 'top 90%',
          once: true,
          onEnter: (els) =>
            gsap.to(els, {
              opacity: 1,
              y: 0,
              duration: 0.9,
              ease: 'expo.out',
              stagger: 0.08,
              overwrite: true,
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
