// Erzeugt das Muster-Leistungsverzeichnis als PDF aus src/content/floorplan.ts (gleiche Inhalte wie der Grundriss auf der Website).
// Aufruf: npm run docs:leistungsverzeichnis
import sharp from 'sharp'
import PDFDocument from 'pdfkit'
import { readFileSync, createWriteStream } from 'node:fs'
import { zones, freqLabel } from '../src/content/floorplan.ts'
import { company, fullAddress } from '../src/content/company.ts'

const logoSvg = readFileSync('src/assets/brand/logo.svg', 'utf8')
const logo = await sharp(Buffer.from(logoSvg), { density: 300 }).resize(600).png().toBuffer()
const ink = '#0a1628'
const blue = '#1f5eff'
const muted = '#5b6b82'
const line = '#e2e8f0'

const doc = new PDFDocument({ size: 'A4', margin: 56, info: { Title: 'Muster-Leistungsverzeichnis Büroreinigung', Author: company.legalName } })
doc.pipe(createWriteStream('public/downloads/muster-leistungsverzeichnis.pdf'))

doc.image(logo, 56, 48, { width: 150 })
doc.fillColor(ink).fontSize(22).text('Muster-Leistungsverzeichnis Büroreinigung', 56, 120, { width: 480 })
doc
  .moveDown(0.5)
  .fillColor(muted)
  .fontSize(10.5)
  .text(
    'Unser Standard, Raum für Raum. Nach der kostenlosen Besichtigung passen wir das Verzeichnis an Ihr Objekt an. Was drinsteht, wird gemacht. Die Häufigkeiten gelten für eine tägliche Reinigung (Montag bis Freitag).',
    { width: 480 },
  )

for (const z of zones) {
  if (doc.y > 680) doc.addPage()
  doc.moveDown(1.1).fillColor(blue).fontSize(9).text(z.name.toUpperCase(), 56, doc.y, { characterSpacing: 1.5 })
  doc.moveDown(0.35)
  for (const t of z.tasks) {
    const y = doc.y
    doc.moveTo(56, y).lineTo(539, y).lineWidth(0.5).strokeColor(line).stroke()
    doc
      .fillColor(ink)
      .fontSize(10)
      .text(t.task, 56, y + 5, { width: 360 })
    const end = doc.y
    doc
      .fillColor(muted)
      .fontSize(9.5)
      .text(freqLabel(t.freq, 'taeglich'), 430, y + 5, { width: 109, align: 'right' })
    doc.y = Math.max(end, doc.y) + 4
  }
}

doc.moveDown(1.5)
if (doc.y > 700) doc.addPage()
doc.fillColor(ink).fontSize(10).text(`${company.contract.riskFree}. ${company.contract.afterwards}`, 56, doc.y, { width: 480 })
doc
  .moveDown(0.4)
  .fillColor(muted)
  .fontSize(9)
  .text(`${company.legalName} · ${fullAddress()} · ${company.phone.display} · ${company.email} · USt-ID ${company.vatId}`, { width: 480 })
doc.end()
console.log('✓ public/downloads/muster-leistungsverzeichnis.pdf')
