// Wandelt Fotos aus bilder/ in responsive AVIF- und WebP-Dateien unter public/images/ um.
// Aufruf: npm run images
// Dateiname muss dem Feld `file` in src/content/images.ts entsprechen, z. B. bilder/leistung-bueroreinigung.jpg
import sharp from 'sharp'
import { readdirSync, mkdirSync, existsSync } from 'node:fs'
import { join, parse } from 'node:path'

const SRC = 'bilder'
const OUT = 'public/images'
const WIDTHS = [640, 1024, 1600, 2400]

if (!existsSync(SRC)) {
  mkdirSync(SRC)
  console.log('Ordner "bilder/" angelegt. Legen Sie dort Ihre Fotos ab und starten Sie den Befehl erneut.')
  process.exit(0)
}
mkdirSync(OUT, { recursive: true })
const files = readdirSync(SRC).filter((f) => /\.(jpe?g|png|webp|tiff?|avif)$/i.test(f))
if (!files.length) console.log('Keine Fotos in bilder/ gefunden.')
for (const f of files) {
  const { name } = parse(f)
  const img = sharp(join(SRC, f)).rotate()
  const { width = 0 } = await img.metadata()
  for (const w of WIDTHS) {
    const target = Math.min(w, width)
    await img
      .clone()
      .resize({ width: target, withoutEnlargement: true })
      .avif({ quality: 55 })
      .toFile(join(OUT, `${name}-${w}.avif`))
    await img
      .clone()
      .resize({ width: target, withoutEnlargement: true })
      .webp({ quality: 78 })
      .toFile(join(OUT, `${name}-${w}.webp`))
  }
  console.log(`✓ ${f} → ${WIDTHS.length * 2} Varianten${width < 1600 ? ` (Achtung: nur ${width}px breit)` : ''}`)
}
console.log('Fertig. Jetzt in src/content/images.ts bei den Bildern "available: true" setzen.')
