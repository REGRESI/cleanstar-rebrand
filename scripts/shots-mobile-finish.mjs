// Belegbilder für den Mobile-Abschluss (docs/mobile-finish/): feste Stellen der Startseite und des Einzugsgebiets auf
// 390 × 844 (Chromium mit iPhone-Emulation), dazu Desktop 1440 × 900 zum Vergleich (Desktop darf sich nicht ändern).
// Aufruf: B=http://localhost:4177 TAG=vorher|nachher node scripts/shots-mobile-finish.mjs   (DESKTOP=1: nur Desktop)
import { createRequire } from 'node:module'
import { mkdirSync } from 'node:fs'
const { chromium } = createRequire(import.meta.url)('playwright')
const B = (process.env.B || 'http://localhost:4177').replace(/\/$/, '')
const TAG = process.env.TAG || 'vorher'
const OUT = 'docs/mobile-finish'
mkdirSync(OUT, { recursive: true })
const browser = await chromium.launch()

// Stelle: Element sel, dessen Oberkante (oder Unterkante) bei frac der Bildschirmhöhe steht
const at = (sel, frac, edge = 'top') => ({ sel, frac, edge })
const mobileShots = [
  ['1-wolken-karte-a', '/', at('.cc', 0.85)],
  ['1-wolken-karte-b', '/', at('.cc', 0.6)],
  ['1-wolken-karte-c', '/', at('.cc', 0.35)],
  ['1-wolken-karte-d', '/', at('.cc', 0.12)],
  ['2-karte-startseite', '/', at('.cc [role=region]', 0.15)],
  ['2-karte-einzugsgebiet', '/einzugsgebiet/', at('[role=region][aria-label^="Karte"]', 0.12)],
  // Papierkante: Unterkante des Blatts (= Kante) bei 70 %, 35 % und 5 % der Bildschirmhöhe
  ['3-papierkante-a', '/', at('.pr-sheet', 0.7, 'bottom')],
  ['3-papierkante-b', '/', at('.pr-sheet', 0.35, 'bottom')],
  ['3-papierkante-c', '/', at('.pr-sheet', 0.05, 'bottom')],
  ['3-papierkante-leistungen', '/leistungen/', at('.pr-sheet', 0.35, 'bottom')],
  ['4-pflanzen-text', '/', at('#team-moment', 0.3)],
  ['4-pflanzen-ende', '/', at('[data-home-section="team"]', 0.75, 'bottom')],
  ['5-leiste-ueber-bild', '/', at('.pr-sheet', -0.2, 'bottom')],
  ['7-kartenkante-ablauf', '/', at('[data-home-section="process"]', 0.35)],
]
async function goTo(page, s) {
  for (let i = 0; i < 3; i++) {
    const y = await page.evaluate(({ sel, frac, edge }) => {
      const e = document.querySelector(sel)
      if (!e) return null
      const r = e.getBoundingClientRect()
      return Math.max(0, (edge === 'top' ? r.top : r.bottom) + scrollY - innerHeight * frac)
    }, s)
    if (y === null) return false
    // in Schritten scrollen, damit Scroll-Auslöser wie beim echten Wischen mitlaufen
    const from = await page.evaluate(() => scrollY)
    for (let k = 1; k <= 10; k++) await page.evaluate((v) => window.scrollTo(0, v), from + ((y - from) * k) / 10), await page.waitForTimeout(60)
    await page.waitForTimeout(900)
  }
  return true
}
const ONLYS = process.env.SHOTS ? process.env.SHOTS.split(',') : null
if (!process.env.DESKTOP) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
  await ctx.addInitScript(() => sessionStorage.setItem('cs-pl', '1'))
  for (const [name, path, s] of mobileShots.filter(([n]) => !ONLYS || ONLYS.some((o) => n.startsWith(o)))) {
    const page = await ctx.newPage()
    await page.goto(B + path, { waitUntil: 'load' })
    await page.waitForTimeout(1500)
    const ok = await goTo(page, s)
    if (!ok) console.log(`– ${name}: ${s.sel} nicht gefunden`)
    await page.screenshot({ path: `${OUT}/${name}-${TAG}.jpg`, type: 'jpeg', quality: 72 })
    await page.close()
  }
  if (!ONLYS || ONLYS.includes('6')) {
  // 6: Ärgernisse nach schnellem Wischen (große Sprünge), danach Zustand aller vier Zeilen
  const page = await ctx.newPage()
  await page.goto(B + '/', { waitUntil: 'load' })
  await page.waitForTimeout(1500)
  const rows = await page.evaluate(() => [...document.querySelectorAll('.ps-row')].map((r) => r.getBoundingClientRect().top + scrollY))
  if (rows.length) {
    for (let y = rows[0] - 900; y <= rows[rows.length - 1] + 200; y += 420) await page.evaluate((v) => window.scrollTo(0, v), y), await page.waitForTimeout(40)
    await page.evaluate((v) => window.scrollTo(0, v), rows[rows.length - 1] - 520)
    await page.waitForTimeout(1500)
    const w = await page.evaluate(() => [...document.querySelectorAll('.ps-row')].map((r) => getComputedStyle(r).getPropertyValue('--w') || r.style.getPropertyValue('--w')))
    console.log('6-aergernisse --w je Zeile:', w.join(', '))
    await page.screenshot({ path: `${OUT}/6-aergernisse-${TAG}.jpg`, type: 'jpeg', quality: 72 })
  }
  await page.close()
  }
  await ctx.close()
}
if (process.env.NODESK) process.exit(0)
// Desktop zum Vergleich (reduzierte Bewegung, damit die Bilder nicht von laufenden Animationen abhängen)
const dctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'reduce' })
await dctx.addInitScript(() => sessionStorage.setItem('cs-pl', '1'))
for (const path of ['/', '/leistungen/', '/einzugsgebiet/']) {
  const page = await dctx.newPage()
  await page.goto(B + path, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)
  const h = await page.evaluate(() => document.documentElement.scrollHeight)
  for (let y = 0, i = 0; y < h; y += 1800, i++) {
    await page.evaluate((v) => window.scrollTo(0, v), y)
    await page.waitForTimeout(500)
    await page.screenshot({ path: `${process.env.DOUT || '/tmp/claude-0/-home-user/d39e5722-904e-5721-8093-60a42e05c69a/scratchpad/desk'}/${path.replace(/\//g, '_') || '_'}${String(i).padStart(2, '0')}-${TAG}.png` })
  }
  await page.close()
}
await browser.close()
