import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { hq, places as locations, shortName, type Place as Location } from '@/content/places'
import { cn } from '@/lib/cn'
import { proj, OUTLINE, RHINE, toPath, VB } from './schematic'
import type { MapApi } from './LiveMap'

const LiveMap = lazy(() => import('./LiveMap'))

/**
 * Einzugsgebiet: echte Karte (MapLibre, selbst gehostete Kacheln) mit Ortsliste daneben.
 * Bis die Karte geladen ist (und ohne JavaScript) steht an ihrer Stelle eine schematische Karte mit Links bzw. auf der
 * Startseite ein Standbild der Geländekarte (die Orte sind dann über die Liste daneben erreichbar).
 * Die Karte lädt erst, wenn sie in die Nähe des sichtbaren Bereichs kommt.
 */
export function AreaMap({ className, still }: { className?: string; /** Platzhalter als Standbild der Geländekarte statt der schematischen Karte (Startseite) */ still?: boolean }) {
  const navigate = useNavigate()
  const frame = useRef<HTMLDivElement>(null)
  const api = useRef<MapApi | null>(null)
  const [load, setLoad] = useState(false)
  const [ready, setReady] = useState(false)
  const [active, setActive] = useState<{ p: Location; xy: [number, number] | null } | null>(null)

  useEffect(() => {
    const el = frame.current
    if (!el) return
    // Die echte Karte erst laden, wenn sie in der Nähe des sichtbaren Bereichs ist UND der Besuch interagiert
    // (Scrollen, Zeiger, Tippen, Taste). So blockiert MapLibre nicht den ersten Seitenaufbau.
    let near = false
    let active = false
    const go = () => near && active && (setLoad(true), cleanup())
    const io = new IntersectionObserver(([e]) => ((near = e.isIntersecting), go()), { rootMargin: '400px' })
    const EVENTS = ['pointermove', 'pointerdown', 'touchstart', 'wheel', 'keydown', 'scroll'] as const
    const onUse = () => ((active = true), go())
    EVENTS.forEach((t) => addEventListener(t, onUse, { passive: true, once: true }))
    function cleanup() {
      io.disconnect()
      EVENTS.forEach((t) => removeEventListener(t, onUse))
    }
    io.observe(el)
    return cleanup
  }, [])

  const open = (p: Location) => {
    // Orte mit eigener Seite öffnen diese; die übrigen zeigen nach dem Flug Name und Fahrzeit in der Kartenmitte
    if (p.page) return navigate(`/einzugsgebiet/${p.slug}`)
    const r = frame.current?.getBoundingClientRect()
    setActive({ p, xy: r ? [r.width / 2, r.height / 2] : null })
  }
  const [HX, HY] = proj(hq.lat, hq.lng)

  return (
    <div className={cn('grid grid-cols-1 gap-x-8 gap-y-12 lg:grid-cols-12 lg:items-start', className)}>
      <div className="lg:col-span-8">
        <div
          ref={frame}
          className="card-shadow relative aspect-square overflow-hidden rounded-[14px] bg-paper sm:aspect-[4/3]"
          role="region"
          aria-label="Karte des Einzugsgebiets im Ortenaukreis"
        >
          {/* Platzhalter: Standbild der Geländekarte (Startseite) bzw. schematische Karte, bis die echte Karte steht */}
          {still && (
            <img
              src="/images/karte-ortenau-1328.webp"
              srcSet="/images/karte-ortenau-800.webp 800w, /images/karte-ortenau-1328.webp 1328w"
              sizes="(min-width: 1024px) 60vw, 100vw"
              alt=""
              width={1329}
              height={998}
              loading="lazy"
              decoding="async"
              className={cn('absolute inset-0 size-full object-cover transition-opacity duration-500', ready && 'opacity-0')}
            />
          )}
          <svg
            viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`}
            className={cn('absolute inset-0 m-auto h-full w-auto transition-opacity duration-500', (ready || still) && 'opacity-0', still && 'invisible')}
            aria-hidden={ready || undefined}
          >
            <path d={toPath(RHINE, false)} fill="none" stroke="#bccbdb" strokeWidth="2.5" strokeLinecap="round" />
            <path d={toPath(OUTLINE)} fill="var(--color-paper)" stroke="var(--color-ink)" strokeOpacity="0.4" strokeWidth="1" />
            {locations.map((l) => {
              const [x, y] = proj(l.lat, l.lng)
              // Steht die echte Karte (oder hat der Ort keine eigene Seite), sind die Punkte nur Bild
              if (ready || !l.page) return <circle key={l.slug} cx={x} cy={y} r={l.major ? 4 : 3} fill="var(--color-blue)" />
              return (
                <a
                  key={l.slug}
                  href={`/einzugsgebiet/${l.slug}/`}
                  aria-label={`${l.name}: ca. ${l.minutes} Minuten von Offenburg`}
                  onClick={(e) => {
                    // Mit JavaScript ohne Neuladen der Seite (ohne JavaScript bleibt es ein normaler Link)
                    if (e.metaKey || e.ctrlKey || e.shiftKey) return
                    e.preventDefault()
                    open(l)
                  }}
                >
                  <circle cx={x} cy={y} r={l.major ? 4 : 3} fill="var(--color-blue)" />
                </a>
              )
            })}
            <circle cx={HX} cy={HY} r="12" fill="none" stroke="var(--color-blue)" strokeWidth="1" />
          </svg>
          {load && (
            <Suspense fallback={null}>
              <LiveMap api={api} onReady={() => setReady(true)} onOpen={open} onHover={(p, xy) => setActive(p ? { p, xy } : null)} />
            </Suspense>
          )}
          {/* Hinweis beim Überfahren: Name und Fahrzeit */}
          <div aria-live="polite" className="pointer-events-none absolute inset-0">
            {active?.xy && (
              <div className="map-tip" style={{ left: active.xy[0], top: active.xy[1] }}>
                <p className="text-[1rem] font-medium text-ink">{active.p.name}</p>
                <p className="font-medium tabular-nums text-[0.75rem] text-muted">{active.p.minutes === 0 ? 'Unser Sitz' : `ca. ${active.p.minutes} Min. ab Offenburg`}</p>
              </div>
            )}
          </div>
        </div>
        <p className="caption">Klicken Sie auf einen Ort. Fahrzeiten sind ungefähre Richtwerte mit dem Auto.</p>
      </div>

      <div className="lg:col-span-4">
        <p className="t-label mb-4">{locations.length} Orte · Fahrzeit ab Offenburg</p>
        <ul className="grid grid-cols-2 gap-x-4 border-t border-line min-[380px]:gap-x-6 lg:grid-cols-1 xl:grid-cols-2">
          {locations.map((l) => {
            const on = active?.p.slug === l.slug
            const inner = (
              <>
                <span>{shortName(l)}</span>
                <span className={cn('shrink-0 font-medium tabular-nums text-[0.75rem]', on ? 'text-blue' : 'text-muted')}>{l.minutes === 0 ? 'Sitz' : `${l.minutes} Min.`}</span>
              </>
            )
            const cls = cn('flex w-full items-baseline justify-between gap-x-3 py-2.5 text-left text-[0.9375rem] transition-colors', on ? 'text-blue' : 'text-ink')
            const hover = {
              onMouseEnter: () => api.current?.highlight(l.slug),
              onMouseLeave: () => api.current?.highlight(null),
              onFocus: () => api.current?.highlight(l.slug),
              onBlur: () => api.current?.highlight(null),
            }
            const flyTo = (e: { preventDefault: () => void }) => {
              // Mit geladener Karte: erst der Vogelflug, dann die Ortsseite (bzw. Name und Fahrzeit)
              if (!api.current) return false
              e.preventDefault()
              // Karte erst ins Bild holen, wenn sie kaum sichtbar ist; der Flug startet danach
              const r = frame.current?.getBoundingClientRect()
              const visible = r ? Math.min(r.bottom, innerHeight) - Math.max(r.top, 0) > r.height * 0.6 : true
              if (!visible) frame.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
              window.setTimeout(() => api.current?.fly(l), visible ? 0 : 700)
              return true
            }
            return (
              <li key={l.slug} id={`ort-${l.slug}`} className="scroll-mt-28 border-b border-line">
                {l.page ? (
                  <Link
                    to={`/einzugsgebiet/${l.slug}`}
                    {...hover}
                    onClick={(e) => {
                      if (e.metaKey || e.ctrlKey || e.shiftKey) return
                      flyTo(e)
                    }}
                    className={cls}
                  >
                    {inner}
                  </Link>
                ) : (
                  // Ort ohne eigene Seite: Karte fliegt hin und zeigt Name und Fahrzeit
                  <button type="button" {...hover} onClick={(e) => flyTo(e) || setActive({ p: l, xy: null })} className={cls} aria-label={`${shortName(l)} ${l.minutes === 0 ? "Sitz" : `${l.minutes} Min.`}, ab Offenburg, auf der Karte zeigen`}>
                    {inner}
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
