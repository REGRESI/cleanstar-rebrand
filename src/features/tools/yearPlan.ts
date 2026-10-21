/**
 * Jahres-Reinigungsplan: welche Leistung in welchem Monat. Die Monate sind Vorschläge
 * (ruhige Zeiten wie Sommerferien oder zwischen den Jahren), im Angebot passen wir sie an.
 */
export const MONTHS = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez']
export const MONTHS_LONG = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember']

export type PlanRowId = 'unterhalt' | 'fenster' | 'grund' | 'teppich' | 'kontakt'

export interface PlanRow {
  id: PlanRowId
  name: string
  options: { id: string; label: string; months: number[]; note: string }[]
}

const all = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]

export const planRows: PlanRow[] = [
  {
    id: 'unterhalt',
    name: 'Laufende Büroreinigung',
    options: [
      { id: 'taeglich', label: 'Täglich', months: all, note: 'an jedem Arbeitstag' },
      { id: '3x', label: '3× pro Woche', months: all, note: 'dreimal pro Woche' },
      { id: '2x', label: '2× pro Woche', months: all, note: 'zweimal pro Woche' },
      { id: '1x', label: 'Wöchentlich', months: all, note: 'einmal pro Woche' },
    ],
  },
  {
    id: 'kontakt',
    name: 'Kontaktflächen verstärkt',
    options: [
      { id: 'winter', label: 'Erkältungszeit', months: [0, 1, 2, 9, 10, 11], note: 'Klinken, Schalter, Küche häufiger, Oktober bis März' },
      { id: 'aus', label: 'Aus', months: [], note: '' },
    ],
  },
  {
    id: 'fenster',
    name: 'Fensterreinigung',
    options: [
      { id: 'quartal', label: 'Vierteljährlich', months: [2, 5, 8, 11], note: 'März, Juni, September, Dezember' },
      { id: 'halbjahr', label: 'Halbjährlich', months: [3, 9], note: 'April und Oktober' },
      { id: 'jahr', label: 'Jährlich', months: [3], note: 'April' },
      { id: 'aus', label: 'Aus', months: [], note: '' },
    ],
  },
  {
    id: 'grund',
    name: 'Grundreinigung Böden',
    options: [
      { id: 'jahr', label: 'Jährlich', months: [7], note: 'August, in den Sommerferien' },
      { id: 'halbjahr', label: 'Halbjährlich', months: [1, 7], note: 'Februar und August' },
      { id: 'aus', label: 'Aus', months: [], note: '' },
    ],
  },
  {
    id: 'teppich',
    name: 'Teppichreinigung',
    options: [
      { id: 'jahr', label: 'Jährlich', months: [11], note: 'Dezember, zwischen den Jahren' },
      { id: 'halbjahr', label: 'Halbjährlich', months: [5, 11], note: 'Juni und Dezember' },
      { id: 'aus', label: 'Aus', months: [], note: '' },
    ],
  },
]

export type PlanSelection = Record<PlanRowId, string>
export const defaultSelection: PlanSelection = { unterhalt: '3x', kontakt: 'winter', fenster: 'quartal', grund: 'jahr', teppich: 'aus' }

export const optionFor = (row: PlanRow, sel: PlanSelection) => row.options.find((o) => o.id === sel[row.id]) ?? row.options[0]

/** Planjahr: ab September das Folgejahr */
export const planYear = (d = new Date()) => (d.getMonth() >= 8 ? d.getFullYear() + 1 : d.getFullYear())
