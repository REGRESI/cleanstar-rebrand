import { createElement, Fragment, useEffect, useRef, type CSSProperties, type ElementType } from 'react'
import { ScrollTrigger } from '@/lib/gsap'
import { replay } from '@/lib/replay'
import { prefersReducedMotion } from '@/lib/env'
import { cn } from '@/lib/cn'
import { writeCap } from './pen'

// Füller-Pfade erst laden, wenn eine Moment-Überschrift auf der Seite ist
let penData: Promise<Record<string, number[][]>> | null = null
const loadPen = () => (penData ??= import('./penStrokes').then((m) => m.PEN))

/**
 * Moment-Überschrift (Referenz: why.zero, „You Believed“): schmale Serifenschrift (Instrument Serif) mit EINEM
 * großen Schreibschrift-Großbuchstaben (Pinyon Script), dessen Schwung unter das Wort greift. Nur für die großen
 * Momente der Seite, nie für normale Überschriften, nur auf hellem Grund.
 *
 * Erscheinen (bei jedem Hineinscrollen, etwa 1,4 s; beim Verlassen rückwärts): Buchstaben gestaffelt aus dem Nebel, erst hell, unscharf und
 * senkrecht gestreckt (Bewegungsschlieren), 20 px tiefer; dann scharf an ihren Platz, die Farbe läuft als Welle von
 * leuchtendem Himmelblau zu gedecktem Marken- bzw. Navy-Blau. Der Schwung des Großbuchstabens deckt sich von links auf.
 * Verschwinden (an die Scrollposition gekoppelt): nach oben in Unschärfe und Licht.
 * Der Text steht einmal normal im HTML (sr-only), die gezeichneten Teile sind aria-hidden.
 * Position des Großbuchstabens je Überschrift über --cap-x / --cap-y / --cap-s feinjustierbar.
 */
/** Ruhefarbe je Buchstabe: von tiefem Navy-Blau zu sattem Markenblau (als feste Farbe, damit die Welle sauber überblendet) */
function tone(x: number) {
  const a = [0x12, 0x30, 0x6e]
  const b = [0x24, 0x53, 0xcf]
  return '#' + a.map((v, i) => Math.round(v + (b[i] - v) * x).toString(16).padStart(2, '0')).join('')
}

/**
 * Abstände je Schreibschrift-Großbuchstabe (Pinyon Script in 2-facher Größe, Grundlinie 0,05 em tiefer), aus der
 * Tintenfläche der Glyphe gemessen (Zeilenprofil, siehe docs/review-nachbesserung-1/README.md): [Beginn des Serifentexts in der ersten Zeile, in em der
 * Überschrift]. Der Text beginnt erst rechts vom ganzen Schwung, der in die Höhe der Serifenbuchstaben reicht, mit
 * mindestens 0,08 em Luft; die zweite Zeile rückt bündig darunter ein. Der Schwung oberhalb der Zeile darf frei über
 * den Text auslaufen (er berührt ihn nicht).
 */
const CAP_SCALE = 2
const CAP_START: Record<string, number> = { A: 1.81, B: 1.894, C: 1.374, D: 1.74, E: 1.384, F: 1.546, G: 1.404, H: 2.066, I: 1.614, J: 1.516, K: 1.864, L: 1.93, M: 2.08, N: 2.556, O: 1.32, P: 1.776, Q: 1.816, R: 1.81, S: 1.644, T: 1.41, U: 1.354, V: 1.716, W: 2.084, Z: 1.56 }
// Vorschub und rechter Tintenrand je Großbuchstabe (in em der Schreibschrift); für Buchstaben ohne gemessenes Profil
// beginnt der Text vorsichtshalber rechts von der ganzen Tinte
const CAP_ADV: Record<string, number> = { A: 0.795, B: 0.797, C: 0.628, D: 0.792, E: 0.485, F: 0.612, G: 0.527, H: 0.853, I: 0.651, J: 0.596, K: 0.843, L: 0.75, M: 0.935, N: 0.724, O: 0.548, P: 0.629, Q: 0.702, R: 0.857, S: 0.514, T: 0.55, U: 0.504, V: 0.502, W: 0.841, Z: 0.779 }
const CAP_INK: Record<string, number> = { A: 1.047, B: 1.016, C: 0.844, D: 1, E: 0.75, F: 1.094, G: 0.734, H: 1.188, I: 1, J: 0.953, K: 1.281, L: 1.031, M: 1.25, N: 1.391, O: 0.734, P: 0.875, Q: 0.875, R: 0.922, S: 0.891, T: 1.141, U: 0.781, V: 0.891, W: 1.469, Z: 0.875 }

export function MomentHeading({
  text,
  as = 'h2',
  id,
  className,
  capStyle,
  play,
  vanish = true,
  animate = true,
}: {
  /** Erster Buchstabe wird zur Schreibschrift */
  text: string
  as?: ElementType
  id?: string
  className?: string
  capStyle?: CSSProperties
  /** von außen gesteuert starten (z. B. im Kreis-Übergang); sonst beim Hineinscrollen */
  play?: boolean
  /** beim Hinausscrollen nach oben verdampfen */
  vanish?: boolean
  /** Section entrance already supplies the animation; keep the heading readable. */
  animate?: boolean
}) {
  const ref = useRef<HTMLElement>(null)
  // \n setzt einen festen Umbruch (im HTML-Text ein Leerzeichen)
  const [cap, ...rest] = Array.from(text)
  const words = rest.join('').replace(/\n/g, ' \n ').split(' ').filter(Boolean)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!animate || prefersReducedMotion() || !document.documentElement.classList.contains('js-motion')) {
      el.setAttribute('data-mo', 'done')
      return
    }
    // Erscheinen: zuerst schreibt der Füller den Großbuchstaben, danach kommen die Wörter aus dem Nebel
    let pen: { cancel: () => void } | null = null
    let alive = true
    const capEl = el.querySelector<HTMLElement>('.moment-cap')
    const color = capEl ? getComputedStyle(capEl).color : '#12306e'
    const pens = loadPen()
    const show = () => {
      pen?.cancel()
      pen = null
      el.removeAttribute('data-pen')
      el.style.removeProperty('--pen-d')
      el.setAttribute('data-mo', 'on')
      pens.then((all) => {
        if (!alive || el.getAttribute('data-mo') !== 'on' || !capEl) return
        const strokes = all[cap]
        if (!strokes) return
        el.setAttribute('data-pen', 'run')
        const r = writeCap(capEl, cap, strokes, color, () => el.setAttribute('data-pen', 'done'))
        if (!r) return el.removeAttribute('data-pen')
        pen = r
        el.style.setProperty('--pen-d', `${(r.duration * 0.5).toFixed(2)}s`)
      })
    }
    // rückwärts nur, wenn sie zu sehen war (sonst bliebe der Ruhezustand „idle“)
    const hide = () => {
      if (el.getAttribute('data-mo') !== 'on') return
      pen?.cancel()
      pen = null
      el.setAttribute('data-pen', 'done')
      el.setAttribute('data-mo', 'out')
    }
    const stop = () => {
      alive = false
      pen?.cancel()
    }
    if (play !== undefined) {
      if (play) show()
      else hide()
      return stop
    }
    // bei jedem Durchqueren: hinein erscheinen, hinaus (in beide Richtungen) rückwärts verschwinden
    const off = replay(el, show, hide, { start: 'top 92%', end: 'bottom -14%' })
    return () => {
      stop()
      off()
    }
  }, [play, cap, animate])

  // Verschwinden nach oben, an die Scrollposition gekoppelt
  useEffect(() => {
    const el = ref.current
    if (!el || !animate || !vanish || prefersReducedMotion() || !document.documentElement.classList.contains('js-motion')) return
    // Lesbar, bis die Überschrift das obere Viertel erreicht und mindestens 70 % der Bildschirmhöhe gescrollt wurde
    // (sie erscheint bei 82 %, verschwindet also frühestens ab 12 %); dann nach oben
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top 12%',
      end: 'bottom -12%',
      onUpdate: (s) => el.style.setProperty('--out', s.progress.toFixed(3)),
    })
    return () => st.kill()
  }, [vanish, animate])

  let i = 0
  const n = rest.filter((c) => c !== ' ' && c !== '\n').length
  const start = CAP_START[cap] ?? (CAP_INK[cap] ?? 1.5) * CAP_SCALE + 0.08
  const adv = (CAP_ADV[cap] ?? 0.8) * CAP_SCALE
  const capCss = { '--cap-s': CAP_SCALE, '--cap-y': '0.025em', marginRight: `${((start - adv) / CAP_SCALE).toFixed(3)}em`, ...capStyle } as CSSProperties
  return createElement(
    as,
    { ref, id, className: cn('moment', className), 'data-mo': animate ? 'idle' : 'done', style: { '--hang': `${start}em` } as CSSProperties, suppressHydrationWarning: true },
    <span className="sr-only">{text.replace(/\n/g, ' ')}</span>,
    <span aria-hidden className="moment-v">
      {words.map((w, k) => {
        if (w === '\n') return <br key={k} />
        const letters = Array.from(w).map((ch, j) => {
          const x = i++ / Math.max(1, n - 1)
          return <span key={j} className="mo-c" data-c={ch} style={{ '--x': x.toFixed(3), color: tone(x) } as CSSProperties} />
        })
        return (
          <Fragment key={k}>
            {/* Großbuchstabe und erstes Wort bleiben zusammen */}
            <span className="moment-w">
              {k === 0 && (
                <span className="moment-cap" style={capCss} data-c={cap}>
                  {/* Messpunkt auf der Grundlinie hinter der Glyphe (für den Füller-Effekt) */}
                  <i className="mo-probe" />
                </span>
              )}
              {letters}
            </span>
            {k < words.length - 1 && words[k + 1] !== '\n' ? ' ' : null}
          </Fragment>
        )
      })}
    </span>,
  )
}

/**
 * Hintergrund eines Moments: weicher, heller Farbschein in Eisblau, der langsam wandert, dazu ein sehr dezenter
 * Lichtfleck am Mauszeiger (nur Desktop). Der eine dekorative Verlauf der Seite.
 */
export function MomentGlow({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    const host = el?.parentElement
    if (!el || !host || prefersReducedMotion() || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const move = (e: PointerEvent) => {
      const r = host.getBoundingClientRect()
      el.style.setProperty('--mx', `${e.clientX - r.left}px`)
      el.style.setProperty('--my', `${e.clientY - r.top}px`)
      el.style.setProperty('--spot', '1')
    }
    const leave = () => el.style.setProperty('--spot', '0')
    host.addEventListener('pointermove', move)
    host.addEventListener('pointerleave', leave)
    return () => {
      host.removeEventListener('pointermove', move)
      host.removeEventListener('pointerleave', leave)
    }
  }, [])
  return (
    <div ref={ref} aria-hidden className={cn('moment-glow', className)}>
      <span />
      <span />
    </div>
  )
}
