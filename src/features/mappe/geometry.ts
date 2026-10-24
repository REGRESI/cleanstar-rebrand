import * as THREE from 'three'

/** Maße in Szeneneinheiten: Seite 1 × 1,4 (wie 600 × 840 px), Buchdecke etwas größer */
export const PW = 1
export const PH = 1.4
export const LEAF_T = 0.0042 // Papierstärke je Blatt
export const COVER_T = 0.02 // Stärke der Buchdecke
export const COVER_W = PW + 0.03
export const COVER_H = PH + 0.04
export const SEG = 48

/**
 * Blatt als Streifen entlang der Breite: (SEG + 1) × 2 Punkte. u = 0 an der Bindung, u = 1 an der Außenkante.
 * Positionen werden je Bild aus Fortschritt und Wölbung berechnet (bendLeaf).
 */
export function createLeafGeometry() {
  const g = new THREE.BufferGeometry()
  const pos = new Float32Array((SEG + 1) * 2 * 3)
  const uv = new Float32Array((SEG + 1) * 2 * 2)
  const idx: number[] = []
  for (let i = 0; i <= SEG; i++) {
    const u = i / SEG
    // Zeile 0: oberer Seitenrand (z = -PH/2), Zeile 1: unterer (z = +PH/2)
    uv.set([u, 1], i * 2 * 2)
    uv.set([u, 0], (i * 2 + 1) * 2)
    if (i < SEG) {
      const a = i * 2,
        b = a + 1,
        c = a + 2,
        d = a + 3
      idx.push(a, b, c, b, d, c)
    }
  }
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2))
  g.setIndex(idx)
  bendLeaf(g, 0, 0, 0)
  return g
}

/**
 * Blatt biegen. p: 0 = liegt rechts, 1 = liegt links. curl: Stärke der Wölbung (Vorzeichen = Richtung).
 * Die Außenkante läuft beim Blättern nach, das Papier wölbt sich weich und liegt am Ende wieder flach.
 * lift: Anheben der Außenecke (Hover), y0: Höhe der Bindung.
 */
export function bendLeaf(g: THREE.BufferGeometry, p: number, y0: number, curl: number, lift = 0) {
  const pos = g.getAttribute('position') as THREE.BufferAttribute
  const a0 = p * Math.PI
  const ds = PW / SEG
  let x = 0
  let y = y0
  for (let i = 0; i <= SEG; i++) {
    const s = i / SEG
    if (i > 0) {
      // Winkel entlang des Blatts: Grundwinkel plus Wölbung, die zur Außenkante hin zunimmt
      const a = a0 + curl * Math.pow(s, 1.7) + lift * Math.pow(s, 3)
      x += Math.cos(a) * ds
      y += Math.sin(a) * ds
    }
    pos.setXYZ(i * 2, x, y, -PH / 2)
    pos.setXYZ(i * 2 + 1, x, y, PH / 2)
  }
  pos.needsUpdate = true
  g.computeVertexNormals()
  g.computeBoundingSphere()
}

/** Abgerundetes Rechteck als Buchdecke (leicht abgerundete Kanten, echte Stärke) */
export function createBoardGeometry(w = COVER_W, h = COVER_H, t = COVER_T, r = 0.022) {
  const s = new THREE.Shape()
  // Bindung (x = 0) gerade, Außenecken gerundet
  s.moveTo(0, -h / 2)
  s.lineTo(w - r, -h / 2)
  s.quadraticCurveTo(w, -h / 2, w, -h / 2 + r)
  s.lineTo(w, h / 2 - r)
  s.quadraticCurveTo(w, h / 2, w - r, h / 2)
  s.lineTo(0, h / 2)
  s.lineTo(0, -h / 2)
  const g = new THREE.ExtrudeGeometry(s, { depth: t, bevelEnabled: true, bevelThickness: 0.003, bevelSize: 0.003, bevelSegments: 3, curveSegments: 8 })
  // Shape liegt in XY, Stärke in Z: in die Tischebene drehen (Stärke nach oben)
  g.rotateX(-Math.PI / 2)
  g.translate(0, 0, 0)
  // UVs der Deckfläche auf 0..1 normieren
  const uv = g.getAttribute('uv') as THREE.BufferAttribute
  const p = g.getAttribute('position') as THREE.BufferAttribute
  for (let i = 0; i < uv.count; i++) uv.setXY(i, p.getX(i) / w, 0.5 - p.getZ(i) / h)
  uv.needsUpdate = true
  g.computeVertexNormals()
  return g
}

/** Weicher Schatten als Textur (Rechteck mit großem Weichzeichner), für Buch und Deko */
export function softShadowTexture(w = 512, h = 512, inset = 0.18, blur = 60) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')!
  ctx.filter = `blur(${blur}px)`
  ctx.fillStyle = 'rgba(40,30,18,1)'
  ctx.fillRect(w * inset, h * inset, w * (1 - 2 * inset), h * (1 - 2 * inset))
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

/** Projektive Abbildung des Einheitsquadrats auf ein Viereck (p0..p3 im Uhrzeigersinn ab oben links): Koeffizienten a…h */
function homography(p: [number, number][]) {
  const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = p
  const dx1 = x1 - x2,
    dx2 = x3 - x2,
    dx3 = x0 - x1 + x2 - x3
  const dy1 = y1 - y2,
    dy2 = y3 - y2,
    dy3 = y0 - y1 + y2 - y3
  if (Math.abs(dx3) < 1e-9 && Math.abs(dy3) < 1e-9) return [x1 - x0, x2 - x1, x0, y1 - y0, y2 - y1, y0, 0, 0]
  const det = dx1 * dy2 - dx2 * dy1
  const g = (dx3 * dy2 - dx2 * dy3) / det
  const h = (dx1 * dy3 - dx3 * dy1) / det
  return [x1 - x0 + g * x1, x3 - x0 + h * x3, x0, y1 - y0 + g * y1, y3 - y0 + h * y3, y0, g, h]
}

/** Projektive Abbildung des Rechtecks w × h auf ein Viereck (Bildschirmpunkte p0..p3 im Uhrzeigersinn ab oben links) als CSS matrix3d */
export function quadMatrix(w: number, h: number, p: [number, number][]) {
  const [a0, b0, c, d0, e0, f, g0, h0] = homography(p)
  let a = a0,
    b = b0,
    d = d0,
    e = e0,
    g = g0,
    hh = h0
  // Einheitsquadrat → Rechteck w × h
  a /= w
  d /= w
  g /= w
  b /= h
  e /= h
  hh /= h
  return `matrix3d(${a},${d},0,${g},${b},${e},0,${hh},0,0,1,0,${c},${f},0,1)`
}

/** Bildschirmpunkt → Lage auf der Seite (u, v jeweils 0…1), Umkehrung der projektiven Abbildung */
export function quadToUnit(p: [number, number][], X: number, Y: number): [number, number] {
  const [a, b, c, d, e, f, g, h] = homography(p)
  // 3×3-Matrix [[a,b,c],[d,e,f],[g,h,1]] invertieren
  const A = e - f * h,
    B = f * g - d,
    C = d * h - e * g
  const det = a * A + b * B + c * C
  const inv = [A, c * h - b, b * f - c * e, B, a - c * g, c * d - a * f, C, b * g - a * h, a * e - b * d].map((v) => v / det)
  const u = inv[0] * X + inv[1] * Y + inv[2]
  const v = inv[3] * X + inv[4] * Y + inv[5]
  const w = inv[6] * X + inv[7] * Y + inv[8]
  return [u / w, v / w]
}
