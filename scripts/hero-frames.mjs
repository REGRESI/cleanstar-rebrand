// Erzeugt aus den drei Hero-Videos (bilder/hero/hero-1..3.mp4) die Bildsequenzen für das Scroll-Video.
// Aufruf: npm run hero   (benötigt ffmpeg im PATH)
//
// Ergebnis:
//   public/hero/d/0000.webp …  Desktop, 150 Frames, 1600 px breit
//   public/hero/m/0000.webp …  Handy, 90 Frames, 900 × 1600 px (Hochformat, Ausschnitt folgt dem Motiv)
//   public/hero/p/0000.webp …  Vorschau-Datei, 60 Frames, 1200 px, stark komprimiert
//   public/hero/still-*.webp   Standbilder (Fallback, reduzierte Bewegung)
import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import sharp from 'sharp'

const SRC = 'bilder/hero'
const OUT = 'public/hero'
const FADE = 6 // Frames Überblendung an den Clip-Grenzen

// 1. Clips verbinden (Überblendung an den Übergängen, ohne Ton) und alle Frames als JPG ablegen
const tmp = mkdtempSync(join(tmpdir(), 'hero-'))
const fade = FADE / 30
const len = 5 // Sekunden je Clip
execFileSync(
  'ffmpeg',
  [
    '-v',
    'error',
    '-y',
    '-i',
    `${SRC}/hero-1.mp4`,
    '-i',
    `${SRC}/hero-2.mp4`,
    '-i',
    `${SRC}/hero-3.mp4`,
    '-filter_complex',
    `[0:v]settb=AVTB,fps=30[a];[1:v]settb=AVTB,fps=30[b];[2:v]settb=AVTB,fps=30[c];` +
      `[a][b]xfade=transition=fade:duration=${fade}:offset=${len - fade}[ab];` +
      `[ab][c]xfade=transition=fade:duration=${fade}:offset=${2 * len - 2 * fade},format=yuvj420p[v]`,
    '-map',
    '[v]',
    '-an',
    '-q:v',
    '1',
    join(tmp, '%04d.jpg'),
  ],
  { stdio: 'inherit' },
)
const total = readdirSync(tmp).filter((f) => f.endsWith('.jpg')).length
const frame = (n) => join(tmp, `${String(n).padStart(4, '0')}.jpg`)

// 2. Zeitleiste: Das Quellvideo enthält in Clip 2 eine lange Doppelbelichtung (Person halbtransparent doppelt).
//    Diese Frames werden übersprungen und durch eine kurze, saubere Überblendung ersetzt.
const CUT_FROM = 242
const CUT_TO = 284
const CUT_FADE = 8
const timeline = [] // { a, b, t, pos } – Frame a, optional mit Frame b überblendet (Anteil t); pos = Original-Framenummer
for (let n = 1; n <= total; n++) {
  if (n === CUT_FROM) {
    for (let k = 1; k <= CUT_FADE; k++) {
      const t = k / (CUT_FADE + 1)
      timeline.push({ a: CUT_FROM - 1, b: CUT_TO + 1, t, pos: CUT_FROM - 1 + (CUT_TO + 1 - (CUT_FROM - 1)) * t })
    }
    n = CUT_TO
    continue
  }
  timeline.push({ a: n, pos: n })
}

// 3. Bildausschnitt im Hochformat: horizontale Bildmitte (Anteil der Breite), folgt Gebäude bzw. Reinigungskraft
const CROP_KEYS = [
  [1, 0.42],
  [60, 0.45],
  [110, 0.5],
  [190, 0.46],
  [205, 0.28],
  [225, 0.33],
  [241, 0.4],
  [285, 0.38],
  [310, 0.4],
  [321, 0.55],
  [331, 0.65],
  [352, 0.68],
  [362, 0.5],
  [380, 0.46],
  [400, 0.5],
  [438, 0.5],
]
const smooth = (t) => t * t * (3 - 2 * t)
function cropCenter(pos) {
  for (let i = 0; i < CROP_KEYS.length - 1; i++) {
    const [p0, c0] = CROP_KEYS[i]
    const [p1, c1] = CROP_KEYS[i + 1]
    if (pos <= p1) return c0 + (c1 - c0) * smooth(Math.max(0, (pos - p0) / (p1 - p0)))
  }
  return CROP_KEYS.at(-1)[1]
}

async function render(item) {
  const base = sharp(frame(item.a))
  if (item.b === undefined) return base.toBuffer()
  const over = await sharp(frame(item.b)).ensureAlpha(item.t).png().toBuffer()
  return base
    .composite([{ input: over }])
    .jpeg({ quality: 98 })
    .toBuffer()
}

const pick = (count) => Array.from({ length: count }, (_, i) => timeline[Math.round((i * (timeline.length - 1)) / (count - 1))])

async function build(dir, count, make) {
  rmSync(join(OUT, dir), { recursive: true, force: true })
  mkdirSync(join(OUT, dir), { recursive: true })
  let bytes = 0
  for (const [i, item] of pick(count).entries()) {
    const buf = await make(await render(item), item)
    writeFileSync(join(OUT, dir, `${String(i).padStart(4, '0')}.webp`), buf)
    bytes += buf.length
  }
  console.log(`✓ ${dir}: ${count} Frames, ${(bytes / 1024 / 1024).toFixed(1)} MB`)
}

const { width: W, height: H } = await sharp(frame(1)).metadata()
const portrait = (buf, item, w, h, q) => {
  const cw = Math.round((H * 9) / 16)
  const left = Math.min(W - cw, Math.max(0, Math.round(cropCenter(item.pos) * W - cw / 2)))
  return sharp(buf).extract({ left, top: 0, width: cw, height: H }).resize(w, h, { kernel: 'lanczos3' }).webp({ quality: q, effort: 5 }).toBuffer()
}

mkdirSync(OUT, { recursive: true })
await build('d', 150, (buf) => sharp(buf).resize(1600).webp({ quality: 58, effort: 5 }).toBuffer())
await build('m', 90, (buf, item) => portrait(buf, item, 900, 1600, 60))
await build('p', 60, (buf) => sharp(buf).resize(1200).webp({ quality: 30, effort: 6 }).toBuffer())

// 4. Standbilder: Außenansicht (erstes Frame) und Morgen (letztes Frame), jeweils quer und hochkant
const first = timeline[0]
const last = timeline.at(-1)
for (const [name, item] of [
  ['aussen', first],
  ['morgen', last],
]) {
  const buf = await render(item)
  await sharp(buf)
    .resize(1600)
    .webp({ quality: 72 })
    .toFile(join(OUT, `still-${name}-d.webp`))
  writeFileSync(join(OUT, `still-${name}-m.webp`), await portrait(buf, item, 900, 1600, 66))
}
console.log(`✓ Standbilder, Zeitleiste ${timeline.length} von ${total} Frames`)
rmSync(tmp, { recursive: true, force: true })
