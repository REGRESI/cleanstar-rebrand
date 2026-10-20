import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { ArrowDown, CalendarCheck } from 'lucide-react'
import { RevealText } from '@/components/ui/RevealText'
import { Button } from '@/components/ui/Button'
import { QuoteButton } from '@/features/configurator/QuoteLink'
import { HeroPoster } from './HeroPoster'
import { home } from '@/content/site'
import { company } from '@/content/company'
import { getDeviceTier, hasWebGL, useReducedMotion, type DeviceTier } from '@/lib/env'
import { ScrollTrigger } from '@/lib/gsap'
import { cn } from '@/lib/cn'

const HeroScene = lazy(() => import('@/components/three/HeroScene'))

type Idle = (cb: () => void, o?: { timeout: number }) => number

export function Hero() {
  const reduced = useReducedMotion()
  const section = useRef<HTMLElement>(null)
  const copy = useRef<HTMLDivElement>(null)
  const progress = useRef(0)
  const [enable3d, setEnable3d] = useState(false)
  const [tier, setTier] = useState<DeviceTier>('low')
  const [ready, setReady] = useState(false)
  const [inView, setInView] = useState(true)
  const [step, setStep] = useState(0)

  // 3D erst nach dem ersten Rendern laden: Desktop im Leerlauf, Handy/schwache Geräte erst bei der ersten Interaktion.
  // So bleibt die Überschrift das LCP-Element und die Startseite schnell.
  useEffect(() => {
    if (reduced || !hasWebGL()) return
    const t = getDeviceTier()
    setTier(t)
    const mobile = window.matchMedia('(max-width: 1023px)').matches
    let idleId = 0
    const start = () => {
      cleanup()
      setEnable3d(true)
    }
    const events = ['scroll', 'pointerdown', 'touchstart', 'keydown'] as const
    const cleanup = () => events.forEach((e) => window.removeEventListener(e, start))
    if (mobile || t === 'low') {
      events.forEach((e) => window.addEventListener(e, start, { once: true, passive: true }))
    } else {
      const ric: Idle = (window as unknown as { requestIdleCallback?: Idle }).requestIdleCallback ?? ((cb) => window.setTimeout(cb, 600))
      idleId = ric(start, { timeout: 2500 })
    }
    return () => {
      cleanup()
      const cancel = (window as unknown as { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback
      if (cancel) cancel(idleId)
      else window.clearTimeout(idleId)
    }
  }, [reduced])

  // Scrollfortschritt der Hero-Sektion
  useEffect(() => {
    if (reduced || !section.current) return
    const st = ScrollTrigger.create({
      trigger: section.current,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        const p = self.progress
        progress.current = p
        if (copy.current) {
          const o = Math.max(0, 1 - p / 0.22)
          copy.current.style.opacity = String(o)
          copy.current.style.transform = `translateY(${-p * 120}px)`
          copy.current.style.visibility = o === 0 ? 'hidden' : 'visible'
        }
        setStep(p < 0.3 ? 0 : p < 0.62 ? 1 : 2)
      },
    })
    return () => st.kill()
  }, [reduced])

  // Nur rendern, wenn sichtbar
  useEffect(() => {
    if (!section.current) return
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: '100px' })
    io.observe(section.current)
    return () => io.disconnect()
  }, [])

  const animated = !reduced

  return (
    <section ref={section} aria-labelledby="hero-title" className={cn('relative', animated ? 'h-[240svh] lg:h-[320vh]' : '')}>
      <div className={cn('relative overflow-hidden', animated ? 'sticky top-0 h-[100svh]' : 'min-h-[100svh]')}>
        {/* Hintergrund */}
        <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-glacier via-white to-glacier" />
        <div aria-hidden className="bg-grid absolute inset-0 opacity-70 [mask-image:radial-gradient(ellipse_at_70%_40%,black,transparent_75%)]" />

        {/* Statisches Bild (bis 3D geladen ist bzw. als Fallback) */}
        <div
          aria-hidden
          className={cn(
            'absolute inset-x-0 bottom-0 flex h-[38%] items-end justify-center opacity-60 transition-opacity duration-1000 sm:h-[45%] lg:inset-y-0 lg:right-0 lg:left-auto lg:h-full lg:w-[58%] lg:items-center lg:opacity-100',
            ready && '!opacity-0',
          )}
        >
          <HeroPoster className="h-full max-h-[620px] w-auto max-w-full translate-y-6 lg:translate-y-0" />
        </div>

        {/* 3D-Szene */}
        {enable3d && (
          <div aria-hidden className={cn('absolute inset-0 transition-opacity duration-1000', ready ? 'opacity-100' : 'opacity-0')}>
            <Suspense fallback={null}>
              <HeroScene progress={progress} tier={tier} active={inView} onReady={() => setReady(true)} />
            </Suspense>
          </div>
        )}

        {/* Lesbarkeit: weicher Verlauf hinter dem Text */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/85 via-white/40 to-transparent lg:bg-gradient-to-r lg:from-white/90 lg:via-white/50 lg:to-transparent"
        />

        {/* Text */}
        <div className="container-site relative flex h-full flex-col pt-28 pb-10 sm:pt-36 lg:justify-center lg:pt-32">
          <div ref={copy} className="max-w-[40rem] will-change-transform">
            <p className="eyebrow fade-up-now mb-5" style={{ ['--d' as string]: '0.05s' }}>
              <span aria-hidden className="h-px w-6 bg-current" />
              {home.hero.eyebrow}
            </p>
            <RevealText as="h1" id="hero-title" text={home.hero.headline} immediate className="heading-display text-ink" />
            <p className="lead fade-up-now mt-6 max-w-xl text-base sm:text-xl" style={{ ['--d' as string]: '0.55s' }}>
              {home.hero.sub}
            </p>
            <div className="fade-up-now mt-8 flex flex-col gap-3 sm:flex-row" style={{ ['--d' as string]: '0.7s' }}>
              <QuoteButton size="lg" arrow>
                Kostenloses Angebot
              </QuoteButton>
              <Button to="/kontakt#besichtigung" variant="secondary" size="lg" icon={<CalendarCheck aria-hidden className="size-5 text-blue" />}>
                Objektbesichtigung buchen
              </Button>
            </div>
            <p className="fade-up-now mt-6 text-sm text-muted" style={{ ['--d' as string]: '0.85s' }}>
              Oder direkt anrufen:{' '}
              <a href={company.phone.href} className="font-semibold text-ink underline decoration-blue/40 underline-offset-4 hover:decoration-blue">
                {company.phone.display}
              </a>
            </p>
          </div>
        </div>

        {/* Szenen-Untertitel beim Scrollen */}
        {animated && (
          <div aria-hidden className={cn('pointer-events-none absolute inset-x-0 bottom-24 justify-center lg:bottom-5', step === 0 ? 'hidden sm:flex' : 'flex')}>
            <div className="glass flex items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium text-ink shadow-soft ring-1 ring-line">
              <span className="flex gap-1">
                {home.hero.sceneSteps.map((_, i) => (
                  <span key={i} className={cn('h-1.5 rounded-full transition-all duration-500', i === step ? 'w-6 bg-blue' : 'w-1.5 bg-ink/20')} />
                ))}
              </span>
              <span className="min-w-[12.5rem]">{step === 0 ? home.hero.scrollHint : home.hero.sceneSteps[step]}</span>
              {step === 0 && <ArrowDown className="size-4 animate-bounce text-blue" />}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
