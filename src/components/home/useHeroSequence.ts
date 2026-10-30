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
  /** Eigenes Element als Pin-Spacer (direkter Elternknoten von pin), damit GSAP nichts im DOM verschiebt */
  spacer?: RefObject<HTMLElement | null>
  canvas: RefObject<HTMLCanvasElement | null>
  /** Länge der Scrollstrecke in Bildschirmhöhen */
  lengthVh: number
  /** Anteil der Scrollstrecke, über den die Sequenz läuft (danach steht das letzte Bild) */
  play: number
  /** wird bei jedem Scroll-Update mit Gesamtfortschritt und Sequenzfortschritt aufgerufen */
  onProgress?: (p: number, seq: number) => void
  /** eigene Abbildung Gesamtfortschritt → Sequenzfortschritt (sonst p / play) */
  seqOf?: (p: number) => number
  /** Länge der Scrollstrecke auch ohne Sequenz einrichten (Pin bleibt, gezeichnet wird nicht) */
  pinOnly?: boolean
}

/**
 * Scroll-Video als Bildsequenz: gepinnte Sektion (GSAP ScrollTrigger), Zeichnen auf <canvas> 1:1 ohne Skalierung,
 * nur bei Änderung (requestAnimationFrame auf Anforderung)
 * (Darstellung per object-fit im Browser) und scharfe Standbilder an Schlüsselmomenten, wenn man stehen bleibt.
 */
export function useHeroSequence({ enabled, urls, section, pin, spacer, canvas, lengthVh, play, onProgress, seqOf, pinOnly }: Options) {
  const target = useRef(0)
  const progressCb = useRef(onProgress)
  progressCb.current = onProgress
  const seqRef = useRef(seqOf)
  seqRef.current = seqOf
  const [load, setLoad] = useState(false)
  const [drawn, setDrawn] = useState(false)
  const [activeKey, setActiveKey] = useState<string | null>(null)
  // Zeichnen nur auf Anforderung (Scroll-Update oder neu dekodiertes Frame), nicht dauerhaft
  const kick = useRef<() => void>(() => {})
  const { frame, progress, failed } = useFrameSequence(urls, enabled && !pinOnly && load, () => kick.current())

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
        kick.current()
        setActiveKey(key.name)
      }, IDLE_MS)
    }
    const st = ScrollTrigger.create({
      trigger: section.current,
      pin: pin.current,
      ...(spacer?.current ? { pinSpacer: spacer.current } : {}),
      start: 'top top',
      end: () => `+=${window.innerHeight * lengthVh}`,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        target.current = seqRef.current ? seqRef.current(self.progress) : Math.min(1, self.progress / play)
        progressCb.current?.(self.progress, target.current)
        activity()
        kick.current()
      },
    })
    activity()
    // Der Pin fügt Scrollweg ein: Alle Abschnitte darunter (Scroll-Text) müssen ihre Positionen neu berechnen.
    // Sonst stimmen sie nach einem Neuladen nicht, wenn dieser Trigger erst nach den anderen entsteht.
    ScrollTrigger.sort()
    ScrollTrigger.refresh()
    return () => {
      window.clearTimeout(timer)
      st.kill()
    }
  }, [enabled, section, pin, spacer, lengthVh, play])

  // Zeichnen: weich zum Ziel-Frame interpolieren, 1:1 ohne Skalierung. Die Schleife läuft nur, solange sich
  // das Bild noch ändert, und hält danach an; außerhalb des Bildschirms wird gar nicht gezeichnet.
  useEffect(() => {
    if (!enabled || !load || pinOnly) return
    const cv = canvas.current
    const ctx = cv?.getContext('2d', { alpha: false })
    if (!cv || !ctx) return
    let raf = 0
    let current = target.current
    let lastImg: unknown = null
    let first = true
    let visible = true
    const loop = () => {
      raf = 0
      current += (target.current - current) * 0.22
      if (Math.abs(target.current - current) < 0.0005) current = target.current
      const { img } = frame(Math.round(current * (urls.length - 1)))
      if (img && img !== lastImg) {
        const w = 'naturalWidth' in img ? img.naturalWidth : img.width
        const h = 'naturalHeight' in img ? img.naturalHeight : img.height
        if (cv.width !== w || cv.height !== h) {
          cv.width = w
          cv.height = h
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
      // weiter, solange wir noch nicht am Ziel sind. Fehlt das exakte Frame noch, stößt es die Schleife an, sobald es dekodiert ist.
      if (current !== target.current) raf = requestAnimationFrame(loop)
    }
    const start = () => {
      if (!raf && visible) raf = requestAnimationFrame(loop)
    }
    kick.current = start
    start()
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      if (!visible && raf) {
        cancelAnimationFrame(raf)
        raf = 0
      } else start()
    })
    io.observe(cv)
    return () => {
      kick.current = () => {}
      if (raf) cancelAnimationFrame(raf)
      io.disconnect()
    }
  }, [enabled, load, urls, frame, canvas, pinOnly])

  return { load, drawn, activeKey, progress, failed }
}
