import { useEffect, useRef } from 'react'
import { Picture } from './Picture'
import type { ImageId } from '@/content/images'
import { gsap } from '@/lib/gsap'
import { prefersReducedMotion } from '@/lib/env'
import { cn } from '@/lib/cn'

/**
 * Gründerporträt, das „sauber wird“: Es deckt sich von unten auf und startet in Schwarzweiß; beim Hineinscrollen
 * färbt es sich ein (eine Schwarzweiß-Kopie darüber blendet aus, nur opacity). order verschiebt den Zeitpunkt, damit
 * sich mehrere Porträts nacheinander färben. Beim Überfahren hebt sich das Foto minimal.
 * Ohne Bewegung: sofort in Farbe.
 */
export function FounderPortrait({ id, order = 0, sizes, className }: { id: ImageId; order?: number; sizes: string; className?: string }) {
  const box = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = box.current
    if (!el || prefersReducedMotion() || !document.documentElement.classList.contains('js-motion')) return
    const gray = el.querySelector('[data-gray]')
    const ctx = gsap.context(() => {
      gsap.fromTo(gray, { opacity: 1 }, { opacity: 0, ease: 'none', scrollTrigger: { trigger: el, start: `top ${82 - order * 8}%`, end: `top ${44 - order * 8}%`, scrub: 0.5 } })
    }, el)
    return () => ctx.revert()
  }, [order])
  return (
    <div ref={box} className={cn('group relative transition-transform duration-500 ease-cs hover:-translate-y-1', className)}>
      <Picture id={id} ratio="4:5" reveal sizes={sizes} />
      <div data-gray aria-hidden className="founder-gray pointer-events-none absolute inset-0">
        <Picture id={id} ratio="4:5" sizes={sizes} className="grayscale" />
      </div>
    </div>
  )
}
