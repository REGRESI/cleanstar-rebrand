import { SectionHeading } from '@/components/ui/SectionHeading'
import { approvedQuotes, hasProof, proof } from '@/content/proof'
import { home } from '@/content/site'

/**
 * Beweise: anonymisierte Objekte und freigegebene Kundenzitate aus src/content/proof.ts.
 * Erscheint nur, wenn proof.enabled gesetzt ist und Einträge vorliegen. Nichts wird erfunden.
 */
export function Proof({ index }: { index?: string }) {
  if (!hasProof()) return null
  const quotes = approvedQuotes()
  return (
    <section className="section" aria-labelledby="proof-title">
      <div className="container-site">
        <SectionHeading layout="rail" index={index} eyebrow={home.proof.eyebrow} title={proof.objects.length ? home.proof.headlineObjects : home.proof.headlineQuotes} id="proof-title" />

        {proof.objects.length > 0 && (
          <div className="mt-16 lg:mt-24">
            <div className="hidden grid-cols-12 gap-x-8 pb-4 font-mono text-[0.75rem] text-muted lg:grid" aria-hidden>
              <span className="col-span-4">Branche</span>
              <span className="col-span-2">Fläche</span>
              <span className="col-span-2">Ort</span>
              <span className="col-span-3">Intervall</span>
              <span className="col-span-1 text-right">Seit</span>
            </div>
            <ul className="border-b border-line">
              {proof.objects.map((o, i) => (
                <li key={i} className="grid grid-cols-2 gap-x-5 gap-y-1 border-t border-line py-6 lg:grid-cols-12 lg:gap-x-8 lg:py-7" data-reveal>
                  <p className="col-span-2 text-[1.375rem] font-medium tracking-[-0.02em] lg:col-span-4">{o.sector}</p>
                  <p className="font-mono text-[0.875rem] text-ink-2 lg:col-span-2">{o.area}</p>
                  <p className="font-mono text-[0.875rem] text-ink-2 lg:col-span-2">{o.place}</p>
                  <p className="font-mono text-[0.875rem] text-ink-2 lg:col-span-3">{o.interval}</p>
                  <p className="font-mono text-[0.875rem] text-ink-2 lg:col-span-1 lg:text-right">seit {o.since}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {quotes.length > 0 && (
          <ul className="mt-20 space-y-16 lg:mt-28 lg:space-y-24">
            {quotes.map((q, i) => (
              <li key={i} className="grid-site" data-reveal>
                <blockquote className="col-span-12 lg:col-span-9 lg:col-start-4">
                  <p className="t-h3">„{q.quote}“</p>
                  <footer className="t-label mt-6">
                    {q.name}, {q.role}, {q.company}
                  </footer>
                </blockquote>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
