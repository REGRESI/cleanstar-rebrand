import { SectionHeading } from '@/components/ui/SectionHeading'
import { home, processSteps } from '@/content/site'

/**
 * Ablauf als große Zahlen mit Linie: drei Spalten auf dem Desktop, untereinander auf dem Handy.
 * Jede Linie zeichnet sich beim Scrollen von links nach rechts. Kein Slider, keine Karten.
 */
export function ProcessTimeline({
  title = home.process.headline,
  eyebrow = home.process.eyebrow,
  steps = processSteps,
  id = 'process-title',
  index,
  dark,
}: {
  title?: string
  eyebrow?: string
  steps?: { title: string; duration: string; text: string }[]
  id?: string
  index?: string
  dark?: boolean
}) {
  return (
    <section className={dark ? 'on-dark section bg-night text-paper' : 'section'} aria-labelledby={id}>
      <div className="container-site">
        <SectionHeading layout="rail" index={index} eyebrow={eyebrow} title={title} id={id} />
        <ol className="mt-16 grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:mt-24 lg:grid-cols-3 lg:gap-y-20">
          {steps.map((s, i) => (
            <li key={s.title} className="relative pt-6" data-reveal>
              <span aria-hidden data-reveal-rule className={dark ? 'rule absolute inset-x-0 top-0 bg-line-dark' : 'rule absolute inset-x-0 top-0'} />
              <p className="t-num">{String(i + 1).padStart(2, '0')}</p>
              <p className="t-label mt-8">{s.duration}</p>
              <h3 className="mt-2 text-[1.5rem] leading-[1.2] font-medium tracking-[-0.02em]">{s.title}</h3>
              <p className={dark ? 'measure mt-3 text-muted-dark' : 'measure mt-3 text-ink-2'}>{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
