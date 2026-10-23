// Prüft die veröffentlichte Website im echten Browser (läuft im GitHub-Workflow nach dem Deploy).
// Aufruf: B=https://www.cleanstar-dienstleistungen.de node scripts/check-site.cjs
const { chromium } = require('playwright')
const fs = require('node:fs')

const B = (process.env.B || 'https://www.cleanstar-dienstleistungen.de').replace(/\/$/, '')
let failed = 0
const ok = (c, m) => {
  if (!c) failed++
  console.log((c ? 'PASS ' : 'FAIL ') + m)
}
fs.mkdirSync('site-check', { recursive: true })
;(async () => {
  const b = await chromium.launch()
  for (const [label, opts] of [
    ['Desktop', { viewport: { width: 1440, height: 900 } }],
    ['Mobile', { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true }],
  ]) {
    const p = await (await b.newContext(opts)).newPage()
    const errs = []
    const bad = []
    p.on('pageerror', (e) => errs.push(e.message))
    p.on('response', (r) => {
      if (r.status() >= 400 && !r.url().includes('gibt-es-nicht')) bad.push(r.status() + ' ' + r.url())
    })

    await p.goto(B + '/')
    await p.waitForTimeout(1500)
    ok(!(await p.locator('#cs-gate').count()), `${label}: keine Passwort-Sperre`)
    ok(await p.getByRole('heading', { level: 1 }).first().isVisible(), `${label}: Startseite sichtbar`)
    ok(!(await p.locator('meta[name=robots][content*=noindex]').count()), `${label}: kein noindex`)
    const canonical = await p.locator('link[rel=canonical]').getAttribute('href')
    ok(canonical === 'https://www.cleanstar-dienstleistungen.de/', `${label}: Canonical ${canonical}`)
    const og = await p.locator('meta[property="og:image"]').getAttribute('content')
    ok(og.startsWith('https://www.cleanstar-dienstleistungen.de/'), `${label}: Open Graph ${og}`)
    const hero = await p.evaluate(() => [...document.images].filter((i) => i.currentSrc.includes('/hero/')).map((i) => i.naturalWidth)[0])
    ok(hero > 0, `${label}: Hero-Bild geladen (${hero}px)`)
    if (label === 'Mobile') await p.screenshot({ path: 'site-check/start-mobile.png' })

    await p
      .locator('a[href^="/ueber-uns"]')
      .first()
      .evaluate((a) => a.click())
    await p.waitForTimeout(1500)
    ok(/\/ueber-uns\/?$/.test(p.url()) && (await p.getByText('Wer ist wofür zuständig?').isVisible()), `${label}: Über uns per Link`)
    await p.reload()
    await p.waitForTimeout(1500)
    ok(await p.getByText('Wer ist wofür zuständig?').isVisible(), `${label}: Neuladen Über uns`)

    await p.goto(B + '/leistungen/bueroreinigung')
    await p.waitForTimeout(1800)
    ok(/\/leistungen\/bueroreinigung\/?$/.test(p.url()) && (await p.getByText('Was wird bei Ihnen gereinigt?').isVisible()), `${label}: Direktaufruf Büroreinigung`)
    const imgs = await p.evaluate(() => [...document.images].filter((i) => i.currentSrc.includes('/images/')).map((i) => i.naturalWidth))
    ok(imgs.length > 0 && imgs.every((w) => w > 0), `${label}: Fotos geladen (${imgs.length})`)
    ok(!(await p.getByText('Vorschau-Version', { exact: true }).count()), `${label}: kein Vorschau-Hinweis`)

    for (const [path, text] of [
      ['/impressum/', 'Angaben gemäß'],
      ['/datenschutz/', 'Verantwortlicher'],
    ]) {
      await p.goto(B + path)
      await p.waitForTimeout(1000)
      ok(await p.getByText(text).first().isVisible(), `${label}: ${path}`)
    }
    // Footer-Links zu Impressum und Datenschutz
    const legal = await p.evaluate(() => [...document.querySelectorAll('footer a')].map((a) => a.getAttribute('href')).filter((h) => /impressum|datenschutz/.test(h)))
    ok(legal.includes('/impressum') && legal.includes('/datenschutz'), `${label}: Footer verlinkt Impressum und Datenschutz (${legal.join(', ')})`)

    await p.goto(B + '/gibt-es-nicht/')
    await p.waitForTimeout(1000)
    ok(
      await p
        .getByText(/nicht gefunden|gibt es nicht|404/i)
        .first()
        .isVisible(),
      `${label}: 404-Seite`,
    )
    console.log(label, 'Skriptfehler:', errs.length ? errs.slice(0, 5) : 'keine', '| fehlende Dateien:', bad.length ? bad.slice(0, 5) : 'keine')
    if (errs.length || bad.length) failed++
  }

  const robots = await (await fetch(B + '/robots.txt')).text()
  ok(
    /Allow: \//.test(robots) && !/Disallow: \/\s*$/m.test(robots) && robots.includes('https://www.cleanstar-dienstleistungen.de/sitemap.xml'),
    'robots.txt erlaubt Indexierung, Sitemap auf www',
  )
  const sitemap = await (await fetch(B + '/sitemap.xml')).text()
  ok((sitemap.match(/<loc>https:\/\/www\.cleanstar-dienstleistungen\.de\//g) || []).length > 70, 'Sitemap mit www-Adressen (inkl. Ratgeber und Orte)')
  ok(/GPTBot[\s\S]*ClaudeBot[\s\S]*PerplexityBot[\s\S]*Google-Extended/.test(robots), 'robots.txt erlaubt KI-Crawler')
  const llms = await fetch(B + '/llms.txt')
  ok(llms.ok && (await llms.text()).startsWith('# CleanStar'), 'llms.txt erreichbar')
  ok((await fetch(B + '/llms-full.txt')).ok, 'llms-full.txt erreichbar')
  // Favicon für Google: /favicon.ico im Root, ICO-Format, nicht per robots.txt gesperrt
  const fav = await fetch(B + '/favicon.ico')
  const favBuf = Buffer.from(await fav.arrayBuffer())
  ok(fav.ok && favBuf.readUInt16LE(2) === 1 && favBuf.readUInt16LE(4) >= 3, `favicon.ico erreichbar (${fav.status}, ${favBuf.readUInt16LE(4)} Größen)`)
  ok(!/Disallow:\s*\/favicon/i.test(robots), 'favicon.ico in robots.txt nicht gesperrt')
  for (const f of ['/favicon.svg', '/favicon-48.png', '/favicon-96.png', '/favicon-192.png', '/favicon-512.png', '/apple-touch-icon.png', '/site.webmanifest'])
    ok((await fetch(B + f)).ok, `${f} erreichbar`)
  for (const path of [
    '/ratgeber/',
    '/ratgeber/bueroreinigung-kosten/',
    '/bueroreinigung/offenburg/',
    '/einzugsgebiet/wolfach/',
    '/fakten/',
    '/angebote-vergleichen/',
    '/wechsel-rechner/',
    '/reinigungsfirma-kalkulieren/',
  ]) {
    const html = await (await fetch(B + path)).text()
    ok(/<h1[\s>]/.test(html) && /application\/ld\+json/.test(html) && /<meta[^>]*name="description"/.test(html), `Vorgerendert mit H1, Description und JSON-LD: ${path}`)
  }

  // Weiterleitung ohne www → www (nur Hinweis: hängt von den DNS-Einträgen der Hauptdomain ab)
  if (B.includes('www.cleanstar-dienstleistungen.de')) {
    for (const apex of ['https://cleanstar-dienstleistungen.de/', 'http://cleanstar-dienstleistungen.de/']) {
      try {
        const r = await fetch(apex, { redirect: 'manual' })
        const loc = r.headers.get('location') || ''
        console.log(
          `${r.status >= 300 && r.status < 400 && loc.startsWith('https://www.cleanstar-dienstleistungen.de') ? 'PASS' : 'HINWEIS'} Weiterleitung ${apex} → ${r.status} ${loc}`,
        )
      } catch (e) {
        console.log(`HINWEIS Weiterleitung ${apex} nicht erreichbar: ${e.cause?.code || e.message}`)
      }
    }
  }
  await b.close()
  if (failed) process.exit(1)
})()
