import { useEffect, useRef } from 'react'
import { useFinePointer, useReducedMotion } from '@/lib/env'

/** Dezenter Cursor-Begleiter auf Desktop. Der normale Mauszeiger bleibt sichtbar. */
export function Cursor() {
  const fine = useFinePointer()
  const reduced = useReducedMotion()
  const ring = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!fine || reduced) return
    const el = ring.current
    if (!el) return
    let x = -100,
      y = -100,
      cx = -100,
      cy = -100,
      raf = 0,
      hover = false
    const move = (e: PointerEvent) => {
      x = e.clientX
      y = e.clientY
      const t = e.target as HTMLElement | null
      const h = !!t?.closest('a, button, [role="button"], [data-cursor="link"], input[type="range"], label')
      if (h !== hover) {
        hover = h
        el.dataset.hover = h ? '1' : ''
      }
      el.style.opacity = '1'
    }
    const leave = () => (el.style.opacity = '0')
    const loop = () => {
      cx += (x - cx) * 0.2
      cy += (y - cy) * 0.2
      el.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%)`
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    window.addEventListener('pointermove', move, { passive: true })
    document.addEventListener('pointerleave', leave)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', move)
      document.removeEventListener('pointerleave', leave)
    }
  }, [fine, reduced])

  if (!fine || reduced) return null
  return (
    <div
      ref={ring}
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-[100] size-8 rounded-full border border-blue/50 opacity-0 transition-[width,height,background-color,border-color,opacity] duration-300 ease-out data-[hover=1]:size-14 data-[hover=1]:border-blue/30 data-[hover=1]:bg-blue/10"
    />
  )
}
