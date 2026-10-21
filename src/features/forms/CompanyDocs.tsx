import { useState } from 'react'
import { Check, Copy, Download, FileText, ShieldCheck } from 'lucide-react'
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
    { ...downloads.serviceList, title: 'Muster-Leistungsverzeichnis', note: 'Raum für Raum, mit Intervallen' },
    { ...downloads.checklist, title: 'Checkliste: gute Büroreinigung erkennen', note: 'Zum Vergleichen von Angeboten' },
  ]

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
      <div className="rounded-panel bg-white p-6 ring-1 ring-line sm:p-8 lg:col-span-7">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-xl font-semibold tracking-tight">Firmendaten auf einen Blick</h3>
          <button
            type="button"
            onClick={copy}
            className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full bg-glacier px-4 text-sm font-semibold text-ink transition hover:bg-glacier-2"
            aria-live="polite"
          >
            {copied ? <Check aria-hidden className="size-4 text-fresh-ink" /> : <Copy aria-hidden className="size-4" />}
            {copied ? 'Kopiert' : 'Kopieren'}
          </button>
        </div>
        <dl className="mt-5 divide-y divide-line text-sm">
          {rows.map(([k, v]) => (
            <div key={k} className="grid grid-cols-1 gap-0.5 py-3 min-[420px]:grid-cols-[8.5rem_1fr] min-[420px]:gap-3">
              <dt className="text-muted">{k}</dt>
              <dd className="font-medium break-words text-ink">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="flex flex-col gap-4 lg:col-span-5">
        {files.map((f) => (
          <a
            key={f.file}
            href={f.href}
            download={f.file}
            className="group flex items-center gap-4 rounded-card bg-white p-5 ring-1 ring-line transition hover:shadow-soft hover:ring-blue/30"
          >
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-glacier text-blue">
              <FileText aria-hidden className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold text-ink">{f.title}</span>
              <span className="block text-sm text-muted">PDF · {f.note}</span>
            </span>
            <Download aria-hidden className="size-5 shrink-0 text-blue transition-transform group-hover:translate-y-0.5" />
          </a>
        ))}
        {company.liabilityInsurance && (
          <p className="flex items-start gap-3 rounded-card bg-glacier p-5 text-sm text-ink">
            <ShieldCheck aria-hidden className="mt-0.5 size-5 shrink-0 text-blue" />
            <span>
              <strong className="font-semibold">Betriebshaftpflichtversichert.</strong> <span className="text-muted">Den Nachweis senden wir Ihnen auf Anfrage gern zu.</span>
            </span>
          </p>
        )}
      </div>
    </div>
  )
}
