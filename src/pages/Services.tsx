import { Seo } from '@/components/ui/Seo'
import { PageHero } from '@/components/ui/PageHero'
import { Answer } from '@/components/ui/Answer'
import { ServicesGrid } from '@/components/home/ServicesGrid'
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
      <Answer className="pt-20 sm:pt-28">
        CleanStar bietet Unternehmen im Ortenaukreis Büroreinigung, Unterhaltsreinigung, Fensterreinigung, Treppenhausreinigung, Hallenreinigung und Hygienereinigung aus einer
        Hand, mit einem festen Ansprechpartner für alle Leistungen.
      </Answer>
      <ServicesGrid heading={false} />
      <section className="section pt-0!" aria-labelledby="incl-title">
        <div className="container-site">
          <SectionHeading
            layout="split"
            eyebrow="Bei jeder Leistung"
            title="Das ist immer dabei."
            id="incl-title"
            text="Egal, welche Leistung Sie buchen: Diese Punkte sind kein Extra, sondern Standard. Damit Sie nicht nachfragen müssen."
          />
          <ol className="mt-14 grid gap-x-8 sm:grid-cols-2 lg:mt-20">
            {included.map((t, i) => (
              <li key={t} className="flex items-baseline gap-5 border-b border-line py-5 first:border-t sm:[&:nth-child(2)]:border-t" data-reveal>
                <span className="t-label w-7 shrink-0">{String(i + 1).padStart(2, '0')}</span>
                <span className="text-[1.25rem] tracking-[-0.015em]">{t}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <FinalCta />
    </>
  )
}
