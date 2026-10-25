import { useEffect, useRef, useState } from 'react'
import { liteMotion } from '@/lib/motionBudget'
import { cn } from '@/lib/cn'

/**
 * Kurzer, stummer Video-Loop (public/loops/, erzeugt mit scripts/loops.mjs) anstelle eines Fotos.
 * Im HTML steht zuerst nur das Standbild. Das Video kommt erst im Browser dazu, spielt nur, solange es im Bild ist,
 * und entfällt bei reduzierter Bewegung, Datensparmodus und schwachen Geräten (dann bleibt das Standbild).
 */
const ALT = {
  wischen: 'Mitarbeiterin von CleanStar wischt die Schreibtische in einem Großraumbüro am Abend',
  wagen: 'Reinigungskraft schiebt den Reinigungswagen durch ein Großraumbüro am Abend',
}

export function LoopVideo({ name, alt = ALT[name], className, position = '50% 50%' }: { name: keyof typeof ALT; alt?: string; className?: string; position?: string }) {
  const box = useRef<HTMLDivElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const [on, setOn] = useState(false)

  useEffect(() => {
    if (!liteMotion()) setOn(true)
  }, [])

  useEffect(() => {
    const v = video.current
    if (!on || !v || !box.current) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) v.play().catch(() => {})
        else v.pause()
      },
      { threshold: 0.15 },
    )
    io.observe(box.current)
    return () => io.disconnect()
  }, [on])

  const style = { objectPosition: position }
  return (
    <div ref={box} className={cn('relative overflow-hidden bg-surface', className)}>
      <img src={`/loops/${name}.webp`} alt={alt} width={1280} height={720} loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover" style={style} />
      {on && (
        <video ref={video} muted playsInline loop preload="none" poster={`/loops/${name}.webp`} aria-hidden className="absolute inset-0 size-full object-cover" style={style}>
          <source src={`/loops/${name}.webm`} type="video/webm" />
          <source src={`/loops/${name}.mp4`} type="video/mp4" />
        </video>
      )}
    </div>
  )
}
