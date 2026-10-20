import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/cn'

export function Breadcrumbs({ trail, dark }: { trail: { name: string; path: string }[]; dark?: boolean }) {
  return (
    <nav aria-label="Brotkrumen" className="mb-6 sm:mb-8">
      <ol className={cn('flex flex-wrap items-center gap-1 text-sm', dark ? 'text-muted-dark' : 'text-muted')}>
        {trail.map((t, i) => {
          const last = i === trail.length - 1
          return (
            <li key={t.path} className="flex items-center gap-1">
              {last ? (
                <span aria-current="page" className={dark ? 'text-white' : 'text-ink'}>
                  {t.name}
                </span>
              ) : (
                <Link to={t.path} className={cn('underline-offset-4 hover:underline', dark ? 'hover:text-white' : 'hover:text-ink')}>
                  {t.name}
                </Link>
              )}
              {!last && <ChevronRight aria-hidden className="size-3.5 opacity-60" />}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
