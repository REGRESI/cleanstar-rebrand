import { createElement, Fragment, useEffect, useRef, type ReactNode } from 'react'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { paintLetters } from '@/lib/scrollScene'
import { prefersReducedMotion } from '@/lib/env'
import { cn } from '@/lib/cn'

/**
 * Buchstaben eines Wortes als einzelne Spans (für den Färbeeffekt). Das Wort bleibt eine Einheit, Umbrüche ändern
 * sich nicht. Für Screenreader steht der Text daneben einmal am Stück (siehe ScrubText).
 */
export function Letters({ text, className }: { text: string; className?: string }) {
  return (
    <>
      {Array.from(text).map((ch, i) => (
        <span key={i} data-l className={cn('scrub-l', className)}>
          {ch}
        </span>
      ))}
    </>
  )
}

/**
 * Text, der sich beim Hineinscrollen Buchstabe für Buchstabe färbt: von gedämpft zum vollen Textton, mit weicher
 * Überlappung über etwa acht Buchstaben, wie ein gleichmäßiges Wischen. Nicht gepinnt, gekoppelt an die Lage im
 * Bildschirm. Für große Einleitungs-Überschriften und -Sätze (je Seite ein bis zwei Stellen), nicht für Fließtext.
 * Im HTML steht der Text vollständig in voller Farbe; ohne Bewegung bleibt er so.
 */
export function ScrubText({
  as = 'p',
  text,
  className,
  id,
  start = 'top 88%',
  end = 'top 42%',
  accentLast = 0,
  onComplete,
  children,
}: {
  as?: 'h1' | 'h2' | 'h3' | 'p'
  text: string
  className?: string
  id?: string
  start?: string
  end?: string
  /** Die letzten n Wörter enden in der Akzentfarbe (--scrub-accent) */
  accentLast?: number
  /** Einmal, sobald der letzte Buchstabe ganz gefärbt ist */
  onComplete?: () => void
  /** Zusatz hinter dem Text (z. B. Glanz-Stern) */
  children?: ReactNode
}) {
  const ref = useRef<HTMLElement>(null)
  const done = useRef(onComplete)
  done.current = onComplete

  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion() || !document.documentElement.classList.contains('js-motion')) return
    const letters = Array.from(el.querySelectorAll<HTMLElement>('[data-l]'))
    const last = new Float32Array(letters.length).fill(-1)
    let fired = false
    const paint = (t: number) => {
      paintLetters(letters, t, last)
      if (!fired && last[letters.length - 1] >= 1) {
        fired = true
        done.current?.()
      }
    }
    paint(0)
    const st = ScrollTrigger.create({ trigger: el, start, end, scrub: 0.5, animation: gsap.to({}, { duration: 1 }), onUpdate: (self) => paint(self.progress) })
    paint(st.progress)
    return () => st.kill()
  }, [start, end])

  // Zeilenumbrüche im Text (\n) bleiben als <br> erhalten
  const words = text.split(/( |\n)/).filter((w) => w !== ' ' && w !== '')
  return createElement(
    as,
    { ref, id, className },
    <span className="sr-only">{text}</span>,
    <span aria-hidden>
      {words.map((w, i) =>
        w === '\n' ? (
          <br key={i} />
        ) : (
          <Fragment key={i}>
            {i > 0 && words[i - 1] !== '\n' && ' '}
            <span className={cn('whitespace-nowrap', i >= words.length - accentLast && 'scrub-accent')}>
              <Letters text={w} />
            </span>
          </Fragment>
        ),
      )}
      {children}
    </span>,
  )
}
