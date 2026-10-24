import { brand, home, trustFacts, guaranteePoints } from '@/content/site'
import { company, fullAddress } from '@/content/company'
import { services } from '@/content/services'
import { places, shortName } from '@/content/places'
import { pricing } from '@/content/pricing'
import { approvedQuotes, hasProof } from '@/content/proof'
import { nightEvents } from './extras'

/**
 * Die Leistungsmappe als Text: derselbe Inhalt wie im Buch, für Screenreader, Suchmaschinen und alle,
 * die lieber lesen als blättern. Wird vorgerendert und steht damit auch ohne JavaScript im HTML.
 */
export function TextVersion() {
  const h = 'mt-12 text-2xl font-medium tracking-[-0.02em] first:mt-0'
  const p = 'mt-3 text-ink-2'
  return (
    <div className="max-w-[68ch]">
      <h2 className={h}>{brand.promiseSet.replace('\n', ' ')}</h2>
      <p className={p}>Die Leistungsmappe von {company.legalName}.</p>

      <h2 className={h}>Wer wir sind</h2>
      <p className={p}>{home.promise.statement}</p>
      <p className={p}>{home.about.text}</p>
      <ul className="mt-3 list-disc pl-5 text-ink-2">
        {trustFacts.map((f) => (
          <li key={f.label}>
            {f.prefix}
            {f.value}
            {f.suffix} {f.label}
          </li>
        ))}
      </ul>

      <h2 className={h}>{home.about.headline}</h2>
      <ul className="mt-3 space-y-3 text-ink-2">
        {company.founders.map((f) => (
          <li key={f.name}>
            <strong className="font-medium text-ink">{f.name}</strong>, {f.role.replace('Gründer · ', '')}. Zuständig für {f.focus.join(', ')}.
            {f.statement && <> „{f.statement}“</>}
          </li>
        ))}
      </ul>

      <h2 className={h}>Leistungen</h2>
      <ul className="mt-3 space-y-2 text-ink-2">
        {services.map((s) => (
          <li key={s.slug}>
            <strong className="font-medium text-ink">{s.name}:</strong> {s.short}
          </li>
        ))}
      </ul>

      <h2 className={h}>Am Abend und am Morgen</h2>
      <p className={p}>
        So sieht Ihr Büro am Abend aus. Und so am Morgen. Gleicher Raum, gleicher Blickwinkel: dazwischen liegt eine Nacht, in der unser Team die Arbeitsplätze, die Teeküche und
        die Sanitärräume reinigt.
      </p>

      <h2 className={h}>Was passiert, während Sie schlafen</h2>
      <p className={p}>Beispielablauf. Die Zeiten richten sich nach Ihrem Objekt.</p>
      <ul className="mt-3 space-y-2 text-ink-2">
        {nightEvents.map((e) => (
          <li key={e.at}>
            <strong className="font-medium text-ink">
              {e.time} Uhr, {e.title}:
            </strong>{' '}
            {e.text}
          </li>
        ))}
      </ul>

      <h2 className={h}>{home.hero.sequenceTitle}</h2>
      <ol className="mt-3 list-decimal space-y-2 pl-5 text-ink-2">
        {home.hero.sequenceSteps.map((s) => (
          <li key={s.title}>
            <strong className="font-medium text-ink">{s.title}:</strong> {s.text}
          </li>
        ))}
      </ol>
      <p className={p}>Davor: Anfrage, kostenlose Besichtigung, Angebot in {company.promises.offerHours}&nbsp;Stunden und ein fester Start mit Ihrem Team.</p>

      <h2 className={h}>Qualitätsgarantie</h2>
      <ul className="mt-3 space-y-2 text-ink-2">
        {guaranteePoints.map((g) => (
          <li key={g.title}>
            <strong className="font-medium text-ink">{g.title}:</strong> {g.text}
          </li>
        ))}
      </ul>

      {hasProof() && (
        <>
          <h2 className={h}>Referenzen</h2>
          <ul className="mt-3 space-y-2 text-ink-2">
            {approvedQuotes().map((q) => (
              <li key={q.quote}>„{q.quote}“</li>
            ))}
          </ul>
        </>
      )}

      <h2 className={h}>Konditionen</h2>
      <p className={p}>
        {pricing.hourlyRateGrossMin} bis {pricing.hourlyRateGrossMax}&nbsp;€ brutto pro Mitarbeiterstunde. {company.contract.firstMonth} {company.contract.afterwards}
        {company.liabilityInsurance && ' Betriebshaftpflichtversichert. Den Nachweis senden wir Ihnen auf Anfrage.'}
      </p>

      <h2 className={h}>Einzugsgebiet</h2>
      <p className={p}>
        {company.serviceArea}:{' '}
        {places
          .filter((x) => x.slug !== 'offenburg')
          .map((x) => `${shortName(x)} (ca. ${x.minutes} Min.)`)
          .join(', ')}
        .
      </p>

      <h2 className={h}>Kontakt</h2>
      <p className={p}>
        {company.legalName}, {fullAddress()}. Telefon <a href={company.phone.href}>{company.phone.display}</a>, E-Mail <a href={`mailto:${company.email}`}>{company.email}</a>.{' '}
        {company.availability}.
      </p>
      <p className={p}>Notiz von {company.founders[company.newClientContact]?.name}: „Rufen Sie mich einfach an. Ich nehme mir Zeit.“</p>
      <p className={p}>
        Kostenlose Besichtigung anfragen: über die Anfragekarte im Einsteckfach der Mappe oder auf der <a href="/kontakt#besichtigung">Kontaktseite</a>.
      </p>
    </div>
  )
}
