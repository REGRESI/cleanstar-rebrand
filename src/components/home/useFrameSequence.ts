import { useCallback, useEffect, useRef, useState } from 'react'

/** Gleichzeitige Downloads */
const PARALLEL = 5
/** Höchstzahl dekodierter Frames im Speicher (je Frame rund 8 MB auf Desktop) */
const MAX_DECODED = 6
/** Frames, die in Scrollrichtung vorab dekodiert werden */
const DECODE_AHEAD = 2

type Bitmap = ImageBitmap | HTMLImageElement

async function decode(blob: Blob): Promise<Bitmap> {
  if (typeof createImageBitmap === 'function') return createImageBitmap(blob)
  // Fallback für ältere Browser: über ein Bild-Element dekodieren
  const url = URL.createObjectURL(blob)
  const img = new Image()
  img.src = url
  await img.decode()
  URL.revokeObjectURL(url)
  return img
}

/**
 * Lädt eine Bildsequenz sparsam:
 * - Downloads höchstens PARALLEL gleichzeitig, sortiert nach Abstand zur aktuellen Position, in Scrollrichtung zuerst.
 * - Frames bleiben komprimiert im Speicher (wenige MB); dekodiert wird nur, was gerade gebraucht wird,
 *   außerhalb des Hauptthreads (createImageBitmap), mit einem kleinen Zwischenspeicher (MAX_DECODED).
 * - Ältere dekodierte Frames werden sofort freigegeben (close), nichts liegt doppelt im Speicher.
 */
export function useFrameSequence(urls: string[], enabled: boolean, onDecoded: () => void) {
  const blobs = useRef<(Blob | null)[]>([])
  const decoded = useRef(new Map<number, Bitmap>())
  const decoding = useRef(new Set<number>())
  const want = useRef({ index: 0, dir: 1 })
  const pump = useRef<() => void>(() => {})
  const decodedCb = useRef(onDecoded)
  decodedCb.current = onDecoded
  const [progress, setProgress] = useState(0)
  const [failed, setFailed] = useState(false)

  const release = useCallback(() => {
    decoded.current.forEach((b) => 'close' in b && b.close())
    decoded.current.clear()
  }, [])

  /** Frame dekodieren (falls geladen) und ältere Frames aus dem Zwischenspeicher werfen */
  const ensureDecoded = useCallback((i: number) => {
    const blob = blobs.current[i]
    if (!blob || decoded.current.has(i) || decoding.current.has(i)) return
    decoding.current.add(i)
    decode(blob).then(
      (bmp) => {
        decoding.current.delete(i)
        decoded.current.set(i, bmp)
        // Zwischenspeicher begrenzen: am weitesten vom Wunsch-Frame entfernte zuerst freigeben
        if (decoded.current.size > MAX_DECODED) {
          const far = [...decoded.current.keys()].sort((a, b) => Math.abs(b - want.current.index) - Math.abs(a - want.current.index))
          for (const k of far.slice(0, decoded.current.size - MAX_DECODED)) {
            const b = decoded.current.get(k)
            if (b && 'close' in b) b.close()
            decoded.current.delete(k)
          }
        }
        decodedCb.current()
      },
      () => decoding.current.delete(i),
    )
  }, [])

  useEffect(() => {
    if (!enabled || urls.length === 0) return
    let cancelled = false
    let active = 0
    let loaded = 0
    let errors = 0
    let lastReport = 0
    const controller = new AbortController()
    blobs.current = new Array(urls.length).fill(null)
    const requested = new Set<number>()

    // Nächstes Frame: erst Anfang und Ende, dann nach Abstand zur Position, in Scrollrichtung bevorzugt
    const pick = () => {
      const { index, dir } = want.current
      let best = -1
      let bestScore = Infinity
      for (let i = 0; i < urls.length; i++) {
        if (requested.has(i)) continue
        const d = (i - index) * dir
        const score = i === 0 ? -2 : i === urls.length - 1 ? -1 : d >= 0 ? d : -d * 2.5
        if (score < bestScore) {
          bestScore = score
          best = i
        }
      }
      return best
    }

    const next = () => {
      while (!cancelled && active < PARALLEL) {
        const i = pick()
        if (i < 0) return
        requested.add(i)
        active++
        fetch(urls[i], { signal: controller.signal, priority: i === 0 ? 'high' : 'low' } as RequestInit)
          .then((r) => {
            if (!r.ok) throw new Error(String(r.status))
            return r.blob()
          })
          .then((blob) => {
            if (cancelled) return
            blobs.current[i] = blob
            loaded++
            const now = performance.now()
            if (loaded === urls.length || now - lastReport > 250) {
              lastReport = now
              setProgress(loaded / urls.length)
            }
            // Gebraucht? Dann gleich dekodieren und neu zeichnen lassen
            const { index, dir } = want.current
            const ahead = (i - index) * dir
            if (Math.abs(i - index) <= 1 || (ahead >= 0 && ahead <= DECODE_AHEAD)) ensureDecoded(i)
          })
          .catch(() => {
            if (cancelled) return
            if (++errors > 3) {
              setFailed(true)
              cancelled = true
            }
          })
          .finally(() => {
            active--
            next()
          })
      }
    }
    pump.current = next
    next()
    return () => {
      cancelled = true
      controller.abort()
      pump.current = () => {}
      release()
      blobs.current = []
    }
  }, [urls, enabled, ensureDecoded, release])

  /**
   * Bestes verfügbares Frame zum Wunsch-Index. Merkt sich Position und Richtung für die Ladereihenfolge
   * und stößt das Dekodieren des Wunsch-Frames und der nächsten Frames in Scrollrichtung an.
   */
  const frame = useCallback(
    (target: number) => {
      const prev = want.current.index
      want.current = { index: target, dir: target === prev ? want.current.dir : target > prev ? 1 : -1 }
      const { dir } = want.current
      ensureDecoded(target)
      for (let k = 1; k <= DECODE_AHEAD; k++) ensureDecoded(target + k * dir)
      if (target !== prev) pump.current()
      const m = decoded.current
      if (m.has(target)) return { img: m.get(target)!, exact: true }
      let best: Bitmap | null = null
      let bestD = Infinity
      m.forEach((b, i) => {
        const d = Math.abs(i - target)
        if (d < bestD) {
          bestD = d
          best = b
        }
      })
      return { img: best as Bitmap | null, exact: false }
    },
    [ensureDecoded],
  )

  return { frame, progress, failed }
}
