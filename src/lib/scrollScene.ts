import { useEffect, type RefObject } from 'react'
import { gsap, ScrollTrigger } from './gsap'
import { prefersReducedMotion } from './env'
import { EASE_CS } from './ease'

/**
 * Scroll-Stopper: Ein Abschnitt bleibt stehen (CSS sticky, siehe .scene in index.css), und der Fortschritt t (0 bis 1)
 * folgt der Scrollposition (ScrollTrigger mit scrub). Sticky statt GSAP-Pin: kein eingefügter Abstand, keine Layoutverschiebung.
 *
 * Ohne JavaScript oder bei reduzierter Bewegung (keine Klasse .js-motion) zeigt das CSS sofort den Endzustand;
 * apply wird dann nie aufgerufen. Sehr niedrige Bildschirme: Der Abschnitt steht nicht, t läuft beim Durchscrollen.
 */
export function useScrollScene(ref: RefObject<HTMLElement | null>, apply: (t: number) => void) {
  useEffect(() => {
    const root = ref.current
    if (!root || prefersReducedMotion() || !document.documentElement.classList.contains('js-motion')) return
    apply(0)
    const flow = window.matchMedia('(max-height: 620px)').matches
    const st = ScrollTrigger.create({
      trigger: root,
      start: flow ? 'top 70%' : 'top top',
      end: flow ? 'bottom 60%' : 'bottom bottom',
      scrub: 0.6,
      animation: gsap.to({}, { duration: 1 }),
      onUpdate: (self) => apply(self.progress),
    })
    // sofort den richtigen Stand zeigen (z. B. nach einem Neuladen mitten im Abschnitt)
    apply(st.progress)
    return () => st.kill()
    // apply ist pro Abschnitt fest (arbeitet nur auf DOM-Elementen), daher nur einmal einrichten
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}

/** Anteil von t im Bereich [a, b], begrenzt auf 0 bis 1 */
export const span = (t: number, a: number, b: number) => Math.max(0, Math.min(1, (t - a) / (b - a)))
/** Wie span, aber mit der Bewegungskurve der Website */
export const spanEase = (t: number, a: number, b: number) => EASE_CS(span(t, a, b))

/**
 * Wort-für-Wort-Färbung: setzt --p (0 bis 1) je Wort; soft = Breite des weichen Übergangs in Wörtern.
 * Gibt die Werte zurück, damit Aufrufer daran weitere Zustände knüpfen können.
 */
export function paintWords(words: HTMLElement[], x: number, last: Float32Array, soft = 2.6) {
  const n = words.length
  const pos = Math.max(0, Math.min(1, x)) * (n + soft)
  for (let i = 0; i < n; i++) {
    const p = Math.max(0, Math.min(1, (pos - i) / soft))
    if (Math.abs(p - last[i]) > 0.002 || (p === 1 && last[i] !== 1) || (p === 0 && last[i] !== 0)) {
      last[i] = p
      words[i].style.setProperty('--p', p.toFixed(3))
    }
  }
  return last
}

/**
 * Buchstabe-für-Buchstabe-Färbung: setzt --p (0 bis 1) je Buchstabe. soft = Breite des weichen Übergangs in
 * Buchstaben (6 bis 10 wirkt wie ein gleichmäßiges Wischen, nicht wie einzelnes Aufploppen).
 */
export function paintLetters(letters: HTMLElement[], x: number, last: Float32Array, soft = 8) {
  return paintWords(letters, x, last, soft)
}
