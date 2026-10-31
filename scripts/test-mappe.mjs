/* global document, window, getComputedStyle -- Code in page.evaluate läuft im Browser */
// Mappen-Test: Blättern und Bedienen sauber getrennt.
//
// Desktop (3D, 1440 × 900) und Mobile (flache Mappe, iPhone 13, Touch):
// (a) 20 Wischgesten: 10 vor, 10 zurück. Nach jeder Geste muss die Seitenzahl um genau eine Doppelseite bzw. Seite wechseln.
// (b) Auf jeder Seite jedes Bedienelement bedienen (Klick, Ziehen, Tippen). Die Seitenzahl muss gleich bleiben.
//     Ausnahme mit eigener Prüfung: Einträge im Inhaltsverzeichnis springen zur richtigen Seite.
// (c) Mobil: Ein Tippen in der Seitenmitte blättert nie. Desktop: Ein Klick auf die Buchhälfte blättert genau eine Doppelseite.
//
// Aufruf: npm run build && npx serve dist -l 4176
//         B=http://localhost:4176 node scripts/test-mappe.mjs        (ONLY=desktop oder ONLY=mobile)
import { createRequire } from 'node:module'
const { chromium, devices } = createRequire(import.meta.url)('playwright')

const B = (process.env.B || 'http://localhost:4176').replace(/\/$/, '')
const URL = B + '/leistungsmappe/'
const BLOCK = 'a, button, input, select, textarea, label, [role="button"], [role="radio"], [role="slider"], [data-interactive]'
const fails = []
let checks = 0
const ok = (cond, msg) => {
  checks++
  if (!cond) fails.push(msg)
}

const counter = (p) => p.textContent('[data-mappe-counter]').then((t) => t.trim())
const num = (label) => (label === 'Einband' ? 0 : Number(label.split('/')[0]))

async function desktop(browser) {
  const p = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  p.on('pageerror', (e) => fails.push('Desktop Skriptfehler: ' + e.message))
  await p.goto(URL, { waitUntil: 'networkidle' })
  await p.waitForTimeout(4000)
  const still = () =>
    p.waitForFunction(() => [...document.querySelectorAll('[data-page-slot="right"],[data-page-slot="left"]')].some((e) => e.className.includes('opacity-100')), null, {
      timeout: 120000,
    })
  // Ruhe abwarten: Seitenzahl stabil und Doppelseite liegt still
  const settle = async () => {
    await p.waitForTimeout(400)
    await still()
    await p.waitForFunction(() => !document.querySelector('[data-page-slot].pointer-events-none.opacity-100'), null, { timeout: 5000 }).catch(() => {})
    await p.waitForTimeout(600)
  }
  await p.getByText('Mappe wird vorbereitet', { exact: true }).waitFor({ state: 'hidden', timeout: 120000 })
  await p.mouse.click(720, 450)
  await settle()

  // freie Stelle am unteren Rand (Bedienelemente wie das Inhaltsverzeichnis blockieren das Blättern absichtlich)
  const freeY = (x, b) =>
    p.evaluate(
      ([xx, top, h, block]) => [0.08, 0.12, 0.9, 0.95, 0.97, 0.985].map((f) => top + h * f).find((yy) => !document.elementFromPoint(xx, yy)?.closest(block)) ?? top + h * 0.985,
      [x, b.y, b.height, BLOCK],
    )
  // (a) Wischen: an der Unterkante der Seite (Fußzeile, keine Bedienelemente)
  const swipe = async (side) => {
    const b = await p.locator(`[data-page-slot="${side}"]`).boundingBox()
    const x0 = side === 'right' ? b.x + b.width * 0.75 : b.x + b.width * 0.25
    const y = await freeY(x0, b)
    const dir = side === 'right' ? -1 : 1
    await p.mouse.move(x0, y)
    // wie eine echte Hand: kurz ankommen, dann drücken (zwei Bilder, damit die Seite die Zeigerposition verarbeitet hat)
    await p.evaluate(() => new Promise((r) => window.requestAnimationFrame(() => window.requestAnimationFrame(r))))
    await p.mouse.down()
    // Wischweg mit der Seitenbreite skaliert (gut eine Seitenbreite, wie mit der Hand)
    const steps = Math.ceil((b.width * 1.15) / 40)
    for (let k = 1; k <= steps; k++) await p.mouse.move(x0 + dir * k * 40, y)
    await p.mouse.up()
    await settle()
  }
  for (let i = 0; i < (process.env.SKIP_SWIPE ? 0 : 10); i++) {
    const before = num(await counter(p))
    await swipe('right')
    const after = num(await counter(p))
    ok(after === before + 2 || (before === 1 && after === 3), `Desktop Wischen vor ${i + 1}: ${before} → ${after}`)
  }
  for (let i = 0; i < (process.env.SKIP_SWIPE ? 0 : 10); i++) {
    const before = num(await counter(p))
    await swipe('left')
    const after = num(await counter(p))
    ok(after === before - 2, `Desktop Wischen zurück ${i + 1}: ${before} → ${after}`)
  }

  // (c) Klick auf die rechte Buchhälfte blättert vor, auf die linke zurück (je genau eine Doppelseite)
  {
    const before = num(await counter(p))
    const b = await p.locator('[data-page-slot="right"]').boundingBox()
    const rightX = b.x + b.width * 0.5
    const rightY = await freeY(rightX, b)
    await p.mouse.move(rightX, rightY)
    await p.evaluate(() => new Promise(r => window.requestAnimationFrame(() => window.requestAnimationFrame(r))))
    await p.mouse.click(rightX, rightY)
    await settle()
    const mid = num(await counter(p))
    ok(mid === before + 2, `Desktop Klick rechte Hälfte: ${before} → ${mid}`)
    const l = await p.locator('[data-page-slot="left"]').boundingBox()
    const leftX = l.x + l.width * 0.5
    const leftY = await freeY(leftX, l)
    await p.mouse.move(leftX, leftY)
    await p.evaluate(() => new Promise(r => window.requestAnimationFrame(() => window.requestAnimationFrame(r))))
    await p.mouse.click(leftX, leftY)
    await settle()
    ok(num(await counter(p)) === before, `Desktop Klick linke Hälfte: ${mid} → ${await counter(p)}`)
  }

  // zurück zum Anfang
  while (num(await counter(p)) > 1) {
    await p.click('[data-mappe-prev]')
    await settle()
  }

  // (b) Bedienelemente auf allen Doppelseiten
  for (let guard = 0; guard < 14; guard++) {
    const label = await counter(p)
    // die echten Seiten müssen aufliegen (sonst wäre die Doppelseite nicht bedienbar)
    const shown = await p
      .waitForFunction(() => document.querySelectorAll('[data-page-slot="left"].opacity-100, [data-page-slot="right"].opacity-100').length > 0, null, { timeout: 20000 })
      .then(() => true)
      .catch(() => false)
    ok(shown, `Desktop ${label}: echte Seiten liegen nicht auf`)
    await p.waitForTimeout(500)
    for (const side of ['left', 'right']) {
      const slot = p.locator(`[data-page-slot="${side}"].opacity-100`)
      if (!(await slot.count())) continue
      const handles = await slot.locator(BLOCK).elementHandles()
      if (process.env.DEBUG) console.log('desktop', label, side, handles.length)
      for (const h of handles) {
        const info = await h.evaluate((e) => {
          const r = e.getBoundingClientRect()
          return {
            tag: e.tagName.toLowerCase(),
            type: e.getAttribute('type'),
            role: e.getAttribute('role'),
            toc: e.getAttribute('data-toc'),
            text: (e.getAttribute('aria-label') || e.textContent || '').trim().slice(0, 30),
            visible: r.width > 2 && r.height > 2 && getComputedStyle(e).visibility !== 'hidden',
            nested: !!e.parentElement?.closest('a, button, label, [role="button"], [role="slider"]'),
          }
        })
        if (!info.visible || info.nested || info.toc) continue
        const b = await h.boundingBox()
        if (!b) continue
        const cx = b.x + b.width / 2
        const cy = b.y + b.height / 2
        if (info.tag === 'a') await h.evaluate((e) => e.addEventListener('click', (ev) => ev.preventDefault(), { once: true }))
        if (info.type === 'range' || info.role === 'slider' || info.tag === 'svg') {
          await p.mouse.move(cx, cy)
          await p.mouse.down()
          for (let k = 1; k <= 8; k++) await p.mouse.move(cx - k * 12, cy + k * 4)
          await p.mouse.up()
        } else {
          await p.mouse.click(cx, cy)
        }
        await p.waitForTimeout(700)
        // geöffnete Ebenen schließen (Rückruf, Anfragekarte, Ausklappseite)
        for (let k = 0; k < 3 && (await p.locator('[role="dialog"]').count()); k++) {
          await p.keyboard.press('Escape')
          await p.waitForFunction(() => !document.querySelector('[role="dialog"]'), null, { timeout: 6000 }).catch(() => {})
        }
        ok(!(await p.locator('[role="dialog"]').count()), `Desktop ${label}: Ebene nach „${info.text}“ schließt nicht`)
        if (/ausklappen|einklappen/i.test(info.text)) {
          await p.waitForTimeout(2500)
          const tab = p.locator('[data-page-slot] button[aria-label="Grundriss einklappen"]')
          if (await tab.count()) await tab.first().click({ force: true })
          // warten, bis die Ausklappseite wieder eingeklappt ist und die Seiten aufliegen
          await p.waitForTimeout(3000)
          await settle()
        }
        if (process.env.DEBUG) console.log('desktop', label, side, info.tag, info.role, info.text, info.visible, info.nested)
        const now = await counter(p)
        ok(now === label, `Desktop ${label} ${side}: „${info.text}“ (${info.tag}${info.role ? ' ' + info.role : ''}) blättert: ${label} → ${now}`)
        if (now !== label) {
          // zurück auf die geprüfte Doppelseite
          while (num(await counter(p)) > num(label)) (await p.click('[data-mappe-prev]'), await settle())
          while (num(await counter(p)) < num(label)) (await p.click('[data-mappe-next]'), await settle())
        }
      }
    }
    if (await p.locator('[data-mappe-next]:disabled').count()) break
    await p.click('[data-mappe-next]')
    await settle()
  }

  // Inhaltsverzeichnis springt zur richtigen Seite
  while (num(await counter(p)) > 1) {
    await p.click('[data-mappe-prev]')
    await settle()
  }
  await p.click('[data-mappe-next]')
  await settle()
  await p.click('[data-page-slot="left"] [data-toc="konditionen"]')
  await p.waitForTimeout(8000)
  await settle()
  ok(/Klare Preise/.test((await p.locator('[data-page-slot].opacity-100').allTextContents()).join(' ')), 'Desktop Inhaltsverzeichnis: Sprung zu Konditionen')
  await p.close()
}

async function mobile(browser) {
  const ctx = await browser.newContext({ ...devices['iPhone 13'] })
  const p = await ctx.newPage()
  p.on('pageerror', (e) => fails.push('Mobile Skriptfehler: ' + e.message))
  await p.goto(URL, { waitUntil: 'networkidle' })
  await p.waitForTimeout(2500)
  const cdp = await ctx.newCDPSession(p)
  const box = await p.locator('.mappe-flat').boundingBox()
  const swipe = async (dir) => {
    const y = box.y + box.height * 0.95
    const x0 = dir < 0 ? box.x + box.width - 40 : box.x + 40
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x0, y }] })
    for (let k = 1; k <= 6; k++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x0 + (dir * k * (box.width - 80)) / 6, y }] })
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    await p.waitForTimeout(1100)
  }
  const tap = async (x, y) => {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] })
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    await p.waitForTimeout(900)
  }
  // (a) Wischen; vom Einband auf Seite 1, dann vor und zurück
  await swipe(-1)
  for (let i = 0; i < 10; i++) {
    const before = num(await counter(p))
    await swipe(-1)
    const after = num(await counter(p))
    ok(after === before + 1, `Mobile Wischen vor ${i + 1}: ${before} → ${after}`)
  }
  for (let i = 0; i < 10; i++) {
    const before = num(await counter(p))
    await swipe(1)
    const after = num(await counter(p))
    ok(after === before - 1, `Mobile Wischen zurück ${i + 1}: ${before} → ${after}`)
  }
  // (c) Tippen in der Seitenmitte
  {
    const before = await counter(p)
    await tap(box.x + box.width / 2, box.y + box.height * 0.5)
    ok((await counter(p)) === before, `Mobile Tippen Seitenmitte blättert: ${before} → ${await counter(p)}`)
  }
  // (b) Bedienelemente auf allen Seiten (Tippen bzw. Ziehen mit Touch), ab Seite 1
  for (let k = 0; k < 30 && num(await counter(p)) > 1; k++) (await p.click('[data-mappe-prev]'), await p.waitForTimeout(800))
  for (let guard = 0; guard < 24; guard++) {
    const label = await counter(p)
    // sichtbare Seite: die Seite unter der Buchmitte (StPageFlip hält Nachbarseiten im DOM)
    const visible = await p.evaluate(
      ([x, y]) => [...document.querySelectorAll('.mappe-flat-page')].indexOf(document.elementFromPoint(x, y)?.closest('.mappe-flat-page')),
      [box.x + box.width / 2, box.y + box.height * 0.6],
    )
    if (visible < 0) break
    const handles = await p.locator('.mappe-flat-page').nth(visible).locator(BLOCK).elementHandles()
    for (const h of handles) {
      const info = await h.evaluate((e) => {
        const r = e.getBoundingClientRect()
        return {
          tag: e.tagName.toLowerCase(),
          type: e.getAttribute('type'),
          role: e.getAttribute('role'),
          toc: e.getAttribute('data-toc'),
          text: (e.getAttribute('aria-label') || e.textContent || '').trim().slice(0, 30),
          visible: r.width > 2 && r.height > 2 && r.top >= 0 && r.bottom <= window.innerHeight,
          nested: !!e.parentElement?.closest('a, button, label, [role="button"], [role="slider"]'),
        }
      })
      if (!info.visible || info.nested || info.toc) continue
      const b = await h.boundingBox()
      if (!b) continue
      const cx = b.x + b.width / 2
      const cy = b.y + b.height / 2
      if (info.tag === 'a') await h.evaluate((e) => e.addEventListener('click', (ev) => ev.preventDefault(), { once: true }))
      if (info.type === 'range' || info.role === 'slider' || info.tag === 'svg') {
        // Ziehen über das Element (waagerecht, wie ein Wischen)
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: cx, y: cy }] })
        for (let k = 1; k <= 6; k++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: cx - k * 15, y: cy }] })
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
        await p.waitForTimeout(900)
      } else {
        await tap(cx, cy)
      }
      await p.waitForTimeout(500)
      for (let k = 0; k < 3 && (await p.locator('[role="dialog"]').count()); k++) {
        const close = p.locator('[role="dialog"] button:has-text("Einklappen")')
        if (await close.count()) await close.first().click()
        else await p.keyboard.press('Escape')
        await p.waitForFunction(() => !document.querySelector('[role="dialog"]'), null, { timeout: 4000 }).catch(() => {})
      }
      ok(!(await p.locator('[role="dialog"]').count()), `Mobile ${label}: Ebene nach „${info.text}“ schließt nicht`)
      if (process.env.DEBUG) console.log('mobile', label, info.tag, info.role, info.text)
      const now = await counter(p)
      ok(now === label, `Mobile ${label}: „${info.text}“ (${info.tag}${info.role ? ' ' + info.role : ''}) blättert: ${label} → ${now}`)
      if (now !== label) {
        while (num(await counter(p)) > num(label)) (await p.click('[data-mappe-prev]'), await p.waitForTimeout(900))
        while (num(await counter(p)) < num(label)) (await p.click('[data-mappe-next]'), await p.waitForTimeout(900))
      }
    }
    if (await p.locator('[data-mappe-next]:disabled').count()) break
    await p.click('[data-mappe-next]')
    await p.waitForTimeout(1000)
  }
  await ctx.close()
}

const only = process.env.ONLY
if (only !== 'mobile') {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
  await desktop(b)
  await b.close()
}
if (only !== 'desktop') {
  const b = await chromium.launch()
  await mobile(b)
  await b.close()
}
for (const f of fails) console.log('FAIL ' + f)
console.log(fails.length ? `✗ ${fails.length} von ${checks} Prüfungen fehlgeschlagen` : `✓ Alle ${checks} Prüfungen bestanden`)
process.exit(fails.length ? 1 : 0)
