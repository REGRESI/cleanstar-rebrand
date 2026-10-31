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
// 4. Moment-Überschriften (je Seite einmal): Die Tinte des Schreibschrift-Großbuchstabens darf keinem anderen Buchstaben
//    näher als 0,08 em kommen. Pixelgenau: Großbuchstabe und übrige Buchstaben getrennt gezeichnet, Tinte des
//    Großbuchstabens um 0,08 em verbreitert, gemeinsame Pixel zählen als Überschneidung.
// 5. Leere Fläche (nur Desktop): Bildschirm in 32 × 20 Kacheln (je etwa 45 px); eine Kachel ist leer, wenn sie praktisch
//    einfarbig ist und kein Inhalt näher als zwei Kacheln liegt (normaler Abstand um Inhalte zählt nicht). Mehr als
//    40 % leere Fläche gelten als Fehler.
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
  // Verdeckende Flächen: Kopfzeile, Handy-Leiste und stehende (sticky) Bildflächen mit eigenem Hintergrund
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
      // Inhalt eingeklappter Aufklapper wird nicht gezeichnet
      if (e.tagName === 'DETAILS' && !e.open && !el.closest('summary')) return false
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
    // Karten und aktive Übergangsmasken: nur tatsächlich freigelegte Texte; DOM-Rechtecke außerhalb einer polygonalen Maske sind verdeckt.
    if (el.closest('.rf-stage, .ht-block')) {
      const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
      const plane = el.closest('.ht-plane')
      // A common outer ancestor is not evidence of visibility through another plane's mask.
      if (!hit || !(el.contains(hit) || (hit.contains(el) && (!plane || hit.closest('.ht-plane') === plane)))) return
    }
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
  // Gezeichnete Wörter (Text-System, Tippen); der Roll zeigt in Ruhe echten Text
  for (const el of document.querySelectorAll('#main .at-w, footer .at-w')) {
    if (!shown(el)) continue
    add(el.getBoundingClientRect(), el, (el.textContent || [...el.querySelectorAll('[data-c]')].map((c) => c.dataset.c).join('')).slice(0, 30))
  }
  for (const el of document.querySelectorAll('#main .ty-c[data-s="1"], #main .ty-c[data-s="2"], #main .ty-c[data-s="3"]')) {
    if (!shown(el)) continue
    add(el.getBoundingClientRect(), el, 'getippt ' + el.dataset.c)
  }
  // Liegt an der Überschneidung eine deckende Fläche (z. B. eine Karte im Stapel), die nur einen der beiden Texte enthält,
  // ist der andere verdeckt und keine Überschneidung
  const covered = (a, b, x, y) => {
    let e = document.elementFromPoint(x, y)
    for (; e && e !== document.body; e = e.parentElement) {
      const cs = getComputedStyle(e)
      const bg = cs.backgroundColor.match(/[\d.]+/g)
      if (bg && (bg.length < 4 || Number(bg[3]) === 1) && Number(cs.opacity) === 1) break
    }
    if (!e || e === document.body) return false
    // eine deckende Fläche liegt über mindestens einem der beiden Texte (z. B. oberste Karte eines Stapels)
    return !(e.contains(a.el) && e.contains(b.el))
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
      if (area > 0.2 * small && iy > 6 && !covered(a, b, Math.max(a.x, b.x) + ix / 2, Math.max(a.y, b.y) + iy / 2)) bad.push(`„${a.label}“ ↔ „${b.label}“`)
    }
  return bad
}

/** Pixelgenaue Prüfung einer Moment-Überschrift: berührt der Schreibschrift-Buchstabe (plus 0,08 em) andere Buchstaben? */
async function momentClash(page, i) {
  const info = await page.evaluate((i) => {
    const m = document.querySelectorAll('.moment')[i]
    m.scrollIntoView({ block: 'center' })
    if (window.__lenis) window.__lenis.scrollTo(m.getBoundingClientRect().top + window.scrollY - innerHeight / 2 + m.offsetHeight / 2, { immediate: true, force: true })
    m.setAttribute('data-mo', 'done')
    const v = m.querySelector('.moment-v')
    if (v) v.style.cssText += ';transform:none;filter:none;opacity:1'
    let st = document.getElementById('mo-chk')
    if (!st) {
      st = document.createElement('style')
      st.id = 'mo-chk'
      st.textContent = '.moment-glow{display:none!important}img,picture,canvas,video{visibility:hidden!important}[data-chk=base] .mo-c,[data-chk=base] .moment-cap,[data-chk=cap] .mo-c,[data-chk=txt] .moment-cap{visibility:hidden!important}*{animation-play-state:paused!important}'
      document.head.appendChild(st)
    }
    const r = m.getBoundingClientRect()
    const fs = parseFloat(getComputedStyle(m).fontSize)
    const pad = fs * 1.6
    return { x: Math.max(0, r.left - pad), y: Math.max(0, r.top - pad), w: Math.min(innerWidth, r.right + pad) - Math.max(0, r.left - pad), h: Math.min(innerHeight, r.bottom + pad) - Math.max(0, r.top - pad), fs, text: m.textContent.trim().slice(0, 40) }
  }, i)
  await page.waitForTimeout(200)
  const clip = { x: Math.round(info.x), y: Math.round(info.y), width: Math.round(info.w), height: Math.round(info.h) }
  const grab = async (mode) => {
    await page.evaluate(([i, mode]) => document.querySelectorAll('.moment')[i].setAttribute('data-chk', mode), [i, mode])
    await page.waitForTimeout(60)
    const png = await page.screenshot({ clip })
    return sharp(png).greyscale().raw().toBuffer({ resolveWithObject: true })
  }
  const base = await grab('base')
  const cap = await grab('cap')
  const txt = await grab('txt')
  await page.evaluate((i) => document.querySelectorAll('.moment')[i].removeAttribute('data-chk'), i)
  const { width: W, height: H } = base.info
  const ink = (a) => {
    const m = new Uint8Array(W * H)
    for (let k = 0; k < m.length; k++) m[k] = Math.abs(a.data[k] - base.data[k]) > 28 ? 1 : 0
    return m
  }
  const mc = ink(cap)
  const mt = ink(txt)
  // Tinte des Großbuchstabens um 0,08 em verbreitern (quadratischer Kern, zwei Durchgänge)
  const r = Math.max(1, Math.round(info.fs * 0.08))
  const tmp = new Uint8Array(W * H)
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      let v = 0
      for (let d = -r; d <= r && !v; d++) {
        const xx = x + d
        if (xx >= 0 && xx < W && mc[y * W + xx]) v = 1
      }
      tmp[y * W + x] = v
    }
  let hits = 0
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      if (!mt[y * W + x]) continue
      for (let d = -r; d <= r; d++) {
        const yy = y + d
        if (yy >= 0 && yy < H && tmp[yy * W + x]) {
          hits++
          break
        }
      }
    }
  return { hits, text: info.text, png: hits > 4 ? await page.screenshot({ clip }) : null }
}

/** Anteil leerer Kacheln (nahezu einfarbig) im Bildschirm */
async function emptyShare(png) {
  const { data, info } = await sharp(png).resize({ width: 320, height: 200, fit: 'fill' }).greyscale().raw().toBuffer({ resolveWithObject: true })
  const CW = 10
  const TX = info.width / CW
  const TY = info.height / CW
  let content = new Uint8Array(TX * TY)
  for (let ty = 0; ty < TY; ty++)
    for (let tx = 0; tx < TX; tx++) {
      let mn = 255
      let mx = 0
      for (let y = ty * CW; y < ty * CW + CW; y++)
        for (let x = tx * CW; x < tx * CW + CW; x++) {
          const v = data[y * info.width + x]
          if (v < mn) mn = v
          if (v > mx) mx = v
        }
      content[ty * TX + tx] = mx - mn > 4 ? 1 : 0
    }
  // Normaler Abstand um Inhalte (zwei Kacheln, etwa 90 px) zählt nicht als leer
  for (let pass = 0; pass < 2; pass++) {
    const d = content.slice()
    for (let ty = 0; ty < TY; ty++)
      for (let tx = 0; tx < TX; tx++) {
        if (content[ty * TX + tx]) continue
        if ((tx > 0 && content[ty * TX + tx - 1]) || (tx < TX - 1 && content[ty * TX + tx + 1]) || (ty > 0 && content[(ty - 1) * TX + tx]) || (ty < TY - 1 && content[(ty + 1) * TX + tx])) d[ty * TX + tx] = 1
      }
    content = d
  }
  let empty = 0
  for (const v of content) if (!v) empty++
  return empty / content.length
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
    if (path === '/') {
      const registry = await page.evaluate(() => {
        const root = document.querySelector('[data-home-transitions]')
        const sections = [...root.querySelectorAll('section')]
        const missing = []
        sections.slice(1).forEach(section => {
          const own = section.hasAttribute('data-home-internal') ? section : section.closest('[data-home-section]')
          if (!own?.dataset.transition) missing.push(section.getAttribute('aria-labelledby') || section.className)
        })
        const footer = document.querySelector('body > #root footer[data-home-section="footer"], footer[data-home-section="footer"]')
        if (footer?.dataset.transition !== 'image-to-stripe') missing.push('footer')
        const types = [...root.querySelectorAll('[data-transition]')].map(n => n.dataset.transition)
        for (let i = 1; i < types.length; i++) if (types[i] === types[i-1]) missing.push('Wiederholung: ' + types[i])
        for (const type of ['paper-reveal', 'clouds', 'logo-house']) if (types.filter(t => t === type).length !== 1) missing.push('Anzahl ' + type)
        if (types.filter(t => t === 'flow-color').length > 2) missing.push('Mehr als zwei Farbwechsel')
        return { missing, count: sections.length }
      })
      if (registry.missing.length) { failures++; console.log('✗ Fehlende/ungültige Übergänge: ' + registry.missing.join(', ')) }
      else console.log(`✓ ${dev}: alle ${registry.count} Startseiten-Abschnitte mit registriertem Übergang (einschließlich Footer)`)
    }
    const total = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight)
    let pageFails = 0
    for (let y = Number(process.env.FROM || 0); y <= Math.min(total, Number(process.env.TO || total)); y += STEP) {
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
      const blank = dev === 'Desktop' ? await emptyShare(png) : 0
      const name = `${dev}-${path.replace(/\//g, '_') || 'start'}-${String(y).padStart(6, '0')}`
      if (e.empty || overlaps.length || blank > 0.4) {
        failures++
        pageFails++
        await sharp(png).jpeg({ quality: 70 }).toFile(`${OUT}/${name}.jpg`)
        console.log(`✗ ${dev} ${path} y=${y}: ${e.empty ? `leer (einfarbig ${(e.uniform * 100).toFixed(1)} %, Abweichung ${e.sd.toFixed(1)})` : ''}${blank > 0.4 ? ` leere Fläche ${(blank * 100).toFixed(0)} %` : ''}${overlaps.length ? ' Überschneidung: ' + overlaps.slice(0, 3).join('; ') : ''}`)
      }
    }
    // Moment-Überschriften: Schwung gegen übrige Buchstaben, pixelgenau
    const moments = await page.locator('.moment').count()
    for (let i = 0; i < moments; i++) {
      const c = await momentClash(page, i)
      if (c.hits > 4) {
        failures++
        pageFails++
        if (c.png) await sharp(c.png).jpeg({ quality: 80 }).toFile(`${OUT}/${dev}-${path.replace(/\//g, '_') || 'start'}-moment-${i}.jpg`)
        console.log(`✗ ${dev} ${path}: Moment „${c.text}“: Schwung berührt andere Buchstaben (${c.hits} Pixel unter 0,08 em)`)
      }
    }
    console.log(`${pageFails ? '✗' : '✓'} ${dev} ${path}: ${Math.floor(total / STEP) + 1} Positionen, ${pageFails} Fehler`)
    await ctx.close()
  }
  await browser.close()
}
console.log(failures ? `✗ ${failures} Fehler bei ${shots} Aufnahmen (Bilder: ${OUT})` : `✓ Keine leeren Bildschirme, keine Überschneidungen (${shots} Aufnahmen)`)
process.exit(failures ? 1 : 0)
