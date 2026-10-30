// Deploy-Test: Eine Seite der vorigen Version ist noch offen, dann wird eine neue Version veröffentlicht, dann klickt
// jemand auf einen internen Link. Erwartet: Die Zielseite erscheint korrekt (keine Fehlermeldung).
//
// Simulation: Aus dist/ entsteht eine „alte Version“, in der alle Dateinamen mit Hash (assets/, Loader-Daten) anders
// heißen. Ein eigener Server liefert erst die alte Version, nach dem Laden der Seite nur noch die neue (wie GitHub Pages:
// unbekannte Dateien bekommen die 404-HTML-Seite mit Status 404). Geprüft wird
//   (a) ohne aufbewahrte alte Dateien: Die App lädt die Zieladresse einmal vollständig neu,
//   (b) mit aufbewahrten alten Dateien (wie im Deploy-Workflow): Der Wechsel läuft ohne Neuladen.
//
// Aufruf: npm run build && node scripts/test-deploy.mjs           (BROWSERS=chromium,webkit; Standard: alle verfügbaren)
import { createRequire } from 'node:module'
import { createServer } from 'node:http'
import { cpSync, existsSync, mkdtempSync, readdirSync, readFileSync, renameSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { extname, join } from 'node:path'

const require = createRequire(import.meta.url)
const pw = require('playwright')
const DIST = new URL('../dist/', import.meta.url).pathname

if (!existsSync(join(DIST, 'index.html'))) throw new Error('dist/ fehlt: zuerst npm run build')

// ---- alte Version erzeugen: jeden Hash-Dateinamen umbenennen und alle Verweise darauf ersetzen ----
const OLD = mkdtempSync(join(tmpdir(), 'cs-old-'))
cpSync(DIST, OLD, { recursive: true })
const hash = /__VITE_REACT_SSG_HASH__ = '([^']+)'/.exec(readFileSync(join(DIST, 'index.html'), 'utf8'))?.[1]
const renames = new Map()
for (const f of readdirSync(join(OLD, 'assets'))) {
  const m = /^(.+-)([\w-]{8})(\.\w+)$/.exec(f)
  if (m) renames.set(f, `${m[1]}${m[2]}alt${m[3]}`)
}
const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]))
const textFile = /\.(html|js|css|json|txt|xml)$/
for (const file of walk(OLD)) {
  if (!textFile.test(file)) continue
  let s = readFileSync(file, 'utf8')
  const before = s
  for (const [a, b] of renames) if (s.includes(a)) s = s.split(a).join(b)
  if (hash) s = s.split(hash).join(hash + 'alt')
  if (s !== before) writeFileSync(file, s)
}
for (const [a, b] of renames) renameSync(join(OLD, 'assets', a), join(OLD, 'assets', b))
for (const file of walk(OLD)) if (hash && file.includes(hash)) renameSync(file, file.split(hash).join(hash + 'alt'))

// ---- Server: Wurzel umschaltbar, optional mit aufbewahrten alten Dateien ----
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.avif': 'image/avif', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.pmtiles': 'application/octet-stream', '.txt': 'text/plain', '.xml': 'application/xml' }
let mode = 'old'
let keepOld = false
const resolve = (root, url) => {
  let p = decodeURIComponent(url.split(/[?#]/)[0])
  if (p.endsWith('/')) p += 'index.html'
  let f = join(root, p)
  if (existsSync(f) && statSync(f).isDirectory()) f = join(f, 'index.html')
  return existsSync(f) && statSync(f).isFile() ? f : null
}
const requests = []
const server = createServer((req, res) => {
  requests.push(req.url)
  const f = (mode === 'old' ? resolve(OLD, req.url) : resolve(DIST, req.url) ?? (keepOld ? resolve(OLD, req.url) : null))
  if (!f) {
    res.writeHead(404, { 'content-type': 'text/html' })
    res.end(readFileSync(join(DIST, '404.html')))
    return
  }
  res.writeHead(200, { 'content-type': types[extname(f)] ?? 'application/octet-stream', 'cache-control': 'no-store' })
  res.end(readFileSync(f))
})
await new Promise((r) => server.listen(0, r))
const B = `http://localhost:${server.address().port}`

// ---- Ablauf je Browser ----
const wanted = (process.env.BROWSERS || 'chromium,webkit').split(',')
const fails = []
let ran = 0
for (const name of wanted) {
  let browser
  try {
    browser = await pw[name].launch()
  } catch {
    console.log(`– ${name}: nicht installiert, übersprungen`)
    continue
  }
  ran++
  for (const keep of [false, true]) {
    for (const [from, linkTo, expectH1] of [
      ['/', '/leistungen/', /Ansprechpartner|Leistungen/i],
      ['/leistungen/', '/qualitaetsgarantie/', /zusagen|Garantie/i],
    ]) {
      const label = `${name} ${keep ? 'mit' : 'ohne'} alten Dateien ${from} → ${linkTo}`
      mode = 'old'
      keepOld = keep
      const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
      const errors = []
      page.on('pageerror', (e) => errors.push(e.message))
      let loads = 0
      page.on('load', () => loads++)
      await page.goto(B + from, { waitUntil: 'networkidle' })
      await page.waitForTimeout(800)
      // neue Version veröffentlicht
      mode = 'new'
      requests.length = 0
      const link = page.locator(`#main a[href="${linkTo}"], #main a[href="${linkTo.replace(/\/$/, '')}"], header a[href="${linkTo}"], header a[href="${linkTo.replace(/\/$/, '')}"]`).first()
      if (!(await link.count())) {
        fails.push(`${label}: Link nicht gefunden`)
        await page.close()
        continue
      }
      await link.evaluate((a) => a.click())
      await page.waitForURL((u) => u.pathname.replace(/\/$/, '') === linkTo.replace(/\/$/, ''), { timeout: 15000 }).catch(() => {})
      await page.waitForTimeout(2500)
      await page.waitForLoadState('networkidle').catch(() => {})
      const body = await page.locator('body').innerText()
      const h1 = (await page.locator('h1').first().textContent().catch(() => '')) || ''
      const path = new URL(page.url()).pathname
      const ok =
        path.replace(/\/$/, '') === linkTo.replace(/\/$/, '') &&
        !/Unexpected Application Error|did not match the expected pattern|konnte gerade nicht geladen werden/i.test(body) &&
        expectH1.test(h1)
      const jsonReq = requests.filter((u) => /static-loader-data/.test(u))
      if (!ok) fails.push(`${label}: Zielseite fehlt (Adresse ${path}, H1 „${h1.trim().slice(0, 50)}“)`)
      if (jsonReq.length) fails.push(`${label}: Loader-Daten angefragt (${jsonReq.join(', ')})`)
      console.log(`${ok && !jsonReq.length ? '✓' : '✗'} ${label}: ${loads > 1 ? 'neu geladen' : 'ohne Neuladen'}, H1 „${h1.trim().slice(0, 40)}“${errors.length ? `, Skriptfehler: ${errors[0].slice(0, 80)}` : ''}`)
      if (keep && loads > 1) console.log(`  Hinweis: trotz aufbewahrter Dateien neu geladen`)
      await page.close()
    }
  }
  await browser.close()
}
server.close()
if (!ran) {
  console.log('✗ Kein Browser verfügbar')
  process.exit(1)
}
if (fails.length) {
  console.log(`\n✗ ${fails.length} Fehler:\n` + fails.map((f) => '  ' + f).join('\n'))
  process.exit(1)
}
console.log(`\n✓ Deploy-Test bestanden (${ran} Browser)`)
