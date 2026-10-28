/**
 * Schematische Karte des Ortenaukreises (vereinfachter Umriss, Rhein, Projektion). Genutzt von der Leistungsmappe
 * und als Platzhalter der Karte, solange MapLibre lädt (und ohne JavaScript).
 */
// Einfache Projektion: Längen-/Breitengrad → SVG-Koordinaten
const LNG0 = 7.6
const LAT0 = 48.76
const K = 1000
const COS = Math.cos((48.45 * Math.PI) / 180)
export const proj = (lat: number, lng: number) => [(lng - LNG0) * K * COS, (LAT0 - lat) * K] as const

// Schematischer Umriss des Ortenaukreises (vereinfacht)
export const OUTLINE: [number, number][] = [
  [48.735, 7.99],
  [48.7, 8.09],
  [48.64, 8.17],
  [48.56, 8.22],
  [48.49, 8.26],
  [48.42, 8.32],
  [48.35, 8.38],
  [48.27, 8.37],
  [48.19, 8.3],
  [48.13, 8.2],
  [48.15, 8.08],
  [48.19, 7.95],
  [48.24, 7.8],
  [48.3, 7.72],
  [48.38, 7.72],
  [48.46, 7.76],
  [48.55, 7.79],
  [48.62, 7.85],
  [48.69, 7.92],
]
export const RHINE: [number, number][] = [
  [48.76, 7.95],
  [48.69, 7.89],
  [48.62, 7.82],
  [48.56, 7.77],
  [48.47, 7.735],
  [48.38, 7.69],
  [48.3, 7.68],
  [48.22, 7.72],
  [48.13, 7.68],
]
export const toPath = (pts: [number, number][], close = true) =>
  pts
    .map(
      ([la, ln], i) =>
        `${i ? 'L' : 'M'}${proj(la, ln)
          .map((v) => v.toFixed(1))
          .join(' ')}`,
    )
    .join(' ') + (close ? 'Z' : '')

export const VB = { x: -20, y: -10, w: 560, h: 660 }
