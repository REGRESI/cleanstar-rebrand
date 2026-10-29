import { company, fullAddress } from '@/content/company'
import type { Service } from '@/content/services'

/**
 * Leistungsverzeichnis einer Leistung als PDF, im Browser aus den Inhaltsdaten (services.ts) erzeugt.
 * Nichts wird gesendet. Gedacht zum Weiterleiten an Einkauf oder Geschäftsführung.
 */
export async function downloadScopePdf(s: Service) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const W = 210
  const M = 18
  const navy: [number, number, number] = [10, 26, 51]
  const ink: [number, number, number] = [11, 18, 32]
  const muted: [number, number, number] = [74, 85, 102]
  const line: [number, number, number] = [221, 228, 236]
  const today = new Date().toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })

  const head = () => {
    doc.setFillColor(...navy)
    doc.rect(0, 0, W, 28, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(15)
    doc.setTextColor(255, 255, 255)
    doc.text('CleanStar', M, 14)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(200, 212, 230)
    doc.text('Leistungsverzeichnis · unverbindliche Übersicht', M, 20.5)
    doc.text(today, W - M, 14, { align: 'right' })
  }
  head()
  let y = 44
  const need = (h: number) => {
    if (y + h > 278) {
      doc.addPage()
      head()
      y = 40
    }
  }

  doc.setTextColor(...ink)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(19)
  doc.text(s.name, M, y)
  y += 7
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(...muted)
  const intro = doc.splitTextToSize(s.short, W - 2 * M) as string[]
  doc.text(intro, M, y)
  y += intro.length * 5 + 6

  for (const g of s.scope) {
    need(16)
    doc.setDrawColor(...line)
    doc.line(M, y, W - M, y)
    y += 7
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(...ink)
    doc.text(g.title, M, y)
    y += 6
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9.5)
    for (const it of g.items) {
      const t = doc.splitTextToSize(it, W - 2 * M - 8) as string[]
      need(t.length * 4.6 + 1)
      doc.setTextColor(...muted)
      doc.text('·', M + 1, y)
      doc.setTextColor(...ink)
      doc.text(t, M + 6, y)
      y += t.length * 4.6 + 1
    }
    y += 3
  }

  if (s.intervals.length) {
    need(20)
    doc.setDrawColor(...line)
    doc.line(M, y, W - M, y)
    y += 7
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text('Typische Intervalle', M, y)
    y += 6
    doc.setFontSize(9.5)
    for (const iv of s.intervals) {
      const t = doc.splitTextToSize(iv.text, W - 2 * M - 52) as string[]
      need(t.length * 4.6 + 3)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...ink)
      doc.text(iv.label, M, y)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...muted)
      doc.text(t, M + 52, y)
      y += t.length * 4.6 + 3
    }
  }

  need(26)
  y += 4
  doc.setDrawColor(...line)
  doc.line(M, y, W - M, y)
  y += 7
  doc.setFontSize(9)
  doc.setTextColor(...muted)
  const note = doc.splitTextToSize(
    'Den genauen Umfang legen wir nach der kostenlosen Besichtigung schriftlich fest. Abrechnung nach Stunden, das Angebot erhalten Sie innerhalb von 48 Stunden.',
    W - 2 * M,
  ) as string[]
  doc.text(note, M, y)
  y += note.length * 4.4 + 4
  doc.setTextColor(...ink)
  doc.text(`${company.legalName ?? company.name} · ${fullAddress()} · ${company.phone.display} · ${company.email}`, M, y)

  doc.save(`CleanStar-Leistungsverzeichnis-${s.slug}.pdf`)
}
