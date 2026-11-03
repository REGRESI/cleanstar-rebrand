import { isBrowser, prefersReducedMotion } from './env'

type NavigatorExtras = Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } }

/**
 * Geräteklasse für Effekte:
 *  'full'   Desktop mit Maus bzw. Trackpad: alle WebGL-Szenen
 *  'single' Touch-Gerät bzw. Handy: höchstens eine WebGL-Szene gleichzeitig (der Hero-Staub bzw. die Karte);
 *           Papierkante, Pflanzen und Wolken laufen in ihrer festen Bildfassung
 *  'none'   schwaches Gerät, reduzierte Bewegung, Datensparmodus oder zu niedrige gemessene Bildrate in der ersten
 *           Sekunde: keine WebGL-Effekte, nur Einblenden
 * Die Bildrate wird einmal beim Start gemessen (measureStartFps in main.tsx); bis dahin gilt die Einschätzung aus
 * Kernzahl und Arbeitsspeicher.
 */
export type EffectTier = 'full' | 'single' | 'none'

let measuredFps: number | null = null

export function isTouchPrimary() {
  if (!isBrowser) return false
  return window.matchMedia('(pointer: coarse)').matches || window.matchMedia('(max-width: 767px)').matches
}

export function weakHardware() {
  if (!isBrowser) return true
  const n = navigator as NavigatorExtras
  return (n.hardwareConcurrency !== undefined && n.hardwareConcurrency <= 2) || (n.deviceMemory !== undefined && n.deviceMemory <= 2) || !!n.connection?.saveData
}

export function effectTier(): EffectTier {
  if (!isBrowser || prefersReducedMotion() || weakHardware()) return 'none'
  if (measuredFps !== null && measuredFps < 40) return 'none'
  return isTouchPrimary() ? 'single' : 'full'
}

/** Einmalige Messung der Bildrate (erste Sekunde nach dem Laden); schreibt html.low-power bei zu wenig Bildern */
export function measureStartFps() {
  if (!isBrowser || measuredFps !== null) return
  let n = 0
  let t0 = 0
  const tick = (t: number) => {
    if (!t0) t0 = t
    n++
    if (t - t0 < 1000) requestAnimationFrame(tick)
    else {
      measuredFps = (n * 1000) / (t - t0)
      if (measuredFps < 40) document.documentElement.classList.add('low-power')
    }
  }
  requestAnimationFrame(tick)
}
