import { zones } from '@/content/floorplan'

/**
 * Prüfpunkte für die Linienansicht (Hero „Der Plan“ und Prüfpunkt-Ansicht auf Büroreinigung).
 * Die Aufgaben stammen aus dem Leistungsverzeichnis der Arbeitsplätze (content/floorplan.ts), in derselben Reihenfolge.
 * Lage im Foto als Anteil von Breite und Höhe; auf dem Handy liegen alle Punkte im sichtbaren Mittelteil.
 */
export interface Checkpoint {
  task: string
  x: number
  y: number
}

const tasks = zones.find((z) => z.id === 'arbeitsplaetze')!.tasks.map((t) => t.task)

const at = (pos: [number, number][]): Checkpoint[] => pos.map(([x, y], i) => ({ task: tasks[i], x, y }))

/** Hero: Büro am Abend (public/hero/key-feierabend-*.jpg) */
export const heroCheckpoints = at([
  [0.31, 0.53],
  [0.64, 0.66],
  [0.56, 0.77],
  [0.7, 0.52],
  [0.45, 0.47],
  [0.55, 0.09],
])

/** Büroreinigung: Arbeitsplatz am Morgen (images/buero-am-morgen) */
export const officeCheckpoints = at([
  [0.3, 0.52],
  [0.85, 0.66],
  [0.07, 0.74],
  [0.48, 0.47],
  [0.88, 0.3],
  [0.2, 0.05],
])
