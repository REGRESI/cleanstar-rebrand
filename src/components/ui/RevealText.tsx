import { createElement, Fragment, type ElementType } from 'react'
import { cn } from '@/lib/cn'

/**
 * Überschrift mit Wort-für-Wort-Reveal.
 * Die Animation startet beim Scrollen (siehe useScrollReveals) oder sofort (`immediate`, per CSS).
 * Bei reduzierter Bewegung wird der Text statisch angezeigt.
 */
export function RevealText({ as = 'h2', text, className, immediate, id }: { as?: ElementType; text: string; className?: string; immediate?: boolean; id?: string }) {
  const words = text.split(' ')
  return createElement(
    as,
    { className: cn(immediate && 'reveal-now', className), 'data-reveal-text': immediate ? undefined : '', id },
    words.map((w, i) => (
      <Fragment key={i}>
        <span className="inline-block overflow-hidden pb-[0.08em] align-bottom" style={{ marginBottom: '-0.08em' }}>
          <span data-reveal-word="" style={{ ['--i' as string]: i }}>
            {w}
          </span>
        </span>
        {i < words.length - 1 ? ' ' : null}
      </Fragment>
    )),
  )
}
