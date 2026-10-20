import type { ReactNode } from 'react'
import { RevealText } from './RevealText'
import { cn } from '@/lib/cn'

export function SectionHeading({
  eyebrow,
  title,
  text,
  className,
  align = 'left',
  as = 'h2',
  id,
}: {
  eyebrow?: string
  title: string
  text?: ReactNode
  className?: string
  align?: 'left' | 'center'
  as?: 'h1' | 'h2'
  id?: string
}) {
  return (
    <div className={cn('max-w-3xl', align === 'center' && 'mx-auto text-center', className)}>
      {eyebrow && (
        <p className="eyebrow mb-4" data-reveal>
          <span aria-hidden className="h-px w-6 bg-current" />
          {eyebrow}
        </p>
      )}
      <RevealText as={as} text={title} className={as === 'h1' ? 'heading-1' : 'heading-2'} id={id} />
      {text && (
        <div className="lead mt-5" data-reveal>
          {text}
        </div>
      )}
    </div>
  )
}
