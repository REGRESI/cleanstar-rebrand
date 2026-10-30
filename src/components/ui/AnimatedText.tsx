import { createElement, Fragment, forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useRef, type ElementType, type ReactNode } from 'react'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { paintLetters } from '@/lib/scrollScene'
import { prefersReducedMotion } from '@/lib/env'
import { noOrphan } from '@/lib/format'
import { cn } from '@/lib/cn'

/**
 * EIN Text-System für die ganze Website, drei Modi:
 *
 * headline   Alle H1 und H2, einmalig beim Hineinscrollen (bzw. sofort im Seitenkopf): Zeile für Zeile erscheint der
 *            Text blass, 10 px von unten und kurz unscharf; dann läuft eine Farbwelle Buchstabe für Buchstabe von
 *            links nach rechts: hellgrau, Spitze in Markenblau, dahinter die fertige Textfarbe (auf Navy: hellgrau,
 *            helles Blau, Weiß). Gesamtdauer etwa 1,2 bis 1,5 s. Rein per CSS, JavaScript setzt nur Zeilen und Start.
 * paragraph  Ein bis zwei Kernabsätze je Seite, an die Scrollposition gekoppelt: gleiche Farbfolge, Buchstabe für
 *            Buchstabe (siehe ScrubStatement für Absätze mit Bildkacheln).
 * type       Nur im Hero: Buchstabe für Buchstabe getippt und von links wieder „weggetippt“ (TypeText).
 *
 * Regeln: Der Text steht einmal vollständig im HTML (für Screenreader und Suchmaschinen), die sichtbaren Buchstaben
 * sind gezeichnet (CSS ::before) und aria-hidden. Wörter bleiben Einheiten (kein Umbruch im Wort, keine Trennung).
 * Ohne Bewegung (prefers-reduced-motion oder ohne JavaScript) steht der Text sofort fertig.
 */

export type TextMode = 'headline' | 'paragraph'

/** Wörter (bei \n mit festem Umbruch) aus gezeichneten Buchstaben */
function Glyphs({ text, letterClass }: { text: string; letterClass: string }) {
  const lines = text.split('\n')
  return (
    <>
      {lines.map((line, li) => (
        <Fragment key={li}>
          {li > 0 && <br />}
          {line
            .split(' ')
            .filter(Boolean)
            .map((w, i, arr) => (
              <Fragment key={i}>
                <span className="at-w" suppressHydrationWarning>
                  {Array.from(w).map((ch, j) => (
                    <span key={j} className={letterClass} data-c={ch} suppressHydrationWarning />
                  ))}
                </span>
                {i < arr.length - 1 ? ' ' : null}
              </Fragment>
            ))}
        </Fragment>
      ))}
    </>
  )
}

/** Zeilennummer je Wort (--l) und Lage je Buchstabe in seiner Zeile (--x, 0 bis 1) */
export function markGlyphLines(host: Element) {
  const words = host.querySelectorAll<HTMLElement>('.at-w')
  let top: number | null = null
  let line = -1
  const rows: HTMLElement[][] = []
  words.forEach((w) => {
    const y = w.offsetTop
    if (top === null || Math.abs(y - top) > 4) {
      top = y
      line++
      rows.push([])
    }
    w.style.setProperty('--l', String(line))
    rows[line].push(w)
  })
  for (const row of rows) {
    const letters = row.flatMap((w) => Array.from(w.children) as HTMLElement[])
    const n = Math.max(1, letters.length - 1)
    letters.forEach((c, i) => c.style.setProperty('--x', (i / n).toFixed(3)))
  }
  return Math.max(1, rows.length)
}

/** Dauer der Welle in ms für n Zeilen (muss zu den CSS-Werten passen, siehe .at-h in index.css) */
export const waveMs = (lines: number) => (lines - 1) * 120 + 250 + 550 + 500

/** Startet die Welle (Zeilen bestimmen, Endfarbe festhalten) und markiert sie danach als gelaufen */
export function playHeadline(el: HTMLElement, onDone?: () => void) {
  if (el.hasAttribute('data-at-done') || el.hasAttribute('data-at-on')) return
  const lines = markGlyphLines(el)
  el.style.setProperty('--at-to', getComputedStyle(el).color)
  el.setAttribute('data-at-on', '')
  window.setTimeout(() => {
    el.removeAttribute('data-at-on')
    el.setAttribute('data-at-done', '')
    onDone?.()
  }, waveMs(lines) + 80)
}

// Dasselbe als Inline-Skript direkt nach einer sofort startenden Überschrift: läuft im vorgerenderten HTML noch vor
// dem ersten Zeichnen, damit der Seitenkopf nicht auf JavaScript wartet
const inlinePlay = `(function(h){if(!h||!document.documentElement.classList.contains('js-motion'))return;var t=null,l=-1,r=[];h.querySelectorAll('.at-w').forEach(function(w){var y=w.offsetTop;if(t===null||Math.abs(y-t)>4){t=y;l++;r.push([])}w.style.setProperty('--l',l);r[l].push(w)});r.forEach(function(row){var c=[];row.forEach(function(w){c=c.concat([].slice.call(w.children))});var n=Math.max(1,c.length-1);c.forEach(function(e,i){e.style.setProperty('--x',(i/n).toFixed(3))})});h.style.setProperty('--at-to',getComputedStyle(h).color);h.setAttribute('data-at-on','')})(document.currentScript&&document.currentScript.previousElementSibling)`

export function AnimatedText({
  as = 'h2',
  mode = 'headline',
  text,
  className,
  id,
  immediate,
  trigger,
  kicker,
  kickerAfter,
  wordsClassName,
  orphans = true,
  onDone,
  children,
}: {
  as?: ElementType
  mode?: TextMode
  text: string
  className?: string
  id?: string
  /** headline: sofort starten (Seitenkopf), nicht erst beim Hineinscrollen */
  immediate?: boolean
  /** headline: von außen starten (statt beim Hineinscrollen) */
  trigger?: boolean
  /** Vorzeile innerhalb derselben Überschrift (z. B. Keyword-Zeile zur Leitidee), ohne Effekt */
  kicker?: ReactNode
  /** Vorzeile optisch unter die Wörter setzen; im HTML bleibt sie vorn */
  kickerAfter?: boolean
  wordsClassName?: string
  /** letzte Wörter zusammenhalten (kein einzelnes Wort in der letzten Zeile) */
  orphans?: boolean
  /** headline: nach der Welle (z. B. Ring-Puls am Porträt danach) */
  onDone?: () => void
  /** Zusatz hinter dem Text (z. B. Porträt am Ende der Überschrift) */
  children?: ReactNode
}) {
  const ref = useRef<HTMLElement>(null)
  const done = useRef(onDone)
  done.current = onDone
  const shown = text.includes('\n') || !orphans ? text : noOrphan(text, as === 'h1' ? 18 : 20)

  // headline: sofortiger Start bei Seitenwechseln im Browser (kein vorgerendertes HTML), sonst beim Hineinscrollen
  useLayoutEffect(() => {
    const el = ref.current
    if (!el || mode !== 'headline') return
    if (!document.documentElement.classList.contains('js-motion') || prefersReducedMotion()) {
      el.setAttribute('data-at-done', '')
      done.current?.()
      return
    }
    if (immediate) {
      if (el.hasAttribute('data-at-on')) {
        // vom Inline-Skript gestartet: nur noch das Ende markieren
        const lines = markGlyphLines(el)
        const t = window.setTimeout(() => {
          el.removeAttribute('data-at-on')
          el.setAttribute('data-at-done', '')
          done.current?.()
        }, waveMs(lines) + 80)
        return () => window.clearTimeout(t)
      }
      playHeadline(el, () => done.current?.())
      return
    }
    // von außen gesteuert (z. B. Wisch-Zeile): erst starten, wenn trigger wahr wird
    if (trigger !== undefined) {
      if (trigger) playHeadline(el, () => done.current?.())
      return
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        io.disconnect()
        playHeadline(el, () => done.current?.())
      },
      { rootMargin: '0px 0px -12% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [mode, immediate, text, trigger])

  // paragraph: Färbung an die Scrollposition gekoppelt
  useEffect(() => {
    const el = ref.current
    if (!el || mode !== 'paragraph' || prefersReducedMotion() || !document.documentElement.classList.contains('js-motion')) return
    const letters = Array.from(el.querySelectorAll<HTMLElement>('.at-p'))
    const last = new Float32Array(letters.length).fill(-1)
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top 82%',
      end: 'bottom 50%',
      scrub: 0.5,
      animation: gsap.to({}, { duration: 1 }),
      onUpdate: (s) => paintLetters(letters, s.progress, last, 10),
    })
    paintLetters(letters, st.progress, last, 10)
    return () => st.kill()
  }, [mode, text])

  const glyphs = <Glyphs text={shown} letterClass={mode === 'headline' ? 'at-c' : 'at-c at-p'} />
  const visible = (
    <span aria-hidden className={cn(kickerAfter && '-order-1', wordsClassName)}>
      {glyphs}
      {children}
    </span>
  )
  const el = createElement(
    as,
    {
      ref,
      id,
      className: cn(mode === 'headline' ? 'at-h' : 'at-para', kickerAfter && 'flex flex-col', className),
      suppressHydrationWarning: true,
    },
    kicker,
    <span className="sr-only">{text.replace(/\n/g, ' ')}</span>,
    visible,
  )
  if (mode !== 'headline' || !immediate) return el
  return (
    <>
      {el}
      <script dangerouslySetInnerHTML={{ __html: inlinePlay }} />
    </>
  )
}

/**
 * Modus „type“ (Hero): Buchstaben erscheinen scroll-gesteuert nacheinander, die zuletzt erschienenen zwei bis drei
 * stehen blass bzw. in hellem Markenblau; beim Weiterscrollen verschwinden sie von links wieder. Der Satz steht
 * zusätzlich vollständig im HTML (sr-only). Steuerung von außen über set(typed, deleted), je 0 bis 1.
 */
export interface TypeHandle {
  set: (typed: number, deleted: number) => void
}

export const TypeText = forwardRef<TypeHandle, { text: string; className?: string }>(function TypeText({ text, className }, ref) {
  const host = useRef<HTMLSpanElement>(null)
  const state = useRef<Uint8Array | null>(null)
  useImperativeHandle(ref, () => ({
    set(typed, deleted) {
      const el = host.current
      if (!el) return
      const letters = el.querySelectorAll<HTMLElement>('.ty-c')
      const n = letters.length
      if (!state.current || state.current.length !== n) state.current = new Uint8Array(n).fill(255)
      const shown = Math.round(Math.max(0, Math.min(1, typed)) * n)
      const gone = Math.round(Math.max(0, Math.min(1, deleted)) * n)
      for (let i = 0; i < n; i++) {
        // 0 noch nicht, 1 fertig, 2 Spitze (blau), 3 neuester (blass), 4 weggetippt
        const s = i < gone ? 4 : i >= shown ? 0 : shown < n && i === shown - 1 ? 3 : shown < n && i >= shown - 3 ? 2 : 1
        if (state.current[i] !== s) {
          state.current[i] = s
          letters[i].dataset.s = String(s)
        }
      }
    },
  }))
  return (
    <span ref={host} className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {text.split(' ').map((w, i, arr) => (
          <Fragment key={i}>
            <span className="whitespace-nowrap">
              {Array.from(w).map((ch, j) => (
                <span key={j} className="ty-c" data-c={ch} data-s="0" />
              ))}
            </span>
            {i < arr.length - 1 ? ' ' : null}
          </Fragment>
        ))}
      </span>
    </span>
  )
})
