import { Building, Briefcase, Store, Shapes, ArrowRight } from 'lucide-react'
import { RevealText } from '@/components/ui/RevealText'
import { ContactPerson } from '@/components/ui/ContactPerson'
import { RiskFreeSeal } from '@/components/ui/RiskFreeSeal'
import { home } from '@/content/site'
import { company } from '@/content/company'
import { useQuote, type ObjectType } from '@/features/configurator/QuoteContext'

const types: { id: ObjectType; label: string; icon: typeof Building }[] = [
  { id: 'buero', label: 'Büro', icon: Building },
  { id: 'praxis', label: 'Praxis / Kanzlei', icon: Briefcase },
  { id: 'gewerbe', label: 'Gewerbefläche', icon: Store },
  { id: 'sonstiges', label: 'Sonstiges', icon: Shapes },
]

/** Abschluss-CTA mit direktem Einstieg in den Konfigurator. */
export function FinalCta({ headline = home.finalCta.headline }: { headline?: string }) {
  const { open } = useQuote()
  return (
    <section className="on-dark relative overflow-hidden bg-ink py-24 text-white sm:py-32" aria-labelledby="cta-title">
      <div aria-hidden className="absolute -bottom-40 -left-20 size-[36rem] rounded-full bg-blue/30 blur-[120px]" />
      <div aria-hidden className="absolute -top-40 right-0 size-[28rem] rounded-full bg-fresh/10 blur-[100px]" />
      <div className="container-site relative grid grid-cols-1 gap-14 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-7">
          <p className="eyebrow mb-5" data-reveal>
            {home.finalCta.eyebrow}
          </p>
          <RevealText as="h2" id="cta-title" text={headline} className="heading-1" />
          <p className="lead mt-6 max-w-xl" data-reveal>
            {home.finalCta.text}
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:max-w-md" data-reveal>
            <ContactPerson dark title="Ihr Ansprechpartner für das Erstgespräch" />
            <RiskFreeSeal dark className="self-start" />
          </div>
        </div>
        <div className="lg:col-span-5" data-reveal>
          <div className="glass-dark rounded-panel p-6 ring-1 ring-white/10 sm:p-8">
            <p className="text-sm font-semibold text-white">Welches Objekt sollen wir reinigen?</p>
            <ul className="mt-5 grid grid-cols-2 gap-3">
              {types.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => open(t.id)}
                    className="group flex h-full w-full flex-col items-start gap-3 rounded-2xl bg-white/5 p-4 text-left ring-1 ring-white/10 transition hover:bg-white/10 hover:ring-fresh/50"
                  >
                    <t.icon aria-hidden className="size-6 text-fresh" strokeWidth={1.6} />
                    <span className="font-medium">{t.label}</span>
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => open()}
              className="mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-blue font-semibold text-white shadow-glow transition hover:bg-blue-hover"
            >
              In 60 Sekunden zum Angebot
              <ArrowRight aria-hidden className="size-4" />
            </button>
            <p className="mt-4 text-center text-xs text-muted-dark">Kostenlos und unverbindlich. Antwort innerhalb von {company.promises.responseHours} Stunden.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
