import type { ReactNode } from 'react'
import { Picture } from '@/components/ui/Picture'
import { OffsetCards } from '@/components/ui/OffsetCards'
import { PortraitHeadline } from '@/components/ui/PortraitPulse'
import type { ImageId } from '@/content/images'
import { cn } from '@/lib/cn'

const STATEMENT = 'Bei CleanStar sprechen Sie mit den Menschen, die entscheiden.'

/**
 * Gründer, auf Über uns und auf der Startseite gleich: Überschrift mit Farbwelle und rundem Porträt (Ring-Puls),
 * darunter die drei Porträts als versetzte Karten. Ruhig, ohne Stehenbleiben.
 * eyebrow: kleine Zeile über der Überschrift; after: Inhalt darunter (Startseite: Link zu Über uns)
 */
export function FoundersScene({
  founders,
  eyebrow = 'Über uns',
  after,
  className,
}: {
  founders: { name?: string | null; role?: string; image: string }[]
  eyebrow?: string
  after?: ReactNode
  className?: string
}) {
  return (
    <section className={cn('section', className)} aria-labelledby="founders-intro">
      <div className="container-site">
        <p className="t-label">{eyebrow}</p>
        <PortraitHeadline id="founders-intro" text={STATEMENT} className="t-h2 mt-5 max-w-[20ch]" />
        <OffsetCards
          className="mt-14 lg:mt-20"
          items={founders.map((f, i) => ({
            key: String(i),
            node: <Picture id={f.image as ImageId} ratio="4:5" sizes="(min-width:1024px) 26rem, 80vw" />,
            caption: (
              <>
                <span className="block text-[1.125rem] font-medium tracking-[-0.015em] text-ink">{f.name}</span>
                {f.role && <span className="mt-1 block text-[0.9375rem] text-muted">{f.role.replace('Gründer · ', '')}</span>}
              </>
            ),
          }))}
        />
        {after}
      </div>
    </section>
  )
}
