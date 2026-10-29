import { forwardRef, useEffect, useRef, useState } from 'react'
import hero from 'virtual:hero-frames'
import { RevealText } from '@/components/ui/RevealText'
import { Sparkle } from '@/components/ui/Sparkle'
import { QuoteButton } from '@/features/configurator/QuoteLink'
import { home } from '@/content/site'
import { company } from '@/content/company'
import { useIsMobile, useReducedMotion } from '@/lib/env'
import { setHeroVisible } from '@/lib/heroVisibility'
import { cn } from '@/lib/cn'
import { useHeroSequence } from './useHeroSequence'
import { KeyOverlays } from './KeyOverlays'
import { HeroMobileSequence } from './HeroMobileSequence'
import { GLINTS } from './glints'

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

type Tod = 'abend' | 'morgen'

/** Schlichter Umschalter „Am Abend · Am Morgen“ (wirkt nur auf das Startbild) */
function DaySwitch({ value, onChange }: { value: Tod; onChange: (t: Tod) => void }) {
  return (
    <div role="group" aria-label="Stimmung des Startbilds" className="fade-up-now mt-8 flex items-center gap-3 text-[0.875rem] lg:mt-10" style={{ ['--d' as string]: '0.75s' }}>
      {(['abend', 'morgen'] as const).map((t, i) => (
        <span key={t} className="flex items-center gap-3">
          {i > 0 && (
            <span aria-hidden className="text-paper/60">
              ·
            </span>
          )}
          <button
            type="button"
            aria-pressed={value === t}
            onClick={() => onChange(t)}
            className={cn('ulink py-1.5 transition-colors', value === t ? 'text-paper' : 'text-paper/70 hover:text-paper')}
          >
            {t === 'abend' ? 'Am Abend' : 'Am Morgen'}
          </button>
        </span>
      ))}
    </div>
  )
}

/**
 * Ebene mit der jeweils anderen Stimmung über dem Startbild. Beim Umschalten deckt sie sich von links nach rechts auf,
 * entlang der Kante wandert ein schmales Licht (eine weiche, helle Linie, kein Verlauf). Rückweg ebenso.
 */
const DayLayer = forwardRef<HTMLDivElement, { base: Tod; tod: Tod | null; mobile: boolean }>(function DayLayer({ base, tod, mobile }, ref) {
  const other: Tod = base === 'abend' ? 'morgen' : 'abend'
  const shown = tod === other
  // Bild erst laden, wenn jemand den Schalter benutzt (kein Einfluss auf den Seitenaufbau)
  const [used, setUsed] = useState(false)
  useEffect(() => {
    if (tod) setUsed(true)
  }, [tod])
  if (!used) return <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0" />
  const src = other === 'morgen' ? hero.still[mobile ? 'morgen-m' : 'morgen-d'] : hero.still[mobile ? 'aussen-m' : 'aussen-d']
  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0">
      <div className="photo hero-stage absolute overflow-hidden" style={{ ['--fw' as string]: `${FRAME_W}px`, ['--fh' as string]: `${FRAME_H}px` }}>
        <div className="day-wipe absolute inset-0" data-on={shown || undefined}>
          <img src={src} alt="" decoding="async" className="absolute inset-0 size-full object-cover max-md:object-[40%_50%]" />
        </div>
        <div className="absolute inset-0 [container-type:inline-size]">
          <span className="day-edge" data-on={shown || undefined} />
        </div>
      </div>
    </div>
  )
})

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
  // Startbild: am Abend (Gebäude, Feierabend) oder am Morgen (sauberes Büro). Wirkt nur vor dem Scrollen.
  const [tod, setTod] = useState<'abend' | 'morgen' | null>(null)
  const dayLayer = useRef<HTMLDivElement>(null)

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
      // Dunkler Verlauf bleibt voll, bis der Text ganz ausgeblendet ist (Kontrast auf jedem Frame mit Text),
      // danach weicht er, und das Video wirkt hell und klar
      if (shade.current) shade.current.style.opacity = String(Math.min(1, Math.max(0, 1 - (p - 0.1) / 0.06)))
      if (outro.current) outro.current.style.opacity = String(Math.max(0, (p - OUTRO) / (1 - OUTRO)))
      // Gewählte Stimmung weicht, sobald die Scroll-Sequenz läuft
      if (dayLayer.current) dayLayer.current.style.opacity = String(Math.max(0, 1 - p / 0.06))
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

  const morning = mode === 'static-morning'

  return (
    <section ref={section} aria-labelledby="hero-title" className="relative" data-tone-start="dark" data-tone-end="paper">
      <div ref={spacer}>
        <div ref={pin} className="relative h-[100svh] min-h-[560px] overflow-hidden bg-night">
          {/* Bildfläche: Desktop höchstens in nativer Framegröße (keine Streckung über 100 %). Einheitliche Farbbehandlung. */}
          <div className="photo hero-stage absolute overflow-hidden" style={{ ['--fw' as string]: `${FRAME_W}px`, ['--fh' as string]: `${FRAME_H}px` }}>
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
                {/* Am Ende, wenn das Büro am Morgen makellos ist: drei kurze Glanzpunkte, einmalig.
                    Die Ebene bildet object-cover nach, damit die Punkte auf den Tischen sitzen. */}
                <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden [container-type:size]">
                  <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                    style={{ width: `max(100cqw, calc(100cqh * ${FRAME_W / FRAME_H}))`, height: `max(100cqh, calc(100cqw * ${FRAME_H / FRAME_W}))` }}
                  >
                    {GLINTS.map((g, i) => (
                      <Sparkle
                        key={i}
                        play={step === 2}
                        delay={g.delay}
                        className="absolute -translate-x-1/2 -translate-y-1/2"
                        style={{ left: `${g.x * 100}%`, top: `${g.y * 100}%`, width: g.size, height: g.size }}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Umschalter Abend/Morgen: die jeweils andere Stimmung liegt als eigene Ebene über Startbild und Video */}
          <DayLayer ref={dayLayer} base={morning ? 'morgen' : 'abend'} tod={tod} mobile={isMobile} />

          {/* Lesbarkeit: ruhige Abdunklung, dazu ein Verlauf von unten hinter dem gesamten Textblock */}
          <div ref={shade} aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-night/20" />
            <div className="absolute inset-x-0 bottom-0 h-[80%] bg-[linear-gradient(to_top,rgb(10_26_51/0.88)_0%,rgb(10_26_51/0.7)_35%,rgb(10_26_51/0.32)_68%,rgb(10_26_51/0)_100%)] lg:h-[72%]" />
          </div>

          {/* Text: H1 aus Keyword-Zeile und Leitidee (Display), unten im Raster */}
          <div className="on-dark container-site relative flex h-full flex-col justify-end pt-24 pb-[max(2.5rem,env(safe-area-inset-bottom))] text-paper sm:pb-14 lg:pb-[9vh]">
            <div ref={copy} className="will-change-transform">
              <RevealText
                as="h1"
                id="hero-title"
                text={home.hero.headline}
                immediate
                kicker={
                  <span
                    className="fade-up-now mt-6 block text-[0.875rem] leading-[1.45] font-medium tracking-[0.03em] text-paper lg:mt-8 lg:text-[1rem]"
                    style={{ ['--d' as string]: '0.45s' }}
                  >
                    {home.hero.kicker}
                  </span>
                }
                kickerAfter
                wordsClassName="t-display block text-paper"
              />
              <div className="fade-up-now mt-9 flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8 lg:mt-12" style={{ ['--d' as string]: '0.6s' }}>
                <QuoteButton size="lg" arrow full={isMobile}>
                  {home.hero.cta}
                </QuoteButton>
                <a href={company.phone.href} className="tlink self-center text-paper sm:self-auto">
                  oder anrufen: {company.phone.display}
                </a>
              </div>
              <DaySwitch value={tod ?? (morning ? 'morgen' : 'abend')} onChange={setTod} />
            </div>
          </div>

          {/* Szenen-Untertitel mit dünner Fortschrittslinie (Desktop) */}
          {desktopVideo && (
            <div
              aria-hidden
              className={cn('pointer-events-none absolute right-0 bottom-0 left-0 transition-opacity duration-500', step === 0 ? 'opacity-0 lg:opacity-100' : 'opacity-100')}
            >
              <div className="container-site flex justify-end pb-6 lg:pb-[9vh]">
                <div className="w-64 text-paper">
                  <p className="flex justify-between font-medium tabular-nums text-[0.75rem] text-paper/80">
                    <span>
                      {String(step + 1).padStart(2, '0')} / {String(home.hero.sceneSteps.length).padStart(2, '0')}
                    </span>
                    <span>{step === 0 ? 'Scrollen' : ''}</span>
                  </p>
                  <p className="mt-2 text-[0.9375rem]">{home.hero.sceneSteps[step]}</p>
                  <span className="relative mt-3 block h-px bg-paper/25">
                    <span
                      className="absolute inset-0 origin-left bg-paper transition-transform duration-300"
                      style={{ transform: `scaleX(${(step + 1) / home.hero.sceneSteps.length})` }}
                    />
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Ruhiger Übergang zur nächsten Sektion (Desktop): blendet in Off-White */}
          <div ref={outro} aria-hidden className="pointer-events-none absolute inset-0 bg-paper opacity-0" />
        </div>
      </div>

      {/* Handy: Sequenz mit Überschrift und drei Schritten */}
      {mobileVideo && <HeroMobileSequence onFailed={() => setFailedMobile(true)} />}
    </section>
  )
}
