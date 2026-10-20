import { useRef, type ReactNode, type PointerEvent } from 'react'
import { motion, useMotionTemplate, useMotionValue, useSpring } from 'framer-motion'
import { useFinePointer, useReducedMotion } from '@/lib/env'
import { cn } from '@/lib/cn'

/** Karte mit dezentem 3D-Tilt und Lichtreflex (nur Maus, nicht bei reduzierter Bewegung). */
export function TiltCard({ children, className, max = 7 }: { children: ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const fine = useFinePointer()
  const reduced = useReducedMotion()
  const active = fine && !reduced
  const rx = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 })
  const ry = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 })
  const gx = useMotionValue(50)
  const gy = useMotionValue(50)
  const glare = useMotionTemplate`radial-gradient(600px circle at ${gx}% ${gy}%, rgb(255 255 255 / 0.55), transparent 40%)`

  const onMove = (e: PointerEvent) => {
    if (!active || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width
    const py = (e.clientY - r.top) / r.height
    ry.set((px - 0.5) * max * 2)
    rx.set(-(py - 0.5) * max * 2)
    gx.set(px * 100)
    gy.set(py * 100)
  }
  const onLeave = () => {
    rx.set(0)
    ry.set(0)
  }

  return (
    <div style={{ perspective: 1000 }} className="h-full">
      <motion.div
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        whileTap={reduced ? undefined : { scale: 0.985 }}
        style={active ? { rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d' } : undefined}
        className={cn('relative h-full', className)}
      >
        {children}
        {active && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{ background: glare }}
          />
        )}
      </motion.div>
    </div>
  )
}
