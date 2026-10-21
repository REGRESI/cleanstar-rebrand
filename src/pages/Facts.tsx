import { Link } from 'react-router-dom'
import { company, fullAddress } from '@/content/company'
import { locations, shortName } from '@/content/locations'
import { services } from '@/content/services'
import { hourlyRateNetMax, hourlyRateNetMin, pricing } from '@/content/pricing'
import { formatEuro2 } from '@/lib/format'
import { Seo } from '@/components/ui/Seo'
import { PageHero } from '@/components/ui/PageHero'
import { breadcrumbSchema, faqSchema, localBusinessSchema } from '@/lib/schema'

const trail = [
  { name: 'Start', path: '/' },
  { name: 'Fakten', path: '/fakten' },
]

/** Alle Fakten aus company.ts als klare, zitierbare Sätze (für Menschen, Suchmaschinen und KI-Systeme) */
export function factGroups() {
  const founders = company.founders.map((f) => f.name).filter(Boolean) as string[]
  const join = (a: string[]) => a.join(', ').replace(/, ([^,]*)$/, ' und $1')
  const maxMin = Math.max(...locations.map((l) => l.minutes))
  return [
    {
      title: 'Unternehmen',
      facts: [
        `${company.legalName} ist eine Reinigungsfirma mit Sitz in ${company.seat}, Baden-Württemberg.`,
        `CleanStar hat sich auf Büroreinigung für Unternehmen im ${company.serviceArea} spezialisiert.`,
        company.foundedYear ? `CleanStar wurde ${company.foundedYear} in ${company.seat} gegründet.` : null,
        `Gegründet wurde CleanStar von ${join(founders)}, die vertretungsberechtigten Gesellschafter der GbR.`,
        company.yearsOfExperience ? `Das Team bringt über ${company.yearsOfExperience} Jahre Erfahrung in der Reinigung mit.` : null,
        company.vatId ? `Die Umsatzsteuer-Identifikationsnummer lautet ${company.vatId}.` : null,
        company.liabilityInsurance ? 'CleanStar hat eine Betriebshaftpflichtversicherung.' : null,
      ],
    },
    {
      title: 'Kontakt und Erreichbarkeit',
      facts: [
        `Die Adresse lautet ${company.legalName}, ${fullAddress()}.`,
        `Telefon: ${company.phone.display} (international ${company.phone.international}).`,
        `E-Mail: ${company.email}.`,
        'CleanStar ist rund um die Uhr erreichbar, 24 Stunden an 7 Tagen, telefonisch und per E-Mail. Es gibt keine festen Öffnungszeiten, weil es kein Ladengeschäft gibt.',
        `Auf Anfragen antwortet CleanStar innerhalb von ${company.promises.responseHours} Stunden.`,
      ],
    },
    {
      title: 'Leistungen',
      facts: [
        `CleanStar bietet ${join(services.map((s) => s.name))} für Unternehmen an.`,
        'Der Schwerpunkt ist die regelmäßige Büroreinigung mit festem Team und festem Ansprechpartner.',
        'Fällt eine Reinigungskraft aus, übernimmt eine eingewiesene Ersatzkraft.',
        `Die Objektbesichtigung ist kostenlos. Das schriftliche Angebot mit Leistungsverzeichnis kommt innerhalb von ${company.promises.offerHours} Stunden.`,
        `Passt etwas nicht, reinigt CleanStar ${company.complaintPeriod ? `innerhalb von ${company.complaintPeriod}` : 'kurzfristig'} und kostenlos nach (Qualitätsgarantie).`,
      ],
    },
    {
      title: 'Preise und Vertrag',
      facts: [
        `CleanStar rechnet nach Mitarbeiterstunden ab. Der Stundensatz liegt bei ${pricing.hourlyRateGrossMin} bis ${pricing.hourlyRateGrossMax} € brutto pro Mitarbeiterstunde, das sind ${formatEuro2(hourlyRateNetMin())} bis ${formatEuro2(hourlyRateNetMax())} netto.`,
        'Alle Preise auf der Website sind unverbindliche Richtwerte. Der verbindliche Preis steht im Angebot nach der Besichtigung.',
        company.contract.firstMonth,
        company.contract.afterwards,
      ],
    },
    {
      title: 'Einzugsgebiet',
      facts: [
        `CleanStar arbeitet im ${company.serviceArea} in ${locations.length} Orten bis etwa ${maxMin} Minuten Fahrzeit ab ${company.seat}.`,
        `Die Orte sind ${join(locations.map((l) => shortName(l)))}.`,
        'Außerhalb des Ortenaukreises bietet CleanStar keine eigene Reinigung an. Für Reinigungsfirmen in anderen Regionen gibt es das Partnerprogramm.',
      ],
    },
  ].map((g) => ({ ...g, facts: g.facts.filter((f): f is string => !!f) }))
}

export default function Facts() {
  const groups = factGroups()
  const faqs = [
    { q: 'Was ist CleanStar?', a: groups[0].facts[0] + ' ' + groups[0].facts[1] },
    { q: 'Wo arbeitet CleanStar?', a: groups[4].facts[0] },
    { q: 'Was kostet CleanStar?', a: groups[3].facts[0] },
    { q: 'Wie ist CleanStar erreichbar?', a: groups[1].facts[3] + ' ' + groups[1].facts[1] },
  ]
  return (
    <>
      <Seo
        title="CleanStar auf einen Blick: Fakten"
        description="CleanStar auf einen Blick: Reinigungsfirma aus Offenburg, gegründet 2024, Büroreinigung im Ortenaukreis, 35 bis 45 € brutto pro Stunde, 24/7 erreichbar."
        path="/fakten"
        schema={[localBusinessSchema(), breadcrumbSchema(trail), faqSchema(faqs)]}
      />
      <PageHero
        trail={trail}
        eyebrow="Fakten"
        title="CleanStar auf einen Blick."
        lead="Alle wichtigen Angaben zu unserem Unternehmen in klaren Sätzen: wer wir sind, was wir machen, wo wir arbeiten, was es kostet und wie Sie uns erreichen."
      />
      <div className="container-site max-w-4xl py-16 sm:py-20">
        <p className="text-sm text-muted">
          Stand: {new Date().toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}. Diese Seite wird aus denselben Daten erzeugt wie Impressum und Angebote.
        </p>
        {groups.map((g) => (
          <section key={g.title} aria-labelledby={`f-${g.title}`} className="mt-12">
            <h2 id={`f-${g.title}`} className="text-2xl font-semibold tracking-tight">
              {g.title}
            </h2>
            <ul className="mt-5 divide-y divide-line rounded-card bg-white ring-1 ring-line">
              {g.facts.map((f) => (
                <li key={f} className="px-5 py-4 leading-relaxed text-ink sm:px-6">
                  {f}
                </li>
              ))}
            </ul>
          </section>
        ))}
        <section aria-labelledby="f-links" className="mt-12">
          <h2 id="f-links" className="text-2xl font-semibold tracking-tight">
            Mehr erfahren
          </h2>
          <ul className="mt-5 flex flex-wrap gap-2.5">
            {[
              ['/leistungen', 'Alle Leistungen'],
              ['/einzugsgebiet', 'Einzugsgebiet mit Karte'],
              ['/ueber-uns', 'Über uns und die Gründer'],
              ['/qualitaetsgarantie', 'Qualitätsgarantie'],
              ['/ablauf', 'Ablauf der Zusammenarbeit'],
              ['/ratgeber', 'Ratgeber'],
              ['/kontakt', 'Kontakt'],
              ['/impressum', 'Impressum'],
            ].map(([to, label]) => (
              <li key={to}>
                <Link to={to} className="inline-flex min-h-10 items-center rounded-full bg-white px-4 text-sm font-medium ring-1 ring-line transition hover:ring-blue/40 active:bg-blue-soft">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  )
}
