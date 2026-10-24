import { createRoot } from 'react-dom/client'
import { MotionConfig } from 'framer-motion'
import { toJpeg, getFontEmbedCSS } from 'html-to-image'
import { mappePages } from './pages'
import { InstantCtx, PAGE_H, PAGE_W, RecipientCtx } from './core'
import { defaultRecipient, type Recipient } from './personal'

/**
 * Die Mappe als PDF, im Browser erzeugt: Alle Seiten werden im Endzustand gerendert, abfotografiert und
 * als A4-ähnliche Seiten (Seitenverhältnis 1 : 1,4) in ein PDF gesetzt.
 */
export async function downloadMappePdf(onProgress?: (p: number) => void, recipient: Recipient = defaultRecipient) {
  const host = document.createElement('div')
  host.className = 'mappe-instant mappe-pdf'
  host.setAttribute('aria-hidden', 'true')
  Object.assign(host.style, { position: 'fixed', left: '-12000px', top: '0', width: PAGE_W + 'px', pointerEvents: 'none' })
  document.body.appendChild(host)
  const root = createRoot(host)
  root.render(
    <RecipientCtx.Provider value={recipient}>
      <InstantCtx.Provider value>
        <MotionConfig transition={{ duration: 0 }}>
          {mappePages.map((p, i) => (
            <div key={p.id} style={{ width: PAGE_W, height: PAGE_H }}>
              <p.Component play side={i % 2 === 0 ? 'right' : 'left'} folio={i + 1} snapshot />
            </div>
          ))}
        </MotionConfig>
      </InstantCtx.Provider>
    </RecipientCtx.Provider>,
  )
  try {
    await new Promise((r) => setTimeout(r, 120))
    const nodes = Array.from(host.children) as HTMLElement[]
    await Promise.all(Array.from(host.querySelectorAll('img')).map((img) => (img.complete && img.naturalWidth ? null : new Promise((r) => ((img.onload = r), (img.onerror = r))))))
    await document.fonts?.load('500 25px "Caveat"').catch(() => [])
    const fontEmbedCSS = await getFontEmbedCSS(host)
    const { jsPDF } = await import('jspdf')
    // 150 × 210 mm entspricht dem Seitenverhältnis der Mappe
    const doc = new jsPDF({ unit: 'mm', format: [150, 210], orientation: 'portrait', compress: true })
    doc.setProperties({ title: 'CleanStar Leistungsmappe', author: 'CleanStar Dienstleistungen GbR' })
    for (let i = 0; i < nodes.length; i++) {
      const url = await toJpeg(nodes[i], { quality: 0.9, pixelRatio: 2, width: PAGE_W, height: PAGE_H, fontEmbedCSS, backgroundColor: '#f5f2eb' })
      if (i > 0) doc.addPage([150, 210], 'portrait')
      doc.addImage(url, 'JPEG', 0, 0, 150, 210, undefined, 'FAST')
      onProgress?.((i + 1) / nodes.length)
    }
    doc.save('CleanStar-Leistungsmappe.pdf')
  } finally {
    root.unmount()
    host.remove()
  }
}
