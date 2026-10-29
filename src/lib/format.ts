/** Geschütztes Leerzeichen: Zahl und Einheit werden nie auf zwei Zeilen verteilt („390 €“, „2 Std.“). */
export const NBSP = '\u00A0'

const eur = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
const eur2 = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 })
const int = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 })
const dec2 = new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const num = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 2 })

// Intl setzt zwischen Betrag und € bereits ein geschütztes Leerzeichen; zur Sicherheit vereinheitlichen
const nb = (s: string) => s.replace(/\s/g, NBSP)

export const formatEuro = (v: number) => nb(eur.format(Math.round(v)))
export const formatEuro2 = (v: number) => nb(eur2.format(v))
export const formatNumber = (v: number) => num.format(v)

/** Preisspanne, die nie umbricht: „303 bis 390 €“ */
export const formatEuroRange = (a: number, b: number) => `${int.format(Math.round(a))}${NBSP} bis ${NBSP}${formatEuro(b)}`
/** Preisspanne mit Cent: „3,52 bis 4,53 €“ */
export const formatEuro2Range = (a: number, b: number) => `${dec2.format(a)}${NBSP} bis ${NBSP}${formatEuro2(b)}`

/** Zahl mit Einheit: „2 Std.“, „8,7 h“, „24 Stunden“ */
export const formatUnit = (v: number, unit: string) => `${formatNumber(v)}${NBSP}${unit}`

/**
 * Verhindert ein einzelnes Wort allein in der letzten Zeile einer Überschrift:
 * Die letzten beiden Wörter werden mit einem geschützten Leerzeichen verbunden, wenn sie zusammen kurz genug sind.
 */
export function noOrphan(text: string, maxChars = 18) {
  const i = text.lastIndexOf(' ')
  if (i < 0) return text
  const j = text.lastIndexOf(' ', i - 1)
  const pair = text.slice(j + 1)
  return pair.length <= maxChars ? text.slice(0, i) + NBSP + text.slice(i + 1) : text
}

/** Datum lang auf Deutsch, z. B. „29. Oktober 2026“ (ISO-Datum ohne Uhrzeit) */
export const formatDate = (iso: string) => new Date(iso + 'T12:00:00').toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })
