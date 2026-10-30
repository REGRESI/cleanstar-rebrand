import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent as RPointerEvent } from 'react'
import { Briefcase, Check, Coffee, ConciergeBell, DoorOpen, Droplets, Footprints, Monitor, Presentation, RotateCcw, type LucideIcon } from 'lucide-react'
import { zones, freqLabel, type Zone } from '@/content/floorplan'
import { useReducedMotion } from '@/lib/env'
import { cn } from '@/lib/cn'

/**
 * Raum-Karten zum Anfassen (Seite Qualitätsgarantie, „Jeder Raum hat seine Checkliste.“): Je Raum aus dem Muster-
 * Leistungsverzeichnis eine Karte. Sie liegen als leicht aufgefächerter Stapel.
 * Desktop: Überfahren fächert weiter auf, die Karte unter der Maus hebt sich (Neigung zur Maus, weicher Schatten).
 * Klick: Die Karte fliegt groß in die Mitte und dreht sich um (vorne Raum, Symbol, Intervall; hinten die Checkliste,
 * deren Haken sich nacheinander setzen). Zweiter Klick oder Escape legt sie zurück.
 * Ziehen (Maus oder Finger): Karte vom Stapel ziehen und zur Seite werfen (federnd), die nächste liegt oben; „Stapel neu
 * mischen“ holt alle zurück. Handy: Wischen nach links oder rechts legt die oberste Karte weg, Tippen dreht sie um.
 * Tastatur: Pfeiltasten wechseln die oberste Karte, Enter dreht um. Alle Inhalte stehen zusätzlich als Liste im HTML.
 * Reduzierte Bewegung: Karten nebeneinander mit Checkliste.
 */
const ICONS: Record<string, LucideIcon> = {
  arbeitsplaetze: Monitor,
  besprechung: Presentation,
  kueche: Coffee,
  sanitaer: Droplets,
  flur: DoorOpen,
  empfang: ConciergeBell,
  einzelbueros: Briefcase,
  treppenhaus: Footprints,
}
const intervalOf = (z: Zone) => [...new Set(z.tasks.map((t) => freqLabel(t.freq, 'taeglich')))]

type Drag = { id: number; x0: number; y0: number; dx: number; dy: number; t: number; vx: number; moved: boolean }

export function RoomFan() {
  const reduced = useReducedMotion()
  const n = zones.length
  // Reihenfolge des Stapels: das letzte Element liegt oben
  const [order, setOrder] = useState<number[]>(() => zones.map((_, i) => n - 1 - i))
  const [gone, setGone] = useState<Record<number, number>>({})
  const [open, setOpen] = useState<number | null>(null)
  const [hover, setHover] = useState<{ id: number; rx: number; ry: number } | null>(null)
  const [spread, setSpread] = useState(false)
  const [drag, setDrag] = useState<Drag | null>(null)
  const dragRef = useRef<Drag | null>(null)

  const stack = order.filter((i) => gone[i] === undefined)
  const top = stack[stack.length - 1]

  const throwAway = useCallback((id: number, dir: number) => {
    setOpen(null)
    setGone((g) => ({ ...g, [id]: dir }))
  }, [])
  const reshuffle = () => {
    setOpen(null)
    setGone({})
    setOrder((o) => {
      const a = [...o]
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[a[i], a[j]] = [a[j], a[i]]
      }
      return a
    })
  }

  // Raum aus der Liste wählen: Karte nach oben holen und aufdecken
  const pick = (id: number) => {
    setGone((g) => {
      const rest = { ...g }
      delete rest[id]
      return rest
    })
    setOrder((o) => [...o.filter((i) => i !== id), id])
    setOpen(id)
  }

  // Escape legt die offene Karte zurück
  useEffect(() => {
    if (open === null) return
    const k = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(null)
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [open])

  const onKey = (e: React.KeyboardEvent) => {
    if (top === undefined) return
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault()
      setOpen(null)
      // oberste Karte nach unten bzw. unterste nach oben
      setOrder((o) => {
        const rest = o.filter((i) => gone[i] === undefined)
        const others = o.filter((i) => gone[i] !== undefined)
        const r = e.key === 'ArrowRight' ? [rest[rest.length - 1], ...rest.slice(0, -1)] : [...rest.slice(1), rest[0]]
        return [...others, ...r]
      })
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setOpen((o) => (o === top ? null : top))
    }
  }

  const down = (id: number, e: RPointerEvent<HTMLButtonElement>) => {
    if (open !== null ? id !== open : id !== top) return
    e.currentTarget.setPointerCapture(e.pointerId)
    const d = { id, x0: e.clientX, y0: e.clientY, dx: 0, dy: 0, t: e.timeStamp, vx: 0, moved: false }
    dragRef.current = d
    setDrag(d)
  }
  const move = (e: RPointerEvent<HTMLButtonElement>) => {
    const d = dragRef.current
    if (!d) return
    const dx = e.clientX - d.x0
    const dy = e.clientY - d.y0
    const dt = Math.max(1, e.timeStamp - d.t)
    const nd = { ...d, dx, dy, vx: (dx - d.dx) / dt, t: e.timeStamp, moved: d.moved || Math.hypot(dx, dy) > 8 }
    dragRef.current = nd
    if (nd.moved && open === null) setDrag(nd)
  }
  const up = (id: number) => {
    const d = dragRef.current
    dragRef.current = null
    setDrag(null)
    if (!d) return
    if (d.moved && open === null) {
      // weit oder schnell genug: zur Seite werfen, sonst federt die Karte zurück
      if (Math.abs(d.dx) > 110 || Math.abs(d.vx) > 0.6) throwAway(id, Math.sign(d.dx || d.vx) || 1)
      return
    }
    setOpen((o) => (o === id ? null : id))
  }

  const tilt = (id: number, e: RPointerEvent<HTMLButtonElement>) => {
    if (e.pointerType !== 'mouse' || dragRef.current) return
    const r = e.currentTarget.getBoundingClientRect()
    setHover({ id, rx: ((e.clientY - r.top) / r.height - 0.5) * -10, ry: ((e.clientX - r.left) / r.width - 0.5) * 12 })
  }

  if (reduced)
    return (
      <section className="section bg-paper" aria-labelledby="fan-title">
        <div className="container-site">
          <Heading />
          <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {zones.map((z) => (
              <li key={z.id} className="rf-static">
                <CardBack z={z} on />
              </li>
            ))}
          </ul>
        </div>
      </section>
    )

  return (
    <section className="section-tight overflow-x-clip bg-paper lg:pt-0 lg:pb-4" aria-labelledby="fan-title">
      <div className="container-site grid-site gap-y-10 lg:items-center">
        <div className="col-span-12 lg:col-span-5">
          <Heading />
          <p className="mt-6 max-w-[34ch] text-ink-2">Klicken oder tippen Sie eine Karte an, um die Prüfpunkte zu sehen. Ziehen Sie eine Karte zur Seite, liegt die nächste oben.</p>
          <button type="button" className="tlink mt-8 inline-flex items-center gap-2" onClick={reshuffle}>
            <RotateCcw className="size-4" aria-hidden />
            Stapel neu mischen
          </button>
          {/* Desktop: alle Räume auf einen Blick, ein Klick holt die Karte nach oben und dreht sie um */}
          <ul className="mt-12 hidden max-w-[30rem] flex-wrap gap-2.5 lg:flex" aria-hidden>
            {zones.map((z, i) => (
              <li key={z.id}>
                <button type="button" tabIndex={-1} onClick={() => pick(i)} className={cn('rf-pick', open === i && 'is-on')}>
                  {z.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="col-span-12 lg:col-span-7">
          <div
            className={cn('rf-stage', spread && 'is-spread', open !== null && 'is-open')}
            role="group"
            aria-label="Raum-Karten: Pfeiltasten wechseln die oberste Karte, Enter dreht sie um"
            tabIndex={0}
            onKeyDown={onKey}
            onPointerEnter={(e) => e.pointerType === 'mouse' && setSpread(true)}
            onPointerLeave={() => {
              setSpread(false)
              setHover(null)
            }}
          >
            {open !== null && <button type="button" tabIndex={-1} aria-label="Karte zurücklegen" className="rf-backdrop" onClick={() => setOpen(null)} />}
            {order.map((id) => {
              const z = zones[id]
              const k = stack.indexOf(id)
              const isGone = gone[id] !== undefined
              const isOpen = open === id
              const isDrag = drag?.id === id && drag.moved
              const fromTop = stack.length - 1 - k
              const mid = (stack.length - 1) / 2
              const fan = spread ? 6.5 : 2.4
              const step = spread ? 30 : 7
              const h = hover?.id === id && !isOpen && !isGone
              let style: CSSProperties
              if (isGone) style = { '--x': `${gone[id] * 130}%`, '--y': '-6%', '--r': `${gone[id] * 24}deg`, '--s': '0.9', opacity: 0, zIndex: 1 } as CSSProperties
              else if (isOpen) style = { '--x': '0px', '--y': '-3%', '--r': '0deg', '--s': 'var(--open-s)', zIndex: 60 } as CSSProperties
              else if (isDrag && drag) style = { '--x': `${drag.dx}px`, '--y': `${drag.dy * 0.5}px`, '--r': `${drag.dx * 0.06}deg`, '--s': '1.03', zIndex: 50, transition: 'none' } as CSSProperties
              else
                style = {
                  '--x': `${(k - mid) * step}px`,
                  '--y': `${fromTop * (spread ? 2 : 5) - (h ? 26 : 0)}px`,
                  '--r': `${(k - mid) * fan}deg`,
                  '--s': h ? '1.04' : '1',
                  '--rx': h ? `${hover.rx}deg` : '0deg',
                  '--ry': h ? `${hover.ry}deg` : '0deg',
                  zIndex: 10 + k,
                } as CSSProperties
              const Icon = ICONS[z.id] ?? Monitor
              return (
                <button
                  key={z.id}
                  type="button"
                  className={cn('rf-card', isOpen && 'is-open', h && 'is-lift', isGone && 'is-gone')}
                  style={style}
                  tabIndex={-1}
                  aria-hidden={isGone || (id !== top && !isOpen)}
                  aria-pressed={isOpen}
                  aria-label={`${z.name}: Checkliste ${isOpen ? 'schließen' : 'anzeigen'}`}
                  onPointerDown={(e) => down(id, e)}
                  onPointerMove={(e) => {
                    move(e)
                    tilt(id, e)
                  }}
                  onPointerUp={() => up(id)}
                  onPointerCancel={() => {
                    dragRef.current = null
                    setDrag(null)
                  }}
                  onPointerLeave={() => setHover((v) => (v?.id === id ? null : v))}
                >
                  <span className="rf-inner">
                    <span className="rf-face rf-front">
                      <Icon className="size-10 text-blue" strokeWidth={1.4} aria-hidden />
                      <span className="mt-auto block text-[1.5rem] leading-tight font-medium tracking-[-0.02em] text-ink">{z.name}</span>
                      <span className="mt-3 flex flex-wrap gap-1.5">
                        {intervalOf(z).map((f) => (
                          <span key={f} className="rf-chip">
                            {f}
                          </span>
                        ))}
                      </span>
                      <span className="rf-hint">{z.tasks.length} Prüfpunkte · antippen</span>
                    </span>
                    <span className="rf-face rf-back">
                      <CardBack z={z} on={isOpen} />
                    </span>
                  </span>
                </button>
              )
            })}
            {stack.length === 0 && (
              <div className="rf-empty">
                <p className="text-ink-2">Alle Karten liegen zur Seite.</p>
                <button type="button" className="btn btn-primary mt-5" onClick={reshuffle}>
                  Stapel neu mischen
                </button>
              </div>
            )}
          </div>
          {/* Dieselben Inhalte als Liste (Screenreader, Suchmaschinen) */}
          <div className="sr-only">
            {zones.map((z) => (
              <div key={z.id}>
                <h3>{z.name}</h3>
                <ul>
                  {z.tasks.map((t) => (
                    <li key={t.task}>
                      {t.task}, {freqLabel(t.freq, 'taeglich')}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function Heading() {
  return (
    <>
      <p className="t-label">Prüfpunkte je Raum</p>
      <h2 id="fan-title" className="t-h2 mt-5 max-w-[14ch]">
        Jeder Raum hat seine Checkliste.
      </h2>
    </>
  )
}

/** Rückseite: Checkliste, die Haken setzen sich nacheinander, sobald die Karte offen ist */
function CardBack({ z, on }: { z: Zone; on: boolean }) {
  return (
    <span className={cn('block', on && 'is-on')}>
      <span className="block text-[1.125rem] font-medium tracking-[-0.015em] text-ink">{z.name}</span>
      <span className="mt-3 block space-y-2">
        {z.tasks.map((t, i) => (
          <span key={t.task} className="rf-check flex gap-2.5 text-[0.8125rem] leading-[1.3] text-ink-2" style={{ '--i': i } as CSSProperties}>
            <span className="rf-tick mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-blue text-white">
              <Check className="size-3" strokeWidth={2.75} aria-hidden />
            </span>
            <span>
              {t.task}
              <span className="block text-[0.6875rem] text-muted">{freqLabel(t.freq, 'taeglich')}</span>
            </span>
          </span>
        ))}
      </span>
    </span>
  )
}
