import { testimonials, clientLogos } from '@/content/site'
import { SectionHeading } from '@/components/ui/SectionHeading'

/**
 * Kundenstimmen. Standardmäßig ausgeblendet (src/content/site.ts → testimonials.enabled).
 * Nur echte Zitate mit Einverständnis der Kunden eintragen.
 */
export function Testimonials() {
  if (!testimonials.enabled) return null
  return (
    <section className="bg-glacier py-24 sm:py-32" aria-labelledby="testimonials-title">
      <div className="container-site">
        <SectionHeading eyebrow="Kundenstimmen" title="Was unsere Kunden sagen." id="testimonials-title" />
        <ul className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3">
          {testimonials.items.map((t, i) => (
            <li key={i} className="rounded-card bg-white p-8 ring-1 ring-line" data-reveal>
              <blockquote className="text-lg leading-relaxed text-ink">„{t.quote}“</blockquote>
              <p className="mt-6 text-sm font-semibold text-ink">{t.name}</p>
              <p className="text-sm text-muted">{t.role}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/** Kundenlogos. Standardmäßig ausgeblendet (src/content/site.ts → clientLogos.enabled). */
export function ClientLogos() {
  if (!clientLogos.enabled || clientLogos.items.length === 0) return null
  return (
    <section aria-label="Kunden" className="border-y border-line py-10">
      <ul className="container-site flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-70 grayscale">
        {clientLogos.items.map((l) => (
          <li key={l.name}>
            <img src={l.src} alt={l.name} className="h-8 w-auto" loading="lazy" />
          </li>
        ))}
      </ul>
    </section>
  )
}
