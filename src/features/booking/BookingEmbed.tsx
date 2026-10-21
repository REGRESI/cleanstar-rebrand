import { useState } from 'react'
import { CalendarCheck, Check, Phone, ShieldCheck } from 'lucide-react'
import { company } from '@/content/company'
import { Picture } from '@/components/ui/Picture'
import { QuoteButton } from '@/features/configurator/QuoteLink'
import type { ImageId } from '@/content/images'

const points = [
  'Kostenlos und unverbindlich',
  'Wir sehen uns Ihre Räume an und klären Zugang und Zeiten',
  `Schriftliches Angebot innerhalb von ${company.promises.offerHours} Stunden`,
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
      <div className="overflow-hidden rounded-panel bg-white ring-1 ring-line">
        <iframe src={src} title="Objektbesichtigung online buchen (Cal.com)" className="h-[720px] w-full" loading="lazy" />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 overflow-hidden rounded-panel bg-white shadow-soft ring-1 ring-line lg:grid-cols-2">
      <div className="p-6 sm:p-10">
        <div className="flex -space-x-3">
          {company.founders.map((f) => (
            <span key={f.image} className="block size-14 overflow-hidden rounded-full ring-4 ring-white">
              <Picture id={f.image as ImageId} compact rounded="rounded-none" className="h-full w-full aspect-auto!" sizes="56px" />
            </span>
          ))}
        </div>
        <p className="mt-5 text-xl font-semibold tracking-tight">Sie sprechen direkt mit einem von uns.</p>
        <p className="mt-2 text-muted">
          {company.founders
            .map((f) => f.name?.split(' ')[0])
            .join(', ')
            .replace(/, ([^,]*)$/, ' oder $1')}
          . Kein Vertreter, kein Callcenter.
        </p>
        <ul className="mt-6 space-y-3">
          {points.map((p) => (
            <li key={p} className="flex items-start gap-3 text-ink">
              <Check aria-hidden className="mt-1 size-4 shrink-0 text-fresh-ink" strokeWidth={3} />
              {p}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-col justify-center border-t border-line bg-glacier p-6 sm:p-10 lg:border-t-0 lg:border-l">
        <span aria-hidden className="grid size-12 place-items-center rounded-2xl bg-white text-blue shadow-soft">
          <CalendarCheck className="size-6" />
        </span>
        <h3 className="mt-5 text-2xl font-semibold tracking-tight">Termin im Kalender wählen</h3>
        {url ? (
          <>
            <p className="mt-2 text-muted">Freie Termine sehen und direkt buchen. Dauert eine Minute.</p>
            <button
              type="button"
              onClick={() => setConsent(true)}
              className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 self-start rounded-full bg-blue px-6 font-semibold text-white shadow-glow transition hover:bg-blue-hover max-sm:w-full"
            >
              Kalender laden
            </button>
            <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-muted">
              <ShieldCheck aria-hidden className="mt-0.5 size-4 shrink-0" />
              Mit dem Klick wird der Buchungskalender von Cal.com geladen. Dabei werden Daten (z. B. Ihre IP-Adresse) an Cal.com übertragen. Details in der Datenschutzerklärung.
            </p>
          </>
        ) : (
          <div className="btn-row mt-6 flex flex-wrap gap-3">
            <QuoteButton arrow>Termin anfragen</QuoteButton>
          </div>
        )}
        <a href={company.phone.href} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-ink hover:text-blue">
          <Phone aria-hidden className="size-4 text-blue" />
          Lieber telefonisch: {company.phone.display}
        </a>
      </div>
    </div>
  )
}
