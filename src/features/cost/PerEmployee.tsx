import { useMemo } from 'react'
import { AnimatedNumber } from '@/components/ui/AnimatedNumber'
import { perEmployeeDay, pricing } from '@/content/pricing'
import { formatEuro2 } from '@/lib/format'
import { cn } from '@/lib/cn'

/**
 * „Was kostet das pro Mitarbeiter?“ Monatsspanne netto geteilt durch Mitarbeiter und 21,7 Arbeitstage.
 * Macht den Betrag für Geschäftsführer greifbar. Unverbindliche Orientierung.
 */
export function PerEmployee({ netMin, netMax, employees, className }: { netMin: number; netMax: number; employees: number; className?: string }) {
  const r = perEmployeeDay(netMin, netMax, employees)
  const fmt = useMemo(() => (v: number) => formatEuro2(v), [])
  // Untergrenze ohne €-Zeichen: „3,13 bis 4,02 €“
  const fmtMin = useMemo(() => (v: number) => v.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), [])
  return (
    <div className={cn('border-t border-line pt-6', className)}>
      <p className="t-label">Umgerechnet auf Ihre {employees} Mitarbeiter</p>
      <p className="mt-4 text-[clamp(2.25rem,1.5rem+2.4vw,4rem)] leading-none font-medium tracking-[-0.045em] tabular-nums" aria-live="polite">
        <span className="mr-2 text-[0.45em] tracking-[-0.02em]">ca.</span>
        <span className="whitespace-nowrap">
          <AnimatedNumber value={r.min} format={fmtMin} />
          {'\u00A0'}bis{'\u00A0'}
          <AnimatedNumber value={r.max} format={fmt} />
        </span>
      </p>
      <p className="mt-3 text-ink">pro Mitarbeiter und Arbeitstag, netto</p>
      <p className="mt-3 text-[0.8125rem] leading-relaxed text-muted">
        Unverbindliche Orientierung: Monatsbetrag netto geteilt durch {employees} Mitarbeiter und {String(pricing.workdaysPerMonth).replace('.', ',')} Arbeitstage.
      </p>
    </div>
  )
}
