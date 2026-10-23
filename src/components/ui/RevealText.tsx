import { createElement, Fragment, useLayoutEffect, useRef, type ElementType, type ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { noOrphan } from '@/lib/format'

/** Setzt je Wort die Zeilennummer (--l), damit der Text Zeile für Zeile erscheint. */
export function markLines(host: Element) {
  let top: number | null = null
  let line = -1
  host.querySelectorAll<HTMLElement>('[data-reveal-word]').forEach((w) => {
    const y = (w.parentElement as HTMLElement).offsetTop
    if (y !== top) {
      top = y
      line++
    }
    w.style.setProperty('--l', String(line))
  })
}

// Dieselbe Logik als Inline-Skript: läuft im vorgerenderten HTML direkt nach der Überschrift, noch vor dem ersten Zeichnen
const inlineMarkLines = `(function(h){if(!h)return;var t=null,l=-1;h.querySelectorAll('[data-reveal-word]').forEach(function(w){var y=w.parentElement.offsetTop;if(y!==t){t=y;l++}w.style.setProperty('--l',l)})})(document.currentScript&&document.currentScript.previousElementSibling)`

/**
 * Überschrift, die Zeile für Zeile aus einer Maske nach oben gleitet.
 * Start beim Scrollen (siehe useScrollReveals) oder sofort (`immediate`, per CSS, für den Seitenkopf).
 * Bei reduzierter Bewegung steht der Text sofort.
 */
export function RevealText({
  as = 'h2',
  text,
  className,
  immediate,
  id,
  kicker,
  wordsClassName,
}: {
  as?: ElementType
  text: string
  className?: string
  immediate?: boolean
  id?: string
  /** Vorzeile innerhalb derselben Überschrift (z. B. Keyword-Zeile in Monospace über der Leitidee) */
  kicker?: ReactNode
  /** Klassen für den Block mit den Wörtern (nur zusammen mit kicker sinnvoll) */
  wordsClassName?: string
}) {
  const ref = useRef<HTMLElement>(null)
  // Fester Umbruch mit \n (z. B. nach „Sauber.“). Dann keine Bindung der letzten Wörter: Die Zeilen sind gesetzt.
  // Sonst: h1 ist auf dem Handy größer gesetzt, daher dort eine kürzere Grenze
  const lines = text.split('\n')
  const words = lines.length > 1 ? lines.flatMap((l, i) => l.split(' ').map((w, j) => (i > 0 && j === 0 ? '\n' + w : w))) : noOrphan(text, as === 'h1' ? 18 : 20).split(' ')

  // Bei Seitenwechseln im Browser (kein vorgerendertes HTML) die Zeilen vor dem ersten Zeichnen bestimmen
  useLayoutEffect(() => {
    if (immediate && ref.current && !ref.current.hasAttribute('data-revealed')) markLines(ref.current)
  }, [immediate, text])

  const wordEls = words.map((w, i) => (
    <Fragment key={i}>
      {w.startsWith('\n') && <br />}
      <span className="inline-block overflow-hidden pb-[0.14em] align-bottom" style={{ marginBottom: '-0.14em' }}>
        <span data-reveal-word="" suppressHydrationWarning>
          {w.replace('\n', '')}
        </span>
      </span>
      {i < words.length - 1 ? ' ' : null}
    </Fragment>
  ))
  const heading = createElement(
    as,
    { ref, className: cn(immediate && 'reveal-now', className), 'data-reveal-text': immediate ? undefined : '', id },
    kicker,
    wordsClassName ? <span className={wordsClassName}>{wordEls}</span> : wordEls,
  )
  if (!immediate) return heading
  return (
    <>
      {heading}
      <script dangerouslySetInnerHTML={{ __html: inlineMarkLines }} />
    </>
  )
}
