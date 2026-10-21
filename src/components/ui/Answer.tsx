import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

/**
 * Kurze, direkte Antwort ganz oben auf einer Seite: ein bis zwei Sätze, die ohne Kontext verständlich sind.
 * Suchmaschinen und KI-Systeme zitieren genau solche Sätze. Gleichzeitig der schnellste Überblick für Besucher.
 */
export function Answer({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <section aria-label="Kurz gesagt" className={cn('container-site', className)}>
      <p data-answer className="max-w-3xl border-l-4 border-blue bg-white py-1 pl-5 text-lg leading-relaxed text-ink sm:text-xl">
        {children}
      </p>
    </section>
  )
}
