import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { company } from '@/content/company'
import { cn } from '@/lib/cn'

/**
 * Hinweis „Erster Monat jederzeit kündbar“ als ruhiger Text mit Link zu den Vertragsbedingungen (kein Siegel).
 * variant="badge": eine Zeile (Konfigurator, Abschluss)
 * variant="card": kurzer Absatz mit Haarlinie (Ablauf)
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
      <button type="button" onClick={() => setOpen(true)} className={cn('text-left leading-snug', dark ? 'text-paper' : 'text-ink', className)} aria-haspopup="dialog">
        <span className="block font-medium">{label ?? c.riskFree}.</span>
        <span className={cn('ulink mt-1 inline-block text-[0.875rem]', dark ? 'text-link-dark hover:text-paper' : 'text-muted')}>Vertragsbedingungen ansehen</span>
      </button>
    ) : (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn('block w-full border-t py-8 text-left', dark ? 'border-line-dark text-paper' : 'border-line text-ink', className)}
        aria-haspopup="dialog"
      >
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
          <h2 className="t-h3">{c.riskFree}.</h2>
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
