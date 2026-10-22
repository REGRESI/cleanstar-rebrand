import { useEffect, useRef, useState } from 'react'
import { ArrowDown } from 'lucide-react'
import hero from 'virtual:hero-frames'
import { RevealText } from '@/components/ui/RevealText'
import { QuoteButton } from '@/features/configurator/QuoteLink'
import { home } from '@/content/site'
import { company } from '@/content/company'
import { useIsMobile, useReducedMotion } from '@/lib/env'
import { setHeroVisible } from '@/lib/heroVisibility'
import { cn } from '@/lib/cn'
import { useHeroSequence } from './useHeroSequence'
import { KeyOverlays } from './KeyOverlays'
import { HeroMobileSequence } from './HeroMobileSequence'

/** Handy-Layout */
const MOBILE = '(max-width: 767px)'
/** Anteil der Scrollstrecke, über den die Sequenz läuft; danach steht das Morgenbild */
const PLAY = 0.84
/** Ab hier weicher Übergang zur nächsten Sektion */
const OUTRO = 0.9
/** Native Größe der Desktop-Frames: Die Bildfläche wird nie größer, damit nichts über 100 % gestreckt wird */
const FRAME_W = 1918
const FRAME_H = 1080

type Mode = 'video' | 'static-first' | 'static-morning'

/** Hochauflösendes Handy-Bild: lädt nach der kleinen Vorschau und blendet weich darüber (nur unter 768 px). */
function MobileFullImage({ src }: { src: string }) {
  const [ready, setReady] = useState(false)
  const ref = useRef<HTMLImageElement>(null)
  useEffect(() => {
    if (ref.current?.complete && ref.current.naturalWidth) setReady(true)
  }, [])
  return (
    <img
      ref={ref}
      src={src}
      alt=""
      aria-hidden
      decoding="async"
      fetchPriority="low"
      onLoad={() => setReady(true)}
      className={cn('absolute inset-0 size-full object-cover object-[40%_50%] transition-opacity duration-500 md:hidden', ready ? 'opacity-100' : 'opacity-0')}
    />
  )
}

function slowConnection() {
  const c = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection
  return !!c && (c.saveData === true || /(^|-)2g$/.test(c.effectiveType ?? ''))
}

/**
 * Hero mit Scroll-Video: Drohnenflug ins Büro, Reinigung am Abend, makelloses Büro am Morgen.
 * Desktop (ab 768 px): gepinnte Bildfläche, Text auf dem ersten Frame.
 * Handy: bildschirmfüllendes Außenbild mit Text unten, danach die Sequenz als 16:9-Karte mit drei Schritten.
 * Fallbacks: reduzierte Bewegung → Morgenbild, Datensparmodus oder Ladefehler → Standbild.
 */
export function Hero() {
  const reduced = useReducedMotion()
  const isMobile = useIsMobile()
  const section = useRef<HTMLElement>(null)
  const pin = useRef<HTMLDivElement>(null)
  // Eigener Pin-Spacer: GSAP verschiebt den Hero dann nie im DOM (sonst starten die CSS-Animationen des Titels neu)
  const spacer = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const copy = useRef<HTMLDivElement>(null)
  const outro = useRef<HTMLDivElement>(null)
  const shade = useRef<HTMLDivElement>(null)
  const [mode, setMode] = useState<Mode | null>(null)
  const [step, setStep] = useState(0)

  // Modus festlegen (nur im Browser)
  useEffect(() => {
    setMode(reduced ? 'static-morning' : slowConnection() ? 'static-first' : 'video')
  }, [reduced])

  const [failedMobile, setFailedMobile] = useState(false)
  const desktopVideo = mode === 'video' && !isMobile
  const mobileVideo = mode === 'video' && isMobile && !failedMobile

  const seq = useHeroSequence({
    enabled: desktopVideo,
    urls: hero.desktop,
    section,
    pin,
    spacer,
    canvas,
    lengthVh: 3.2,
    play: PLAY,
    onProgress: (p, sp) => {
      if (copy.current) {
        const o = Math.max(0, 1 - p / 0.1)
        copy.current.style.opacity = String(o)
        copy.current.style.transform = `translate3d(0, ${-p * 160}px, 0)`
        copy.current.style.visibility = o === 0 ? 'hidden' : 'visible'
      }
      // Dunkler Verlauf nur, solange der Text sichtbar ist; danach wirkt das Video hell und klar
      if (shade.current) shade.current.style.opacity = String(Math.max(0, 1 - p / 0.14))
      if (outro.current) outro.current.style.opacity = String(Math.max(0, (p - OUTRO) / (1 - OUTRO)))
      setStep(sp < 0.33 ? 0 : sp < 0.9 ? 1 : 2)
    },
  })

  useEffect(() => {
    if (seq.failed) setMode('static-first')
  }, [seq.failed])

  // Handy: Einstieg sichtbar → untere Leiste ausblenden (kein doppelter Call-to-Action)
  useEffect(() => {
    if (!isMobile || !pin.current) return setHeroVisible(false)
    const io = new IntersectionObserver(([e]) => setHeroVisible(e.intersectionRatio > 0.2), { threshold: [0, 0.2, 0.5, 1] })
    io.observe(pin.current)
    return () => {
      io.disconnect()
      setHeroVisible(false)
    }
  }, [isMobile])

  const loadingVisible = desktopVideo && seq.load && seq.progress < 1
  const morning = mode === 'static-morning'

  return (
    <section ref={section} aria-labelledby="hero-title" className="relative">
      <div ref={spacer}>
        <div ref={pin} className="relative h-[100svh] min-h-[560px] overflow-hidden bg-ink">
          {/* Bildfläche: Desktop höchstens in nativer Framegröße (keine Streckung über 100 %) */}
          <div className="hero-stage absolute overflow-hidden" style={{ ['--fw' as string]: `${FRAME_W}px`, ['--fh' as string]: `${FRAME_H}px` }}>
            {/* Erstes Frame bzw. Standbild als normales Bild (LCP). Handy: eigenes Hochformat-Foto des Gebäudes. */}
            <picture>
              {mode === 'static-first' ? null : (
                <>
                  <source media={`(prefers-reduced-motion: reduce) and ${MOBILE}`} srcSet={hero.still['morgen-m']} />
                  <source media="(prefers-reduced-motion: reduce)" srcSet={hero.still['morgen-d']} />
                </>
              )}
              <source media={MOBILE} srcSet={hero.still['aussen-m-lq'] ?? hero.still['aussen-m']} />
              <img
                src={hero.desktop[0] ?? hero.still['aussen-d']}
                alt={morning ? home.hero.imageAltMorning : home.hero.imageAlt}
                fetchPriority="high"
                decoding="async"
                // Handy: Hochformat-Foto, leicht nach links verschoben, damit das ganze Gebäude sichtbar bleibt
                className="absolute inset-0 size-full object-cover max-md:object-[40%_50%]"
              />
            </picture>
            {/* Handy: volles Foto (WebP 85, native Breite) blendet über die kleine Vorschau, sobald es geladen ist */}
            {hero.still['aussen-m-lq'] && isMobile && !morning && <MobileFullImage src={hero.still['aussen-m']} />}

            {desktopVideo && (
              <>
                <canvas
                  ref={canvas}
                  aria-hidden
                  className={cn('absolute inset-0 size-full object-cover transition-opacity duration-300', seq.drawn ? 'opacity-100' : 'opacity-0')}
                />
                {seq.load && <KeyOverlays activeKey={seq.activeKey} variant="d" />}
              </>
            )}
          </div>

          {/* Lesbarkeit. Desktop: Verlauf hinter dem Text. Handy: weicher Verlauf von unten, das Gebäude bleibt frei. */}
          <div
            ref={shade}
            aria-hidden
            className="hero-shade pointer-events-none absolute inset-0 bg-gradient-to-b from-ink/80 via-ink/45 to-ink/10 lg:bg-gradient-to-r lg:from-ink/85 lg:via-ink/45 lg:to-transparent"
          />
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-ink/50 to-transparent" />

          {/* Text */}
          <div className="on-dark container-site relative flex h-full flex-col pt-28 pb-10 text-white max-md:justify-end max-md:pt-0 max-md:pb-[max(2.5rem,env(safe-area-inset-bottom))] sm:pt-36 lg:justify-center lg:pt-32">
            <div ref={copy} className="max-w-[40rem] will-change-transform">
              <p className="eyebrow fade-up-now mb-5 max-md:mb-3" style={{ ['--d' as string]: '0.05s' }}>
                {home.hero.eyebrow}
              </p>
              <RevealText as="h1" id="hero-title" text={home.hero.headline} immediate className="heading-display text-white [text-shadow:0_2px_24px_rgb(10_22_40/0.35)]" />
              <p className="fade-up-now mt-6 max-w-xl text-lg leading-relaxed text-white/85 max-md:mt-4 sm:text-xl" style={{ ['--d' as string]: '0.55s' }}>
                {home.hero.sub}
              </p>
              <div className="fade-up-now mt-8 max-md:mt-7" style={{ ['--d' as string]: '0.7s' }}>
                <QuoteButton size="lg" arrow full={isMobile}>
                  {home.hero.cta}
                </QuoteButton>
              </div>
              <p className="fade-up-now mt-5 text-sm text-white/75 max-md:text-center" style={{ ['--d' as string]: '0.85s' }}>
                <a href={company.phone.href} className="underline decoration-white/30 underline-offset-4 hover:text-white hover:decoration-white">
                  oder anrufen: <span className="font-semibold text-white">{company.phone.display}</span>
                </a>
              </p>
            </div>
          </div>

          {/* Szenen-Untertitel und dezenter Ladefortschritt (Desktop) */}
          {desktopVideo && (
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
                  <span className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-blue/60 transition-transform duration-300" style={{ transform: `scaleX(${seq.progress})` }} />
                )}
              </div>
            </div>
          )}

          {/* Weicher Übergang zur Vertrauensleiste (Desktop) */}
          <div ref={outro} aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-white/40 to-white opacity-0" />
        </div>
      </div>

      {/* Handy: Sequenz als Karte mit Überschrift und drei Schritten */}
      {/* Handy: weicher Übergang vom dunklen Einstieg zur hellen Sequenz */}
      {mobileVideo && <div aria-hidden className="h-28 bg-gradient-to-b from-ink via-ink/40 to-white md:hidden" />}
      {mobileVideo && <HeroMobileSequence onFailed={() => setFailedMobile(true)} />}
    </section>
  )
}
