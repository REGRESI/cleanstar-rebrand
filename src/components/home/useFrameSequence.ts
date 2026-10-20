import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Lädt eine Bildsequenz progressiv: erst Frame 0, dann jedes 16., 8., 4., 2. und zuletzt alle übrigen Frames.
 * So ist beim schnellen Scrollen schon früh eine grobe Version da, die sich nach und nach verfeinert.
 */
export function useFrameSequence(urls: string[], enabled: boolean) {
  const images = useRef<(HTMLImageElement | null)[]>([])
  const [progress, setProgress] = useState(0)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!enabled || urls.length === 0) return
    let cancelled = false
    let loaded = 0
    let errors = 0
    images.current = new Array(urls.length).fill(null)

    // Ladereihenfolge: grob nach fein
    const order: number[] = []
    const seen = new Set<number>()
    for (const step of [urls.length, 16, 8, 4, 2, 1]) {
      for (let i = 0; i < urls.length; i += step) {
        if (!seen.has(i)) {
          seen.add(i)
          order.push(i)
        }
      }
    }
    if (!seen.has(urls.length - 1)) order.splice(1, 0, urls.length - 1)

    let cursor = 0
    let lastReport = 0
    const next = () => {
      if (cancelled || cursor >= order.length) return
      const idx = order[cursor++]
      const img = new Image()
      img.decoding = 'async'
      ;(img as HTMLImageElement & { fetchPriority?: string }).fetchPriority = idx === 0 ? 'high' : 'low'
      img.onload = () => {
        if (cancelled) return
        const done = () => {
          if (cancelled) return
          images.current[idx] = img
          loaded++
          const now = performance.now()
          if (loaded === urls.length || now - lastReport > 150) {
            lastReport = now
            setProgress(loaded / urls.length)
          }
          next()
        }
        img.decode().then(done, done)
      }
      img.onerror = () => {
        errors++
        if (errors > 3) {
          setFailed(true)
          cancelled = true
          return
        }
        next()
      }
      img.src = urls[idx]
    }
    // mehrere Downloads parallel
    for (let k = 0; k < 6; k++) next()
    return () => {
      cancelled = true
    }
  }, [urls, enabled])

  /** Nächstes bereits geladenes Frame zu einem Wunsch-Index */
  const nearest = useCallback((target: number) => {
    const arr = images.current
    if (arr[target]) return arr[target]
    for (let d = 1; d < arr.length; d++) {
      if (arr[target - d]) return arr[target - d]
      if (arr[target + d]) return arr[target + d]
    }
    return null
  }, [])

  return { nearest, progress, failed }
}
