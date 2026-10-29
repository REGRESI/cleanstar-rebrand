import { useEffect, useRef, useState } from 'react'
import hero from 'virtual:hero-frames'
import { home } from '@/content/site'
import { cn } from '@/lib/cn'
import { useHeroSequence } from './useHeroSequence'
import { KeyOverlays } from './KeyOverlays'
import { GLINTS } from './glints'
import { Sparkle } from '@/components/ui/Sparkle'

/** Grenzen der drei Schritte im Sequenzfortschritt (Feierabend, Reinigung, Morgen) */
const STEP_AT = [0, 0.5, 0.9]

/**
 * Handy: Scroll-Video im 16:9-Slot in voller Breite. Darüber eine kurze Überschrift, darunter die drei Schritte als
 * nummerierte Zeilen; der aktuelle Schritt wird passend zur Scrollposition hervorgehoben, eine Linie zeigt den Fortschritt.
 */
export function HeroMobileSequence({ onFailed }: { onFailed: () => void }) {
  const section = useRef<HTMLElement>(null)
  const pin = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const bar = useRef<HTMLSpanElement>(null)
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
      if (bar.current) bar.current.style.transform = `scaleX(${sp})`
      setStep(sp >= STEP_AT[2] ? 2 : sp >= STEP_AT[1] ? 1 : 0)
    },
  })

  useEffect(() => {
    if (seq.failed) onFailed()
  }, [seq.failed, onFailed])

  return (
    <section ref={section} aria-labelledby="hero-seq-title" className="relative md:hidden">
      <div ref={pin} className="relative flex h-[100svh] flex-col justify-center bg-paper px-5 pt-20 pb-20">
        <p className="t-label mb-4">So arbeiten wir</p>
        <h2 id="hero-seq-title" className="text-[2.25rem] leading-[1.02] font-medium tracking-[-0.035em] text-ink">
          {home.hero.sequenceTitle}
        </h2>

        <div className="photo relative mt-7 aspect-video w-full overflow-hidden bg-surface">
          <img src={hero.mobile[0]} alt="" aria-hidden width={1280} height={721} loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover" />
          <canvas ref={canvas} aria-hidden className={cn('absolute inset-0 size-full object-cover transition-opacity duration-300', seq.drawn ? 'opacity-100' : 'opacity-0')} />
          {seq.load && <KeyOverlays activeKey={seq.activeKey} variant="m" />}
          {/* Morgen: kurze Glanzpunkte auf den Tischen, einmalig */}
          {GLINTS.map((g, i) => (
            <Sparkle
              key={i}
              play={step === 2}
              delay={g.delay}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${g.x * 100}%`, top: `${g.y * 100}%`, width: g.size * 0.6, height: g.size * 0.6 }}
            />
          ))}
          {seq.load && seq.progress < 1 && (
            <span
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-px origin-left bg-paper transition-transform duration-300"
              style={{ transform: `scaleX(${seq.progress})` }}
            />
          )}
        </div>

        <div className="relative mt-6 h-px bg-line">
          <span aria-hidden ref={bar} className="absolute inset-0 origin-left bg-ink" style={{ transform: 'scaleX(0)' }} />
        </div>
        <ol className="mt-1" aria-label="Ablauf über Nacht">
          {home.hero.sequenceSteps.map((s, i) => {
            const on = i === step
            return (
              <li key={s.title} aria-current={on ? 'step' : undefined} className="grid grid-cols-[2.5rem_1fr] border-b border-line py-3">
                <span className="t-label pt-0.5">{String(i + 1).padStart(2, '0')}</span>
                <span>
                  <span className={cn('block font-medium transition-colors duration-300', on ? 'text-ink' : 'text-ink-2')}>{s.title}</span>
                  <span className="block text-[0.9375rem] text-ink-2">{s.text}</span>
                </span>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
