import { useEffect, useId, useRef } from 'react'
import { prefersReducedMotion } from '@/lib/env'

/** A scroll-shaped water ribbon. Only SVG paths change; the chapters stay in normal flow. */
export function SectionSeam({ end = false }: { end?: boolean }) {
  const ref = useRef<SVGSVGElement>(null)
  const gradient = `water-${useId().replace(/:/g, '')}`
  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return
    const paths = el.querySelectorAll<SVGPathElement>('[data-water-path]')
    const apply = (p: number) => {
      const phase = (p - .5) * Math.PI
      const a = Math.sin(phase) * 22
      const b = Math.cos(phase) * 18
      const d = `M-20 60 C220 ${30+a} 410 ${100-b} 700 60 S1160 ${25-a} 1460 ${60+b}`
      paths.forEach(path => path.setAttribute('d', d))
      el.style.setProperty('--water-flow', String(-p * 500))
      el.dataset.waterProgress = p.toFixed(3)
    }
    let near = false, raf = 0
    const update = () => {
      raf = 0
      const r = el.getBoundingClientRect()
      apply(Math.max(0, Math.min(1, (innerHeight - r.top) / (innerHeight + r.height))))
    }
    const queue = () => { if (near && !raf) raf = requestAnimationFrame(update) }
    const io = new IntersectionObserver(([entry]) => { near = entry.isIntersecting; if (near) queue() }, { rootMargin:'80px' })
    io.observe(el)
    update()
    window.addEventListener('scroll', queue, { passive:true })
    window.addEventListener('resize', queue, { passive:true })
    return () => { io.disconnect(); cancelAnimationFrame(raf); window.removeEventListener('scroll', queue); window.removeEventListener('resize', queue) }
  }, [])
  const d = 'M-20 60 C220 30 410 82 700 60 S1160 25 1460 78'
  return <svg ref={ref} className={`section-seam water-seam${end ? ' is-end' : ''}`} aria-hidden viewBox="0 0 1440 120" preserveAspectRatio="none">
    <defs><linearGradient id={gradient} x1="0" x2="1"><stop stopColor="#d6edf8"/><stop offset=".35" stopColor="#8fc8e9"/><stop offset=".65" stopColor="#cceafa"/><stop offset="1" stopColor="#eaf6fc"/></linearGradient></defs>
    <path data-water-path className="water-bank" d={d}/>
    <path data-water-path className="water-body" stroke={`url(#${gradient})`} d={d}/>
    <path data-water-path className="water-current" d={d}/>
    <path data-water-path className="water-glint" d={d}/>
    <path data-water-path className="water-ripple" d={d}/>
  </svg>
}
