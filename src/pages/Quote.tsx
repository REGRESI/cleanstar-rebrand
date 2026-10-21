import { Check, Clock, ShieldCheck, Phone } from 'lucide-react'
import { Seo } from '@/components/ui/Seo'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { RevealText } from '@/components/ui/RevealText'
import Configurator from '@/features/configurator/Configurator'
import { company } from '@/content/company'
import { breadcrumbSchema } from '@/lib/schema'
import { CallbackButton } from '@/features/callback/Callback'

const trail = [
  { name: 'Start', path: '/' },
  { name: 'Angebot', path: '/angebot' },
]

export default function Quote() {
  return (
    <>
      <Seo
        title="Angebot Büroreinigung anfragen"
        description="Angebot für Büroreinigung im Ortenaukreis anfragen: Richtpreis-Spanne in 60 Sekunden oder kostenlose Besichtigung. Antwort in 24 Stunden, unverbindlich."
        path="/angebot"
        schema={[breadcrumbSchema(trail)]}
      />
      <section className="relative overflow-hidden bg-glacier pt-32 pb-24 sm:pt-40">
        <div className="container-site relative grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Breadcrumbs trail={trail} />
            <p className="eyebrow mb-4">Angebot anfragen</p>
            <RevealText as="h1" text="In 60 Sekunden zum Angebot." immediate className="heading-1" />
            <p className="lead fade-up-now mt-6" style={{ ['--d' as string]: '0.4s' }}>
              Ein paar Angaben zu Ihrem Objekt. Kennen Sie Ihre aktuellen Reinigungszeiten, zeigen wir Ihnen sofort eine Richtpreis-Spanne.
            </p>
            <ul className="fade-up-now mt-8 space-y-3" style={{ ['--d' as string]: '0.55s' }}>
              {[
                [Clock, `Antwort innerhalb von ${company.promises.responseHours} Stunden`],
                [Check, `Angebot innerhalb von ${company.promises.offerHours} Stunden`],
                [ShieldCheck, 'Kostenlos und unverbindlich'],
              ].map(([I, t], i) => {
                const Icon = I as typeof Clock
                return (
                  <li key={i} className="flex items-center gap-3 font-medium">
                    <span className="grid size-8 place-items-center rounded-full bg-white text-blue ring-1 ring-line">
                      <Icon aria-hidden className="size-4" />
                    </span>
                    {t as string}
                  </li>
                )
              })}
            </ul>
            <a href={company.phone.href} className="mt-10 inline-flex items-center gap-3 text-sm text-muted">
              <Phone aria-hidden className="size-4 text-blue" />
              Lieber telefonisch? <span className="font-semibold text-ink">{company.phone.display}</span>
            </a>
            <CallbackButton className="mt-2 flex" />
          </div>
          <div className="lg:col-span-8">
            <div className="overflow-hidden rounded-panel bg-white shadow-lift ring-1 ring-line">
              <Configurator variant="page" />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
