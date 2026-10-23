import { LinkRows } from '@/components/ui/Editorial'
import { Seo } from '@/components/ui/Seo'
import { Button } from '@/components/ui/Button'
import { services } from '@/content/services'

export default function NotFound() {
  return (
    <>
      <Seo title="Seite nicht gefunden" description="Diese Seite gibt es nicht (mehr)." path="/404" noindex />
      <section className="bg-paper pt-28 pb-24 sm:pt-36 lg:pt-44 lg:pb-40">
        <div className="container-site grid-site gap-y-12">
          <div className="col-span-12 lg:col-span-8">
            <p aria-hidden className="t-label mb-6">
              Fehler 404
            </p>
            <h1 className="t-h1 max-w-[16ch]">Hier ist es zu sauber. Nicht einmal eine Seite liegt herum.</h1>
            <p className="t-lead mt-8 max-w-xl">Die Adresse gibt es nicht oder nicht mehr. Hier geht es weiter:</p>
            <div className="btn-row mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-8">
              <Button to="/" size="lg" arrow>
                Zur Startseite
              </Button>
              <Button to="/kontakt" variant="link">
                Kontakt
              </Button>
            </div>
          </div>
          <div className="col-span-12 lg:col-span-3 lg:col-start-10 lg:self-end">
            <p className="t-label mb-4">Leistungen</p>
            <LinkRows items={services.map((s) => ({ to: `/leistungen/${s.slug}`, label: s.name }))} />
          </div>
        </div>
      </section>
    </>
  )
}
