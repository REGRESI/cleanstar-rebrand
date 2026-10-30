import { SectionHeading } from '@/components/ui/SectionHeading'
import { home } from '@/content/site'

interface Props {
  eyebrow?: string
  headline?: string
  lead?: string
  items?: { problem: string; solution: string }[]
  id?: string
}

/**
 * „Das kennen Sie vielleicht“: Probleme und Lösungen als nummerierte Zeilen auf Navy. Ruhig, ohne eigenen Effekt:
 * das Problem gedämpft und durchgestrichen, die Lösung in voller Farbe. Die Überschrift trägt die Bewegung.
 */
export function ProblemSolution({
  eyebrow = home.problems.eyebrow,
  headline = home.problems.headline,
  lead = home.problems.lead,
  items = home.problems.items,
  id = 'problems-title',
}: Props) {
  return (
    <section className="on-dark section bg-night text-paper" aria-labelledby={id}>
      <div className="container-site">
        <SectionHeading layout="split" eyebrow={eyebrow} title={headline} text={lead} id={id} />
        <ol className="mt-16 lg:mt-24">
          {items.map((it, i) => (
            <li key={i} className="grid grid-cols-[2.5rem_1fr] gap-x-4 border-t border-line-dark py-8 sm:grid-cols-[4rem_1fr] lg:grid-cols-12 lg:gap-x-8 lg:py-10">
              <span className="t-label pt-1 lg:col-span-1">{String(i + 1).padStart(2, '0')}</span>
              <p className="text-muted-dark line-through decoration-1 lg:col-span-5">
                <span className="sr-only">Vorher: </span>
                {it.problem}
              </p>
              <p className="col-start-2 mt-3 text-[1.25rem] leading-[1.35] font-medium tracking-[-0.015em] text-paper lg:col-span-6 lg:col-start-7 lg:mt-0">
                <span className="sr-only">Bei uns: </span>
                {it.solution}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
