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
