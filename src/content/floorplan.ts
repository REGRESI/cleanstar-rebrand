/**
 * BÜRO-GRUNDRISS „Was wird bei Ihnen gereinigt?“
 * Branchenübliches Muster-Leistungsverzeichnis, Raum für Raum. Im Angebot passen wir es an Ihr Objekt an.
 *
 * freq: wie oft eine Leistung im Verhältnis zum gewählten Reinigungsintervall erledigt wird
 *  - 'visit'   bei jedem Einsatz (also täglich, 3× pro Woche oder wöchentlich, je nach Intervall)
 *  - 'weekly'  einmal pro Woche
 *  - 'monthly' einmal im Monat
 *  - 'request' nach Absprache
 */
export type Freq = 'visit' | 'weekly' | 'monthly' | 'request'
export type PlanInterval = 'taeglich' | '3x' | 'woechentlich'

export const planIntervals: { id: PlanInterval; label: string }[] = [
  { id: 'taeglich', label: 'Täglich' },
  { id: '3x', label: '3× pro Woche' },
  { id: 'woechentlich', label: 'Wöchentlich' },
]

export function freqLabel(f: Freq, interval: PlanInterval) {
  if (f === 'request') return 'nach Absprache'
  if (f === 'monthly') return 'monatlich'
  if (f === 'weekly') return 'wöchentlich'
  return { taeglich: 'täglich', '3x': '3× pro Woche', woechentlich: 'wöchentlich' }[interval]
}

export interface Zone {
  id: string
  name: string
  /** Rechteck im Grundriss (viewBox 0 0 800 500) */
  rect: [number, number, number, number]
  tasks: { task: string; freq: Freq }[]
}

export const zones: Zone[] = [
  {
    id: 'arbeitsplaetze',
    name: 'Arbeitsplätze',
    rect: [20, 20, 440, 260],
    tasks: [
      { task: 'Freie Schreibtischflächen feucht abwischen', freq: 'visit' },
      { task: 'Papierkörbe leeren, Beutel wechseln', freq: 'visit' },
      { task: 'Teppich saugen, Hartböden feucht wischen', freq: 'visit' },
      { task: 'Telefone und Tastaturen abwischen (ohne Bildschirme)', freq: 'weekly' },
      { task: 'Fensterbänke, Heizkörper und Regale abstauben', freq: 'weekly' },
      { task: 'Hochstaub und Spinnweben entfernen', freq: 'monthly' },
    ],
  },
  {
    id: 'besprechung',
    name: 'Besprechungsraum',
    rect: [460, 20, 320, 160],
    tasks: [
      { task: 'Tisch und Stuhllehnen abwischen', freq: 'visit' },
      { task: 'Gläser und Geschirr abräumen', freq: 'visit' },
      { task: 'Boden saugen bzw. wischen', freq: 'visit' },
      { task: 'Whiteboard und Glaswände reinigen', freq: 'weekly' },
      { task: 'Polsterstühle absaugen', freq: 'monthly' },
    ],
  },
  {
    id: 'kueche',
    name: 'Teeküche',
    rect: [460, 180, 170, 100],
    tasks: [
      { task: 'Arbeitsflächen und Spüle reinigen', freq: 'visit' },
      { task: 'Kaffeemaschine außen abwischen, Tropfschale leeren', freq: 'visit' },
      { task: 'Boden feucht wischen', freq: 'visit' },
      { task: 'Kühlschrank außen und Mikrowelle innen reinigen', freq: 'weekly' },
      { task: 'Kühlschrank innen auswischen', freq: 'monthly' },
      { task: 'Spülmaschine ein- und ausräumen', freq: 'request' },
    ],
  },
  {
    id: 'sanitaer',
    name: 'Sanitär',
    rect: [630, 180, 150, 100],
    tasks: [
      { task: 'WCs, Urinale und Waschbecken reinigen und desinfizieren', freq: 'visit' },
      { task: 'Spiegel und Armaturen streifenfrei', freq: 'visit' },
      { task: 'Seife, Papierhandtücher und Toilettenpapier auffüllen', freq: 'visit' },
      { task: 'Boden nass wischen', freq: 'visit' },
      { task: 'Fliesen im Spritzbereich abwaschen', freq: 'weekly' },
      { task: 'Trennwände und Türen komplett abwaschen', freq: 'monthly' },
    ],
  },
  {
    id: 'flur',
    name: 'Flur',
    rect: [20, 280, 760, 70],
    tasks: [
      { task: 'Boden saugen bzw. feucht wischen', freq: 'visit' },
      { task: 'Türklinken und Lichtschalter desinfizierend abwischen', freq: 'weekly' },
      { task: 'Glastüren von Fingerabdrücken befreien', freq: 'weekly' },
      { task: 'Fußleisten abwischen', freq: 'monthly' },
    ],
  },
  {
    id: 'empfang',
    name: 'Empfang',
    rect: [20, 350, 300, 130],
    tasks: [
      { task: 'Theke und Ablagen abwischen', freq: 'visit' },
      { task: 'Eingangstür von Fingerabdrücken befreien', freq: 'visit' },
      { task: 'Sauberlaufmatte absaugen, Boden wischen', freq: 'visit' },
      { task: 'Sitzmöbel im Wartebereich abwischen', freq: 'weekly' },
    ],
  },
  {
    id: 'einzelbueros',
    name: 'Einzelbüros',
    rect: [320, 350, 300, 130],
    tasks: [
      { task: 'Freie Schreibtischflächen feucht abwischen', freq: 'visit' },
      { task: 'Papierkörbe leeren', freq: 'visit' },
      { task: 'Boden saugen bzw. wischen', freq: 'visit' },
      { task: 'Fensterbänke und Regale abstauben', freq: 'weekly' },
    ],
  },
  {
    id: 'treppenhaus',
    name: 'Treppenhaus',
    rect: [620, 350, 160, 130],
    tasks: [
      { task: 'Treppen kehren und feucht wischen', freq: 'weekly' },
      { task: 'Handläufe abwischen', freq: 'weekly' },
      { task: 'Aufzugkabine reinigen, Bedienfeld abwischen', freq: 'weekly' },
      { task: 'Geländer und Fensterbänke abwischen', freq: 'monthly' },
    ],
  },
]
