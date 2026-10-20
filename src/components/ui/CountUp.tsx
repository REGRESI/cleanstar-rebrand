import { useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from '@/lib/env'

/** Zählt beim Sichtbarwerden von 0 auf den Zielwert hoch. Serverseitig steht der Endwert im HTML. */
export function CountUp({
  value,
  suffix = '',
  duration = 1400,
  format = (v: number) => String(Math.round(v)),
}: {
  value: number
  suffix?: string
  duration?: number
  format?: (v: number) => string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const [display, setDisplay] = useState<string>(format(value))
  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return
    setDisplay(format(0))
    let raf = 0
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        io.disconnect()
        const start = performance.now()
        const step = (now: number) => {
          const p = Math.min(1, (now - start) / duration)
          const eased = 1 - Math.pow(1 - p, 4)
          setDisplay(format(value * eased))
          if (p < 1) raf = requestAnimationFrame(step)
        }
        raf = requestAnimationFrame(step)
      },
      { threshold: 0.4 },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration])
  return (
    <span ref={ref} className="tabular-nums">
      {display}
      {suffix}
    </span>
  )
}
