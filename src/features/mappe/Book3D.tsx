import { useCallback, useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react'
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { COVER_H, COVER_T, COVER_W, LEAF_T, PH, PW, bendLeaf, createBoardGeometry, createLeafGeometry, quadMatrix, softShadowTexture } from './geometry'
import { PAGE_H, PAGE_W } from './core'
import { mappeAsset, tableFile } from './assets'

/** Ein sanfter Ablauf für alles: schnell an, weich aus (passt zu cubic-bezier(0.2, 0.7, 0.1, 1)) */
const ease = (t: number) => 1 - Math.pow(1 - t, 3.2)

export interface BookState {
  /** -1 = geschlossen, sonst Doppelseite k (links Blatt k-1 Rückseite, rechts Blatt k Vorderseite) */
  spread: number
}

export interface Book3DHandle {
  /** Liegt die Doppelseite still? (HTML-Seiten sichtbar) */
  overlay: HTMLDivElement | null
}

interface LeafAnim {
  from: number
  to: number
  start: number
  dur: number
  dir: 1 | -1
}

/** Gemeinsamer Zustand zwischen Szene (je Bild) und React (Steuerung) */
export interface SceneBus {
  leaves: number
  /** Ziel- und aktueller Fortschritt je Blatt (0 rechts, 1 links), Index -1 = vordere Buchdecke als Eintrag 0 */
  progress: number[]
  anims: Map<number, LeafAnim>
  /** Ziehen an einer Ecke: Blatt und Fortschritt */
  drag: { leaf: number; p: number; dir: 1 | -1 } | null
  /** Ausklappseite: 0 eingeklappt … 1 ausgeklappt (Ziel und aktueller Wert) */
  fold: number
  foldTarget: number
  /** Blätter aus leichtem Papier (Pergament): schneller, stärker gewölbt, durchscheinend */
  light: Set<number>
  open: number // 0 geschlossen … 1 offen (Kamera, Lage des Buchs)
  openTarget: number
  hoverBook: number
  hoverBookTarget: number
  pointer: { x: number; y: number }
  tilt: { x: number; y: number }
  /** Doppelseite, an deren rechter Seite die Ausklappseite hängt (-1: keine) */
  foldSpread: number
  /** Inhalt der beiden Klappflügel (linke und rechte Hälfte des großen Grundrisses) */
  foldTex: [THREE.Texture | null, THREE.Texture | null]
  /** Lesebändchen: Schwingen (Feder) und Klick */
  ribbonSway: number
  ribbonVel: number
  onRibbon?: () => void
  /** Seitenecken in Bildschirmkoordinaten für die HTML-Seiten; wide: die ausgeklappten Flügel */
  onCorners?: (left: [number, number][] | null, right: [number, number][] | null, still: boolean, wide: [number, number][] | null) => void
  textures: (THREE.Texture | null)[]
  coverTex: THREE.Texture | null
  endpaper: THREE.Texture | null
  steamAt: number
  /** Bühne im Bild? Außerhalb ruhen Rendern und Abfotografieren */
  visible: boolean
  nudge: Record<string, number>
}

export const busFor = (pages: number): SceneBus => {
  const leaves = Math.ceil(pages / 2)
  return {
    leaves,
    progress: new Array(leaves + 1).fill(0),
    anims: new Map(),
    drag: null,
    fold: 0,
    foldTarget: 0,
    light: new Set(),
    foldSpread: -1,
    foldTex: [null, null],
    ribbonSway: 0,
    ribbonVel: 0,
    open: 0,
    openTarget: 0,
    hoverBook: 0,
    hoverBookTarget: 0,
    pointer: { x: 0, y: 0 },
    tilt: { x: 0, y: 0 },
    textures: new Array(pages).fill(null),
    coverTex: null,
    endpaper: null,
    steamAt: -1,
    visible: true,
    nudge: {},
  }
}

/** Fortschritt eines Eintrags (0 = Buchdecke, 1.. = Blätter) zum Zeitpunkt now */
/** Anteil für weiches Nachziehen pro Bild, unabhängig von der Bildrate */
const damp = (rate: number, dt: number) => 1 - Math.exp(-rate * Math.min(dt, 0.25))

function current(bus: SceneBus, i: number, now: number) {
  if (bus.drag && bus.drag.leaf === i) return bus.drag.p
  const a = bus.anims.get(i)
  if (!a) return bus.progress[i]
  const t = Math.min(1, (now - a.start) / a.dur)
  const v = a.from + (a.to - a.from) * ease(t)
  if (t >= 1) {
    bus.anims.delete(i)
    bus.progress[i] = a.to
  }
  return v
}

/** Seiten-Material: unbeleuchtet (identisch zur HTML-Seite), Wölbung wird über die Flächennormale leicht schattiert */
function pageMaterial(side: THREE.Side) {
  const m = new THREE.MeshBasicMaterial({ color: 0xffffff, side, toneMapped: false })
  m.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying float vShade;')
      // Rückseite: Bild gespiegelt, damit die linke Seite richtig herum liegt
      .replace('#include <uv_vertex>', side === THREE.BackSide ? '#include <uv_vertex>\n#ifdef USE_MAP\nvMapUv.x = 1.0 - vMapUv.x;\n#endif' : '#include <uv_vertex>')
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        vec3 nW = normalize(mat3(modelMatrix) * normal);
        ${side === THREE.BackSide ? 'nW = -nW;' : ''}
        // Licht von links oben: zugewandte Flächen hell, steile Wölbung dunkler
        vShade = clamp(0.55 + 0.45 * dot(nW, normalize(vec3(-0.35, 1.0, -0.25))) + 0.06, 0.62, 1.0);`,
      )
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying float vShade;')
      .replace('#include <opaque_fragment>', 'outgoingLight *= vShade;\n#include <opaque_fragment>')
  }
  return m
}

const paperEdge = new THREE.MeshStandardMaterial({ color: '#efe9dd', roughness: 0.95 })

function useTexture(url: string | undefined, repeat?: number) {
  const [tex, setTex] = useState<THREE.Texture | null>(null)
  useEffect(() => {
    if (!url) return
    let alive = true
    new THREE.TextureLoader().load(url, (t) => {
      if (!alive) return
      t.colorSpace = THREE.SRGBColorSpace
      t.anisotropy = 8
      if (repeat) {
        t.wrapS = t.wrapT = THREE.RepeatWrapping
        t.repeat.set(repeat, repeat * 1.4)
      }
      setTex(t)
    })
    return () => {
      alive = false
    }
  }, [url, repeat])
  return tex
}

/* ------------------------------------------------------------------------------------------ Tisch und Deko */

/** Tischplatte im Seitenverhältnis des Fotos; 6 Einheiten breit reichen für jedes Bildformat */
function Table({ tex }: { tex: THREE.Texture | null }) {
  const img = tex?.image as HTMLImageElement | undefined
  const aspect = img ? img.height / img.width : 0.5625
  // Über den Rand hinaus gespiegelt fortgesetzt: Beim Herauszoomen (Ausklappseite) bleibt überall Tisch im Bild
  useEffect(() => {
    if (!tex) return
    tex.wrapS = tex.wrapT = THREE.MirroredRepeatWrapping
    tex.repeat.set(3, 3)
    tex.offset.set(-1, -1)
    tex.needsUpdate = true
  }, [tex])
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, -0.001, 0]}>
      <planeGeometry args={[6.4 * 3, 6.4 * aspect * 3]} />
      <meshBasicMaterial map={tex} color={tex ? '#ffffff' : '#e4ded4'} toneMapped={false} />
    </mesh>
  )
}

/** Freigestelltes Foto (mit eigenem Schatten) flach auf dem Tisch; bewegt sich beim Überfahren minimal */
function PhotoObject({
  bus,
  name,
  url,
  w,
  x,
  z,
  rot,
  y = 0.002,
  onHover,
}: {
  bus: SceneBus
  name: string
  url: string
  w: number
  x: number
  z: number
  rot: number
  y?: number
  onHover?: () => void
}) {
  const tex = useTexture(url)
  const ref = useRef<THREE.Mesh>(null)
  const aspect = tex ? (tex.image as HTMLImageElement).height / (tex.image as HTMLImageElement).width : 0.7
  useFrame((_, delta) => {
    const m = ref.current
    if (!m) return
    const k = bus.nudge[name] ?? 0
    bus.nudge[name] = k * (1 - damp(5, delta))
    // Deko rechts weicht der Ausklappseite aus
    m.position.x = x + k * 0.012 + (x > 0.9 ? bus.fold * 2.3 : 0)
    m.position.z = z - k * 0.008
    m.rotation.z = rot + k * 0.025
  })
  if (!tex) return null
  return (
    <mesh
      ref={ref}
      rotation-x={-Math.PI / 2}
      position={[x, y, z]}
      onPointerOver={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation()
        bus.nudge[name] = 1
        onHover?.()
      }}
    >
      <planeGeometry args={[w, w * aspect]} />
      <meshBasicMaterial map={tex} transparent toneMapped={false} depthWrite={false} />
    </mesh>
  )
}

/** Kaffeetasse mit Untertasse, modelliert (Porzellan), solange kein Foto vorliegt. Beim Überfahren steigt einmal Dampf auf. */
function Coffee({ bus, x, z }: { bus: SceneBus; x: number; z: number }) {
  const cup = useMemo(() => {
    const pts = [
      [0, 0],
      [0.1, 0],
      [0.112, 0.01],
      [0.125, 0.06],
      [0.13, 0.11],
      [0.123, 0.112],
      [0.117, 0.06],
      [0.105, 0.016],
      [0, 0.016],
    ].map(([a, b]) => new THREE.Vector2(a, b))
    return new THREE.LatheGeometry(pts, 64)
  }, [])
  const saucer = useMemo(() => {
    const pts = [
      [0, 0],
      [0.17, 0],
      [0.2, 0.012],
      [0.205, 0.018],
      [0.195, 0.016],
      [0.16, 0.008],
      [0, 0.008],
    ].map(([a, b]) => new THREE.Vector2(a, b))
    return new THREE.LatheGeometry(pts, 64)
  }, [])
  const shadow = useMemo(() => softShadowTexture(256, 256, 0.22, 26), [])
  const steam = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 128
    c.height = 256
    const ctx = c.getContext('2d')!
    const g = ctx.createRadialGradient(64, 170, 4, 64, 150, 60)
    g.addColorStop(0, 'rgba(255,255,255,0.55)')
    g.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.filter = 'blur(10px)'
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.ellipse(64, 150, 30, 90, 0.15, 0, Math.PI * 2)
    ctx.fill()
    return new THREE.CanvasTexture(c)
  }, [])
  const steamRef = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    const m = steamRef.current
    if (!m) return
    const t = bus.steamAt < 0 ? 1 : (clock.elapsedTime - bus.steamAt) / 2.2
    const on = t >= 0 && t < 1
    m.visible = on
    if (on) {
      m.position.y = 0.16 + t * 0.22
      ;(m.material as THREE.MeshBasicMaterial).opacity = Math.sin(t * Math.PI) * 0.5
      m.rotation.z = Math.sin(t * 3) * 0.08
    }
  })
  return (
    <group position={[x, 0, z]}>
      <mesh rotation-x={-Math.PI / 2} position={[0.035, 0.0005, 0.04]}>
        <planeGeometry args={[0.62, 0.62]} />
        <meshBasicMaterial map={shadow} transparent opacity={0.42} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh geometry={saucer} castShadow>
        <meshStandardMaterial color="#f7f5f0" roughness={0.35} />
      </mesh>
      <group position={[0, 0.008, 0]}>
        <mesh
          geometry={cup}
          onPointerOver={(e) => {
            e.stopPropagation()
            if (bus.steamAt < 0 || performance.now() / 1000 - bus.steamAt > 3) bus.steamAt = performance.now() / 1000
          }}
        >
          <meshStandardMaterial color="#f9f7f2" roughness={0.3} side={THREE.DoubleSide} />
        </mesh>
        {/* Kaffee */}
        <mesh rotation-x={-Math.PI / 2} position={[0, 0.088, 0]}>
          <circleGeometry args={[0.116, 48]} />
          <meshStandardMaterial color="#3a2417" roughness={0.15} />
        </mesh>
        {/* Henkel */}
        <mesh position={[0.135, 0.06, 0]} rotation-y={0}>
          <torusGeometry args={[0.03, 0.008, 12, 32, Math.PI * 1.25]} />
          <meshStandardMaterial color="#f9f7f2" roughness={0.3} />
        </mesh>
      </group>
      <mesh ref={steamRef} position={[0, 0.2, 0]} rotation-x={-0.25} visible={false}>
        <planeGeometry args={[0.16, 0.32]} />
        <meshBasicMaterial map={steam} transparent opacity={0} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  )
}

/** Dampf über der Tasse: steigt beim Überfahren einmal auf */
function Steam({ bus, x, z }: { bus: SceneBus; x: number; z: number }) {
  const steam = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 128
    c.height = 256
    const ctx = c.getContext('2d')!
    const g = ctx.createRadialGradient(64, 170, 4, 64, 150, 60)
    g.addColorStop(0, 'rgba(255,255,255,0.55)')
    g.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.filter = 'blur(10px)'
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.ellipse(64, 150, 30, 90, 0.15, 0, Math.PI * 2)
    ctx.fill()
    return new THREE.CanvasTexture(c)
  }, [])
  const ref = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    const m = ref.current
    if (!m) return
    const t = bus.steamAt < 0 ? 1 : (clock.elapsedTime - bus.steamAt) / 2.2
    const on = t >= 0 && t < 1
    m.visible = on
    if (on) {
      m.position.y = 0.06 + t * 0.26
      ;(m.material as THREE.MeshBasicMaterial).opacity = Math.sin(t * Math.PI) * 0.45
      m.rotation.z = Math.sin(t * 3) * 0.08
    }
  })
  return (
    <mesh ref={ref} position={[x + bus.fold * 2.3, 0.08, z]} rotation-x={-0.35} visible={false}>
      <planeGeometry args={[0.2, 0.4]} />
      <meshBasicMaterial map={steam} transparent opacity={0} depthWrite={false} toneMapped={false} />
    </mesh>
  )
}

/** Stift, modelliert: dunkler Schaft, Metallclip und Spitze */
function Pen({ x, z, rot }: { x: number; z: number; rot: number }) {
  const shadow = useMemo(() => softShadowTexture(256, 64, 0.18, 10), [])
  return (
    <group position={[x, 0, z]} rotation-y={rot}>
      <mesh rotation-x={-Math.PI / 2} position={[0.012, 0.0005, 0.016]}>
        <planeGeometry args={[0.72, 0.09]} />
        <meshBasicMaterial map={shadow} transparent opacity={0.4} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh rotation-z={Math.PI / 2} position={[0, 0.011, 0]}>
        <cylinderGeometry args={[0.011, 0.011, 0.52, 24]} />
        <meshStandardMaterial color="#141a26" roughness={0.35} metalness={0.2} />
      </mesh>
      <mesh rotation-z={-Math.PI / 2} position={[0.3, 0.011, 0]}>
        <coneGeometry args={[0.011, 0.07, 24]} />
        <meshStandardMaterial color="#b9bcc2" roughness={0.25} metalness={0.9} />
      </mesh>
      <mesh position={[-0.17, 0.024, 0]}>
        <boxGeometry args={[0.14, 0.004, 0.006]} />
        <meshStandardMaterial color="#c9ccd2" roughness={0.2} metalness={0.95} />
      </mesh>
    </group>
  )
}

/* ------------------------------------------------------------------------------------------ Buch */

function Leaf({ bus, index, geom }: { bus: SceneBus; index: number; geom: THREE.BufferGeometry }) {
  // Pergament: durchscheinend (Alpha aus der Textur), wird nach den übrigen Blättern gezeichnet
  const light = bus.light.has(index + 1)
  const front = useMemo(() => Object.assign(pageMaterial(THREE.FrontSide), light ? { transparent: true, depthWrite: false } : {}), [light])
  const back = useMemo(() => Object.assign(pageMaterial(THREE.BackSide), light ? { transparent: true, depthWrite: false } : {}), [light])
  useFrame(() => {
    const ft = bus.textures[index * 2] ?? null
    const bt = bus.textures[index * 2 + 1] ?? null
    if (front.map !== ft) {
      front.map = ft
      front.needsUpdate = true
    }
    if (back.map !== bt) {
      back.map = bt
      back.needsUpdate = true
    }
    front.color.set(ft ? '#ffffff' : '#f5f2eb')
    back.color.set(bt ? '#ffffff' : '#f5f2eb')
    if (light && !ft) front.opacity = back.opacity = 0.5
  })
  return (
    <group>
      <mesh geometry={geom} material={front} renderOrder={light ? 3 : 0} />
      <mesh geometry={geom} material={back} renderOrder={light ? 3 : 0} />
    </group>
  )
}

/** Lesebändchen: dunkelblaues Satinband, tritt an der Unterkante nahe der Bindung aus und liegt auf dem Tisch. Klick: zu den Konditionen. */
function Ribbon({ bus }: { bus: SceneBus }) {
  const N = 40
  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array((N + 1) * 2 * 3), 3))
    const idx: number[] = []
    for (let i = 0; i < N; i++) idx.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2)
    g.setIndex(idx)
    return g
  }, [])
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#1b2a4a', roughness: 0.42, metalness: 0.08, side: THREE.DoubleSide }), [])
  const last = useRef({ open: 0, moving: 0 })
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)
    // Anstoß, wenn das Buch sich bewegt (Öffnen, Blättern): gedämpfte Feder
    const moving = bus.anims.size + (bus.drag ? 1 : 0)
    const kick = Math.abs(bus.open - last.current.open) * 30 + (moving !== last.current.moving ? 0.6 : 0)
    last.current = { open: bus.open, moving }
    bus.ribbonVel += (-28 * bus.ribbonSway - 3.2 * bus.ribbonVel) * dt + kick * (Math.random() > 0.5 ? 1 : -1)
    bus.ribbonSway += bus.ribbonVel * dt
    const pos = geom.getAttribute('position') as THREE.BufferAttribute
    const L = bus.leaves
    const yIn = COVER_T + LEAF_T * L * 0.5
    const x0 = 0.07
    const w = 0.03
    for (let i = 0; i <= N; i++) {
      const t = i / N
      const z = PH / 2 - 0.05 + t * 0.27
      const out = Math.max(0, Math.min(1, (z - PH / 2) / 0.06))
      const y = yIn * (1 - out * out * (3 - 2 * out)) + 0.0016
      const x = x0 + 0.012 * Math.sin(t * Math.PI * 1.1) + bus.ribbonSway * 0.05 * t * t
      const taper = t > 0.96 ? (1 - t) / 0.04 : 1
      pos.setXYZ(i * 2, x - (w / 2) * taper, y, z)
      pos.setXYZ(i * 2 + 1, x + (w / 2) * taper, y, z)
    }
    pos.needsUpdate = true
    geom.computeVertexNormals()
    geom.computeBoundingSphere()
  })
  return (
    <mesh
      geometry={geom}
      material={mat}
      onClick={(e) => {
        e.stopPropagation()
        bus.ribbonVel += 1.2
        bus.onRibbon?.()
      }}
      onPointerOver={() => (document.body.style.cursor = 'pointer')}
      onPointerOut={() => (document.body.style.cursor = '')}
    />
  )
}

function Book({ bus, onOpen }: { bus: SceneBus; onOpen: () => void }) {
  const group = useRef<THREE.Group>(null)
  const frontCover = useRef<THREE.Group>(null)
  const leafGeoms = useMemo(() => Array.from({ length: bus.leaves }, () => createLeafGeometry()), [bus.leaves])
  const board = useMemo(() => createBoardGeometry(), [])
  const linen = useTexture('/mappe/leinen.webp', 2.2)
  const shadowTex = useMemo(() => softShadowTexture(512, 512, 0.16, 46), [])
  const shadow = useRef<THREE.Mesh>(null)
  const turnShade = useRef<THREE.Mesh>(null)
  const coverMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.92, metalness: 0 }), [])
  const faceGeom = useMemo(() => new THREE.PlaneGeometry(COVER_W, COVER_H), [])
  const coverInside = useMemo(() => new THREE.MeshStandardMaterial({ color: '#1e2838', roughness: 0.95 }), [])
  const backMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.95 }), [])
  const edgeL = useRef<THREE.Mesh>(null)
  const edgeR = useRef<THREE.Mesh>(null)
  const foldA = useRef<THREE.Group>(null)
  const foldB = useRef<THREE.Group>(null)
  const foldMatA = useMemo(() => pageMaterial(THREE.FrontSide), [])
  const foldMatB = useMemo(() => pageMaterial(THREE.FrontSide), [])
  const foldBack = useMemo(() => new THREE.MeshBasicMaterial({ color: '#efeadf', side: THREE.BackSide, toneMapped: false }), [])
  const panelGeom = useMemo(() => {
    const g = new THREE.PlaneGeometry(PW, PH)
    g.rotateX(-Math.PI / 2)
    g.translate(PW / 2, 0, 0)
    return g
  }, [])
  const { camera, size } = useThree()
  const v = useMemo(() => new THREE.Vector3(), [])

  useEffect(() => {
    if (linen) {
      backMat.map = linen
      backMat.needsUpdate = true
      coverInside.map = linen
      coverInside.color.set('#9aa6b8')
      coverInside.needsUpdate = true
    }
  }, [linen, backMat, coverInside])

  useFrame(({ clock }, delta) => {
    const now = performance.now()
    const L = bus.leaves
    // Buchdecke (Eintrag 0) und Blätter (1..L)
    const pc = current(bus, 0, now)
    const pl: number[] = []
    for (let i = 0; i < L; i++) pl.push(current(bus, i + 1, now))
    if (bus.coverTex && coverMat.map !== bus.coverTex) {
      coverMat.map = bus.coverTex
      coverMat.needsUpdate = true
    }

    // Stapelhöhen: rechts liegen nicht umgeblätterte Blätter, links umgeblätterte (das zuletzt geblätterte oben)
    const turned = pl.map((p) => p > 0.5)
    const nRight = turned.filter((t) => !t).length
    const nLeft = L - nRight
    let anyMoving = bus.anims.size > 0 || !!bus.drag
    for (let i = 0; i < L; i++) {
      const p = pl[i]
      let above = 0
      for (let j = i + 1; j < L; j++) if (!turned[j]) above++
      let below = 0
      for (let j = 0; j < i; j++) if (turned[j]) below++
      const yR = COVER_T + LEAF_T * (above + 0.5)
      const yL = COVER_T + LEAF_T * (below + 0.5)
      const y0 = yR + (yL - yR) * p
      const moving = p > 0.001 && p < 0.999
      const dir = bus.drag?.leaf === i + 1 ? bus.drag.dir : (bus.anims.get(i + 1)?.dir ?? 1)
      // Wölbung: stark in der Mitte des Blätterns, flach am Anfang und Ende
      // Pergament ist leichter: stärkere, weichere Wölbung
      const curl = moving ? -dir * (bus.light.has(i + 1) ? 1.5 : 0.95) * Math.sin(p * Math.PI) : 0
      bendLeaf(leafGeoms[i], p, y0, curl)
    }

    // vordere Buchdecke: dreht um die Bindung, liegt geschlossen oben auf dem Stapel, offen links auf dem Tisch
    const stackTop = COVER_T + LEAF_T * L
    if (frontCover.current) {
      // Drehung um die Bindung; offen liegt die Decke umgedreht auf dem Tisch (daher um ihre Stärke angehoben)
      frontCover.current.rotation.z = pc * Math.PI
      frontCover.current.position.y = stackTop * (1 - pc) + COVER_T * pc
    }
    // Papierkanten der Stapel
    if (edgeR.current) {
      // Papierblock knapp unter dem obersten Blatt, damit er es nie verdeckt
      // Liegt oben ein durchscheinendes Blatt (Pergament), endet der Block ein Blatt tiefer: Die Seite darunter bleibt sichtbar
      const topR = turned.indexOf(false)
      const hR = Math.max(0.0005, (nRight - 0.7 - (topR >= 0 && bus.light.has(topR + 1) ? 1 : 0)) * LEAF_T)
      edgeR.current.scale.y = hR
      edgeR.current.position.y = COVER_T + hR / 2
      edgeR.current.visible = nRight > 0
    }
    if (edgeL.current) {
      const topL = turned.lastIndexOf(true)
      const hL = Math.max(0.0005, (nLeft - 0.7 - (topL >= 0 && bus.light.has(topL + 1) ? 1 : 0)) * LEAF_T)
      edgeL.current.scale.y = hL
      edgeL.current.position.y = COVER_T + hL / 2
      edgeL.current.visible = pc > 0.5 && nLeft > 0
    }

    // Lage des Buchs: geschlossen mittig, offen mit der Bindung in der Mitte; beim Überfahren minimal angehoben
    // zeitbasiert gedämpft (gleich schnell bei 30 und 120 Bildern pro Sekunde)
    bus.open += (bus.openTarget - bus.open) * damp(3.7, delta)
    bus.hoverBook += (bus.hoverBookTarget - bus.hoverBook) * damp(7.5, delta)
    if (Math.abs(bus.openTarget - bus.open) < 0.002) bus.open = bus.openTarget
    if (group.current) {
      group.current.position.x = (-COVER_W / 2) * (1 - bus.open)
      group.current.position.y = bus.hoverBook * 0.012
    }
    if (shadow.current) {
      const w = COVER_W * (1 + bus.open) + 2 * PW * bus.fold
      shadow.current.scale.set(w * 1.45 + bus.hoverBook * 0.08, COVER_H * 1.32 + bus.hoverBook * 0.08, 1)
      shadow.current.position.x = 0.045 + PW * bus.fold
      ;(shadow.current.material as THREE.MeshBasicMaterial).opacity = 0.5 - bus.hoverBook * 0.12
    }
    // Schatten des blätternden Blatts auf der Seite darunter
    if (turnShade.current) {
      let k = 0
      let side = 1
      for (let i = 0; i < L; i++) {
        const p = pl[i]
        if (p > 0.001 && p < 0.999) {
          k = Math.sin(p * Math.PI)
          side = p < 0.5 ? 1 : -1
        }
      }
      turnShade.current.visible = k > 0.01
      turnShade.current.position.x = side * PW * 0.5
      turnShade.current.position.y = COVER_T + LEAF_T * (L + 1)
      ;(turnShade.current.material as THREE.MeshBasicMaterial).opacity = k * 0.28
    }

    // Ausklappseite: zwei Flügel an der Außenkante der rechten Seite, nacheinander entlang der Knickkanten
    bus.fold += (bus.foldTarget - bus.fold) * damp(2.8, delta)
    if (Math.abs(bus.foldTarget - bus.fold) < 0.002) bus.fold = bus.foldTarget
    const turnedCount = turned.filter(Boolean).length
    const rFirst = turned.indexOf(false)
    let topR = COVER_T
    if (rFirst >= 0) {
      let above = 0
      for (let j = rFirst + 1; j < L; j++) if (!turned[j]) above++
      topR = COVER_T + LEAF_T * (above + 0.5)
    }
    const foldOn = pc > 0.999 && bus.foldSpread >= 0 && turnedCount === bus.foldSpread && bus.fold > 0.001
    if (foldA.current && foldB.current) {
      foldA.current.visible = foldOn
      const sm = (x: number) => {
        const t = Math.max(0, Math.min(1, x))
        return t * t * (3 - 2 * t)
      }
      foldA.current.position.set(PW, topR + 0.003, 0)
      foldA.current.rotation.z = Math.PI * (1 - sm(bus.fold / 0.62))
      foldB.current.rotation.z = Math.PI * (1 - sm((bus.fold - 0.38) / 0.62))
      for (const [m, t] of [
        [foldMatA, bus.foldTex[0]],
        [foldMatB, bus.foldTex[1]],
      ] as const) {
        if (m.map !== t) {
          m.map = t
          m.needsUpdate = true
        }
      }
    }

    // Seitenecken für die HTML-Seiten (nur wenn das Buch offen ist und still liegt)
    anyMoving = anyMoving || Math.abs(bus.openTarget - bus.open) > 0.002 || pc < 0.999 || Math.abs(bus.foldTarget - bus.fold) > 0.002
    if (bus.onCorners && group.current) {
      const gx = group.current.position.x
      const gy = group.current.position.y
      const k = turned.lastIndexOf(true)
      const r = turned.indexOf(false)
      const proj = (x: number, y: number, z: number): [number, number] => {
        v.set(x + gx, y + gy, z).project(camera)
        return [((v.x + 1) / 2) * size.width, ((1 - v.y) / 2) * size.height]
      }
      let left: [number, number][] | null = null
      let right: [number, number][] | null = null
      if (pc > 0.999) {
        if (k >= 0) {
          const y = COVER_T + LEAF_T * (k + 0.5)
          left = [proj(-PW, y, -PH / 2), proj(0, y, -PH / 2), proj(0, y, PH / 2), proj(-PW, y, PH / 2)]
        }
        if (r >= 0) {
          let above = 0
          for (let j = r + 1; j < L; j++) if (!turned[j]) above++
          const y = COVER_T + LEAF_T * (above + 0.5)
          right = [proj(0, y, -PH / 2), proj(PW, y, -PH / 2), proj(PW, y, PH / 2), proj(0, y, PH / 2)]
        }
      }
      const wide =
        foldOn && bus.fold > 0.999
          ? [proj(PW, topR + 0.003, -PH / 2), proj(3 * PW, topR + 0.003, -PH / 2), proj(3 * PW, topR + 0.003, PH / 2), proj(PW, topR + 0.003, PH / 2)]
          : null
      bus.onCorners(left, right, !anyMoving, wide)
    }
    void clock
  })

  return (
    <group>
      {/* weicher Schatten unter dem Buch, Licht von links oben */}
      <mesh ref={shadow} rotation-x={-Math.PI / 2} position={[0.045, 0.0004, 0.06]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={shadowTex} transparent opacity={0.5} depthWrite={false} toneMapped={false} />
      </mesh>
      <group ref={group}>
        {/* hintere Buchdecke */}
        <mesh geometry={board} material={backMat} position={[0, 0, 0]} />
        {/* Papierkanten rechts und links */}
        <mesh ref={edgeR} position={[PW / 2, COVER_T, 0]} material={paperEdge}>
          <boxGeometry args={[PW - 0.004, 1, PH - 0.004]} />
        </mesh>
        <mesh ref={edgeL} position={[-PW / 2, COVER_T, 0]} material={paperEdge}>
          <boxGeometry args={[PW - 0.004, 1, PH - 0.004]} />
        </mesh>
        {leafGeoms.map((g, i) => (
          <Leaf key={i} bus={bus} index={i} geom={g} />
        ))}
        {/* Ausklappseite: Flügel A an der Außenkante, Flügel B an A */}
        <group ref={foldA} visible={false}>
          <mesh geometry={panelGeom} material={foldMatA} />
          <mesh geometry={panelGeom} material={foldBack} />
          <group ref={foldB} position={[PW, 0.002, 0]}>
            <mesh geometry={panelGeom} material={foldMatB} />
            <mesh geometry={panelGeom} material={foldBack} />
          </group>
        </group>
        <Ribbon bus={bus} />
        <mesh ref={turnShade} rotation-x={-Math.PI / 2} visible={false}>
          <planeGeometry args={[PW, PH]} />
          <meshBasicMaterial color="#3a2f22" transparent opacity={0} depthWrite={false} toneMapped={false} />
        </mesh>
        {/* vordere Buchdecke: außen Leinen mit Prägung, innen Leinen (Vorsatz) */}
        <group ref={frontCover}>
          <mesh
            geometry={board}
            material={coverInside}
            onClick={(e) => {
              e.stopPropagation()
              onOpen()
            }}
            onPointerOver={() => (bus.hoverBookTarget = bus.openTarget < 0.5 ? 1 : 0)}
            onPointerOut={() => (bus.hoverBookTarget = 0)}
          />
          {/* Außenseite mit Prägung */}
          <mesh geometry={faceGeom} material={coverMat} rotation-x={-Math.PI / 2} position={[COVER_W / 2, COVER_T + 0.0065, 0]} />
        </group>
      </group>
    </group>
  )
}

/* ------------------------------------------------------------------------------------------ Kamera */

function Rig({ bus }: { bus: SceneBus }) {
  const { camera, size } = useThree()
  useFrame((_, delta) => {
    // weich gedämpfte Neigung zur Maus, höchstens etwa 2,5 Grad
    bus.tilt.x += (bus.pointer.x * 2.5 - bus.tilt.x) * damp(2.4, delta)
    bus.tilt.y += (bus.pointer.y * 2.0 - bus.tilt.y) * damp(2.4, delta)
    const aspect = size.width / size.height
    // Geschlossen: der ganze Schreibtisch mit Deko im Bild. Aufgeschlagen: Die Kamera fährt an die Doppelseite heran.
    const fov = ((camera as THREE.PerspectiveCamera).fov * Math.PI) / 180
    const fit = (w: number, h: number) => Math.max(h / 2 / Math.tan(fov / 2), w / 2 / Math.tan(fov / 2) / aspect)
    const closed = fit(aspect > 1.2 ? 4.4 : COVER_W / 0.6, COVER_H / 0.58)
    // Ausgeklappt: Kamera zoomt leicht heraus und rückt zur Mitte der vier Seitenbreiten
    const open = fit((2 * COVER_W + 2 * PW * bus.fold) / 0.66, COVER_H / 0.74) * 1.02
    const e = bus.open * bus.open * (3 - 2 * bus.open)
    const dist = closed + (open - closed) * e
    const cx = PW * bus.fold
    const tiltBase = THREE.MathUtils.degToRad(12)
    const ax = tiltBase + THREE.MathUtils.degToRad(-bus.tilt.y)
    const ay = THREE.MathUtils.degToRad(bus.tilt.x)
    camera.position.set(cx + Math.sin(ay) * dist * Math.cos(ax), Math.cos(ax) * dist, Math.sin(ax) * dist)
    camera.lookAt(cx, 0, 0.02)
  })
  return null
}

/* ------------------------------------------------------------------------------------------ Gesamte Szene */

export function Scene3D({ bus, onOpen, onCreated, active = true }: { bus: SceneBus; onOpen: () => void; onCreated?: () => void; active?: boolean }) {
  const table = useTexture(tableFile(false))
  const key = mappeAsset('schluessel')
  const card = mappeAsset('visitenkarte')
  const plant = mappeAsset('pflanze')
  const coffee = mappeAsset('kaffee')
  const pen = mappeAsset('stift')
  const steam = () => {
    if (bus.steamAt < 0 || performance.now() / 1000 - bus.steamAt > 3) bus.steamAt = performance.now() / 1000
  }
  return (
    <Canvas
      flat
      frameloop={active ? 'always' : 'never'}
      dpr={[1, 2]}
      camera={{ fov: 26, near: 0.1, far: 40, position: [0, 6, 1] }}
      gl={{ antialias: true, powerPreference: 'high-performance', preserveDrawingBuffer: true }}
      onCreated={({ gl }) => {
        gl.setClearColor(table ? '#8a6440' : '#e4ded4')
        onCreated?.()
      }}
      onPointerMove={(e) => {
        const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
        bus.pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1
        bus.pointer.y = ((e.clientY - r.top) / r.height) * 2 - 1
      }}
    >
      <ambientLight intensity={0.95} />
      <directionalLight position={[-2.2, 4, -1.6]} intensity={1.6} />
      <Rig bus={bus} />
      <Table tex={table} />
      <Book bus={bus} onOpen={onOpen} />
      {/* Deko an natürlichen Plätzen: Pflanze links oben, Kaffee rechts oben, Stift links, Schlüssel und Visitenkarte rechts unten.
          Fotos, sobald vorhanden; sonst modellierte Tasse und Stift. */}
      {plant && <PhotoObject bus={bus} name="pflanze" url={plant.file} w={0.62} x={-1.72} z={-0.68} rot={0} y={0.004} />}
      {coffee ? (
        <>
          <PhotoObject bus={bus} name="kaffee" url={coffee.file} w={0.78} x={1.74} z={-0.6} rot={0.2} y={0.004} onHover={steam} />
          <Steam bus={bus} x={1.7} z={-0.66} />
        </>
      ) : (
        <Coffee bus={bus} x={1.72} z={-0.62} />
      )}
      {pen ? <PhotoObject bus={bus} name="stift" url={pen.file} w={0.72} x={-1.62} z={0.32} rot={-0.12} y={0.003} /> : <Pen x={-1.62} z={0.18} rot={0.42} />}
      {key && <PhotoObject bus={bus} name="schluessel" url={key.file} w={0.42} x={1.62} z={0.5} rot={-0.35} y={0.003} />}
      {card && <PhotoObject bus={bus} name="visitenkarte" url={card.file} w={0.5} x={1.5} z={0.86} rot={0.12} y={0.002} />}
    </Canvas>
  )
}

/* ------------------------------------------------------------------------------------------ Steuerung */

export function useBookControls(bus: SceneBus, pages: number, onTurn?: () => void) {
  const leaves = bus.leaves
  const maxSpread = pages % 2 === 1 ? leaves - 1 : leaves
  const spreadRef = useRef(-1)
  const [spread, setSpread] = useState(-1)
  /** Gepufferte Ziele: Während eine Animation läuft, werden neue Befehle gesammelt und danach der Reihe nach ausgeführt */
  const queue = useRef<number[]>([])

  const animate = useCallback(
    (entry: number, to: number, delay = 0, dur = 1050) => {
      const from = bus.progress[entry]
      const cur = bus.anims.get(entry)
      const start = performance.now() + delay
      bus.anims.set(entry, { from: cur ? from : bus.progress[entry], to, start, dur, dir: to > from ? 1 : -1 })
      bus.progress[entry] = to
    },
    [bus],
  )

  const run = useCallback(
    (target: number) => {
      const t = Math.max(-1, Math.min(maxSpread, target))
      const from = spreadRef.current
      if (t === from) return
      // Ausklappseite vor dem Blättern wieder einklappen
      bus.foldTarget = 0
      // Buchdecke
      if (from === -1 && t >= 0) {
        bus.openTarget = 1
        animate(0, 1, 0, 1300)
      }
      if (t === -1) bus.openTarget = 0
      // Blätter dazwischen fächern durch (gestaffelt, bei weiten Sprüngen schneller)
      const lo = Math.min(Math.max(from, 0), Math.max(t, 0))
      const hi = Math.max(Math.max(from, 0), Math.max(t, 0))
      const jumps = hi - lo
      const dur = jumps > 1 ? 820 : 1050
      const step = jumps > 1 ? 110 : 0
      // leichtes Blatt (Pergament): schneller
      const d = (leaf: number) => (bus.light.has(leaf) && jumps <= 1 ? 640 : dur)
      if (t > from) {
        for (let i = Math.max(from, 0); i < t; i++) animate(i + 1, 1, (from === -1 ? 520 : 0) + (i - Math.max(from, 0)) * step, d(i + 1))
      } else {
        for (let i = Math.max(from, 0) - 1; i >= Math.max(t, 0); i--) animate(i + 1, 0, (Math.max(from, 0) - 1 - i) * step, d(i + 1))
        if (t === -1) animate(0, 0, jumps * step + 80, 1200)
      }
      spreadRef.current = t
      setSpread(t)
      onTurn?.()
    },
    [animate, bus, maxSpread, onTurn],
  )

  // Läuft etwas (Blättern, Ziehen, Ausklappseite offen)? Dann wird gepuffert; eine offene Ausklappseite klappt zuerst ein
  const busy = useCallback(() => {
    if (bus.fold > 0.01) bus.foldTarget = 0
    return bus.anims.size > 0 || !!bus.drag || bus.fold > 0.01
  }, [bus])

  // Puffer abarbeiten, sobald nichts mehr läuft
  useEffect(() => {
    const id = window.setInterval(() => {
      if (!queue.current.length || busy()) return
      run(queue.current.shift()!)
    }, 60)
    return () => window.clearInterval(id)
  }, [busy, run])

  /** Zu einer Doppelseite blättern (absolut, z. B. aus dem Inhaltsverzeichnis): ersetzt gepufferte Befehle */
  const goTo = useCallback(
    (target: number) => {
      if (busy()) queue.current = [target]
      else {
        queue.current = []
        run(target)
      }
    },
    [busy, run],
  )

  /** Eine Doppelseite vor oder zurück; während einer Animation gepuffert */
  const step = useCallback(
    (dir: 1 | -1) => {
      const base = queue.current.length ? queue.current[queue.current.length - 1] : spreadRef.current
      const t = Math.max(-1, Math.min(maxSpread, base + dir))
      if (t === base) return
      if (busy()) queue.current.push(t)
      else run(t)
    },
    [busy, maxSpread, run],
  )

  /**
   * Ziehen: Fortschritt des obersten Blatts direkt setzen (die Seite folgt Finger bzw. Maus).
   * Beim Loslassen entscheiden Weg (über 35 %) oder Geschwindigkeit über Umblättern oder Zurückfedern.
   */
  const drag = useCallback(
    (side: 'left' | 'right', p: number | null, velocity = 0) => {
      const s = spreadRef.current
      if (s < 0) return
      const leaf = side === 'right' ? s + 1 : s
      if (side === 'right' && s >= maxSpread) return
      if (side === 'left' && s <= 0) return
      if (p === null) {
        const d = bus.drag
        bus.drag = null
        if (!d) return
        const fling = side === 'right' ? velocity < -0.5 : velocity > 0.5
        const back = side === 'right' ? velocity > 0.5 : velocity < -0.5
        const done = !back && (fling || (side === 'right' ? d.p > 0.35 : d.p < 0.65))
        bus.progress[leaf] = d.p
        const rest = side === 'right' ? 1 - d.p : d.p
        if (done) {
          spreadRef.current = side === 'right' ? s + 1 : s - 1
          setSpread(spreadRef.current)
          animate(leaf, side === 'right' ? 1 : 0, 0, 260 + rest * 520)
          onTurn?.()
        } else animate(leaf, side === 'right' ? 0 : 1, 0, 220 + (1 - rest) * 420)
        return
      }
      bus.foldTarget = 0
      bus.drag = { leaf, p: Math.max(0, Math.min(1, p)), dir: side === 'right' ? 1 : -1 }
    },
    [animate, bus, maxSpread, onTurn],
  )

  return { spread, goTo, step, drag, maxSpread, spreadRef } as const
}

export type BookControls = ReturnType<typeof useBookControls>

/** Seitenecken in Bildschirmkoordinaten → CSS-Transform für die HTML-Seiten */
export function cornersToTransform(c: [number, number][]) {
  return quadMatrix(PAGE_W, PAGE_H, c)
}

export type CornersRef = MutableRefObject<{ left: [number, number][] | null; right: [number, number][] | null; still: boolean }>
