/* global window */
// Standbilder der Signatur-Szene (LCP-Bild und Abfolge bei reduzierter Bewegung) aus dem fertigen Build aufnehmen.
// Aufruf: npm run build, Server starten, dann: B=http://localhost:4177 node scripts/night/stills.mjs
// Ergebnis: public/night/<id>-d-<960|1600|2400>.webp und <id>-m-780.webp (danach erneut bauen)
import { createRequire } from 'node:module'
import { execFileSync } from 'node:child_process'
import { mkdirSync } from 'node:fs'
const { chromium } = createRequire(import.meta.url)('playwright')
const B = process.env.B || 'http://localhost:4177'
const STILLS = [
  ['start', 0.02],
  ['clean', 0.47],
  ['check', 0.79],
  ['morning', 0.985],
]
const tmp = 'public/night/.raw'
mkdirSync(tmp, { recursive: true })
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] })
for (const [tag, vp, dpr] of [
  ['d', { width: 1600, height: 900 }, 1.5],
  ['m', { width: 390, height: 844 }, 2],
]) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: dpr, isMobile: tag === 'm', hasTouch: tag === 'm' })
  await ctx.addInitScript(() => sessionStorage.setItem('cs-pl', '1'))
  const page = await ctx.newPage()
  await page.goto(`${B}/labor/nacht/?still=0`)
  await page.waitForFunction(() => window.__nightReady === true, null, { timeout: 180000 })
  await page.addStyleTag({ content: 'header, .mobile-bar { display: none !important }' })
  for (const [id, p] of STILLS) {
    await page.evaluate((v) => window.__nightP(v), p)
    await page.waitForTimeout(300)
    await page.locator('.night canvas').screenshot({ path: `${tmp}/${id}-${tag}.png` })
    console.log('✓', id, tag)
  }
  await ctx.close()
}
await browser.close()
// Verkleinern und als WebP speichern
execFileSync('python3', [
  '-c',
  `
from PIL import Image
for i in ['start','clean','check','morning']:
    d = Image.open('${tmp}/'+i+'-d.png').convert('RGB')
    for w in (960, 1600, 2400):
        d.resize((w, round(w*9/16)), Image.LANCZOS).save('public/night/'+i+'-d-'+str(w)+'.webp', 'WEBP', quality=82, method=6)
    m = Image.open('${tmp}/'+i+'-m.png').convert('RGB')
    m.resize((780, round(780*m.height/m.width)), Image.LANCZOS).save('public/night/'+i+'-m-780.webp', 'WEBP', quality=80, method=6)
`,
])
execFileSync('rm', ['-rf', tmp])
console.log('fertig: public/night/')
