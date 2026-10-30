import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

/** Schmaler Hinweis auf das Partnerprogramm (Über uns, Karriere): eine Zeile mit Haarlinien, kein Kasten. */
export function PartnerTeaser({ className = 'pb-24 lg:pb-36' }: { className?: string }) {
  return (
    <section aria-label="Partnerprogramm" className={className}>
      <div className="container-site">
        <Link to="/partner" className="group grid-site gap-y-3 border-y border-line py-7">
          <span className="t-label col-span-12 lg:col-span-3 lg:pt-1">Partnerprogramm</span>
          <span className="col-span-12 lg:col-span-7">
            <span className="block text-[1.25rem] font-medium tracking-[-0.015em]">Sie führen eine Reinigungsfirma oder möchten eine gründen?</span>
            <span className="mt-1 block text-ink-2">Mit dem CleanStar-Partnerprogramm bringen wir unsere Abläufe in weitere Regionen.</span>
          </span>
          <span className="col-span-12 inline-flex items-center gap-2 self-center font-medium lg:col-span-2 lg:justify-self-end">
            Partner werden
            <ArrowRight aria-hidden className="size-4 transition-transform duration-500 ease-cs group-hover:translate-x-1" strokeWidth={1.75} />
          </span>
        </Link>
      </div>
    </section>
  )
}
