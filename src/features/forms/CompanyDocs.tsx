import { useState } from 'react'
import { ArrowDown } from 'lucide-react'
import downloads from 'virtual:downloads'
import { company, fullAddress } from '@/content/company'

/**
 * „Für Ihre Unterlagen“: Firmendaten zum Kopieren, Muster-Leistungsverzeichnis und Checkliste als PDF.
 * Für Einkauf und Verwaltung, die einen neuen Dienstleister anlegen.
 */
export function CompanyDocs() {
  const [copied, setCopied] = useState(false)
  const rows: [string, string][] = [
    ['Firma', company.legalName],
    ['Anschrift', fullAddress()],
    ['Gesellschafter', company.partners?.join(', ') ?? ''],
    ['USt-ID', company.vatId ?? ''],
    ['Telefon', company.phone.display],
    ['E-Mail', company.email],
  ]
  const copy = async () => {
    const text = rows.map(([k, v]) => `${k}: ${v}`).join('\n')
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // Fallback für ältere Browser bzw. file://
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      ta.remove()
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2400)
  }
  const files = [
    { ...downloads.serviceList, title: 'Muster: Was wird wie oft gereinigt?', note: 'Raum für Raum, mit Intervallen' },
    { ...downloads.checklist, title: 'Checkliste: gute Büroreinigung erkennen', note: 'Zum Vergleichen von Angeboten' },
  ]

  return (
    <div className="grid-site gap-y-14">
      <div className="col-span-12 lg:col-span-7">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="t-label">Firmendaten auf einen Blick</h3>
          <button type="button" onClick={copy} className="ulink shrink-0 text-[0.9375rem] text-ink" aria-live="polite">
            {copied ? 'Kopiert' : 'Alles kopieren'}
          </button>
        </div>
        <dl className="mt-4 border-t border-line">
          {rows.map(([k, v]) => (
            <div key={k} className="grid grid-cols-1 gap-0.5 border-b border-line py-3.5 min-[420px]:grid-cols-[9rem_1fr] min-[420px]:gap-4">
              <dt className="font-mono text-[0.8125rem] text-muted min-[420px]:pt-0.5">{k}</dt>
              <dd className="break-words text-ink">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="col-span-12 lg:col-span-4 lg:col-start-9">
        <h3 className="t-label">Zum Herunterladen</h3>
        <ul className="mt-4 border-t border-line">
          {files.map((f) => (
            <li key={f.file} className="border-b border-line">
              <a href={f.href} download={f.file} className="group flex items-start gap-4 py-4">
                <span className="min-w-0 flex-1">
                  <span className="ulink text-[1.125rem] font-medium">{f.title}</span>
                  <span className="mt-1 block font-mono text-[0.75rem] text-muted">PDF · {f.note}</span>
                </span>
                <ArrowDown aria-hidden className="mt-1 size-4 shrink-0 transition-transform duration-500 ease-cs group-hover:translate-y-0.5" strokeWidth={1.75} />
              </a>
            </li>
          ))}
        </ul>
        {company.liabilityInsurance && (
          <p className="mt-8 text-[0.9375rem] text-ink-2">
            <span className="font-medium text-ink">Betriebshaftpflichtversichert.</span> Den Nachweis senden wir Ihnen auf Anfrage gern zu.
          </p>
        )}
      </div>
    </div>
  )
}
