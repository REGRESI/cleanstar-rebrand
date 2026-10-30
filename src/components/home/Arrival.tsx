import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import type { ImageId } from '@/content/images'
import { MomentHeading, MomentGlow } from '@/components/ui/MomentHeading'
import { Picture } from '@/components/ui/Picture'
import { home } from '@/content/site'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { prefersReducedMotion } from '@/lib/env'
import { span } from '@/lib/scrollScene'

/**
 * Übergang A „Kreis mit Titel“ (Referenz: ERA, era/07): direkt nach dem Hero. Der Abschnitt selbst wird über eine
 * wachsende Kreis-Maske von unten Mitte freigelegt, über dem letzten Hero-Bild (Büro am Morgen). Was im Kreis zu sehen
 * ist, ist schon der echte Inhalt: Die Moment-Überschrift sitzt im Kreis und fährt mit ihm hoch, an der Kreiskante
 * läuft klein „Büroreinigung im Ortenaukreis“. Ist der Kreis voll, rutscht der Titel an seinen Platz, Satz und
 * versetzte Bilder erscheinen. Scrollweg etwa 120 % der Bildschirmhöhe. Nie eine leere Fläche: Vorher ist das Bild
 * zu sehen, dann Bild und Kreis mit Titel.
 * Reduzierte Bewegung oder ohne JavaScript: normaler Abschnitt ohne Maske.
 */
export function Arrival({
  title = 'Wir kommen,\nwenn Sie gehen.',
  edge: EDGE = 'BÜROREINIGUNG IM ORTENAUKREIS',
  image,
  id = 'arrive-title',
  children,
}: {
  title?: string
  /** Satz an der Kreiskante (Versalien) */
  edge?: string
  /** Unterseiten: Foto, über dem der Kreis aufsteigt; ohne: das letzte Bild des Heros (Startseite, überlappt den Hero) */
  image?: ImageId
  id?: string
  /** Inhalt unter der Überschrift; ohne: Satz und versetzte Bilder der Startseite */
  children?: ReactNode
}) {
  const overlap = !image
  const run = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const layer = useRef<HTMLDivElement>(null)
  const titleEl = useRef<HTMLDivElement>(null)
  const rest = useRef<HTMLDivElement>(null)
  const track = useRef<SVGPathElement>(null)
  const label = useRef<SVGTextElement>(null)
  const svg = useRef<SVGSVGElement>(null)
  const [play, setPlay] = useState(false)
  const [still, setStill] = useState(false)
  const pid = `arr${useId().replace(/:/g, '')}`

  useEffect(() => {
    const el = run.current
    if (!el) return
    if (prefersReducedMotion() || !document.documentElement.classList.contains('js-motion')) {
      setStill(true)
      setPlay(true)
      return
    }
    let played = false
    const apply = (t: number) => {
      const st = layer.current
      if (!st || !titleEl.current || !rest.current) return
      const W = st.clientWidth
      const H = st.clientHeight
      // Mittelpunkt unter der Unterkante (k · r); Endradius deckt auch die oberen Ecken
      const k = 0.3
      const a = 1 - k * k
      const end = (2 * k * H + Math.sqrt(4 * k * k * H * H + 4 * a * (H * H + (W * W) / 4))) / (2 * a)
      const e = Math.min(1, t / 0.78)
      const r = end * 1.02 * (1 - Math.pow(1 - e, 2))
      const cy = H + k * r
      st.style.clipPath = t >= 0.999 ? 'none' : `circle(${r.toFixed(1)}px at 50% ${cy.toFixed(1)}px)`
      // Titel fährt mit der Kreisoberkante hoch und bleibt an seinem Platz stehen
      const top = cy - r
      const finalTop = H * (W < 768 ? 0.13 : 0.15)
      const y = Math.max(finalTop, top + H * 0.1)
      titleEl.current.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0)`
      if (!played && t > 0.08) {
        played = true
        setPlay(true)
      }
      // Rest erscheint, wenn der Kreis voll ist
      const c = span(t, 0.74, 0.96)
      rest.current.style.opacity = String(c)
      rest.current.style.transform = `translate3d(0, ${((1 - c) * 40).toFixed(1)}px, 0)`
      // Satz an der Kreiskante (innen), solange der Kreis wächst
      if (svg.current && track.current && label.current) {
        svg.current.setAttribute('viewBox', `0 0 ${W} ${H}`)
        const rt = Math.max(1, r - (W < 768 ? 26 : 34))
        track.current.setAttribute('d', `M ${W / 2 - rt} ${cy} A ${rt} ${rt} 0 1 1 ${W / 2 + rt} ${cy} A ${rt} ${rt} 0 1 1 ${W / 2 - rt} ${cy}`)
        const chord = 2 * Math.sqrt(Math.max(0, rt * rt - (k * r) ** 2))
        const need = EDGE.length * (W < 768 ? 9 : 11)
        label.current.setAttribute('opacity', String(Math.min(1, Math.max(0, (chord - need) / 140)) * (1 - span(t, 0.55, 0.72))))
      }
    }
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.35,
      animation: gsap.to({}, { duration: 1 }),
      onUpdate: (s) => apply(s.progress),
      onRefresh: (s) => {
        apply(s.progress)
        show(s.scroll() >= s.start)
      },
      // Die Bühne überlappt das Ende des gepinnten Heros: erst sichtbar, wenn sie genau dort steht (gleiches Bild)
      onEnter: () => show(true),
      onLeaveBack: () => show(false),
    })
    function show(on: boolean) {
      if (stage.current) stage.current.style.visibility = on || !overlap ? 'visible' : 'hidden'
    }
    apply(st.progress)
    show(st.scroll() >= st.start)
    return () => st.kill()
  }, [EDGE.length, overlap])

  return (
    <section className={overlap ? 'arrive is-overlap relative' : 'arrive relative'} aria-labelledby={id} data-tone="surface">
      <div ref={run} className="arrive-run">
        <div ref={stage} className="arrive-stage sticky top-0 h-[100svh] overflow-hidden">
          {/* Hintergrund: das letzte Bild des Heros (Navy mit Bildfenster, wie dort) */}
          {!still && image && (
            <div aria-hidden className="photo absolute inset-0">
              <Picture id={image} aspect="absolute inset-0 size-full" sizes="100vw" />
            </div>
          )}
          {!still && !image && (
            <div aria-hidden className="absolute inset-0 bg-night">
              <div className="hero-box is-pinned photo absolute overflow-hidden">
                <picture>
                  <source media="(max-width: 767px)" srcSet="/hero/key-morgen-p.jpg" />
                  <img src="/hero/key-morgen-d.jpg" alt="" width={1918} height={1080} loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover" />
                </picture>
              </div>
            </div>
          )}

          {/* Der Abschnitt selbst, freigelegt durch die Kreis-Maske */}
          <div ref={layer} className="absolute inset-0 bg-surface" style={still ? undefined : { clipPath: 'circle(0px at 50% 100%)' }}>
            <MomentGlow />
            <svg ref={svg} aria-hidden className="pointer-events-none absolute inset-0 size-full">
              <path ref={track} id={pid} fill="none" />
              <text ref={label} className="circle-text" fill="#0b1220" opacity="0">
                <textPath href={`#${pid}`} startOffset="25%" textAnchor="middle">
                  {EDGE}
                </textPath>
              </text>
            </svg>
            <div ref={titleEl} className="absolute inset-x-0 top-0 will-change-transform" style={still ? { transform: 'translate3d(0, 15svh, 0)' } : undefined}>
              <div className="container-site text-center">
                <MomentHeading id={id} text={title} play={play} vanish={false} className="mx-auto w-fit" />
              </div>
            </div>
            <div ref={rest} className="absolute inset-x-0 bottom-0 top-[44svh] sm:top-[46svh]" style={still ? undefined : { opacity: 0 }}>
              {children ?? (
                <div className="container-site grid h-full grid-cols-12 gap-x-5 lg:gap-x-8">
                  <p className="t-lead col-span-12 text-center text-ink-2 sm:col-span-10 sm:col-start-2 lg:col-span-6 lg:col-start-4">{home.promise.statement}</p>
                  <div className="arrive-cards col-span-12 mt-6 lg:col-span-10 lg:col-start-2">
                    <div className="card-shadow arrive-card overflow-hidden rounded-[10px]">
                      <Picture id="evening-clean" aspect="size-full" sizes="(min-width:1024px) 34vw, 60vw" />
                    </div>
                    <div className="card-shadow arrive-card overflow-hidden rounded-[10px]">
                      <Picture id="team-work" aspect="size-full" sizes="(min-width:1024px) 30vw, 55vw" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
