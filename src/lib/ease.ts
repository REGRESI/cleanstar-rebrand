/** Kubische Bézier-Kurve wie in CSS, als Funktion für GSAP (Newton-Verfahren mit Bisektion als Rückfall) */
export function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1
  const bx = 3 * (x2 - x1) - cx
  const ax = 1 - cx - bx
  const cy = 3 * y1
  const by = 3 * (y2 - y1) - cy
  const ay = 1 - cy - by
  const sx = (t: number) => ((ax * t + bx) * t + cx) * t
  const sy = (t: number) => ((ay * t + by) * t + cy) * t
  const dx = (t: number) => (3 * ax * t + 2 * bx) * t + cx
  const solve = (x: number) => {
    let t = x
    for (let i = 0; i < 8; i++) {
      const e = sx(t) - x
      if (Math.abs(e) < 1e-6) return t
      const d = dx(t)
      if (Math.abs(d) < 1e-6) break
      t -= e / d
    }
    let lo = 0
    let hi = 1
    t = x
    while (hi - lo > 1e-6) {
      if (sx(t) < x) lo = t
      else hi = t
      t = (lo + hi) / 2
    }
    return t
  }
  return (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : sy(solve(x)))
}

/** Die eine Bewegungskurve der Website (entspricht --ease-cs in index.css) */
export const EASE_CS = cubicBezier(0.2, 0.7, 0.1, 1)
/** Dieselbe Kurve für Framer Motion */
export const EASE_CS_ARRAY = [0.2, 0.7, 0.1, 1] as const
