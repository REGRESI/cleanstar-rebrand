import type { Recipient } from './personal'

/** Bedienelemente auf den Seiten: Hier beginnt nie ein Umblättern (Sperrzonen) */
export const BLOCK = 'a, button, input, select, textarea, label, [role="button"], [role="radio"], [role="slider"], [data-interactive]'
/** Ab dieser Strecke (überwiegend waagerecht) ist eine Bewegung ein Wischen, darunter ein Tippen */
export const SWIPE_MIN = 12

/** Seitenzahl und Pfeile für die Bedienleiste */
export interface NavState {
  label: string
  canPrev: boolean
  canNext: boolean
  prev: () => void
  next: () => void
}

/** Was 3D- und flache Mappe von der Seite bekommen: Empfänger, gemeinsamer Seitenzustand, Anfragekarte */
export interface MappeShared {
  recipient: Recipient
  state: Record<string, unknown>
  setState: (key: string, value: unknown) => void
  /** zählt bei jeder Bedienung hoch (für das Neu-Fotografieren der Seiten) */
  version: number
  openRequest: (from: DOMRect) => void
}
