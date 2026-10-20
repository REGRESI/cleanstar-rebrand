import { useState } from 'react'
import { CalendarCheck, Phone, ShieldCheck } from 'lucide-react'
import { company } from '@/content/company'
import { Todo } from '@/components/ui/Todo'
import { QuoteButton } from '@/features/configurator/QuoteLink'

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
    <div className="relative overflow-hidden rounded-panel bg-white p-6 ring-1 ring-line sm:p-10">
      <div aria-hidden className="bg-grid absolute inset-0 opacity-60" />
      <div className="relative mx-auto max-w-lg text-center">
        <span aria-hidden className="mx-auto grid size-14 place-items-center rounded-2xl bg-glacier text-blue">
          <CalendarCheck className="size-7" />
        </span>
        <h3 className="mt-5 text-2xl font-semibold tracking-tight">Termin für die kostenlose Besichtigung wählen</h3>
        {url ? (
          <>
            <p className="mt-3 text-muted">Wählen Sie direkt im Kalender einen freien Termin. Die Besichtigung ist kostenlos und unverbindlich.</p>
            <button
              type="button"
              onClick={() => setConsent(true)}
              className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-blue px-6 font-semibold text-white shadow-glow transition hover:bg-blue-hover"
            >
              Kalender laden
            </button>
            <p className="mt-4 flex items-start justify-center gap-2 text-left text-xs text-muted">
              <ShieldCheck aria-hidden className="mt-0.5 size-4 shrink-0" />
              Mit dem Klick wird der Buchungskalender von Cal.com geladen. Dabei werden Daten (z. B. Ihre IP-Adresse) an Cal.com übertragen. Details in der Datenschutzerklärung.
            </p>
          </>
        ) : (
          <>
            <p className="mt-3 text-muted">Die Online-Terminbuchung folgt in Kürze. Bis dahin vereinbaren wir den Termin gern persönlich mit Ihnen.</p>
            <Todo>Cal.com-Link in company.ts (booking.calUrl) eintragen</Todo>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <QuoteButton arrow>Termin anfragen</QuoteButton>
              <a
                href={company.phone.href}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 font-semibold text-ink ring-1 ring-line hover:ring-ink/25"
              >
                <Phone aria-hidden className="size-4 text-blue" />
                {company.phone.display}
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
