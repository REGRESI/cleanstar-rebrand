import { Link } from 'react-router-dom'
import { home } from '@/content/site'

/** Werkzeuge und Ratgeber auf der Startseite: eine schlichte Zeile mit Links, kein eigener großer Abschnitt. */
export function ToolsLine() {
  return (
    <nav aria-label={home.tools.label} className="container-site pb-24 lg:pb-32">
      <div className="grid-site gap-y-4 border-y border-line py-6">
        <p className="t-label col-span-12 lg:col-span-3 lg:pt-0.5">{home.tools.label}</p>
        <ul className="col-span-12 flex flex-wrap gap-x-7 gap-y-2 lg:col-span-9">
          {home.tools.links.map((l) => (
            <li key={l.to}>
              <Link to={l.to} className="ulink py-0.5 text-[0.9375rem] text-ink">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
