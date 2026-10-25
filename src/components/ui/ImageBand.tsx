import { useEffect, useRef } from 'react'
import { Picture } from './Picture'
import { LoopVideo } from './LoopVideo'
import type { ImageId } from '@/content/images'
import { gsap } from '@/lib/gsap'
import { liteMotion, isSmallScreen } from '@/lib/motionBudget'
import { cn } from '@/lib/cn'

/**
 * Randloses Bildband über die volle Breite (21:9, auf dem Handy 4:3) als ruhiger Taktwechsel zwischen Textabschnitten.
 * Lebendig, aber ruhig: Das Foto bewegt sich beim Scrollen dezent gegen die Seite (Parallax ±4 %, Handy ±1,5 %) und
 * fährt dabei sehr langsam heran (Ken Burns, Skalierung 1,0 auf 1,06 über die Sichtbarkeitsdauer).
 * Mit loop zeigt es statt des Fotos einen stummen Video-Loop (ohne Kamerafahrt, das Video bewegt sich selbst).
 * Bei reduzierter Bewegung und im Sparmodus steht alles.
 */
export function ImageBand({ id, loop, className }: { id: ImageId; loop?: 'wischen' | 'wagen'; className?: string }) {
  const frame = useRef<HTMLDivElement>(null)
  const inner = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (liteMotion() || !frame.current || !inner.current) return
    const p = isSmallScreen() ? 1.5 : 4
    const ctx = gsap.context(() => {
      gsap.fromTo(
        inner.current,
        { yPercent: -p, scale: 1 },
        { yPercent: p, scale: loop ? 1 : 1.06, ease: 'none', scrollTrigger: { trigger: frame.current, start: 'top bottom', end: 'bottom top', scrub: true } },
      )
    })
    return () => ctx.revert()
  }, [loop])

  return (
    <figure className={cn('relative', className)}>
      <div ref={frame} className="relative aspect-[4/3] overflow-hidden bg-surface sm:aspect-[21/9]">
        <div ref={inner} className="absolute inset-x-0 -top-[5%] h-[110%] will-change-transform">
          {loop ? <LoopVideo name={loop} className="size-full" /> : <Picture id={id} aspect="size-full" sizes="100vw" />}
        </div>
      </div>
    </figure>
  )
}
