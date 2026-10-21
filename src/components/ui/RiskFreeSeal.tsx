import { useId, useState } from 'react'
import { Check, ChevronRight } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { company } from '@/content/company'
import { cn } from '@/lib/cn'

/** Rundes Siegel als SVG: Text auf dem Kreis, Haken in der Mitte. Rein dekorativ. */
export function SealMark({ className, dark, text: label = 'ERSTER MONAT · JEDERZEIT KÜNDBAR · OHNE RISIKO ·' }: { className?: string; dark?: boolean; text?: string }) {
  const id = useId().replace(/:/g, '')
  const ring = dark ? 'rgb(255 255 255 / 0.28)' : 'rgb(31 94 255 / 0.25)'
  const text = dark ? '#fff' : 'var(--color-ink)'
  return (
    <svg viewBox="0 0 120 120" aria-hidden className={className}>
      <defs>
        <path id={`seal-${id}`} d="M60 60 m-43 0 a43 43 0 1 1 86 0 a43 43 0 1 1 -86 0" />
      </defs>
      <circle cx="60" cy="60" r="57" fill="none" stroke={ring} strokeWidth="1" />
      <circle cx="60" cy="60" r="32" fill={dark ? 'rgb(255 255 255 / 0.08)' : 'var(--color-glacier)'} stroke={ring} strokeWidth="1" />
      <text fontSize="8.4" fontWeight="600" fill={text}>
        <textPath href={`#seal-${id}`} startOffset="0" textLength="268" lengthAdjust="spacing">
          {label}
        </textPath>
      </text>
      <path
        d="M47 60.5l8.5 8.5L74 51"
        fill="none"
        stroke={dark ? 'var(--color-blue-on-dark)' : 'var(--color-blue)'}
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * Risikofrei-Siegel „Erster Monat jederzeit kündbar“. Klick öffnet die Vertragsbedingungen.
 * variant="badge": kleine Zeile mit Mini-Siegel (Hero, Konfigurator, Abschluss-CTA)
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
        className={cn(
          'group inline-flex items-center gap-3 rounded-full py-1.5 pr-4 pl-1.5 text-left text-sm transition',
          dark ? 'bg-white/10 text-white ring-1 ring-white/15 hover:bg-white/15' : 'bg-white text-ink shadow-soft ring-1 ring-line hover:ring-blue/30',
          className,
        )}
        aria-haspopup="dialog"
      >
        <SealMark dark={dark} className="size-9 shrink-0 transition-transform duration-700 group-hover:rotate-[24deg]" />
        <span className="leading-tight">
          <span className="block font-semibold">{c.riskFree}</span>
          <span className={cn('block text-xs', dark ? 'text-white/65' : 'text-muted')}>Ohne Kündigungsfrist. Bedingungen ansehen</span>
        </span>
      </button>
    ) : (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'group flex w-full flex-col items-start gap-4 rounded-panel p-5 text-left transition min-[400px]:flex-row min-[400px]:items-center min-[400px]:gap-5 sm:gap-7 sm:p-7',
          dark ? 'bg-white/5 text-white ring-1 ring-white/10 hover:bg-white/10' : 'bg-white shadow-soft ring-1 ring-line hover:ring-blue/30',
          className,
        )}
        aria-haspopup="dialog"
      >
        <SealMark dark={dark} className="size-20 shrink-0 transition-transform duration-1000 group-hover:rotate-[30deg] min-[400px]:size-24 sm:size-28" />
        <span className="min-w-0">
          <span className={cn('block text-xs font-semibold tracking-[0.12em] uppercase', dark ? 'text-white/60' : 'text-blue-hover')}>Ohne Risiko starten</span>
          <span className="mt-1.5 block text-xl font-semibold tracking-tight sm:text-2xl">{c.riskFree}</span>
          <span className={cn('mt-2 block leading-relaxed', dark ? 'text-white/70' : 'text-muted')}>
            Überzeugt Sie unsere Arbeit im ersten Monat nicht, kündigen Sie. Ohne Frist und ohne Begründung.
          </span>
          <span className={cn('mt-3 inline-flex items-center gap-1 text-sm font-semibold', dark ? 'text-blue-on-dark' : 'text-blue')}>
            Vertragsbedingungen <ChevronRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </span>
      </button>
    )

  return (
    <>
      {trigger}
      <Modal open={open} onClose={() => setOpen(false)} title="Vertragsbedingungen">
        <div className="p-7 sm:p-9">
          <SealMark className="size-20" />
          <h2 className="mt-5 text-2xl font-semibold tracking-tight">{c.riskFree}.</h2>
          <p className="mt-3 leading-relaxed text-muted">Sie sollen uns erst an der Arbeit messen, bevor Sie sich binden. Deshalb gilt für jeden neuen Vertrag:</p>
          <ul className="mt-6 space-y-4">
            {[
              ['Erster Monat', c.firstMonth],
              ['Ab dem zweiten Monat', c.afterwards],
              ['Schriftlich festgehalten', 'Leistungen, Intervalle und Preis stehen in Ihrem Angebot schwarz auf weiß.'],
            ].map(([t, d]) => (
              <li key={t} className="flex gap-3">
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-blue text-white">
                  <Check aria-hidden className="size-3.5" strokeWidth={3} />
                </span>
                <span>
                  <span className="block font-semibold">{t}</span>
                  <span className="text-muted">{d}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Modal>
    </>
  )
}
