import { useRef, type MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import { Roll } from './Roll'
import { useQuote } from '@/features/configurator/QuoteContext'
import { cn } from '@/lib/cn'

/**
 * Runder Button „Kostenlose Besichtigung“ auf großen Bildern (Referenz: ERA). Ruhezustand: dünner, offener
 * Kreisbogen (drei Viertel), der sich langsam dreht. Überfahren: Der Kreis schließt sich, der Text rollt, der Button
 * folgt der Maus leicht (höchstens 10 px). Handy und reduzierte Bewegung: geschlossener, ruhender Kreis.
 * Link zu /angebot, öffnet per JavaScript den Konfigurator.
 */
export function OrbitButton({ className }: { className?: string }) {
  const { open } = useQuote()
  const el = useRef<HTMLAnchorElement>(null)
  const move = (e: MouseEvent) => {
    const a = el.current
    if (!a) return
    const r = a.getBoundingClientRect()
    const dx = e.clientX - (r.left + r.width / 2)
    const dy = e.clientY - (r.top + r.height / 2)
    const d = Math.hypot(dx, dy) || 1
    const k = Math.min(10, d * 0.18) / d
    a.style.setProperty('--mx', `${(dx * k).toFixed(1)}px`)
    a.style.setProperty('--my', `${(dy * k).toFixed(1)}px`)
  }
  const reset = () => {
    el.current?.style.setProperty('--mx', '0px')
    el.current?.style.setProperty('--my', '0px')
  }
  return (
    <Link
      ref={el}
      to="/angebot"
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey) return
        e.preventDefault()
        open()
      }}
      onMouseMove={move}
      onMouseLeave={reset}
      className={cn('orbit', className)}
    >
      <svg viewBox="0 0 120 120" aria-hidden className="orbit-ring">
        <circle cx="60" cy="60" r="58" pathLength={100} />
      </svg>
      <span className="orbit-label">
        <Roll text="Kostenlose" />
        <Roll text="Besichtigung" />
      </span>
    </Link>
  )
}
