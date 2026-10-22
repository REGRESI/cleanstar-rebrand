import { ClipboardList, KeyRound, MessagesSquare, FileText } from 'lucide-react'
import { Seo } from '@/components/ui/Seo'
import { PageHero } from '@/components/ui/PageHero'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Picture } from '@/components/ui/Picture'
import { ProcessTimeline } from '@/components/home/ProcessTimeline'
import { FinalCta } from '@/components/home/FinalCta'
import { QuoteButton } from '@/features/configurator/QuoteLink'
import { Button } from '@/components/ui/Button'
import { RiskFreeSeal } from '@/components/ui/RiskFreeSeal'
import { breadcrumbSchema } from '@/lib/schema'

const trail = [
  { name: 'Start', path: '/' },
  { name: 'Ablauf', path: '/ablauf' },
]

const details = [
  {
    icon: ClipboardList,
    title: 'Bei der Besichtigung',
    items: [
      'Rundgang durch alle Räume, die gereinigt werden sollen',
      'Bodenbeläge, Sanitär, Küchen und Glasflächen ansehen',
      'Ihre Abläufe und Bürozeiten besprechen',
      'Zugang, Schlüssel und Alarmanlage klären',
    ],
  },
  {
    icon: FileText,
    title: 'Im Angebot',
    items: [
      'Leistungsverzeichnis Raum für Raum',
      'Intervalle und Einsatzzeiten',
      'Stundenansatz und Preis, netto und brutto',
      'Kündigung: erster Monat jederzeit, danach ein Monat zum Ende des Folgemonats',
    ],
  },
  {
    icon: KeyRound,
    title: 'Zum Start',
    items: ['Schlüsselübergabe mit Protokoll', 'Einweisung des festen Teams vor Ort', 'Notfall- und Vertretungsregel', 'Direkte Telefonnummer Ihres Ansprechpartners'],
  },
  {
    icon: MessagesSquare,
    title: 'Im laufenden Betrieb',
    items: ['Regelmäßige Qualitätskontrollen', 'Kurze Abstimmung mit Ihnen nach Bedarf', 'Änderungen schriftlich bestätigt', 'Kostenlose Nachreinigung bei Reklamation'],
  },
]

export default function Process() {
  return (
    <>
      <Seo
        title="Ablauf: So arbeiten wir zusammen"
        description="Anfrage, kostenlose Besichtigung, Angebot in 48 Stunden, fester Start und regelmäßige Kontrolle: So läuft die Zusammenarbeit mit CleanStar aus Offenburg ab."
        path="/ablauf"
        schema={[breadcrumbSchema(trail)]}
      />
      <PageHero
        trail={trail}
        eyebrow="Ablauf"
        title="So arbeiten wir zusammen."
        lead="Sechs klare Schritte, ohne Überraschungen. Ihr Aufwand: ein Termin für die Besichtigung. Den Rest organisieren wir, und im ersten Monat können Sie jederzeit kündigen."
        image="inspection"
        actions={
          <>
            <QuoteButton size="lg" arrow>
              Jetzt anfragen
            </QuoteButton>
            <Button to="/kontakt#besichtigung" variant="secondary" size="lg">
              Besichtigung buchen
            </Button>
          </>
        }
      />
      <ProcessTimeline title="Vom ersten Anruf bis zum sauberen Büro." eyebrow="Schritt für Schritt" />
      <section className="bg-glacier py-24 sm:py-32" aria-labelledby="details-title">
        <div className="container-site">
          <SectionHeading eyebrow="Im Detail" title="Was in den einzelnen Phasen passiert." id="details-title" />
          <ul className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2">
            {details.map((d) => (
              <li key={d.title} className="rounded-card bg-white p-6 ring-1 ring-line sm:p-8" data-reveal>
                <d.icon aria-hidden className="size-7 text-blue" strokeWidth={1.6} />
                <h3 className="mt-5 text-xl font-semibold tracking-tight">{d.title}</h3>
                <ul className="mt-4 space-y-2 text-muted">
                  {d.items.map((i) => (
                    <li key={i} className="flex gap-3">
                      <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-fresh" />
                      {i}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section className="py-24 sm:py-32" aria-labelledby="trial-title">
        <div className="container-site grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeading
              eyebrow="Erster Monat"
              title="Erst überzeugen, dann binden."
              id="trial-title"
              text="Im ersten Monat können Sie jederzeit kündigen, ohne Frist. Sie sehen jeden Morgen, wie Ihr Büro aussieht, und entscheiden dann. Eine einzelne Probereinigung vor dem Start ist auf Wunsch nach Absprache möglich."
            />
            <div className="mt-8" data-reveal>
              <RiskFreeSeal variant="card" />
            </div>
          </div>
          <div data-reveal>
            <Picture id="trial-clean" sizes="(min-width:1024px) 50vw, 100vw" />
          </div>
        </div>
      </section>
      <FinalCta />
    </>
  )
}
