import { Picture } from '@/components/ui/Picture'
import { company } from '@/content/company'
import type { ImageId } from '@/content/images'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/cn'

/**
 * Autorenzeile für Ratgeber und Werkzeuge: Foto, Name, Rolle, Kurzbio, Veröffentlichung und letzte Aktualisierung.
 * Sichtbar für Leser und als Beleg für Suchmaschinen (passend zu author, datePublished und dateModified im Schema).
 */
export function AuthorBox({ author, published, modified, label = 'Verfasst von', className }: { author: number; published: string; modified: string; label?: string; className?: string }) {
  const f = company.founders[author] ?? company.founders[0]
  const bio = f.bio.split('. ')[0].replace(/\.$/, '') + '.'
  return (
    <aside aria-label={label} className={cn('grid grid-cols-[4rem_1fr] gap-x-5 gap-y-1 border-t border-line pt-6 sm:grid-cols-[5rem_1fr]', className)}>
      <Picture id={f.image as ImageId} compact ratio="4:5" className="row-span-3 w-16 sm:w-20" sizes="80px" />
      <p className="t-label">{label}</p>
      <p className="text-ink">
        <a href="/ueber-uns/" className="ulink font-medium">
          {f.name}
        </a>
        <span className="text-ink-2">, {f.role.replace('Gründer · ', 'Gründer, ')}</span>
      </p>
      <div className="text-[0.9375rem] text-ink-2">
        <p className="max-w-[60ch]">{bio}</p>
        <p className="t-meta mt-3">
          Veröffentlicht am <time dateTime={published}>{formatDate(published)}</time> · Zuletzt aktualisiert am <time dateTime={modified}>{formatDate(modified)}</time>
        </p>
      </div>
    </aside>
  )
}
