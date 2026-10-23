// Favicons aus dem Logo-Symbol (Haus mit Stern, ohne Schriftzug): node scripts/generate-favicons.mjs
// Quelle ist public/favicon.svg. Bis 96 px gilt eine vereinfachte Variante (dickere Linie, gefüllter Stern,
// ohne kleinsten Stern): Google verkleinert das 48-px-Bild für die Suchergebnisse auf 16 bis 32 px.
import { readFileSync, writeFileSync } from 'node:fs'
import sharp from 'sharp'

const svg = readFileSync('public/favicon.svg', 'utf8')

const small = svg
  .replaceAll('stroke-width="19"', 'stroke-width="27"')
  // großer und mittlerer Stern gefüllt statt Umriss: jeweils nur der äußere Pfad
  .replace(/(<path fill-rule="evenodd" d="[^"]*?Z) M[^"]*"/g, '$1"')
  // kleinster Stern entfällt
  .replace(/\s*<path fill-rule="evenodd" d="M182\.00[^"]*"\/>/, '')
  .replace('stroke-width="5" paint-order', 'stroke-width="7" paint-order')

/** Symbol quadratisch rendern: pad = Rand je Seite (Anteil), bg = Hintergrund oder transparent */
async function icon(size, { pad, bg, source = svg }) {
  const inner = Math.round(size * (1 - 2 * pad))
  const symbol = await sharp(Buffer.from(source), { density: 1200 }).resize(inner, inner).png().toBuffer()
  const off = Math.round((size - inner) / 2)
  return sharp({ create: { width: size, height: size, channels: 4, background: bg ?? { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: symbol, top: off, left: off }])
    .png({ compressionLevel: 9 })
    .toBuffer()
}

/** ICO-Datei mit eingebetteten PNGs (von allen aktuellen Browsern und Google unterstützt) */
function ico(images) {
  const head = Buffer.alloc(6)
  head.writeUInt16LE(0, 0)
  head.writeUInt16LE(1, 2)
  head.writeUInt16LE(images.length, 4)
  let offset = 6 + 16 * images.length
  const dir = images.map(({ size, data }) => {
    const e = Buffer.alloc(16)
    e.writeUInt8(size >= 256 ? 0 : size, 0)
    e.writeUInt8(size >= 256 ? 0 : size, 1)
    e.writeUInt16LE(1, 4)
    e.writeUInt16LE(32, 6)
    e.writeUInt32LE(data.length, 8)
    e.writeUInt32LE(offset, 12)
    offset += data.length
    return e
  })
  return Buffer.concat([head, ...dir, ...images.map((i) => i.data)])
}

const white = '#ffffff'
const s16 = await icon(16, { pad: 0, source: small })
const s32 = await icon(32, { pad: 0.03, source: small })
const s48 = await icon(48, { pad: 0.06, source: small })

writeFileSync(
  'public/favicon.ico',
  ico([
    { size: 16, data: s16 },
    { size: 32, data: s32 },
    { size: 48, data: s48 },
  ]),
)
writeFileSync('public/favicon-48.png', s48)
writeFileSync('public/favicon-96.png', await icon(96, { pad: 0.08, source: small }))
// Manifest und Apple: weißer Grund (iOS füllt Transparenz schwarz), Symbol mit großzügigem Rand
writeFileSync('public/favicon-192.png', await icon(192, { pad: 0.14, bg: white }))
writeFileSync('public/favicon-512.png', await icon(512, { pad: 0.14, bg: white }))
writeFileSync('public/apple-touch-icon.png', await icon(180, { pad: 0.13, bg: white }))
console.log('✓ favicon.ico (16, 32, 48), favicon-48/96/192/512.png, apple-touch-icon.png')
