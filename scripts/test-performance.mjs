/* global window, document, scrollY, innerHeight, innerWidth -- Code in page.evaluate läuft im Browser */
// Performance-Test Mobile: Hauptseiten mit echten Wischgesten (Touch, mit Schwung) von oben bis unten durchscrollen,
// auf zwei Geräteprofilen mit vierfach gedrosselter CPU. Gemessen wird pro Seite:
//   - Ruckler: Anteil der Frames über 33 ms, gezählt ab mehr als zwei Bildschirmtakten (über 34 ms; ein Frame von genau
//     zwei Takten misst 33,3 ms) und längster Frame (Ziel unter 5 %, kein Frame über 200 ms). Zusätzlich ausgewiesen:
//     Anteil der Frames mit genau zwei Takten (twoVsyncPct), nur zur Information
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
  const s = (window.__perf = { frames: [], long: [], scroll: [], marks: [], last: performance.now(), on: false })
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
      const deadAt = []
      let atEnd = false
      // Pro Geste nur ein Aufruf in die Seite (jeder Aufruf kostet bei gedrosselter CPU selbst einen Frame): er setzt
      // eine Zeitmarke und liefert die Scrollposition, die zugleich der Endstand der vorigen Geste ist
      const mark = () => page.evaluate(() => (window.__perf.marks.push(performance.now()), [scrollY, document.documentElement.scrollHeight - innerHeight]))
      let state = await mark()
      for (let i = 0; i < 160 && !atEnd; i++) {
        const before = state
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
        state = await mark()
        atEnd = state[0] >= state[1] - 4
        if (state[0] - before[0] < 8 && !atEnd && before[0] < before[1] - 4) {
          dead++
          // Was lag unter dem Finger? (für den Bericht: Schieberegler oder waagerechte Liste sind gewollt)
          deadAt.push(await page.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return `${e?.tagName.toLowerCase()}.${(e?.getAttribute('class') || '').split(' ').slice(0, 2).join('.')} bei ${Math.round(scrollY)}` }, [x, y0]))
        }
      }
      // Ruhephase: Scrollposition darf sich ohne Geste nicht mehr ändern
      await page.waitForTimeout(3000)
      const perf = await page.evaluate(() => window.__perf)
      for (let i = 1; i < perf.marks.length; i++) gestures.push([perf.marks[i - 1], perf.marks[i]])
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 })
      const frames = perf.frames.filter((d) => d > 0 && d < 5000)
      const jank = frames.filter((d) => d > 34).length / Math.max(1, frames.length)
      const two = frames.filter((d) => d > 20 && d <= 34).length / Math.max(1, frames.length)
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
        twoVsyncPct: +(two * 100).toFixed(1),
        maxFrame,
        longTasks: perf.long.filter((d) => d > LIMITS.longTask).length,
        longestTask: Math.max(0, ...perf.long),
        jumps,
        deadGestures: dead,
        deadAt,
        errors: errors.length,
      }
      r.ok = r.reachedEnd && jank < LIMITS.jank && maxFrame <= LIMITS.maxFrame && r.longTasks === 0 && r.jumps === 0 && r.deadGestures === 0 && r.errors === 0
      results.push(r)
      console.log(
        `${r.ok ? '✓' : '✗'} ${prof.name} ${path}: Ruckler ${r.jankPct} % (zwei Takte ${r.twoVsyncPct} %), längster Frame ${maxFrame} ms, Long Tasks >100 ms: ${r.longTasks} (längster ${r.longestTask} ms), Sprünge ${jumps}, tote Gesten ${dead}${deadAt.length ? ` (${deadAt.join('; ')})` : ''}, Gesten ${r.gestures}${atEnd ? '' : ', Ende NICHT erreicht'}${errors.length ? `, Skriptfehler: ${errors[0].slice(0, 80)}` : ''}`,
      )
      await page.close()
    }
    await ctx.close()
  }
  await browser.close()
  return results
}

// Zeitgrenze für einzelne Aufrufe in die Seite: hängt ein Tab (keine Antwort mehr), meldet der Test das für diese
// Seite, statt endlos zu warten
const within = (p, ms, what) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error(`${what}: keine Antwort nach ${ms / 1000} s`)), ms))])

async function runWebkit() {
  const browser = await pw.webkit.launch()
  const ctx = await browser.newContext({ ...pw.devices['iPhone 13'], hasTouch: false, isMobile: false })
  const results = []
  // REPEAT=n: jede Seite n-mal (zum Eingrenzen seltener Abstürze)
  const runs = pages.flatMap((p) => Array.from({ length: Number(process.env.REPEAT || 1) }, () => p))
  for (const path of runs) {
    const page = await ctx.newPage()
    const errors = []
    // zuletzt gesehene Stelle (Scrollposition und Abschnitt in der Bildmitte), für die Meldung bei einem Absturz
    let last = '(noch nicht gescrollt)'
    page.on('pageerror', (e) => errors.push(e.message))
    // Absturz des Tabs (auf dem iPhone: „Seite wurde neu geladen“) als Fehler dieser Seite melden, nicht den Lauf abbrechen
    page.on('crash', () => errors.push(`Seite abgestürzt bei ${last}`))
    let atEnd = false
    let dead = 0
    try {
      await page.goto(B + path, { waitUntil: 'load', timeout: 45000 })
      await page.waitForTimeout(1500)
      const t0 = Date.now()
      for (let i = 0; i < 200 && !atEnd && Date.now() - t0 < 150000; i++) {
        const before = await within(page.evaluate(() => [scrollY, document.documentElement.scrollHeight - innerHeight]), 20000, 'Position lesen')
        await within(page.mouse.move(195, 420), 20000, 'Maus')
        await within(page.mouse.wheel(0, 500), 20000, 'Scrollrad')
        await page.waitForTimeout(300)
        const after = await within(
          page.evaluate(() => {
            const e = document.elementFromPoint(innerWidth / 2, innerHeight / 2)
            const sec = e?.closest('section, footer, [data-home-section]')
            const name = sec ? sec.getAttribute('aria-labelledby') || sec.id || sec.tagName.toLowerCase() : '?'
            return [scrollY, document.documentElement.scrollHeight - innerHeight, name]
          }),
          20000,
          'Position lesen',
        )
        last = `${Math.round(after[0])} px (${after[2]})`
        atEnd = after[0] >= after[1] - 4
        if (after[0] - before[0] < 8 && !atEnd) dead++
      }
    } catch (e) {
      errors.push(`abgebrochen: ${String(e.message || e).split('\n')[0]}`)
    }
    const r = { profile: 'WebKit iPhone 13', path, reachedEnd: atEnd, deadGestures: dead, errors: errors.length }
    r.ok = atEnd && dead === 0 && errors.length === 0
    results.push(r)
    console.log(`${r.ok ? '✓' : '✗'} WebKit ${path}: Ende ${atEnd ? 'erreicht' : 'NICHT erreicht'}, tote Gesten ${dead}${errors.length ? `, Fehler: ${errors[0].slice(0, 100)}` : ''}`)
    await within(page.close(), 10000, 'Tab schließen').catch(() => {})
  }
  await within(browser.close(), 20000, 'Browser schließen').catch(() => {})
  return results
}

const results = process.env.ENGINE === 'webkit' ? await runWebkit() : await runChromium()
if (process.env.OUT) writeFileSync(process.env.OUT, JSON.stringify(results, null, 2))
const bad = results.filter((r) => !r.ok)
console.log(bad.length ? `\n✗ ${bad.length} von ${results.length} Läufen verfehlen die Ziele` : `\n✓ Alle ${results.length} Läufe erreichen die Ziele`)
process.exit(bad.length ? 1 : 0)
