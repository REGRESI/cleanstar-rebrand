import { createElement, Fragment, useEffect, useRef, type CSSProperties, type ElementType } from 'react'
import { ScrollTrigger } from '@/lib/gsap'
import { prefersReducedMotion } from '@/lib/env'
import { cn } from '@/lib/cn'

/**
 * Moment-Überschrift (Referenz: why.zero, „You Believed“): schmale Serifenschrift (Instrument Serif) mit EINEM
 * großen Schreibschrift-Großbuchstaben (Pinyon Script), dessen Schwung unter das Wort greift. Nur für die großen
 * Momente der Seite, nie für normale Überschriften, nur auf hellem Grund.
 *
 * Erscheinen (einmal beim Hineinscrollen, etwa 1,4 s): Buchstaben gestaffelt aus dem Nebel, erst hell, unscharf und
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

export function MomentHeading({
  text,
  as = 'h2',
  id,
  className,
  capStyle,
  play,
  vanish = true,
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
}) {
  const ref = useRef<HTMLElement>(null)
  // \n setzt einen festen Umbruch (im HTML-Text ein Leerzeichen)
  const [cap, ...rest] = Array.from(text)
  const words = rest.join('').replace(/\n/g, ' \n ').split(' ').filter(Boolean)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (prefersReducedMotion() || !document.documentElement.classList.contains('js-motion')) {
      el.setAttribute('data-mo', 'done')
      return
    }
    if (play !== undefined) {
      if (play) el.setAttribute('data-mo', 'on')
      return
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        io.disconnect()
        el.setAttribute('data-mo', 'on')
      },
      { rootMargin: '0px 0px -18% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [play])

  // Verschwinden nach oben, an die Scrollposition gekoppelt
  useEffect(() => {
    const el = ref.current
    if (!el || !vanish || prefersReducedMotion() || !document.documentElement.classList.contains('js-motion')) return
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top 22%',
      end: 'bottom -5%',
      onUpdate: (s) => el.style.setProperty('--out', s.progress.toFixed(3)),
    })
    return () => st.kill()
  }, [vanish])

  let i = 0
  const n = rest.filter((c) => c !== ' ' && c !== '\n').length
  return createElement(
    as,
    { ref, id, className: cn('moment', className), 'data-mo': 'idle', suppressHydrationWarning: true },
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
              {k === 0 && <span className="moment-cap" style={capStyle} data-c={cap} />}
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
