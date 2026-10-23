import { SectionHeading } from '@/components/ui/SectionHeading'
import { Sparkle } from '@/components/ui/Sparkle'
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
 * Probleme und Lösungen als nummerierte Zeilen mit Haarlinien auf dunklem Grund: das Problem durchgestrichen
 * (die Linie zeichnet sich, sobald die Zeile im Bild ist), die Lösung darunter. Ist die Linie gezogen, blitzt
 * neben der Lösung einmal kurz der Glanz-Stern auf. Ohne Karten, ohne Icons. Ohne Bewegung: Endzustand sofort.
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
    <section className="on-dark section bg-night text-paper" aria-labelledby={id}>
      <div className="container-site">
        <SectionHeading layout="split" index={index} eyebrow={eyebrow} title={headline} text={lead} id={id} />
        <ol className="mt-16 border-b border-line-dark lg:mt-24">
          {items.map((it, i) => (
            <li key={i} className="relative">
              <span aria-hidden data-reveal-rule className="rule absolute inset-x-0 top-0" />
              <div className="grid-site gap-y-3 py-8 sm:py-10" data-reveal>
                <p className="t-label col-span-12 lg:col-span-3 lg:pt-1.5">{String(i + 1).padStart(2, '0')}</p>
                <div className="col-span-12 lg:col-span-8">
                  <p className="text-lg text-muted-dark sm:text-xl">
                    <span className="sr-only">Problem: </span>
                    <span className="strike">„{it.problem}“</span>
                  </p>
                  <p className="mt-3 text-[1.5rem] leading-[1.2] font-medium tracking-[-0.022em] text-paper sm:text-[1.875rem]">
                    <span className="sr-only">Bei uns: </span>
                    {it.solution}
                    <span aria-hidden className="relative inline-block w-0">
                      <Sparkle onReveal delay={0.95 + i * 0.12} className="absolute bottom-[0.2em] left-[0.3em] size-[0.62em]" />
                    </span>
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
