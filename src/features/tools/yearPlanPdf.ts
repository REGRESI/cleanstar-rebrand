import { company, fullAddress } from '@/content/company'
import { MONTHS, MONTHS_LONG, optionFor, planRows, type PlanSelection } from './yearPlan'

/** PDF „Ihr Reinigungsplan <Jahr>“ im Browser erzeugen. Nichts wird gesendet. */
export async function downloadYearPlanPdf(sel: PlanSelection, year: number) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'landscape' })
  const W = 297
  const M = 16
  const navy: [number, number, number] = [11, 22, 41]
  const blue: [number, number, number] = [31, 94, 255]
  const muted: [number, number, number] = [91, 107, 130]
  const line: [number, number, number] = [226, 232, 240]
  const glacier: [number, number, number] = [238, 244, 252]

  doc.setFillColor(...navy)
  doc.rect(0, 0, W, 28, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(255, 255, 255)
  doc.text(`Ihr Reinigungsplan ${year}`, M, 17)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(company.name, W - M, 13, { align: 'right' })
  doc.text(`${company.phone.display} · ${company.email}`, W - M, 19, { align: 'right' })

  const labelW = 62
  const gridX = M + labelW
  const colW = (W - M - gridX) / 12
  let y = 42
  doc.setFontSize(9)
  doc.setTextColor(...muted)
  MONTHS.forEach((m, i) => doc.text(m, gridX + colW * i + colW / 2, y, { align: 'center' }))
  y += 4

  for (const row of planRows) {
    const opt = optionFor(row, sel)
    const h = 15
    doc.setDrawColor(...line)
    doc.line(M, y, W - M, y)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10.5)
    doc.setTextColor(...navy)
    doc.text(row.name, M, y + 6.5)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(...muted)
    doc.text(opt.id === 'aus' ? 'nicht vorgesehen' : opt.label, M, y + 11)
    for (let i = 0; i < 12; i++) {
      const x = gridX + colW * i + 1
      const on = opt.months.includes(i)
      doc.setFillColor(...(on ? blue : glacier))
      doc.roundedRect(x, y + 3, colW - 2, h - 6, 1.5, 1.5, 'F')
    }
    y += h
  }
  doc.line(M, y, W - M, y)

  y += 10
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10.5)
  doc.setTextColor(...navy)
  doc.text('Termine im Überblick', M, y)
  y += 6
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9.5)
  for (const row of planRows) {
    const opt = optionFor(row, sel)
    if (opt.id === 'aus') continue
    const when = row.id === 'unterhalt' ? `ganzjährig, ${opt.note}` : opt.months.length === 12 ? 'ganzjährig' : opt.note || opt.months.map((m) => MONTHS_LONG[m]).join(', ')
    doc.setTextColor(...navy)
    doc.text(`${row.name}:`, M, y)
    doc.setTextColor(...muted)
    doc.text(when, M + labelW, y)
    y += 5.5
  }

  doc.setFontSize(8.5)
  doc.setTextColor(...muted)
  const foot = `Vorschlag, unverbindlich. Die genauen Termine stimmen wir mit Ihnen ab. ${company.legalName}, ${fullAddress()}, ${company.availability}.`
  doc.text(doc.splitTextToSize(foot, W - 2 * M), M, 198)
  doc.save(`Reinigungsplan-${year}-CleanStar.pdf`)
}
