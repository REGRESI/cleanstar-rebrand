import { getLenis } from './smooth-scroll'

let releaseActive: (() => void) | null = null

/** Stop at a visible heading, then release on actual animation completion or Escape. */
export function headingGate(el: HTMLElement, start: () => void) {
  let dead = false, pending = 0, timer = 0
  let release: (() => void) | null = null
  const requested = performance.now()
  const enter = () => {
    pending = 0
    if (dead || !el.isConnected) return
    const r = el.getBoundingClientRect()
    if (r.bottom <= 90 || r.top >= innerHeight - 80 || releaseActive) {
      if (performance.now() - requested < 8000) pending = requestAnimationFrame(enter)
      return
    }
    const lenis = getLenis()
    const wasStopped = lenis?.isStopped ?? false
    const root = document.documentElement
    const overflow = root.style.overflow
    // Keep the entire title inside the reading area when a fast swipe overshoots it.
    const delta = r.top < 100 ? r.top - 100 : r.bottom > innerHeight - 90 ? r.bottom - innerHeight + 90 : 0
    if (delta) {
      const y = scrollY + delta
      if (lenis) lenis.scrollTo(y, { immediate: true, force: true })
      else window.scrollTo({ top: y, behavior: 'instant' })
    }
    lenis?.stop()
    root.style.overflow = 'hidden'
    root.setAttribute('data-heading-hold', '')
    const prevent = (e: Event) => { if (e.cancelable) e.preventDefault() }
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Tab') release?.()
      else if (['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' '].includes(e.key)) prevent(e)
    }
    const interact = (e: Event) => {
      if (e.target instanceof Element && e.target.closest('button,a,input,select,textarea')) release?.()
    }
    release = () => {
      if (!release) return
      window.clearTimeout(timer)
      window.removeEventListener('wheel', prevent)
      window.removeEventListener('touchmove', prevent)
      window.removeEventListener('keydown', key)
      window.removeEventListener('pointerdown', interact, true)
      root.style.overflow = overflow
      root.removeAttribute('data-heading-hold')
      if (!wasStopped) lenis?.start()
      release = null
      releaseActive = null
    }
    releaseActive = release
    window.addEventListener('wheel', prevent, { passive: false })
    window.addEventListener('touchmove', prevent, { passive: false })
    window.addEventListener('keydown', key)
    window.addEventListener('pointerdown', interact, true)
    start()
    const began = performance.now()
    const check = () => {
      if (!release) return
      const running = el.dataset.pen === 'run' || el.getAnimations({ subtree: true }).some(a => a.playState === 'running' || a.pending)
      if ((!running && performance.now() - began > 250) || performance.now() - began > 6500) release()
      else timer = window.setTimeout(check, 50)
    }
    timer = window.setTimeout(check, 100)
  }
  pending = requestAnimationFrame(enter)
  return () => { dead = true; cancelAnimationFrame(pending); release?.() }
}
