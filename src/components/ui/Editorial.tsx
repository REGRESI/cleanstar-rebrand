import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export interface Row {
  title: ReactNode
  text?: ReactNode
  /** Zusatz rechts oder unter dem Titel in Monospace (z. B. Dauer, Fahrzeit) */
  meta?: ReactNode
  key?: string
}

/**
 * Editoriale Liste: Nummer in Monospace, Titel, Text, getrennt durch Haarlinien (statt Karten).
 * row:   volle Breite im 12er-Raster, Titel links, Text versetzt rechts
 * stack: für schmale Spalten, Titel und Text untereinander
 */
export function NumberedRows({
  items,
  layout = 'row',
  size = 'md',
  numbered = true,
  start = 1,
  total,
  dark,
  as: List = 'ol',
  className,
  titleAs: Title = 'h3',
}: {
  items: Row[]
  layout?: 'row' | 'stack'
  size?: 'md' | 'lg'
  numbered?: boolean
  start?: number
  /** Gesamtzahl für „03 / 08“ (Fortschritt in Monospace) */
  total?: number
  dark?: boolean
  as?: 'ol' | 'ul'
  className?: string
  titleAs?: 'h2' | 'h3' | 'h4' | 'p'
}) {
  const num = (i: number) => {
    const n = String(i + start).padStart(2, '0')
    return total ? `${n} / ${String(total).padStart(2, '0')}` : n
  }
  const titleCls = size === 'lg' ? 't-h3' : 'text-[1.375rem] leading-[1.2] font-medium tracking-[-0.02em] sm:text-[1.5rem]'
  return (
    <List className={cn('border-b', dark ? 'border-line-dark' : 'border-line', className)}>
      {items.map((it, i) => (
        <li key={it.key ?? i} className="relative">
          <span aria-hidden data-reveal-rule className={cn('rule absolute inset-x-0 top-0', dark && 'bg-line-dark')} />
          {layout === 'row' ? (
            <div className="grid-site gap-y-3 py-7 sm:py-9 lg:py-10" data-reveal>
              {numbered && <p className={cn('t-label col-span-12 lg:pt-1.5', total ? 'lg:col-span-2' : 'lg:col-span-1')}>{num(i)}</p>}
              <div className={cn('col-span-12', numbered ? (total ? 'lg:col-span-4' : 'lg:col-span-5') : 'lg:col-span-6')}>
                <Title className={titleCls}>{it.title}</Title>
                {it.meta && <p className="t-label mt-3">{it.meta}</p>}
              </div>
              {it.text && <div className={cn('col-span-12 measure lg:col-span-5 lg:col-start-8', dark ? 'text-muted-dark' : 'text-ink-2')}>{it.text}</div>}
            </div>
          ) : (
            <div className={cn('grid gap-x-5 py-6 sm:py-7', !numbered ? 'grid-cols-1' : total ? 'grid-cols-[4.5rem_1fr]' : 'grid-cols-[2.75rem_1fr]')} data-reveal>
              {numbered && <p className="t-label pt-1">{num(i)}</p>}
              <div className="min-w-0">
                <Title className={titleCls}>{it.title}</Title>
                {it.meta && <p className="t-label mt-2">{it.meta}</p>}
                {it.text && <div className={cn('mt-3 measure', dark ? 'text-muted-dark' : 'text-ink-2')}>{it.text}</div>}
              </div>
            </div>
          )}
        </li>
      ))}
    </List>
  )
}

/** Kennzahl: große Zahl in der Display-Schrift, darunter ein Label in Monospace. Ohne Kasten. */
export function Stat({ value, label, className }: { value: ReactNode; label: ReactNode; className?: string }) {
  return (
    <div className={cn('border-t border-line pt-6', className)}>
      <p className="t-num">{value}</p>
      <p className="t-label mt-4 max-w-[22ch]">{label}</p>
    </div>
  )
}

/**
 * Merkmale in Spalten (z. B. die 4 Punkte einer Leistung, Werte, Vorteile): Haarlinie oben, Nummer, Titel, Text.
 * Einheitlich auf allen Seiten: Handy 1 Spalte, ab 640 px 2, ab 1024 px so viele wie Punkte (höchstens 4).
 */
export function FeatureColumns({
  items,
  dark,
  className,
  titleAs: Title = 'h3',
}: {
  items: { title: ReactNode; text: ReactNode }[]
  dark?: boolean
  className?: string
  titleAs?: 'h2' | 'h3'
}) {
  const cols = items.length >= 4 ? 'lg:grid-cols-4' : items.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'
  return (
    <ul className={cn('grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:gap-x-8', cols, className)}>
      {items.map((it, i) => (
        <li key={i} className="relative pt-6" data-reveal>
          <span aria-hidden data-reveal-rule className={cn('rule absolute inset-x-0 top-0', dark && 'bg-line-dark')} />
          <p className="t-label">{String(i + 1).padStart(2, '0')}</p>
          <Title className="mt-6 text-[1.375rem] leading-[1.2] font-medium tracking-[-0.02em]">{it.title}</Title>
          <p className={cn('mt-3', dark ? 'text-muted-dark' : 'text-ink-2')}>{it.text}</p>
        </li>
      ))}
    </ul>
  )
}

/** Linkliste als Zeilen mit Haarlinien und Pfeil (statt Kacheln oder Pillen) */
export function LinkRows({
  items,
  numbered,
  className,
  columns = 1,
}: {
  items: { to: string; label: ReactNode; meta?: ReactNode }[]
  numbered?: boolean
  className?: string
  /** Ab Tablet in zwei Spalten */
  columns?: 1 | 2
}) {
  return (
    <ul className={cn(columns === 2 && 'grid gap-x-8 sm:grid-cols-2', className)}>
      {items.map((it, i) => (
        <li key={it.to} className={cn('border-b border-line first:border-t', columns === 2 && 'sm:[&:nth-child(2)]:border-t')}>
          <Link to={it.to} className="group flex items-baseline gap-4 py-4 text-ink">
            {numbered && <span className="t-label w-7 shrink-0">{String(i + 1).padStart(2, '0')}</span>}
            <span className="min-w-0 flex-1">
              <span className="ulink">{it.label}</span>
              {it.meta && <span className="t-label ml-3">{it.meta}</span>}
            </span>
            <ArrowUpRight
              aria-hidden
              className="size-4 shrink-0 self-center transition-transform duration-500 ease-cs group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              strokeWidth={1.5}
            />
          </Link>
        </li>
      ))}
    </ul>
  )
}

/** Fließende Textlinks, getrennt durch Abstand (statt Pillen-Chips) */
export function InlineLinks({ items, className }: { items: { to: string; label: ReactNode }[]; className?: string }) {
  return (
    <ul className={cn('flex flex-wrap gap-x-7 gap-y-3', className)}>
      {items.map((it) => (
        <li key={it.to}>
          <Link to={it.to} className="ulink py-0.5 text-ink">
            {it.label}
          </Link>
        </li>
      ))}
    </ul>
  )
}
