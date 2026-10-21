import { Download, FileText } from 'lucide-react'
import downloads from 'virtual:downloads'

/** Leadmagnet: Checkliste als PDF, direkt und ohne Anmeldung (DSGVO-freundlich). */
export function LeadMagnet() {
  const d = downloads.checklist
  return (
    <div className="relative overflow-hidden rounded-panel bg-white p-6 shadow-soft ring-1 ring-line sm:p-10">
      <div aria-hidden className="absolute -top-20 -right-20 size-64 [background:radial-gradient(closest-side,rgb(45_212_191/0.24),transparent)]" />
      <div className="relative grid grid-cols-1 gap-8 sm:grid-cols-[auto_1fr] sm:items-center">
        <div aria-hidden className="relative mx-auto h-40 w-32 rotate-[-4deg] rounded-lg bg-glacier p-4 shadow-lift ring-1 ring-line sm:mx-0">
          <FileText className="size-6 text-blue" />
          <div className="mt-3 space-y-1.5">
            {[90, 70, 80, 60, 75, 50].map((w, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className="size-2 rounded-sm bg-fresh" />
                <span className="h-1.5 rounded-full bg-ink/15" style={{ width: `${w}%` }} />
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="eyebrow">Kostenlose Checkliste</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight">So erkennen Sie eine gute Büroreinigung.</h3>
          <p className="mt-3 text-muted">
            Die wichtigsten Fragen an jede Reinigungsfirma und ein Muster-Leistungsverzeichnis zum Abhaken. Ideal, um Angebote zu vergleichen. PDF, direkt zum Download, ohne
            Anmeldung.
          </p>
          <a href={d.href} download={d.file} className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-ink px-6 font-semibold text-white transition hover:bg-ink-3">
            <Download aria-hidden className="size-4" />
            Checkliste herunterladen (PDF)
          </a>
        </div>
      </div>
    </div>
  )
}
