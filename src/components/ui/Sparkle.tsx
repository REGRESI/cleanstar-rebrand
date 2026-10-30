import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { prefersReducedMotion } from '@/lib/env'
import { cn } from '@/lib/cn'

/** Dauer eines Funkelns in ms (muss zur Animation .sparkle in index.css passen) */
const DURATION = 800
/** Nie mehr als drei Sterne gleichzeitig auf der Seite */
const MAX_ACTIVE = 3
let active = 0

/**
 * Glanz-Stern aus dem Markenzeichen: blitzt je Auslösung einmal kurz auf (Skalierung 0 → 1 → 0, leichte Drehung), wenn etwas
 * „sauber wird“. Keine Dauer-Animation. Bei reduzierter Bewegung erscheint er nicht.
 * Auslöser: `play` (z. B. abgehakter Prüfpunkt) oder `onReveal` (sobald der umgebende [data-reveal]-Block fertig ist).
 */
export function Sparkle({
  play,
  onReveal,
  delay = 0,
  className,
  style,
  tone = '#0086F6',
}: {
  play?: boolean
  onReveal?: boolean
  /** Verzögerung in Sekunden ab Auslöser */
  delay?: number
  className?: string
  style?: CSSProperties
  /** Flache Farbe aus den Logo-Blautönen (#00CAF9, #0086F6, #0060F4) */
  tone?: string
}) {
  const ref = useRef<SVGSVGElement>(null)
  const [trigger, setTrigger] = useState(false)
  const [fired, setFired] = useState(false)

  // Auslöser über den umgebenden Reveal-Block (Flag data-revealed)
  useEffect(() => {
    if (!onReveal || !ref.current) return
    const host = ref.current.closest('[data-reveal]')
    if (!host) return
    if (host.hasAttribute('data-revealed')) return
    const mo = new MutationObserver(() => {
      if (host.hasAttribute('data-revealed')) {
        setTrigger(true)
        mo.disconnect()
      }
    })
    mo.observe(host, { attributes: true, attributeFilter: ['data-revealed'] })
    return () => mo.disconnect()
  }, [onReveal])

  const go = play || trigger
  const done = useRef(false)
  // Einmal je Auslösung (fällt der Auslöser weg, z. B. beim Zurückscrollen, darf er beim nächsten Mal wieder funkeln),
  // nur mit Bewegung und nur, solange weniger als drei Sterne funkeln. Der Zähler wird unabhängig vom Komponentenleben
  // wieder freigegeben.
  useEffect(() => {
    if (!go) {
      done.current = false
      setFired(false)
      return
    }
    if (done.current || prefersReducedMotion() || active >= MAX_ACTIVE) return
    done.current = true
    active++
    setFired(true)
    window.setTimeout(() => (active = Math.max(0, active - 1)), delay * 1000 + DURATION)
  }, [go, delay])

  return (
    <svg ref={ref} aria-hidden viewBox="190 501 105 110" className={cn('sparkle', fired && 'is-on', className)} style={{ ...style, ['--sd' as string]: `${delay}s` }}>
      <path
        fill={tone}
        d="M246 503C251.64 545.16 261.04 557.56 293 565 261.04 570.28 251.64 579.08 246 609 239.52 579.08 228.72 570.28 192 565 228.72 557.56 239.52 545.16 246 503Z"
      />
    </svg>
  )
}
