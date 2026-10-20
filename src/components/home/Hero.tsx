import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowDown, CalendarCheck } from 'lucide-react'
import hero from 'virtual:hero-frames'
import { RevealText } from '@/components/ui/RevealText'
import { Button } from '@/components/ui/Button'
import { QuoteButton } from '@/features/configurator/QuoteLink'
import { home } from '@/content/site'
import { company } from '@/content/company'
import { useReducedMotion } from '@/lib/env'
import { ScrollTrigger } from '@/lib/gsap'
import { onIdle } from '@/lib/idle'
import { cn } from '@/lib/cn'
import { useFrameSequence } from './useFrameSequence'

/** Hochformat-Bildschirme bekommen die eigens zugeschnittene Handy-Sequenz */
const PORTRAIT = '(max-aspect-ratio: 4/5)'
/** Anteil der Scrollstrecke, über den die Sequenz läuft; danach steht das Morgenbild */
const PLAY = 0.84
/** Ab hier weicher Übergang zur nächsten Sektion */
const OUTRO = 0.9
/** Native Größe der Desktop-Frames: Die Bildfläche wird nie größer, damit nichts über 100 % gestreckt wird */
const FRAME_W = 1918
const FRAME_H = 1080
/** Breite des 4:5-Ausschnitts relativ zur vollen Framebreite (für die Vorschau-Datei) */
const CROP_A = (FRAME_H * 4) / 5 / FRAME_W
/** Ruhezeit, nach der an einem Schlüsselmoment das scharfe Standbild eingeblendet wird */
const IDLE_MS = 150
/** Toleranz um einen Schlüsselmoment (Anteil der Sequenz) */
const KEY_RANGE = 0.03

type Mode = 'video' | 'static-first' | 'static-morning'

function slowConnection() {
  const c = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection
  return !!c && (c.saveData === true || /(^|-)2g$/.test(c.effectiveType ?? ''))
}

/**
 * Hero mit Scroll-Video: Drohnenflug ins Büro, Reinigung am Abend, makelloses Büro am Morgen.
 * Technik: Bildsequenz auf <canvas>, gesteuert über GSAP ScrollTrigger (gepinnte Sektion).
 * Das erste Frame ist ein normales <img> (schnelles LCP). Fallbacks: reduzierte Bewegung → Morgenbild,
 * Datensparmodus oder Ladefehler → Standbild.
 */
export function Hero() {
  const reduced = useReducedMotion()
  const section = useRef<HTMLElement>(null)
  const pin = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const copy = useRef<HTMLDivElement>(null)
  const outro = useRef<HTMLDivElement>(null)
  const shade = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const target = useRef(0)
  const scrollP = useRef(0)
  const [mode, setMode] = useState<Mode>('video')
  const [portrait, setPortrait] = useState(false)
  const [load, setLoad] = useState(false)
  const [drawn, setDrawn] = useState(false)
  const [step, setStep] = useState(0)
  const [activeKey, setActiveKey] = useState<string | null>(null)
  const [keysReady, setKeysReady] = useState<Record<string, boolean>>({})

  const urls = useMemo(() => (portrait ? hero.mobile : hero.desktop), [portrait])
  const mobileCrop = portrait ? hero.mobileCrop : null
  const { nearest, progress, failed } = useFrameSequence(urls, mode === 'video' && load)

  // Modus festlegen (nur im Browser)
  useEffect(() => {
    if (reduced) return setMode('static-morning')
    if (slowConnection()) return setMode('static-first')
    setMode('video')
    setPortrait(window.matchMedia(PORTRAIT).matches)
    // Frames erst laden, wenn die Seite steht (LCP und Interaktivität zuerst)
    const start = () => onIdle(() => setLoad(true), 1200)
    if (document.readyState === 'complete') return start()
    let cancel = () => {}
    const onLoad = () => (cancel = start())
    window.addEventListener('load', onLoad, { once: true })
    return () => {
      window.removeEventListener('load', onLoad)
      cancel()
    }
  }, [reduced])

  useEffect(() => {
    if (failed) setMode('static-first')
  }, [failed])

  // Gepinnte Sektion + Scrollfortschritt
  useEffect(() => {
    if (mode !== 'video' || !section.current || !pin.current) return
    let timer = 0
    const length = () => window.innerHeight * (window.matchMedia(PORTRAIT).matches ? 2.6 : 3.2)
    const st = ScrollTrigger.create({
      trigger: section.current,
      pin: pin.current,
      start: 'top top',
      end: () => `+=${length()}`,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const p = self.progress
        target.current = Math.min(1, p / PLAY)
        if (copy.current) {
          const o = Math.max(0, 1 - p / 0.1)
          copy.current.style.opacity = String(o)
          copy.current.style.transform = `translate3d(0, ${-p * 160}px, 0)`
          copy.current.style.visibility = o === 0 ? 'hidden' : 'visible'
        }
        // Dunkler Verlauf nur, solange der Text sichtbar ist; danach wirkt das Video hell und klar
        if (shade.current) shade.current.style.opacity = String(Math.max(0, 1 - p / 0.14))
        if (outro.current) outro.current.style.opacity = String(Math.max(0, (p - OUTRO) / (1 - OUTRO)))
        // Hochformat: 4:5-Bildfläche gleitet vom unteren Rand in die Mitte, sobald der Text ausgeblendet ist
        stage.current?.style.setProperty('--lift', String(Math.min(1, p / 0.12)))
        scrollP.current = p
        const sp = target.current
        setStep(sp < 0.33 ? 0 : sp < 0.9 ? 1 : 2)
        onScrollActivity()
      },
    })
    // Schlüsselmomente: nach kurzer Ruhe das scharfe Standbild einblenden, beim Weiterscrollen ausblenden
    function onScrollActivity() {
      setActiveKey(null)
      window.clearTimeout(timer)
      timer = window.setTimeout(() => {
        const t = target.current
        const key = hero.keys.find((k) => Math.abs(k.progress - t) <= KEY_RANGE)
        if (!key) return
        target.current = key.progress // Canvas läuft exakt auf das passende Frame
        setActiveKey(key.name)
      }, IDLE_MS)
    }
    onScrollActivity()
    return () => {
      window.clearTimeout(timer)
      st.kill()
    }
  }, [mode])

  // Zeichnen: weich zum Ziel-Frame interpolieren, nur neu zeichnen, wenn sich etwas ändert
  useEffect(() => {
    if (mode !== 'video' || !load) return
    const cv = canvas.current
    const ctx = cv?.getContext('2d', { alpha: false })
    if (!cv || !ctx) return
    let raf = 0
    let current = target.current
    let lastImg: HTMLImageElement | null = null
    const drawnRef = { current: false }
    const loop = () => {
      raf = requestAnimationFrame(loop)
      current += (target.current - current) * 0.22
      if (Math.abs(target.current - current) < 0.0005) current = target.current
      const index = Math.round(current * (urls.length - 1))
      const img = nearest(index)
      if (!img || img === lastImg) return
      // 1:1 zeichnen, ohne Skalierung. Die Darstellung übernimmt der Browser per object-fit (wie bei einem <img>).
      let sx = 0
      let sw = img.naturalWidth
      const sh = img.naturalHeight
      if (mobileCrop) {
        // Vorschau-Datei auf dem Handy: 4:5-Ausschnitt aus dem Querformat, Mitte folgt dem Motiv
        sw = Math.round(sh * 0.8)
        const c = mobileCrop[Math.min(mobileCrop.length - 1, index)] ?? 0.5
        sx = Math.min(img.naturalWidth - sw, Math.max(0, Math.round(c * img.naturalWidth - sw / 2)))
      }
      if (cv.width !== sw || cv.height !== sh) {
        cv.width = sw
        cv.height = sh
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
      }
      ctx.drawImage(img, sx, 0, sw, sh, 0, 0, sw, sh)
      lastImg = img
      if (!drawnRef.current) {
        drawnRef.current = true
        setDrawn(true)
      }
    }
    raf = requestAnimationFrame(loop)
    // Hintergrund-Tab oder Hero außer Sicht: Schleife anhalten
    const io = new IntersectionObserver(([e]) => {
      cancelAnimationFrame(raf)
      if (e.isIntersecting) raf = requestAnimationFrame(loop)
    })
    io.observe(cv)
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
    }
  }, [mode, load, urls, nearest, mobileCrop])

  const video = mode === 'video' && !reduced

  /** Standbild für einen Schlüsselmoment (4:5 auf dem Handy) und Bildausschnitt für die Vorschau-Datei */
  const keySrc = (k: (typeof hero.keys)[number]) => (portrait ? (k.m ?? k.d) : k.d)
  const keyPosition = (k: (typeof hero.keys)[number]) => {
    if (!portrait || k.m || !hero.mobileCrop) return undefined
    const c = hero.mobileCrop[Math.round(k.progress * (hero.mobileCrop.length - 1))] ?? 0.5
    return `${Math.min(100, Math.max(0, ((c - CROP_A / 2) / (1 - CROP_A)) * 100))}% 50%`
  }
  const loadingVisible = video && load && progress < 1

  return (
    <section ref={section} aria-labelledby="hero-title" className="relative">
      <div ref={pin} className="relative h-[100svh] min-h-[560px] overflow-hidden bg-ink">
        {/* Bildfläche: Desktop höchstens in nativer Framegröße (keine Streckung über 100 %), Hochformat 4:5 */}
        <div ref={stage} className="hero-stage absolute overflow-hidden" style={{ ['--fw' as string]: `${FRAME_W}px`, ['--fh' as string]: `${FRAME_H}px` }}>
          {/* Erstes Frame bzw. Standbild als normales Bild (LCP). Reduzierte Bewegung: per <source> direkt das Morgenbild. */}
          <picture>
            {mode === 'static-first' ? null : (
              <>
                <source media={`(prefers-reduced-motion: reduce) and ${PORTRAIT}`} srcSet={hero.still['morgen-m']} />
                <source media="(prefers-reduced-motion: reduce)" srcSet={hero.still['morgen-d']} />
              </>
            )}
            <source media={PORTRAIT} srcSet={hero.inline ? hero.still['aussen-m'] : (hero.mobile[0] ?? hero.still['aussen-m'])} />
            <img
              src={hero.desktop[0] ?? hero.still['aussen-d']}
              alt={mode === 'static-morning' ? home.hero.imageAltMorning : home.hero.imageAlt}
              fetchPriority="high"
              decoding="async"
              className="absolute inset-0 size-full object-cover"
            />
          </picture>

          {video && (
            <canvas ref={canvas} aria-hidden className={cn('absolute inset-0 size-full object-cover transition-opacity duration-300', drawn ? 'opacity-100' : 'opacity-0')} />
          )}

          {/* Schlüsselmomente in voller Qualität, erst nach dem Start der Sequenz geladen */}
          {video &&
            load &&
            hero.keys.map((k) => (
              <img
                key={`${k.name}-${portrait ? 'm' : 'd'}`}
                src={keySrc(k)}
                alt=""
                aria-hidden
                decoding="async"
                onLoad={() => setKeysReady((r) => ({ ...r, [k.name]: true }))}
                style={{ objectPosition: keyPosition(k) }}
                className={cn(
                  'pointer-events-none absolute inset-0 size-full object-cover transition-opacity ease-out',
                  activeKey === k.name && keysReady[k.name] ? 'opacity-100 duration-500' : 'opacity-0 duration-200',
                )}
              />
            ))}
        </div>

        {/* Lesbarkeit: dunkler Verlauf hinter dem Text */}
        <div
          ref={shade}
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink/80 via-ink/45 to-ink/10 lg:bg-gradient-to-r lg:from-ink/85 lg:via-ink/45 lg:to-transparent"
        />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-ink/50 to-transparent" />

        {/* Text */}
        <div className="on-dark container-site relative flex h-full flex-col pt-28 pb-10 text-white sm:pt-36 lg:justify-center lg:pt-32">
          <div ref={copy} className="max-w-[40rem] will-change-transform">
            <p className="eyebrow fade-up-now mb-5" style={{ ['--d' as string]: '0.05s' }}>
              <span aria-hidden className="h-px w-6 bg-current" />
              {home.hero.eyebrow}
            </p>
            <RevealText as="h1" id="hero-title" text={home.hero.headline} immediate className="heading-display text-white [text-shadow:0_2px_24px_rgb(10_22_40/0.35)]" />
            <p className="fade-up-now mt-6 max-w-xl text-base leading-relaxed text-white/85 sm:text-xl" style={{ ['--d' as string]: '0.55s' }}>
              {home.hero.sub}
            </p>
            <div className="fade-up-now mt-8 flex flex-col gap-3 sm:flex-row" style={{ ['--d' as string]: '0.7s' }}>
              <QuoteButton size="lg" arrow>
                Kostenloses Angebot
              </QuoteButton>
              <Button to="/kontakt#besichtigung" variant="light" size="lg" icon={<CalendarCheck aria-hidden className="size-5 text-blue" />}>
                Objektbesichtigung buchen
              </Button>
            </div>
            <p className="fade-up-now mt-6 text-sm text-white/75" style={{ ['--d' as string]: '0.85s' }}>
              Oder direkt anrufen:{' '}
              <a href={company.phone.href} className="font-semibold text-white underline decoration-white/40 underline-offset-4 hover:decoration-white">
                {company.phone.display}
              </a>
            </p>
          </div>
        </div>

        {/* Szenen-Untertitel und dezenter Ladefortschritt */}
        {video && (
          <div aria-hidden className={cn('pointer-events-none absolute inset-x-0 bottom-24 justify-center lg:bottom-6', step === 0 ? 'hidden sm:flex' : 'flex')}>
            <div className="glass relative flex items-center gap-3 overflow-hidden rounded-full px-4 py-2.5 text-sm font-medium text-ink shadow-soft ring-1 ring-line">
              <span className="flex gap-1">
                {home.hero.sceneSteps.map((_, i) => (
                  <span key={i} className={cn('h-1.5 rounded-full transition-all duration-500', i === step ? 'w-6 bg-blue' : 'w-1.5 bg-ink/20')} />
                ))}
              </span>
              <span className="min-w-[12.5rem]">{home.hero.sceneSteps[step]}</span>
              {step === 0 && <ArrowDown className="size-4 animate-bounce text-blue" />}
              {loadingVisible && (
                <span className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-blue/60 transition-transform duration-300" style={{ transform: `scaleX(${progress})` }} />
              )}
            </div>
          </div>
        )}

        {/* Weicher Übergang zur Vertrauensleiste */}
        <div ref={outro} aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-white/40 to-white opacity-0" />
      </div>
    </section>
  )
}
