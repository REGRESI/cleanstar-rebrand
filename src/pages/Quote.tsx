import { Seo } from '@/components/ui/Seo'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { RevealText } from '@/components/ui/RevealText'
import Configurator from '@/features/configurator/Configurator'
import { company } from '@/content/company'
import { breadcrumbSchema } from '@/lib/schema'
import { CallbackButton } from '@/features/callback/Callback'

const trail = [
  { name: 'Startseite', path: '/' },
  { name: 'Angebot', path: '/angebot' },
]

export default function Quote() {
  return (
    <>
      <Seo
        title="Angebot Büroreinigung anfragen"
        description="Angebot für Büroreinigung im Ortenaukreis anfragen: Richtpreis-Spanne in 60 Sekunden oder kostenlose Besichtigung. Antwort in 24 Stunden, unverbindlich."
        path="/angebot"
        schema={[breadcrumbSchema(trail)]}
      />
      <section className="bg-paper pt-28 pb-24 sm:pt-36 lg:pt-44 lg:pb-40">
        <div className="container-site">
          <Breadcrumbs trail={trail} />
          <div className="grid-site gap-y-14">
            <div className="col-span-12 lg:col-span-4">
              <p className="t-label mb-6">
                Angebot anfragen
              </p>
              <RevealText as="h1" text="In 60 Sekunden zum Angebot." immediate className="t-h1 max-w-[12ch] lg:text-[4.5rem]" />
              <p className="t-lead mt-8">
                Ein paar Angaben zu Ihrem Objekt. Kennen Sie Ihre aktuellen Reinigungszeiten, zeigen wir Ihnen sofort eine Richtpreis-Spanne.
              </p>
              <ol className="mt-10 border-t border-line">
                {[
                  `Antwort innerhalb von ${company.promises.responseHours}\u00A0Stunden`,
                  `Angebot innerhalb von ${company.promises.offerHours}\u00A0Stunden`,
                  'Kostenlos und unverbindlich',
                ].map((t, i) => (
                  <li key={t} className="flex gap-5 border-b border-line py-3.5">
                    <span className="t-label w-6 shrink-0 pt-0.5">{String(i + 1).padStart(2, '0')}</span>
                    {t}
                  </li>
                ))}
              </ol>
              <div className="mt-10 space-y-2">
                <a href={company.phone.href} className="ulink block w-fit text-ink">
                  Lieber telefonisch? {company.phone.display}
                </a>
                <CallbackButton />
              </div>
            </div>
            <div className="col-span-12 lg:col-span-7 lg:col-start-6">
              <div className="border-t border-line">
                <Configurator variant="page" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
