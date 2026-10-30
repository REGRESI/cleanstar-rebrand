import { forwardRef, useImperativeHandle, useRef } from 'react'

/**
 * Linien-Modul, Bildebene (gemeinsam für Hero und Prüfpunkt-Ansicht): Über dem Foto liegt seine Linienzeichnung
 * (feine Linien in Markenblau auf Navy, beim Build erzeugt mit scripts/line-art.py). Eine helle Lichtkante zieht
 * von links nach rechts; hinter ihr ist der Plan zu sehen. set(e): 0 = Foto, 1 = ganz Plan.
 * Im Hero übernimmt bei WebGL2 dieselbe Kante die Partikel (features/hero/dust.ts), hier genügt die Überblendung.
 */
export interface LineSwapHandle {
  set: (e: number) => void
}

/** Lage der Kante: läuft weich über den Bildrand hinaus (wie in dust.ts) */
export const SPREAD = 0.05
export const front = (e: number) => e * (1 + 2 * SPREAD) - SPREAD

export const LineSwap = forwardRef<LineSwapHandle, { lines: string; linesMobile?: string; width: number; height: number }>(function LineSwap({ lines, linesMobile, width, height }, ref) {
  const layer = useRef<HTMLDivElement>(null)
  const edge = useRef<HTMLSpanElement>(null)
  useImperativeHandle(ref, () => ({
    set(e) {
      const f = Math.max(0, Math.min(1, front(e)))
      if (layer.current) layer.current.style.clipPath = `inset(0 ${(1 - f) * 100}% 0 0)`
      if (edge.current) {
        edge.current.style.opacity = e > 0.001 && e < 0.999 ? '1' : '0'
        edge.current.style.left = `${f * 100}%`
      }
    },
  }))
  return (
    <>
      <div ref={layer} aria-hidden className="absolute inset-0" style={{ clipPath: 'inset(0 100% 0 0)' }}>
        <picture>
          {linesMobile && <source media="(max-width: 767px)" srcSet={linesMobile} />}
          <img src={lines} alt="" width={width} height={height} loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover" />
        </picture>
      </div>
      <span ref={edge} aria-hidden className="hero-edge" />
    </>
  )
})
