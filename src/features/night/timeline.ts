/**
 * Nacht-Lineal: eine Zeitquelle für die ganze Signatur-Szene. Der Scrollfortschritt p (0 bis 1) wird auf die Uhrzeit
 * 18:00 bis 7:00 abgebildet; alle Phasen, Lichter, Kamerafahrt und Texte lesen nur p.
 *
 * Phasen: 18:00 Feierabend · 18:30 Ihr Team geht · 19:15 Wir kommen · 20:00 bis 21:30 Reinigung (fünf Zonen in der
 * Reihenfolge aus content/floorplan.ts) · 21:45 Kontrolle · 7:00 Ihr Büro ist bereit.
 */
import { zones as planZones } from '@/content/floorplan'

export const PHASES = {
  dusk: [0, 0.1],
  leave: [0.1, 0.2],
  arrive: [0.2, 0.3],
  clean: [0.3, 0.72],
  check: [0.72, 0.84],
  morning: [0.84, 1],
} as const

/** Uhrzeit (Minuten seit 0:00) an Stützstellen; dazwischen linear. Die Nacht zwischen 22 und 6:45 Uhr rauscht vorbei. */
const CLOCK: [number, number][] = [
  [0, 18 * 60],
  [0.1, 18 * 60 + 30],
  [0.2, 19 * 60 + 15],
  [0.3, 20 * 60],
  [0.72, 21 * 60 + 30],
  [0.78, 21 * 60 + 45],
  [0.84, 22 * 60 + 5],
  [0.88, 24 * 60 + 6 * 60 + 45],
  [0.92, 24 * 60 + 7 * 60],
  [1, 24 * 60 + 7 * 60 + 10],
]

export function clockMinutes(p: number) {
  for (let i = 1; i < CLOCK.length; i++) {
    const [p1, m1] = CLOCK[i]
    const [p0, m0] = CLOCK[i - 1]
    if (p <= p1) return m0 + ((m1 - m0) * (p - p0)) / (p1 - p0 || 1)
  }
  return CLOCK[CLOCK.length - 1][1]
}

export function clockLabel(p: number) {
  const m = Math.round(clockMinutes(p)) % (24 * 60)
  return `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`
}

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x))
/** Anteil 0 bis 1 von p innerhalb [a, b] */
export const span = (p: number, a: number, b: number) => clamp01((p - a) / (b - a))
export const smooth = (x: number) => x * x * (3 - 2 * x)

/** Die fünf Zonen der Szene, in der Reihenfolge aus floorplan.ts; Rechtecke in Metern im 14 × 9 m großen Büro */
const SCENE_ZONES = ['arbeitsplaetze', 'besprechung', 'kueche', 'sanitaer', 'flur'] as const
// Umrechnung des Grundrisses (viewBox 800 × 500, die ersten fünf Zonen liegen in x 20..780, y 20..350)
const mx = (x: number) => ((x - 20) / 760) * 14
const mz = (y: number) => ((y - 20) / 330) * 9

/** Zeile je Zone, nur aus den Aufgaben in floorplan.ts zusammengefasst */
const LINES: Record<(typeof SCENE_ZONES)[number], string> = {
  arbeitsplaetze: 'Schreibtische, Papierkörbe, Böden.',
  besprechung: 'Tisch, Stuhllehnen, Geschirr, Boden.',
  kueche: 'Arbeitsflächen, Spüle, Kaffeemaschine.',
  sanitaer: 'Gereinigt, desinfiziert, aufgefüllt.',
  flur: 'Böden, Türklinken, Lichtschalter.',
}

// Richtung der Lichtkante je Zone (+1 nach rechts, -1 nach links): so bleibt die Kamerafahrt eine ruhige Kurve
const DIR = { arbeitsplaetze: 1, besprechung: 1, kueche: -1, sanitaer: 1, flur: -1 } as const

export type SceneZone = { id: string; name: string; line: string; x0: number; z0: number; x1: number; z1: number; dir: 1 | -1; start: number; end: number }

const SLOT = (PHASES.clean[1] - PHASES.clean[0]) / SCENE_ZONES.length
export const sceneZones: SceneZone[] = SCENE_ZONES.map((id, i) => {
  const z = planZones.find((x) => x.id === id)!
  const [x, y, w, h] = z.rect
  return {
    id,
    name: z.name,
    line: LINES[id],
    x0: mx(x),
    z0: mz(y),
    x1: mx(x + w),
    z1: mz(y + h),
    dir: DIR[id],
    start: PHASES.clean[0] + i * SLOT,
    end: PHASES.clean[0] + (i + 1) * SLOT,
  }
})

/** Fortschritt der Reinigung je Zone (0 bis 1) */
export const zoneProgress = (p: number) => sceneZones.map((z) => span(p, z.start, z.end))

/** x-Position der Lichtkante in einer Zone bei Fortschritt k */
export const edgeX = (z: SceneZone, k: number) => (z.dir > 0 ? z.x0 + (z.x1 - z.x0) * k : z.x1 - (z.x1 - z.x0) * k)

/** Texte der Szene (stehen zusätzlich vollständig als HTML auf der Seite) */
export const sceneLines = {
  dusk: { time: '18:00', title: 'Feierabend.', text: 'Die letzten Mails, dann wird es ruhig im Büro.' },
  leave: { time: '18:30', title: 'Ihr Team geht.', text: 'Lampen und Bildschirme gehen aus, Insel für Insel.' },
  arrive: { time: '19:15', title: 'Wir kommen.', text: 'Mit Ihrem Schlüssel, die Alarmanlage nach Protokoll.' },
  check: { time: '21:45', title: 'Kontrolliert nach Checkliste.', text: 'Jeder Punkt des Leistungsverzeichnisses, Raum für Raum.' },
  morning: { time: '7:00', title: 'Ihr Büro ist bereit.', text: 'Bevor der Erste kommt.' },
}
