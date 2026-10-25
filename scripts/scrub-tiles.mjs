// Bildkacheln für den Scroll-Text der Startseite (public/images/scrub/): klein, quadratisch, retina-scharf.
// Quelle: bilder/hero/hero-feierabend.jpg, bilder/mappe/mappe-schluessel.png, bilder/mappe/mappe-kaffee.png, bilder/gruender-1..3.jpg
// Aufruf: node scripts/scrub-tiles.mjs
import { mkdirSync } from 'node:fs'
import sharp from 'sharp'

const OUT = 'public/images/scrub'
mkdirSync(OUT, { recursive: true })
const S = 192 // 2× für Kacheln bis 96 CSS-Pixel
const paper = { r: 236, g: 231, b: 220, alpha: 1 }

// Feierabend: Ausschnitt mit Arbeitsplätzen und Abendlicht im Fenster
const fa = sharp('bilder/hero/hero-feierabend.jpg')
const m = await fa.metadata()
const side = Math.round(m.height * 0.62)
await fa
  .extract({ left: Math.round(m.width * 0.36), top: Math.round(m.height * 0.2), width: side, height: side })
  .resize(S, S)
  .webp({ quality: 82 })
  .toFile(`${OUT}/feierabend.webp`)

// Freigestellte Objekte auf hellem Papiergrund, mittig mit Luft
for (const [name, src, scale] of [
  ['schluessel', 'bilder/mappe/mappe-schluessel.png', 0.82],
  ['kaffee', 'bilder/mappe/mappe-kaffee.png', 0.86],
]) {
  const inner = Math.round(S * scale)
  const obj = await sharp(src).trim({ threshold: 1 }).resize(inner, inner, { fit: 'inside' }).png().toBuffer()
  const meta = await sharp(obj).metadata()
  await sharp({ create: { width: S, height: S, channels: 4, background: paper } })
    .composite([{ input: obj, left: Math.round((S - meta.width) / 2), top: Math.round((S - meta.height) / 2) }])
    .webp({ quality: 84 })
    .toFile(`${OUT}/${name}.webp`)
}

// Gründer: runde Porträts (Kopf und Schultern)
for (const i of [1, 2, 3]) {
  const src = sharp(`bilder/gruender-${i}.jpg`)
  const g = await src.metadata()
  const w = Math.round(Math.min(g.width, g.height) * 0.72)
  await src
    .extract({ left: Math.round((g.width - w) / 2), top: Math.round(g.height * 0.06), width: w, height: w })
    .resize(S, S)
    .webp({ quality: 82 })
    .toFile(`${OUT}/gruender-${i}.webp`)
}
console.log('✓ Kacheln in ' + OUT)
