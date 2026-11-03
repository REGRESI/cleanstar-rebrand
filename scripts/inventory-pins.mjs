// Bestandsaufnahme der gepinnten bzw. scroll-gesteuerten Abschnitte: alle Elemente mit position: sticky, deren
// Container länger als das Element ist (Haltestrecke), und alle GSAP-Pins (.pin-spacer). Haltestrecke in svh.
// Aufruf: B=http://localhost:4177 node scripts/test-... (statischer Server auf dist) node scripts/inventory-pins.mjs
// Ergebnis als Markdown-Tabelle auf der Konsole (für docs/performance/pins.md); mit CHECK=1 Prüfung der Regeln:
// Mobile höchstens 3 Pins je Seite und je höchstens 150 svh, Desktop höchstens 5 je Seite und je höchstens 200 svh.
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const pw = require('playwright')

const B = (process.env.B || 'http://localhost:4177').replace(/\/$/, '')
const pages = ['/', '/leistungen/', '/leistungen/bueroreinigung/', '/qualitaetsgarantie/', '/ablauf/', '/einzugsgebiet/', '/ueber-uns/', '/kontakt/']
const devices = [
  ['Desktop', { viewport: { width: 1440, height: 900 } }, 5, 200],
  ['Mobile', { ...pw.devices['iPhone 13'] }, 3, 150],
]
const browser = await pw.chromium.launch()
const rows = []
const fails = []
for (const [dev, opts, maxPins, maxRun] of devices) {
  const ctx = await browser.newContext(opts)
  for (const path of pages) {
    const page = await ctx.newPage()
    await page.goto(B + path, { waitUntil: 'load' })
    await page.waitForTimeout(2500)
    // einmal durchscrollen, damit nachgeladene Abschnitte und Pins stehen
    const h = await page.evaluate(() => document.documentElement.scrollHeight)
    for (let y = 0; y < h; y += 700) await page.evaluate((y) => window.scrollTo(0, y), y)
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.waitForTimeout(800)
    const found = await page.evaluate(() => {
      const ruler = document.createElement('div')
      ruler.style.cssText = 'position:absolute;height:100svh;width:0'
      document.body.appendChild(ruler)
      const svh = ruler.offsetHeight
      ruler.remove()
      const name = (e) => {
        const sec = e.closest('section[aria-labelledby], [data-home-section], section, footer')
        const id = sec?.getAttribute('data-home-section') || sec?.getAttribute('aria-labelledby') || sec?.tagName.toLowerCase() || ''
        const cls = (e.getAttribute('class') || '').split(/\s+/).filter((c) => c && !c.includes(':') && !c.includes('[')).slice(0, 2).join('.')
        return `${id}${cls ? ` (.${cls})` : ''}`
      }
      const out = []
      for (const e of document.querySelectorAll('body *')) {
        const cs = getComputedStyle(e)
        if (cs.position !== 'sticky' || cs.display === 'none') continue
        const parent = e.parentElement
        if (!parent) continue
        const run = parent.getBoundingClientRect().height - e.getBoundingClientRect().height
        // nur echte Haltestrecken (mindestens 10 % der Bildschirmhöhe), keine Kopfzeile
        if (run < svh * 0.1 || e.closest('header')) continue
        out.push({ name: name(e), kind: 'sticky', run: Math.round((run / svh) * 100) })
      }
      for (const s of document.querySelectorAll('.pin-spacer')) {
        const pin = s.firstElementChild
        const run = parseFloat(getComputedStyle(s).paddingBottom) || 0
        if (pin && run > 0) out.push({ name: name(pin), kind: 'GSAP-Pin', run: Math.round((run / svh) * 100) })
      }
      return out
    })
    for (const f of found) rows.push({ dev, path, ...f })
    if (found.length > maxPins) fails.push(`${dev} ${path}: ${found.length} Pins (höchstens ${maxPins})`)
    for (const f of found) if (f.run > maxRun) fails.push(`${dev} ${path}: ${f.name} ${f.run} svh (höchstens ${maxRun})`)
    await page.close()
  }
  await ctx.close()
}
await browser.close()
console.log('| Seite | Gerät | Abschnitt | Art | Haltestrecke (svh) |\n| --- | --- | --- | --- | --- |')
for (const r of rows) console.log(`| ${r.path} | ${r.dev} | ${r.name} | ${r.kind} | ${r.run} |`)
if (process.env.CHECK) {
  console.log(fails.length ? `\n✗ ${fails.length} Regelverstöße:\n` + fails.map((f) => '  ' + f).join('\n') : '\n✓ Alle Seiten halten die Pin-Regeln ein')
  process.exit(fails.length ? 1 : 0)
}
