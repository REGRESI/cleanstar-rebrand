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
    let t = 0
    let t2 = 0
    const cancel = onIdle(() => {
      t = window.setTimeout(() => ScrollTrigger.refresh(), 300)
      if (key !== '/') t2 = window.setTimeout(() => ScrollTrigger.refresh(), 2500)
    })
    const onLoad = () => window.setTimeout(() => ScrollTrigger.refresh(), 100)
    if (document.readyState !== 'complete') window.addEventListener('load', onLoad, { once: true })
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
    }
  }, [key])
}
