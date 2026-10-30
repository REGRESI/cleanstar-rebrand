import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { Picture } from './Picture'
import { OrbitButton } from './OrbitButton'
import type { ImageId } from '@/content/images'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { prefersReducedMotion } from '@/lib/env'
import { cn } from '@/lib/cn'

/**
 * Kreis-Übergang (Referenz: ERA). Ein großer Kreis in der Farbe des nächsten Abschnitts steigt von unten über ein
 * Bild, ein kurzer Satz läuft entlang seiner Kante, der Kreis wächst, bis die Fläche voll ist; danach folgt der
 * Abschnitt in derselben Farbe. Der Kreis liegt nur über einem Bild, nie über Text.
 * Einsatz: Startseite höchstens drei Mal, Unterseiten höchstens einmal.
 */

export type CircleTone = 'surface' | 'night' | 'paper'
const FILL: Record<CircleTone, string> = { surface: '#edf1f5', night: '#0a1a33', paper: '#f7f9fb' }
const INK: Record<CircleTone, string> = { surface: '#0b1220', night: '#f7f9fb', paper: '#0b1220' }

export interface CircleHandle {
  set: (t: number) => void
}

const ease = (t: number) => 1 - Math.pow(1 - t, 2.2)

/** Kreis mit Satz an der Kante; t von 0 (unsichtbar) bis 1 (Fläche voll) */
export const CircleEdge = forwardRef<CircleHandle, { text: string; tone: CircleTone; className?: string }>(function CircleEdge({ text, tone, className }, ref) {
  const svg = useRef<SVGSVGElement>(null)
  const disc = useRef<SVGCircleElement>(null)
  const track = useRef<SVGPathElement>(null)
  const label = useRef<SVGTextPathElement>(null)
  const last = useRef(-1)
  useImperativeHandle(ref, () => ({
    set(t) {
      const el = svg.current
      if (!el || !disc.current || !track.current || !label.current) return
      if (Math.abs(t - last.current) < 0.0005) return
      last.current = t
      el.style.visibility = t > 0.001 ? 'visible' : 'hidden'
      if (t <= 0.001) return
      const W = el.clientWidth
      const H = el.clientHeight
      el.setAttribute('viewBox', `0 0 ${W} ${H}`)
      // Mittelpunkt unter der Unterkante (k · r), Endradius so, dass auch die oberen Ecken bedeckt sind
      const k = 0.35
      const a = 1 - k * k
      const end = (2 * k * H + Math.sqrt(4 * k * k * H * H + 4 * a * (H * H + (W * W) / 4))) / (2 * a)
      const r = end * 1.02 * ease(t)
      const cx = W / 2
      const cy = H + k * r
      disc.current.setAttribute('r', String(r))
      disc.current.setAttribute('cx', String(cx))
      disc.current.setAttribute('cy', String(cy))
      const small = W < 640
      const rt = Math.max(1, r - (small ? 30 : 42))
      track.current.setAttribute('d', `M ${cx - rt} ${cy} A ${rt} ${rt} 0 1 1 ${cx + rt} ${cy} A ${rt} ${rt} 0 1 1 ${cx - rt} ${cy}`)
      // Satz wandert entlang der Kante von rechts zur Mitte und blendet aus, bevor die Fläche voll ist
      label.current.setAttribute('startOffset', `${25 + (1 - Math.min(1, t / 0.7)) * (small ? 1.5 : 5)}%`)
      // erst sichtbar, wenn der Bogen breit genug für den Satz ist; blendet aus, bevor die Fläche voll ist
      const chord = 2 * Math.sqrt(Math.max(0, rt * rt - (k * r) ** 2))
      const need = text.length * (small ? 9 : 12.5)
      label.current.parentElement!.setAttribute('opacity', String(Math.min(1, Math.max(0, (chord - need) / 160)) * (1 - Math.max(0, (t - 0.78) / 0.14))))
    },
  }))
  return (
    <svg ref={svg} aria-hidden className={cn('pointer-events-none absolute inset-0 size-full', className)} style={{ visibility: 'hidden' }}>
      <circle ref={disc} r="0" fill={FILL[tone]} />
      <path ref={track} fill="none" id={`ce-${tone}-${text.length}`} />
      <text fill={INK[tone]} className="circle-text" opacity="0">
        <textPath ref={label} href={`#ce-${tone}-${text.length}`} startOffset="25%" textAnchor="middle">
          {text}
        </textPath>
      </text>
    </svg>
  )
})

/** Eigenständiger Übergang: Foto bleibt stehen, der Kreis steigt darüber (gepinnt per CSS sticky) */
export function CircleTransition({ image, text, tone, className, orbit }: { image: ImageId; text: string; tone: CircleTone; className?: string; orbit?: boolean }) {
  const root = useRef<HTMLElement>(null)
  const circle = useRef<CircleHandle>(null)
  const cta = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = root.current
    if (!el || prefersReducedMotion() || !document.documentElement.classList.contains('js-motion')) return
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.4,
      animation: gsap.to({}, { duration: 1 }),
      // erst kurz das Bild, dann der Kreis
      onUpdate: (s) => apply(s.progress),
    })
    function apply(p: number) {
      const t = Math.max(0, (p - 0.12) / 0.88)
      circle.current?.set(t)
      // runder Button nur, solange das Bild frei ist
      if (cta.current) {
        const o = 1 - Math.min(1, t / 0.12)
        cta.current.style.opacity = String(o)
        cta.current.style.visibility = o === 0 ? 'hidden' : 'visible'
      }
    }
    apply(st.progress)
    return () => st.kill()
  }, [])
  return (
    <section ref={root} className={cn('circle-run relative', className)} data-tone={tone === 'night' ? 'dark' : tone}>
      <div className="circle-stage sticky top-0 h-[100svh] overflow-hidden">
        <Picture id={image} aspect="absolute inset-0 size-full" sizes="100vw" />
        {orbit && (
          <div ref={cta} className="absolute right-[8%] bottom-[14%] sm:right-[10%] sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2">
            <OrbitButton />
          </div>
        )}
        <CircleEdge ref={circle} text={text} tone={tone} />
      </div>
    </section>
  )
}
