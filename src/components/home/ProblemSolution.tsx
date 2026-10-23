import { SectionHeading } from '@/components/ui/SectionHeading'
import { home } from '@/content/site'

interface Props {
  eyebrow?: string
  /** Abschnittsnummer, z. B. "02" */
  index?: string
  headline?: string
  lead?: string
  items?: { problem: string; solution: string }[]
  id?: string
}

/**
 * Probleme und Lösungen als nummerierte Zeilen mit Haarlinien: das Problem durchgestrichen (die Linie zeichnet sich,
 * sobald die Zeile im Bild ist), die Lösung darunter. Ohne Karten, ohne Icons. Ohne Bewegung: Endzustand sofort.
 */
export function ProblemSolution({
  eyebrow = home.problems.eyebrow,
  index,
  headline = home.problems.headline,
  lead = home.problems.lead,
  items = home.problems.items,
  id = 'problems-title',
}: Props) {
  return (
    <section className="section" aria-labelledby={id}>
      <div className="container-site">
        <SectionHeading layout="split" index={index} eyebrow={eyebrow} title={headline} text={lead} id={id} />
        <ol className="mt-16 border-b border-line lg:mt-24">
          {items.map((it, i) => (
            <li key={i} className="relative">
              <span aria-hidden data-reveal-rule className="rule absolute inset-x-0 top-0" />
              <div className="grid-site gap-y-3 py-8 sm:py-10" data-reveal>
                <p className="t-label col-span-12 lg:col-span-3 lg:pt-1.5">{String(i + 1).padStart(2, '0')}</p>
                <div className="col-span-12 lg:col-span-8">
                  <p className="text-lg text-muted sm:text-xl">
                    <span className="sr-only">Problem: </span>
                    <span className="strike">„{it.problem}“</span>
                  </p>
                  <p className="mt-3 text-[1.5rem] leading-[1.2] font-medium tracking-[-0.022em] text-ink sm:text-[1.875rem]">
                    <span className="sr-only">Bei uns: </span>
                    {it.solution}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
