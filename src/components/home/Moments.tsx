import { useEffect, useRef } from 'react'
import { MomentHeading, MomentGlow } from '@/components/ui/MomentHeading'
import { Picture } from '@/components/ui/Picture'
import type { ImageId } from '@/content/images'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { liteMotion } from '@/lib/motionBudget'
import { span } from '@/lib/scrollScene'

/**
 * Übergang B „Pflanzen-Abschnitt“ (Referenz: ERA, era/03): ruhige helle Fläche, mittig eine Moment-Überschrift und
 * ein kurzer Satz. Freigestellte Pflanzen rahmen zwei gegenüberliegende Ecken und bewegen sich leicht gegenläufig
 * (Parallaxe), immer innerhalb des Abschnitts.
 */
export function PlantMoment({ title, text, id, eyebrow }: { title: string; text: string; id: string; eyebrow?: string }) {
  const root = useRef<HTMLElement>(null)
  useEffect(() => {
    const el = root.current
    if (!el || liteMotion()) return
    const ctx = gsap.context(() => {
      const st = { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.6 }
      gsap.fromTo('[data-plant="a"]', { y: -40, rotate: -6 }, { y: 50, rotate: 2, ease: 'none', scrollTrigger: st })
      gsap.fromTo('[data-plant="b"]', { y: 50, rotate: 186 }, { y: -40, rotate: 176, ease: 'none', scrollTrigger: st })
    }, el)
    return () => ctx.revert()
  }, [])
  return (
    <section ref={root} className="plant-moment relative overflow-hidden bg-paper" aria-labelledby={id}>
      <MomentGlow />
      <img data-plant="a" src="/images/deko/pflanze-ecke.webp" alt="" aria-hidden width={884} height={840} loading="lazy" decoding="async" className="plant plant-a" />
      <img data-plant="b" src="/images/deko/pflanze-ecke.webp" alt="" aria-hidden width={884} height={840} loading="lazy" decoding="async" className="plant plant-b" />
      <div className="container-site relative flex min-h-[66svh] flex-col items-center justify-center py-24 text-center">
        {eyebrow && <p className="t-label">{eyebrow}</p>}
        <MomentHeading id={id} text={title} className="mt-6" />
        <p className="t-lead mt-8 max-w-[40ch] text-ink-2">{text}</p>
      </div>
    </section>
  )
}

/**
 * Übergang D „Wolken“ (Referenz: ERA, era/05): Wolken ziehen über das Bild der Region und lösen sich beim Scrollen
 * auf. Die Wolken sind der eine dekorative Verlauf dieser Stelle. Danach folgt der Abschnitt Einzugsgebiet mit der
 * Moment-Überschrift.
 */
export function CloudsReveal({ image = 'region' }: { image?: ImageId }) {
  const run = useRef<HTMLDivElement>(null)
  const layers = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = run.current
    if (!el || liteMotion()) return
    const ls = Array.from(layers.current?.children ?? []) as HTMLElement[]
    const dirs = [-1, 1, -0.6]
    const apply = (p: number) => {
      ls.forEach((l, i) => {
        const k = span(p, 0.05 + i * 0.08, 0.75 + i * 0.06)
        l.style.opacity = String(1 - k)
        l.style.transform = `translate3d(${(dirs[i] * k * 28).toFixed(2)}%, ${(-k * (10 + i * 6)).toFixed(2)}%, 0) scale(${(1 + k * 0.25).toFixed(3)})`
      })
    }
    const st = ScrollTrigger.create({ trigger: el, start: 'top bottom', end: 'bottom bottom', scrub: 0.5, onUpdate: (s) => apply(s.progress) })
    apply(st.progress)
    return () => st.kill()
  }, [])
  return (
    <div ref={run} className="clouds-run" aria-hidden>
      <div className="clouds-stage photo sticky top-0 overflow-hidden">
        <Picture id={image} aspect="absolute inset-0 size-full" sizes="100vw" />
        <div ref={layers} className="absolute inset-0">
          {[1, 2, 3].map((i) => (
            <img key={i} src={`/images/deko/wolken-${i}.webp`} alt="" width={1600} height={900} loading="lazy" decoding="async" className="clouds-layer" />
          ))}
        </div>
      </div>
    </div>
  )
}
