import Lenis from 'lenis'
import { gsap, ScrollTrigger } from './gsap'

let lenis: Lenis | null = null

/** Startet Lenis (Smooth Scroll) und koppelt es an GSAP ScrollTrigger. */
export function startSmoothScroll() {
  if (lenis) return lenis
  lenis = new Lenis({ duration: 1.05, easing: (t) => 1 - Math.pow(1 - t, 3), touchMultiplier: 1.4 })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add(tick)
  gsap.ticker.lagSmoothing(0)
  return lenis
}

function tick(time: number) {
  lenis?.raf(time * 1000)
}

export function stopSmoothScroll() {
  if (!lenis) return
  gsap.ticker.remove(tick)
  lenis.destroy()
  lenis = null
}

export const getLenis = () => lenis

/** Scrollt nach oben: sofort (Seitenwechsel) oder weich (Klick auf das Logo auf der Startseite). */
export function scrollToTop(immediate = true) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (lenis) lenis.scrollTo(0, { immediate: immediate || reduce, force: true })
  else window.scrollTo({ top: 0, behavior: (immediate || reduce ? 'instant' : 'smooth') as ScrollBehavior })
}

/**
 * Zu einem Element springen (Anker), Abstand für die feste Kopfzeile. Die neue Seite baut sich gerade erst auf
 * (Bilder, nachgeladene Abschnitte), deshalb wird die Position ein paar Mal nachkorrigiert, bis sie stimmt.
 */
export function scrollToElement(el: HTMLElement, offset = 96) {
  let tries = 0
  const jump = () => {
    const top = el.getBoundingClientRect().top + window.scrollY - offset
    if (lenis) lenis.scrollTo(top, { immediate: true, force: true })
    else window.scrollTo({ top, behavior: 'instant' as ScrollBehavior })
    if (++tries < 6) window.setTimeout(() => Math.abs(el.getBoundingClientRect().top - offset) > 4 && jump(), 200)
  }
  jump()
}

export function lockScroll(lock: boolean) {
  if (lenis) {
    if (lock) lenis.stop()
    else lenis.start()
  }
  document.documentElement.style.overflow = lock ? 'hidden' : ''
}

/** Weich zu einem Element mit id scrollen (mit Lenis, sonst nativ). */
export function scrollToId(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  if (lenis) lenis.scrollTo(el, { offset: -96 })
  else el.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' })
}
