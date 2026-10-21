import { Link } from 'react-router-dom'
import { Seo } from '@/components/ui/Seo'
import { Button } from '@/components/ui/Button'
import { services } from '@/content/services'

export default function NotFound() {
  return (
    <>
      <Seo title="Seite nicht gefunden" description="Diese Seite gibt es nicht (mehr)." path="/404" noindex />
      <section className="relative flex min-h-[90svh] items-center overflow-hidden bg-glacier pt-32 pb-20">
        <div className="container-site relative text-center">
          <p aria-hidden className="bg-gradient-to-b from-ink to-ink/20 bg-clip-text text-[7rem] leading-none font-semibold tracking-tighter text-transparent sm:text-[11rem]">
            404
          </p>
          <h1 className="heading-2 mt-4">Hier ist es zu sauber. Nicht einmal eine Seite liegt herum.</h1>
          <p className="lead mx-auto mt-5 max-w-xl">Die Adresse gibt es nicht oder nicht mehr. Hier geht es weiter:</p>
          <div className="btn-row mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button to="/" size="lg" arrow>
              Zur Startseite
            </Button>
            <Button to="/kontakt" variant="secondary" size="lg">
              Kontakt
            </Button>
          </div>
          <ul className="mx-auto mt-12 flex max-w-2xl flex-wrap justify-center gap-2">
            {services.map((s) => (
              <li key={s.slug}>
                <Link to={`/leistungen/${s.slug}`} className="inline-block rounded-full bg-white px-4 py-2 text-sm font-medium ring-1 ring-line hover:ring-blue/40">
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  )
}
