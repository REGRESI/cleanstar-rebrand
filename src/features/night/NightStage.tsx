import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { prefersReducedMotion } from '@/lib/env'
import { jumpTo } from '@/lib/smooth-scroll'
import { PHASES, clockLabel, sceneLines, sceneZones, span } from './timeline'
import type { NightWorld, Quality } from './world'

/**
 * Bühne der Signatur-Szene: langer Scrollweg, darin eine stehende Bühne mit der 3D-Szene, dem Nacht-Lineal und den
 * Zeilen. Alle Texte stehen als echtes HTML im Dokument (Suchmaschinen, Screenreader); die Szene ist Dekoration.
 *
 * - LCP: Unter der Szene liegt ein beim Build gerendertes Standbild der Startposition. Die Szene blendet darüber ein,
 *   sobald das erste Bild gezeichnet ist (kein Sprung, CLS 0). Der 3D-Code lädt erst danach (eigener Chunk).
 * - Geräte ohne WebGL2, Software-Rendering oder zu langsame erste Bilder: Standbilder statt Szene.
 * - Reduzierte Bewegung: keine Szene, vier Standbilder (18:00, Reinigung, Kontrolle, 7:00) als ruhige Abfolge.
 * - Läuft nur, solange die Bühne im Bild und der Tab sichtbar ist.
 */

export const STILLS = [
  { id: 'start', p: 0.02, label: '18:00' },
  { id: 'clean', p: 0.38, label: '20:30' },
  { id: 'check', p: 0.79, label: '21:45' },
  { id: 'morning', p: 0.985, label: '7:00' },
] as const

const WIDTHS = [960, 1600, 2400]

function Still({ id, className, priority }: { id: string; className?: string; priority?: boolean }) {
  return (
    <picture className={cn('block size-full', className)}>
      <source media="(max-width: 767px)" srcSet={`/night/${id}-m-780.webp`} />
      <img
        src={`/night/${id}-d-1600.webp`}
        srcSet={WIDTHS.map((w) => `/night/${id}-d-${w}.webp ${w}w`).join(', ')}
        sizes="100vw"
        alt=""
        width={1600}
        height={900}
        fetchPriority={priority ? 'high' : undefined}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className="size-full object-cover"
      />
    </picture>
  )
}

type Mode = 'loading' | 'scene' | 'stills'

export function NightStage({ intro, outro, onSkipTo = 'nach-der-nacht' }: { intro: ReactNode; outro: ReactNode; onSkipTo?: string }) {
  const outer = useRef<HTMLElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const world = useRef<NightWorld | null>(null)
  const [mode, setMode] = useState<Mode>('loading')
  const [p, setP] = useState(0)
  const [shown, setShown] = useState(false)
  const still = useRef<number | null>(null)

  useEffect(() => {
    // Standbild-Modus für die Build-Aufnahmen: ?still=0.47 zeigt genau diesen Moment ohne Texte
    const q = new URLSearchParams(location.search).get('still')
    still.current = q === null ? null : Number(q)
    if (prefersReducedMotion() && still.current === null) return setMode('stills')
    const gl2 = document.createElement('canvas').getContext('webgl2')
    if (!gl2) return setMode('stills')
    const info = gl2.getExtension('WEBGL_debug_renderer_info')
    const gpu = info ? String(gl2.getParameter(info.UNMASKED_RENDERER_WEBGL)) : ''
    const software = /swiftshader|llvmpipe|software|basic render/i.test(gpu)
    if (software && still.current === null && !new URLSearchParams(location.search).has('force')) return setMode('stills')
    const mobile = window.matchMedia('(max-width: 767px)').matches
    const cores = navigator.hardwareConcurrency ?? 8
    const quality: Quality = mobile || cores <= 4 ? 'low' : 'high'

    let disposed = false
    let raf = 0
    let visible = true
    let last = performance.now()
    let frames = 0
    let slow = 0
    let target = still.current ?? 0
    let cur = target
    let w: NightWorld | null = null

    // Erst nach dem LCP (Standbild) laden: im Leerlauf bzw. nach dem load-Ereignis
    const start = () =>
      import('./world').then(({ NightWorld }) => {
        if (disposed || !canvas.current) return
        w = new NightWorld(canvas.current, { mobile, quality: still.current !== null && !mobile ? 'high' : quality })
        world.current = w
        const fit = () => {
          const r = canvas.current!.parentElement!.getBoundingClientRect()
          w!.resize(Math.round(r.width), Math.round(r.height))
        }
        fit()
        window.addEventListener('resize', fit)
        setMode('scene')
        const tick = (now: number) => {
          raf = requestAnimationFrame(tick)
          if (!visible || document.hidden) return (last = now)
          const dt = Math.min(0.1, (now - last) / 1000)
          last = now
          if (still.current === null) {
            const el = outer.current!
            const r = el.getBoundingClientRect()
            target = span(-r.top, 0, r.height - innerHeight)
            // ruhig nachziehen: jede Bewegung weich
            cur += (target - cur) * Math.min(1, dt * 5)
            if (Math.abs(target - cur) < 0.0002) cur = target
          } else cur = still.current
          w!.setProgress(cur)
          w!.render(dt)
          setP((x) => (Math.abs(x - cur) > 0.0015 ? cur : x))
          // Messung der ersten Bilder: zu langsam → Standbilder (außer im Aufnahme-Modus)
          frames++
          if (frames === 2) setShown(true)
          // Aufnahme-Modus: nach wenigen Bildern stehen bleiben (das Bild bleibt im Canvas)
          if (still.current !== null && frames >= 4) {
            cancelAnimationFrame(raf)
            const win = window as Window & { __nightReady?: boolean; __nightP?: (v: number) => Promise<void> }
            // Aufnahmen (Standbilder, Video): einen bestimmten Moment zeichnen, ohne Scroll
            win.__nightP = (v) =>
              new Promise((done) => {
                still.current = v
                w!.setProgress(v)
                w!.render(1 / 30)
                setP(v)
                requestAnimationFrame(() => requestAnimationFrame(() => done()))
              })
            win.__nightReady = true
            return
          }
          if (frames > 10 && frames < 70 && dt > 0.045) slow++
          if (frames === 70 && slow > 30 && still.current === null) {
            cancelAnimationFrame(raf)
            setMode('stills')
          }
        }
        raf = requestAnimationFrame(tick)
        cleanupFns.push(() => window.removeEventListener('resize', fit))
      })
    const cleanupFns: (() => void)[] = []
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { rootMargin: '200px' })
    if (outer.current) io.observe(outer.current)
    if (document.readyState === 'complete') start()
    else window.addEventListener('load', () => start(), { once: true })

    // Zeiger und Tippen
    const stage = outer.current?.querySelector<HTMLElement>('[data-stage]')
    const move = (e: PointerEvent) => {
      if (!stage || e.pointerType !== 'mouse') return
      const r = stage.getBoundingClientRect()
      world.current?.pointer(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1), true)
    }
    const leave = () => world.current?.pointer(0, 0, false)
    const down = (e: PointerEvent) => {
      if (!stage || e.pointerType === 'mouse') return
      const r = stage.getBoundingClientRect()
      world.current?.tap(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1))
    }
    stage?.addEventListener('pointermove', move)
    stage?.addEventListener('pointerleave', leave)
    stage?.addEventListener('pointerdown', down)
    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      io.disconnect()
      cleanupFns.forEach((f) => f())
      stage?.removeEventListener('pointermove', move)
      stage?.removeEventListener('pointerleave', leave)
      stage?.removeEventListener('pointerdown', down)
      w?.dispose()
      world.current = null
    }
  }, [])

  // Standbild-Modus (reduzierte Bewegung, kein WebGL2): Scrollfortschritt nur für die Abfolge der Bilder
  useEffect(() => {
    if (mode !== 'stills') return
    const on = () => {
      const r = outer.current!.getBoundingClientRect()
      setP(span(-r.top, 0, r.height - innerHeight))
    }
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [mode])

  // Aufnahme ohne Texte (Standbilder) bzw. mit Texten (?text, für das Video)
  const capture = still.current !== null && !(typeof location !== 'undefined' && new URLSearchParams(location.search).has('text'))
  const skip = () => {
    const el = document.getElementById(onSkipTo)
    if (el) jumpTo(el.getBoundingClientRect().top + scrollY - 64)
  }
  const stillIndex = p < 0.3 ? 0 : p < 0.72 ? 1 : p < 0.84 ? 2 : 3
  const lineAt = (a: number, b: number) => ({ opacity: Math.min(span(p, a, a + 0.015), 1 - span(p, b - 0.015, b)) }) as CSSProperties

  return (
    <section ref={outer} className="night" aria-labelledby="night-title">
      <div className="night-stage" data-stage>
        {/* LCP: Standbild der Startposition, darüber blendet die Szene ein */}
        <div className="absolute inset-0">
          {mode === 'stills' ? (
            STILLS.map((s, i) => (
              <div key={s.id} className={cn('absolute inset-0 transition-opacity duration-1000', i === stillIndex ? 'opacity-100' : 'opacity-0')}>
                <Still id={s.id} priority={i === 0} />
              </div>
            ))
          ) : (
            <Still id="start" priority />
          )}
        </div>
        <canvas ref={canvas} aria-hidden className={cn('absolute inset-0 size-full transition-opacity duration-700', shown && mode === 'scene' ? 'opacity-100' : 'opacity-0')} />

        {!capture && (
          <>
            {/* Einstieg: Hero-Text, verschwindet beim ersten Scrollen */}
            <div className="night-intro" style={{ opacity: 1 - span(p, 0.015, 0.06) }}>
              {intro}
            </div>

            {/* Nacht-Lineal: eine Zeitquelle für alles */}
            <div className="night-ruler" aria-hidden>
              <span className="night-ruler-time tabular-nums">{clockLabel(p)}</span>
              <span className="night-ruler-track">
                <span className="night-ruler-fill" style={{ transform: `scaleY(${p})` }} />
              </span>
              <span className="night-ruler-ends">
                <span>18:00</span>
                <span>7:00</span>
              </span>
            </div>

            {/* Zeilen je Phase und je Zone (vollständig im HTML, sichtbar nur in ihrer Phase) */}
            <ol className="night-lines">
              <li style={lineAt(0.04, PHASES.dusk[1])}>
                <span className="t-label">{sceneLines.dusk.time}</span>
                <strong>{sceneLines.dusk.title}</strong> {sceneLines.dusk.text}
              </li>
              <li style={lineAt(PHASES.leave[0], PHASES.leave[1])}>
                <span className="t-label">{sceneLines.leave.time}</span>
                <strong>{sceneLines.leave.title}</strong> {sceneLines.leave.text}
              </li>
              <li style={lineAt(PHASES.arrive[0], PHASES.arrive[1])}>
                <span className="t-label">{sceneLines.arrive.time}</span>
                <strong>{sceneLines.arrive.title}</strong> {sceneLines.arrive.text}
              </li>
              {sceneZones.map((z) => (
                <li key={z.id} style={lineAt(z.start, z.end)}>
                  <span className="t-label">{clockLabel(z.start + 0.01)}</span>
                  <strong>{z.name}.</strong> {z.line}
                </li>
              ))}
              <li style={lineAt(0.745, PHASES.check[1])}>
                <span className="t-label">{sceneLines.check.time}</span>
                <strong>{sceneLines.check.title}</strong> {sceneLines.check.text}
              </li>
            </ol>

            {/* 7:00: Headline und Haupt-CTA */}
            <div className="night-outro" style={{ opacity: span(p, 0.935, 0.975), pointerEvents: p > 0.94 ? 'auto' : 'none' }}>
              {outro}
            </div>

            <button type="button" onClick={skip} className="night-skip" style={{ opacity: p < 0.93 ? 1 : 0 }}>
              Überspringen
            </button>
          </>
        )}
      </div>
    </section>
  )
}
