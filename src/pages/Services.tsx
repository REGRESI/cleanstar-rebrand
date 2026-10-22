import { Seo } from '@/components/ui/Seo'
import { PageHero } from '@/components/ui/PageHero'
import { Answer } from '@/components/ui/Answer'
import { ServicesGrid } from '@/components/home/ServicesGrid'
import { FinalCta } from '@/components/home/FinalCta'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { QuoteButton } from '@/features/configurator/QuoteLink'
import { Button } from '@/components/ui/Button'
import { breadcrumbSchema } from '@/lib/schema'
import { Check } from 'lucide-react'

const trail = [
  { name: 'Start', path: '/' },
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
            <Button to="/ablauf" variant="secondary" size="lg">
              So läuft es ab
            </Button>
          </>
        }
      />
      <Answer className="pt-12 sm:pt-16">
        CleanStar bietet Unternehmen im Ortenaukreis Büroreinigung, Unterhaltsreinigung, Fensterreinigung, Treppenhausreinigung, Hallenreinigung und Hygienereinigung aus einer
        Hand, mit einem festen Ansprechpartner für alle Leistungen.
      </Answer>
      <ServicesGrid heading={false} />
      <section className="py-24 sm:py-32" aria-labelledby="incl-title">
        <div className="container-site grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeading
              eyebrow="Bei jeder Leistung"
              title="Das ist immer dabei."
              id="incl-title"
              text="Egal, welche Leistung Sie buchen: Diese Punkte sind kein Extra, sondern Standard."
            />
          </div>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:col-span-7">
            {included.map((i) => (
              <li key={i} className="flex items-center gap-3 rounded-2xl bg-white p-4 ring-1 ring-line" data-reveal>
                <span aria-hidden className="grid size-8 shrink-0 place-items-center rounded-full bg-fresh/15 text-fresh-ink">
                  <Check className="size-4" strokeWidth={3} />
                </span>
                <span className="font-medium">{i}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <FinalCta />
    </>
  )
}
