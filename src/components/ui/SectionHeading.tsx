import type { ReactNode } from 'react'
import { RevealText } from './RevealText'
import { cn } from '@/lib/cn'

/**
 * Abschnittsüberschrift im Raster.
 * stack: Label, Überschrift und Text untereinander (für Spalten innerhalb eines Rasters)
 * rail:  Label links in Spalte 1 bis 3, Überschrift ab Spalte 4, Text darunter versetzt
 * split: Überschrift über 7 Spalten, Text versetzt in Spalte 9 bis 12, unten bündig
 * Das Label steht klein in Versalien, ohne Nummer.
 */
export function SectionHeading({
  eyebrow,
  title,
  text,
  className,
  align = 'left',
  as = 'h2',
  id,
  layout = 'stack',
  size = 'h2',
  rule,
}: {
  eyebrow?: string
  title: string
  text?: ReactNode
  className?: string
  align?: 'left' | 'center'
  as?: 'h1' | 'h2' | 'h3'
  id?: string
  layout?: 'stack' | 'rail' | 'split'
  size?: 'h1' | 'h2' | 'h3'
  /** Haarlinie über dem Abschnitt (Standard bei rail und split) */
  rule?: boolean
}) {
  // Abschnittslabels ohne Nummer
  const label = eyebrow
  const titleCls = size === 'h1' ? 't-h1' : size === 'h3' ? 't-h3' : 't-h2'
  const withRule = rule ?? layout !== 'stack'
  const ruleEl = withRule ? <span aria-hidden data-reveal-rule className="rule col-span-12 mb-6 lg:mb-8" /> : null

  if (layout === 'rail') {
    return (
      <div className={cn('grid-site gap-y-5', className)}>
        {ruleEl}
        {label && (
          <p className="t-label col-span-12 lg:col-span-3 lg:pt-3" data-reveal>
            {label}
          </p>
        )}
        <div className={cn('col-span-12', label ? 'lg:col-span-9' : 'lg:col-span-10')}>
          <RevealText as={as} text={title} className={cn(titleCls, 'max-w-[22ch]')} id={id} />
          {text && (
            <div className="t-lead measure mt-6 lg:mt-8" data-reveal>
              {text}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (layout === 'split') {
    return (
      <div className={cn('grid-site gap-y-6 lg:items-end', className)}>
        {ruleEl}
        <div className="col-span-12 lg:col-span-7">
          {label && (
            <p className="t-label mb-6" data-reveal>
              {label}
            </p>
          )}
          <RevealText as={as} text={title} className={titleCls} id={id} />
        </div>
        {text && (
          <div className="t-lead col-span-12 lg:col-span-4 lg:col-start-9" data-reveal>
            {text}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={cn('max-w-4xl', align === 'center' && 'mx-auto text-center', className)}>
      {withRule && <span aria-hidden data-reveal-rule className="rule mb-6" />}
      {label && (
        <p className="t-label mb-6" data-reveal>
          {label}
        </p>
      )}
      <RevealText as={as} text={title} className={titleCls} id={id} />
      {text && (
        <div className={cn('t-lead measure mt-6', align === 'center' && 'mx-auto')} data-reveal>
          {text}
        </div>
      )}
    </div>
  )
}
