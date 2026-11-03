import { useEffect } from 'react'
import { ScrollTrigger } from './gsap'
import { onIdle } from './idle'

/**
 * Scroll-Positionen aktuell halten: Gepinnte Abschnitte (Hero, Kreis-Übergänge) und an die Scrollposition gekoppelte
 * Absätze brauchen richtige Startpunkte. Ändert sich die Höhe des Inhalts später (nachgeladene Abschnitte, Bilder),
 * wird einmal gebündelt neu berechnet. Wird bei jedem Seitenwechsel neu aufgerufen.
 * (Die früheren Einblendungen von Absätzen, Bildern und Linien sind entfernt; Überschriften laufen über AnimatedText.)
 */
export function useScrollReveals(key: string) {
  useEffect(() => {
    let dead = false
    // Einmal neu berechnen, wenn Bilder und Schriften geladen sind (nicht mehrfach auf Verdacht)
    const loaded = document.readyState === 'complete' ? Promise.resolve() : new Promise<void>((r) => window.addEventListener('load', () => r(), { once: true }))
    const fonts = document.fonts?.ready ?? Promise.resolve()
    let cancelIdle = () => {}
    Promise.all([loaded, fonts]).then(() => {
      if (!dead) cancelIdle = onIdle(() => ScrollTrigger.refresh(), 600)
    })
    // Spätere Höhenänderungen (nachgeladene Abschnitte): nur in einer Scrollpause und nur bei spürbarer Änderung,
    // nie während der Nutzer scrollt (sonst springt die Seite)
    let lastH = 0
    let lastScroll = 0
    const since = performance.now()
    let r = 0
    const onScroll = () => (lastScroll = performance.now())
    window.addEventListener('scroll', onScroll, { passive: true })
    const later = () => {
      window.clearTimeout(r)
      r = window.setTimeout(() => (performance.now() - lastScroll < 500 ? later() : ScrollTrigger.refresh()), 600)
    }
    const main = document.getElementById('main')
    const ro =
      main && 'ResizeObserver' in window
        ? new ResizeObserver(([e]) => {
            const h = Math.round(e.contentRect.height)
            if (Math.abs(h - lastH) < 40) return
            lastH = h
            // direkt nach einem Seitenwechsel stellt das Layout die Scrollposition wieder her: nicht dazwischenfunken
            if (performance.now() - since < 1800) return
            later()
          })
        : null
    if (main) ro?.observe(main)
    return () => {
      dead = true
      cancelIdle()
      window.clearTimeout(r)
      window.removeEventListener('scroll', onScroll)
      ro?.disconnect()
    }
  }, [key])
}
