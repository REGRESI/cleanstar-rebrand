import { forwardRef, useImperativeHandle, useRef } from 'react'
import { MotionConfig } from 'framer-motion'
import { getFontEmbedCSS, toCanvas } from 'html-to-image'
import { mappePages } from './pages'
import { GrundrissGross, WIDE_W } from './extras'
import { InstantCtx, PAGE_H, PAGE_W, type Side } from './core'

export interface SnapshotApi {
  /** Seite i als Canvas abfotografieren (gleiche Darstellung wie die HTML-Seite) */
  capture: (i: number, pixelRatio: number) => Promise<HTMLCanvasElement>
  /** Großer Grundriss für die Klappflügel (zwei Seitenbreiten) */
  captureWide: (pixelRatio: number) => Promise<HTMLCanvasElement>
}

let fontCSS: Promise<string> | null = null

/** Handschrift (Notizzettel) vor dem ersten Abfotografieren laden, sonst fehlt sie in Textur und PDF */
export const handFont = () => document.fonts?.load('500 25px "Caveat"').catch(() => [])

/** Zum Fotografieren: wartet, bis alle Bilder der Seite geladen sind */
async function imagesReady(node: HTMLElement) {
  const imgs = Array.from(node.querySelectorAll('img'))
  await Promise.all(imgs.map((img) => (img.complete && img.naturalWidth ? null : new Promise((r) => ((img.onload = r), (img.onerror = r))))))
}

/**
 * Unsichtbarer Bereich mit allen Seiten der Mappe in ihrem jeweiligen Zustand (`played`: Ausgangs- oder Endzustand).
 * Liegt außerhalb des Bildschirms, ist für Screenreader verborgen und dient nur als Vorlage für die Texturen.
 */
export const SnapshotHost = forwardRef<SnapshotApi, { played: Record<number, boolean> }>(function SnapshotHost({ played }, ref) {
  const nodes = useRef<(HTMLDivElement | null)[]>([])
  const wide = useRef<HTMLDivElement>(null)
  // Schriften einmal für alle Seiten zusammen einbetten (html-to-image nimmt nur die im Element benutzten)
  const root = useRef<HTMLDivElement>(null)
  useImperativeHandle(ref, () => ({
    async capture(i, pixelRatio) {
      const node = nodes.current[i]
      if (!node) throw new Error('Seite fehlt: ' + i)
      await imagesReady(node)
      // zwei Bilder warten, damit React und Framer Motion den Endzustand gezeichnet haben
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
      fontCSS ??= handFont().then(() => getFontEmbedCSS(root.current ?? node))
      // Pergament: ohne Hintergrund, damit die Seite darunter durchscheint
      const bg = mappePages[i].transparent ? undefined : '#f5f2eb'
      return toCanvas(node, { pixelRatio, width: PAGE_W, height: PAGE_H, fontEmbedCSS: await fontCSS, cacheBust: false, backgroundColor: bg })
    },
    async captureWide(pixelRatio) {
      const node = wide.current!
      await imagesReady(node)
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
      fontCSS ??= handFont().then(() => getFontEmbedCSS(root.current ?? node))
      return toCanvas(node, { pixelRatio, width: WIDE_W, height: PAGE_H, fontEmbedCSS: await fontCSS, cacheBust: false, backgroundColor: '#f5f2eb' })
    },
  }))
  return (
    <div ref={root} aria-hidden inert className="mappe-instant pointer-events-none fixed top-0 left-[-12000px]" style={{ width: PAGE_W }}>
      <InstantCtx.Provider value>
        <MotionConfig transition={{ duration: 0 }}>
          {mappePages.map((p, i) => {
            const side: Side = i % 2 === 0 ? 'right' : 'left'
            return (
              <div key={p.id} ref={(el) => void (nodes.current[i] = el)} style={{ width: PAGE_W, height: PAGE_H }}>
                <p.Component play={!!played[i]} side={side} folio={i + 1} snapshot />
              </div>
            )
          })}
          <div ref={wide} style={{ width: WIDE_W, height: PAGE_H }}>
            <GrundrissGross />
          </div>
        </MotionConfig>
      </InstantCtx.Provider>
    </div>
  )
})
