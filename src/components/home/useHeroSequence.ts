import { useEffect, useRef, useState, type RefObject } from 'react'
import hero from 'virtual:hero-frames'
import { ScrollTrigger } from '@/lib/gsap'
import { onIdle } from '@/lib/idle'
import { useFrameSequence } from './useFrameSequence'

/** Ruhezeit, nach der an einem Schlüsselmoment das scharfe Standbild eingeblendet wird */
const IDLE_MS = 150
/** Toleranz um einen Schlüsselmoment (Anteil der Sequenz) */
const KEY_RANGE = 0.03

interface Options {
  /** Sequenz aktiv (richtiges Layout, keine reduzierte Bewegung, kein Datensparmodus) */
  enabled: boolean
  urls: string[]
  section: RefObject<HTMLElement | null>
  pin: RefObject<HTMLElement | null>
  canvas: RefObject<HTMLCanvasElement | null>
  /** Länge der Scrollstrecke in Bildschirmhöhen */
  lengthVh: number
  /** Anteil der Scrollstrecke, über den die Sequenz läuft (danach steht das letzte Bild) */
  play: number
  /** wird bei jedem Scroll-Update mit Gesamtfortschritt und Sequenzfortschritt aufgerufen */
  onProgress?: (p: number, seq: number) => void
}

/**
 * Scroll-Video als Bildsequenz: gepinnte Sektion (GSAP ScrollTrigger), Zeichnen auf <canvas> 1:1 ohne Skalierung
 * (Darstellung per object-fit im Browser) und scharfe Standbilder an Schlüsselmomenten, wenn man stehen bleibt.
 */
export function useHeroSequence({ enabled, urls, section, pin, canvas, lengthVh, play, onProgress }: Options) {
  const target = useRef(0)
  const progressCb = useRef(onProgress)
  progressCb.current = onProgress
  const [load, setLoad] = useState(false)
  const [drawn, setDrawn] = useState(false)
  const [activeKey, setActiveKey] = useState<string | null>(null)
  const { nearest, progress, failed } = useFrameSequence(urls, enabled && load)

  // Frames erst laden, wenn die Seite steht (LCP und Interaktivität zuerst)
  useEffect(() => {
    if (!enabled) return
    const start = () => onIdle(() => setLoad(true), 1200)
    if (document.readyState === 'complete') return start()
    let cancel = () => {}
    const onLoad = () => (cancel = start())
    window.addEventListener('load', onLoad, { once: true })
    return () => {
      window.removeEventListener('load', onLoad)
      cancel()
    }
  }, [enabled])

  // Gepinnte Sektion, Scrollfortschritt und Schlüsselmomente
  useEffect(() => {
    if (!enabled || !section.current || !pin.current) return
    let timer = 0
    const activity = () => {
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
    const st = ScrollTrigger.create({
      trigger: section.current,
      pin: pin.current,
      start: 'top top',
      end: () => `+=${window.innerHeight * lengthVh}`,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        target.current = Math.min(1, self.progress / play)
        progressCb.current?.(self.progress, target.current)
        activity()
      },
    })
    activity()
    return () => {
      window.clearTimeout(timer)
      st.kill()
    }
  }, [enabled, section, pin, lengthVh, play])

  // Zeichnen: weich zum Ziel-Frame interpolieren, 1:1 ohne Skalierung, nur bei Änderung
  useEffect(() => {
    if (!enabled || !load) return
    const cv = canvas.current
    const ctx = cv?.getContext('2d', { alpha: false })
    if (!cv || !ctx) return
    let raf = 0
    let current = target.current
    let lastImg: HTMLImageElement | null = null
    let first = true
    const loop = () => {
      raf = requestAnimationFrame(loop)
      current += (target.current - current) * 0.22
      if (Math.abs(target.current - current) < 0.0005) current = target.current
      const img = nearest(Math.round(current * (urls.length - 1)))
      if (!img || img === lastImg) return
      if (cv.width !== img.naturalWidth || cv.height !== img.naturalHeight) {
        cv.width = img.naturalWidth
        cv.height = img.naturalHeight
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
      }
      ctx.drawImage(img, 0, 0)
      lastImg = img
      if (first) {
        first = false
        setDrawn(true)
      }
    }
    raf = requestAnimationFrame(loop)
    // außer Sicht: Schleife anhalten
    const io = new IntersectionObserver(([e]) => {
      cancelAnimationFrame(raf)
      if (e.isIntersecting) raf = requestAnimationFrame(loop)
    })
    io.observe(cv)
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
    }
  }, [enabled, load, urls, nearest, canvas])

  return { load, drawn, activeKey, progress, failed }
}
