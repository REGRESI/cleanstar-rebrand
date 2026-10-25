import { useEffect, useRef } from 'react'
import { Picture } from './Picture'
import type { ImageId } from '@/content/images'
import { gsap } from '@/lib/gsap'
import { liteMotion, isSmallScreen } from '@/lib/motionBudget'
import { cn } from '@/lib/cn'

/**
 * Bild-Brücke: Ein Foto überspannt die Grenze zwischen zwei Abschnitten, halb im einen, halb im anderen.
 * Es steht zwischen den Abschnitten (Höhe 0, nimmt keinen Platz ein) und bewegt sich beim Scrollen langsamer
 * als der Text (Faktor 0,85; Handy 0,96). Ohne Bewegung oder im Sparmodus steht es still.
 */
export function Bridge({ id, side = 'right' }: { id: ImageId; side?: 'left' | 'right' }) {
  const frame = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = frame.current
    if (!el || liteMotion()) return
    // Weg relativ zum Text: (1 − Faktor) × Bildschirmhöhe, verteilt auf Ein- und Austritt
    const k = isSmallScreen() ? 0.04 : 0.15
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { y: () => (-k / 2) * window.innerHeight },
        { y: () => (k / 2) * window.innerHeight, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true } },
      )
    })
    return () => ctx.revert()
  }, [])

  return (
    <div data-bridge className="relative z-30 h-0">
      <div className="container-site relative">
        {/* Lage inline, damit das Foto auch vor dem Laden des vollständigen CSS nie im Textfluss steht */}
        <div
          className={cn('bridge-photo', side === 'right' ? 'right-5 sm:right-8 lg:right-12 2xl:right-16' : 'left-5 sm:left-8 lg:left-12 2xl:left-16')}
          style={{ position: 'absolute', top: 0, translate: '0 var(--bridge-y, -50%)' }}
        >
          <div ref={frame} className="will-change-transform">
            <Picture id={id} ratio="4:5" sizes="(min-width:1024px) 14rem, 30vw" className="shadow-[0_24px_48px_-24px_rgb(11_15_23/0.45)]" />
          </div>
        </div>
      </div>
    </div>
  )
}
