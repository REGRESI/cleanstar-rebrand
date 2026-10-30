/* global window, document, innerHeight, innerWidth, getComputedStyle, NodeFilter -- Code in page.evaluate läuft im Browser */
// Übergangs-Test: An keiner Scrollposition darf der Bildschirm leer sein, und sichtbare Texte dürfen sich nicht
// überschneiden.
//
// Für Desktop (1440 × 900) und Mobile (390 × 844), Startseite und Hauptseiten:
// 1. in 80-px-Schritten von oben bis unten scrollen, bei jedem Schritt eine Aufnahme,
// 2. leer: über 92 % der Pixel nahezu einfarbig (Helligkeit innerhalb ±6 um den häufigsten Wert, auf 1/8 verkleinert,
//    damit Text als Fläche zählt) und die Standardabweichung der Helligkeit klein (unter 10),
// 3. Überschneidung: Zeilenboxen sichtbarer Texte (auch gezeichnete Buchstaben des Text-Systems) überlappen sich um
//    mehr als 20 % der kleineren Box. Texte unter der festen Kopfzeile bzw. Handy-Leiste zählen nicht (verdeckt).
// Fehlerbilder: docs/review-reparatur/fehler/
//
// Aufruf: npm run build && node scripts/... (statischer Server auf dist), dann
//         B=http://localhost:4177 node scripts/test-transitions.mjs
// Optional: ONLY=/ueber-uns/ (nur diese Seite), DEVICE=Mobile, STEP=80
import { createRequire } from 'node:module'
import { mkdirSync, rmSync } from 'node:fs'
const require = createRequire(import.meta.url)
const { chromium } = require('playwright')
const sharp = require('sharp')

const B = (process.env.B || 'http://localhost:4177').replace(/\/$/, '')
const STEP = Number(process.env.STEP || 80)
const OUT = 'docs/review-reparatur/fehler'
let pages = ['/', '/leistungen/', '/leistungen/bueroreinigung/', '/qualitaetsgarantie/', '/ablauf/', '/ueber-uns/', '/einzugsgebiet/', '/karriere/', '/partner/', '/faq/', '/kontakt/']
if (process.env.ONLY) pages = pages.filter((p) => p === process.env.ONLY)
let devices = [
  ['Desktop', { viewport: { width: 1440, height: 900 } }],
  ['Mobile', { viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true }],
]
if (process.env.DEVICE) devices = devices.filter(([n]) => n === process.env.DEVICE)

if (!process.env.ONLY) rmSync(OUT, { recursive: true, force: true })
mkdirSync(OUT, { recursive: true })

/** Leer-Prüfung auf der verkleinerten Graustufen-Aufnahme */
async function emptiness(png) {
  const { data, info } = await sharp(png).resize({ width: 180, kernel: 'cubic' }).greyscale().raw().toBuffer({ resolveWithObject: true })
  const hist = new Uint32Array(256)
  let sum = 0
  for (const v of data) {
    hist[v]++
    sum += v
  }
  const n = info.width * info.height
  let mode = 0
  for (let i = 1; i < 256; i++) if (hist[i] > hist[mode]) mode = i
  let near = 0
  for (let i = Math.max(0, mode - 6); i <= Math.min(255, mode + 6); i++) near += hist[i]
  const mean = sum / n
  let v = 0
  for (const x of data) v += (x - mean) ** 2
  const sd = Math.sqrt(v / n)
  return { uniform: near / n, sd, empty: near / n > 0.92 && sd < 10 }
}

/** Sichtbare Textboxen im Bildschirm (Textknoten und gezeichnete Buchstaben), dazu verdeckende feste Leisten */
const textBoxes = () => {
  const vh = innerHeight
  const vw = innerWidth
  const covers = []
  for (const el of document.querySelectorAll('header > div, .mobile-bar, [data-fixed-cover]')) {
    const r = el.getBoundingClientRect()
    const cs = getComputedStyle(el)
    if (r.height > 0 && cs.visibility !== 'hidden' && Number(cs.opacity) > 0.1) covers.push(r)
  }
  const shown = (el) => {
    for (let e = el; e && e !== document.body; e = e.parentElement) {
      const cs = getComputedStyle(e)
      if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) < 0.15) return false
      if (e.classList.contains('sr-only')) return false
      if (cs.clipPath && cs.clipPath !== 'none' && /inset\(0px 100%|circle\(0px/.test(cs.clipPath)) return false
    }
    return true
  }
  const out = []
  // sichtbarer Teil: an Vorfahren mit overflow hidden/clip zuschneiden
  const clip = (r0, el) => {
    let r = { left: r0.left, top: r0.top, right: r0.right, bottom: r0.bottom }
    for (let e = el; e && e !== document.body; e = e.parentElement) {
      const cs = getComputedStyle(e)
      if (cs.overflowX === 'visible' && cs.overflowY === 'visible') continue
      const c = e.getBoundingClientRect()
      r = { left: Math.max(r.left, c.left), top: Math.max(r.top, c.top), right: Math.min(r.right, c.right), bottom: Math.min(r.bottom, c.bottom) }
      if (r.right <= r.left || r.bottom <= r.top) return null
    }
    return { left: r.left, top: r.top, width: r.right - r.left, height: r.bottom - r.top, right: r.right, bottom: r.bottom }
  }
  const add = (r0, el, label) => {
    const r = clip(r0, el)
    if (!r || r.width < 2 || r.height < 4) return
    if (r.bottom < 0 || r.top > vh || r.right < 0 || r.left > vw) return
    for (const c of covers) if (r.top < c.bottom && r.bottom > c.top && r.left < c.right && r.right > c.left) return
    out.push({ x: r.left, y: r.top, w: r.width, h: r.height, label, id: out.length, el })
  }
  // Textknoten
  const walk = document.createTreeWalker(document.getElementById('main') || document.body, NodeFilter.SHOW_TEXT)
  const seen = new Map()
  for (let t = walk.nextNode(); t; t = walk.nextNode()) {
    if (!t.textContent.trim()) continue
    const el = t.parentElement
    if (!el || el.closest('script,style,svg,[aria-hidden="true"] .sr-only') || !shown(el)) continue
    const range = document.createRange()
    range.selectNodeContents(t)
    for (const r of range.getClientRects()) add(r, el, t.textContent.trim().slice(0, 30))
    seen.set(el, true)
  }
  // Gezeichnete Wörter (Text-System, Roll, Tippen)
  for (const el of document.querySelectorAll('#main .at-w, #main .roll-a, footer .at-w')) {
    if (!shown(el)) continue
    add(el.getBoundingClientRect(), el, (el.textContent || [...el.querySelectorAll('[data-c]')].map((c) => c.dataset.c).join('')).slice(0, 30))
  }
  for (const el of document.querySelectorAll('#main .ty-c[data-s="1"], #main .ty-c[data-s="2"], #main .ty-c[data-s="3"]')) {
    if (!shown(el)) continue
    add(el.getBoundingClientRect(), el, 'getippt ' + el.dataset.c)
  }
  // Paare prüfen (Elemente in Vorfahr-Beziehung sind gewollt verschachtelt)
  const bad = []
  for (let i = 0; i < out.length; i++)
    for (let j = i + 1; j < out.length; j++) {
      const a = out[i]
      const b = out[j]
      if (a.el === b.el || a.el.contains(b.el) || b.el.contains(a.el)) continue
      // Buchstaben desselben getippten Satzes bzw. desselben Worts sind Nachbarn
      if (a.el.parentElement === b.el.parentElement && a.el.classList.contains('ty-c')) continue
      const ix = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)
      const iy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y)
      if (ix <= 0 || iy <= 0) continue
      const area = ix * iy
      const small = Math.min(a.w * a.h, b.w * b.h)
      if (area > 0.2 * small && iy > 6) bad.push(`„${a.label}“ ↔ „${b.label}“`)
    }
  return bad
}

let failures = 0
let shots = 0
for (const [dev, opts] of devices) {
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] })
  for (const path of pages) {
    const ctx = await browser.newContext({ ...opts, reducedMotion: 'no-preference' })
    // Intro (Haus-Fenster) nur beim ersten Besuch: hier überspringen
    await ctx.addInitScript(() => sessionStorage.setItem('cs-pl', '1'))
    const page = await ctx.newPage()
    await page.goto(B + path, { waitUntil: 'load' })
    await page.waitForFunction(() => window.__csReady === true, null, { timeout: 15000 }).catch(() => {})
    await page.waitForTimeout(1200)
    const total = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight)
    let pageFails = 0
    for (let y = 0; y <= total; y += STEP) {
      await page.evaluate((v) => {
        const l = window.__lenis
        if (l) l.scrollTo(v, { immediate: true, force: true })
        else window.scrollTo(0, v)
      }, y)
      await page.waitForTimeout(140)
      const png = await page.screenshot()
      shots++
      const e = await emptiness(png)
      const overlaps = await page.evaluate(textBoxes)
      const name = `${dev}-${path.replace(/\//g, '_') || 'start'}-${String(y).padStart(6, '0')}`
      if (e.empty || overlaps.length) {
        failures++
        pageFails++
        await sharp(png).jpeg({ quality: 70 }).toFile(`${OUT}/${name}.jpg`)
        console.log(`✗ ${dev} ${path} y=${y}: ${e.empty ? `leer (einfarbig ${(e.uniform * 100).toFixed(1)} %, Abweichung ${e.sd.toFixed(1)})` : ''}${overlaps.length ? ' Überschneidung: ' + overlaps.slice(0, 3).join('; ') : ''}`)
      }
    }
    console.log(`${pageFails ? '✗' : '✓'} ${dev} ${path}: ${Math.floor(total / STEP) + 1} Positionen, ${pageFails} Fehler`)
    await ctx.close()
  }
  await browser.close()
}
console.log(failures ? `✗ ${failures} Fehler bei ${shots} Aufnahmen (Bilder: ${OUT})` : `✓ Keine leeren Bildschirme, keine Überschneidungen (${shots} Aufnahmen)`)
process.exit(failures ? 1 : 0)
