const { chromium } = require('playwright')
// Prüft die veröffentlichte Online-Vorschau im echten Browser (läuft im GitHub-Workflow nach dem Deploy).
let failed = 0
const ok = (c, m) => {
  if (!c) failed++
  console.log((c ? 'PASS ' : 'FAIL ') + m)
}
require('node:fs').mkdirSync('pages-check', { recursive: true })
const B = process.env.B || 'https://regresi.github.io/cleanstar-rebrand'
;(async () => {
  const b = await chromium.launch()
  for (const [label, opts] of [
    ['Desktop', { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 }],
    ['Mobile', { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true }],
  ]) {
    const ctx = await b.newContext(opts)
    const p = await ctx.newPage()
    const errs = [],
      bad = []
    p.on('pageerror', (e) => errs.push(e.message))
    p.on('console', (m) => m.type() === 'error' && errs.push(m.text()))
    p.on('response', (r) => {
      if (r.status() >= 400 && !r.url().includes('gibt-es-nicht')) bad.push(r.status() + ' ' + r.url())
    })
    await p.goto(B + '/')
    await p.waitForTimeout(1200)
    ok(await p.locator('#cs-gate').isVisible(), `${label}: Passwortfeld sichtbar`)
    ok(await p.locator('#root').evaluate((e) => getComputedStyle(e).visibility === 'hidden'), `${label}: Inhalt verborgen`)
    if (label === 'Mobile') await p.screenshot({ path: 'pages-check/ghp-gate-mobile.png' })
    await p.fill('#cs-gate-pw', 'falsch')
    await p.press('#cs-gate-pw', 'Enter')
    await p.waitForTimeout(400)
    ok(await p.getByText('Das Passwort stimmt nicht.').isVisible(), `${label}: falsches Passwort abgelehnt`)
    await p.fill('#cs-gate-pw', 'cleanstar2026')
    await p.press('#cs-gate-pw', 'Enter')
    await p.waitForTimeout(1500)
    ok(!(await p.locator('#cs-gate').count()), `${label}: freigeschaltet`)
    ok(await p.getByRole('heading', { level: 1 }).first().isVisible(), `${label}: Startseite sichtbar`)
    const heroImg = await p.evaluate(() => [...document.images].filter((i) => i.currentSrc.includes('/hero/')).map((i) => i.naturalWidth)[0])
    ok(heroImg > 0, `${label}: Hero-Bild geladen (${heroImg}px)`)
    if (label === 'Mobile') await p.screenshot({ path: 'pages-check/ghp-home-mobile.png' })
    // Scroll-Video: Frames werden nachgeladen
    await p.evaluate(async () => {
      for (let y = 0; y < 2500; y += 250) {
        scrollTo(0, y)
        await new Promise((r) => setTimeout(r, 120))
      }
    })
    await p.waitForTimeout(1500)
    // Navigation per Link
    await p.goto(B + '/')
    await p.waitForTimeout(800)
    await p.evaluate(() => scrollTo(0, 0))
    await p
      .locator(`a[href^="/cleanstar-rebrand/ueber-uns"]`)
      .first()
      .evaluate((a) => a.click())
    await p.waitForTimeout(1500)
    ok(/\/cleanstar-rebrand\/ueber-uns\/?$/.test(p.url()) && (await p.getByText('Wer ist wofür zuständig?').isVisible()), `${label}: Unterseite Über uns per Link`)
    await p.reload()
    await p.waitForTimeout(1500)
    ok(
      !(await p
        .locator('#cs-gate')
        .isVisible()
        .catch(() => false)) && (await p.getByText('Wer ist wofür zuständig?').isVisible()),
      `${label}: Neuladen Über uns, bleibt freigeschaltet`,
    )
    await p.goto(B + '/leistungen/bueroreinigung')
    await p.waitForTimeout(1800)
    ok(
      p.url().endsWith('/leistungen/bueroreinigung/') && (await p.getByText('Was wird bei Ihnen gereinigt?').isVisible()),
      `${label}: Direktaufruf Büroreinigung ohne Schrägstrich`,
    )
    const imgs = await p.evaluate(() =>
      [...document.images]
        .filter((i) => i.currentSrc.includes('/images/'))
        .slice(0, 3)
        .map((i) => [i.currentSrc.split('/').slice(-2).join('/'), i.naturalWidth]),
    )
    ok(imgs.length && imgs.every((i) => i[1] > 0), `${label}: Fotos geladen ${JSON.stringify(imgs[0])}`)
    if (label === 'Mobile') await p.screenshot({ path: 'pages-check/ghp-service-mobile.png' })
    const footer = await p.getByText('Vorschau-Version', { exact: true }).last().isVisible()
    ok(footer, `${label}: Hinweis Vorschau-Version im Footer`)
    const robots = await p.locator('meta[name=robots]').first().getAttribute('content')
    ok(robots.startsWith('noindex'), `${label}: noindex (${robots})`)
    await p.goto(B + '/gibt-es-nicht/')
    await p.waitForTimeout(1200)
    ok(
      await p
        .getByText(/nicht gefunden|gibt es nicht|404/i)
        .first()
        .isVisible(),
      `${label}: 404-Seite`,
    )
    // neue Sitzung: Sperre wieder aktiv
    const p2 = await (await b.newContext(opts)).newPage()
    await p2.goto(B + '/kontakt/')
    await p2.waitForTimeout(800)
    ok(await p2.locator('#cs-gate').isVisible(), `${label}: neue Sitzung ist wieder gesperrt (auch auf Unterseite)`)
    console.log(label, 'Fehler:', errs.length ? errs.slice(0, 5) : 'keine', '| fehlende Dateien:', bad.length ? bad.slice(0, 5) : 'keine')
  }
  await b.close()
  if (failed) process.exit(1)
})()
