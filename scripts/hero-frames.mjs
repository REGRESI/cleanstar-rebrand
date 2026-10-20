// Erzeugt aus den drei Hero-Videos (bilder/hero/hero-1..3.mp4) die Bildsequenzen für das Scroll-Video.
// Aufruf: npm run hero   (benötigt ffmpeg im PATH)
//
// Ergebnis:
//   public/hero/d/0000.webp …  Desktop, 120 Frames, native 1918 × 1080 px, WebP 82
//   public/hero/m/0000.webp …  Handy, 90 Frames, 4:5-Ausschnitt in nativer Größe 864 × 1080 px, WebP 80
//   public/hero/p/0000.webp …  Vorschau-Datei, 60 Frames, 1600 px, WebP 70
//   public/hero/still-*.webp   Standbilder (Fallback, reduzierte Bewegung)
//   public/hero/key-*.jpg      Schlüsselmomente in voller Qualität (aus bilder/hero/*.jpg), quer und 4:5
//   public/hero/keys.json      Position der Schlüsselmomente in der Sequenz (0 … 1)
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
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
  [362, 0.44],
  [372, 0.3],
  [386, 0.38],
  [405, 0.5],
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
// Hochformat-Ausschnitt 4:5 in nativer Größe (nie hochskalieren)
const MW = Math.round((H * 4) / 5)
const crop = (buf, pos) => {
  const left = Math.min(W - MW, Math.max(0, Math.round(cropCenter(pos) * W - MW / 2)))
  return sharp(buf).extract({ left, top: 0, width: MW, height: H })
}

mkdirSync(OUT, { recursive: true })
await build('d', 120, (buf) => sharp(buf).webp({ quality: 82, effort: 5 }).toBuffer())
await build('m', 90, (buf, item) => crop(buf, item.pos).webp({ quality: 80, effort: 5 }).toBuffer())
await build('p', 60, (buf) => sharp(buf).resize(1600).webp({ quality: 70, effort: 5 }).toBuffer())

// 4. Standbilder für Fallbacks: Außenansicht (erstes Frame) und Morgen (letztes Frame), quer und 4:5
const first = timeline[0]
const last = timeline.at(-1)
for (const [name, item] of [
  ['aussen', first],
  ['morgen', last],
]) {
  const buf = await render(item)
  writeFileSync(join(OUT, `still-${name}-d.webp`), await sharp(buf).webp({ quality: 82 }).toBuffer())
  writeFileSync(join(OUT, `still-${name}-m.webp`), await crop(buf, item.pos).webp({ quality: 80 }).toBuffer())
}

// 5. Schlüsselmomente: Position in der Sequenz suchen (bestes Frame zum Standbild) und das Standbild
//    aus bilder/hero/ in voller Qualität als JPG ablegen. Die Website blendet es ein, wenn man dort stehen bleibt.
const KEYS = [
  ['aussen', 1, 1],
  ['feierabend', 130, 175],
  ['reinigung', 280, 320],
  ['morgen', total, total],
]
const tiny = async (f) => sharp(f).resize(96, 54, { fit: 'fill' }).greyscale().raw().toBuffer()
const keys = []
for (const [name, from, to] of KEYS) {
  const src = `${SRC}/hero-${name}.jpg`
  if (!existsSync(src)) throw new Error(`${src} fehlt`)
  const ref = await tiny(src)
  let best = { d: Infinity, i: 0 }
  for (const [i, item] of timeline.entries()) {
    if (item.b !== undefined || item.a < from || item.a > to) continue
    const t = await tiny(frame(item.a))
    let d = 0
    for (let k = 0; k < t.length; k++) d += (t[k] - ref[k]) ** 2
    if (d < best.d) best = { d, i }
  }
  const pos = timeline[best.i].pos
  keys.push({ name, progress: +(best.i / (timeline.length - 1)).toFixed(4) })
  await sharp(src)
    .jpeg({ quality: 90, mozjpeg: true })
    .toFile(join(OUT, `key-${name}-d.jpg`))
  await crop(await sharp(src).toBuffer(), pos)
    .jpeg({ quality: 90, mozjpeg: true })
    .toFile(join(OUT, `key-${name}-m.jpg`))
  await sharp(src)
    .resize(1600)
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(join(OUT, `key-${name}-p.jpg`))
}
// Bildmitte je Vorschau-Frame (Anteil der Breite), damit die Vorschau auf dem Handy den 4:5-Ausschnitt mitführen kann
const previewCrop = pick(60).map((item) => +cropCenter(item.pos).toFixed(3))
writeFileSync(join(OUT, 'keys.json'), JSON.stringify({ keys, previewCrop }, null, 2) + '\n')
console.log('✓ Schlüsselmomente', keys.map((k) => `${k.name} ${k.progress}`).join(', '))
console.log(`✓ Standbilder, Zeitleiste ${timeline.length} von ${total} Frames`)
rmSync(tmp, { recursive: true, force: true })
