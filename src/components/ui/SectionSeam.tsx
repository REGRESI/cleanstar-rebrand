import { useEffect, useRef } from 'react'
import { replay } from '@/lib/replay'
import { prefersReducedMotion } from '@/lib/env'

/** A fixed-size drawn seam connects chapters without translating either section. */
export function SectionSeam({ end = false }: { end?: boolean }) {
  const ref = useRef<SVGSVGElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return
    return replay(el, () => el.setAttribute('data-drawn',''), () => el.removeAttribute('data-drawn'))
  }, [])
  return <svg ref={ref} className={`section-seam${end ? ' is-end' : ''}`} aria-hidden viewBox="0 0 1440 100" preserveAspectRatio="none">
    <path className="seam-wash" d="M0 55C360 115 820 -35 1440 42V100H0Z" />
    <path className="seam-trace" pathLength="1" d="M0 55C360 115 820 -35 1440 42" />
  </svg>
}
