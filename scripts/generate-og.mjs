// Open-Graph-Bilder je Seitentyp (1200 × 630) nach public/og/<typ>.png
// Aufruf bei Text- oder Logo-Änderung: node scripts/generate-og.mjs
import { mkdirSync, readFileSync } from 'node:fs'
import sharp from 'sharp'

const logoSvg = readFileSync('src/assets/brand/logo.svg', 'utf8')
const types = {
  start: ['Saubere Büros. Jeden Tag.', 'Büroreinigung in Offenburg und im Ortenaukreis', 'Angebot in 48 Stunden'],
  leistung: ['Reinigung für Unternehmen.', 'Büro, Fenster, Treppenhaus, Halle, Hygiene', 'Kostenlose Besichtigung'],
  standort: ['Ihre Reinigungsfirma vor Ort.', 'Feste Teams im ganzen Ortenaukreis', 'Fester Ansprechpartner'],
  ratgeber: ['Ratgeber Reinigung.', 'Wissen für Unternehmen und Gründer', 'Klar erklärt, mit Quellen'],
  tool: ['Rechnen statt raten.', 'Kostenlose Rechner und Vergleiche', 'Ohne Anmeldung'],
  partner: ['Partnerprogramm.', 'Für Reinigungsfirmen in ganz Deutschland', 'Erprobte Abläufe'],
  unternehmen: ['CleanStar Dienstleistungen.', 'Reinigungsfirma aus Offenburg', '24/7 erreichbar'],
}
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;')
mkdirSync('public/og', { recursive: true })
const logo = await sharp(Buffer.from(logoSvg), { density: 300 }).resize(380).png().toBuffer()
for (const [type, [title, sub, pill]] of Object.entries(types)) {
  const pillW = Math.round(pill.length * 13.5 + 70)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#eef4fc"/></linearGradient>
    <pattern id="p" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M48 0H0V48" fill="none" stroke="#0a1628" stroke-opacity="0.06"/></pattern>
    <radialGradient id="r" cx="0.9" cy="0.1" r="0.7"><stop offset="0" stop-color="#1f5eff" stop-opacity="0.18"/><stop offset="1" stop-color="#1f5eff" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <rect width="1200" height="630" fill="url(#p)"/>
  <rect width="1200" height="630" fill="url(#r)"/>
  <text x="80" y="330" font-family="Inter, Helvetica, Arial, sans-serif" font-size="62" font-weight="700" fill="#0a1628" letter-spacing="-2">${esc(title)}</text>
  <text x="80" y="400" font-family="Inter, Helvetica, Arial, sans-serif" font-size="30" fill="#5b6b82">${esc(sub)}</text>
  <rect x="80" y="460" width="${pillW}" height="64" rx="32" fill="#1f5eff"/>
  <text x="${80 + pillW / 2}" y="501" text-anchor="middle" font-family="Inter, Helvetica, Arial, sans-serif" font-size="24" font-weight="600" fill="#ffffff">${esc(pill)}</text>
</svg>`
  await sharp(Buffer.from(svg)).composite([{ input: logo, top: 90, left: 72 }]).png({ compressionLevel: 9, palette: true }).toFile(`public/og/${type}.png`)
}
console.log('✓ Open-Graph-Bilder:', Object.keys(types).join(', '))
