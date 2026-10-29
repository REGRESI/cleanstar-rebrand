/* global window */
// Video der gesamten Fahrt (Desktop und Handy) für die Freigabe: Bild für Bild aufgenommen (unabhängig von der
// Rechenleistung), danach mit ffmpeg zu MP4 zusammengesetzt. Mit den Texten der Szene.
// Aufruf: Server mit dem Build starten, dann: B=http://localhost:4177 N=360 node scripts/night/video.mjs
import { createRequire } from 'node:module'
import { execFileSync } from 'node:child_process'
import { mkdirSync, rmSync } from 'node:fs'
const { chromium } = createRequire(import.meta.url)('playwright')
const B = process.env.B || 'http://localhost:4177'
const N = Number(process.env.N || 360)
const OUT = 'docs/signatur-szene'
mkdirSync(OUT, { recursive: true })
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] })
for (const [tag, vp] of [
  ['desktop', { width: 1280, height: 720 }],
  ['mobil', { width: 390, height: 844 }],
]) {
  const dir = `${OUT}/.frames-${tag}`
  rmSync(dir, { recursive: true, force: true })
  mkdirSync(dir, { recursive: true })
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 1, isMobile: tag === 'mobil', hasTouch: tag === 'mobil' })
  await ctx.addInitScript(() => sessionStorage.setItem('cs-pl', '1'))
  const page = await ctx.newPage()
  await page.goto(`${B}/labor/nacht/?still=0&text`)
  await page.waitForFunction(() => window.__nightReady === true, null, { timeout: 180000 })
  await page.addStyleTag({ content: 'header, .mobile-bar { display: none !important }' })
  for (let i = 0; i < N; i++) {
    // sanft beschleunigen und abbremsen wie beim Scrollen
    const t = i / (N - 1)
    await page.evaluate((v) => window.__nightP(v), t)
    await page.locator('.night-stage').screenshot({ path: `${dir}/${String(i).padStart(4, '0')}.png` })
    if (i % 30 === 0) console.log(tag, i, '/', N)
  }
  await ctx.close()
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', '30', '-i', `${dir}/%04d.png`, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '23', '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2', `${OUT}/fahrt-${tag}.mp4`])
  rmSync(dir, { recursive: true, force: true })
  console.log('✓', `${OUT}/fahrt-${tag}.mp4`)
}
await browser.close()
