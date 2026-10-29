import { RevealText } from '@/components/ui/RevealText'
import { ContactPerson } from '@/components/ui/ContactPerson'
import { RiskFreeSeal } from '@/components/ui/RiskFreeSeal'
import { home } from '@/content/site'
import { company } from '@/content/company'
import { QuoteButton } from '@/features/configurator/QuoteLink'
import { useQuote, type ObjectType } from '@/features/configurator/QuoteContext'
import { useOfficeWay } from '@/features/office/officeWay'

const types: { id: ObjectType; label: string }[] = [
  { id: 'buero', label: 'Büro' },
  { id: 'praxis', label: 'Praxis oder Kanzlei' },
  { id: 'gewerbe', label: 'Gewerbefläche' },
  { id: 'sonstiges', label: 'Sonstiges' },
]

/** Abschluss auf dunklem Grund: kostenlose Besichtigung, Ansprechpartner, 24/7, direkter Einstieg in den Konfigurator. */
export function FinalCta({ headline = home.finalCta.headline }: { headline?: string }) {
  const { open } = useQuote()
  const [way] = useOfficeWay()
  return (
    <section className="on-dark section bg-night text-paper" aria-labelledby="cta-title">
      <div className="container-site">
        <div className="grid-site gap-y-6">
          <span aria-hidden data-reveal-rule className="rule col-span-12 mb-2 lg:mb-6" />
          <p className="t-label col-span-12 lg:col-span-3 lg:pt-3" data-reveal>
            {home.finalCta.eyebrow}
          </p>
          <RevealText as="h2" id="cta-title" text={headline} className="t-h1 col-span-12 max-w-[16ch] lg:col-span-9" />
        </div>

        <div className="grid-site mt-12 gap-y-14 lg:mt-20">
          <div className="col-span-12 lg:col-span-5 lg:col-start-4">
            <p className="t-lead text-paper" data-reveal>
              {home.finalCta.text}
            </p>
            {way && <p className="mt-5 text-paper">{way.cta}</p>}
            <div className="mt-10" data-reveal>
              <QuoteButton size="lg" arrow>
                Kostenlose Besichtigung
              </QuoteButton>
              <p className="mt-4 font-medium tabular-nums text-[0.75rem] text-muted-dark">
                Kostenlos und unverbindlich. Antwort innerhalb von {company.promises.responseHours} Stunden.
              </p>
            </div>
            <div className="mt-12" data-reveal>
              <p className="t-label">Oder direkt mit dem Objekt beginnen</p>
              <ul className="mt-4 grid grid-cols-1 gap-2 min-[400px]:grid-cols-2">
                {types.map((t) => (
                  <li key={t.id}>
                    <button
                      type="button"
                      onClick={() => open(t.id)}
                      className="flex min-h-13 w-full items-center justify-between gap-3 px-4 py-3 text-left text-paper shadow-[inset_0_0_0_1px_var(--color-line-dark)] transition-shadow duration-300 hover:shadow-[inset_0_0_0_1px_var(--color-paper)]"
                    >
                      {t.label}
                      <span aria-hidden className="font-medium tabular-nums text-[0.75rem] text-muted-dark">
                        →
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="col-span-12 space-y-10 lg:col-span-3 lg:col-start-10" data-reveal>
            <ContactPerson dark compact title="Ihr Ansprechpartner für das Erstgespräch" />
            <RiskFreeSeal dark />
          </div>
        </div>
      </div>
    </section>
  )
}
