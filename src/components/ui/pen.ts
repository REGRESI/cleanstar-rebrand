/**
 * Füller-Effekt für den Schreibschrift-Großbuchstaben der Moment-Überschrift: Die echte Glyphe wird auf einer Canvas
 * gezeichnet und nur dort sichtbar, wo der Füller schon war. Die Maske folgt der Mittellinie in Schreibrichtung
 * (penStrokes.ts) mit der örtlichen Strichstärke als Breite (kein Teil der Glyphe erscheint zu früh). Tempo wie
 * Handschrift: langsamer in Kurven und am Strichanfang, schneller auf Geraden, kurze Pause beim Absetzen. Vorne läuft eine
 * winzige helle Federspitze mit. Am Ende übernimmt wieder die normale Schrift im HTML (keine Lücken möglich).
 */
type Pt = { x: number; y: number; r: number; c: number }

/** Gesamtdauer je nach Länge der Striche: 1,2 bis 1,6 s */
export const PEN_MIN = 1.2
export const PEN_MAX = 1.6

function prepare(strokes: number[][]) {
  const S: Pt[][] = strokes.map((s) => {
    const pts: Pt[] = []
    for (let i = 0; i < s.length; i += 3) pts.push({ x: s[i] / 1000, y: s[i + 1] / 1000, r: s[i + 2] / 1000, c: 0 })
    return pts
  })
  // „Kosten“ je Punkt: Weg, in Kurven und am Strichanfang teurer
  let total = 0
  let length = 0
  S.forEach((pts, si) => {
    let strokeLen = 0
    for (let i = 1; i < pts.length; i++) strokeLen += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y)
    let run = 0
    if (si > 0) total += 0.06 // Absetzen
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1]
      const b = pts[i]
      const ds = Math.hypot(b.x - a.x, b.y - a.y)
      let turn = 0
      if (i > 1) {
        const p = pts[i - 2]
        const t1 = Math.atan2(a.y - p.y, a.x - p.x)
        const t2 = Math.atan2(b.y - a.y, b.x - a.x)
        turn = Math.abs(((t2 - t1 + Math.PI * 3) % (Math.PI * 2)) - Math.PI)
      }
      run += ds
      const start = run < strokeLen * 0.1 ? 1.8 : 1
      total += ds * (1 + 3.2 * turn) * start
      b.c = total
      length += ds
    }
    if (pts[0]) pts[0].c = si > 0 ? total - 0 : 0
  })
  // Strichanfänge: Kosten des Vorgängers übernehmen (der erste Punkt eines Strichs erscheint nach der Absetzpause)
  S.forEach((pts, si) => {
    if (si > 0 && pts.length > 1) pts[0].c = pts[1].c - 1e-6
  })
  return { S, total, length }
}

export function writeCap(capEl: HTMLElement, cap: string, strokes: number[][], color: string, onDone: () => void) {
  const probe = capEl.querySelector<HTMLElement>('.mo-probe')
  const fs = parseFloat(getComputedStyle(capEl).fontSize)
  if (!probe || !fs || !strokes.length) return null
  const { S, total, length } = prepare(strokes)
  // Ursprung der Glyphe (Stiftposition auf der Grundlinie) innerhalb des Großbuchstabens
  const ctxProbe = document.createElement('canvas').getContext('2d')!
  ctxProbe.font = `${fs}px "Pinyon Script"`
  const adv = ctxProbe.measureText(cap).width
  const ox = probe.offsetLeft - adv
  const oy = probe.offsetTop
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const pts of S)
    for (const p of pts) {
      minX = Math.min(minX, p.x - p.r)
      maxX = Math.max(maxX, p.x + p.r)
      minY = Math.min(minY, p.y - p.r)
      maxY = Math.max(maxY, p.y + p.r)
    }
  const pad = Math.ceil(fs * 0.06)
  const w = Math.ceil((maxX - minX) * fs) + pad * 2
  const h = Math.ceil((maxY - minY) * fs) + pad * 2
  const dpr = Math.min(2, window.devicePixelRatio || 1)
  const cv = document.createElement('canvas')
  cv.className = 'mo-pen'
  cv.width = Math.round(w * dpr)
  cv.height = Math.round(h * dpr)
  cv.style.cssText = `left:${ox + minX * fs - pad}px;top:${oy + minY * fs - pad}px;width:${w}px;height:${h}px`
  const mask = document.createElement('canvas')
  mask.width = cv.width
  mask.height = cv.height
  const g = cv.getContext('2d')!
  const m = mask.getContext('2d')!
  const X = (x: number) => (pad + (x - minX) * fs) * dpr
  const Y = (y: number) => (pad + (y - minY) * fs) * dpr
  // Maskenbreite: örtliche Strichstärke plus etwas Luft für die Kantenglättung
  const R = (r: number) => (r * fs * 1.22 + 1.2) * dpr
  m.lineCap = 'round'
  m.lineJoin = 'round'
  m.strokeStyle = '#000'
  m.fillStyle = '#000'
  capEl.appendChild(cv)

  const dur = (PEN_MIN + (PEN_MAX - PEN_MIN) * Math.min(1, length / 3)) * 1000
  let si = 0
  let pi = 0
  let raf = 0
  let t0 = 0
  const frame = (now: number) => {
    if (!t0) t0 = now
    const k = Math.min(1, (now - t0) / dur)
    // sanft an- und auslaufen
    const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2
    const target = e * total
    let tip: Pt | null = null
    while (si < S.length) {
      const pts = S[si]
      if (pi === 0) {
        if (pts[0].c > target) break
        m.beginPath()
        m.arc(X(pts[0].x), Y(pts[0].y), R(pts[0].r), 0, Math.PI * 2)
        m.fill()
        pi = 1
      }
      while (pi < pts.length && pts[pi].c <= target) {
        const a = pts[pi - 1]
        const b = pts[pi]
        m.lineWidth = R(Math.max(a.r, b.r)) * 2
        m.beginPath()
        m.moveTo(X(a.x), Y(a.y))
        m.lineTo(X(b.x), Y(b.y))
        m.stroke()
        tip = b
        pi++
      }
      if (pi < pts.length) break
      si++
      pi = 0
    }
    g.clearRect(0, 0, cv.width, cv.height)
    g.globalCompositeOperation = 'source-over'
    g.font = `${fs * dpr}px "Pinyon Script"`
    g.fillStyle = color
    g.textBaseline = 'alphabetic'
    g.fillText(cap, X(0), Y(0))
    g.globalCompositeOperation = 'destination-in'
    g.drawImage(mask, 0, 0)
    g.globalCompositeOperation = 'source-over'
    // Federspitze: kleiner heller Lichtpunkt vorne am Strich
    if (tip && k < 1) {
      const rr = Math.max(2.5, fs * 0.02) * dpr
      const grd = g.createRadialGradient(X(tip.x), Y(tip.y), 0, X(tip.x), Y(tip.y), rr * 2.6)
      grd.addColorStop(0, 'rgba(255,255,255,0.95)')
      grd.addColorStop(0.35, 'rgba(160,215,255,0.55)')
      grd.addColorStop(1, 'rgba(160,215,255,0)')
      g.fillStyle = grd
      g.beginPath()
      g.arc(X(tip.x), Y(tip.y), rr * 2.6, 0, Math.PI * 2)
      g.fill()
    }
    if (k < 1) raf = requestAnimationFrame(frame)
    else {
      cv.remove()
      onDone()
    }
  }
  raf = requestAnimationFrame(frame)
  return {
    duration: dur / 1000,
    cancel: () => {
      cancelAnimationFrame(raf)
      cv.remove()
    },
  }
}
