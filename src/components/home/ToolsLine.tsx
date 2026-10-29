import { Link } from 'react-router-dom'
import { home } from '@/content/site'

/** Werkzeuge und Ratgeber auf der Startseite: eine schlichte, gut lesbare Zeile mit Links in normaler Textgröße. */
export function ToolsLine() {
  return (
    <nav aria-label={home.tools.label} className="container-site section-tight">
      <div className="grid-site gap-y-4 border-y border-line py-6">
        <h2 className="col-span-12 text-[1.0625rem] font-medium text-ink lg:col-span-3">{home.tools.label}</h2>
        <ul className="col-span-12 flex flex-wrap gap-x-7 gap-y-2 lg:col-span-9">
          {home.tools.links.map((l) => (
            <li key={l.to}>
              <Link to={l.to} className="text-[1.0625rem] text-ink underline decoration-line-strong decoration-1 underline-offset-[0.28em] transition-colors hover:decoration-ink">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
