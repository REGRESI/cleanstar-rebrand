// Einmalig bzw. bei Logo-Änderung ausführen: node scripts/generate-assets.mjs
// Erzeugt OG-Bild, Favicons, Logo-PNG und die Checkliste als PDF.
import sharp from 'sharp'
import PDFDocument from 'pdfkit'
import { readFileSync, createWriteStream } from 'node:fs'

const logoSvg = readFileSync('src/assets/brand/logo.svg', 'utf8')
const favSvg = readFileSync('public/favicon.svg')

// Favicons
await sharp(favSvg, { density: 600 }).resize(32, 32).png().toFile('public/favicon-32.png')
await sharp({ create: { width: 180, height: 180, channels: 4, background: '#ffffff' } })
  .composite([{ input: await sharp(favSvg, { density: 600 }).resize(140, 140).png().toBuffer(), top: 20, left: 20 }])
  .png()
  .toFile('public/apple-touch-icon.png')

// Logo-PNG (für strukturierte Daten)
const logoPng = await sharp(Buffer.from(logoSvg), { density: 300 }).resize(830).png().toBuffer()
await sharp(logoPng).toFile('public/logo.png')

// Open-Graph-Bild 1200 × 630
const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#eef4fc"/></linearGradient>
    <pattern id="p" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M48 0H0V48" fill="none" stroke="#0a1628" stroke-opacity="0.06"/></pattern>
    <radialGradient id="r" cx="0.9" cy="0.1" r="0.7"><stop offset="0" stop-color="#1f5eff" stop-opacity="0.18"/><stop offset="1" stop-color="#1f5eff" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <rect width="1200" height="630" fill="url(#p)"/>
  <rect width="1200" height="630" fill="url(#r)"/>
  <text x="80" y="330" font-family="Inter, Helvetica, Arial, sans-serif" font-size="62" font-weight="700" fill="#0a1628" letter-spacing="-2">Saubere Büros. Jeden Tag.</text>
  <text x="80" y="400" font-family="Inter, Helvetica, Arial, sans-serif" font-size="30" fill="#5b6b82">Büroreinigung in Offenburg und im Ortenaukreis</text>
  <rect x="80" y="460" width="330" height="64" rx="32" fill="#1f5eff"/>
  <text x="245" y="501" text-anchor="middle" font-family="Inter, Helvetica, Arial, sans-serif" font-size="24" font-weight="600" fill="#ffffff">Angebot in 48 Stunden</text>
</svg>`
const logoForOg = await sharp(Buffer.from(logoSvg), { density: 300 }).resize(380).png().toBuffer()
await sharp(Buffer.from(og))
  .composite([{ input: logoForOg, top: 90, left: 72 }])
  .png()
  .toFile('public/og-image.png')

// Checkliste als PDF
const pdfLogo = await sharp(Buffer.from(logoSvg), { density: 300 }).resize(600).png().toBuffer()
const doc = new PDFDocument({ size: 'A4', margin: 56, info: { Title: 'Checkliste: So erkennen Sie eine gute Büroreinigung', Author: 'CleanStar Dienstleistungen GbR' } })
doc.pipe(createWriteStream('public/downloads/checkliste-gute-bueroreinigung.pdf'))
const ink = '#0a1628'
const blue = '#1f5eff'
const muted = '#5b6b82'
const box = (text) => {
  const y = doc.y
  doc
    .roundedRect(56, y + 2, 11, 11, 2)
    .lineWidth(1)
    .strokeColor(blue)
    .stroke()
  doc.fillColor(ink).fontSize(10.5).text(text, 76, y, { width: 460 })
  doc.moveDown(0.45)
}
const h = (t) => {
  doc.moveDown(0.8).fillColor(blue).fontSize(9).text(t.toUpperCase(), 56, doc.y, { characterSpacing: 1.5 })
  doc.moveDown(0.4)
}
doc.image(pdfLogo, 56, 48, { width: 150 })
doc.moveDown(4)
doc.fillColor(ink).fontSize(24).text('Checkliste: So erkennen Sie eine gute Büroreinigung', 56, 120, { width: 480 })
doc
  .moveDown(0.5)
  .fillColor(muted)
  .fontSize(11)
  .text('Mit diesen Fragen vergleichen Sie Angebote von Reinigungsfirmen sachlich. Haken Sie ab, was ein Anbieter erfüllt.', { width: 480 })

h('1. Angebot und Transparenz')
;[
  'Hat sich der Anbieter das Objekt vor dem Angebot angesehen?',
  'Gibt es ein schriftliches Leistungsverzeichnis, Raum für Raum?',
  'Sind Intervalle, Einsatzzeiten und Stundenansatz klar genannt?',
  'Werden Netto- und Bruttopreise ausgewiesen?',
  'Sind Laufzeit und Kündigungsfrist eindeutig geregelt?',
].forEach(box)
h('2. Personal und Erreichbarkeit')
;[
  'Gibt es einen festen Ansprechpartner mit direkter Telefonnummer?',
  'Arbeitet ein festes Team im Objekt?',
  'Ist geregelt, wer bei Urlaub oder Krankheit vertritt?',
  'Werden neue Mitarbeitende vor Ort eingewiesen?',
].forEach(box)
h('3. Qualität und Reklamation')
;[
  'Gibt es regelmäßige Qualitätskontrollen mit Checkliste?',
  'Ist der Ablauf bei Reklamationen beschrieben (Frist, Nachreinigung)?',
  'Wird die Ursache von Mängeln geklärt, nicht nur der Mangel behoben?',
].forEach(box)
h('4. Sicherheit und Diskretion')
;[
  'Wird die Schlüsselübergabe protokolliert?',
  'Ist der Zugang auf das feste Team beschränkt?',
  'Sind die Mitarbeitenden zur Verschwiegenheit verpflichtet?',
  'Ist eine Betriebshaftpflichtversicherung vorhanden (Nachweis anfragen)?',
].forEach(box)
h('5. Mittel und Nachhaltigkeit')
;['Werden Reinigungsmittel passend zur Oberfläche und sparsam dosiert?', 'Gibt es ein Farbsystem, damit Sanitär- und Küchentücher getrennt bleiben?'].forEach(box)

doc.addPage()
doc.fillColor(ink).fontSize(18).text('Muster-Leistungsverzeichnis Büroreinigung', 56, 56)
doc
  .moveDown(0.4)
  .fillColor(muted)
  .fontSize(10)
  .text('Vorlage zum Anpassen. Tragen Sie pro Position das gewünschte Intervall ein (z. B. täglich, 2× pro Woche, wöchentlich, monatlich).')
const rows = [
  ['Arbeitsplätze', 'Freie Schreibtischflächen feucht wischen'],
  ['Arbeitsplätze', 'Papierkörbe leeren, Beutel wechseln'],
  ['Arbeitsplätze', 'Böden saugen bzw. feucht wischen'],
  ['Arbeitsplätze', 'Glastüren und Trennwände (Fingerabdrücke)'],
  ['Besprechung', 'Tische und Stühle reinigen'],
  ['Küche', 'Arbeitsflächen, Spüle, Armaturen reinigen'],
  ['Küche', 'Gerätefronten abwischen'],
  ['Küche', 'Spülmaschine ein- / ausräumen'],
  ['Sanitär', 'WC, Urinal, Waschbecken reinigen und desinfizieren'],
  ['Sanitär', 'Spiegel und Fliesen im Spritzbereich'],
  ['Sanitär', 'Verbrauchsmaterial auffüllen'],
  ['Verkehrsflächen', 'Flure, Treppen, Aufzug'],
  ['Verkehrsflächen', 'Türklinken, Lichtschalter, Handläufe'],
  ['Sonstiges', 'Fensterbänke, Heizkörper abstauben'],
  ['Sonstiges', 'Fensterreinigung innen / außen'],
]
let y = doc.y + 16
doc.fontSize(9).fillColor(blue)
doc.text('BEREICH', 56, y).text('LEISTUNG', 170, y).text('INTERVALL', 440, y)
y += 18
doc.fontSize(10)
for (const [a, b] of rows) {
  doc
    .moveTo(56, y - 5)
    .lineTo(539, y - 5)
    .lineWidth(0.5)
    .strokeColor('#d8e1ee')
    .stroke()
  doc.fillColor(muted).text(a, 56, y, { width: 105 })
  doc.fillColor(ink).text(b, 170, y, { width: 260 })
  doc
    .moveTo(440, y + 11)
    .lineTo(535, y + 11)
    .strokeColor('#b9c6da')
    .stroke()
  y += 26
}
doc.moveDown(2)
doc
  .fillColor(muted)
  .fontSize(9)
  .text('CleanStar Dienstleistungen GbR · Prinz-Eugen-Str. 80 · 77654 Offenburg · 0173 8512107 · info@cleanstar-dienstleistungen.de', 56, 770, { width: 483, align: 'center' })
doc.end()
console.log('✓ Assets erzeugt')
