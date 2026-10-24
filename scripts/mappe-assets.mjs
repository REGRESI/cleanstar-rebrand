// Bereitet die Bilder und den Video-Ausschnitt für die Leistungsmappe (/leistungsmappe) vor.
// Quelle: bilder/ (Dateinamen mit „mappe“ werden nach Inhalt zugeordnet), Ziel: public/mappe/
// Schreibt src/content/mappe-assets.json mit allen vorhandenen Ebenen, damit fehlende Fotos sauber ersetzt werden.
//
// Aufruf: node scripts/mappe-assets.mjs
import { readdirSync, mkdirSync, writeFileSync, existsSync, statSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import sharp from 'sharp'

function rng(seed) {
  return () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296
}

const SRC = 'bilder'
const OUT = 'public/mappe'
mkdirSync(OUT, { recursive: true })

const files = readdirSync(SRC).filter((f) => /mappe/i.test(f) && /\.(png|jpe?g|webp)$/i.test(f))
// Zuordnung nach Inhalt (Stichwort im Dateinamen) zu festen Namen
const roles = {
  einband: /einband|cover/i,
  'tisch-quer': /tisch.*(quer|land)|table.*land/i,
  'tisch-hoch': /tisch.*(hoch|port)|table.*port/i,
  tisch: /tisch|table/i,
  kaffee: /kaffee|coffee|tasse/i,
  pflanze: /pflanze|plant/i,
  stift: /stift|pen/i,
  schluessel: /schl(ue|ü)ssel|key/i,
  visitenkarte: /visitenkarte|card/i,
}

const assets = {}
/** Rollen, die nur als Quelle dienen (nicht ausgeliefert) */
const sourceOnly = new Set(['einband'])
for (const [role, re] of Object.entries(roles)) {
  const f = files.find((x) => re.test(x) && !Object.values(assets).some((a) => a.source === x))
  if (!f) continue
  const src = join(SRC, f)
  const img = sharp(src)
  const meta = await img.metadata()
  const alpha = meta.hasAlpha
  // Freigestellte Objekte auf ihren Inhalt zuschneiden (Schatten bleibt erhalten)
  const base = alpha ? sharp(await img.trim({ threshold: 1 }).toBuffer()) : img
  const isTable = role.startsWith('tisch')
  const width = role === 'einband' ? 2048 : isTable ? 2560 : 1024
  const out = join(OUT, `${role}.webp`)
  if (sourceOnly.has(role)) {
    assets[role] = { source: f }
    continue
  }
  const info = await base
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: isTable || role === 'einband' ? 80 : 86, alphaQuality: 90, effort: 6 })
    .toFile(out)
  assets[role] = { file: `/mappe/${role}.webp`, width: info.width, height: info.height, alpha: !!alpha, source: f }
  console.log(`✓ ${f} → ${out} (${info.width}×${info.height}, ${Math.round(info.size / 1024)} KB)`)
}

// ---------------------------------------------------------------------------------------------
// Einband: Leinenstruktur aus dem Einband-Foto (logofreie Randstreifen, gespiegelt gekachelt),
// darauf das Logo als Prägung im Hochformat 1:1,4. Dazu Rücken und Innenseite (Vorsatz).
// ---------------------------------------------------------------------------------------------
const coverSrc = assets.einband && join(SRC, assets.einband.source)
if (coverSrc) {
  const W = 1100,
    H = 1540
  // Leinen prozedural weben: Kette und Schuss als Fäden mit leicht schwankender Stärke und kleinen Verdickungen.
  // Nahtlos, ohne Vignette. Grundfarbe aus dem Einband-Foto.
  const avg = await sharp(coverSrc).extract({ left: 0, top: 0, width: 300, height: 300 }).removeAlpha().resize(1, 1).raw().toBuffer()
  const weave = (w, h, seed) => {
    const r = rng(seed)
    const T = 3 // Fadenbreite in Pixeln
    const cols = Array.from({ length: Math.ceil(w / T) + 1 }, () => (r() - 0.5) * 14)
    const rows = Array.from({ length: Math.ceil(h / T) + 1 }, () => (r() - 0.5) * 14)
    // Verdickungen (Slubs) im Schuss: einzelne längere, etwas hellere Abschnitte
    const slubs = Array.from({ length: Math.round((w * h) / 9000) }, () => ({ y: Math.floor(r() * (h / T)), x0: r() * w, len: 20 + r() * 80, a: 6 + r() * 8 }))
    const px = Buffer.alloc(w * h * 3)
    for (let y = 0; y < h; y++) {
      const ty = Math.floor(y / T),
        fy = (y % T) / (T - 1)
      for (let x = 0; x < w; x++) {
        const tx = Math.floor(x / T),
          fx = (x % T) / (T - 1)
        const over = (tx + ty) % 2 === 0
        // Fadenprofil: Mitte heller, Ränder dunkler (Rundung des Fadens)
        const prof = over ? Math.sin(Math.PI * fx) : Math.sin(Math.PI * fy)
        let v = (over ? cols[tx] : rows[ty]) + prof * 10 - 6 + (r() - 0.5) * 6
        for (const s of slubs) if (s.y === ty && !over && x > s.x0 && x < s.x0 + s.len) v += s.a * Math.sin(Math.PI * ((x - s.x0) / s.len))
        const i = (y * w + x) * 3
        px[i] = Math.max(0, Math.min(255, avg[0] + v))
        px[i + 1] = Math.max(0, Math.min(255, avg[1] + v))
        px[i + 2] = Math.max(0, Math.min(255, avg[2] + v * 1.1))
      }
    }
    return px
  }
  const base = await sharp(weave(W, H, 11), { raw: { width: W, height: H, channels: 3 } })
    .png()
    .toBuffer()
  // Leinen ohne Logo (Rücken, Rückseite): kleine Kachel, wiederholt sich in der Szene
  await sharp(weave(384, 384, 23), { raw: { width: 384, height: 384, channels: 3 } })
    .webp({ quality: 80 })
    .toFile(join(OUT, 'leinen.webp'))

  // Logo als Prägung: helle Kante oben links, dunkle Kante unten rechts, Fläche leicht aufgehellt
  const logo = (await import('node:fs')).readFileSync('src/assets/brand/logo.svg', 'utf8')
  const mono = (fill) =>
    logo
      .replace(/<defs>[\s\S]*?<\/defs>/, '')
      .replace(/url\(#cs[AB]\)/g, fill)
      .replace(/"#0[0-9A-F]{5}"/gi, `"${fill}"`)
      .replace(/stroke="#fff"/g, 'stroke="#1c2636"')
  const lw = Math.round(W * 0.52)
  const lh = Math.round((lw * 216) / 830)
  const svgPng = async (fill, opacity) =>
    sharp(Buffer.from(mono(fill).replace('<svg ', `<svg width="${lw}" height="${lh}" opacity="${opacity}" `)))
      .png()
      .toBuffer()
  const lx = Math.round((W - lw) / 2),
    ly = Math.round(H * 0.42 - lh / 2)
  const cover = await sharp(base)
    .composite([
      // Blindprägung: Die Fläche bleibt Leinen (aufgehellt statt bedruckt), Kanten fangen Licht und Schatten
      { input: await svgPng('#03050a', 0.7), left: lx + 3, top: ly + 4, blend: 'multiply' },
      { input: await svgPng('#aab3c2', 0.38), left: lx - 2, top: ly - 2, blend: 'screen' },
      { input: await svgPng('#2c3850', 1), left: lx, top: ly, blend: 'screen' },
    ])
    .webp({ quality: 76 })
    .toFile(join(OUT, 'cover.webp'))
  console.log(`✓ Einband mit Prägung public/mappe/cover.webp (${Math.round(cover.size / 1024)} KB)`)
}

// ---------------------------------------------------------------------------------------------
// Tisch: Solange kein Tischfoto vorliegt, eine ruhige, helle Steinoberfläche (warmes Off-White) mit weichem
// Lichtkegel von links oben. Feste Zufallsfolge, damit das Ergebnis bei jedem Lauf gleich ist.
// ---------------------------------------------------------------------------------------------
async function makeTable(W, H, file) {
  const r = rng(7)
  // grobes Rauschen (Wolken) auf kleinem Raster, später weich hochskaliert
  const gw = 64,
    gh = Math.round((64 * H) / W)
  const grid = Buffer.alloc(gw * gh)
  for (let i = 0; i < grid.length; i++) grid[i] = 118 + Math.round(r() * 20)
  const clouds = await sharp(grid, { raw: { width: gw, height: gh, channels: 1 } })
    .resize(W, H, { kernel: 'cubic' })
    .blur(18)
    .raw()
    .toBuffer()
  const px = Buffer.alloc(W * H * 3)
  const base = [228, 222, 212]
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x
      const c = (clouds[i] - 128) * 0.55
      const grain = (r() - 0.5) * 7
      // Lichtkegel von links oben, sanft zum Rand hin dunkler
      const dx = x / W - 0.28,
        dy = y / H - 0.2
      const light = 10 - Math.sqrt(dx * dx * 1.2 + dy * dy) * 30
      const v = c + grain + light
      px[i * 3] = Math.max(0, Math.min(255, base[0] + v))
      px[i * 3 + 1] = Math.max(0, Math.min(255, base[1] + v - 1))
      px[i * 3 + 2] = Math.max(0, Math.min(255, base[2] + v - 3))
    }
  }
  const info = await sharp(px, { raw: { width: W, height: H, channels: 3 } })
    .webp({ quality: 78 })
    .toFile(join(OUT, file))
  console.log(`✓ Tischfläche public/mappe/${file} (${Math.round(info.size / 1024)} KB, prozedural)`)
}
if (!assets.tisch && !assets['tisch-quer']) await makeTable(2048, 1280, 'tisch-quer.webp')
if (!assets.tisch && !assets['tisch-hoch']) await makeTable(1080, 1920, 'tisch-hoch.webp')

// Stummer Video-Ausschnitt „Ihr Büro über Nacht“: Feierabend, Reinigung, Morgen (aus dem Hero-Video)
const hero2 = join(SRC, 'hero', 'hero-2.mp4')
const hero3 = join(SRC, 'hero', 'hero-3.mp4')
const video = join(OUT, 'nacht.mp4')
if (existsSync(hero2) && existsSync(hero3)) {
  execFileSync('ffmpeg', [
    '-y',
    '-v',
    'error',
    '-i',
    hero2,
    '-i',
    hero3,
    '-filter_complex',
    '[0:v][1:v]concat=n=2:v=1:a=0,scale=960:-2,fps=30,format=yuv420p[v]',
    '-map',
    '[v]',
    '-an',
    '-c:v',
    'libx264',
    '-preset',
    'slow',
    '-crf',
    '30',
    '-movflags',
    '+faststart',
    video,
  ])
  const tmpPoster = join((await import('node:os')).tmpdir(), 'cleanstar-nacht-poster.jpg')
  execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', video, '-frames:v', '1', '-q:v', '3', tmpPoster])
  await sharp(tmpPoster).webp({ quality: 80 }).toFile(join(OUT, 'nacht-poster.webp'))
  console.log(`✓ Video-Ausschnitt ${video} (${Math.round(statSync(video).size / 1024)} KB)`)
}

const missing = Object.keys(roles).filter((r) => !assets[r] && !r.startsWith('tisch-'))
if (missing.length) console.log(`Hinweis: nicht vorhanden (die Szene ersetzt sie): ${missing.join(', ')}`)
writeFileSync('src/content/mappe-assets.json', JSON.stringify(assets, null, 2) + '\n')
console.log('✓ src/content/mappe-assets.json')
