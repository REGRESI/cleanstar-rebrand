import { useEffect, useRef, type ReactNode } from 'react'
import { Picture } from './Picture'
import type { ImageId } from '@/content/images'
import { gsap } from '@/lib/gsap'
import { liteMotion, isSmallScreen } from '@/lib/motionBudget'
import { cn } from '@/lib/cn'

/**
 * Collage aus drei Fotos auf drei Tiefenebenen: hinten groß, Mitte, vorn klein, leicht versetzt und überlappend.
 * Beim Scrollen bewegen sich die Ebenen unterschiedlich schnell (hinten langsamer, vorn schneller), Drehung höchstens
 * 1,5 Grad. Eine Ebene kann statt eines Fotos einen Video-Loop zeigen. Ohne Bewegung oder im Sparmodus: steht still.
 */
type Layer = { id: ImageId } | { node: ReactNode }

// Lage je Ebene in % der Collage (hinten, Mitte, vorn) und Geschwindigkeit relativ zum Text
const LAYOUT = [
  { cls: 'left-0 top-0 w-[64%] z-0', rot: -1, speed: -0.06 },
  { cls: 'right-0 top-[24%] w-[46%] z-10', rot: 1.2, speed: 0 },
  { cls: 'left-[14%] bottom-0 w-[38%] z-20', rot: -0.6, speed: 0.07 },
]
const RATIOS = ['aspect-[4/3]', 'aspect-[4/5]', 'aspect-[1/1]']

export function Collage({ layers, className }: { layers: [Layer, Layer, Layer]; className?: string }) {
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = root.current
    if (!el || liteMotion()) return
    const scale = isSmallScreen() ? 0.3 : 1
    const ctx = gsap.context(() => {
      el.querySelectorAll<HTMLElement>('[data-layer]').forEach((layer, i) => {
        const d = LAYOUT[i].speed * scale
        if (!d) return
        gsap.fromTo(
          layer,
          { y: () => -d * window.innerHeight },
          { y: () => d * window.innerHeight, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true } },
        )
      })
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={root} className={cn('relative aspect-[6/5]', className)}>
      {layers.map((l, i) => (
        <div key={i} data-layer className={cn('absolute will-change-transform', LAYOUT[i].cls)}>
          <div style={{ rotate: `${LAYOUT[i].rot}deg` }} className="shadow-[0_20px_40px_-24px_rgb(11_15_23/0.4)]">
            {'id' in l ? <Picture id={l.id} aspect={RATIOS[i]} sizes="(min-width:1024px) 22vw, 50vw" /> : <div className={RATIOS[i]}>{l.node}</div>}
          </div>
        </div>
      ))}
    </div>
  )
}
