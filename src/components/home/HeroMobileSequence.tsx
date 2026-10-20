import { useEffect, useRef, useState } from 'react'
import hero from 'virtual:hero-frames'
import { home } from '@/content/site'
import { cn } from '@/lib/cn'
import { useHeroSequence } from './useHeroSequence'
import { KeyOverlays } from './KeyOverlays'

/** Grenzen der drei Schritte im Sequenzfortschritt (Feierabend, Reinigung, Morgen) */
const STEP_AT = [0, 0.5, 0.9]

/**
 * Handy: Scroll-Video als 16:9-Karte in voller Breite. Darüber eine kurze Überschrift, darunter die drei Schritte,
 * der aktuelle Schritt wird passend zur Scrollposition hervorgehoben. Heller Hintergrund, vertikal zentriert.
 */
export function HeroMobileSequence({ onFailed }: { onFailed: () => void }) {
  const section = useRef<HTMLElement>(null)
  const pin = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const bar = useRef<HTMLDivElement>(null)
  const [step, setStep] = useState(0)

  const seq = useHeroSequence({
    enabled: true,
    urls: hero.mobile,
    section,
    pin,
    canvas,
    lengthVh: 2.6,
    play: 0.92,
    onProgress: (_, sp) => {
      if (bar.current) bar.current.style.transform = `scaleY(${sp})`
      setStep(sp >= STEP_AT[2] ? 2 : sp >= STEP_AT[1] ? 1 : 0)
    },
  })

  useEffect(() => {
    if (seq.failed) onFailed()
  }, [seq.failed, onFailed])

  return (
    <section ref={section} aria-labelledby="hero-seq-title" className="relative md:hidden">
      <div ref={pin} className="relative flex h-[100svh] flex-col justify-center bg-gradient-to-b from-white to-glacier px-5 pt-20 pb-24">
        <p className="eyebrow mb-3">
          <span aria-hidden className="h-px w-6 bg-current" />
          So arbeiten wir
        </p>
        <h2 id="hero-seq-title" className="text-[1.875rem] leading-tight font-semibold tracking-tight text-ink">
          {home.hero.sequenceTitle}
        </h2>

        <div className="relative mt-6 aspect-video w-full overflow-hidden rounded-card bg-glacier-2 shadow-lift ring-1 ring-line">
          <img src={hero.mobile[0]} alt="" aria-hidden loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover" />
          <canvas ref={canvas} aria-hidden className={cn('absolute inset-0 size-full object-cover transition-opacity duration-300', seq.drawn ? 'opacity-100' : 'opacity-0')} />
          {seq.load && <KeyOverlays activeKey={seq.activeKey} variant="m" />}
          {seq.load && seq.progress < 1 && (
            <span
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-blue/70 transition-transform duration-300"
              style={{ transform: `scaleX(${seq.progress})` }}
            />
          )}
        </div>

        <ol className="relative mt-7 space-y-4 pl-7" aria-label="Ablauf über Nacht">
          <span aria-hidden className="absolute top-1.5 bottom-1.5 left-[0.4375rem] w-px bg-line" />
          <span aria-hidden ref={bar} className="absolute top-1.5 bottom-1.5 left-[0.4375rem] w-px origin-top scale-y-0 bg-blue" />
          {home.hero.sequenceSteps.map((s, i) => {
            const on = i === step
            const done = i < step
            return (
              <li key={s.title} aria-current={on ? 'step' : undefined} className="relative">
                <span
                  aria-hidden
                  className={cn(
                    'absolute top-1 -left-7 size-[0.9375rem] rounded-full ring-4 ring-white transition-colors duration-300',
                    on ? 'bg-blue' : done ? 'bg-blue/40' : 'bg-glacier-2',
                  )}
                />
                <p className={cn('font-semibold transition-colors duration-300', on ? 'text-ink' : 'text-muted')}>{s.title}</p>
                <p className={cn('text-sm transition-colors duration-300', on ? 'text-muted' : 'text-muted/70')}>{s.text}</p>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
