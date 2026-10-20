import { useSyncExternalStore } from 'react'

export const isBrowser = typeof window !== 'undefined'

function mediaStore(query: string) {
  return {
    subscribe(cb: () => void) {
      if (!isBrowser) return () => {}
      const mq = window.matchMedia(query)
      mq.addEventListener('change', cb)
      return () => mq.removeEventListener('change', cb)
    },
    get: () => (isBrowser ? window.matchMedia(query).matches : false),
  }
}

const reduced = mediaStore('(prefers-reduced-motion: reduce)')
const finePointer = mediaStore('(hover: hover) and (pointer: fine)')
const desktop = mediaStore('(min-width: 1024px)')

/** true, wenn Nutzer reduzierte Bewegung wünschen. Auf dem Server immer false. */
export const useReducedMotion = () => useSyncExternalStore(reduced.subscribe, reduced.get, () => false)
export const useFinePointer = () => useSyncExternalStore(finePointer.subscribe, finePointer.get, () => false)
export const useIsDesktop = () => useSyncExternalStore(desktop.subscribe, desktop.get, () => false)

export const prefersReducedMotion = () => reduced.get()

export type DeviceTier = 'high' | 'low'

/** Grobe Einschätzung der Geräteleistung für 3D. */
export function getDeviceTier(): DeviceTier {
  if (!isBrowser) return 'low'
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } }
  const cores = nav.hardwareConcurrency ?? 4
  const mem = nav.deviceMemory ?? 4
  const small = window.matchMedia('(max-width: 767px)').matches
  if (nav.connection?.saveData) return 'low'
  if (cores <= 4 || mem <= 2) return 'low'
  if (small && (cores <= 6 || mem <= 4)) return 'low'
  return 'high'
}

export function hasWebGL(): boolean {
  if (!isBrowser) return false
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}
