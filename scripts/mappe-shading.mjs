// Licht- und Schattentexturen der Leistungsmappe als kleine Bilder (public/mappe/shade/).
// Die Mappe darf realistisch beleuchtet sein, aber über Texturen statt CSS-Verläufe.
// Aufruf: node scripts/mappe-shading.mjs
import { mkdirSync } from 'node:fs'
import sharp from 'sharp'

const OUT = 'public/mappe/shade'
mkdirSync(OUT, { recursive: true })

const lin = (id, x1, y1, x2, y2, stops) =>
  `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join('')}</linearGradient>`
const svg = (w, h, defs, body) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><defs>${defs}</defs>${body}</svg>`)
const png = (name, buf) => sharp(buf).png({ compressionLevel: 9 }).toFile(`${OUT}/${name}.png`)

const BROWN = '#281e0f'
// Falz: weicher Schatten zur Bindung (links: am rechten Rand, rechts: am linken Rand)
await png(
  'falz-l',
  svg(
    96,
    4,
    lin('g', 1, 0, 0, 0, [
      [0, BROWN, 0.16],
      [0.3, BROWN, 0.05],
      [1, BROWN, 0],
    ]),
    '<rect width="96" height="4" fill="url(#g)"/>',
  ),
)
await png(
  'falz-r',
  svg(
    96,
    4,
    lin('g', 0, 0, 1, 0, [
      [0, BROWN, 0.18],
      [0.3, BROWN, 0.05],
      [1, BROWN, 0],
    ]),
    '<rect width="96" height="4" fill="url(#g)"/>',
  ),
)
// Außenkante: leichter Glanz links, Hauch Schatten rechts
await png(
  'glanz-l',
  svg(
    40,
    4,
    lin('g', 0, 0, 1, 0, [
      [0, '#ffffff', 0.35],
      [1, '#ffffff', 0],
    ]),
    '<rect width="40" height="4" fill="url(#g)"/>',
  ),
)
await png(
  'glanz-r',
  svg(
    40,
    4,
    lin('g', 1, 0, 0, 0, [
      [0, '#000000', 0.035],
      [1, '#000000', 0],
    ]),
    '<rect width="40" height="4" fill="url(#g)"/>',
  ),
)
// Eselsohr beim Überfahren der Ecke
const ear = (flip) =>
  svg(
    96,
    96,
    lin('g', flip ? 0 : 1, 1, flip ? 1 : 0, 0, [
      [0, BROWN, 0],
      [0.49, BROWN, 0],
      [0.5, BROWN, 0.18],
      [0.53, '#e9e3d6', 1],
      [1, '#f5f2eb', 1],
    ]),
    '<rect width="96" height="96" fill="url(#g)"/>',
  )
await png('ecke-r', ear(false))
await png('ecke-l', ear(true))
// Pergament: milchig, Licht von oben links, feine Fasern
const fibers = Array.from({ length: 110 }, (_, i) => `<rect x="${i * 7}" y="-40" width="2" height="1000" fill="#fff" fill-opacity="0.05" transform="rotate(7 ${i * 7} 0)"/>`).join(
  '',
)
await png(
  'pergament',
  svg(
    640,
    880,
    `<radialGradient id="r" cx="0.3" cy="0.2" r="0.75"><stop offset="0" stop-color="#fff" stop-opacity="0.18"/><stop offset="0.6" stop-color="#fff" stop-opacity="0"/></radialGradient>`,
    `<rect width="640" height="880" fill="rgb(244,241,234)" fill-opacity="0.84"/>${fibers}<rect width="640" height="880" fill="url(#r)"/>`,
  ),
)
// Notizlinien (Kachel, wird wiederholt)
await png('linien', svg(8, 34, '', '<rect y="33" width="8" height="1" fill="#0e1013" fill-opacity="0.13"/>'))
// Knickkanten der Ausklappseite
await png(
  'knick-a',
  svg(
    40,
    4,
    lin('g', 0, 0, 1, 0, [
      [0, BROWN, 0.12],
      [1, BROWN, 0],
    ]),
    '<rect width="40" height="4" fill="url(#g)"/>',
  ),
)
await png(
  'knick-b',
  svg(
    40,
    4,
    lin('g', 0, 0, 1, 0, [
      [0, BROWN, 0],
      [1, BROWN, 0.06],
    ]),
    '<rect width="40" height="4" fill="url(#g)"/>',
  ),
)
// Notizzettel: gelbes Papier mit feinen Linien, Licht von oben links
const lines = Array.from({ length: 80 }, (_, i) => `<rect y="${i * 3}" width="214" height="1" fill="#786428" fill-opacity="0.035"/>`).join('')
await png(
  'zettel',
  svg(
    214,
    240,
    lin('g', 0.2, 0, 0.8, 1, [
      [0, '#fff6c8', 1],
      [1, '#f8eaa6', 1],
    ]),
    `<rect width="214" height="240" fill="url(#g)"/>${lines}`,
  ),
)
await png(
  'zettel-ecke',
  svg(
    56,
    56,
    lin('g', 0, 0, 1, 1, [
      [0, '#f8eaa6', 1],
      [0.48, '#f8eaa6', 1],
      [0.5, '#d9cb86', 1],
      [0.52, '#281e0a', 0.18],
      [0.7, '#281e0a', 0],
    ]),
    '<rect width="56" height="56" fill="url(#g)"/>',
  ),
)
// Vignette über der Tischszene: Licht von oben links, zum Rand etwas dunkler
await png(
  'vignette',
  svg(
    960,
    600,
    `<radialGradient id="r" cx="0.25" cy="0.1" r="1.1" gradientTransform="translate(0.25 0.1) scale(1.2 0.9) translate(-0.25 -0.1)"><stop offset="0.4" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.28"/></radialGradient>`,
    '<rect width="960" height="600" fill="url(#r)"/>',
  ),
)
console.log('✓ Texturen in ' + OUT)
