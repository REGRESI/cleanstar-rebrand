import { useEffect, useState } from 'react'
import { useLocation, useRouteError } from 'react-router-dom'
import { Logo } from '@/components/ui/Logo'
import { company } from '@/content/company'

/**
 * Fehlerseite statt der Standardmeldung von React Router. Typischer Fall: Eine Seite war noch offen, als eine neue
 * Version veröffentlicht wurde; beim nächsten internen Klick fehlen dann Code- oder Datendateien der alten Version.
 * Dann einmalig die Zieladresse vollständig neu laden (lädt die neue Version). Schutz gegen Endlosschleifen: höchstens
 * ein Neuladen je Adresse innerhalb von 30 Sekunden. Besucher sehen nie technische Details.
 */
const LOAD_ERROR = /dynamically imported module|Importing a module script failed|error loading dynamically|Failed to fetch|NetworkError|Load failed|did not match the expected pattern|Unexpected token|is not valid JSON|JSON\.parse|ChunkLoadError|MIME type/i

export function isLoadError(error: unknown) {
  const msg = error instanceof Error ? `${error.name} ${error.message}` : String((error as { statusText?: string })?.statusText ?? error ?? '')
  return LOAD_ERROR.test(msg)
}

/** true, wenn für diese Adresse gerade neu geladen wird (dann nichts anzeigen) */
function reloadOnce(href: string) {
  try {
    const key = 'cs-reload:' + href
    const last = Number(sessionStorage.getItem(key) || 0)
    if (Date.now() - last < 30000) return false
    sessionStorage.setItem(key, String(Date.now()))
  } catch {
    // ohne sessionStorage kein Schutz möglich: lieber die Fehlerseite zeigen
    return false
  }
  window.location.assign(href)
  return true
}

export function RouteError() {
  const error = useRouteError()
  const location = useLocation()
  const [reloading, setReloading] = useState(false)

  useEffect(() => {
    if (isLoadError(error) && reloadOnce(location.pathname + location.search + location.hash)) setReloading(true)
    else if (import.meta.env.DEV) console.error(error)
  }, [error, location])

  if (reloading) return null
  return (
    <main id="main" className="flex min-h-svh flex-col bg-paper text-ink">
      <div className="container-site pt-8">
        <a href="/" aria-label="CleanStar, zur Startseite" className="inline-block">
          <Logo className="w-[124px] lg:w-[142px]" />
        </a>
      </div>
      <section className="container-site flex flex-1 flex-col justify-center py-20">
        <p className="t-label">Kurz unterbrochen</p>
        <h1 className="t-h2 mt-5 max-w-[20ch]">Diese Seite konnte gerade nicht geladen werden.</h1>
        <p className="t-lead mt-6 max-w-[40ch] text-ink-2">Meist hilft es, die Seite neu zu laden. Sie erreichen uns auch direkt per Telefon.</p>
        <div className="mt-10 flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-8">
          <button type="button" className="btn btn-primary btn-lg" onClick={() => window.location.reload()}>
            Seite neu laden
          </button>
          <a href="/" className="tlink">
            Zur Startseite
          </a>
          <a href={company.phone.href} className="tlink">
            {company.phone.display}
          </a>
        </div>
      </section>
    </main>
  )
}
