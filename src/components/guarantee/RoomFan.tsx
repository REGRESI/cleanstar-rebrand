import { useEffect, useRef, useState } from 'react'
import { Check } from 'lucide-react'
import { zones, freqLabel, type Zone } from '@/content/floorplan'
import { ScrollTrigger } from '@/lib/gsap'
import { prefersReducedMotion } from '@/lib/env'
import { span } from '@/lib/scrollScene'
import { EASE_CS } from '@/lib/ease'

/**
 * Fächer der Raum-Karten (Prinzip aus Shopify Editions „Fächer-Karten“), Seite Qualitätsgarantie:
 * Je Raum aus dem Muster-Leistungsverzeichnis eine Karte (Raumname, vier Prüfpunkte mit Haken, Intervall). Die Karten
 * liegen als Fächer am unteren Rand, fächern beim Scrollen auf, nacheinander hebt sich jede groß in die Mitte (die
 * anderen weichen zurück), zum Schluss liegen alle ordentlich nebeneinander mit dem Stempel „Kontrolliert nach
 * Checkliste“. Drumherum schweben die freigestellten Mappe-Objekte in zwei Tiefenebenen, hinter den Karten und
 * abseits der Überschrift. Handy: Stapel, die oberste Karte hebt sich ab und legt sich zur Seite.
 * An die Scrollposition gekoppelt (auch rückwärts). Reduzierte Bewegung: Karten nebeneinander mit Stempel.
 */
const intervalOf = (z: Zone) => [...new Set(z.tasks.map((t) => freqLabel(t.freq, 'taeglich')))].join(' · ')

const OBJECTS = [
  { src: '/images/deko/objekt-schluessel.webp', w: 420, h: 388, cls: 'rf-obj-a', depth: 1 },
  { src: '/images/deko/objekt-kaffee.webp', w: 418, h: 420, cls: 'rf-obj-b', depth: 2 },
  { src: '/images/deko/objekt-visitenkarte.webp', w: 420, h: 308, cls: 'rf-obj-c', depth: 2 },
  { src: '/images/deko/objekt-pflanze.webp', w: 420, h: 398, cls: 'rf-obj-d', depth: 1 },
]

type Pose = { x: number; y: number; r: number; s: number; o: number }
const mix = (a: Pose, b: Pose, t: number): Pose => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, r: a.r + (b.r - a.r) * t, s: a.s + (b.s - a.s) * t, o: a.o + (b.o - a.o) * t })

export function RoomFan() {
  const run = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const [still, setStill] = useState(false)
  const [stamp, setStamp] = useState(false)

  useEffect(() => {
    const el = run.current
    const st0 = stage.current
    if (!el || !st0) return
    if (prefersReducedMotion() || !document.documentElement.classList.contains('js-motion')) {
      setStill(true)
      setStamp(true)
      return
    }
    const cards = Array.from(st0.querySelectorAll<HTMLElement>('[data-card]'))
    const objs = Array.from(st0.querySelectorAll<HTMLElement>('[data-obj]'))
    const n = cards.length
    const apply = (p: number) => {
      const W = st0.clientWidth
      const H = st0.clientHeight
      const cw = cards[0].offsetWidth
      const ch = cards[0].offsetHeight
      const mobile = W < 768
      const open = EASE_CS(span(p, 0.06, 0.24))
      const g = EASE_CS(span(p, 0.86, 0.98))
      const seq0 = 0.24
      const seq1 = 0.86
      const d = (seq1 - seq0) / n
      cards.forEach((c, i) => {
        // Fächer: Drehpunkt unter dem unteren Rand, Winkel öffnen sich
        const k = i - (n - 1) / 2
        const spread = (mobile ? 2.5 : 4) + open * (mobile ? 3.5 : 7)
        const a = (k * spread * Math.PI) / 180
        const R = H * 0.95
        const px = W / 2
        const py = H + R * 0.62 - open * H * 0.12
        let pose: Pose = mobile
          ? // Handy: Stapel in der Mitte, leicht versetzt
            { x: W / 2 - cw / 2 + k * 2, y: H * 0.5 - ch / 2 + 40 - i * 3, r: k * 1.2, s: 0.92, o: 1 }
          : { x: px + Math.sin(a) * R - cw / 2, y: py - Math.cos(a) * R - ch / 2, r: (a * 180) / Math.PI, s: 0.8, o: 1 }
        // nacheinander: die Karte hebt sich groß in die Mitte (Handy: hebt sich ab und legt sich zur Seite)
        const c0 = seq0 + i * d
        const up = EASE_CS(span(p, c0, c0 + d * 0.45))
        const down = EASE_CS(span(p, c0 + d * 0.75, c0 + d * 1.05))
        if (mobile) {
          const aside: Pose = { x: -cw * 0.42 + i * 3, y: H * 0.62 - ch / 2 + i * 4, r: -14 + i * 1.5, s: 0.58, o: 1 }
          const lifted: Pose = { x: W / 2 - cw / 2, y: H * 0.46 - ch / 2, r: 0, s: 1.02, o: 1 }
          pose = mix(mix(pose, lifted, up), aside, down)
        } else {
          const lifted: Pose = { x: W / 2 - cw / 2, y: H * 0.55 - ch / 2, r: 0, s: 1.18, o: 1 }
          pose = mix(pose, lifted, up * (1 - down))
          // die übrigen treten zurück, solange eine Karte oben ist
          const active = Math.max(0, Math.min(n - 1, Math.floor((p - seq0) / d)))
          if (p > seq0 && p < seq1 && i !== active) pose = { ...pose, y: pose.y + 30 }
          // Ende: alle ordentlich nebeneinander (vier Spalten, zwei Reihen)
          const cols = 4
          const head = st0.querySelector<HTMLElement>('.rf-head')
          const top = Math.max(H * 0.22, head ? head.offsetTop + (head.offsetParent as HTMLElement).offsetTop + head.offsetHeight + 28 : 0)
          const gs = Math.min(0.72, (W - 120) / cols / cw, (H - top - 30 - 22) / 2 / ch)
          const gx = W / 2 - ((cols * cw * gs + (cols - 1) * 22) / 2) + (i % cols) * (cw * gs + 22) - (cw * (1 - gs)) / 2
          const gy = top + Math.floor(i / cols) * (ch * gs + 22) - (ch * (1 - gs)) / 2
          pose = mix(pose, { x: gx, y: gy, r: 0, s: gs, o: 1 }, g)
        }
        c.style.transform = `translate3d(${pose.x.toFixed(1)}px, ${pose.y.toFixed(1)}px, 0) rotate(${pose.r.toFixed(2)}deg) scale(${pose.s.toFixed(3)})`
        c.style.opacity = pose.o.toFixed(3)
        // die gerade gehobene Karte liegt oben
        c.style.zIndex = String(up > 0.01 && down < 0.99 ? 50 : mobile ? n - i : i)
      })
      objs.forEach((o, j) => {
        const depth = Number(o.dataset.obj)
        o.style.transform = `translate3d(0, ${((0.5 - p) * depth * 90).toFixed(1)}px, 0) rotate(${((p - 0.5) * depth * (j % 2 ? 10 : -10)).toFixed(2)}deg)`
      })
      setStamp(g > 0.92 || (mobile && p > 0.9))
      st0.setAttribute('data-ready', '')
    }
    const st = ScrollTrigger.create({ trigger: el, start: 'top top', end: 'bottom bottom', scrub: 0.35, onUpdate: (x) => apply(x.progress), onRefresh: (x) => apply(x.progress) })
    apply(st.progress)
    return () => {
      st.kill()
      st0.removeAttribute('data-ready')
    }
  }, [])

  const heading = (
    <div className="rf-head">
      <p className="t-label">Prüfpunkte je Raum</p>
      <h2 id="fan-title" className="t-h2 mt-4 max-w-[16ch]">
        Jeder Raum hat seine Checkliste.
      </h2>
    </div>
  )

  return (
    <section className="relative bg-paper" aria-labelledby="fan-title">
      <div ref={run} className={still ? 'section' : 'rf-run'}>
        <div ref={stage} className={still ? 'container-site' : 'rf-stage'}>
          {!still && (
            <div aria-hidden className="pointer-events-none absolute inset-0">
              {OBJECTS.map((o) => (
                <img key={o.src} data-obj={o.depth} src={o.src} alt="" width={o.w} height={o.h} loading="lazy" decoding="async" className={`rf-obj ${o.cls}`} />
              ))}
            </div>
          )}
          <div className={still ? '' : 'container-site relative z-[60] pt-24 lg:pt-28'}>{heading}</div>
          <ul className={still ? 'mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4' : 'rf-cards'} aria-label="Räume und Prüfpunkte">
            {zones.map((z) => (
              <li key={z.id} data-card className="rf-card">
                <p className="text-[1.25rem] leading-tight font-medium tracking-[-0.015em] text-ink">{z.name}</p>
                <ul className="mt-4 space-y-2">
                  {z.tasks.slice(0, 4).map((t) => (
                    <li key={t.task} className="flex gap-2.5 text-[0.875rem] leading-[1.35] text-ink-2">
                      <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-blue text-white">
                        <Check className="size-3" strokeWidth={2.75} aria-hidden />
                      </span>
                      {t.task}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 border-t border-line pt-3 font-medium text-[0.75rem] tracking-[0.02em] text-muted">{intervalOf(z)}</p>
              </li>
            ))}
          </ul>
          <p className={stamp ? 'rf-stamp is-on' : 'rf-stamp'} aria-hidden={!stamp}>
            Kontrolliert nach Checkliste
          </p>
        </div>
      </div>
    </section>
  )
}
