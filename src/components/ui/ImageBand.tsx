import { useEffect, useRef } from 'react'
import { Picture } from './Picture'
import type { ImageId } from '@/content/images'
import { gsap } from '@/lib/gsap'
import { prefersReducedMotion } from '@/lib/env'
import { cn } from '@/lib/cn'

/**
 * Randloses Bildband über die volle Breite (21:9, auf dem Handy 4:3) als ruhiger Taktwechsel zwischen Textabschnitten.
 * Das Foto bewegt sich beim Scrollen sehr dezent gegen die Seite (Parallax ±4 %), bei reduzierter Bewegung steht es.
 */
export function ImageBand({ id, caption, className }: { id: ImageId; caption?: string; className?: string }) {
  const frame = useRef<HTMLDivElement>(null)
  const inner = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (prefersReducedMotion() || !frame.current || !inner.current) return
    const ctx = gsap.context(() => {
      gsap.fromTo(inner.current, { yPercent: -4 }, { yPercent: 4, ease: 'none', scrollTrigger: { trigger: frame.current, start: 'top bottom', end: 'bottom top', scrub: true } })
    })
    return () => ctx.revert()
  }, [])

  return (
    <figure className={cn('relative', className)}>
      <div ref={frame} className="relative aspect-[4/3] overflow-hidden bg-surface sm:aspect-[21/9]">
        <div ref={inner} className="absolute inset-x-0 -top-[5%] h-[110%] will-change-transform">
          <Picture id={id} aspect="size-full" sizes="100vw" />
        </div>
      </div>
      {caption && (
        <figcaption className="container-site">
          <span className="caption block">{caption}</span>
        </figcaption>
      )}
    </figure>
  )
}
