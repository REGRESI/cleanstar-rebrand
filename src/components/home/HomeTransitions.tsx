import { whenNear } from '@/lib/whenNear'
import { useEffect, useRef, type ReactNode } from 'react'
import { ScrollTrigger } from '@/lib/gsap'
import { prefersReducedMotion } from '@/lib/env'
import { span } from '@/lib/scrollScene'

export type HomeTransition = 'circle-title' | 'horizontal-scroll' | 'card-stack' | 'flow-color' | 'paper-reveal' | 'light-edge' | 'logo-house' | 'clouds' | 'growing-window'
const animated = new Set<HomeTransition>(['card-stack', 'light-edge', 'logo-house', 'growing-window'])

/** One real incoming surface per boundary: no cloned text, snapshots or extra focus targets.
 * The preceding surface rests with its last viewport visible. The next surface is revealed
 * in that same viewport, then rejoins normal flow. CSS reserves the overlap before hydration.
 */
export function HomeBlock({ id, transition, outgoing = false, reading = false, children }: { id: string; transition?: HomeTransition; outgoing?: boolean; reading?: boolean; children: ReactNode }) {
  return <div data-home-section={id} data-transition={transition} className={`ht-block${outgoing ? ' ht-hold' : ''}${reading ? ' ht-reading' : ''}${transition && animated.has(transition) ? ' ht-incoming' : ''}`}>
    <div className="ht-plane">{children}</div>
    {outgoing && <div className="ht-tail" aria-hidden />}
    {transition === 'light-edge' && <div className="ht-glint" aria-hidden />}
    {transition === 'logo-house' && <svg className="ht-house-mark" aria-hidden viewBox="96 404 168 180"><path d="M112 472 179 422 248 472V566H112Z" fill="none" stroke="currentColor" strokeWidth="18" strokeLinejoin="round" /></svg>}
  </div>
}

export function HomeTransitions({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = root.current
    if (!el) return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    let dispose = () => {}
    const setup = () => {
      dispose()
      if (prefersReducedMotion() || !document.documentElement.classList.contains('js-motion')) return
      const blocks = Array.from(el.querySelectorAll<HTMLElement>(':scope > [data-home-section]'))
      const stops: (() => void)[] = []
      blocks.forEach((block, i) => {
        const type = block.dataset.transition as HomeTransition
        if (!animated.has(type)) return
        const plane = block.firstElementChild as HTMLElement
        const previous = blocks[i - 1]
        const old = previous?.firstElementChild as HTMLElement | undefined
        if (!old) return
        const cancelNear = whenNear(block, () => {
        const ruler = el.querySelector<HTMLElement>('.ht-viewport')!
        let vh = ruler.offsetHeight
        let width = window.innerWidth
        let oldH = old.offsetHeight
        const touch = window.matchMedia('(pointer: coarse)').matches
        const measure = () => {
          vh = ruler.offsetHeight
          width = window.innerWidth
          oldH = old.offsetHeight
          previous.style.setProperty('--ht-top', `${Math.min(0, vh - oldH)}px`)
        }
        const ro = new ResizeObserver(measure)
        ro.observe(old)
        measure()
        let previousProgress = 0
        const apply = (p: number) => {
          const active = p > 0 && p < 1
          block.classList.toggle('ht-active', active)
          const t = p * p * (3 - 2 * p)
          // Counter-translate only during entry: the actual next content stands behind its mask.
          const entryY = (1 - p) * vh
          block.style.setProperty('--ht-enter-y', `${active ? entryY : 0}px`)
          plane.style.transform = active ? `translate3d(0,${(-entryY).toFixed(2)}px,0)` : ''
          plane.style.clipPath = ''
          plane.style.opacity = ''
          plane.style.borderRadius = ''
          if (type === 'card-stack') {
            // Natural rise of the card, rather than a second translation of the full section.
            plane.style.transform = ''
            plane.style.borderRadius = `${(36 * (1 - t)).toFixed(1)}px ${(36 * (1 - t)).toFixed(1)}px 0 0`
            old.style.transformOrigin = '50% 100%'
            old.style.transform = p > 0 && p < 1 ? `scale(${(1 - t * .035).toFixed(4)})` : ''
            // Whole-section brightness/blur repaints a full viewport on every touch frame.
            old.style.filter = !touch && active ? `brightness(${(1 - t * .12).toFixed(3)})` : ''
          } else if (type === 'light-edge') {
            // Soft 32px wiping edge; the content behind it is already the next section.
            const x = t * 100
            plane.style.clipPath = p >= 1 ? '' : `inset(0 ${(100 - t * 100).toFixed(3)}% 0 0)`
            block.style.setProperty('--ht-wipe', `${x}vw`)
            block.style.setProperty('--ht-glow', String(Math.sin(p * Math.PI)))
          } else if (type === 'growing-window') {
            const insetX = (1 - t) * (vh < 700 || width < 768 ? 12 : 34)
            const insetY = (1 - t) * 31
            plane.style.clipPath = p >= 1 ? '' : `inset(${(insetY * vh / 100).toFixed(2)}px ${insetX.toFixed(2)}% ${(insetY * vh / 100).toFixed(2)}px round ${(28 * (1-t)).toFixed(1)}px)`
            block.style.setProperty('--ht-copy', String(span(p, .45, .9)))
          } else if (type === 'logo-house') {
            // Exact house outline from Logo.tsx/preloader, scaled around the viewport centre.
            const w = width
            const scale = .58 + Math.pow(t, 2.1) * Math.max(w, vh) / 45
            const points = [[112,472],[179,422],[248,472],[248,566],[112,566]]
              .map(([x,y]) => `${(w/2+(x-180)*scale).toFixed(1)}px ${(vh/2+(y-494)*scale).toFixed(1)}px`).join(',')
            plane.style.clipPath = p >= 1 ? '' : `polygon(${points})`
            block.style.setProperty('--ht-house-scale', String(scale))
            block.style.setProperty('--ht-house-opacity', String(1 - span(p, .05, .55)))
          }
          // Release the outgoing surface once covered. Reverse scrolling restores it symmetrically.
          if ((p === 0 && previousProgress > 0) || p === 1) {
            old.style.transform = ''
            old.style.filter = ''
            old.style.opacity = ''
          }
          previousProgress = p
          block.dataset.progress = p.toFixed(4)
        }
        const st = ScrollTrigger.create({ trigger: block, start: () => block.getBoundingClientRect().top + window.scrollY - vh, end: () => block.getBoundingClientRect().top + window.scrollY, onRefreshInit: measure, onUpdate: s => apply(s.progress), onRefresh: s => apply(s.progress) })
        apply(st.progress)
        // Focusing a newly revealed control must expose the real section immediately.
        const focus = () => { if (st.progress < 1) window.scrollTo({top: st.end, behavior: 'instant' as ScrollBehavior}) }
        block.addEventListener('focusin', focus)
        stops.push(() => {
          st.kill(); ro.disconnect(); block.removeEventListener('focusin', focus)
          block.classList.remove('ht-active')
          for (const n of [plane, old]) { n.style.transform = ''; n.style.filter = ''; n.style.opacity = ''; n.style.clipPath = ''; n.style.borderRadius = '' }
          plane.querySelectorAll<HTMLElement>(':scope > section > .container-site > *').forEach(n => { n.style.transform = ''; n.style.opacity = '' })
        })
        })
        stops.push(cancelNear)
      })
      dispose = () => stops.forEach(stop => stop())
    }
    setup()
    mq.addEventListener('change', setup)
    return () => { dispose(); mq.removeEventListener('change', setup) }
  }, [])
  return <div ref={root} className="ht-home" data-home-transitions><div className="ht-viewport" aria-hidden />{children}</div>
}
