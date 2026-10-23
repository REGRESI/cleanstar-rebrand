import { ArrowDown } from 'lucide-react'
import downloads from 'virtual:downloads'
import { cn } from '@/lib/cn'

/** Leadmagnet: Checkliste als PDF, direkt und ohne Anmeldung (DSGVO-freundlich). Typografisch, ohne Karte. `dark` für dunkle Abschnitte. */
export function LeadMagnet({ dark }: { dark?: boolean }) {
  const d = downloads.checklist
  return (
    <div className={cn('grid-site gap-y-8 border-y py-10 lg:py-14', dark ? 'border-line-dark' : 'border-line')}>
      <p className="t-label col-span-12 lg:col-span-3 lg:pt-2">Kostenlose Checkliste · PDF</p>
      <div className="col-span-12 lg:col-span-6">
        <h3 className="t-h3">So erkennen Sie eine gute Büroreinigung.</h3>
        <p className="measure mt-4 text-ink-2">
          Die wichtigsten Fragen an jede Reinigungsfirma und ein Muster-Leistungsverzeichnis zum Abhaken. Ideal, um Angebote zu vergleichen. Direkt zum Download, ohne Anmeldung.
        </p>
      </div>
      <div className="col-span-12 lg:col-span-3 lg:self-end lg:justify-self-end">
        <a href={d.href} download={d.file} className={cn('btn', dark ? 'btn-outline-dark' : 'btn-outline')}>
          Checkliste herunterladen
          <ArrowDown aria-hidden className="size-4" strokeWidth={1.75} />
        </a>
      </div>
    </div>
  )
}
