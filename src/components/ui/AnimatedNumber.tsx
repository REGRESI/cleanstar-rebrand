import { useEffect, useRef } from 'react'
import { animate } from 'framer-motion'
import { prefersReducedMotion } from '@/lib/env'
import { EASE_CS_ARRAY } from '@/lib/ease'

/** Zahl, die weich zum neuen Wert animiert (z. B. Preisspanne). */
export function AnimatedNumber({ value, format }: { value: number; format: (v: number) => string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const prev = useRef(value)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (prefersReducedMotion()) {
      el.textContent = format(value)
      prev.current = value
      return
    }
    const controls = animate(prev.current, value, {
      duration: 0.6,
      ease: EASE_CS_ARRAY,
      onUpdate: (v) => (el.textContent = format(v)),
    })
    prev.current = value
    return () => controls.stop()
  }, [value, format])
  return (
    <span ref={ref} className="tabular-nums">
      {format(value)}
    </span>
  )
}
