import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

/**
 * Kurze, direkte Antwort ganz oben auf einer Seite: ein bis zwei Sätze, die ohne Kontext verständlich sind.
 * Suchmaschinen und KI-Systeme zitieren genau solche Sätze. Gleichzeitig der schnellste Überblick für Besucher.
 */
export function Answer({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <section aria-label="Kurz gesagt" className={cn('container-site', className)}>
      <div className="grid-site gap-y-4 border-t border-line pt-6">
        <p className="t-label col-span-12 lg:col-span-3">Kurz gesagt</p>
        <p data-answer className="t-lead col-span-12 max-w-[46ch] text-ink lg:col-span-8">
          {children}
        </p>
      </div>
    </section>
  )
}
