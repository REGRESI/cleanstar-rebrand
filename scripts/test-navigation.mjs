/* global window, document, innerHeight, MouseEvent -- Code in page.evaluate läuft im Browser */
// Navigations-Test: Nach jedem Seitenwechsel muss die neue Seite ganz oben stehen.
//
// Für Desktop (1440 px) und Mobile (390 px):
// 1. jede Seite aus der Sitemap öffnen und ganz nach unten scrollen,
// 2. dort jeden internen Link ohne Anker anklicken (Kopfzeile, Fußzeile, Inhalt, auf Mobile auch das Menü),
// 3. nach dem Wechsel prüfen, dass window.scrollY höchstens 2 px beträgt (nach 500 ms und nach 1500 ms).
// Zusätzlich: Zurück/Vor im Browser stellt die vorherige Position wieder her, nie eine falsche.
//
// Aufruf: npm run build && npx serve dist -l 4176
//         B=http://localhost:4176 node scripts/test-navigation.mjs
// Optional: WORKERS=4 (parallele Browser-Tabs je Gerät), ONLY=/ueber-uns/ (nur diese Startseite testen)
import { createRequire } from 'node:module'
// playwright wird nur für Tests installiert (npm i --no-save playwright), daher über require mit NODE_PATH
const { chromium } = createRequire(import.meta.url)('playwright')

const B = (process.env.B || 'http://localhost:4176').replace(/\/$/, '')
const WORKERS = Number(process.env.WORKERS || 4)
const TOL = 2

const devices = [
  ['Desktop', { viewport: { width: 1440, height: 900 } }],
  ['Mobile', { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }],
]

const sitemap = await (await fetch(B + '/sitemap.xml')).text()
let pages = [...sitemap.matchAll(/<loc>https?:\/\/[^/]+(\/[^<]*)<\/loc>/g)].map((m) => m[1])
if (process.env.ONLY) pages = pages.filter((p) => p === process.env.ONLY)
if (!pages.length) throw new Error('Keine Seiten in der Sitemap gefunden: ' + B)

const norm = (p) => p.replace(/\/+$/, '') || '/'

/** Interne Links ohne Anker auf der aktuellen Seite, je Bereich nach Ziel dedupliziert */
const collectLinks = (page) =>
  page.evaluate(() => {
    const out = []
    const seen = new Set()
    for (const a of document.querySelectorAll('a[href]')) {
      const href = a.getAttribute('href')
      if (!href.startsWith('/') || href.startsWith('//') || href.includes('#')) continue
      if (/\.(xml|pdf|txt|png|jpe?g|webp|zip|docx?)$/i.test(href)) continue
      if (a.target === '_blank' || a.hasAttribute('download')) continue
      if (a.closest('#mobile-menu')) continue
      const area = a.closest('header') ? 'header' : a.closest('footer') ? 'footer' : 'inhalt'
      const k = area + ' ' + href
      if (seen.has(k)) continue
      seen.add(k)
      out.push({ area, href, text: (a.textContent || a.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 40) })
    }
    return out
  })

async function scrollToBottom(page) {
  await page.evaluate(async () => {
    const lenis = window.__lenis
    const bottom = () => document.documentElement.scrollHeight - innerHeight
    for (let i = 0; i < 3; i++) {
      if (lenis) lenis.scrollTo(bottom(), { immediate: true, force: true })
      else window.scrollTo(0, bottom())
      await new Promise((r) => setTimeout(r, 150))
    }
  })
  await page.waitForTimeout(200)
  return page.evaluate(() => window.scrollY)
}

async function ready(page) {
  await page.waitForFunction(() => window.__csReady === true, null, { timeout: 15000 })
  // Lenis startet erst im Leerlauf (spätestens nach 2,5 s); getestet wird mit aktivem Smooth Scroll wie bei echten Besuchern
  await page.waitForFunction(() => !!window.__lenis, null, { timeout: 6000 }).catch(() => {})
}

async function measureTop(page) {
  await page.waitForTimeout(500)
  const a = await page.evaluate(() => window.scrollY)
  await page.waitForTimeout(1000)
  const b = await page.evaluate(() => window.scrollY)
  return [a, b]
}

async function runDevice(browser, label, opts) {
  const failures = []
  let tests = 0
  const queue = [...pages]
  const worker = async () => {
    const ctx = await browser.newContext(opts)
    const page = await ctx.newPage()
    page.on('pageerror', (e) => failures.push(`${label}: Skriptfehler ${e.message}`))
    while (queue.length) {
      const src = queue.shift()
      await page.goto(B + src)
      await ready(page)
      const links = await collectLinks(page)
      // Auf Mobile zusätzlich die Links im aufgeklappten Menü
      const menu = label === 'Mobile' ? ['/', '/leistungen', '/ablauf', '/einzugsgebiet', '/kontakt'] : []
      const plan = [...links.map((l) => ({ ...l, menu: false })), ...menu.map((href) => ({ area: 'menü', href, text: href, menu: true }))]
      for (const l of plan) {
        if (norm(new URL(page.url()).pathname) !== norm(src)) {
          await page.goto(B + src)
          await ready(page)
        }
        const from = await scrollToBottom(page)
        let clicked
        if (l.menu) {
          await page.getByRole('button', { name: 'Menü öffnen' }).click()
          const link = page.locator('#mobile-menu a[href="' + l.href + '"]').first()
          clicked = (await link.count()) > 0
          if (clicked) await link.click()
        } else {
          clicked = await page.evaluate(
            ({ area, href }) => {
              const sel = area === 'header' ? 'header a' : area === 'footer' ? 'footer a' : 'main a, body > a'
              const a = [...document.querySelectorAll(sel)].find((x) => x.getAttribute('href') === href && !x.closest('#mobile-menu'))
              if (!a) return false
              // auch SVG-Links (Karte) haben kein click(), daher ein echtes Klick-Ereignis
              a.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }))
              return true
            },
            { area: l.area, href: l.href },
          )
        }
        if (!clicked) continue
        const [y1, y2] = await measureTop(page)
        const at = norm(new URL(page.url()).pathname)
        // „Kostenloses Angebot“ öffnet den Konfigurator als Fenster statt die Seite zu wechseln: kein Seitenwechsel
        if (at === norm(src) && (await page.locator('[role=dialog]').count())) {
          await page.keyboard.press('Escape')
          await page.waitForTimeout(300)
          continue
        }
        tests++
        const okUrl = at === norm(l.href.split('?')[0])
        // Logo auf der Startseite selbst scrollt bewusst weich nach oben: dort zählt nur die Endposition
        const smooth = norm(l.href) === norm(src)
        if (!okUrl || (!smooth && y1 > TOL) || y2 > TOL) {
          failures.push(`${label}: ${src} → [${l.area}] „${l.text}“ (${l.href}) | vorher ${Math.round(from)} px, danach ${Math.round(y1)} / ${Math.round(y2)} px${okUrl ? '' : ', gelandet auf ' + at}`)
        }
      }
    }
    await ctx.close()
  }
  await Promise.all(Array.from({ length: Math.min(WORKERS, pages.length) }, worker))

  // Zurück/Vor: vorherige Position wiederherstellen, nie eine falsche
  const ctx = await browser.newContext(opts)
  const page = await ctx.newPage()
  for (const [a, href] of [
    ['/ueber-uns/', '/kontakt'],
    ['/', '/ueber-uns'],
    ['/leistungen/bueroreinigung/', '/faq'],
  ]) {
    await page.goto(B + a)
    await ready(page)
    await page.evaluate(() => {
      const y = Math.min(1200, document.documentElement.scrollHeight - innerHeight)
      if (window.__lenis) window.__lenis.scrollTo(y, { immediate: true, force: true })
      else window.scrollTo(0, y)
    })
    await page.waitForTimeout(400)
    const before = await page.evaluate(() => window.scrollY)
    await page.evaluate((h) => [...document.querySelectorAll('footer a')].find((x) => x.getAttribute('href') === h)?.click(), href)
    const [t1] = await measureTop(page)
    await page.goBack()
    const [b1, b2] = await measureTop(page)
    await page.goForward()
    const [f1, f2] = await measureTop(page)
    tests++
    const back = Math.abs(b2 - before) <= 40 && Math.abs(b1 - before) <= 40
    if (t1 > TOL || !back || f1 > TOL || f2 > TOL) {
      failures.push(`${label}: Zurück/Vor ${a} ↔ ${href} | Position vorher ${Math.round(before)}, nach Klick ${Math.round(t1)}, nach Zurück ${Math.round(b1)}/${Math.round(b2)}, nach Vor ${Math.round(f1)}/${Math.round(f2)}`)
    }
  }
  await ctx.close()
  return { tests, failures }
}

const browser = await chromium.launch()
let total = 0
const all = []
const results = await Promise.all(devices.map(([label, opts]) => runDevice(browser, label, opts).then((r) => [label, r])))
for (const [label, { tests, failures }] of results) {
  total += tests
  all.push(...failures)
  console.log(`${label}: ${tests} Seitenwechsel geprüft, ${failures.length} Fehler`)
}
await browser.close()
for (const f of all.slice(0, 80)) console.log('FAIL ' + f)
if (all.length > 80) console.log(`… und ${all.length - 80} weitere`)
console.log(all.length ? `✗ ${all.length} von ${total} Prüfungen fehlgeschlagen` : `✓ Alle ${total} Prüfungen bestanden (${pages.length} Seiten)`)
process.exit(all.length ? 1 : 0)
