import { InlineLinks } from '@/components/ui/Editorial'
import { company, fullAddress } from '@/content/company'
import { locations, shortName } from '@/content/locations'
import { services } from '@/content/services'
import { hourlyRateNetMax, hourlyRateNetMin, pricing } from '@/content/pricing'
import { formatEuro2Range, noOrphan } from '@/lib/format'
import { Seo } from '@/components/ui/Seo'
import { PageHero } from '@/components/ui/PageHero'
import { answers } from '@/content/answers'
import { Answer } from '@/components/ui/Answer'
import { breadcrumbSchema, faqSchema, localBusinessSchema, ORG_ID, absoluteUrl } from '@/lib/schema'
import { pageMeta } from '@/content/pageMeta'
import { formatDate } from '@/lib/format'

const trail = [
  { name: 'Startseite', path: '/' },
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
        company.yearsOfExperience ? `Das Team bringt über ${company.yearsOfExperience} Jahre Erfahrung in der Reinigung mit.` : null,
        company.vatId ? `Die Umsatzsteuer-Identifikationsnummer lautet ${company.vatId}.` : null,
        company.liabilityInsurance ? 'CleanStar ist über eine Betriebshaftpflicht versichert.' : null,
      ],
    },
    {
      title: 'Kontakt und Erreichbarkeit',
      facts: [
        `Die Adresse lautet ${company.legalName}, ${fullAddress()}.`,
        `Telefon: ${company.phone.display} (international ${company.phone.international}).`,
        `E-Mail: ${company.email}.`,
        'CleanStar ist rund um die Uhr erreichbar, 24 Stunden an 7 Tagen, telefonisch und per E-Mail. Es gibt keine festen Öffnungszeiten, weil es kein Ladengeschäft gibt.',
        `Auf Anfragen antwortet CleanStar innerhalb von ${company.promises.responseHours} Stunden.`,
      ],
    },
    {
      title: 'Leistungen',
      facts: [
        `CleanStar bietet ${join(services.map((s) => s.name))} für Unternehmen an.`,
        'Der Schwerpunkt ist die regelmäßige Büroreinigung mit festem Team und festem Ansprechpartner.',
        'Fällt eine Reinigungskraft aus, übernimmt eine eingewiesene Ersatzkraft.',
        `Die Objektbesichtigung ist kostenlos. Das schriftliche Angebot mit Leistungsverzeichnis kommt innerhalb von ${company.promises.offerHours} Stunden.`,
        `Passt etwas nicht, reinigt CleanStar ${company.complaintPeriod ? `innerhalb von ${company.complaintPeriod}` : 'kurzfristig'} und kostenlos nach (Qualitätsgarantie).`,
      ],
    },
    {
      title: 'Preise und Vertrag',
      facts: [
        `CleanStar rechnet nach Mitarbeiterstunden ab. Der Stundensatz liegt bei ${pricing.hourlyRateGrossMin} bis ${pricing.hourlyRateGrossMax} € brutto pro Mitarbeiterstunde, das sind ${formatEuro2Range(hourlyRateNetMin(), hourlyRateNetMax())} netto.`,
        'Alle Preise auf der Website sind unverbindliche Richtwerte. Der verbindliche Preis steht im Angebot nach der Besichtigung.',
        company.contract.firstMonth,
        company.contract.afterwards,
      ],
    },
    {
      title: 'Einzugsgebiet',
      facts: [
        `CleanStar arbeitet im ${company.serviceArea} in ${locations.length} Orten bis etwa ${maxMin} Minuten Fahrzeit ab ${company.seat}.`,
        `Die Orte sind ${join(locations.map((l) => shortName(l)))}.`,
        'Außerhalb des Ortenaukreises bietet CleanStar keine eigene Reinigung an. Für Reinigungsfirmen in anderen Regionen gibt es das Partnerprogramm.',
      ],
    },
  ].map((g) => ({ ...g, facts: g.facts.filter((f): f is string => !!f) }))
}

export default function Facts() {
  const groups = factGroups()
  const meta = pageMeta['/fakten']
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
        description="CleanStar auf einen Blick: Reinigungsfirma aus Offenburg, gegründet 2024, Büroreinigung im Ortenaukreis, 35 bis 45 € brutto pro Stunde, 24/7 erreichbar."
        path="/fakten"
        schema={[
          {
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'CleanStar auf einen Blick',
            url: absoluteUrl('/fakten'),
            datePublished: meta.published,
            dateModified: meta.modified,
            inLanguage: 'de-DE',
            about: { '@id': ORG_ID },
            publisher: { '@id': ORG_ID },
          },
          localBusinessSchema(),
          breadcrumbSchema(trail),
          faqSchema(faqs),
        ]}
      />
      <PageHero
        trail={trail}
        eyebrow="Fakten"
        title="CleanStar auf einen Blick."
        lead="Alle wichtigen Angaben zu unserem Unternehmen in klaren Sätzen: wer wir sind, was wir machen, wo wir arbeiten, was es kostet und wie Sie uns erreichen."
      />
      <Answer question={answers.fakten.question} bottom="pb-16 sm:pb-20 lg:pb-24">
        {answers.fakten.text}
      </Answer>
      <div className="container-site grid-site gap-y-16 pb-24 lg:pb-40">
        <p className="t-label col-span-12 lg:col-span-3">
          Zuletzt aktualisiert am <time dateTime={meta.modified}>{formatDate(meta.modified)}</time>. Diese Seite wird aus denselben Daten erzeugt wie Impressum und Angebote.
        </p>
        <div className="col-span-12 space-y-16 lg:col-span-8 lg:col-start-5">
          {groups.map((g, gi) => (
            <section key={g.title} aria-labelledby={`f-${g.title}`}>
              <p className="t-label">{String(gi + 1).padStart(2, '0')}</p>
              <h2 id={`f-${g.title}`} className="t-h3 mt-3">
                {noOrphan(g.title, 20)}
              </h2>
              <ul className="mt-6 border-t border-line">
                {g.facts.map((f) => (
                  <li key={f} className="border-b border-line py-4 text-ink">
                    {f}
                  </li>
                ))}
              </ul>
            </section>
          ))}
          <nav aria-labelledby="f-links">
            <h2 id="f-links" className="t-label">
              Weiterführende Seiten
            </h2>
            <InlineLinks
              className="mt-5"
              items={[
                ['/leistungen', 'Alle Leistungen'],
                ['/einzugsgebiet', 'Einzugsgebiet mit Karte'],
                ['/ueber-uns', 'Über uns und die Gründer'],
                ['/qualitaetsgarantie', 'Qualitätsgarantie'],
                ['/ablauf', 'Ablauf der Zusammenarbeit'],
                ['/ratgeber', 'Ratgeber'],
                ['/kontakt', 'Kontakt'],
                ['/impressum', 'Impressum'],
              ].map(([to, label]) => ({ to, label }))}
            />
          </nav>
        </div>
      </div>
    </>
  )
}
