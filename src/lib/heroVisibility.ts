import { useSyncExternalStore } from 'react'

/**
 * Sichtbarkeit des Hero-Einstiegs. Solange er sichtbar ist, blendet sich die Handy-Leiste
 * („Anrufen“, „Angebot“) aus, damit es keinen doppelten Call-to-Action gibt.
 */
let visible = false
const listeners = new Set<() => void>()

export function setHeroVisible(v: boolean) {
  if (v === visible) return
  visible = v
  listeners.forEach((l) => l())
}

export const useHeroVisible = () =>
  useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => visible,
    () => false,
  )
