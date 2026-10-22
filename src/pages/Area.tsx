import { Seo } from '@/components/ui/Seo'
import { PageHero } from '@/components/ui/PageHero'
import { places } from '@/content/places'
import { Answer } from '@/components/ui/Answer'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Picture } from '@/components/ui/Picture'
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
      <Answer className="pt-12 sm:pt-16">{`CleanStar reinigt Büros und Gewerbeflächen in ${places.length} Orten im Ortenaukreis, von Rheinau im Norden bis Ettenheim und Rust im Süden und Wolfach im Kinzigtal. Unser Sitz ist in Offenburg.`}</Answer>
      <section className="py-20 sm:py-28" aria-labelledby="map-title">
        <div className="container-site">
          <h2 id="map-title" className="sr-only">
            Karte des Einzugsgebiets
          </h2>
          <AreaMap />
        </div>
      </section>
      <section className="bg-glacier py-24 sm:py-32" aria-labelledby="why-local-title">
        <div className="container-site grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeading
              eyebrow="Warum regional"
              title="Kurze Wege sind kein Detail."
              id="why-local-title"
              text="Wenn ein Team ausfällt oder Sie kurzfristig eine Zusatzreinigung brauchen, zählt jede Minute Anfahrt. Weil wir uns auf den Ortenaukreis konzentrieren, können wir planen, vertreten und nachreinigen, ohne lange Wege."
            />
          </div>
          <div data-reveal>
            <Picture id="region" sizes="(min-width:1024px) 50vw, 100vw" />
          </div>
        </div>
      </section>
      <FinalCta />
    </>
  )
}
