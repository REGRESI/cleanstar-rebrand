import { Seo } from '@/components/ui/Seo'
import { ScrubStatement } from '@/components/ui/ScrubStatement'
import { statements } from '@/content/statements'
import { PageHero } from '@/components/ui/PageHero'
import { places } from '@/content/places'
import { Answer } from '@/components/ui/Answer'
import { RevealText } from '@/components/ui/RevealText'
import { ImageBand } from '@/components/ui/ImageBand'
import { AreaMap } from '@/features/map/AreaMap'
import { FinalCta } from '@/components/home/FinalCta'
import { QuoteButton } from '@/features/configurator/QuoteLink'
import { breadcrumbSchema } from '@/lib/schema'

const trail = [
  { name: 'Startseite', path: '/' },
  { name: 'Einzugsgebiet', path: '/einzugsgebiet' },
]

export default function Area() {
  return (
    <>
      <Seo
        title="Büroreinigung Ortenaukreis: alle Orte"
        description="Büroreinigung im ganzen Ortenaukreis: CleanStar aus Offenburg reinigt in Lahr, Kehl, Achern, Oberkirch und vielen weiteren Orten. Karte mit Fahrzeiten."
        path="/einzugsgebiet"
        ogType="standort"
        schema={[breadcrumbSchema(trail)]}
      />
      <PageHero
        trail={trail}
        eyebrow="Einzugsgebiet"
        title="Im ganzen Ortenaukreis zuhause."
        lead="Unser Sitz ist in Offenburg, mitten im Kreis. Von hier aus sind wir schnell bei Ihnen, ob in Kehl am Rhein, in Achern im Norden oder in Haslach im Kinzigtal."
        actions={<QuoteButton size="lg" arrow />}
      />
      <ScrubStatement {...statements.einzugsgebiet} id="statement-title" className="pt-10 pb-0 sm:pt-14 lg:pt-20" />
      <section className="section-tight" aria-labelledby="map-title">
        <div className="container-site">
          <h2 id="map-title" className="sr-only">
            Karte des Einzugsgebiets
          </h2>
          <AreaMap />
        </div>
      </section>
      <ImageBand id="region" />
      <section className="on-dark section bg-night text-paper" aria-labelledby="why-local-title">
        <div className="container-site grid-site gap-y-8 lg:items-end">
          <div className="col-span-12 lg:col-span-6">
            <p className="t-label mb-6">Warum regional</p>
            <RevealText as="h2" text="Kurze Wege sind kein Detail." id="why-local-title" className="t-h2" />
          </div>
          <p className="t-lead col-span-12 measure lg:col-span-5 lg:col-start-8" data-reveal>
            Wenn ein Team ausfällt oder Sie kurzfristig eine Zusatzreinigung brauchen, zählt jede Minute Anfahrt. Weil wir uns auf den Ortenaukreis konzentrieren, können wir
            planen, vertreten und nachreinigen, ohne lange Wege.
          </p>
        </div>
      </section>
      <Answer className="section-top">{`CleanStar reinigt Büros und Gewerbeflächen in ${places.length} Orten im Ortenaukreis, von Rheinau im Norden bis Ettenheim und Rust im Süden und Wolfach im Kinzigtal. Unser Sitz ist in Offenburg.`}</Answer>
      <FinalCta />
    </>
  )
}
