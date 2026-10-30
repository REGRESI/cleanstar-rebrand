import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { MomentHeading, MomentGlow } from '@/components/ui/MomentHeading'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { liteMotion } from '@/lib/motionBudget'
import { span } from '@/lib/scrollScene'
import { cn } from '@/lib/cn'

/** Freigestelltes Deko-Bild aus public/images/deko (AVIF/WebP mit Alpha, mehrere Breiten) */
function Deko({ name, widths, w, h, sizes, className, ...rest }: { name: string; widths: number[]; w: number; h: number; sizes: string; className?: string; [k: `data-${string}`]: string }) {
  const set = (ext: string) => widths.map((x) => `/images/deko/${name}-${x}.${ext} ${x}w`).join(', ')
  return (
    <picture className={className} {...rest}>
      <source type="image/avif" srcSet={set('avif')} sizes={sizes} />
      <img src={`/images/deko/${name}-${widths[0]}.webp`} srcSet={set('webp')} sizes={sizes} width={w} height={h} alt="" loading="lazy" decoding="async" />
    </picture>
  )
}

/**
 * Pflanzen-Abschnitt (Referenz: ERA, era/03): ruhige helle Fläche, mittig eine Moment-Überschrift und ein kurzer Satz.
 * Eine üppige, freigestellte Efeutute hängt von der oberen rechten Ecke ins Bild (etwa ein Viertel der Breite), eine
 * kleinere wächst aus der unteren linken Ecke. Leichte Parallaxe, die Ranken wiegen sich minimal.
 */
export function PlantMoment({ title, text, id, eyebrow, className }: { title: string; text: string; id: string; eyebrow?: string; className?: string }) {
  const root = useRef<HTMLElement>(null)
  useEffect(() => {
    const el = root.current
    if (!el || liteMotion()) return
    const ctx = gsap.context(() => {
      const st = { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.6 }
      gsap.fromTo('[data-plant="a"]', { y: -30 }, { y: 60, ease: 'none', scrollTrigger: st })
      gsap.fromTo('[data-plant="b"]', { y: 50 }, { y: -30, ease: 'none', scrollTrigger: st })
    }, el)
    return () => ctx.revert()
  }, [])
  return (
    <section ref={root} className={cn('plant-moment relative overflow-hidden bg-paper', className)} aria-labelledby={id}>
      <MomentGlow />
      <Deko data-plant="a" name="pflanze-ecke-1" widths={[640, 1024]} w={1024} h={1536} sizes="(min-width: 768px) 26vw, 46vw" className="plant plant-a" />
      <Deko data-plant="b" name="pflanze-ecke-2" widths={[700, 1312]} w={1312} h={1199} sizes="(min-width: 768px) 22vw, 44vw" className="plant plant-b" />
      <div className="container-site relative flex min-h-[78svh] flex-col items-center justify-center py-28 text-center">
        {eyebrow && <p className="t-label">{eyebrow}</p>}
        <MomentHeading id={id} text={title} className="mt-6" />
        <p className="t-lead mt-8 max-w-[40ch] text-ink-2">{text}</p>
      </div>
    </section>
  )
}

/**
 * Wolken-Übergang (Referenz: ERA, era/13): Von unten steigt eine Bank echter, freigestellter Wolken auf (Oberkante
 * läuft weich in die Fläche aus), deckt den Inhalt darunter kurz ab und zieht dann in mehreren Ebenen mit
 * unterschiedlichem Tempo nach oben weg, bis sie sich auflöst. Darunter liegt die Geländekarte der Ortenau gestochen
 * scharf (der Blick von oben). Keine Weißflächen, kein Nebel auf dem Bild. Reduzierte Bewegung: keine
 * Wolken. Ebenen aus einem Wolkenbild (bilder/deko/wolken-1.png): Original, gespiegelt, weichgezeichneter Ausschnitt.
 */
// top: Lage der Ebene; die untere Hälfte jedes Wolkenbilds ist deckend (Höhe in vw, da die Ebenen 120vw breit sind)
// Handy (topM): Karte samt Liste ist hoch, die Wolken decken nur die Karte (etwa 92vw hoch)
const CLOUDS: { name: string; h: number; top: string; topM: string; speed: number; flip?: boolean }[] = [
  { name: 'wolken-ebene-c', h: 1136, top: 'calc(-36vw + 0%)', topM: '-36vw', speed: 0.75 },
  { name: 'wolken-ebene-b', h: 1080, top: 'calc(-31vw + 18%)', topM: '-10vw', speed: 1.05 },
  { name: 'wolken-ebene-a', h: 821, top: 'calc(-22vw + 42%)', topM: '30vw', speed: 1.4 },
  { name: 'wolken-ebene-b', h: 1080, top: 'calc(-30vw + 66%)', topM: '40vw', speed: 1.75, flip: true },
]
export function CloudCover({ children, className }: { children: ReactNode; className?: string }) {
  const root = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = root.current
    if (!el || liteMotion()) return
    const ls = Array.from(el.querySelectorAll<HTMLElement>('[data-cloud]'))
    const apply = (p: number) => {
      // von unten aufsteigen (bis 0,35), kurz abdecken, dann in Ebenen mit eigenem Tempo nach oben wegziehen; erst ganz am
      // Ende ausblenden (sonst wirkten die Wolken wie ein Nebelschleier über der Karte)
      const rise = 1 - span(p, 0, 0.35)
      ls.forEach((l, i) => {
        const sp = Number(l.dataset.cloud)
        const k = span(p, 0.42, 1)
        const y = rise * rise * 38 - Math.pow(k, 1.5) * sp * 150
        const o = 1 - span(p, 0.82 + i * 0.03, 1)
        l.style.transform = `translate3d(0, ${y.toFixed(2)}%, 0) scale(${(1 + k * 0.12 * sp).toFixed(3)})`
        l.style.opacity = o.toFixed(3)
      })
    }
    const st = ScrollTrigger.create({ trigger: el, start: 'top bottom', end: 'top -15%', scrub: 0.4, onUpdate: (x) => apply(x.progress), onRefresh: (x) => apply(x.progress) })
    apply(st.progress)
    el.setAttribute('data-ready', '')
    return () => {
      st.kill()
      el.removeAttribute('data-ready')
    }
  }, [])
  return (
    <div ref={root} className={cn('cc', className)}>
      {children}
      <div aria-hidden className="cc-layers">
        {CLOUDS.map((c, i) => (
          <div key={i} data-cloud={c.speed} className="cc-layer" style={{ '--t': c.top, '--tm': c.topM } as CSSProperties}>
            <Deko name={c.name} widths={[960, 1916]} w={1916} h={c.h} sizes="120vw" className={cn('block', c.flip && '-scale-x-100')} />
          </div>
        ))}
      </div>
    </div>
  )
}
