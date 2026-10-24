import { company } from '@/content/company'

/**
 * Personalisierte Mappe: `/leistungsmappe?fuer=Müller%20GmbH&an=lino`
 * `fuer` steht auf Einband, Innen-Titel und im PDF. `an` wählt den Ansprechpartner (Vorname oder Index).
 */
export interface Recipient {
  /** Firmenname, bereinigt (nur Text, höchstens 60 Zeichen), leer = nicht personalisiert */
  company: string
  /** Index des Ansprechpartners in company.founders */
  contact: number
}

export const MAX_NAME = 60

/** Nur Text: keine Tags, keine Steuerzeichen, erlaubte Satzzeichen, Leerraum zusammengefasst, höchstens 60 Zeichen */
export function cleanName(raw: string | null | undefined): string {
  if (!raw) return ''
  return raw
    .normalize('NFC')
    .replace(/<[^>]*>/g, ' ')
    .replace(/[^\p{L}\p{N} &.,'’\-+/()]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_NAME)
    .trim()
}

const firstName = (i: number) => (company.founders[i]?.name ?? '').split(' ')[0].toLowerCase()

/** Ansprechpartner aus Vorname oder Index; sonst der feste Ansprechpartner für Neukunden */
export function contactIndex(raw: string | null | undefined): number {
  const v = (raw ?? '').trim().toLowerCase()
  if (!v) return company.newClientContact
  const n = Number(v)
  if (Number.isInteger(n) && company.founders[n]) return n
  const i = company.founders.findIndex((_, k) => firstName(k) === v.normalize('NFC'))
  return i >= 0 ? i : company.newClientContact
}

export function recipientFromSearch(search: string): Recipient {
  const q = new URLSearchParams(search)
  return { company: cleanName(q.get('fuer')), contact: contactIndex(q.get('an')) }
}

export const defaultRecipient: Recipient = { company: '', contact: company.newClientContact }

/** Link zur personalisierten Mappe */
export function mappeLink(r: Recipient, base = company.siteUrl) {
  const q = new URLSearchParams()
  if (r.company) q.set('fuer', r.company)
  if (r.contact !== company.newClientContact) q.set('an', firstName(r.contact))
  const s = q.toString().replace(/\+/g, '%20')
  return `${base.replace(/\/$/, '')}/leistungsmappe/${s ? '?' + s : ''}`
}
