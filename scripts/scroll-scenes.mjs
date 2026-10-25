// Bilder für die Scroll-Stopper (public/images/scenes/).
// Leistungen „Der Wisch“: klares Foto und dieselbe Aufnahme beschlagen (weichgezeichnet, milchig, mit Tropfen).
// Quelle: bilder/leistung-fensterreinigung.jpg. Aufruf: node scripts/scroll-scenes.mjs
import { mkdirSync } from 'node:fs'
import sharp from 'sharp'

const OUT = 'public/images/scenes'
mkdirSync(OUT, { recursive: true })
const SRC = 'bilder/leistung-fensterreinigung.jpg'

// Zufall mit festem Startwert: gleiche Tropfen bei jedem Lauf
let seed = 7
const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646

/** Tropfenstruktur als SVG: viele feine Perlen, wenige größere, unten etwas dichter (Wasser sammelt sich) */
function drops(w, h) {
  const out = []
  const n = Math.round((w * h) / 1500)
  for (let i = 0; i < n; i++) {
    const big = rnd() < 0.1
    const r = big ? 3 + rnd() * 5 : 0.8 + rnd() * 2.2
    const x = rnd() * w
    const y = Math.pow(rnd(), 0.8) * h
    const ry = r * (1 + rnd() * 0.25)
    // dunkler Rand unten, Glanzpunkt oben links: wirkt wie eine Perle auf Glas
    out.push(`<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${r.toFixed(2)}" ry="${ry.toFixed(2)}" fill="url(#d)" opacity="${(0.55 + rnd() * 0.4).toFixed(2)}"/>`)
    if (r > 1.6) out.push(`<circle cx="${(x - r * 0.35).toFixed(1)}" cy="${(y - ry * 0.4).toFixed(1)}" r="${(r * 0.22).toFixed(2)}" fill="#fff" opacity="0.85"/>`)
  }
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
<defs><radialGradient id="d" cx="0.45" cy="0.38" r="0.62">
<stop offset="0" stop-color="#fff" stop-opacity="0.05"/><stop offset="0.62" stop-color="#fff" stop-opacity="0.22"/>
<stop offset="0.86" stop-color="#1b2430" stop-opacity="0.32"/><stop offset="1" stop-color="#1b2430" stop-opacity="0"/></radialGradient></defs>
${out.join('\n')}</svg>`)
}

for (const w of [960, 1672]) {
  const h = Math.round((w * 941) / 1672)
  await sharp(SRC).resize(w, h).webp({ quality: 80 }).toFile(`${OUT}/wisch-klar-${w}.webp`)
  // Beschlag: stark weichgezeichnet, aufgehellt und entsättigt, darüber ein milchiger Schleier und die Tropfen
  const fog = await sharp(SRC)
    .resize(w, h)
    .blur(Math.max(6, w / 90))
    .modulate({ brightness: 1.08, saturation: 0.7 })
    .composite([{ input: { create: { width: w, height: h, channels: 4, background: { r: 236, g: 240, b: 243, alpha: 0.34 } } } }, { input: drops(w, h) }])
    .toBuffer()
  await sharp(fog).webp({ quality: 74 }).toFile(`${OUT}/wisch-beschlagen-${w}.webp`)
}
console.log('✓ Szenenbilder in ' + OUT)
