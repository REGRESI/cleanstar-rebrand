import { useEffect, useLayoutEffect, useMemo, useRef, useState, type MutableRefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import type { DeviceTier } from '@/lib/env'

/**
 * 3D-Hero: stilisiertes Bürogebäude, prozedural modelliert (kein GLB).
 * Beim Scrollen fährt die Kamera in eine Etage. Ein Licht-Scan läuft durch den Raum
 * und verwandelt ihn von „staubig, unordentlich“ zu „makellos“.
 *
 * progress.current: 0 … 1 (Scrollfortschritt der Hero-Sektion)
 */
export interface HeroSceneProps {
  progress: MutableRefObject<number>
  tier: DeviceTier
  active: boolean
  onReady?: () => void
}

/* ---------- Gebäudemaße ---------- */
const W = 12 // Breite (x)
const D = 8 // Tiefe (z)
const FLOOR_H = 3
const FLOORS = 5
const TARGET = 1 // Etage, in die die Kamera fährt (0 = EG)
const FY = TARGET * FLOOR_H // Fußboden der Zieletage
const SCAN_START = D / 2 + 0.4
const SCAN_END = -D / 2 - 0.6

/* ---------- Shader-Bausteine ---------- */
type Uniforms = { uScan: { value: number }; uScanGlow: { value: number }; uTime: { value: number } }

const NOISE = /* glsl */ `
  varying vec3 vWPos;
  uniform float uScan;
  uniform float uScanGlow;
  uniform float uTime;
  float csHash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
  float csNoise(vec2 p){
    vec2 i = floor(p); vec2 f = fract(p);
    float a = csHash(i), b = csHash(i + vec2(1.0, 0.0)), c = csHash(i + vec2(0.0, 1.0)), d = csHash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }
  float csClean(){ return smoothstep(uScan - 0.35, uScan + 0.35, vWPos.z); }
`

/** Erweitert ein Standard-Material um den Schmutz-/Sauber-Übergang entlang des Scans. */
function dirtify(mat: THREE.MeshStandardMaterial, u: Uniforms) {
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, u)
    shader.vertexShader = shader.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWPos;').replace(
      '#include <project_vertex>',
      `#include <project_vertex>
        vec4 csW = vec4(transformed, 1.0);
        #ifdef USE_INSTANCING
          csW = instanceMatrix * csW;
        #endif
        vWPos = (modelMatrix * csW).xyz;`,
    )
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>\n${NOISE}`)
      .replace(
        '#include <color_fragment>',
        `#include <color_fragment>
        float csC = csClean();
        float csN = csNoise(vWPos.xz * 3.1 + vWPos.y * 1.7) * 0.6 + csNoise(vWPos.xz * 11.0) * 0.4;
        float csL = dot(diffuseColor.rgb, vec3(0.299, 0.587, 0.114));
        float csBlot = smoothstep(0.35, 0.85, csNoise(vWPos.xz * 0.9 + 3.7));
        vec3 csDirty = mix(diffuseColor.rgb, vec3(csL) * vec3(1.0, 0.96, 0.88), 0.88) * (0.42 + 0.14 * csN - 0.14 * csBlot) + vec3(0.06, 0.045, 0.02) * csN;
        diffuseColor.rgb = mix(csDirty, diffuseColor.rgb * 1.06, csC);`,
      )
      .replace(
        '#include <roughnessmap_fragment>',
        `#include <roughnessmap_fragment>
        roughnessFactor = mix(1.0, roughnessFactor * 0.6, csC);`,
      )
      .replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
        float csBand = 1.0 - smoothstep(0.0, 0.22, abs(vWPos.z - uScan));
        totalEmissiveRadiance += vec3(0.18, 0.83, 0.75) * csBand * uScanGlow * 1.4;`,
      )
  }
  mat.customProgramCacheKey = () => 'cs-dirt'
  return mat
}

/** Material für Unordnung (Tassen, Papier): verschwindet, sobald der Scan vorbei ist. */
function clutterify(mat: THREE.MeshStandardMaterial, u: Uniforms) {
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, u)
    shader.vertexShader = shader.vertexShader.replace('#include <common>', '#include <common>\nuniform float uScan;').replace(
      '#include <begin_vertex>',
      `#include <begin_vertex>
        #ifdef USE_INSTANCING
          float csZ = (modelMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0)).z;
        #else
          float csZ = (modelMatrix * vec4(0.0, 0.0, 0.0, 1.0)).z;
        #endif
        float csK = 1.0 - smoothstep(uScan - 0.25, uScan + 0.25, csZ);
        transformed *= csK;`,
    )
  }
  mat.customProgramCacheKey = () => 'cs-clutter'
  return mat
}

/* ---------- Hilfen ---------- */
type Item = { p: [number, number, number]; s?: [number, number, number]; r?: number }

function Inst({ geo, mat, items }: { geo: THREE.BufferGeometry; mat: THREE.Material; items: Item[] }) {
  const ref = useRef<THREE.InstancedMesh>(null)
  useLayoutEffect(() => {
    const m = ref.current
    if (!m) return
    const o = new THREE.Object3D()
    items.forEach((it, i) => {
      o.position.set(...it.p)
      o.scale.set(...(it.s ?? [1, 1, 1]))
      o.rotation.set(0, it.r ?? 0, 0)
      o.updateMatrix()
      m.setMatrixAt(i, o.matrix)
    })
    m.instanceMatrix.needsUpdate = true
    m.computeBoundingSphere()
  }, [items])
  return <instancedMesh ref={ref} args={[geo, mat, items.length]} frustumCulled={false} />
}

const rand = (seed: number) => {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

/* ---------- Umgebung (Reflexionen ohne externe HDR-Datei) ---------- */
function Env() {
  const { gl, scene } = useThree()
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl)
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environment = env
    return () => {
      env.dispose()
      pmrem.dispose()
    }
  }, [gl, scene])
  return null
}

/* ---------- Gebäude außen ---------- */
function Building({ glassFront }: { glassFront: MutableRefObject<THREE.MeshPhysicalMaterial | null> }) {
  const mats = useMemo(
    () => ({
      slab: new THREE.MeshStandardMaterial({ color: '#e4eaf3', roughness: 0.6 }),
      frame: new THREE.MeshStandardMaterial({ color: '#13223b', roughness: 0.4, metalness: 0.4 }),
      glass: new THREE.MeshPhysicalMaterial({ color: '#6f95d6', roughness: 0.05, metalness: 0.2, transparent: true, opacity: 0.5, envMapIntensity: 1.2, depthWrite: false }),
      glassFront: new THREE.MeshPhysicalMaterial({ color: '#6f95d6', roughness: 0.05, metalness: 0.2, transparent: true, opacity: 0.42, envMapIntensity: 1.2, depthWrite: false }),
      lit: new THREE.MeshStandardMaterial({ color: '#0d1a30', emissive: '#cfe0ff', emissiveIntensity: 0.4 }),
      core: new THREE.MeshStandardMaterial({ color: '#c3cfe0', roughness: 0.85 }),
    }),
    [],
  )
  glassFront.current = mats.glassFront
  const box = useMemo(() => new THREE.BoxGeometry(1, 1, 1), [])
  const plane = useMemo(() => new THREE.PlaneGeometry(1, 1), [])

  const slabs: Item[] = useMemo(() => Array.from({ length: FLOORS + 1 }, (_, i) => ({ p: [0, i * FLOOR_H, 0], s: [W + 0.4, 0.18, D + 0.4] })), [])
  const mullions: Item[] = useMemo(() => {
    const out: Item[] = []
    const cols = 7
    for (let i = 0; i <= cols; i++) {
      const x = -W / 2 + (W / cols) * i
      out.push({ p: [x, (FLOORS * FLOOR_H) / 2, D / 2 + 0.02], s: [0.07, FLOORS * FLOOR_H, 0.12] })
      out.push({ p: [x, (FLOORS * FLOOR_H) / 2, -D / 2 - 0.02], s: [0.07, FLOORS * FLOOR_H, 0.12] })
    }
    for (let i = 0; i <= 5; i++) {
      const z = -D / 2 + (D / 5) * i
      out.push({ p: [W / 2 + 0.02, (FLOORS * FLOOR_H) / 2, z], s: [0.12, FLOORS * FLOOR_H, 0.07] })
      out.push({ p: [-W / 2 - 0.02, (FLOORS * FLOOR_H) / 2, z], s: [0.12, FLOORS * FLOOR_H, 0.07] })
    }
    return out
  }, [])
  const glass: Item[] = useMemo(() => {
    const out: Item[] = []
    for (let f = 0; f < FLOORS; f++) {
      const y = f * FLOOR_H + FLOOR_H / 2
      if (f !== TARGET) out.push({ p: [0, y, D / 2], s: [W, FLOOR_H - 0.18, 1] })
      out.push({ p: [0, y, -D / 2], s: [W, FLOOR_H - 0.18, 1], r: Math.PI })
      out.push({ p: [W / 2, y, 0], s: [D, FLOOR_H - 0.18, 1], r: Math.PI / 2 })
      out.push({ p: [-W / 2, y, 0], s: [D, FLOOR_H - 0.18, 1], r: -Math.PI / 2 })
    }
    return out
  }, [])
  // beleuchtete „Innenräume“ der anderen Etagen
  const lit: Item[] = useMemo(() => {
    const out: Item[] = []
    const r = rand(7)
    for (let f = 0; f < FLOORS; f++) {
      if (f === TARGET) continue
      for (let i = 0; i < 7; i++) {
        if (r() < 0.35) continue
        out.push({ p: [-W / 2 + W / 14 + (W / 7) * i, f * FLOOR_H + 1.5, D / 2 - 0.6], s: [W / 7 - 0.25, 1.6, 1] })
      }
    }
    return out
  }, [])

  return (
    <group>
      <Inst geo={box} mat={mats.slab} items={slabs} />
      <Inst geo={box} mat={mats.frame} items={mullions} />
      <Inst geo={plane} mat={mats.glass} items={glass} />
      <Inst geo={plane} mat={mats.lit} items={lit} />
      {/* Kern auf den anderen Etagen, damit das Gebäude nicht hohl wirkt */}
      {Array.from({ length: FLOORS }, (_, f) =>
        f === TARGET ? null : <mesh key={f} geometry={box} material={mats.core} position={[0, f * FLOOR_H + 1, -0.5]} scale={[W - 1.2, FLOOR_H - 0.2, D - 2.2]} />,
      )}
      {/* Glasfront der Zieletage (wird beim Durchfahren ausgeblendet) */}
      <mesh geometry={plane} material={mats.glassFront} position={[0, FY + FLOOR_H / 2, D / 2]} scale={[W, FLOOR_H - 0.18, 1]} />
      {/* Dachkante */}
      <mesh geometry={box} material={mats.frame} position={[0, FLOORS * FLOOR_H + 0.2, 0]} scale={[W + 0.5, 0.25, D + 0.5]} />
    </group>
  )
}

/* ---------- Büroetage innen ---------- */
function Office({ u, tier }: { u: Uniforms; tier: DeviceTier }) {
  const geo = useMemo(
    () => ({
      box: new THREE.BoxGeometry(1, 1, 1),
      cyl: new THREE.CylinderGeometry(0.5, 0.5, 1, 14),
      cup: new THREE.CylinderGeometry(0.045, 0.035, 0.1, 10),
      paper: new THREE.IcosahedronGeometry(0.07, 0),
      leaf: new THREE.IcosahedronGeometry(0.42, 1),
      plane: new THREE.PlaneGeometry(1, 1),
    }),
    [],
  )
  const m = useMemo(
    () => ({
      floor: dirtify(new THREE.MeshStandardMaterial({ color: '#b9c5d6', roughness: 0.22, metalness: 0.05 }), u),
      wall: dirtify(new THREE.MeshStandardMaterial({ color: '#dfe6f0', roughness: 0.75 }), u),
      ceiling: dirtify(new THREE.MeshStandardMaterial({ color: '#f1f4f9', roughness: 0.9, emissive: '#ffffff', emissiveIntensity: 0.32 }), u),
      desk: dirtify(new THREE.MeshStandardMaterial({ color: '#f2f5f9', roughness: 0.3 }), u),
      metal: dirtify(new THREE.MeshStandardMaterial({ color: '#8a96a8', roughness: 0.35, metalness: 0.7 }), u),
      screen: dirtify(new THREE.MeshStandardMaterial({ color: '#0e1a2e', roughness: 0.15, metalness: 0.3 }), u),
      chair: dirtify(new THREE.MeshStandardMaterial({ color: '#1f5eff', roughness: 0.6 }), u),
      pot: dirtify(new THREE.MeshStandardMaterial({ color: '#e7ecf3', roughness: 0.6 }), u),
      green: dirtify(new THREE.MeshStandardMaterial({ color: '#3fae8c', roughness: 0.75, flatShading: true }), u),
      cup: clutterify(new THREE.MeshStandardMaterial({ color: '#f1e7d8', roughness: 0.5 }), u),
      paper: clutterify(new THREE.MeshStandardMaterial({ color: '#e9e4d8', roughness: 0.9, flatShading: true }), u),
      panel: new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: '#eaf2ff', emissiveIntensity: 0.9 }),
      wood: dirtify(new THREE.MeshStandardMaterial({ color: '#c8a985', roughness: 0.55 }), u),
    }),
    [u],
  )

  const layout = useMemo(() => {
    const cols = [-4.1, -2.05, 2.05, 4.1]
    const rows = tier === 'low' ? [1.2, -1.6] : [1.4, -0.6, -2.6]
    const top = FY + 0.1 + 0.74
    const desks: Item[] = []
    const legs: Item[] = []
    const screens: Item[] = []
    const stands: Item[] = []
    const seats: Item[] = []
    const backs: Item[] = []
    const cups: Item[] = []
    const papers: Item[] = []
    const r = rand(42)
    rows.forEach((z) =>
      cols.forEach((x) => {
        desks.push({ p: [x, top, z], s: [1.6, 0.05, 0.8] })
        for (const dx of [-0.74, 0.74]) for (const dz of [-0.34, 0.34]) legs.push({ p: [x + dx, FY + 0.1 + 0.37, z + dz], s: [0.04, 0.74, 0.04] })
        screens.push({ p: [x, top + 0.3, z - 0.28], s: [0.62, 0.38, 0.03] })
        stands.push({ p: [x, top + 0.08, z - 0.3], s: [0.05, 0.16, 0.05] })
        seats.push({ p: [x, FY + 0.55, z + 0.72], s: [0.5, 0.07, 0.48] })
        backs.push({ p: [x, FY + 0.88, z + 0.95], s: [0.5, 0.55, 0.06] })
        cups.push({ p: [x + 0.45 + r() * 0.2, top + 0.075, z + 0.1 + r() * 0.15] })
        if (r() > 0.4) cups.push({ p: [x - 0.5 - r() * 0.2, top + 0.075, z + 0.18] })
        papers.push({ p: [x - 0.2 + r() * 0.5, top + 0.06, z + 0.15], r: r() * 3 })
        papers.push({ p: [x + (r() - 0.5) * 1.8, FY + 0.16, z + 1.2 + r() * 0.5], r: r() * 3 })
      }),
    )
    const pots: Item[] = [
      { p: [-W / 2 + 0.6, FY + 0.35, -D / 2 + 0.6], s: [0.5, 0.5, 0.5] },
      { p: [W / 2 - 0.6, FY + 0.35, -D / 2 + 0.6], s: [0.5, 0.5, 0.5] },
      { p: [-W / 2 + 0.6, FY + 0.35, 0.6], s: [0.5, 0.5, 0.5] },
      { p: [W / 2 - 0.6, FY + 0.35, 0.6], s: [0.5, 0.5, 0.5] },
    ]
    const leaves: Item[] = pots.map((p) => ({ p: [p.p[0], FY + 1.0, p.p[2]], s: [1, 1.35, 1] }))
    const panels: Item[] = []
    for (const x of [-3.5, 0, 3.5]) for (const z of [2.2, -0.4, -3]) panels.push({ p: [x, FY + FLOOR_H - 0.12, z], s: [1.8, 0.03, 0.5] })
    return { desks, legs, screens, stands, seats, backs, cups, papers, pots, leaves, panels }
  }, [tier])

  return (
    <group>
      {/* Boden, Decke, Wände */}
      <mesh geometry={geo.plane} material={m.floor} position={[0, FY + 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[W - 0.1, D - 0.1, 1]} />
      <mesh geometry={geo.plane} material={m.ceiling} position={[0, FY + FLOOR_H - 0.1, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[W - 0.1, D - 0.1, 1]} />
      <mesh geometry={geo.box} material={m.wood} position={[0, FY + 0.5, -D / 2 + 0.45]} scale={[5, 0.8, 0.5]} />
      <mesh geometry={geo.box} material={m.wall} position={[-W / 2 + 0.08, FY + FLOOR_H / 2, -1]} scale={[0.12, FLOOR_H - 0.2, 4]} />
      <Inst geo={geo.box} mat={m.desk} items={layout.desks} />
      <Inst geo={geo.box} mat={m.metal} items={layout.legs} />
      <Inst geo={geo.box} mat={m.screen} items={layout.screens} />
      <Inst geo={geo.box} mat={m.metal} items={layout.stands} />
      <Inst geo={geo.box} mat={m.chair} items={layout.seats} />
      <Inst geo={geo.box} mat={m.chair} items={layout.backs} />
      <Inst geo={geo.cyl} mat={m.pot} items={layout.pots} />
      <Inst geo={geo.leaf} mat={m.green} items={layout.leaves} />
      <Inst geo={geo.cup} mat={m.cup} items={layout.cups} />
      <Inst geo={geo.paper} mat={m.paper} items={layout.papers} />
      <Inst geo={geo.box} mat={m.panel} items={layout.panels} />
    </group>
  )
}

/* ---------- Staubpartikel und Funkeln entlang des Scans ---------- */
function Particles({ u, count }: { u: Uniforms; count: number }) {
  const { geometry, material } = useMemo(() => {
    const r = rand(99)
    const pos = new Float32Array(count * 3)
    const kind = new Float32Array(count)
    const seed = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      const sparkle = i % 5 === 0
      pos[i * 3] = (r() - 0.5) * (W - 0.6)
      pos[i * 3 + 1] = FY + 0.2 + r() * (sparkle ? 1.1 : FLOOR_H - 0.4)
      pos[i * 3 + 2] = (r() - 0.5) * (D - 0.4)
      kind[i] = sparkle ? 1 : 0
      seed[i] = r() * 100
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aKind', new THREE.BufferAttribute(kind, 1))
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { ...u, uPix: { value: Math.min(2, typeof window !== 'undefined' ? window.devicePixelRatio : 1) } },
      vertexShader: /* glsl */ `
        attribute float aKind; attribute float aSeed;
        uniform float uScan; uniform float uTime; uniform float uPix;
        varying float vA; varying float vK;
        void main(){
          vec3 p = position;
          p.x += sin(uTime * 0.3 + aSeed) * 0.15;
          p.y += sin(uTime * 0.4 + aSeed * 1.7) * 0.12;
          p.z += cos(uTime * 0.25 + aSeed) * 0.12;
          float clean = smoothstep(uScan - 0.3, uScan + 0.3, p.z);
          float band = 1.0 - smoothstep(0.0, 0.6, abs(p.z - uScan));
          vA = aKind > 0.5 ? band * (0.6 + 0.4 * sin(uTime * 6.0 + aSeed)) : (1.0 - clean) * 0.75;
          vK = aKind;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_PointSize = (aKind > 0.5 ? 38.0 : 22.0) * uPix / -mv.z;
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: /* glsl */ `
        varying float vA; varying float vK;
        void main(){
          vec2 c = gl_PointCoord - 0.5;
          float d = length(c);
          float a;
          vec3 col;
          if (vK > 0.5) {
            float star = max(0.0, 1.0 - abs(c.x) * 14.0) * max(0.0, 1.0 - abs(c.y) * 2.2) + max(0.0, 1.0 - abs(c.y) * 14.0) * max(0.0, 1.0 - abs(c.x) * 2.2);
            a = (star + smoothstep(0.25, 0.0, d)) * vA;
            col = vec3(0.75, 1.0, 0.97);
          } else {
            a = smoothstep(0.5, 0.1, d) * vA;
            col = vec3(0.78, 0.72, 0.62);
          }
          if (a < 0.01) discard;
          gl_FragColor = vec4(col, a);
        }`,
    })
    return { geometry: g, material: mat }
  }, [count, u])
  return <points geometry={geometry} material={material} frustumCulled={false} />
}

/* ---------- Leuchtende Scan-Fläche ---------- */
function ScanSheet({ u }: { u: Uniforms }) {
  const ref = useRef<THREE.Mesh>(null)
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        uniforms: u,
        vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
        fragmentShader: `
          varying vec2 vUv; uniform float uScanGlow; uniform float uTime;
          void main(){
            float edge = smoothstep(0.0, 0.08, vUv.x) * smoothstep(1.0, 0.92, vUv.x);
            float v = smoothstep(0.0, 0.15, vUv.y) * smoothstep(1.0, 0.7, vUv.y);
            gl_FragColor = vec4(vec3(0.3, 0.9, 0.85), 0.07 * edge * v * uScanGlow);
          }`,
      }),
    [u],
  )
  useFrame(() => {
    if (ref.current) ref.current.position.z = u.uScan.value
  })
  return (
    <mesh ref={ref} material={mat} position={[0, FY + FLOOR_H / 2, SCAN_START]}>
      <planeGeometry args={[W - 0.3, FLOOR_H - 0.2]} />
    </mesh>
  )
}

/* ---------- Umgebung: Platz und Bäume ---------- */
function Grounds({ tier }: { tier: DeviceTier }) {
  const mats = useMemo(
    () => ({
      ground: new THREE.MeshStandardMaterial({ color: '#e8eef7', roughness: 0.95 }),
      path: new THREE.MeshStandardMaterial({ color: '#f7f9fc', roughness: 0.9 }),
      trunk: new THREE.MeshStandardMaterial({ color: '#7d8796' }),
      crown: new THREE.MeshStandardMaterial({ color: '#8fd1bd', roughness: 0.85, flatShading: true }),
    }),
    [],
  )
  const geo = useMemo(() => ({ crown: new THREE.IcosahedronGeometry(1, 0), trunk: new THREE.CylinderGeometry(0.08, 0.1, 1, 6), box: new THREE.BoxGeometry(1, 1, 1) }), [])
  const trees: Item[] = useMemo(() => {
    const base: [number, number][] = [
      [-9.5, 6],
      [-11, -2],
      [9.8, 7],
      [11.5, -1.5],
      [-8, 11],
      [13, 10],
    ]
    return (tier === 'low' ? base.slice(0, 4) : base).map(([x, z], i) => ({ p: [x, 1.7, z], s: [0.9 + (i % 3) * 0.2, 1.3, 0.9 + (i % 2) * 0.2] }))
  }, [tier])
  return (
    <group>
      <mesh material={mats.ground} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <planeGeometry args={[160, 160]} />
      </mesh>
      <mesh geometry={geo.box} material={mats.path} position={[0, -0.08, 10]} scale={[3.2, 0.02, 12]} />
      <mesh geometry={geo.box} material={mats.path} position={[0, -0.08, 0]} scale={[W + 4, 0.02, D + 4]} />
      <Inst geo={geo.crown} mat={mats.crown} items={trees} />
      <Inst geo={geo.trunk} mat={mats.trunk} items={trees.map((t) => ({ p: [t.p[0], 0.5, t.p[2]] as [number, number, number] }))} />
    </group>
  )
}

/* ---------- Kamera-Fahrt ---------- */
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

function Rig({
  progress,
  glassFront,
  u,
  onReady,
}: {
  progress: MutableRefObject<number>
  glassFront: MutableRefObject<THREE.MeshPhysicalMaterial | null>
  u: Uniforms
  onReady?: () => void
}) {
  const { camera, size } = useThree()
  const portrait = size.width / size.height < 0.9
  const curves = useMemo(() => {
    const k = portrait ? 1.75 : 1
    const pos = new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(19 * k, 12 * k, 27 * k),
        new THREE.Vector3(10 * k, FY + 4, 16 * k),
        new THREE.Vector3(1.4, FY + 1.9, D / 2 + 3.4),
        new THREE.Vector3(0.15, FY + 1.95, D / 2 + 0.2),
        new THREE.Vector3(-0.1, FY + 2.0, D / 2 - 0.55),
      ],
      false,
      'centripetal',
    )
    const look = new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(0, 6.5, 0),
        new THREE.Vector3(0, FY + 1.6, 0),
        new THREE.Vector3(0, FY + 1.1, -2),
        new THREE.Vector3(0, FY + 0.7, -3.2),
        new THREE.Vector3(0.5, FY + 0.6, -3.6),
      ],
      false,
      'centripetal',
    )
    if (portrait) {
      // Hochformat: diagonaler Blick über die Arbeitsplätze statt geradeaus
      pos.points[3].set(-0.6, FY + 2.0, D / 2 + 0.1)
      pos.points[4].set(-1.1, FY + 2.15, D / 2 - 0.7)
      look.points[3].set(1.2, FY + 0.8, -2.6)
      look.points[4].set(2.4, FY + 0.6, -2.4)
    }
    return { pos, look }
  }, [portrait])
  const smooth = useRef(progress.current)
  const lookV = useMemo(() => new THREE.Vector3(), [])
  const ready = useRef(false)

  useFrame((state, delta) => {
    smooth.current += (progress.current - smooth.current) * Math.min(1, delta * 5)
    const p = smooth.current
    // Kamera: 0 … 0.6 der Scrollstrecke
    const tc = ease(clamp01(p / 0.6))
    curves.pos.getPoint(tc, camera.position)
    curves.look.getPoint(tc, lookV)
    if (portrait) lookV.y -= 0.45 * clamp01((tc - 0.5) / 0.4)
    // leichte Atmung, damit die Szene lebt
    camera.position.y += Math.sin(state.clock.elapsedTime * 0.5) * 0.03
    camera.lookAt(lookV)
    // Sichtfeld weitet sich beim Betreten der Etage
    const inside = clamp01((tc - 0.6) / 0.3)
    const cam0 = camera as THREE.PerspectiveCamera
    cam0.fov = THREE.MathUtils.lerp(portrait ? 60 : 40, portrait ? 78 : 62, inside)
    // Bildausschnitt verschieben: Platz für den Text (links auf Desktop, oben auf dem Handy)
    const free = 1 - clamp01(p / 0.32)
    const cam = camera as THREE.PerspectiveCamera
    if (portrait) cam.setViewOffset(size.width, size.height, 0, -size.height * 0.36 * free, size.width, size.height)
    else cam.setViewOffset(size.width, size.height, -size.width * 0.17 * free, 0, size.width, size.height)
    // Glasfront ausblenden, wenn die Kamera hindurchfährt
    if (glassFront.current) glassFront.current.opacity = 0.32 * (1 - clamp01((tc - 0.55) / 0.15))
    // Scan: 0.55 … 0.95 der Scrollstrecke
    const ts = clamp01((p - 0.55) / 0.4)
    u.uScan.value = THREE.MathUtils.lerp(SCAN_START, SCAN_END, ts)
    u.uScanGlow.value = Math.sin(Math.PI * clamp01(ts * 1.02))
    // Nach dem Scan wird es heller und klarer
    state.gl.toneMappingExposure = THREE.MathUtils.lerp(0.82, 1.05, ease(ts))
    u.uTime.value = state.clock.elapsedTime
    if (!ready.current) {
      ready.current = true
      requestAnimationFrame(() => onReady?.())
    }
  })
  return null
}

function Lights() {
  return (
    <>
      <hemisphereLight args={['#ffffff', '#b8c6dc', 0.55]} />
      <directionalLight position={[12, 22, 14]} intensity={1.5} color="#fff8f0" />
      <directionalLight position={[-10, 8, -8]} intensity={0.3} color="#bfd4ff" />
      <pointLight position={[0, FY + FLOOR_H - 0.4, 0.5]} intensity={4} distance={9} decay={1.6} color="#eef4ff" />
    </>
  )
}

export default function HeroScene({ progress, tier, active, onReady }: HeroSceneProps) {
  const u = useMemo<Uniforms>(() => ({ uScan: { value: SCAN_START }, uScanGlow: { value: 0 }, uTime: { value: 0 } }), [])
  const glassFront = useRef<THREE.MeshPhysicalMaterial | null>(null)
  const low = tier === 'low'
  const maxDpr = low ? 1.25 : 1.75
  // Automatische Vereinfachung: Fällt die Bildrate, sinken Auflösung und Partikel.
  const [dpr, setDpr] = useState(maxDpr)
  const [lite, setLite] = useState(low)
  return (
    <Canvas
      frameloop={active ? 'always' : 'never'}
      dpr={dpr}
      gl={{ antialias: !low, alpha: true, powerPreference: 'high-performance', stencil: false }}
      camera={{ fov: 42, near: 0.1, far: 200, position: [19, 12, 27] }}
      onCreated={({ gl, scene }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 0.92
        scene.fog = new THREE.Fog('#eef4fc', 40, 110)
        scene.environmentIntensity = 0.55
      }}
      aria-hidden
      style={{ position: 'absolute', inset: 0 }}
    >
      <PerformanceMonitor
        onDecline={() => {
          setDpr(1)
          setLite(true)
        }}
        onIncline={() => setDpr(maxDpr)}
      />
      <Env />
      <Lights />
      <Grounds tier={tier} />
      <Building glassFront={glassFront} />
      <Office u={u} tier={tier} />
      <Particles u={u} count={lite ? 160 : 520} />
      <ScanSheet u={u} />
      <Rig progress={progress} glassFront={glassFront} u={u} onReady={onReady} />
    </Canvas>
  )
}
