import { Link } from 'react-router-dom'
import { ArrowRight, Handshake } from 'lucide-react'

/** Schmaler Hinweis auf das Partnerprogramm (Über uns, Karriere). */
export function PartnerTeaser() {
  return (
    <section aria-label="Partnerprogramm" className="pb-20 sm:pb-24">
      <div className="container-site">
        <Link
          to="/partner"
          className="group flex flex-col gap-4 rounded-card bg-white p-5 ring-1 ring-line transition hover:shadow-soft hover:ring-blue/30 sm:flex-row sm:items-center sm:gap-6 sm:p-6"
          data-reveal
        >
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-glacier text-blue">
            <Handshake aria-hidden className="size-6" strokeWidth={1.6} />
          </span>
          <span className="flex-1">
            <span className="block font-semibold text-ink">Sie führen eine Reinigungsfirma oder möchten eine gründen?</span>
            <span className="block text-sm text-muted">Mit dem CleanStar-Partnerprogramm bringen wir unsere Abläufe in weitere Regionen.</span>
          </span>
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-blue">
            Partner werden
            <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
      </div>
    </section>
  )
}
