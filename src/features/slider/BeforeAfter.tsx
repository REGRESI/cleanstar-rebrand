import { useCallback, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { MoveHorizontal } from 'lucide-react'
import { Picture } from '@/components/ui/Picture'
import type { ImageId } from '@/content/images'
import { cn } from '@/lib/cn'

/**
 * Vorher/Nachher-Vergleich. Ziehen mit Maus oder Finger,
 * Bedienung per Tastatur (Pfeiltasten, Pos1, Ende).
 */
export function BeforeAfter({ before, after, className, label = 'Vorher-Nachher-Vergleich' }: { before: ImageId; after: ImageId; className?: string; label?: string }) {
  const [pos, setPos] = useState(50)
  const box = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const fromPointer = useCallback((clientX: number) => {
    const r = box.current?.getBoundingClientRect()
    if (!r) return
    setPos(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)))
  }, [])

  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    dragging.current = true
    e.currentTarget.setPointerCapture(e.pointerId)
    fromPointer(e.clientX)
  }
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (dragging.current) fromPointer(e.clientX)
  }
  const onUp = () => {
    dragging.current = false
  }
  const onKey = (e: KeyboardEvent) => {
    const step = e.shiftKey ? 10 : 2
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') setPos((p) => Math.max(0, p - step))
    else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') setPos((p) => Math.min(100, p + step))
    else if (e.key === 'Home') setPos(0)
    else if (e.key === 'End') setPos(100)
    else return
    e.preventDefault()
  }

  return (
    <figure className={cn('relative', className)}>
      <div
        ref={box}
        className="relative cursor-ew-resize touch-pan-y overflow-hidden select-none"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        <Picture id={after} ratio="16:9" />
        <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
          <Picture id={before} ratio="16:9" className="h-full" />
        </div>
        <span className="pointer-events-none absolute top-0 left-0 bg-night px-3 py-1.5 font-mono text-[0.75rem] text-paper">Vorher</span>
        <span className="pointer-events-none absolute top-0 right-0 bg-paper px-3 py-1.5 font-mono text-[0.75rem] text-ink">Nachher</span>
        <div aria-hidden className="pointer-events-none absolute inset-y-0 w-px -translate-x-1/2 bg-paper" style={{ left: `${pos}%` }} />
        <div
          role="slider"
          tabIndex={0}
          aria-label={label}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pos)}
          aria-valuetext={`${Math.round(pos)} % Vorher sichtbar`}
          onKeyDown={onKey}
          className="absolute top-1/2 grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center bg-paper text-ink"
          style={{ left: `${pos}%` }}
        >
          <MoveHorizontal aria-hidden className="size-5" strokeWidth={1.5} />
        </div>
      </div>
      <figcaption className="caption">Ziehen Sie den Regler oder nutzen Sie die Pfeiltasten.</figcaption>
    </figure>
  )
}
