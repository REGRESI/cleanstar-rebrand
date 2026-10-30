import { useId, useLayoutEffect, useRef, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { company } from '@/content/company'
import { cn } from '@/lib/cn'

/**
 * „1“-Siegel: Kreis in Markenblau mit großer weißer „1“, außen ein Textring in gleichmäßig gesperrten Versalien, der
 * den Kreis genau einmal füllt (textPath mit textLength, keine Lücke, keine Überlappung). Der Ring dreht sich sehr
 * langsam (eine Umdrehung in 40 s), beim Überfahren hält er an. Klein (small) ohne Ring, nur Kreis mit „1“.
 * Rein dekorativ (aria-hidden).
 */
// geschützte Leerzeichen: SVG würde das Leerzeichen am Ende sonst entfernen und der Ring hätte eine Lücke
const RING = 'ERSTER\u00A0MONAT\u00A0·\u00A0JEDERZEIT\u00A0KÜNDBAR\u00A0·\u00A0'
const R = 48
const CIRC = 2 * Math.PI * R

export function SealMark({ className, dark, small }: { className?: string; dark?: boolean; small?: boolean; text?: string }) {
  const id = useId().replace(/:/g, '')
  const tp = useRef<SVGTextPathElement>(null)
  // Abstand gleichmäßig auf alle n Zwischenräume verteilen, auch auf die Naht am Anfang:
  // SVG verteilt textLength nur auf n−1 Zwischenräume, daher L = W + (Umfang − W) · (n − 1) / n
  useLayoutEffect(() => {
    const el = tp.current
    if (!el) return
    const fit = () => {
      el.removeAttribute('textLength')
      const w = (el.parentNode as SVGTextElement).getComputedTextLength()
      const n = Array.from(RING).length
      if (w > 0 && w < CIRC) el.setAttribute('textLength', (w + ((CIRC - w) * (n - 1)) / n).toFixed(2))
    }
    fit()
    document.fonts?.ready.then(fit)
  }, [])
  const ink = dark ? 'var(--color-paper)' : 'var(--color-ink)'
  const fill = dark ? 'var(--color-blue-on-dark)' : 'var(--color-blue)'
  const one = dark ? 'var(--color-night)' : '#fff'
  return (
    <svg viewBox={small ? '22 22 76 76' : '0 0 120 120'} aria-hidden className={cn('seal', className)}>
      <defs>
        <path id={`seal-${id}`} d={`M60 ${60 - R} a${R} ${R} 0 1 1 -0.001 0`} />
      </defs>
      <circle cx="60" cy="60" r="34" fill={fill} />
      <text x="60" y="62" textAnchor="middle" dominantBaseline="central" fontSize="44" fontWeight="500" letterSpacing="-1" fill={one} style={{ fontFamily: 'var(--font-sans)' }}>
        1
      </text>
      {!small && (
        <g className="seal-ring">
          <text fontSize="11.2" fill={ink} style={{ fontFamily: 'var(--font-sans)', fontWeight: 500 }}>
            <textPath ref={tp} href={`#seal-${id}`} startOffset="0" textLength={CIRC.toFixed(2)} lengthAdjust="spacing">
              {RING}
            </textPath>
          </text>
        </g>
      )}
    </svg>
  )
}

/**
 * Risikofrei-Siegel „Erster Monat jederzeit kündbar“: rundes „1“-Siegel mit Zeile, Klick öffnet die Vertragsbedingungen.
 * variant="badge": Siegel mit kurzer Zeile (Startseite, Konfigurator, Abschluss, Reinigungs-Check)
 * variant="card": großes Siegel mit Text (Ablauf, Konfigurator)
 */
export function RiskFreeSeal({
  variant = 'badge',
  dark,
  className,
  label,
}: {
  variant?: 'badge' | 'card'
  dark?: boolean
  className?: string
  /** eigene Formulierung (gleiche Aussage), damit sie pro Seite nicht mehrfach wörtlich steht */
  label?: string
}) {
  const [open, setOpen] = useState(false)
  const c = company.contract

  const trigger =
    variant === 'badge' ? (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn('group inline-flex items-center gap-4 text-left leading-snug', dark ? 'text-paper' : 'text-ink', className)}
        aria-haspopup="dialog"
      >
        <SealMark dark={dark} small className="size-12 shrink-0" />
        <span>
          <span className="block font-medium">{label ?? c.riskFree}.</span>
          <span className={cn('ulink mt-1 inline-block text-[0.875rem]', dark ? 'text-link-dark hover:text-paper' : 'text-muted')}>Vertragsbedingungen ansehen</span>
        </span>
      </button>
    ) : (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'group flex w-full flex-col items-start gap-6 border-t py-8 text-left sm:flex-row sm:items-center sm:gap-10',
          dark ? 'border-line-dark text-paper' : 'border-line text-ink',
          className,
        )}
        aria-haspopup="dialog"
      >
        <SealMark dark={dark} className="size-32 shrink-0 sm:size-40" />
        <span className="block min-w-0">
          <span className="t-label block">Ohne Risiko starten</span>
          <span className="t-h3 mt-3 block">{c.riskFree}</span>
          <span className={cn('measure mt-3 block', dark ? 'text-muted-dark' : 'text-ink-2')}>
            Überzeugt Sie unsere Arbeit im ersten Monat nicht, kündigen Sie. Ohne Frist und ohne Begründung.
          </span>
          <span className="tlink mt-5">
            Vertragsbedingungen <ArrowRight aria-hidden className="size-4" strokeWidth={1.75} />
          </span>
        </span>
      </button>
    )

  return (
    <>
      {trigger}
      <Modal open={open} onClose={() => setOpen(false)} title="Vertragsbedingungen">
        <div className="p-7 sm:p-10">
          <SealMark className="size-28" />
          <h2 className="t-h3 mt-6">{c.riskFree}.</h2>
          <p className="mt-3 leading-relaxed text-ink-2">Sie sollen uns erst an der Arbeit messen, bevor Sie sich binden. Deshalb gilt für jeden neuen Vertrag:</p>
          <ul className="mt-8 border-t border-line">
            {[
              ['Erster Monat', c.firstMonth],
              ['Ab dem zweiten Monat', c.afterwards],
              ['Schriftlich festgehalten', 'Leistungen, Intervalle und Preis stehen in Ihrem Angebot schwarz auf weiß.'],
            ].map(([t, d], i) => (
              <li key={t} className="grid grid-cols-[2rem_1fr] gap-x-3 border-b border-line py-4">
                <span className="t-label pt-0.5">{String(i + 1).padStart(2, '0')}</span>
                <span>
                  <span className="block font-medium">{t}</span>
                  <span className="text-ink-2">{d}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Modal>
    </>
  )
}
