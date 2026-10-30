import { useState, type ElementType } from 'react'
import { AnimatedText } from './AnimatedText'
import { company } from '@/content/company'
import { images, type ImageId } from '@/content/images'
import { cn } from '@/lib/cn'

/**
 * Überschrift mit rundem Gründer-Porträt am Ende (Referenz: learnwithzero): Nach der Farbwelle erscheint das Porträt
 * mit einem kurzen Ring-Puls in Markenblau. Liegt später eine Sprachnachricht vor, wird das Porträt zum Abspielknopf;
 * bis dahin ist es nur ein Bild.
 */
export function PortraitHeadline({
  text,
  as = 'h2',
  id,
  className,
  founder = company.newClientContact,
}: {
  text: string
  as?: ElementType
  id?: string
  className?: string
  /** Index in company.founders */
  founder?: number
}) {
  const [on, setOn] = useState(false)
  const f = company.founders[founder] ?? company.founders[0]
  const img = images[f.image as ImageId]
  return (
    <AnimatedText as={as} id={id} text={text} className={className} onDone={() => setOn(true)}>
      {' '}
      <span className={cn('pp', on && 'is-on')}>
        <img src={`/images/${img.file}-640.webp`} alt="" width={96} height={96} loading="lazy" decoding="async" />
      </span>
    </AnimatedText>
  )
}
