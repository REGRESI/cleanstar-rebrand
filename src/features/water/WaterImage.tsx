import { useEffect, useRef, useState, type ReactNode } from 'react'
import { images, type ImageId } from '@/content/images'
import { cn } from '@/lib/cn'
import type { Water } from './water'

/**
 * Leistungsfoto mit dezentem Wasser-Effekt beim Überfahren (nur Desktop, siehe water.ts).
 * Das Foto selbst bleibt ein normales Bild; WebGL lädt erst beim ersten Überfahren und liegt nur während der Spur darüber.
 * Ohne WebGL oder mit reduzierter Bewegung bleibt es beim normalen Bild.
 */
export function WaterImage({ id, children, className }: { id: ImageId; children: ReactNode; className?: string }) {
  const host = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const water = useRef<Water | null | false>(null)
  const [active, setActive] = useState(false)

  useEffect(() => () => void (water.current && water.current.destroy()), [])

  const onMove = async (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse' || water.current === false) return
    const r = host.current!.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width
    const y = (e.clientY - r.top) / r.height
    if (!water.current) {
      const { waterSupported, createWater } = await import('./water')
      const img = host.current?.querySelector('img')
      if (!waterSupported() || !img || !img.complete || !img.naturalWidth || !canvas.current) return void (water.current = false)
      // gleicher Bildausschnitt wie das Foto (object-position)
      const pos = (images[id].position ?? '50% 50%').split(' ').map((v) => parseFloat(v) / 100) as [number, number]
      water.current = createWater(canvas.current, img, pos, setActive) ?? false
      if (!water.current) return
    }
    water.current.move(x, y)
  }

  return (
    <div ref={host} className={cn('relative', className)} onPointerMove={onMove}>
      {children}
      <canvas ref={canvas} aria-hidden className={cn('photo pointer-events-none absolute inset-0 size-full transition-opacity duration-300', active ? 'opacity-100' : 'opacity-0')} />
    </div>
  )
}
