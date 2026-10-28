import { ArrowDown } from 'lucide-react'
import downloads from 'virtual:downloads'

/**
 * Leadmagnet: Checkliste als PDF, direkt und ohne Anmeldung (DSGVO-freundlich). Ruhig und statisch: links Titel und
 * Text in gut lesbarer Größe, rechts der Download mit Dateiangaben. Keine Animation, nichts schiebt sich übereinander.
 */
export function LeadMagnet() {
  const d = downloads.checklist
  const kb = Math.max(1, Math.round(d.size / 1024))
  return (
    <div className="grid-site gap-y-10">
      <div className="col-span-12 lg:col-span-7">
        <p className="t-label">Kostenlose Checkliste</p>
        <h2 className="t-h2 mt-5 max-w-[20ch]">So erkennen Sie eine gute Büroreinigung.</h2>
        <p className="t-lead measure mt-6 text-ink-2">
          Die wichtigsten Fragen an jede Reinigungsfirma und ein Muster-Leistungsverzeichnis zum Abhaken. Ideal, um Angebote zu vergleichen.
        </p>
      </div>
      <div className="col-span-12 border-t border-line pt-6 lg:col-span-4 lg:col-start-9 lg:self-end">
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-[0.9375rem]">
          <dt className="text-muted">Format</dt>
          <dd>PDF, {kb} KB</dd>
          <dt className="text-muted">Zugang</dt>
          <dd>Direkt, ohne Anmeldung</dd>
        </dl>
        <a href={d.href} download={d.file} className="btn btn-primary mt-6 w-full sm:w-auto">
          Checkliste herunterladen
          <ArrowDown aria-hidden className="size-4" strokeWidth={1.75} />
        </a>
      </div>
    </div>
  )
}
