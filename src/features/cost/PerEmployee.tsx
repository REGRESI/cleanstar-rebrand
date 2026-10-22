import { useMemo } from 'react'
import { Users } from 'lucide-react'
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
  return (
    <div className={cn('flex gap-4 rounded-2xl bg-white p-5 ring-1 ring-line', className)}>
      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-blue/10 text-blue">
        <Users aria-hidden className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="text-sm text-muted">Umgerechnet auf Ihre {employees} Mitarbeiter</p>
        <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums" aria-live="polite">
          ca. <AnimatedNumber value={r.min} format={fmt} /> bis <AnimatedNumber value={r.max} format={fmt} />
        </p>
        <p className="text-sm font-medium text-ink">pro Mitarbeiter und Arbeitstag, netto</p>
        <p className="mt-2 text-xs leading-relaxed text-muted">
          Unverbindliche Orientierung: Monatsbetrag netto geteilt durch {employees} Mitarbeiter und {String(pricing.workdaysPerMonth).replace('.', ',')} Arbeitstage.
        </p>
      </div>
    </div>
  )
}
