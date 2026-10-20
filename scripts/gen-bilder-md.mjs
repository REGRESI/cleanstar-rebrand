// Erzeugt BILDER.md aus src/content/images.ts
import { writeFileSync } from 'node:fs'
import { createServer } from 'vite'

const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error', optimizeDeps: { noDiscovery: true, entries: [] } })
const { images, STYLE, IMAGE_WIDTHS } = await vite.ssrLoadModule('/src/content/images.ts')
await vite.close()

const minHeight = (w, r) => {
  const [a, b] = r.split(':').map(Number)
  return Math.round((w * b) / a)
}
const entries = Object.entries(images)
let md = `# Bildliste CleanStar-Website

Alle ${entries.length} Bilder, die die Website braucht. Bis ein Foto vorliegt, zeigt die Website einen beschrifteten Platzhalter im richtigen Seitenverhältnis.

## So bauen Sie ein Bild ein

1. Bild erzeugen bzw. fotografieren (Prompt und Maße siehe unten).
2. Als JPG oder PNG unter \`bilder/<Dateiname>.jpg\` ablegen (Dateiname exakt wie in der Tabelle).
3. \`npm run images\` ausführen. Daraus entstehen AVIF und WebP in den Breiten ${IMAGE_WIDTHS.join(', ')} px unter \`public/images/\`.
4. In \`src/content/images.ts\` beim Bild \`available: true\` setzen.
5. \`npm run build\` ausführen.

Hinweis: Die Einzeldatei-Vorschau (\`preview/cleanstar-website.html\`) bettet alle vorhandenen Fotos aus \`bilder/\` als stark komprimiertes WebP (1200 px) ein.

## Einheitlicher Look (an jeden Prompt anhängen)

> ${STYLE}

## Übersicht

| # | Dateiname | Format | Mindestgröße | Verwendet auf |
|---|---|---|---|---|
${entries.map(([, s], i) => `| ${i + 1} | \`${s.file}.jpg\` | ${s.ratio} | ${s.minWidth} × ${minHeight(s.minWidth, s.ratio)} px | ${s.usedOn} |`).join('\n')}

## Bilder im Detail
`
entries.forEach(([id, s], i) => {
  md += `
### ${i + 1}. ${s.file}

- **ID im Code:** \`${id}\`
- **Pfad:** \`bilder/${s.file}.jpg\` → \`public/images/${s.file}-<breite>.avif|webp\`
- **Seitenverhältnis:** ${s.ratio}
- **Mindestauflösung:** ${s.minWidth} × ${minHeight(s.minWidth, s.ratio)} px
- **Verwendet auf:** ${s.usedOn}
- **Inhalt:** ${s.label}
- **Alt-Text:** ${s.alt}
- **Status:** ${s.available ? 'vorhanden' : 'fehlt (Platzhalter aktiv)'}

**Prompt:**

\`\`\`
${s.prompt}. ${STYLE}. Aspect ratio ${s.ratio}.
\`\`\`
`
})
md += `
## Bereits vorhanden (automatisch erzeugt)

- \`public/og-image.png\` (1200 × 630, Vorschaubild für Social Media, aus Logo erzeugt; kann durch ein Foto ersetzt werden)
- \`public/favicon.svg\`, \`public/favicon-32.png\`, \`public/apple-touch-icon.png\`, \`public/logo.png\` (aus dem Logo erzeugt mit \`node scripts/generate-assets.mjs\`)

Gründerporträts bitte als echte Fotos der Gründer verwenden, nicht generieren.
`
writeFileSync('BILDER.md', md)
console.log('✓ BILDER.md erzeugt')
