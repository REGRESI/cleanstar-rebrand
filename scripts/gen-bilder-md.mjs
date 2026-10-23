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
- \`public/favicon.svg\`, \`public/favicon.ico\`, \`public/favicon-48/96/192/512.png\`, \`public/apple-touch-icon.png\` (erzeugt mit \`node scripts/generate-favicons.mjs\`), \`public/logo.png\` (erzeugt mit \`node scripts/generate-assets.mjs\`)

Gründerporträts bitte als echte Fotos der Gründer verwenden, nicht generieren.
`
md += `
## Shot-Liste für das Fotoshooting

Das neue Design zeigt jedes Bild in einem festen Rahmen mit festem Seitenverhältnis. Das Bild wird mittig beschnitten, deshalb gehört das Wichtige in die Bildmitte, mit Luft an allen Rändern. Alle Fotos bekommen auf der Website dieselbe leichte Farbbehandlung (etwas weniger Sättigung, minimal wärmer). Bitte neutral belichten und nicht stark nachbearbeiten.

### Allgemein

- Echte Räume, echte Menschen aus dem Team, keine gestellten Lächelmotive.
- Arbeitskleidung mit CleanStar-Logo, saubere Hände und Handschuhe.
- Natürliches Tageslicht oder ruhiges Abendlicht, keine Blitzreflexe auf Glas.
- Keine erkennbaren Kundendaten, Bildschirme oder Firmennamen Dritter im Bild.
- Pro Motiv bitte quer und hoch fotografieren, damit Desktop und Handy aus einer Aufnahme bedient werden können.

### Rahmen und Motive

| Rahmen | Seitenverhältnis | Wo | Motiv | Hinweis zum Beschnitt |
|---|---|---|---|---|
| Seitenkopf Unterseite | 21:9 ab Tablet, 4:3 auf dem Handy | Leistungen, Leistungsseiten, Qualitätsgarantie, Ablauf, Kontakt, Karriere, Partner | Eine Szene pro Seite: Reinigung im Büro, Fensterfront, Treppenhaus, Halle, Sanitär, Besichtigung mit Kunde, Kontrollgang mit Checkliste | Person oder Handlung im mittleren Drittel, oben und unten je ein Viertel Luft |
| Kernleistung Startseite | 21:9 Desktop, 3:2 Tablet, 4:5 Handy | Startseite, Leistungen | Büroreinigung am frühen Morgen, ein Teammitglied an einem Arbeitsplatz | Motiv genau mittig, weil von 21:9 bis 4:5 beschnitten wird |
| Leistungsliste Vorschau | frei im Rahmen, Hochformat | Startseite, Leistungen (beim Überfahren) | Je Leistung ein ruhiges Detailbild | Hochformat, Motiv mittig |
| Porträt | 4:5 | Über uns, Startseite, Kontakt, Ratgeber-Autor | Gründer einzeln vor ruhigem, hellem Hintergrund, Brusthöhe, Blick in die Kamera | Kopf im oberen Drittel, Schultern vollständig |
| Detail hoch | 4:5 | Büroreinigung, Qualitätsgarantie, Ablauf, Einzugsgebiet, Karriere, Partner | Detail einer Handlung: Tuch auf Tischfläche, Checkliste, Schlüsselübergabe, Teambesprechung, Gebäude in der Region | Hochformat, Hände oder Gegenstand mittig |
| Team breit | 3:2 | Über uns | Zwei bis drei Personen bei der Arbeit im Flur oder Büro | Personen im mittleren Bereich, Boden sichtbar |
| Bildband (randlos) | 21:9 ab Tablet, 4:3 auf dem Handy | Startseite, Leistungen, Leistungsseiten, Qualitätsgarantie, Ablauf, Einzugsgebiet, Standortseiten, Über uns, Karriere, Kontakt, Partner, Ratgeber | Weite, ruhige Ansichten: Großraumbüro mit Fensterfront, Flur mit Team, Gebäude in der Region, Treppenhaus | Volle Breite, bewegt sich beim Scrollen leicht: oben und unten je 10 % Reserve, nichts Wichtiges an den Rändern, mindestens 1920 px breit |
| Vorher und Nachher | 16:9 | Büroreinigung | Derselbe Arbeitsplatz vorher und nachher, Stativ, gleiche Position und gleiches Licht | Kamera darf sich zwischen den Aufnahmen nicht bewegen |

### Zusätzlich gewünscht (sobald Freigaben vorliegen)

- Gebäude von Kunden, die einer Nennung zugestimmt haben, für den Bereich Belege (\`src/content/proof.ts\`).
- Ein Foto vom Sitz in der Prinz-Eugen-Straße für die Kontaktseite.
`
writeFileSync('BILDER.md', md)
console.log('✓ BILDER.md erzeugt')
