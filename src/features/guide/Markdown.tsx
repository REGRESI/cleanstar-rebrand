import { Fragment, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Lightbulb } from 'lucide-react'
import { cn } from '@/lib/cn'
import { noOrphan } from '@/lib/format'

/** Zelle ist ein Zahlenwert (Preis, Stunden, Prozent): nie umbrechen */
const numeric = (c: string) => /^[\d.,\s\u00A0%€+=–-]*(bis|Std\.|h|€|%)?[\d.,\s\u00A0€%]*$/.test(c.replace(/\*\*/g, '')) && /\d/.test(c)

/**
 * Sehr kleiner Markdown-Renderer für Ratgeber-Artikel (ohne externe Bibliothek, läuft beim Vorrendern).
 * Unterstützt: ## und ### Überschriften, Absätze, Listen (- und 1.), Tabellen (| a | b |),
 * Hinweis-Kästen (> Text), **fett** und [Links](/pfad).
 */

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

/** Überschriften der zweiten Ebene für das Inhaltsverzeichnis */
export const headings = (md: string) =>
  md
    .split('\n')
    .filter((l) => l.startsWith('## '))
    .map((l) => ({ id: slugify(l.slice(3)), text: l.slice(3).trim() }))

/** Inline: **fett** und [Text](url) */
function inline(text: string): ReactNode[] {
  const out: ReactNode[] = []
  const re = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)]+)\)/g
  let last = 0
  let m: RegExpExecArray | null
  let i = 0
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index))
    if (m[1]) out.push(<strong key={i++} className="font-semibold text-ink">{m[1]}</strong>)
    else {
      const href = m[3]
      const cls = 'font-medium text-blue-hover underline decoration-blue/30 underline-offset-4 hover:decoration-blue'
      out.push(
        href.startsWith('/') ? (
          <Link key={i++} to={href} className={cls}>
            {m[2]}
          </Link>
        ) : (
          <a key={i++} href={href} target="_blank" rel="noopener noreferrer" className={cls}>
            {m[2]}
          </a>
        ),
      )
    }
    last = m.index + m[0].length
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}

export function Markdown({ source }: { source: string }) {
  const blocks = source.trim().split(/\n\s*\n/)
  return (
    <>
      {blocks.map((raw, bi) => {
        const b = raw.trim()
        const lines = b.split('\n').map((l) => l.trim())
        if (b.startsWith('## ')) {
          const t = b.slice(3).trim()
          return (
            <h2 key={bi} id={slugify(t)} className="mt-14 scroll-mt-28 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              {noOrphan(t)}
            </h2>
          )
        }
        if (b.startsWith('### ')) {
          return (
            <h3 key={bi} className="mt-10 text-xl font-semibold tracking-tight text-ink">
              {noOrphan(b.slice(4).trim())}
            </h3>
          )
        }
        if (lines.every((l) => l.startsWith('- '))) {
          return (
            <ul key={bi} className="mt-5 space-y-2.5 pl-1">
              {lines.map((l, i) => (
                <li key={i} className="flex gap-3">
                  <span aria-hidden className="mt-[0.7em] size-1.5 shrink-0 rounded-full bg-blue" />
                  <span className="min-w-0">{inline(l.slice(2))}</span>
                </li>
              ))}
            </ul>
          )
        }
        if (lines.every((l) => /^\d+\. /.test(l))) {
          return (
            <ol key={bi} className="mt-5 space-y-3">
              {lines.map((l, i) => (
                <li key={i} className="flex gap-3">
                  <span aria-hidden className="grid size-7 shrink-0 place-items-center rounded-full bg-glacier text-sm font-semibold text-blue-hover tabular-nums">
                    {i + 1}
                  </span>
                  <span className="min-w-0 pt-0.5">{inline(l.replace(/^\d+\. /, ''))}</span>
                </li>
              ))}
            </ol>
          )
        }
        if (lines.every((l) => l.startsWith('|'))) {
          const rows = lines.map((l) =>
            l
              .replace(/^\||\|$/g, '')
              .split('|')
              .map((c) => c.trim()),
          )
          const [head, ...body] = rows.filter((r) => !r.every((c) => /^:?-+:?$/.test(c)))
          return (
            <Fragment key={bi}>
              {/* Ab 640 px: Tabelle */}
              <div className="mt-6 hidden overflow-x-auto rounded-2xl ring-1 ring-line sm:block" tabIndex={0} role="region" aria-label={head.filter(Boolean).join(', ')}>
                <table className="w-full text-left text-[0.9375rem]">
                  <thead className="bg-glacier">
                    <tr>
                      {head.map((c, i) => (
                        <th key={i} scope="col" className="px-4 py-3 font-semibold text-ink">
                          {inline(c)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line bg-white">
                    {body.map((r, ri) => (
                      <tr key={ri}>
                        {r.map((c, ci) => (
                          <td key={ci} className={cn('px-4 py-3 align-top', ci > 0 && numeric(c) && 'whitespace-nowrap')}>
                            {inline(c)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Unter 640 px: jede Zeile als Karte, Beschriftung links, Wert rechts */}
              <ul className="mt-6 space-y-3 sm:hidden">
                {body.map((r, ri) => (
                  <li key={ri} className="rounded-2xl bg-white p-4 ring-1 ring-line">
                    <p className="font-semibold text-ink">{inline(r[0])}</p>
                    <dl className="mt-2 divide-y divide-line text-[0.9375rem]">
                      {r.slice(1).map((c, ci) =>
                        c ? (
                          <div key={ci} className="flex items-baseline justify-between gap-4 py-2">
                            <dt className="text-muted">{inline(head[ci + 1] || '')}</dt>
                            <dd className={cn('text-right font-medium text-ink', numeric(c) && 'whitespace-nowrap')}>{inline(c)}</dd>
                          </div>
                        ) : null,
                      )}
                    </dl>
                  </li>
                ))}
              </ul>
            </Fragment>
          )
        }
        if (lines.every((l) => l.startsWith('>'))) {
          return (
            <aside key={bi} className="mt-6 flex gap-3 rounded-2xl bg-blue-soft/40 p-5 ring-1 ring-blue/15">
              <Lightbulb aria-hidden className="mt-0.5 size-5 shrink-0 text-blue-hover" />
              <p>{inline(lines.map((l) => l.replace(/^>\s?/, '')).join(' '))}</p>
            </aside>
          )
        }
        return (
          <p key={bi} className="mt-5">
            {lines.map((l, i) => (
              <Fragment key={i}>
                {i > 0 && ' '}
                {inline(l)}
              </Fragment>
            ))}
          </p>
        )
      })}
    </>
  )
}
