/* global document, getComputedStyle -- Browser evaluation */
// Bilder-Test: Jedes Foto höchstens einmal pro Seite; das Bild am Seitenende (Streifen vor dem Footer) nicht auf mehreren
// Seiten dasselbe; das Teambild „team-im-einsatz“ nur an genau einer Stelle der Website.
// Gezählt werden sichtbare Fotos ab 160 px Breite (img aus /images/, ohne Deko-Freisteller, ohne runde Porträt-Symbole
// und Bilder im Fließtext) bei Desktop-Breite.
// Aufruf: B=http://localhost:4177 node scripts/test-images.mjs   (ONLY=/pfad/ für eine Seite)
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const { chromium } = require('playwright')

const B = (process.env.B || 'http://localhost:4177').replace(/\/$/, '')
const sitemap = await (await fetch(B + '/sitemap.xml')).text()
let pages = [...sitemap.matchAll(/<loc>https?:\/\/[^/]+(\/[^<]*)<\/loc>/g)].map((m) => m[1])
if (process.env.ONLY) pages = pages.filter((p) => p === process.env.ONLY)
const ONCE = 'team-im-einsatz'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
const fails = []
const endImages = new Map()
let teamUses = []
for (const path of pages) {
  await page.goto(B + path, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(400)
  const res = await page.evaluate(() => {
    const name = (src) => {
      const m = /\/images\/([^/?#]+?)(?:-\d+)?\.(?:webp|avif|jpe?g|png)/.exec(src || '')
      return m ? m[1] : null
    }
    const shown = (el) => {
      for (let e = el; e && e !== document.body; e = e.parentElement) {
        const cs = getComputedStyle(e)
        if (cs.display === 'none' || cs.visibility === 'hidden') return false
      }
      return true
    }
    const out = []
    for (const img of document.querySelectorAll('img')) {
      const n = name(img.currentSrc || img.getAttribute('src') || img.getAttribute('srcset') || '')
      // nur Fotos zählen (ab 160 px Breite), keine Porträt-Symbole oder Bilder im Fließtext
      // .mappe-instant: technische Kopie der aufgeschlagenen Seite für das Umblättern, kein zweites Bild
      if (!n || !shown(img) || img.getBoundingClientRect().width < 160 || img.closest('.mappe-instant')) continue
      out.push({ n, end: !!img.closest('.ftr-run'), main: !!img.closest('#main') })
    }
    return out
  })
  const count = {}
  for (const r of res) count[r.n] = (count[r.n] || 0) + 1
  const dup = Object.entries(count).filter(([, c]) => c > 1)
  if (dup.length) fails.push(`${path}: doppelt ${dup.map(([n, c]) => `${n} (${c}×)`).join(', ')}`)
  const end = res.find((r) => r.end)
  if (end) endImages.set(path, end.n)
  if (count[ONCE]) teamUses.push(`${path} (${count[ONCE]}×)`)
}
await browser.close()

// Seitenende: dasselbe Bild nicht auf mehreren Seiten
const byImage = {}
for (const [p, n] of endImages) (byImage[n] ||= []).push(p)
for (const [n, ps] of Object.entries(byImage)) if (ps.length > 1) fails.push(`Seitenende „${n}“ auf ${ps.length} Seiten: ${ps.slice(0, 6).join(', ')}${ps.length > 6 ? ' …' : ''}`)
if (teamUses.length > 1 || (teamUses.length === 1 && !/\(1×\)/.test(teamUses[0]))) fails.push(`Teambild „${ONCE}“ an ${teamUses.length} Stellen: ${teamUses.join(', ')}`)

console.log(`${pages.length} Seiten geprüft, Seitenende-Bilder: ${endImages.size}`)
if (fails.length) {
  console.log(`✗ ${fails.length} Fehler:\n` + fails.map((f) => '  ' + f).join('\n'))
  process.exit(1)
}
console.log('✓ Kein Bild doppelt, kein Seitenende-Bild mehrfach, Teambild nur einmal')
