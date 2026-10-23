import type { ReactNode } from 'react'
import { Accordion } from './Accordion'
import { RevealText } from './RevealText'

/** Fragen-Abschnitt im Raster: Überschrift links (4 Spalten), Akkordeon rechts (8 Spalten), Haarlinie oben. */
export function FaqBlock({
  title,
  id,
  items,
  label = 'Fragen',
  children,
  className = 'section',
  dark,
}: {
  title: string
  id: string
  items: { title: ReactNode; content: ReactNode }[]
  label?: string
  children?: ReactNode
  className?: string
  /** Für dunkle Abschnitte (className mit on-dark bg-night) */
  dark?: boolean
}) {
  return (
    <section className={className} aria-labelledby={id}>
      <div className="container-site grid-site gap-y-10">
        <span aria-hidden data-reveal-rule className="rule col-span-12 mb-4" />
        <div className="col-span-12 lg:col-span-4">
          <p className="t-label mb-6">{label}</p>
          <RevealText as="h2" text={title} id={id} className="t-h3 max-w-[16ch]" />
        </div>
        <div className="col-span-12 lg:col-span-8">
          <div data-reveal>
            <Accordion items={items} dark={dark} />
          </div>
          {children}
        </div>
      </div>
    </section>
  )
}
