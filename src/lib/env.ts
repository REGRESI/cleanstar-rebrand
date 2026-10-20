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
