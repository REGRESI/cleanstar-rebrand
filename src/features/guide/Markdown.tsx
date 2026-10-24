import { Fragment, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
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
    if (m[1])
      out.push(
        <strong key={i++} className="font-medium text-ink">
          {m[1]}
        </strong>,
      )
    else {
      const href = m[3]
      const cls = 'link'
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
            <h2 key={bi} id={slugify(t)} className="t-h3 mt-16 scroll-mt-28 text-ink">
              {noOrphan(t, 20)}
            </h2>
          )
        }
        if (b.startsWith('### ')) {
          return (
            <h3 key={bi} className="t-h4 mt-10 text-ink">
              {noOrphan(b.slice(4).trim(), 24)}
            </h3>
          )
        }
        if (lines.every((l) => l.startsWith('- '))) {
          return (
            <ul key={bi} className="mt-5 space-y-2.5">
              {lines.map((l, i) => (
                <li key={i} className="flex gap-3">
                  <span aria-hidden className="mt-[0.7em] size-1 shrink-0 bg-ink" />
                  <span className="min-w-0">{inline(l.slice(2))}</span>
                </li>
              ))}
            </ul>
          )
        }
        if (lines.every((l) => /^\d+\. /.test(l))) {
          return (
            <ol key={bi} className="mt-5 border-t border-line">
              {lines.map((l, i) => (
                <li key={i} className="flex gap-4 border-b border-line py-3">
                  <span aria-hidden className="w-6 shrink-0 pt-1 font-medium tabular-nums text-[0.75rem] text-muted tabular-nums">
                    {i + 1}
                  </span>
                  <span className="min-w-0">{inline(l.replace(/^\d+\. /, ''))}</span>
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
              <div className="mt-8 hidden overflow-x-auto border-y border-line sm:block" tabIndex={0} role="region" aria-label={head.filter(Boolean).join(', ')}>
                <table className="w-full text-left text-[0.9375rem]">
                  <thead className="border-b border-line">
                    <tr>
                      {head.map((c, i) => (
                        <th key={i} scope="col" className="py-3 pr-4 tabular-nums text-[0.75rem] font-normal text-muted">
                          {inline(c)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {body.map((r, ri) => (
                      <tr key={ri}>
                        {r.map((c, ci) => (
                          <td key={ci} className={cn('py-3 pr-4 align-top', ci > 0 && numeric(c) && 'whitespace-nowrap tabular-nums')}>
                            {inline(c)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Unter 640 px: jede Zeile als Karte, Beschriftung links, Wert rechts */}
              <ul className="mt-6 border-t border-line sm:hidden">
                {body.map((r, ri) => (
                  <li key={ri} className="border-b border-line py-4">
                    <p className="font-medium text-ink">{inline(r[0])}</p>
                    <dl className="mt-2 divide-y divide-line text-[0.9375rem]">
                      {r.slice(1).map((c, ci) =>
                        c ? (
                          <div key={ci} className="flex items-baseline justify-between gap-4 py-2">
                            <dt className="font-medium tabular-nums text-[0.75rem] text-muted">{inline(head[ci + 1] || '')}</dt>
                            <dd className={cn('text-right text-ink', numeric(c) && 'whitespace-nowrap tabular-nums')}>{inline(c)}</dd>
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
            <aside key={bi} className="mt-8 border-y border-line py-5">
              <p className="t-label">Hinweis</p>
              <p className="mt-2 text-[1.1875rem] leading-[1.5] tracking-[-0.01em]">{inline(lines.map((l) => l.replace(/^>\s?/, '')).join(' '))}</p>
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
