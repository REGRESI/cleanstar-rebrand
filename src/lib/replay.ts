import { ScrollTrigger } from './gsap'

/**
 * Zeitgesteuerte Einblendung, die bei JEDEM Durchqueren läuft (wie toggleActions „play reverse play reverse“):
 * Betritt das Element den Bereich (von unten oder beim Hochscrollen von oben), läuft sie vorwärts (onIn); verlässt es
 * ihn in eine der beiden Richtungen, läuft sie rückwärts (onOut). Kein „schon gesehen“-Merker.
 * Steht das Element beim Einrichten schon im Bereich (Neuladen mitten auf der Seite), läuft sie sofort vorwärts.
 * Gibt eine Aufräumfunktion zurück.
 */
export function replay(
  el: Element,
  onIn: () => void,
  onOut: () => void,
  { start = 'top 88%', end = 'bottom 8%' }: { start?: string; end?: string } = {},
) {
  let on = false
  const set = (v: boolean) => {
    if (v === on) return
    on = v
    if (v) onIn()
    else onOut()
  }
  const st = ScrollTrigger.create({
    trigger: el,
    start,
    end,
    onToggle: (s) => set(s.isActive),
  })
  if (st.isActive) set(true)
  return () => st.kill()
}
