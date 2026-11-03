// Performance-Test Mobile: Hauptseiten mit echten Wischgesten (Touch, mit Schwung) von oben bis unten durchscrollen,
// auf zwei Geräteprofilen mit vierfach gedrosselter CPU. Gemessen wird pro Seite:
//   - Ruckler: Anteil der Frames über 33 ms und längster Frame (Ziel unter 5 %, kein Frame über 200 ms)
//   - Long Tasks über 100 ms während des Scrollens (Ziel: keine)
//   - Sprünge: Scrollposition ändert sich ohne Geste (später als 2,5 s nach der letzten Geste) oder um mehr als
//     einen Bildschirm in einem Frame (Ziel: nie)
//   - tote Gesten: eine Wischgeste bewegt die Seite nicht, obwohl das Ende noch nicht erreicht ist (Ziel: nie)
// Chromium mit CDP (Input.dispatchTouchEvent: echte Touch-Folge mit Schwung). Mit ENGINE=webkit (nur auf GitHub Actions installiert): Rauchtest,
// ob Scrollen und Pins in der Safari-Engine funktionieren (Mausrad statt Touch, ohne Bildratenmessung).
//
// Aufruf: npm run build && (statischer Server auf dist) B=http://localhost:4177 node scripts/test-performance.mjs
// Optional: ONLY=/ablauf/  PROFILE=iphone|android  ENGINE=webkit  OUT=datei.json (Ergebnisse)
import { createRequire } from 'node:module'
import { writeFileSync } from 'node:fs'
const require = createRequire(import.meta.url)
const pw = require('playwright')

const B = (process.env.B || 'http://localhost:4177').replace(/\/$/, '')
let pages = ['/', '/leistungen/', '/qualitaetsgarantie/', '/ablauf/', '/einzugsgebiet/', '/ueber-uns/']
if (process.env.ONLY) pages = pages.filter((p) => p === process.env.ONLY)
const PROFILES = {
  iphone: { name: 'iPhone 13', device: pw.devices['iPhone 13'] },
  android: { name: 'Android Mittelklasse (Pixel 5)', device: pw.devices['Pixel 5'] },
}
let profiles = Object.keys(PROFILES)
if (process.env.PROFILE) profiles = profiles.filter((p) => p === process.env.PROFILE)
const LIMITS = { jank: 0.05, maxFrame: 200, longTask: 100 }

// Messung im Browser: Frame-Abstände, Long Tasks, Scrollverlauf mit Zeitstempel
const PROBE = `(() => {
  const s = (window.__perf = { frames: [], long: [], scroll: [], last: performance.now(), on: false })
  const tick = (t) => { if (s.on) { s.frames.push(t - s.last); s.scroll.push([t, scrollY]) } s.last = t; requestAnimationFrame(tick) }
  requestAnimationFrame(tick)
  try { new PerformanceObserver((l) => { for (const e of l.getEntries()) if (s.on) s.long.push(Math.round(e.duration)) }).observe({ type: 'longtask', buffered: false }) } catch {}
})()`

async function runChromium() {
  const browser = await pw.chromium.launch()
  const results = []
  for (const key of profiles) {
    const prof = PROFILES[key]
    const ctx = await browser.newContext({ ...prof.device })
    for (const path of pages) {
      const page = await ctx.newPage()
      const errors = []
      page.on('pageerror', (e) => errors.push(e.message))
      await page.addInitScript(PROBE)
      const cdp = await ctx.newCDPSession(page)
      await page.goto(B + path, { waitUntil: 'load' })
      await page.waitForTimeout(1500)
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })
      await page.evaluate(() => (window.__perf.on = true))
      const vp = page.viewportSize()
      const gestures = []
      let dead = 0
      let atEnd = false
      for (let i = 0; i < 160 && !atEnd; i++) {
        const before = await page.evaluate(() => [scrollY, document.documentElement.scrollHeight - innerHeight])
        const t0 = await page.evaluate(() => performance.now())
        // Wischen nach oben: Finger zieht in rund 130 ms über die halbe Bildschirmhöhe, danach läuft der Schwung nach
        const x = Math.round(vp.width / 2)
        const y0 = Math.round(vp.height * 0.78)
        const dist = Math.round(vp.height * 0.5)
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y: y0 }] })
        for (let k = 1; k <= 8; k++) {
          await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y0 - Math.round((dist * k) / 8) }] })
          await page.waitForTimeout(16)
        }
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
        await page.waitForTimeout(700)
        const t1 = await page.evaluate(() => performance.now())
        gestures.push([t0, t1])
        const after = await page.evaluate(() => [scrollY, document.documentElement.scrollHeight - innerHeight])
        atEnd = after[0] >= after[1] - 4
        if (after[0] - before[0] < 8 && !atEnd && before[0] < before[1] - 4) dead++
      }
      // Ruhephase: Scrollposition darf sich ohne Geste nicht mehr ändern
      await page.waitForTimeout(3000)
      const perf = await page.evaluate(() => window.__perf)
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 })
      const frames = perf.frames.filter((d) => d > 0 && d < 5000)
      const jank = frames.filter((d) => d > 33).length / Math.max(1, frames.length)
      const maxFrame = Math.round(Math.max(0, ...frames))
      // Sprünge: Änderung später als 2,5 s nach der letzten Geste, oder mehr als ein Bildschirm in einem Frame
      let jumps = 0
      const vh = vp.height
      for (let i = 1; i < perf.scroll.length; i++) {
        const [t, y] = perf.scroll[i]
        const dy = Math.abs(y - perf.scroll[i - 1][1])
        const lastGesture = gestures.filter((g) => g[0] <= t).pop()
        const sinceEnd = lastGesture ? t - lastGesture[1] : Infinity
        if (dy > vh) jumps++
        else if (dy > 2 && sinceEnd > 2500) jumps++
      }
      const r = {
        profile: prof.name,
        path,
        gestures: gestures.length,
        reachedEnd: atEnd,
        jankPct: +(jank * 100).toFixed(1),
        maxFrame,
        longTasks: perf.long.filter((d) => d > LIMITS.longTask).length,
        longestTask: Math.max(0, ...perf.long),
        jumps,
        deadGestures: dead,
        errors: errors.length,
      }
      r.ok = r.reachedEnd && jank < LIMITS.jank && maxFrame <= LIMITS.maxFrame && r.longTasks === 0 && r.jumps === 0 && r.deadGestures === 0 && r.errors === 0
      results.push(r)
      console.log(
        `${r.ok ? '✓' : '✗'} ${prof.name} ${path}: Ruckler ${r.jankPct} %, längster Frame ${maxFrame} ms, Long Tasks >100 ms: ${r.longTasks} (längster ${r.longestTask} ms), Sprünge ${jumps}, tote Gesten ${dead}, Gesten ${r.gestures}${atEnd ? '' : ', Ende NICHT erreicht'}${errors.length ? `, Skriptfehler: ${errors[0].slice(0, 80)}` : ''}`,
      )
      await page.close()
    }
    await ctx.close()
  }
  await browser.close()
  return results
}

async function runWebkit() {
  const browser = await pw.webkit.launch()
  const ctx = await browser.newContext({ ...pw.devices['iPhone 13'], hasTouch: false, isMobile: false })
  const results = []
  for (const path of pages) {
    const page = await ctx.newPage()
    const errors = []
    page.on('pageerror', (e) => errors.push(e.message))
    await page.goto(B + path, { waitUntil: 'load' })
    await page.waitForTimeout(1500)
    let atEnd = false
    let dead = 0
    for (let i = 0; i < 200 && !atEnd; i++) {
      const before = await page.evaluate(() => [scrollY, document.documentElement.scrollHeight - innerHeight])
      await page.mouse.move(195, 420)
      await page.mouse.wheel(0, 500)
      await page.waitForTimeout(300)
      const after = await page.evaluate(() => [scrollY, document.documentElement.scrollHeight - innerHeight])
      atEnd = after[0] >= after[1] - 4
      if (after[0] - before[0] < 8 && !atEnd) dead++
    }
    const r = { profile: 'WebKit iPhone 13', path, reachedEnd: atEnd, deadGestures: dead, errors: errors.length }
    r.ok = atEnd && dead === 0 && errors.length === 0
    results.push(r)
    console.log(`${r.ok ? '✓' : '✗'} WebKit ${path}: Ende ${atEnd ? 'erreicht' : 'NICHT erreicht'}, tote Gesten ${dead}${errors.length ? `, Skriptfehler: ${errors[0].slice(0, 80)}` : ''}`)
    await page.close()
  }
  await browser.close()
  return results
}

const results = process.env.ENGINE === 'webkit' ? await runWebkit() : await runChromium()
if (process.env.OUT) writeFileSync(process.env.OUT, JSON.stringify(results, null, 2))
const bad = results.filter((r) => !r.ok)
console.log(bad.length ? `\n✗ ${bad.length} von ${results.length} Läufen verfehlen die Ziele` : `\n✓ Alle ${results.length} Läufe erreichen die Ziele`)
process.exit(bad.length ? 1 : 0)
