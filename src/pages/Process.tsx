import { NightClock } from '@/components/scenes/NightClock'
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
import { SwitchCalculator } from '@/features/tools/SwitchCalculator'
import { RevealText } from '@/components/ui/RevealText'

const trail = [
  { name: 'Startseite', path: '/' },
  { name: 'Ablauf', path: '/ablauf' },
]

const details = [
  {
    title: 'Bei der Besichtigung',
    items: [
      'Rundgang durch alle Räume, die gereinigt werden sollen',
      'Bodenbeläge, Sanitär, Küchen und Glasflächen ansehen',
      'Ihre Abläufe und Bürozeiten besprechen',
      'Zugang, Schlüssel und Alarmanlage klären',
    ],
  },
  {
    title: 'Im Angebot',
    items: [
      'Leistungsverzeichnis Raum für Raum',
      'Intervalle und Einsatzzeiten',
      'Stundenansatz und Preis, netto und brutto',
      'Kündigung: erster Monat jederzeit, danach ein Monat zum Ende des Folgemonats',
    ],
  },
  {
    title: 'Zum Start',
    items: ['Schlüsselübergabe mit Protokoll', 'Einweisung des festen Teams vor Ort', 'Notfall- und Vertretungsregel', 'Direkte Telefonnummer Ihres Ansprechpartners'],
  },
  {
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
        image="svc-unterhalt"
        actions={
          <>
            <QuoteButton size="lg" arrow>
              Jetzt anfragen
            </QuoteButton>
            <Button to="/kontakt#besichtigung" variant="link">
              Besichtigung buchen
            </Button>
          </>
        }
      />
      <ProcessTimeline title="Vom ersten Anruf bis zum sauberen Büro." eyebrow="Schritt für Schritt" />
      <NightClock />
      <section className="section bg-surface" aria-labelledby="details-title">
        <div className="container-site">
          <SectionHeading layout="rail" eyebrow="Im Detail" title="Was in den einzelnen Phasen passiert." id="details-title" />
          <ul className="mt-16 grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:mt-24 lg:grid-cols-4">
            {details.map((d) => (
              <li key={d.title} className="relative pt-6" data-reveal>
                <span aria-hidden data-reveal-rule className="rule absolute inset-x-0 top-0" />
                <h3 className="text-[1.375rem] leading-[1.2] font-medium tracking-[-0.02em]">{d.title}</h3>
                <ul className="mt-5 border-t border-line">
                  {d.items.map((i) => (
                    <li key={i} className="border-b border-line py-3 text-[1rem] text-ink-2">
                      {i}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section className="on-dark section bg-night text-paper" aria-labelledby="trial-title">
        <div className="container-site grid-site gap-y-12 lg:items-end">
          <div className="col-span-12 lg:col-span-6">
            <p className="t-label mb-6">Erster Monat</p>
            <RevealText as="h2" text="Erst überzeugen, dann binden." id="trial-title" className="t-h1" />
            <p className="t-lead measure mt-8" data-reveal>
              Im ersten Monat können Sie jederzeit kündigen, ohne Frist. Sie sehen jeden Morgen, wie Ihr Büro aussieht, und entscheiden dann. Eine einzelne Probereinigung vor dem
              Start ist auf Wunsch nach Absprache möglich.
            </p>
            <div className="mt-10" data-reveal>
              <RiskFreeSeal variant="card" dark />
            </div>
          </div>
          <div className="col-span-12 lg:col-span-5 lg:col-start-8">
            <Picture id="after-office" ratio="4:5" reveal tone="dark" sizes="(min-width:1024px) 40vw, 100vw" />
          </div>
        </div>
      </section>
      <section id="wechsel" className="section scroll-mt-24" aria-labelledby="switch-title">
        <div className="container-site">
          <SectionHeading
            layout="split"
            eyebrow="Wechsel-Rechner"
            title="Wann können Sie wechseln?"
            id="switch-title"
            text="Geben Sie Ihre aktuelle Kündigungsfrist ein. Sie sehen, bis wann Sie kündigen müssen und ab wann wir starten können."
          />
          <div className="mt-14 lg:mt-20" data-reveal>
            <SwitchCalculator />
          </div>
        </div>
      </section>
      <FinalCta />
    </>
  )
}
