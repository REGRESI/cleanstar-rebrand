import { useId, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { company } from '@/content/company'
import { cn } from '@/lib/cn'

/** Typografisches Siegel: Kreis aus kleiner Versalschrift um eine große „1“ (erster Monat). Rein dekorativ. */
export function SealMark({ className, dark, text: label = 'Erster Monat · jederzeit kündbar · ohne Frist · ' }: { className?: string; dark?: boolean; text?: string }) {
  const id = useId().replace(/:/g, '')
  const ink = dark ? 'var(--color-paper)' : 'var(--color-ink)'
  return (
    <svg viewBox="0 0 120 120" aria-hidden className={className}>
      <defs>
        <path id={`seal-${id}`} d="M60 60 m-46 0 a46 46 0 1 1 92 0 a46 46 0 1 1 -92 0" />
      </defs>
      <text fontSize="8.6" letterSpacing="0.2" fill={ink} style={{ fontFamily: 'var(--font-sans)', fontWeight: 500 }}>
        <textPath href={`#seal-${id}`} startOffset="0" textLength="286" lengthAdjust="spacing">
          {label}
        </textPath>
      </text>
      <text x="60" y="61" textAnchor="middle" dominantBaseline="central" fontSize="46" fontWeight="500" letterSpacing="-2" fill={ink}>
        1
      </text>
    </svg>
  )
}

/**
 * Risikofrei-Siegel „Erster Monat jederzeit kündbar“. Klick öffnet die Vertragsbedingungen.
 * variant="badge": Siegel mit kurzer Zeile (Startseite, Konfigurator, Abschluss)
 * variant="card": großes Siegel mit Text (Qualitätsgarantie, Ablauf)
 */
export function RiskFreeSeal({ variant = 'badge', dark, className }: { variant?: 'badge' | 'card'; dark?: boolean; className?: string }) {
  const [open, setOpen] = useState(false)
  const c = company.contract

  const trigger =
    variant === 'badge' ? (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn('group inline-flex items-center gap-4 text-left', dark ? 'text-paper' : 'text-ink', className)}
        aria-haspopup="dialog"
      >
        <SealMark dark={dark} className="size-16 shrink-0 transition-transform duration-[1200ms] ease-cs group-hover:rotate-[20deg]" />
        <span className="leading-tight">
          <span className="block font-medium">{c.riskFree}</span>
          <span className={cn('ulink mt-1 inline-block font-medium tabular-nums text-[0.75rem]', dark ? 'text-muted-dark' : 'text-muted')}>Bedingungen ansehen</span>
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
        <SealMark dark={dark} className="size-28 shrink-0 transition-transform duration-[1200ms] ease-cs group-hover:rotate-[20deg] sm:size-36" />
        <span className="min-w-0">
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
          <SealMark className="size-24" />
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
