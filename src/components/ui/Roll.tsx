import { useEffect } from 'react'

/**
 * Text, der beim Überfahren und bei Tastatur-Fokus rollt (Referenz: ERA, era/10-button-roll): Jeder Buchstabe rollt
 * einzeln nach oben weg, dieselbe Zeile rollt von unten nach, gestaffelt von links (15 ms je Buchstabe, 450 ms,
 * cubic-bezier(0.7, 0, 0.2, 1)). Auf Touch-Geräten und bei reduzierter Bewegung kein Roll.
 *
 * Im Ruhezustand steht der normale, ungeteilte Text (echtes Kerning, lesbar für Screenreader). Erst beim Auslösen
 * legt das Skript eine gezeichnete Kopie darüber: jeder Buchstabe an seiner gemessenen Position im echten Text, also
 * mit demselben Kerning; der echte Text wird solange nur unsichtbar (Breite bleibt). Nach dem Roll wird die Kopie
 * entfernt. Der Clip-Rahmen hat oben und unten Luft (Umlaut-Punkte, Unterlängen), die Rollstrecke ist seine volle
 * Höhe, ganzzahlig. Ein begonnener Roll läuft immer zu Ende (schnell rein und raus hinterlässt keinen Zwischenstand).
 * Lange Beschriftungen (ganze Sätze) rollen nicht: Sie müssen umbrechen können.
 */
const MAX = 32
const DUR = 450
const STEP = 15
const EASE = 'cubic-bezier(0.7, 0, 0.2, 1)'

export function Roll({ text, className }: { text: string; className?: string }) {
  useEffect(installRoll, [])
  if (text.length > MAX) return <span className={className}>{text}</span>
  return (
    <span className={className ? `roll ${className}` : 'roll'}>
      <span className="roll-t">{text}</span>
    </span>
  )
}

const running = new WeakSet<HTMLElement>()

/** Einen Roll abspielen (läuft immer vollständig, ein zweiter Auslöser währenddessen wird ignoriert) */
export function playRoll(roll: HTMLElement) {
  if (running.has(roll)) return
  const t = roll.querySelector<HTMLElement>('.roll-t')
  const node = t?.firstChild
  if (!t || !node || node.nodeType !== Node.TEXT_NODE) return
  const str = node.textContent ?? ''
  const box = roll.getBoundingClientRect()
  const H = Math.round(box.height)
  if (!H) return
  running.add(roll)

  // Buchstabenpositionen im echten Text messen (mit Kerning), relativ zum Rahmen
  const range = document.createRange()
  const glyphs: { ch: string; x: number; y: number; h: number }[] = []
  let i = 0
  for (const ch of Array.from(str)) {
    const len = ch.length
    if (ch.trim()) {
      range.setStart(node, i)
      range.setEnd(node, i + len)
      const r = range.getBoundingClientRect()
      glyphs.push({ ch, x: r.left - box.left, y: r.top - box.top, h: r.height })
    }
    i += len
  }

  const layer = document.createElement('span')
  layer.className = 'roll-o'
  layer.setAttribute('aria-hidden', 'true')
  const anims: Animation[] = []
  const timing = (k: number): KeyframeAnimationOptions => ({ duration: DUR, delay: k * STEP, easing: EASE, fill: 'both' })
  glyphs.forEach((g, k) => {
    for (const from of [0, H]) {
      const s = document.createElement('span')
      s.className = 'roll-g'
      s.textContent = g.ch
      s.style.left = `${g.x}px`
      s.style.top = `${g.y}px`
      // Zeilenhöhe = Höhe der Schriftfläche: Die Glyphe steht dann genau dort, wo sie im echten Text steht
      s.style.lineHeight = `${g.h}px`
      layer.appendChild(s)
      anims.push(s.animate([{ transform: `translate3d(0, ${from}px, 0)` }, { transform: `translate3d(0, ${from - H}px, 0)` }], timing(k)))
    }
  })
  roll.appendChild(layer)
  roll.classList.add('is-rolling')
  const end = () => {
    roll.classList.remove('is-rolling')
    layer.remove()
    running.delete(roll)
  }
  Promise.all(anims.map((a) => a.finished)).then(end, end)
}

/** Ein gemeinsamer Zuhörer für die ganze Seite: Zeiger über einen Link oder Button, Tastatur-Fokus */
let installed = false
function installRoll() {
  if (installed || typeof window === 'undefined') return
  installed = true
  const allowed = () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const hosts = 'a, button, summary, label, [data-roll-host]'
  const rollsIn = (host: Element) => host.querySelectorAll<HTMLElement>('.roll')
  document.addEventListener(
    'pointerover',
    (e) => {
      if (e.pointerType === 'touch' || !allowed()) return
      const host = (e.target as Element).closest?.(hosts)
      // nur beim Eintreten in den Host, nicht bei jedem Wechsel zwischen seinen Kindern
      if (!host || (e.relatedTarget instanceof Node && host.contains(e.relatedTarget))) return
      rollsIn(host).forEach(playRoll)
    },
    { passive: true },
  )
  document.addEventListener('focusin', (e) => {
    const host = (e.target as Element).closest?.(hosts)
    if (!host || !allowed() || !(e.target as Element).matches(':focus-visible')) return
    rollsIn(host).forEach(playRoll)
  })
}
