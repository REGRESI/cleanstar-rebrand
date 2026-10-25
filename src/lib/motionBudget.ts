import { isBrowser, prefersReducedMotion } from './env'

type NavigatorExtras = Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } }

/**
 * Sparsamer Modus: Auf schwachen Geräten (höchstens 2 GB Arbeitsspeicher) oder mit aktivem Datensparmodus
 * laufen keine Video-Loops und keine Parallax-Bewegungen. Vorhang-Übergänge bleiben (nur transform und opacity).
 */
export function liteMotion() {
  if (!isBrowser) return true
  const n = navigator as NavigatorExtras
  return prefersReducedMotion() || !!n.connection?.saveData || (n.deviceMemory !== undefined && n.deviceMemory <= 2)
}

/** Bewegung überhaupt erlaubt (reduzierte Bewegung aus, Bewegungsklasse gesetzt) */
export const motionAllowed = () => isBrowser && !prefersReducedMotion() && document.documentElement.classList.contains('js-motion')

/** Handy-Layout: Parallax stark reduziert */
export const isSmallScreen = () => isBrowser && window.matchMedia('(max-width: 767px)').matches
