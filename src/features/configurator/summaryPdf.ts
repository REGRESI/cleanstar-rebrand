import { company, fullAddress } from '@/content/company'
import { imageUrl } from '@/components/ui/Picture'
import type { ImageId } from '@/content/images'

export interface SummaryInput {
  /** Zeilen der Zusammenfassung (Bezeichnung, Wert) */
  rows: [string, string][]
  /** Richtpreis-Spanne (nur Weg A) */
  price?: { net: string; gross: string; perEmployee?: string }
  company: string
}

/** Foto als JPEG-Data-URL (jsPDF kann kein WebP). Schlägt das fehl, kommt das PDF ohne Foto. */
async function photoAsJpeg(src: string | null): Promise<string | null> {
  if (!src || typeof document === 'undefined') return null
  try {
    const img = new Image()
    img.decoding = 'async'
    img.src = src
    await img.decode()
    const size = 240
    const c = document.createElement('canvas')
    c.width = c.height = size
    const ctx = c.getContext('2d')
    if (!ctx) return null
    // quadratischer Ausschnitt aus der oberen Bildmitte (Gesicht)
    const s = Math.min(img.naturalWidth, img.naturalHeight * 0.8)
    ctx.drawImage(img, (img.naturalWidth - s) / 2, 0, s, s, 0, 0, size, size)
    return c.toDataURL('image/jpeg', 0.88)
  } catch {
    return null
  }
}

/**
 * Erzeugt im Browser ein sauberes PDF mit allen Angaben aus dem Konfigurator.
 * Gedacht zum Weiterleiten an Geschäftsführung, Einkauf oder Kollegen. Nichts wird gesendet.
 */
export async function downloadSummaryPdf(input: SummaryInput) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const W = 210
  const M = 18
  const navy: [number, number, number] = [11, 22, 41]
  const blue: [number, number, number] = [31, 94, 255]
  const muted: [number, number, number] = [91, 107, 130]
  const line: [number, number, number] = [226, 232, 240]
  const glacier: [number, number, number] = [238, 244, 252]
  const person = company.founders[company.newClientContact] ?? company.founders[0]
  const photo = await photoAsJpeg(imageUrl(person.image as ImageId, 640))
  const today = new Date().toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })

  // Kopf
  doc.setFillColor(...navy)
  doc.rect(0, 0, W, 34, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(17)
  doc.setTextColor(255, 255, 255)
  doc.text('CleanStar', M, 16)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(190, 205, 230)
  doc.text('Dienstleistungen · Büroreinigung in Offenburg und der Ortenau', M, 23)
  doc.text(today, W - M, 16, { align: 'right' })

  // Titel
  let y = 50
  doc.setTextColor(...navy)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.text('Zusammenfassung Ihrer Anfrage', M, y)
  y += 7
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(...muted)
  doc.text(`Für ${input.company}. Zum Weiterleiten an Geschäftsführung, Einkauf oder Kollegen.`, M, y)
  y += 10

  // Angaben als Tabelle
  doc.setFontSize(10)
  const labelW = 52
  const valueW = W - 2 * M - labelW - 4
  for (const [k, v] of input.rows) {
    const lines = doc.splitTextToSize(v || '–', valueW) as string[]
    const h = Math.max(1, lines.length) * 5 + 4
    if (y + h > 270) {
      doc.addPage()
      y = 20
    }
    doc.setDrawColor(...line)
    doc.line(M, y, W - M, y)
    doc.setTextColor(...muted)
    doc.text(k, M, y + 5.5)
    doc.setTextColor(...navy)
    doc.text(lines, M + labelW + 4, y + 5.5)
    y += h
  }
  doc.line(M, y, W - M, y)
  y += 8

  // Richtpreis
  if (input.price) {
    const h = input.price.perEmployee ? 30 : 24
    if (y + h > 270) {
      doc.addPage()
      y = 20
    }
    doc.setFillColor(...glacier)
    doc.roundedRect(M, y, W - 2 * M, h, 3, 3, 'F')
    doc.setFontSize(8)
    doc.setTextColor(...blue)
    doc.setFont('helvetica', 'bold')
    doc.text('UNVERBINDLICHE RICHTPREIS-SPANNE PRO MONAT', M + 6, y + 7)
    doc.setFontSize(15)
    doc.setTextColor(...navy)
    doc.text(`${input.price.net} netto`, M + 6, y + 15)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...muted)
    doc.text(`${input.price.gross} brutto inkl. MwSt.`, M + 6, y + 20.5)
    if (input.price.perEmployee) doc.text(`Pro Mitarbeiter und Arbeitstag: ca. ${input.price.perEmployee} netto`, M + 6, y + 26)
    y += h + 4
    doc.setFontSize(8)
    doc.text('Orientierung auf Basis Ihrer Angaben. Das verbindliche Angebot erhalten Sie nach der Besichtigung schriftlich.', M, y)
    y += 8
  }

  // Risikofrei und Ansprechpartner
  if (y + 50 > 280) {
    doc.addPage()
    y = 20
  }
  const colW = (W - 2 * M - 6) / 2
  doc.setDrawColor(...blue)
  doc.setLineWidth(0.5)
  doc.roundedRect(M, y, colW, 42, 3, 3, 'S')
  doc.circle(M + 12, y + 13, 6, 'S')
  doc.setLineWidth(0.9)
  doc.lines(
    [
      [2.2, 2.2],
      [4.6, -4.6],
    ],
    M + 8.8,
    y + 13,
  )
  doc.setLineWidth(0.2)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...navy)
  doc.text(company.contract.riskFree, M + 22, y + 12)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(...muted)
  doc.text(doc.splitTextToSize(`${company.contract.firstMonth} ${company.contract.afterwards}`, colW - 12) as string[], M + 6, y + 25)

  const x2 = M + colW + 6
  doc.setFillColor(...glacier)
  doc.roundedRect(x2, y, colW, 42, 3, 3, 'F')
  let tx = x2 + 6
  if (photo) {
    doc.addImage(photo, 'JPEG', x2 + 6, y + 6, 18, 18)
    tx = x2 + 28
  }
  doc.setFontSize(7.5)
  doc.setTextColor(...blue)
  doc.setFont('helvetica', 'bold')
  doc.text('IHR ANSPRECHPARTNER', tx, y + 10)
  doc.setFontSize(11)
  doc.setTextColor(...navy)
  doc.text(person.name ?? company.shortName, tx, y + 16)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(...muted)
  doc.text(doc.splitTextToSize(person.role.replace('Gründer · ', 'Gründer, '), x2 + colW - tx - 4) as string[], tx, y + 21)
  doc.setTextColor(...navy)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text(`${company.phone.display} · ${company.availability}`, x2 + 6, y + 33)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.text(company.email, x2 + 6, y + 38)

  // Fußzeile auf jeder Seite
  const pages = doc.getNumberOfPages()
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i)
    doc.setFontSize(7.5)
    doc.setTextColor(...muted)
    doc.text(`${company.legalName} · ${fullAddress()} · USt-ID ${company.vatId ?? ''} · ${company.siteUrl.replace('https://', '')}`, W / 2, 288, { align: 'center' })
  }

  const slug = input.company.replace(/[^\wäöüÄÖÜß-]+/g, '-').replace(/^-|-$/g, '') || 'Anfrage'
  doc.save(`CleanStar-Anfrage-${slug}.pdf`)
}
