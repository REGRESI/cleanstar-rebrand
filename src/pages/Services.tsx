import { Seo } from '@/components/ui/Seo'
import { PageHero } from '@/components/ui/PageHero'
import { Answer } from '@/components/ui/Answer'
import { Collage } from '@/components/ui/Collage'
import { WipeScene } from '@/components/scenes/WipeScene'
import { ServiceChapters } from '@/components/services/ServiceChapters'
import { FinalCta } from '@/components/home/FinalCta'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { QuoteButton } from '@/features/configurator/QuoteLink'
import { Button } from '@/components/ui/Button'
import { breadcrumbSchema } from '@/lib/schema'

const trail = [
  { name: 'Startseite', path: '/' },
  { name: 'Leistungen', path: '/leistungen' },
]

const included = [
  'Kostenlose Objektbesichtigung vor Ort',
  'Schriftliches Leistungsverzeichnis',
  'Angebot innerhalb von 48 Stunden',
  'Fester Ansprechpartner',
  'Festes, eingewiesenes Team',
  'Ersatzkraft bei Ausfall',
  'Regelmäßige Qualitätskontrolle',
  'Kostenlose Nachreinigung bei Reklamation',
]

export default function Services() {
  return (
    <>
      <Seo
        title="Gebäudereinigung Offenburg: Leistungen"
        description="Alle Leistungen von CleanStar für Unternehmen im Ortenaukreis: Büro-, Unterhalts-, Fenster-, Treppenhaus-, Hallen- und Hygienereinigung aus einer Hand."
        path="/leistungen"
        ogType="leistung"
        schema={[breadcrumbSchema(trail)]}
      />
      <PageHero
        trail={trail}
        eyebrow="Leistungen"
        title="Ein Ansprechpartner für alles, was sauber sein muss."
        lead="Unser Schwerpunkt ist die Büroreinigung. Fenster, Treppenhaus, Halle und Hygiene kommen dazu, wenn Sie sie brauchen. Mit demselben Team und demselben Ansprechpartner."
        actions={
          <>
            <QuoteButton size="lg" arrow />
            <Button to="/ablauf" variant="link">
              So läuft es ab
            </Button>
          </>
        }
      />
      <ServiceChapters />
      <WipeScene />
      <section className="section bg-surface" aria-labelledby="incl-title">
        <div className="container-site">
          <SectionHeading
            scrub
            layout="split"
            eyebrow="Bei jeder Leistung"
            title="Das ist immer dabei."
            id="incl-title"
            text="Egal, welche Leistung Sie buchen: Diese Punkte sind kein Extra, sondern Standard. Damit Sie nicht nachfragen müssen."
          />
          <div className="grid-site mt-14 gap-y-16 lg:mt-20 lg:items-center">
            <ol className="col-span-12 lg:col-span-6">
              {included.map((t, i) => (
                <li key={t} className="flex items-baseline gap-5 border-b border-line py-5 first:border-t" data-reveal>
                  <span className="t-label w-7 shrink-0">{String(i + 1).padStart(2, '0')}</span>
                  <span className="text-[1.25rem] tracking-[-0.015em]">{t}</span>
                </li>
              ))}
            </ol>
            <Collage
              className="col-span-12 sm:col-span-10 sm:col-start-2 lg:col-span-5 lg:col-start-8"
              layers={[{ id: 'svc-fenster' }, { id: 'svc-treppenhaus' }, { id: 'svc-hygiene' }]}
            />
          </div>
        </div>
      </section>
      <Answer className="pt-20 sm:pt-28 lg:pt-36">
        CleanStar bietet Unternehmen im Ortenaukreis Büroreinigung, Unterhaltsreinigung, Fensterreinigung, Treppenhausreinigung, Hallenreinigung und Hygienereinigung aus einer
        Hand, mit einem festen Ansprechpartner für alle Leistungen.
      </Answer>
      <FinalCta />
    </>
  )
}
