/**
 * Büro als Architekturmodell, prozedural aus Grundformen: abgerundete Boxen, Zylinder, Lathe-Körper.
 * Statische Teile werden mit Vertexfarben zu einer einzigen Geometrie zusammengefasst (ein Draw Call),
 * bewegliche Teile (Stühle, Tassen, Papierstapel, Tür) sind instanziert bzw. einzeln.
 *
 * Koordinaten in Metern: x 0..14 entlang der Fensterfront, z 0..9 in die Tiefe (Fenster bei z = 0, nach Osten,
 * dahinter der Schwarzwald), y nach oben. Die Wand zur Kamera (z = 9) und die Decke fehlen (Puppenhaus-Schnitt).
 */
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

export const W = 14
export const D = 9
export const H = 3

export const COLORS = {
  white: new THREE.Color('#eef0ee'),
  wall: new THREE.Color('#f3f4f2'),
  floor: new THREE.Color('#e6e7e3'),
  plinth: new THREE.Color('#dfe1dd'),
  wood: new THREE.Color('#c8a27c'),
  navy: new THREE.Color('#1b2a44'),
  blue: new THREE.Color('#2b5be6'),
  screen: new THREE.Color('#1a2233'),
  leaf: new THREE.Color('#a9b9a2'),
  steel: new THREE.Color('#c9ccd0'),
}

type Part = THREE.BufferGeometry

function paint(g: Part, c: THREE.Color) {
  const n = g.attributes.position.count
  const col = new Float32Array(n * 3)
  for (let i = 0; i < n; i++) col.set([c.r, c.g, c.b], i * 3)
  g.setAttribute('color', new THREE.BufferAttribute(col, 3))
  // Einheitliche Attribute für das Zusammenfassen
  if (!g.attributes.uv) g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(n * 2), 2))
  return g
}

/** Abgerundete Box mit Mittelpunkt (x, y, z) */
export function rbox(w: number, h: number, d: number, x: number, y: number, z: number, c: THREE.Color, r = 0.02, seg = 2) {
  const g = new RoundedBoxGeometry(w, h, d, seg, Math.min(r, w / 2, h / 2, d / 2))
  g.translate(x, y, z)
  return paint(g.toNonIndexed(), c)
}

export function cyl(rt: number, rb: number, h: number, x: number, y: number, z: number, c: THREE.Color, seg = 20) {
  const g = new THREE.CylinderGeometry(rt, rb, h, seg)
  g.translate(x, y, z)
  return paint(g.toNonIndexed(), c)
}

function lathe(points: [number, number][], x: number, y: number, z: number, c: THREE.Color, seg = 24) {
  const g = new THREE.LatheGeometry(
    points.map(([r, h]) => new THREE.Vector2(r, h)),
    seg,
  )
  g.translate(x, y, z)
  return paint(g.toNonIndexed(), c)
}

function sphere(r: number, x: number, y: number, z: number, c: THREE.Color, sy = 1) {
  const g = new THREE.IcosahedronGeometry(r, 2)
  g.scale(1, sy, 1)
  g.translate(x, y, z)
  return paint(g.toNonIndexed(), c)
}

export function merge(parts: Part[]) {
  const g = mergeGeometries(parts, false)!
  g.computeVertexNormals()
  return g
}

/* --------------------------------------------------------------------------------------------- Grundriss-Elemente */

export const DESK = { w: 1.6, d: 0.8, h: 0.74 }
/** Zwei Inseln mit je vier Arbeitsplätzen (2 × 2, gegenüber) */
export const islands = [
  { cx: 2.2, cz: 3.5 },
  { cx: 5.9, cz: 3.5 },
]
export const desks = islands.flatMap((is, k) =>
  [-1, 1].flatMap((sx) => [-1, 1].map((sz) => ({ island: k, x: is.cx + (sx * DESK.w) / 2, z: is.cz + (sz * DESK.d) / 2, facing: sz }))),
)
export const meeting = { cx: 11.05, cz: 2.15, w: 3.0, d: 1.15 }

/** Stühle: ordentliche Lage (nach der Reinigung) und Lage am Abend (schief, weggerollt) */
export const chairs = [
  ...desks.map((d, i) => {
    const tz = d.z + d.facing * 0.62
    // Lehne liegt lokal bei +z: auf der Seite +z bleibt der Stuhl ungedreht
    const rot = d.facing > 0 ? 0 : Math.PI
    const mess = [
      [0.35, 0.4, 0.6],
      [-0.25, 0.55, -0.5],
      [0.1, 0.25, 0.9],
      [0.45, 0.6, -0.35],
      [-0.4, 0.3, 0.45],
      [0.2, 0.7, -0.8],
      [-0.15, 0.45, 0.3],
      [0.3, 0.35, -0.6],
    ][i]
    return { tidy: [d.x, tz, rot], messy: [d.x + mess[0], tz + d.facing * mess[1], rot + mess[2]], zone: 0 }
  }),
  ...[-1, 0, 1].flatMap((k, j) =>
    [-1, 1].map((side, s) => {
      const tz = meeting.cz + side * (meeting.d / 2 + 0.38)
      const rot = side > 0 ? 0 : Math.PI
      const mess = [0.25, -0.2, 0.15, -0.3, 0.2, 0.1][j * 2 + s]
      return { tidy: [meeting.cx + k * 0.95, tz, rot], messy: [meeting.cx + k * 0.95 + mess, tz + side * 0.32, rot + mess * 1.6], zone: 1 }
    }),
  ),
] as { tidy: [number, number, number]; messy: [number, number, number]; zone: number }[]

/** Tassen und Papierstapel als Spuren des Tages (Zone, Lage) */
export const cups = [
  ...desks.filter((_, i) => i % 3 !== 1).map((d) => ({ x: d.x + 0.45, y: DESK.h, z: d.z - d.facing * 0.12, zone: 0 })),
  { x: meeting.cx - 0.9, y: DESK.h, z: meeting.cz + 0.2, zone: 1 },
  { x: meeting.cx + 0.3, y: DESK.h, z: meeting.cz - 0.25, zone: 1 },
  { x: meeting.cx + 1.1, y: DESK.h, z: meeting.cz + 0.15, zone: 1 },
  { x: 9.1, y: 0.92, z: 4.72, zone: 2 },
  { x: 9.35, y: 0.92, z: 4.68, zone: 2 },
]
export const papers = desks.filter((_, i) => i % 2 === 0).map((d, i) => ({ x: d.x - 0.35, z: d.z - d.facing * 0.05, rot: [0.4, -0.55, 0.3, -0.35][i], zone: 0 }))

/** Prüfpunkte je Zone (x, z), nummeriert in Reihenfolge */
export const checkpoints = [
  [1.4, 3.5, 0],
  [4.1, 2.6, 0],
  [6.9, 4.4, 0],
  [9.4, 2.2, 1],
  [12.6, 2.2, 1],
  [10.6, 5.1, 2],
  [8.9, 5.1, 2],
  [12.0, 5.9, 3],
  [13.3, 5.9, 3],
  [11.0, 8.1, 4],
  [4.0, 8.1, 4],
].map(([x, z, zone], i) => ({ x, z, zone, n: i + 1 }))

export const DOOR = { x: 0, z: 8.1, w: 1.0, h: 2.15 }
export const ALARM = { x: 0.04, y: 1.45, z: 7.35 }

/* ------------------------------------------------------------------------------------------------- Bausteine */

function chairGeometry() {
  const c = COLORS.navy
  return merge([
    rbox(0.5, 0.08, 0.48, 0, 0.46, 0, c, 0.035, 3),
    rbox(0.48, 0.5, 0.06, 0, 0.78, 0.23, c, 0.03, 3),
    cyl(0.025, 0.025, 0.36, 0, 0.26, 0, COLORS.steel, 10),
    ...[0, 1, 2, 3, 4].map((k) => {
      const a = (k / 5) * Math.PI * 2
      const g = rbox(0.3, 0.03, 0.045, 0.15, 0.06, 0, COLORS.steel, 0.012, 1)
      g.rotateY(a)
      return g
    }),
  ])
}

function deskParts(x: number, z: number) {
  return [
    rbox(DESK.w - 0.04, 0.035, DESK.d - 0.04, x, DESK.h, z, COLORS.wood, 0.012, 2),
    rbox(0.04, DESK.h - 0.02, DESK.d - 0.12, x - DESK.w / 2 + 0.08, DESK.h / 2, z, COLORS.white, 0.015),
    rbox(0.04, DESK.h - 0.02, DESK.d - 0.12, x + DESK.w / 2 - 0.08, DESK.h / 2, z, COLORS.white, 0.015),
  ]
}

function monitorParts(x: number, z: number, facing: number) {
  const mz = z - facing * 0.22
  return [
    rbox(0.62, 0.38, 0.03, x, DESK.h + 0.36, mz, COLORS.white, 0.012),
    cyl(0.018, 0.018, 0.16, x, DESK.h + 0.1, mz - facing * 0.03, COLORS.white, 8),
    rbox(0.2, 0.012, 0.14, x, DESK.h + 0.025, mz - facing * 0.03, COLORS.white, 0.005),
    rbox(0.42, 0.012, 0.14, x, DESK.h + 0.025, z + facing * 0.08, COLORS.white, 0.005),
  ]
}

function lampParts(x: number, z: number, facing: number) {
  const lx = x + 0.62
  const lz = z - facing * 0.25
  return [cyl(0.07, 0.08, 0.02, lx, DESK.h + 0.03, lz, COLORS.white, 16), cyl(0.008, 0.008, 0.42, lx, DESK.h + 0.24, lz, COLORS.steel, 6)]
}

function plant(x: number, z: number, s = 1) {
  return [
    lathe(
      [
        [0.001, 0],
        [0.16 * s, 0],
        [0.2 * s, 0.38 * s],
        [0.21 * s, 0.4 * s],
        [0.001, 0.4 * s],
      ],
      x,
      0,
      z,
      COLORS.white,
      20,
    ),
    sphere(0.32 * s, x, 0.78 * s, z, COLORS.leaf, 1.25),
    sphere(0.22 * s, x + 0.16 * s, 1.08 * s, z - 0.05, COLORS.leaf, 1.1),
    sphere(0.2 * s, x - 0.14 * s, 1.0 * s, z + 0.1, COLORS.leaf, 1.2),
  ]
}

/** Fensterfront bei z = 0: Brüstung, Rahmen und Pfosten; die Scheiben sind ein eigenes Glas-Mesh */
function windowFront() {
  const parts: Part[] = [rbox(W, 0.5, 0.18, W / 2, 0.25, 0.09, COLORS.wall, 0.02), rbox(W, 0.06, 0.26, W / 2, 0.52, 0.13, COLORS.white, 0.015)]
  parts.push(rbox(W, 0.12, 0.18, W / 2, H - 0.06, 0.09, COLORS.wall, 0.02))
  for (let i = 0; i <= 10; i++) parts.push(rbox(0.07, H - 0.62, 0.12, (i / 10) * W, 0.5 + (H - 0.62) / 2, 0.07, COLORS.white, 0.015))
  return parts
}

export function buildStatic() {
  const parts: Part[] = []
  // Sockel des Modells und Boden
  parts.push(rbox(W + 1.2, 0.36, D + 1.2, W / 2, -0.18, D / 2, COLORS.plinth, 0.06, 3))
  parts.push(rbox(W, 0.02, D, W / 2, 0.01, D / 2, COLORS.floor, 0.005, 1))
  // Seitenwände (angeschnitten), Fensterfront
  parts.push(rbox(0.16, H, D - 1.4, -0.08, H / 2, (D - 1.4) / 2, COLORS.wall, 0.02))
  parts.push(rbox(0.16, H - DOOR.h, DOOR.w, -0.08, DOOR.h + (H - DOOR.h) / 2, DOOR.z, COLORS.wall, 0.02))
  parts.push(rbox(0.16, H, D - DOOR.z - DOOR.w / 2, -0.08, H / 2, DOOR.z + DOOR.w / 2 + (D - DOOR.z - DOOR.w / 2) / 2, COLORS.wall, 0.02))
  parts.push(rbox(0.16, H, D, W + 0.08, H / 2, D / 2, COLORS.wall, 0.02))
  parts.push(...windowFront())
  // Glaswand Besprechung: Pfosten und Sockel (Scheiben im Glas-Mesh)
  for (const z of [0.1, 1.5, 2.9, 4.3]) parts.push(rbox(0.05, H, 0.05, 8.1, H / 2, z, COLORS.white, 0.01))
  for (const x of [9.4, 11.0, 12.6, 13.95]) parts.push(rbox(0.05, H, 0.05, x, H / 2, 4.36, COLORS.white, 0.01))
  // Küchenzeile mit Kaffeemaschine, Hängeschrank angedeutet
  parts.push(rbox(2.7, 0.9, 0.62, 9.65, 0.45, 4.72, COLORS.white, 0.02))
  parts.push(rbox(2.74, 0.04, 0.66, 9.65, 0.92, 4.72, COLORS.wood, 0.01))
  parts.push(rbox(0.3, 0.4, 0.34, 10.6, 1.14, 4.62, COLORS.navy, 0.04, 3))
  parts.push(rbox(0.5, 0.14, 0.4, 9.9, 0.93, 4.66, COLORS.steel, 0.01))
  parts.push(rbox(2.7, 0.7, 0.36, 9.65, 2.15, 4.56, COLORS.white, 0.02))
  // Sanitär als geschlossener Kubus mit Tür zum Flur
  parts.push(rbox(0.1, H, 2.7, 11.3, H / 2, 5.72, COLORS.wall, 0.015))
  parts.push(rbox(2.7, H, 0.1, 12.65, H / 2, 7.07, COLORS.wall, 0.015))
  parts.push(rbox(0.86, 2.05, 0.04, 12.65, 1.03, 7.13, COLORS.blue, 0.015))
  parts.push(cyl(0.012, 0.012, 0.14, 12.95, 1.0, 7.17, COLORS.steel, 6))
  // Arbeitsplätze
  for (const d of desks) parts.push(...deskParts(d.x, d.z), ...monitorParts(d.x, d.z, d.facing), ...lampParts(d.x, d.z, d.facing))
  // Besprechungstisch
  parts.push(rbox(meeting.w, 0.04, meeting.d, meeting.cx, DESK.h, meeting.cz, COLORS.wood, 0.02, 3))
  parts.push(cyl(0.05, 0.05, DESK.h - 0.04, meeting.cx - 0.9, DESK.h / 2, meeting.cz, COLORS.white, 12))
  parts.push(cyl(0.05, 0.05, DESK.h - 0.04, meeting.cx + 0.9, DESK.h / 2, meeting.cz, COLORS.white, 12))
  // Empfangstheke im Flur, Sideboard, Pflanzen
  parts.push(rbox(1.8, 1.05, 0.55, 2.4, 0.52, 7.75, COLORS.white, 0.03, 3))
  parts.push(rbox(1.82, 0.04, 0.6, 2.4, 1.06, 7.75, COLORS.wood, 0.01))
  parts.push(rbox(2.2, 0.62, 0.42, 4.1, 0.31, 0.45, COLORS.white, 0.02))
  parts.push(...plant(0.55, 0.55, 1.05), ...plant(7.6, 0.6, 0.9), ...plant(13.45, 0.6, 1.1), ...plant(5.2, 6.7, 0.8))
  // Alarmanlage am Türrahmen (Gehäuse; das Licht ist ein eigenes Mesh)
  parts.push(rbox(0.04, 0.2, 0.14, ALARM.x, ALARM.y, ALARM.z, COLORS.white, 0.01))
  return merge(parts)
}

/** Glasflächen: Fensterscheiben und Glaswände der Besprechung */
export function buildGlass() {
  const parts: Part[] = []
  for (let i = 0; i < 10; i++) parts.push(rbox(W / 10 - 0.07, H - 0.64, 0.01, ((i + 0.5) / 10) * W, 0.5 + (H - 0.62) / 2, 0.07, COLORS.white, 0.002, 1))
  parts.push(rbox(0.01, H - 0.05, 4.3, 8.1, H / 2, 2.2, COLORS.white, 0.002, 1))
  parts.push(rbox(5.8, H - 0.05, 0.01, 11.05, H / 2, 4.36, COLORS.white, 0.002, 1))
  return merge(parts)
}

/** Leuchtende Teile: Bildschirme (je Arbeitsplatz) und Lampenköpfe; Index = Arbeitsplatz */
export function buildScreens() {
  return desks.map((d) => {
    const g = new THREE.PlaneGeometry(0.56, 0.32)
    const mz = d.z - d.facing * 0.22 + d.facing * 0.017
    // Bildschirm zeigt zum Stuhl (nach außen, Richtung facing)
    if (d.facing < 0) g.rotateY(Math.PI)
    g.translate(d.x, DESK.h + 0.36, mz)
    return g
  })
}

export function buildLampHeads() {
  return desks.map((d) => {
    const g = new THREE.CylinderGeometry(0.06, 0.11, 0.1, 18, 1, true)
    g.translate(d.x + 0.62, DESK.h + 0.45, d.z - d.facing * 0.25)
    return g
  })
}

export const chairGeo = chairGeometry
export const cupGeo = () => {
  const g = new THREE.LatheGeometry(
    [
      [0.001, 0],
      [0.035, 0],
      [0.042, 0.09],
      [0.038, 0.09],
      [0.03, 0.006],
      [0.001, 0.006],
    ].map(([r, h]) => new THREE.Vector2(r, h)),
    16,
  )
  return paint(g.toNonIndexed(), COLORS.white)
}
export const paperGeo = () => paint(new RoundedBoxGeometry(0.3, 0.05, 0.22, 1, 0.004).toNonIndexed(), COLORS.white)

/** Grundriss als Linien (Kontrolle um 21:45): Wände, Möbel und Zonen als Umrisse auf dem Boden */
export function buildPlanLines() {
  const pts: number[] = []
  const rect = (x0: number, z0: number, x1: number, z1: number, y = 0.03) => {
    const c = [
      [x0, z0],
      [x1, z0],
      [x1, z1],
      [x0, z1],
    ]
    for (let i = 0; i < 4; i++) pts.push(c[i][0], y, c[i][1], c[(i + 1) % 4][0], y, c[(i + 1) % 4][1])
  }
  rect(0, 0, W, D)
  for (const d of desks) rect(d.x - DESK.w / 2 + 0.02, d.z - DESK.d / 2 + 0.02, d.x + DESK.w / 2 - 0.02, d.z + DESK.d / 2 - 0.02)
  for (const c of chairs) rect(c.tidy[0] - 0.24, c.tidy[1] - 0.24, c.tidy[0] + 0.24, c.tidy[1] + 0.24)
  rect(meeting.cx - meeting.w / 2, meeting.cz - meeting.d / 2, meeting.cx + meeting.w / 2, meeting.cz + meeting.d / 2)
  rect(8.3, 4.41, 11.0, 5.03)
  rect(11.3, 4.36, W, 7.07)
  rect(1.5, 7.47, 3.3, 8.03)
  rect(3.0, 0.24, 5.2, 0.66)
  // Zonengrenzen
  pts.push(8.1, 0.03, 0, 8.1, 0.03, 7.09, 0, 0.03, 7.09, W, 0.03, 7.09, 8.1, 0.03, 4.36, W, 0.03, 4.36)
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3))
  return g
}
