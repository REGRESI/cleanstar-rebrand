import { useEffect, useRef, useState } from 'react'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { AnimatedText } from '@/components/ui/AnimatedText'
import { RevealText } from '@/components/ui/RevealText'
import { Sparkle } from '@/components/ui/Sparkle'
import { home, processSteps } from '@/content/site'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { prefersReducedMotion } from '@/lib/env'
import { cn } from '@/lib/cn'

type Step = { title: string; duration: string; text: string }
const pad = (v: number) => String(Math.round(v)).padStart(2, '0')

/**
 * Ablauf in zwei Varianten:
 * line: nummerierte Schritte an einer feinen Linie (Startseite, Seite „Ablauf“; Referenz terminal/04-linie-komet): Die
 *       Linie läuft in runden 90-Grad-Kurven hinter dem Text von Kästchen zu Kästchen, seitlich aus und zurück. Ein
 *       leuchtender Punkt (Lichthof, kurzer Schweif) fährt scroll-gesteuert entlang, hinter ihm ist die Linie blau; ruht
 *       er, pulsiert er leicht. Erreicht er einen Schritt, füllt sich dessen Nummernkästchen in Markenblau
 *       (weiße Zahl), der Glanz-Stern funkelt, der Titel kommt mit der Farbwelle, der Text blendet ein. Der aktuelle
 *       Schritt ist kräftig, durchlaufene bleiben gefüllt, kommende sind blass. Beim Hochscrollen alles rückwärts.
 *       Desktop: Überschrift links bleibt stehen, solange die Schritte durchlaufen.
 * rows: Raster mit großen Nummern (Partnerseite)
 */
export function ProcessTimeline({
  title = home.process.headline,
  eyebrow = home.process.eyebrow,
  steps = processSteps,
  id = 'process-title',
  variant = 'line',
}: {
  title?: string
  eyebrow?: string
  steps?: Step[]
  id?: string
  variant?: 'line' | 'rows'
}) {
  if (variant === 'rows')
    return (
      <section className="section" aria-labelledby={id}>
        <div className="container-site">
          <SectionHeading layout="rail" eyebrow={eyebrow} title={title} id={id} />
          <Rows steps={steps} />
        </div>
      </section>
    )
  return (
    <section className="section" aria-labelledby={id}>
      <div className="container-site grid-site gap-y-14 lg:items-start">
        <div className="col-span-12 lg:sticky lg:top-32 lg:col-span-4">
          <p className="t-label">{eyebrow}</p>
          <RevealText as="h2" id={id} text={title} className="t-h2 mt-5 max-w-[16ch]" scope="section" />
        </div>
        <Line steps={steps} />
      </div>
    </section>
  )
}

/**
 * Pfad der Linie: senkrecht an jedem Kästchen vorbei; im Abstand zwischen zwei Schritten schwingt sie in runden
 * 90-Grad-Kurven seitlich aus und kommt zurück (abwechselnd weit und weniger weit), so kreuzt sie nie den Text.
 * Rückgabe: Pfad, Gesamtlänge und Länge bis zur Mitte jedes Kästchens.
 */
function geometry(ol: HTMLElement, boxes: HTMLElement[]) {
  const o = ol.getBoundingClientRect()
  const W = ol.clientWidth
  const mobile = W < 520
  const rel = (r: DOMRect) => ({ x: r.left - o.left + r.width / 2, top: r.top - o.top, bottom: r.bottom - o.top, y: r.top - o.top + r.height / 2 })
  const c = boxes.map((b) => rel(b.getBoundingClientRect()))
  // Unterkante des Texts je Schritt
  const textBottom = boxes.map((b) => {
    const t = b.parentElement?.lastElementChild as HTMLElement | null
    return t ? t.getBoundingClientRect().bottom - o.top : b.getBoundingClientRect().bottom - o.top
  })
  const x = c[0].x
  const lead = mobile ? 24 : 40
  let d = `M ${x} ${c[0].y - lead}`
  let len = 0
  let y = c[0].y - lead
  const at: number[] = []
  const arc = (r: number) => (Math.PI * r) / 2
  for (let i = 0; i < c.length; i++) {
    // bis zur Kästchenmitte
    len += c[i].y - y
    y = c[i].y
    at.push(len)
    if (i === c.length - 1) {
      d += ` L ${x} ${y}`
      break
    }
    const gTop = textBottom[i]
    const gBot = c[i + 1].top
    const gap = gBot - gTop
    const R = Math.max(6, Math.min(mobile ? 10 : 16, gap * 0.28))
    const y1 = gTop + (gap - 2 * R) * 0.25
    const y2 = y1 + Math.max(2 * R, (gap - 2 * R) * 0.5)
    const xs = mobile ? x + (i % 2 ? 56 : 92) : x + W * (i % 2 ? 0.5 : 0.82)
    // senkrecht bis kurz vor die Lücke, Kurve nach rechts, quer, Kurve nach unten, Kurve zurück, quer, Kurve nach unten
    d += ` L ${x} ${y1 - R} A ${R} ${R} 0 0 0 ${x + R} ${y1} L ${xs - R} ${y1} A ${R} ${R} 0 0 1 ${xs} ${y1 + R}`
    d += ` L ${xs} ${y2 - R} A ${R} ${R} 0 0 1 ${xs - R} ${y2} L ${x + R} ${y2} A ${R} ${R} 0 0 0 ${x} ${y2 + R}`
    len += y1 - R - y + arc(R) + (xs - R - (x + R)) + arc(R) + (y2 - R - (y1 + R)) + arc(R) + (xs - R - (x + R)) + arc(R)
    y = y2 + R
  }
  return { d, total: len, at }
}

function Line({ steps }: { steps: Step[] }) {
  const list = useRef<HTMLOListElement>(null)
  const svg = useRef<SVGSVGElement>(null)
  // Index des zuletzt erreichten Schritts (-1: keiner); ohne Bewegung alle erreicht
  const [at, setAt] = useState(-1)
  const [still, setStill] = useState(false)

  useEffect(() => {
    const ol = list.current
    const sv = svg.current
    if (!ol || !sv) return
    const reduced = prefersReducedMotion() || !document.documentElement.classList.contains('js-motion')
    const boxes = Array.from(ol.querySelectorAll<HTMLElement>('[data-box]'))
    const [base, fill, tail] = Array.from(sv.querySelectorAll<SVGPathElement>('path'))
    const dot = sv.querySelector<SVGGElement>('[data-dot]')!
    let g = geometry(ol, boxes)
    let prog = reduced ? 1 : 0
    let idle = 0
    const draw = () => {
      const s = prog * g.total
      fill.style.strokeDasharray = `${g.total}`
      fill.style.strokeDashoffset = `${g.total - s}`
      const TL = Math.min(90, s)
      tail.style.strokeDasharray = `0 ${Math.max(0, s - TL)} ${TL} ${g.total}`
      const p = fill.getPointAtLength(Math.max(0, Math.min(g.total, s)))
      dot.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`)
      dot.style.opacity = s > 1 && s < g.total + 1 ? '1' : '0'
      let k = -1
      g.at.forEach((l, i) => {
        if (s >= l - 2) k = i
      })
      setAt(k)
      // ruht der Punkt, pulsiert er leicht
      sv.removeAttribute('data-idle')
      clearTimeout(idle)
      idle = window.setTimeout(() => sv.setAttribute('data-idle', ''), 260)
    }
    const layout = () => {
      g = geometry(ol, boxes)
      sv.setAttribute('viewBox', `0 0 ${ol.clientWidth} ${ol.clientHeight}`)
      base.setAttribute('d', g.d)
      fill.setAttribute('d', g.d)
      tail.setAttribute('d', g.d)
      draw()
    }
    const ro = new ResizeObserver(layout)
    ro.observe(ol)
    layout()
    if (reduced) {
      setStill(true)
      setAt(steps.length - 1)
      return () => ro.disconnect()
    }
    const st = ScrollTrigger.create({
      trigger: ol,
      start: 'top 62%',
      end: 'bottom 62%',
      scrub: 0.5,
      animation: gsap.to({}, { duration: 1 }),
      onUpdate: (x) => {
        prog = x.progress
        draw()
      },
    })
    prog = st.progress
    draw()
    return () => {
      st.kill()
      ro.disconnect()
      clearTimeout(idle)
    }
  }, [steps.length])

  return (
    <ol ref={list} className="steps relative col-span-12 lg:col-span-7 lg:col-start-6">
      {/* Linie hinter dem Text, Leuchtpunkt mit Lichthof und kurzem Schweif */}
      <svg ref={svg} aria-hidden className="steps-svg" preserveAspectRatio="none">
        <defs>
          <radialGradient id="comet-halo">
            <stop offset="0" stopColor="#1a4fe0" stopOpacity="0.55" />
            <stop offset="0.45" stopColor="#3d7bff" stopOpacity="0.2" />
            <stop offset="1" stopColor="#3d7bff" stopOpacity="0" />
          </radialGradient>
        </defs>
        <path className="steps-base" />
        <path className="steps-fill" />
        <path className="steps-tail" />
        <g data-dot className="steps-dot">
          <circle className="steps-halo" r="26" fill="url(#comet-halo)" />
          <circle r="5" fill="#1a4fe0" />
          <circle r="2.2" fill="#fff" />
        </g>
      </svg>
      {steps.map((s, i) => {
        const state = i > at ? 'next' : i === at ? 'now' : 'past'
        return (
          <li key={s.title} data-state={state} className="step relative grid grid-cols-[2.5rem_1fr] gap-x-5 pb-12 last:pb-0 sm:grid-cols-[3.4rem_1fr] sm:gap-x-8 sm:pb-16">
            <span data-box className="step-box relative z-10 grid size-[2.3rem] place-items-center font-medium tabular-nums text-[0.9375rem] sm:size-[3.2rem] sm:text-[1.125rem]">
              {pad(i + 1)}
              <Sparkle play={i <= at && !still} className="absolute -top-2 -right-2 size-4 sm:size-5" />
            </span>
            <div className="relative pt-1 sm:pt-2.5">
              <p className="step-meta t-meta">{s.duration}</p>
              <AnimatedText as="h3" text={s.title} trigger={still || i <= at} orphans={false} className={cn('step-title at-soft mt-2 text-[1.5rem] leading-[1.2] font-medium tracking-[-0.02em] sm:text-[1.75rem]')} />
              <p className="step-text measure mt-3 text-ink-2">{s.text}</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

function Rows({ steps }: { steps: Step[] }) {
  return (
    <ol className="mt-16 border-b border-line lg:mt-24">
      {steps.map((s, i) => (
        <li key={s.title} className="relative grid grid-cols-1 gap-x-8 gap-y-2 border-t border-line py-7 lg:grid-cols-12 lg:py-9">
          <p className="font-medium tabular-nums text-[2.25rem] leading-none tracking-[-0.04em] text-ink lg:col-span-2 lg:text-[3rem]">{pad(i + 1)}</p>
          <div className="lg:col-span-4">
            <p className="t-meta">{s.duration}</p>
            <h3 className="mt-2 text-[1.375rem] leading-[1.2] font-medium tracking-[-0.02em] sm:text-[1.5rem]">{s.title}</h3>
          </div>
          <p className="measure text-ink-2 lg:col-span-5 lg:col-start-8 lg:pt-6">{s.text}</p>
        </li>
      ))}
    </ol>
  )
}
