import { useEffect, useRef, useState, type ReactNode } from 'react'
import hero from 'virtual:hero-frames'
import { AnimatedText, TypeText, type TypeHandle } from '@/components/ui/AnimatedText'
import { Sparkle } from '@/components/ui/Sparkle'
import { QuoteButton } from '@/features/configurator/QuoteLink'
import { heroCheckpoints } from '@/features/hero/checkpoints'
import { LineSwap, type LineSwapHandle } from '@/features/lines/LineSwap'
import { home } from '@/content/site'
import { company } from '@/content/company'
import { useIsMobile, useReducedMotion } from '@/lib/env'
import { setHeroVisible } from '@/lib/heroVisibility'
import { onIdle } from '@/lib/idle'
import { span } from '@/lib/scrollScene'
import { cn } from '@/lib/cn'
import { useHeroSequence } from './useHeroSequence'
import { GLINTS } from './glints'

/**
 * Hero „Das Büro zerfällt zu Staub und wird zum Plan“ (Referenz: Terminal). Gepinnt über etwa 4,6 Bildschirmhöhen:
 *  1 Start       Büro am Abend, Headline und Buttons
 *  2 Feierabend  Frame-Sequenz läuft bis zum Büro am Abend. Getippt: „Wenn Ihr Team geht,“
 *  3 Staub       Lichtkante zieht durchs Bild, dahinter zerfallen die Pixel zu Partikeln. „kommen wir.“
 *  4 Plan        Linienzeichnung desselben Büros, nummerierte Prüfpunkte haken sich ab. „Raum für Raum, nach Checkliste.“
 *  5 Morgen      Partikel setzen sich zum Morgenbild zusammen, Glanz-Stern. „Und morgen früh ist alles bereit.“
 *  6             Kreis-Übergang in die Leistungen
 * WebGL2 (features/hero/dust.ts) nach dem Laden über dem normalen Startbild (LCP). Ohne WebGL2 oder auf schwachen
 * Geräten: dieselbe Abfolge mit Überblendungen (Plan und Morgen decken sich hinter der Lichtkante auf).
 * Reduzierte Bewegung oder Datensparmodus: kein Pin, vier Standbilder mit den Sätzen untereinander.
 */

const MOBILE = '(max-width: 767px)'
const FRAME_W = 1918
const FRAME_H = 1080
const RATIO = FRAME_W / FRAME_H

/** Zeitplan im Scrollfortschritt p (0 bis 1) */
const T = {
  copy: [0.0, 0.06],
  frames: [0.03, 0.25],
  window: [0.02, 0.09],
  dissolve: [0.27, 0.46],
  points: [0.47, 0.6],
  assemble: [0.67, 0.85],
  glint: 0.86,
  // je Satz: tippen von, bis; weg von, bis
  typed: [
    [0.06, 0.16, 0.24, 0.29],
    [0.3, 0.36, 0.44, 0.48],
    [0.49, 0.58, 0.65, 0.69],
    [0.71, 0.8, 0.9, 0.96],
  ],
} as const

const feierabend = hero.keys.find((k) => k.name === 'feierabend')?.progress ?? 0.37

type Mode = 'pinned' | 'stills'
type Engine = 'css' | 'webgl'

function slowConnection() {
  const c = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection
  return !!c && (c.saveData === true || /(^|-)2g$/.test(c.effectiveType ?? ''))
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((ok, fail) => {
    const i = new Image()
    i.decoding = 'async'
    i.onload = () => i.decode().then(() => ok(i), () => ok(i))
    i.onerror = fail
    i.src = src
  })
}

/** Ebene in Bildkoordinaten des 16:9-Fotos (wie object-cover), damit Prüfpunkte und Glanz auf den Möbeln sitzen */
function Cover({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div aria-hidden className={cn('pointer-events-none absolute inset-0 overflow-hidden [container-type:size]', className)}>
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ width: `max(100cqw, calc(100cqh * ${RATIO}))`, height: `max(100cqh, calc(100cqw / ${RATIO}))` }}
      >
        {children}
      </div>
    </div>
  )
}

/** Nummerierte Prüfpunkte auf dem Plan; data-on = sichtbar, data-done = abgehakt */
function Checkpoints({ all }: { all?: boolean }) {
  return (
    <>
      {heroCheckpoints.map((c, i) => (
        <span
          key={i}
          data-cp={i}
          data-on={all || undefined}
          data-done={all || undefined}
          className="cp cp-num absolute"
          style={{ left: `${c.x * 100}%`, top: `${c.y * 100}%` }}
        >
          <span className="cp-dot">
            <span className="cp-n">{i + 1}</span>
            <svg viewBox="0 0 16 16" className="cp-check" aria-hidden>
              <path d="M3.5 8.4 6.6 11.3 12.6 4.9" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </span>
      ))}
    </>
  )
}

/** Reduzierte Bewegung: vier Standbilder mit den Sätzen als ruhige Abfolge */
function Stills() {
  const srcs = ['/hero/still-feierabend-d.webp', '/hero/still-staub-d.webp', '/hero/lines-d.webp', hero.still['morgen-d']]
  const mob = ['/hero/still-feierabend-m.webp', '/hero/still-staub-m.webp', '/hero/lines-m.webp', '/hero/still-morgen-16x9-m.webp']
  return (
    <div className="on-dark bg-night py-16 text-paper sm:py-24">
      <ol className="container-site grid gap-12 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-16">
        {home.hero.typed.map((s, i) => (
          <li key={i}>
            <div className="relative aspect-video overflow-hidden bg-night-2">
              <picture>
                <source media={MOBILE} srcSet={mob[i]} />
                <img src={srcs[i]} alt={home.hero.stillAlts[i]} width={FRAME_W} height={FRAME_H} loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover" />
              </picture>
              {i === 2 && (
                <Cover>
                  <Checkpoints all />
                </Cover>
              )}
            </div>
            <p className="mt-5 text-[1.5rem] leading-[1.2] font-medium tracking-[-0.02em] sm:text-[1.875rem]">{s}</p>
          </li>
        ))}
      </ol>
    </div>
  )
}

export function Hero() {
  const reduced = useReducedMotion()
  const isMobile = useIsMobile()
  const [mode, setMode] = useState<Mode | null>(null)
  const [engine, setEngine] = useState<Engine>('css')
  const [glint, setGlint] = useState(false)

  const section = useRef<HTMLElement>(null)
  const pin = useRef<HTMLDivElement>(null)
  const spacer = useRef<HTMLDivElement>(null)
  const box = useRef<HTMLDivElement>(null)
  const frames = useRef<HTMLCanvasElement>(null)
  const gl = useRef<HTMLCanvasElement>(null)
  const portrait = useRef<HTMLDivElement>(null)
  const copy = useRef<HTMLDivElement>(null)
  const planSwap = useRef<LineSwapHandle>(null)
  const morningSwap = useRef<LineSwapHandle>(null)
  const cps = useRef<HTMLDivElement>(null)
  const cpList = useRef<HTMLOListElement>(null)
  const shade = useRef<HTMLDivElement>(null)
  const cpLine = useRef<HTMLParagraphElement>(null)
  const types = useRef<(TypeHandle | null)[]>([])
  const dust = useRef<{ setEdge: (e: number) => void } | null>(null)
  const lastP = useRef(0)

  useEffect(() => {
    setMode(reduced || slowConnection() ? 'stills' : 'pinned')
  }, [reduced])

  const pinned = mode === 'pinned'

  /** Alles, was am Scrollfortschritt hängt (direkt am DOM, ohne React-Rendern) */
  const apply = (p: number) => {
    lastP.current = p
    if (copy.current) {
      const o = 1 - span(p, T.copy[0], T.copy[1])
      copy.current.style.opacity = String(o)
      copy.current.style.transform = `translate3d(0, ${-span(p, 0, T.copy[1]) * 60}px, 0)`
      copy.current.style.visibility = o === 0 ? 'hidden' : 'visible'
    }
    // Handy: das Hochformat-Foto zieht sich ins Bildfenster zurück und gibt die Sequenz frei
    if (portrait.current && box.current) {
      const k = span(p, T.window[0], T.window[1])
      const b = box.current
      const H = pin.current?.clientHeight ?? window.innerHeight
      const top = b.offsetTop * k
      const bottom = (H - b.offsetTop - b.offsetHeight) * k
      portrait.current.style.clipPath = `inset(${top}px 0 ${bottom}px 0)`
      portrait.current.style.opacity = String(1 - span(p, T.window[1] - 0.02, T.window[1] + 0.03))
    }
    const e1 = span(p, T.dissolve[0], T.dissolve[1])
    const e2 = span(p, T.assemble[0], T.assemble[1])
    const e = e2 > 0 ? 1 + e2 : e1
    dust.current?.setEdge(e)
    // Überblendungen (ohne WebGL): Plan und Morgen decken sich hinter der Kante auf
    planSwap.current?.set(e1)
    morningSwap.current?.set(e2)
    // Prüfpunkte: erscheinen nacheinander und haken sich kurz danach ab; mit dem Morgen treten sie zurück
    if (cps.current) {
      const n = heroCheckpoints.length
      const step = (T.points[1] - T.points[0]) / n
      cps.current.querySelectorAll<HTMLElement>('[data-cp]').forEach((el, i) => {
        const at = T.points[0] + i * step
        el.toggleAttribute('data-on', p >= at)
        el.toggleAttribute('data-done', p >= at + step * 1.6)
      })
      const o = String(1 - span(p, T.assemble[0] - 0.02, T.assemble[0] + 0.03))
      cps.current.style.opacity = o
      // Liste der Aufgaben (Desktop links) bzw. aktuelle Aufgabe (Handy unter dem Satz); der neueste Punkt ist aktiv
      const active = p < T.points[0] ? -1 : Math.min(n - 1, Math.floor((p - T.points[0]) / step))
      const show = span(p, T.points[0] - 0.02, T.points[0]) * Number(o)
      if (cpList.current) {
        cpList.current.style.opacity = String(show)
        cpList.current.style.visibility = show > 0.01 ? 'visible' : 'hidden'
        cpList.current.querySelectorAll('li').forEach((li, i) => {
          li.toggleAttribute('data-on', i <= active)
          li.toggleAttribute('data-active', i === active)
        })
      }
      if (cpLine.current) {
        cpLine.current.style.opacity = String(show)
        cpLine.current.style.visibility = show > 0.01 ? 'visible' : 'hidden'
        const t = heroCheckpoints[Math.max(0, active)]
        const txt = `${Math.max(0, active) + 1} / ${n}  ${t.task}`
        if (cpLine.current.textContent !== txt) cpLine.current.textContent = txt
      }
    }
    T.typed.forEach((w, i) => types.current[i]?.set(span(p, w[0], w[1]), span(p, w[2], w[3])))
    setGlint(p >= T.glint)
    if (shade.current) shade.current.style.opacity = String(1 - span(p, 0.94, 0.99))
  }

  const seq = useHeroSequence({
    enabled: pinned,
    urls: isMobile ? hero.mobile : hero.desktop,
    section,
    pin,
    spacer,
    canvas: frames,
    lengthVh: 4.6,
    play: 1,
    seqOf: (p) => span(p, T.frames[0], T.frames[1]) * feierabend,
    onProgress: (p) => apply(p),
  })

  useEffect(() => {
    if (pinned) apply(lastP.current)
  }, [pinned, isMobile, engine])

  // WebGL nach dem Laden der Seite (Startbild und Bedienung zuerst)
  useEffect(() => {
    if (!pinned) return
    let stop = () => {}
    let cancelled = false
    const start = async () => {
      const { Dust, dustSupported, particleBudget } = await import('@/features/hero/dust')
      if (cancelled || !dustSupported() || !gl.current || !pin.current || !box.current) return
      const m = window.matchMedia(MOBILE).matches
      const v = m ? 'p' : 'd'
      let imgs: HTMLImageElement[]
      try {
        imgs = await Promise.all([loadImage(`/hero/key-feierabend-${v}.jpg`), loadImage(`/hero/lines-${m ? 'm' : 'd'}.webp`), loadImage(`/hero/key-morgen-${v}.jpg`)])
      } catch {
        return
      }
      if (cancelled || !gl.current) return
      let d: InstanceType<typeof Dust>
      try {
        d = new Dust(gl.current, { a: imgs[0], lines: imgs[1], b: imgs[2] }, particleBudget(m))
      } catch {
        return
      }
      const cv = gl.current
      let e = 0
      let raf = 0
      let visible = true
      const t0 = performance.now()
      // Messung: die ersten 45 bewegten Bilder; zu langsam → Überblendungen statt Partikeln
      const times: number[] = []
      let prev = 0
      const layout = () => {
        const W = pin.current!.clientWidth
        const H = pin.current!.clientHeight
        const b = box.current!
        const bw = b.offsetWidth
        const bh = b.offsetHeight
        // Foto wie object-cover im Bildfenster
        const w = Math.max(bw, bh * RATIO)
        const h = w / RATIO
        const rect = { x: b.offsetLeft + (bw - w) / 2, y: b.offsetTop + (bh - h) / 2, w, h }
        d.resize(W, H, rect, { x: b.offsetLeft, y: b.offsetTop, w: bw, h: bh }, Math.min(window.devicePixelRatio || 1, m ? 2 : 1.75))
        draw()
      }
      const active = () => (e > 0.001 && e < 0.999) || (e > 1.001 && e < 1.999)
      const frame = (now: number) => {
        raf = 0
        d.render(e, (now - t0) / 1000)
        if (active()) {
          if (prev && times.length < 45) {
            times.push(now - prev)
            if (times.length === 45) {
              const med = [...times].sort((a, b) => a - b)[22]
              if (med > 34) {
                fail()
                return
              }
            }
          }
          prev = now
          if (visible) raf = requestAnimationFrame(frame)
        } else prev = 0
      }
      const draw = () => {
        if (!raf && visible) raf = requestAnimationFrame(frame)
      }
      const io = new IntersectionObserver(([x]) => {
        visible = x.isIntersecting
        if (visible) draw()
        else if (raf) {
          cancelAnimationFrame(raf)
          raf = 0
        }
      })
      io.observe(pin.current)
      const ro = new ResizeObserver(layout)
      ro.observe(pin.current)
      const fail = () => {
        stop()
        setEngine('css')
      }
      dust.current = {
        setEdge(x) {
          e = x
          cv.style.visibility = x > 0.0005 ? 'visible' : 'hidden'
          draw()
        },
      }
      stop = () => {
        dust.current = null
        io.disconnect()
        ro.disconnect()
        if (raf) cancelAnimationFrame(raf)
        d.destroy()
      }
      layout()
      setEngine('webgl')
    }
    let cancelIdle = () => {}
    const go = () => (cancelIdle = onIdle(() => void start(), 1500))
    if (document.readyState === 'complete') go()
    else window.addEventListener('load', go, { once: true })
    return () => {
      cancelled = true
      window.removeEventListener('load', go)
      cancelIdle()
      stop()
    }
  }, [pinned, isMobile])

  // Handy: Einstieg sichtbar → untere Leiste ausblenden (kein doppelter Call-to-Action)
  useEffect(() => {
    if (!isMobile || !pin.current) return setHeroVisible(false)
    const io = new IntersectionObserver(([e]) => setHeroVisible(e.intersectionRatio > 0.2 && lastP.current < 0.05), { threshold: [0, 0.2, 0.5, 1] })
    io.observe(pin.current)
    return () => {
      io.disconnect()
      setHeroVisible(false)
    }
  }, [isMobile])

  const webgl = engine === 'webgl'

  return (
    // Kante unten schon im ersten HTML wie im gepinnten Zustand (Modus steht dort noch nicht fest): Sonst nimmt die
    // Übergangsmarkierung (tones.ts) dem Text vor dem Laden den unteren Abstand und gibt ihn danach zurück (CLS)
    <section ref={section} aria-labelledby="hero-title" className="relative" data-tone-start="dark" data-tone-end={mode === 'stills' ? 'dark' : 'surface'}>
      {/* Der Pin-Weg (lengthVh = 4.6) ist schon im CSS reserviert (.hero-spacer), sonst springt beim Laden alles darunter */}
      <div ref={spacer} className={mode === 'stills' ? undefined : 'hero-spacer'}>
        <div ref={pin} className="hero-pin relative h-[100svh] min-h-[560px] overflow-hidden bg-night">
          {/* Bildfenster: Desktop bildschirmfüllend, Handy ein hohes Fenster oben (Text darunter auf Navy). Die Maße stehen
              schon im ersten HTML fest (nicht erst nach dem Umschalten auf „pinned“), sonst springt das Fenster (CLS) */}
          <div ref={box} className="hero-box is-pinned photo absolute overflow-hidden bg-night">
            {/* Startbild als normales Bild (LCP) */}
            <img
              src={hero.desktop[0] ?? hero.still['aussen-d']}
              alt={home.hero.imageAlt}
              width={FRAME_W}
              height={FRAME_H}
              fetchPriority={isMobile ? 'low' : 'high'}
              decoding="async"
              className="absolute inset-0 size-full object-cover max-md:hidden"
            />
            {pinned && (
              <>
                <canvas ref={frames} aria-hidden className={cn('absolute inset-0 size-full object-cover transition-opacity duration-300', seq.drawn ? 'opacity-100' : 'opacity-0')} />
                {/* Ersatz ohne WebGL (Linien-Modul): Plan und Morgen decken sich hinter der Lichtkante auf */}
                {!webgl && (
                  <>
                    <LineSwap ref={planSwap} lines="/hero/lines-d.webp" linesMobile="/hero/lines-m.webp" width={FRAME_W} height={FRAME_H} />
                    <LineSwap ref={morningSwap} lines="/hero/key-morgen-d.jpg" linesMobile="/hero/key-morgen-p.jpg" width={FRAME_W} height={FRAME_H} />
                  </>
                )}
              </>
            )}
          </div>

          {/* Partikel und Plan (WebGL), über dem Bildfenster; Partikel dürfen darüber hinaus treiben */}
          {pinned && <canvas ref={gl} aria-hidden className="pointer-events-none absolute inset-0 size-full" style={{ visibility: 'hidden' }} />}

          {/* Prüfpunkte und Glanz über Plan und Partikeln, in Bildkoordinaten des Bildfensters */}
          {pinned && (
            <div aria-hidden className="hero-box is-pinned pointer-events-none absolute">
              <Cover>
                <div ref={cps} className="absolute inset-0">
                  <Checkpoints />
                </div>
                {GLINTS.map((g, i) => (
                  <Sparkle
                    key={i}
                    play={glint}
                    delay={g.delay}
                    className="absolute -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${g.x * 100}%`, top: `${g.y * 100}%`, width: g.size * (isMobile ? 0.7 : 1), height: g.size * (isMobile ? 0.7 : 1) }}
                  />
                ))}
              </Cover>
            </div>
          )}

          {/* Handy: Hochformat-Foto des Gebäudes als Einstieg (LCP) */}
          <div ref={portrait} aria-hidden={pinned ? undefined : true} className="photo absolute inset-0 md:hidden">
            <picture>
              <source media={MOBILE} srcSet={hero.still['aussen-m-lq'] ?? hero.still['aussen-m']} />
              <img src={hero.still['aussen-m']} alt="" width={941} height={1672} fetchPriority={isMobile ? 'high' : 'low'} decoding="async" className="absolute inset-0 size-full object-cover object-[40%_50%]" />
            </picture>
          </div>

          {/* Lesbarkeit der Headline und der Sätze: ruhige Abdunklung von unten, weicht am Ende (Übergang in den nächsten Abschnitt) */}
          <div ref={shade} aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute inset-x-0 bottom-0 h-[78%] bg-[linear-gradient(to_top,rgb(10_26_51/0.86)_0%,rgb(10_26_51/0.62)_38%,rgb(10_26_51/0)_100%)] lg:h-[70%]" />
          </div>

          {/* Start: H1 aus Keyword-Zeile und Leitidee, Buttons */}
          <div className="on-dark container-site pointer-events-none relative flex h-full flex-col justify-end pt-24 pb-[max(2.5rem,env(safe-area-inset-bottom))] text-paper sm:pb-14 lg:pb-[9vh]">
            <div ref={copy} className="pointer-events-auto will-change-transform">
              <AnimatedText
                as="h1"
                id="hero-title"
                text={home.hero.headline}
                immediate
                kicker={<span className="mt-6 block text-[0.875rem] leading-[1.45] font-medium tracking-[0.03em] text-paper lg:mt-8 lg:text-[1rem]">{home.hero.kicker}</span>}
                kickerAfter
                wordsClassName="t-display block text-paper"
              />
              {/* Höhe vorab reserviert (Button 3,75 rem, Abstand, Textlink): Der Browser zeichnet das erste Bild, bevor er
                  diesen Teil gelesen hat; ohne Reserve rutscht die unten ausgerichtete Überschrift danach hoch (CLS) */}
              <div className="mt-9 flex min-h-[6.9375rem] flex-col gap-5 sm:min-h-[3.75rem] sm:flex-row sm:items-center sm:gap-8 lg:mt-12">
                <QuoteButton size="lg" arrow wrapClassName="flex max-md:w-full md:inline-flex" className="max-md:w-full">
                  {home.hero.cta}
                </QuoteButton>
                <a href={company.phone.href} className="tlink self-center text-paper sm:self-auto">
                  oder anrufen: {company.phone.display}
                </a>
              </div>
            </div>
          </div>

          {/* Getippte Sätze, an die Scrollposition gekoppelt (zusätzlich als Text im HTML, siehe unten) */}
          {pinned && (
            <div aria-hidden className="hero-typed pointer-events-none absolute inset-x-0 bottom-0">
              <div className="container-site grid">
                {home.hero.typed.map((s, i) => (
                  <TypeText key={i} ref={(h) => void (types.current[i] = h)} text={s} className="hero-type col-start-1 row-start-1" />
                ))}
                <p ref={cpLine} className="hero-cpline md:hidden" style={{ visibility: 'hidden' }} />
              </div>
            </div>
          )}

          {/* Prüfpunkte als Liste: Desktop links in einer eigenen Spalte, Handy die aktuelle Aufgabe unter dem Satz */}
          {pinned && (
            <div aria-hidden className="pointer-events-none absolute inset-0 max-md:hidden">
              <div className="container-site pt-[16vh]">
                <ol ref={cpList} className="hero-cplist" style={{ visibility: 'hidden' }}>
                  {heroCheckpoints.map((c, i) => (
                    <li key={i}>
                      <span className="hero-cplist-n">{i + 1}</span>
                      <span>{c.task}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Die Sätze der Abfolge als normaler Text */}
      <p className="sr-only">{home.hero.typed.join(' ')}</p>

      {mode === 'stills' && <Stills />}
    </section>
  )
}
