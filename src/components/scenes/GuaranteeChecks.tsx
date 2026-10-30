import { Todo } from '@/components/ui/Todo'
import { AnimatedText } from '@/components/ui/AnimatedText'
import { guaranteePoints } from '@/content/site'
import { company } from '@/content/company'

/**
 * Qualitätsgarantie: die Prüfpunkte als ruhige, abgehakte Liste in zwei Spalten. Keine eigene Bewegung, die
 * Überschrift trägt sie (Text-System).
 */

const n = guaranteePoints.length
const count = ['Sieben', 'Acht', 'Neun'][n - 7] ?? String(n)

export function GuaranteeChecks() {
  return (
    <section className="section" aria-labelledby="points-title">
      <div className="container-site">
        <p className="t-label">Unsere Prüfpunkte</p>
        <AnimatedText as="h2" id="points-title" text={`${count} Zusagen, an denen Sie uns messen können.`} className="t-h2 mt-5 max-w-[20ch]" />
        <ol className="mt-14 grid gap-x-12 sm:grid-cols-2 lg:mt-20">
          {guaranteePoints.map((p) => (
            <li key={p.title} className="grid grid-cols-[1.5rem_1fr] items-start gap-x-4 border-t border-line py-6">
              <svg viewBox="0 0 24 24" className="mt-0.5 size-6" fill="none" aria-hidden>
                <circle cx="12" cy="12" r="11" stroke="var(--color-line-strong)" strokeWidth="1.25" />
                <path d="M7 12.4 10.4 15.8 17 8.6" stroke="var(--color-ink)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="min-w-0">
                <h3 className="text-[1.125rem] leading-[1.3] font-medium tracking-[-0.015em]">{p.title}</h3>
                <p className="mt-2 text-ink-2">
                  {p.usesComplaintPeriod && company.complaintPeriod
                    ? `Passt etwas nicht, melden Sie es Ihrem Ansprechpartner. Wir reinigen kostenlos nach, innerhalb von ${company.complaintPeriod}.`
                    : p.text}
                  {p.todo && <Todo title={p.todo}>{p.todo}</Todo>}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
