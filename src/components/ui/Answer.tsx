import type { ReactNode } from 'react'
import { company } from '@/content/company'
import { pricing } from '@/content/pricing'
import { Check, Clock, Euro, FileText, Map as MapIcon, MapPin, Sparkles } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Roll } from './Roll'

export type Fact = [label: string, value: ReactNode]

/** Steckbrief-Fakten, die auf jeder Seite stimmen (alle aus company.ts und pricing.ts) */
export const baseFacts = (): Fact[] => [
  ['Sitz', `${company.address.city}, ${company.address.street}`],
  ['Einzugsgebiet', company.serviceArea],
  ['Erreichbarkeit', 'Rund um die Uhr, Antwort innerhalb von 24 Stunden'],
  ['Stundensatz', `${pricing.hourlyRateGrossMin} bis ${pricing.hourlyRateGrossMax} € brutto je Mitarbeiterstunde`],
  ['Vertrag', 'Im ersten Monat ohne Frist, danach ein Monat zum Ende des Folgemonats'],
]

/** Linien-Icon je Fakt (nach Stichwort im Label) */
function FactIcon({ label }: { label: string }) {
  const l = label.toLowerCase()
  const Icon = /sitz|ort|adresse/.test(l)
    ? MapPin
    : /einzug|gebiet|fahr/.test(l)
      ? MapIcon
      : /erreich|antwort|zeit/.test(l)
        ? Clock
        : /satz|preis|kosten|€/.test(l)
          ? Euro
          : /vertrag|kündig|lauf/.test(l)
            ? FileText
            : /gefragt|leist/.test(l)
              ? Sparkles
              : Check
  return <Icon aria-hidden className="size-5 text-ink" strokeWidth={1.4} />
}

/** Erster Satz als kurze Antwort, der Rest zum Aufklappen (Text bleibt vollständig im HTML) */
function splitAnswer(children: ReactNode): [ReactNode, ReactNode] {
  if (typeof children !== 'string') return [children, null]
  const m = children.match(/^(.+?[.!?])\s+(.+)$/s)
  return m ? [m[1], m[2]] : [children, null]
}

/**
 * „Kurz beantwortet“ bzw. „Auf einen Blick“: oben klein die Frage, darunter der erste Satz als große, kurze Antwort,
 * dann die Fakten als Kacheln (Linien-Icon, kleines Label, großer Wert; Desktop drei, Handy zwei je Zeile). Der übrige
 * Text steht unter „Ausführlich lesen“ (im HTML vorhanden, nur eingeklappt). Je Seite höchstens einmal, weiter unten.
 * Suchmaschinen und KI-Systeme zitieren genau solche Sätze, deshalb bleibt der Text vollständig.
 */
export function Answer({
  children,
  className,
  facts,
  extraFacts = [],
  question,
}: {
  children: ReactNode
  className?: string
  /** früher: Abstand unten; die Abstände bestimmt jetzt der Abschnitt selbst */
  bottom?: string
  /** Ersetzt die Standardfakten */
  facts?: Fact[]
  /** Seitenbezogene Fakten vor den Standardfakten */
  extraFacts?: Fact[]
  /** Die Hauptfrage der Seite (sonst „Auf einen Blick“) */
  question?: string
  /** früher: Navy-Fläche; der Block steht jetzt immer hell */
  dark?: boolean
}) {
  const list = [...extraFacts, ...(facts ?? baseFacts())]
  const [lead, more] = splitAnswer(children)
  return (
    <section aria-labelledby="answer-title" className={cn('section bg-paper text-ink', className)}>
      <div className="container-site">
        <p className="t-label">{question ? 'Kurz beantwortet' : 'Auf einen Blick'}</p>
        <h2 id="answer-title" className="mt-3 text-[1rem] font-medium text-ink-2">
          {question ?? 'Das Wichtigste in Kürze'}
        </h2>
        <p data-answer className="t-h3 mt-5 max-w-[30ch]">
          {lead}
        </p>
        <dl className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          {list.map(([k, v]) => (
            <div key={k} className="answer-tile">
              <FactIcon label={k} />
              <dt className="mt-4 text-[0.8125rem] text-muted">{k}</dt>
              <dd className="mt-1 text-[1rem] leading-[1.35] font-medium tracking-[-0.01em] text-ink sm:text-[1.125rem]">{v}</dd>
            </div>
          ))}
        </dl>
        {more && (
          <details className="answer-more mt-10">
            <summary>
              <Roll text="Ausführlich lesen" />
            </summary>
            <p className="measure mt-5 text-[1.0625rem] leading-[1.7] text-ink-2">{more}</p>
          </details>
        )}
      </div>
    </section>
  )
}
