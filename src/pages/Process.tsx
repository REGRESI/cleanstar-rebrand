import { ClipboardList, KeyRound, MessagesSquare, FileText } from 'lucide-react'
import { Seo } from '@/components/ui/Seo'
import { PageHero } from '@/components/ui/PageHero'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Picture } from '@/components/ui/Picture'
import { ProcessTimeline } from '@/components/home/ProcessTimeline'
import { FinalCta } from '@/components/home/FinalCta'
import { QuoteButton } from '@/features/configurator/QuoteLink'
import { Button } from '@/components/ui/Button'
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
    items: ['Leistungsverzeichnis Raum für Raum', 'Intervalle und Einsatzzeiten', 'Stundenansatz und Preis, netto und brutto', 'Laufzeit, Kündigung und Ansprechpartner'],
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
        title="So arbeiten wir zusammen: vom Anruf bis zur Routine"
        description="Anfrage, kostenlose Objektbesichtigung, Angebot in 48 Stunden, Probereinigung, fester Start und regelmäßige Qualitätskontrolle. So läuft die Zusammenarbeit mit CleanStar."
        path="/ablauf"
        schema={[breadcrumbSchema(trail)]}
      />
      <PageHero
        trail={trail}
        eyebrow="Ablauf"
        title="So arbeiten wir zusammen."
        lead="Sechs klare Schritte, ohne Überraschungen. Sie wissen jederzeit, was als Nächstes passiert und wer Ihr Ansprechpartner ist."
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
      <ProcessTimeline title="Sechs Schritte zur sauberen Routine." eyebrow="Schritt für Schritt" />
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
              eyebrow="Probereinigung"
              title="Erst sehen, dann entscheiden."
              id="trial-title"
              text="Vor dem regulären Start reinigen wir einmal zur Probe. Sie sehen das Ergebnis mit eigenen Augen, wir lernen Ihr Objekt kennen. Passt etwas noch nicht, justieren wir das Leistungsverzeichnis, bevor es losgeht."
            />
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
