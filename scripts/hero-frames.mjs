// Erzeugt aus den drei Hero-Videos (bilder/hero/hero-1..3.mp4) die Bildsequenzen für das Scroll-Video.
// Aufruf: npm run hero   (benötigt ffmpeg im PATH)
//
// Ergebnis:
//   public/hero/d/0000.webp …  Desktop, 120 Frames, native 1918 × 1080 px, WebP 82
//   public/hero/m/0000.webp …  Handy, 90 Frames, 16:9, 1280 × 720 px, WebP 80 (Sequenz als Karte)
//   public/hero/p/0000.webp …  Vorschau-Datei, 60 Frames, 1600 px, WebP 70
//   public/hero/still-*.webp   Standbilder: quer (-d) und hochkant 1:2 für den Handy-Einstieg (-m), Gebäude im Fokus
//   public/hero/key-*.jpg      Schlüsselmomente in voller Qualität (aus bilder/hero/*.jpg): -d nativ, -p 1600 px
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

// 3. Hochformat-Standbilder (Handy-Einstieg): Bildmitte als Anteil der Breite, Gebäude bzw. Büro im Fokus
const STILL_CENTER = { aussen: 0.4, morgen: 0.5 }
/** Bildmitte im Handy-Foto des Gebäudes (bilder/hero/hero-aussen-mobil.jpg) */
const MOBILE_INTRO_CENTER = 0.45

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
// Hochformat 1:2 in nativer Höhe (nie hochskalieren) für den bildschirmfüllenden Einstieg auf dem Handy
const PW = Math.round(H / 2)
const portraitStill = (buf, center) => {
  const left = Math.min(W - PW, Math.max(0, Math.round(center * W - PW / 2)))
  return sharp(buf).extract({ left, top: 0, width: PW, height: H })
}

mkdirSync(OUT, { recursive: true })
await build('d', 120, (buf) => sharp(buf).webp({ quality: 82, effort: 5 }).toBuffer())
await build('m', 90, (buf) => sharp(buf).resize(1280).webp({ quality: 80, effort: 5 }).toBuffer())
await build('p', 60, (buf) => sharp(buf).resize(1600).webp({ quality: 70, effort: 5 }).toBuffer())

// 4. Standbilder: Außenansicht (erstes Frame) und Morgen (letztes Frame), quer und hochkant
const first = timeline[0]
const last = timeline.at(-1)
for (const [name, item] of [
  ['aussen', first],
  ['morgen', last],
]) {
  const buf = await render(item)
  writeFileSync(join(OUT, `still-${name}-d.webp`), await sharp(buf).webp({ quality: 82 }).toBuffer())
  writeFileSync(join(OUT, `still-${name}-m.webp`), await portraitStill(buf, STILL_CENTER[name]).webp({ quality: 82 }).toBuffer())
}
await mobileIntroStill()

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
  keys.push({ name, progress: +(best.i / (timeline.length - 1)).toFixed(4) })
  await sharp(src)
    .jpeg({ quality: 90, mozjpeg: true })
    .toFile(join(OUT, `key-${name}-d.jpg`))
  await sharp(src)
    .resize(1600)
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(join(OUT, `key-${name}-p.jpg`))
}
writeFileSync(join(OUT, 'keys.json'), JSON.stringify({ keys }, null, 2) + '\n')
for (const f of readdirSync(OUT).filter((x) => /^key-.*-m\.jpg$/.test(x))) rmSync(join(OUT, f))
console.log('✓ Schlüsselmomente', keys.map((k) => `${k.name} ${k.progress}`).join(', '))
console.log(`✓ Standbilder, Zeitleiste ${timeline.length} von ${total} Frames`)
rmSync(tmp, { recursive: true, force: true })

/**
 * Handy-Einstieg: Liegt bilder/hero/hero-aussen-mobil.jpg vor (eigenes Foto, schärfer als ein Videoframe),
 * wird daraus das Hochformat-Standbild geschnitten. Nur Ausschnitt, nie hochskaliert.
 */
async function mobileIntroStill() {
  const src = `${SRC}/hero-aussen-mobil.jpg`
  if (!existsSync(src)) return
  const { width: w, height: h } = await sharp(src).metadata()
  const pw = Math.min(w, Math.round(h / 2))
  const left = Math.min(w - pw, Math.max(0, Math.round(MOBILE_INTRO_CENTER * w - pw / 2)))
  const out = await sharp(src).extract({ left, top: 0, width: pw, height: h }).webp({ quality: 88 }).toBuffer()
  writeFileSync(join(OUT, 'still-aussen-m.webp'), out)
  console.log(`✓ Handy-Einstieg aus ${src}: ${pw}×${h}`)
}
