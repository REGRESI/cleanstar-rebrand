import { useState } from 'react'
import { company } from '@/content/company'
import { Picture } from '@/components/ui/Picture'
import { QuoteButton } from '@/features/configurator/QuoteLink'
import type { ImageId } from '@/content/images'
import { CallbackButton } from '@/features/callback/Callback'

const points = [
  'Kostenlos und unverbindlich',
  'Wir sehen uns Ihre Räume an und klären Zugang und Zeiten',
  `Schriftliches Angebot innerhalb von ${company.promises.offerHours} Stunden`,
]

/**
 * Buchung der Objektbesichtigung über Cal.com.
 * Wird erst nach Klick geladen (DSGVO: keine Verbindung zu Cal.com vor der Einwilligung).
 */
export function BookingEmbed() {
  const [consent, setConsent] = useState(false)
  const url = company.booking.calUrl.trim()

  if (consent && url) {
    const src = `${url}${url.includes('?') ? '&' : '?'}embed=true&theme=light&layout=month_view`
    return (
      <div className="overflow-hidden border-y border-line bg-paper">
        <iframe src={src} title="Objektbesichtigung online buchen (Cal.com)" className="h-[720px] w-full" loading="lazy" />
      </div>
    )
  }

  return (
    <div className="grid-site gap-y-14">
      <div className="col-span-12 lg:col-span-6">
        <ul className="grid max-w-sm grid-cols-3 gap-3">
          {company.founders.map((f) => (
            <li key={f.image}>
              <Picture id={f.image as ImageId} compact ratio="4:5" sizes="120px" />
              <p className="mt-2 font-mono text-[0.75rem] text-muted">{f.name?.split(' ')[0]}</p>
            </li>
          ))}
        </ul>
        <p className="t-h4 mt-8">Sie sprechen direkt mit einem von uns.</p>
        <p className="mt-2 text-ink-2">
          {company.founders
            .map((f) => f.name?.split(' ')[0])
            .join(', ')
            .replace(/, ([^,]*)$/, ' oder $1')}
          . Kein Vertreter, kein Callcenter.
        </p>
        <ol className="mt-8 border-t border-line">
          {points.map((p, i) => (
            <li key={p} className="flex gap-5 border-b border-line py-3.5">
              <span className="t-label w-6 shrink-0 pt-0.5">{String(i + 1).padStart(2, '0')}</span>
              {p}
            </li>
          ))}
        </ol>
      </div>
      <div className="col-span-12 lg:col-span-5 lg:col-start-8">
        <div className="on-dark bg-night p-6 text-paper sm:p-10">
          <p className="t-label">Online buchen</p>
          <h3 className="t-h3 mt-4">Termin im Kalender wählen</h3>
          {url ? (
            <>
              <p className="mt-3 text-muted-dark">Freie Termine sehen und direkt buchen. Dauert eine Minute.</p>
              <button type="button" onClick={() => setConsent(true)} className="btn btn-primary mt-8 max-sm:w-full">
                Kalender laden
              </button>
              <p className="mt-5 font-mono text-[0.75rem] leading-relaxed text-muted-dark">
                Mit dem Klick wird der Buchungskalender von Cal.com geladen. Dabei werden Daten (z. B. Ihre IP-Adresse) an Cal.com übertragen. Details in der Datenschutzerklärung.
              </p>
            </>
          ) : (
            <div className="btn-row mt-8 flex flex-wrap gap-3">
              <QuoteButton arrow>Termin anfragen</QuoteButton>
            </div>
          )}
          <div className="mt-8 flex flex-col gap-2 border-t border-line-dark pt-6">
            <a href={company.phone.href} className="ulink self-start text-paper">
              Lieber telefonisch: {company.phone.display}
            </a>
            <CallbackButton dark className="self-start" />
          </div>
        </div>
      </div>
    </div>
  )
}
