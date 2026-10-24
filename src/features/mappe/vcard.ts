import { company } from '@/content/company'

/** Kontakt als vCard (3.0) speichern: Klick auf die Visitenkarte auf der Rückseite der Mappe */
export function downloadVCard() {
  const a = company.address
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `ORG:${company.legalName}`,
    `FN:${company.name}`,
    `TEL;TYPE=WORK,VOICE:${company.phone.href.replace('tel:', '')}`,
    `EMAIL;TYPE=WORK:${company.email}`,
    `ADR;TYPE=WORK:;;${a.street};${a.city};;${a.zip};Deutschland`,
    `URL:${company.siteUrl}`,
    'END:VCARD',
  ]
  const blob = new Blob([lines.join('\r\n') + '\r\n'], { type: 'text/vcard;charset=utf-8' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = 'CleanStar.vcf'
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(link.href), 2000)
}
