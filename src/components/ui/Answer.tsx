import type { ReactNode } from 'react'
import { company } from '@/content/company'
import { pricing } from '@/content/pricing'
import { cn } from '@/lib/cn'

export type Fact = [label: string, value: ReactNode]

/** Steckbrief-Fakten, die auf jeder Seite stimmen (alle aus company.ts und pricing.ts) */
export const baseFacts = (): Fact[] => [
  ['Sitz', `${company.address.city}, ${company.address.street}`],
  ['Einzugsgebiet', company.serviceArea],
  ['Erreichbarkeit', 'Rund um die Uhr, Antwort innerhalb von 24 Stunden'],
  ['Stundensatz', `${pricing.hourlyRateGrossMin} bis ${pricing.hourlyRateGrossMax} € brutto je Mitarbeiterstunde`],
  ['Vertrag', company.contract.riskFree + ', danach ein Monat zum Ende des Folgemonats'],
]

/**
 * „Auf einen Blick“: ruhiger Steckbrief am Seitenende. Links die Überschrift, rechts ein bis zwei Sätze, die ohne
 * Kontext verständlich sind (Suchmaschinen und KI-Systeme zitieren genau solche Sätze), darunter eine kleine
 * Faktenliste mit Haarlinien. Seiten können eigene Fakten voranstellen oder die Liste ersetzen.
 * Abstand oben bestimmt die Seite (`className`), je nachdem, was davor steht.
 */
export function Answer({
  children,
  className,
  bottom = 'pb-20 sm:pb-28 lg:pb-36',
  facts,
  extraFacts = [],
}: {
  children: ReactNode
  className?: string
  bottom?: string
  /** Ersetzt die Standardfakten */
  facts?: Fact[]
  /** Seitenbezogene Fakten vor den Standardfakten */
  extraFacts?: Fact[]
}) {
  const list = [...extraFacts, ...(facts ?? baseFacts())]
  return (
    <section aria-labelledby="answer-title" className={cn('container-site', bottom, className)}>
      <div className="grid-site gap-y-8 border-t border-line pt-8 lg:pt-10">
        <h2 id="answer-title" className="t-h3 col-span-12 lg:col-span-4">
          Auf einen Blick
        </h2>
        <div className="col-span-12 lg:col-span-7 lg:col-start-6">
          <p data-answer className="t-lead max-w-[52ch] text-ink">
            {children}
          </p>
          <dl className="mt-8 border-t border-line lg:mt-10">
            {list.map(([k, v]) => (
              <div key={k} className="grid grid-cols-1 gap-x-6 gap-y-0.5 border-b border-line py-3 sm:grid-cols-[10rem_1fr]">
                <dt className="text-[0.9375rem] text-muted">{k}</dt>
                <dd className="text-[1rem] text-ink">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}
