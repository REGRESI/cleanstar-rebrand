import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

/**
 * „Auf einen Blick“: ein bis zwei Sätze, die ohne Kontext verständlich sind, am Ende des Hauptinhalts vor dem
 * Abschluss. Suchmaschinen und KI-Systeme zitieren genau solche Sätze; für Besucher die Zusammenfassung.
 * Abstand oben bestimmt die Seite (`className`), je nachdem, was davor steht.
 */
export function Answer({ children, className, bottom = 'pb-20 sm:pb-28 lg:pb-36' }: { children: ReactNode; className?: string; bottom?: string }) {
  return (
    <section aria-label="Auf einen Blick" className={cn('container-site', bottom, className)}>
      <div className="grid-site gap-y-4 border-t border-line pt-6">
        <p className="t-label col-span-12 lg:col-span-3">Auf einen Blick</p>
        <p data-answer className="t-lead col-span-12 max-w-[46ch] text-ink lg:col-span-8">
          {children}
        </p>
      </div>
    </section>
  )
}
