import { createContext, useCallback, useContext, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { defaultRecipient, type Recipient } from './personal'
import { images, type ImageId } from '@/content/images'
import { cn } from '@/lib/cn'

/** Seitenformat der Mappe in CSS-Pixeln (Hochformat 1 : 1,4). Dieselbe Größe für HTML-Seite, Textur und PDF. */
export const PAGE_W = 600
export const PAGE_H = 840

export type Side = 'left' | 'right'

export interface PageProps {
  /** true, sobald die Doppelseite aufgeschlagen ist und still liegt: Bewegung starten. false: Ausgangszustand. */
  play: boolean
  side: Side
  /** Seitenzahl (1-basiert) */
  folio: number
  /** Wird als Textur abfotografiert: keine Videos, keine laufenden Medien */
  snapshot?: boolean
}

export interface MappeCtx {
  /** Zur Seite blättern (0-basierter Index) */
  jump: (index: number) => void
  /** Kleine Vorschaubilder der Seiten (Data-URLs), sobald erzeugt */
  previews: Record<number, string>
  /** Gerade überfahrene Leistung (für das Foto auf der Gegenseite) */
  hoverService: number | null
  setHoverService: (i: number | null) => void
  /** Index einer Seite anhand ihrer Kennung */
  indexOf: (id: string) => number
  /** Gemeinsamer Zustand der Seiten (Uhrzeit, Regler, Intervall): echte Seite und Textur zeigen dasselbe */
  state: Record<string, unknown>
  setState: (key: string, value: unknown) => void
  /** Ausklappseite (Grundriss) geöffnet */
  foldOpen: boolean
  setFold: (open: boolean) => void
  /** Anfragekarte aus dem Einsteckfach ziehen */
  openRequest: () => void
  /** 3D-Buch (true) oder flache Mappe */
  is3d: boolean
}

export const Ctx = createContext<MappeCtx>({
  jump: () => {},
  previews: {},
  hoverService: null,
  setHoverService: () => {},
  indexOf: () => -1,
  state: {},
  setState: () => {},
  foldOpen: false,
  setFold: () => {},
  openRequest: () => {},
  is3d: false,
})
export const useMappe = () => useContext(Ctx)

/** Für wen die Mappe ist (personalisierter Link). Eigener Kontext, damit auch PDF und Texturen ihn kennen. */
export const RecipientCtx = createContext<Recipient>(defaultRecipient)
export const useRecipient = () => useContext(RecipientCtx)

/** Zustand einer Seite, geteilt zwischen echter Seite und Textur-Vorlage */
export function usePageState<T>(key: string, initial: T): [T, (v: T) => void] {
  const { state, setState } = useMappe()
  const [local, setLocal] = useState<T>(initial)
  const shared = key in state
  const value = shared ? (state[key] as T) : local
  const set = useCallback(
    (v: T) => {
      setLocal(v)
      setState(key, v)
    },
    [key, setState],
  )
  return [value, set]
}

/** Hält Pointer-Ereignisse von Bedienelementen fern vom Blättern (Sperrzone) */
export const NO_TURN = { 'data-interactive': '' } as const

/** Sofort-Modus (Texturen, PDF): Animationen springen in ihren Endzustand */
export const InstantCtx = createContext(false)

/** Bild direkt als <img> (sofort geladen, damit die Seite als Textur vollständig ist) */
export function PageImg({ id, width = 640, className, style }: { id: ImageId; width?: 640 | 1024; className?: string; style?: CSSProperties }) {
  const spec = images[id]
  return (
    <img
      src={`${import.meta.env.BASE_URL}images/${spec.file}-${width}.webp`}
      alt={spec.alt}
      decoding="sync"
      draggable={false}
      className={cn('photo block size-full object-cover', className)}
      style={{ objectPosition: spec.position ?? '50% 50%', ...style }}
    />
  )
}

/**
 * Papierbogen: Off-White, Innenabstand, kleine Kopfzeile, Seitenzahl außen unten.
 * Zur Falz hin ein weicher Schatten (in Textur und HTML identisch, damit der Wechsel unsichtbar bleibt).
 */
export function Sheet({ side, folio, children, className, label = 'Leistungsmappe' }: { side: Side; folio: number; children: ReactNode; className?: string; label?: string }) {
  return (
    <div className="mappe-page relative overflow-hidden bg-[#f5f2eb] text-ink" style={{ width: PAGE_W, height: PAGE_H }}>
      <div className={cn('absolute inset-0 flex flex-col px-14 pt-14 pb-12', className)}>
        <div className={cn('mb-10 flex items-baseline justify-between t-label', side === 'left' ? 'flex-row' : 'flex-row-reverse')}>
          <span>CleanStar</span>
          <span>{label}</span>
        </div>
        <div className="relative flex min-h-0 flex-1 flex-col">{children}</div>
        <div className={cn('mt-6 t-meta', side === 'left' ? 'text-left' : 'text-right')}>{folio}</div>
      </div>
      {/* Falz: weicher Schatten zur Bindung, leichter Glanz außen */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 w-24"
        style={
          side === 'left'
            ? { right: 0, background: 'linear-gradient(to left, rgba(40,30,15,0.16), rgba(40,30,15,0.05) 30%, transparent)' }
            : { left: 0, background: 'linear-gradient(to right, rgba(40,30,15,0.18), rgba(40,30,15,0.05) 30%, transparent)' }
        }
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 w-10"
        style={
          side === 'left'
            ? { left: 0, background: 'linear-gradient(to right, rgba(255,255,255,0.35), transparent)' }
            : { right: 0, background: 'linear-gradient(to left, rgba(0,0,0,0.035), transparent)' }
        }
      />
    </div>
  )
}

/** Zählt beim Aufschlagen von 0 hoch (ruhig, 1,2 s) */
export function useCount(target: number, play: boolean, delay = 0) {
  const instant = useContext(InstantCtx)
  const [v, setV] = useState(0)
  useEffect(() => {
    if (!play) return setV(0)
    if (instant) return setV(target)
    let raf = 0
    const t0 = performance.now() + delay
    const step = (now: number) => {
      const p = Math.max(0, Math.min(1, (now - t0) / 1200))
      setV(target * (1 - Math.pow(1 - p, 4)))
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [target, play, delay, instant])
  return v
}

/** Nacheinander einblenden: liefert, wie viele von n Elementen schon sichtbar sind */
export function useStagger(n: number, play: boolean, every = 260, delay = 300) {
  const instant = useContext(InstantCtx)
  const [k, setK] = useState(0)
  const timers = useRef<number[]>([])
  useEffect(() => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    if (!play) return setK(0)
    if (instant) return setK(n)
    for (let i = 1; i <= n; i++) timers.current.push(window.setTimeout(() => setK(i), delay + every * (i - 1)))
    return () => timers.current.forEach(clearTimeout)
  }, [n, play, every, delay, instant])
  return k
}
