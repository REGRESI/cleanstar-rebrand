import { SectionHeading } from '@/components/ui/SectionHeading'
import { home, processSteps } from '@/content/site'

type Step = { title: string; duration: string; text: string }
const pad = (v: number) => String(Math.round(v)).padStart(2, '0')

/**
 * Ablauf in zwei Varianten, beide ruhig (die Überschrift trägt die Bewegung):
 * line: nummerierte Schritte an einer senkrechten Haarlinie (Seite „Ablauf“)
 * rows: Raster mit großen Nummern (Partnerseite)
 */
export function ProcessTimeline({
  title = home.process.headline,
  eyebrow = home.process.eyebrow,
  steps = processSteps,
  id = 'process-title',
  variant = 'line',
}: {
  title?: string
  eyebrow?: string
  steps?: Step[]
  id?: string
  variant?: 'line' | 'rows'
}) {
  return (
    <section className="section" aria-labelledby={id}>
      <div className="container-site">
        <SectionHeading layout="rail" eyebrow={eyebrow} title={title} id={id} />
        {variant === 'line' ? <Line steps={steps} /> : <Rows steps={steps} />}
      </div>
    </section>
  )
}

function Line({ steps }: { steps: Step[] }) {
  return (
    <div className="grid-site mt-16 lg:mt-24">
      <ol className="relative col-span-12 lg:col-span-9 lg:col-start-4">
        <span aria-hidden className="absolute top-2 bottom-2 left-[1.15rem] w-px bg-line sm:left-[1.6rem]" />
        {steps.map((s, i) => (
          <li key={s.title} className="relative grid grid-cols-[2.5rem_1fr] gap-x-5 pb-12 last:pb-0 sm:grid-cols-[3.4rem_1fr] sm:gap-x-8 sm:pb-16">
            <span className="relative z-10 grid size-[2.3rem] place-items-center bg-paper font-medium tabular-nums text-[0.9375rem] text-ink ring-1 ring-line sm:size-[3.2rem] sm:text-[1.125rem]">
              {pad(i + 1)}
            </span>
            <div className="pt-1 sm:pt-2.5">
              <p className="t-meta">{s.duration}</p>
              <h3 className="mt-2 text-[1.5rem] leading-[1.2] font-medium tracking-[-0.02em] sm:text-[1.75rem]">{s.title}</h3>
              <p className="measure mt-3 text-ink-2">{s.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}

function Rows({ steps }: { steps: Step[] }) {
  return (
    <ol className="mt-16 border-b border-line lg:mt-24">
      {steps.map((s, i) => (
        <li key={s.title} className="relative grid grid-cols-1 gap-x-8 gap-y-2 border-t border-line py-7 lg:grid-cols-12 lg:py-9">
          <p className="font-medium tabular-nums text-[2.25rem] leading-none tracking-[-0.04em] text-ink lg:col-span-2 lg:text-[3rem]">{pad(i + 1)}</p>
          <div className="lg:col-span-4">
            <p className="t-meta">{s.duration}</p>
            <h3 className="mt-2 text-[1.375rem] leading-[1.2] font-medium tracking-[-0.02em] sm:text-[1.5rem]">{s.title}</h3>
          </div>
          <p className="measure text-ink-2 lg:col-span-5 lg:col-start-8 lg:pt-6">{s.text}</p>
        </li>
      ))}
    </ol>
  )
}
