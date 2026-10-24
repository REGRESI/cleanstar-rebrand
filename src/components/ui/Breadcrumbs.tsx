import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'

/** Brotkrumen klein, getrennt durch Schrägstriche */
export function Breadcrumbs({ trail, dark }: { trail: { name: string; path: string }[]; dark?: boolean }) {
  return (
    <nav aria-label="Brotkrumen" className="mb-10 sm:mb-14">
      <ol className={cn('flex flex-wrap items-center gap-x-2 gap-y-1 font-medium tabular-nums text-[0.8125rem]', dark ? 'text-muted-dark' : 'text-muted')}>
        {trail.map((t, i) => {
          const last = i === trail.length - 1
          return (
            <li key={t.path} className="flex items-center gap-2">
              {last ? (
                <span aria-current="page" className={dark ? 'text-paper' : 'text-ink'}>
                  {t.name}
                </span>
              ) : (
                <Link to={t.path} className={cn('ulink', dark ? 'hover:text-paper' : 'hover:text-ink')}>
                  {t.name}
                </Link>
              )}
              {!last && <span aria-hidden>/</span>}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
