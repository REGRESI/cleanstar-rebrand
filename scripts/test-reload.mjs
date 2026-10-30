/* global document, window -- Code in page.evaluate läuft im Browser */
// Neuladen-Test für den Scroll-Text (ScrubStatement): 20 Mal neu laden (Desktop und Handy), jeweils an eine zufällige
// Stelle im Abschnitt scrollen und prüfen, dass die Färbung zur Scrollposition passt und beim Weiterscrollen mitläuft.
// Aufruf: B=http://localhost:4177 node scripts/test-reload.mjs (PAGES=/leistungen/,/einzugsgebiet/ wählt die Seiten)
// Die Startseite hat seit der Finalen Runde keinen Scroll-Text mehr; geprüft werden Unterseiten mit Scroll-Text.
import { createRequire } from 'node:module'
// playwright wird nur für Tests installiert (npm i --no-save playwright), daher über require mit NODE_PATH
const { chromium } = createRequire(import.meta.url)('playwright')

const B = process.env.B || 'http://localhost:4177'
const RUNS = Number(process.env.RUNS || 20)
const PAGES = (process.env.PAGES || '/leistungen/,/einzugsgebiet/').split(',')
let fails = 0
const browser = await chromium.launch()
for (const [device, viewport] of [
  ['Desktop', { width: 1440, height: 900 }],
  ['Mobile', { width: 390, height: 844 }],
]) for (const path of PAGES) {
  const label = `${device} ${path}`
  const page = await (await browser.newContext({ viewport })).newPage()
  await page.goto(B + path, { waitUntil: 'networkidle' })
  for (let i = 0; i < RUNS; i++) {
    // Neuladen an einer zufälligen Stelle (vor, im oder nach dem Scroll-Text)
    const pre = await page.evaluate(() => {
      const s = document.querySelector('.story')
      return { top: s.getBoundingClientRect().top + window.scrollY, h: s.offsetHeight, vh: window.innerHeight }
    })
    const at = Math.round(Math.random() * (pre.top + pre.h))
    await page.evaluate((y) => window.scrollTo(0, y), at)
    await page.reload({ waitUntil: 'networkidle' })
    await page.waitForTimeout(1200)
    const s = await page.evaluate(() => {
      const st = document.querySelector('.story')
      return { top: st.getBoundingClientRect().top + window.scrollY, h: st.offsetHeight, vh: window.innerHeight }
    })
    // in den Abschnitt scrollen (Mitte des Färbewegs) und Zustand lesen
    const target = s.top + (s.h - s.vh) * (0.3 + Math.random() * 0.4)
    await page.evaluate((y) => (window.__lenis ? window.__lenis.scrollTo(y, { immediate: true }) : window.scrollTo(0, y)), target)
    await page.waitForTimeout(1300)
    const read = () =>
      page.evaluate(() => {
        const ls = [...document.querySelectorAll('.story [data-l]')]
        const p = ls.map((l) => Number(l.style.getPropertyValue('--p') || 0))
        return { full: p.filter((v) => v >= 1).length, n: p.length, sum: p.reduce((a, b) => a + b, 0) }
      })
    const a = await read()
    await page.evaluate(() => (window.__lenis ? window.__lenis.scrollTo(window.scrollY + 260, { immediate: true }) : window.scrollBy(0, 260)))
    await page.waitForTimeout(1300)
    const b = await read()
    const ok = a.full > 0 && a.full < a.n && b.sum > a.sum
    if (!ok) fails++
    console.log(`${ok ? 'ok  ' : 'FAIL'} ${label} Lauf ${i + 1}: neu geladen bei ${at} px, gefärbt ${a.full}/${a.n}, nach Weiterscrollen ${b.full}/${b.n}`)
  }
  await page.context().close()
}
await browser.close()
console.log(fails ? `✗ ${fails} Fehler` : `✓ alle ${RUNS * 2 * PAGES.length} Neuladen-Läufe bestanden`)
process.exit(fails ? 1 : 0)
