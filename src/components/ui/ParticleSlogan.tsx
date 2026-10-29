import { useEffect, useRef, type ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { prefersReducedMotion } from '@/lib/env'

/**
 * Slogan aus Lichtpartikeln: Beim Hineinscrollen strömen feine Partikel in den Blautönen des Logos (dazu wenige weiße)
 * zusammen und formen die Buchstaben. Steht die Form, blendet der echte Text weich ein und die Partikel aus, danach
 * funkeln einige Partikel kurz nach und verglimmen. Kein Dauer-Effekt.
 *
 * - Der Text steht vollständig als echter Text im HTML (Suchmaschinen, Screenreader); die Partikel sind nur ein Canvas darüber.
 * - Zielpunkte werden aus der gerenderten Schrift abgetastet (gleiche Schrift, Größe, Laufweite und Zeilen wie im DOM).
 * - Läuft nur, solange der Slogan im Bild ist; auf schwachen Geräten und am Handy weniger Partikel.
 * - Mausbewegung (Desktop): Partikel in Cursornähe weichen während der Formung aus.
 * - Reduzierte Bewegung: Text sofort sichtbar, keine Partikel.
 */

const PALETTE = ['#00caf9', '#0086f6', '#005df3', '#3aa0ff', '#7fd8ff']
const WHITE = '#f7f9fb'

type P = {
  tx: number
  ty: number
  sx: number
  sy: number
  cx: number
  cy: number
  delay: number
  dur: number
  size: number
  color: string
  glow: boolean
  ox: number
  oy: number
  vx: number
  vy: number
}

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)

export function ParticleSlogan({
  text,
  accentLast = 0,
  className,
  onComplete,
  children,
}: {
  text: string
  /** Anzahl der letzten Wörter in Logo-Blau */
  accentLast?: number
  className?: string
  onComplete?: () => void
  children?: ReactNode
}) {
  const wrap = useRef<HTMLDivElement>(null)
  const para = useRef<HTMLParagraphElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const done = useRef(onComplete)
  done.current = onComplete

  useEffect(() => {
    const host = wrap.current
    const p = para.current
    const cv = canvas.current
    if (!host || !p || !cv) return
    if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
      done.current?.()
      return
    }
    const ctx = cv.getContext('2d')
    if (!ctx) return
    // Text ausblenden, bis die Partikel ihn geformt haben (der Footer liegt beim Laden weit unter dem sichtbaren Bereich)
    p.dataset.state = 'idle'

    const mobile = window.innerWidth < 768
    const nav = navigator as Navigator & { deviceMemory?: number }
    const weak = (nav.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 4
    const target = mobile ? (weak ? 1000 : 1700) : weak ? 2200 : 4200
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches

    let parts: P[] = []
    let W = 0
    let H = 0
    let pad = 0
    let raf = 0
    let started = false
    let finished = false
    let visible = false
    let elapsed = 0
    let last = 0
    let mouse: { x: number; y: number } | null = null
    let sparks: { x: number; y: number; t0: number; size: number; color: string }[] = []
    let fadeStart = -1

    // Glanzpunkt als vorgerendertes Sprite (weicher Kreis), additiv gezeichnet
    const sprite = document.createElement('canvas')
    sprite.width = sprite.height = 32
    const sc = sprite.getContext('2d')!
    const g = sc.createRadialGradient(16, 16, 0, 16, 16, 16)
    g.addColorStop(0, 'rgba(255,255,255,1)')
    g.addColorStop(0.25, 'rgba(160,220,255,0.55)')
    g.addColorStop(1, 'rgba(0,134,246,0)')
    sc.fillStyle = g
    sc.fillRect(0, 0, 32, 32)

    /** Zielpunkte aus der gerenderten Schrift: jedes Wort an seiner DOM-Position in eine unsichtbare Fläche zeichnen und abtasten */
    const sample = () => {
      const box = host.getBoundingClientRect()
      W = Math.round(box.width)
      const textH = Math.round(box.height)
      pad = Math.round(Math.min(textH * 0.7, 260))
      H = textH + pad * 2
      cv.width = Math.round(W * dpr)
      cv.height = Math.round(H * dpr)
      cv.style.width = `${W}px`
      cv.style.height = `${H}px`
      cv.style.top = `${-pad}px`

      const off = document.createElement('canvas')
      off.width = W
      off.height = textH
      const o = off.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D
      const cs = getComputedStyle(p)
      o.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`
      const ls = parseFloat(cs.letterSpacing) || 0
      const hasLs = 'letterSpacing' in (o as object)
      if (hasLs) (o as unknown as { letterSpacing: string }).letterSpacing = `${ls}px`
      o.textBaseline = 'alphabetic'
      o.fillStyle = '#000'
      const m = o.measureText('Hg')
      const asc = m.fontBoundingBoxAscent ?? parseFloat(cs.fontSize) * 0.8
      const words = Array.from(p.querySelectorAll<HTMLElement>('[data-w]'))
      for (const w of words) {
        const r = w.getBoundingClientRect()
        const x = r.left - box.left
        const y = r.top - box.top + asc
        const t = w.textContent ?? ''
        if (hasLs) o.fillText(t, x, y)
        else {
          // ohne letterSpacing im Canvas: Zeichen einzeln setzen
          let cx = x
          for (const ch of t) {
            o.fillText(ch, cx, y)
            cx += o.measureText(ch).width + ls
          }
        }
      }
      const data = o.getImageData(0, 0, W, textH).data
      let filled = 0
      for (let i = 3; i < data.length; i += 4) if (data[i] > 128) filled++
      const step = Math.max(2, Math.sqrt(filled / target))
      const pts: [number, number][] = []
      for (let y = 0; y < textH; y += step)
        for (let x = 0; x < W; x += step) {
          const jx = Math.min(W - 1, Math.round(x + (Math.random() - 0.5) * step * 0.6))
          const jy = Math.min(textH - 1, Math.round(y + (Math.random() - 0.5) * step * 0.6))
          if (data[(jy * W + jx) * 4 + 3] > 128) pts.push([jx, jy])
        }

      parts = pts.map(([tx, ty]) => {
        const y = ty + pad
        // Start verstreut um den Slogan, eher von unten und von den Seiten; Weg als sanfte Kurve
        const ang = Math.random() * Math.PI * 2
        const dist = (0.35 + Math.random() * 0.75) * Math.max(W * 0.5, H)
        const sx = tx + Math.cos(ang) * dist
        const sy = y + Math.abs(Math.sin(ang)) * dist * 0.55 + pad * 0.4
        const white = Math.random() < 0.08
        return {
          tx,
          ty: y,
          sx,
          sy,
          cx: (sx + tx) / 2 + (Math.random() - 0.5) * W * 0.25,
          cy: Math.min(sy, y) - Math.random() * pad * 0.6,
          // Formung läuft von links nach rechts durch die Zeilen
          delay: (tx / W) * 0.55 + (ty / textH) * 0.15 + Math.random() * 0.35,
          dur: 1.1 + Math.random() * 0.6,
          size: white ? 1.6 : 1 + Math.random() * 1.1,
          color: white ? WHITE : PALETTE[(Math.random() * PALETTE.length) | 0],
          glow: Math.random() < 0.12,
          ox: 0,
          oy: 0,
          vx: 0,
          vy: 0,
        }
      })
    }

    const FORM = 0.55 + 0.15 + 0.35 + 1.7 // längste Verzögerung + längste Dauer
    const FADE = 0.8
    const SPARK = 1.4

    const draw = (now: number) => {
      raf = 0
      if (!visible || finished) return
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0
      last = now
      elapsed += dt
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)
      ctx.globalCompositeOperation = 'lighter'

      const forming = elapsed < FORM
      if (!forming && fadeStart < 0) {
        fadeStart = elapsed
        p.dataset.state = 'done'
        // Nachfunkeln: einige Punkte auf den Buchstaben glimmen kurz auf
        const n = mobile ? 14 : 26
        sparks = Array.from({ length: n }, () => {
          const q = parts[(Math.random() * parts.length) | 0]
          return { x: q.tx, y: q.ty, t0: elapsed + Math.random() * 0.9, size: 5 + Math.random() * 7, color: Math.random() < 0.4 ? WHITE : PALETTE[(Math.random() * 3) | 0] }
        })
      }
      const fade = fadeStart < 0 ? 1 : Math.max(0, 1 - (elapsed - fadeStart) / FADE)

      if (fade > 0) {
        for (const q of parts) {
          const t = Math.min(1, Math.max(0, (elapsed - q.delay) / q.dur))
          const e = easeOut(t)
          const u = 1 - e
          // quadratische Kurve Start → Kontrollpunkt → Ziel
          let x = u * u * q.sx + 2 * u * e * q.cx + e * e * q.tx
          let y = u * u * q.sy + 2 * u * e * q.cy + e * e * q.ty
          if (fine) {
            // Ausweichen vor dem Cursor (Feder zurück zur Bahn)
            if (mouse && forming) {
              const dx = x + q.ox - mouse.x
              const dy = y + q.oy - mouse.y
              const d2 = dx * dx + dy * dy
              if (d2 < 9000 && d2 > 0.01) {
                const f = (1 - d2 / 9000) * 1.6
                const d = Math.sqrt(d2)
                q.vx += (dx / d) * f
                q.vy += (dy / d) * f
              }
            }
            q.vx += -q.ox * 0.08
            q.vy += -q.oy * 0.08
            q.vx *= 0.82
            q.vy *= 0.82
            q.ox += q.vx
            q.oy += q.vy
            x += q.ox
            y += q.oy
          }
          const a = (0.25 + 0.75 * e) * fade
          if (q.glow) {
            ctx.globalAlpha = a * 0.7
            const s = q.size * 5
            ctx.drawImage(sprite, x - s / 2, y - s / 2, s, s)
          }
          ctx.globalAlpha = a
          ctx.fillStyle = q.color
          ctx.fillRect(x - q.size / 2, y - q.size / 2, q.size, q.size)
        }
      }

      let sparksLeft = false
      for (const s of sparks) {
        const k = (elapsed - s.t0) / SPARK
        if (k < 0) {
          sparksLeft = true
          continue
        }
        if (k >= 1) continue
        sparksLeft = true
        const a = Math.sin(Math.PI * k) * (1 - k * 0.4)
        const size = s.size * (0.6 + 0.4 * Math.sin(Math.PI * k))
        ctx.globalAlpha = a
        ctx.drawImage(sprite, s.x - size, s.y - size - k * 6, size * 2, size * 2)
        ctx.globalAlpha = a * 0.9
        ctx.fillStyle = s.color
        ctx.fillRect(s.x - 0.75, s.y - 0.75 - k * 6, 1.5, 1.5)
      }
      ctx.globalAlpha = 1

      if (fadeStart >= 0 && fade <= 0 && !sparksLeft) {
        finished = true
        ctx.clearRect(0, 0, W, H)
        cv.style.display = 'none'
        stop()
        done.current?.()
        return
      }
      raf = requestAnimationFrame(draw)
    }

    const start = () => {
      if (started) return
      started = true
      sample()
      if (!parts.length) {
        p.dataset.state = 'done'
        finished = true
        done.current?.()
        return
      }
      cv.style.display = 'block'
    }

    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting && e.intersectionRatio >= 0.35
        if (visible && !finished) {
          if (!started) {
            if (document.fonts?.status === 'loaded') start()
            else {
              document.fonts.ready.then(() => {
                start()
                if (visible && !raf && !finished) raf = requestAnimationFrame(draw)
              })
              return
            }
          }
          last = 0
          if (!raf && !finished) raf = requestAnimationFrame(draw)
        }
      },
      { threshold: [0, 0.35, 0.6] },
    )
    io.observe(host)

    const onMove = (e: PointerEvent) => {
      const r = cv.getBoundingClientRect()
      mouse = { x: e.clientX - r.left, y: e.clientY - r.top }
    }
    const onLeave = () => (mouse = null)
    if (fine) {
      window.addEventListener('pointermove', onMove, { passive: true })
      document.addEventListener('pointerleave', onLeave)
    }
    function stop() {
      io.disconnect()
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
    }
    return () => {
      cancelAnimationFrame(raf)
      stop()
      if (!finished) p.dataset.state = 'done'
    }
  }, [text])

  const words = text.split(/( |\n)/).filter((w) => w !== ' ' && w !== '')
  const count = words.filter((w) => w !== '\n').length
  let k = 0
  return (
    <div ref={wrap} className={cn('relative', className)}>
      <p ref={para} className="particle-text t-display">
        {words.map((w, i) => {
          if (w === '\n') return <br key={i} />
          const idx = k++
          return (
            <span key={i}>
              {i > 0 && words[i - 1] !== '\n' && ' '}
              <span data-w className={cn('whitespace-nowrap', idx >= count - accentLast && 'text-logo-sky')}>
                {w}
              </span>
            </span>
          )
        })}
        {children}
      </p>
      <canvas ref={canvas} aria-hidden className="pointer-events-none absolute left-0 hidden" />
    </div>
  )
}
