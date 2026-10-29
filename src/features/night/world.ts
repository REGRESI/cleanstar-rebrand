/**
 * Signatur-Szene „Eine Nacht in Ihrem Büro“: Echtzeit-3D im Stil eines Architekturmodells (three.js, ohne Fotos,
 * ohne Videos, ohne heruntergeladene Modelle). Alles hängt an einer Zeitquelle: setProgress(p) mit p aus dem
 * Nacht-Lineal (timeline.ts). Die Klasse kennt kein React und keinen Scroll; die Bühne (NightStage) steuert sie.
 */
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import {
  ALARM,
  buildGlass,
  buildLampHeads,
  buildPlanLines,
  buildScreens,
  buildStatic,
  chairGeo,
  chairs,
  checkpoints,
  cupGeo,
  cups,
  D,
  DOOR,
  H,
  islands,
  paperGeo,
  papers,
  W,
  desks,
} from './geometry'
import { PHASES, edgeX, sceneZones, smooth, span, zoneProgress } from './timeline'
import skyline from './skyline.json'

export type Quality = 'high' | 'low'

const lerp = THREE.MathUtils.lerp
const C = (hex: string) => new THREE.Color(hex)

/* ---------------------------------------------------------------------------------------------- Licht nach Uhrzeit */

type Look = {
  sunColor: THREE.Color
  sun: number
  sunElev: number
  hemiSky: THREE.Color
  hemiGround: THREE.Color
  hemi: number
  skyTop: THREE.Color
  skyHorizon: THREE.Color
  glow: THREE.Color
  ridge: THREE.Color
  exposure: number
  /** Stärke der Umgebungsreflexion (Studio-Licht) */
  env: number
}

// Stützstellen der Stimmung über p; dazwischen wird gemischt
const LOOKS: [number, Look][] = [
  [0, { sunColor: C('#ffb06a'), sun: 4.4, sunElev: 0.13, hemiSky: C('#f3d2b4'), hemiGround: C('#8f8277'), hemi: 0.5, skyTop: C('#5d78ab'), skyHorizon: C('#eeb98f'), glow: C('#ffc58a'), ridge: C('#4f5d7c'), exposure: 0.92, env: 0.16 }],
  [0.1, { sunColor: C('#ff9560'), sun: 3.2, sunElev: 0.08, hemiSky: C('#d9b7a8'), hemiGround: C('#7a6e6c'), hemi: 0.45, skyTop: C('#4d6496'), skyHorizon: C('#df9b82'), glow: C('#ffaf82'), ridge: C('#435071'), exposure: 0.92, env: 0.13 }],
  [0.2, { sunColor: C('#7d8fc8'), sun: 0.35, sunElev: 0.05, hemiSky: C('#33466e'), hemiGround: C('#1b2438'), hemi: 0.55, skyTop: C('#1b2a4a'), skyHorizon: C('#3e5480'), glow: C('#6c7fb0'), ridge: C('#18223a'), exposure: 0.95, env: 0.1 }],
  [0.3, { sunColor: C('#6f84c0'), sun: 0.15, sunElev: 0.05, hemiSky: C('#26365a'), hemiGround: C('#131a2b'), hemi: 0.42, skyTop: C('#0f1a33'), skyHorizon: C('#22345a'), glow: C('#3d5288'), ridge: C('#0d1426'), exposure: 1.0, env: 0.05 }],
  [0.72, { sunColor: C('#6f84c0'), sun: 0.15, sunElev: 0.05, hemiSky: C('#26365a'), hemiGround: C('#131a2b'), hemi: 0.42, skyTop: C('#0c1630'), skyHorizon: C('#1d2e52'), glow: C('#34497c'), ridge: C('#0b1224'), exposure: 1.0, env: 0.05 }],
  [0.84, { sunColor: C('#6f84c0'), sun: 0.12, sunElev: 0.03, hemiSky: C('#202f50'), hemiGround: C('#11182a'), hemi: 0.38, skyTop: C('#0a1430'), skyHorizon: C('#1a2b50'), glow: C('#2f4475'), ridge: C('#0a1122'), exposure: 1.0, env: 0.05 }],
  [0.9, { sunColor: C('#ffd3ad'), sun: 2.6, sunElev: 0.04, hemiSky: C('#b3c8e6'), hemiGround: C('#7d8896'), hemi: 0.45, skyTop: C('#6f95cc'), skyHorizon: C('#f7cfb2'), glow: C('#ffe0c0'), ridge: C('#3d4e72'), exposure: 0.95, env: 0.14 }],
  [1, { sunColor: C('#eef4ff'), sun: 3.6, sunElev: 0.12, hemiSky: C('#cfdff3'), hemiGround: C('#8e99a6'), hemi: 0.55, skyTop: C('#7fa6dd'), skyHorizon: C('#dde9f7'), glow: C('#fff1dc'), ridge: C('#5b6e92'), exposure: 0.92, env: 0.2 }],
]

function lookAt(p: number): Look {
  let i = 1
  while (i < LOOKS.length - 1 && p > LOOKS[i][0]) i++
  const [p0, a] = LOOKS[i - 1]
  const [p1, b] = LOOKS[i]
  const t = smooth(Math.min(1, Math.max(0, (p - p0) / (p1 - p0))))
  const mix = (x: THREE.Color, y: THREE.Color) => x.clone().lerp(y, t)
  return {
    sunColor: mix(a.sunColor, b.sunColor),
    sun: lerp(a.sun, b.sun, t),
    sunElev: lerp(a.sunElev, b.sunElev, t),
    hemiSky: mix(a.hemiSky, b.hemiSky),
    hemiGround: mix(a.hemiGround, b.hemiGround),
    hemi: lerp(a.hemi, b.hemi, t),
    skyTop: mix(a.skyTop, b.skyTop),
    skyHorizon: mix(a.skyHorizon, b.skyHorizon),
    glow: mix(a.glow, b.glow),
    ridge: mix(a.ridge, b.ridge),
    exposure: lerp(a.exposure, b.exposure, t),
    env: lerp(a.env, b.env, t),
  }
}

/* -------------------------------------------------------------------------------------------- Kamerafahrt */

type Key = { p: number; pos: [number, number, number]; at: [number, number, number] }

function cameraKeys(mobile: boolean): Key[] {
  // Handy (Hochformat): weiter weg und höher, damit das Büro ins schmale Bild passt
  const m = mobile ? 1.55 : 1
  const keys: Key[] = [
    { p: 0, pos: [7, 7.2 * m, 23 * m], at: [7, 1.2, 4.2] },
    { p: 0.1, pos: [6.6, 6.2 * m, 19 * m], at: [6.6, 1.1, 4.2] },
    { p: 0.2, pos: [3.4, 4.6 * m, 15 * m], at: [1.6, 1.3, 7.2] },
    { p: 0.3, pos: [1.6, 3.0 * m, 11.4 * (mobile ? 1.12 : 1)], at: [2.4, 0.9, 4.6] },
  ]
  // Reinigung: Kamera folgt der Lichtkante erhöht von vorn links (nie hinter dem Sanitär-Kubus), je Zone Anfang und Ende
  const view: Record<string, { y: number; back: number; lead: number }> = {
    arbeitsplaetze: { y: 4.8, back: 7, lead: -2.2 },
    besprechung: { y: 4.8, back: 7.2, lead: -2.2 },
    kueche: { y: 5.0, back: 5.8, lead: -2.6 },
    sanitaer: { y: 8.2, back: 3.2, lead: -1.2 },
    flur: { y: 3.6, back: 4.4, lead: -2.4 },
  }
  for (const z of sceneZones) {
    const cz = (z.z0 + z.z1) / 2
    const v = view[z.id]
    for (const k of [0.08, 0.92]) {
      const x = edgeX(z, k)
      keys.push({ p: lerp(z.start, z.end, k), pos: [x + v.lead, v.y * (mobile ? 1.35 : 1), cz + v.back * m], at: [x, 0.6, cz] })
    }
  }
  keys.push(
    { p: 0.76, pos: [7, 18.5 * (mobile ? 1.7 : 1), 5.5], at: [7, 0, 4.5] },
    { p: 0.81, pos: [7, 19 * (mobile ? 1.7 : 1), 5.35], at: [7, 0, 4.5] },
    { p: 0.87, pos: [7.4, 2.7, 7.4], at: [7.2, 1.6, 0] },
    { p: 0.92, pos: [7.3, 2.55, 6.6], at: [7.2, 1.75, 0] },
    { p: 1, pos: [7, 5.2 * m, 22 * m], at: [7, 1.5, 1.5] },
  )
  return keys
}

/* -------------------------------------------------------------------------------------- Shader-Erweiterungen */

const ZONES = sceneZones.length

/** Gemeinsame Uniforms aller Materialien mit Reinigungseffekt */
function cleanUniforms() {
  return {
    uZone: { value: sceneZones.map((z) => new THREE.Vector4(z.x0, z.z0, z.x1, z.z1)) },
    uEdge: { value: new Array(ZONES).fill(0) as number[] },
    uK: { value: new Array(ZONES).fill(0) as number[] },
    uDir: { value: sceneZones.map((z) => z.dir) as number[] },
    uPlan: { value: 0 },
    uEdgeColor: { value: new THREE.Color('#cfe4ff') },
    uAO: { value: null as THREE.Texture | null },
    uAOOn: { value: 0 },
  }
}
type CleanU = ReturnType<typeof cleanUniforms>

const CLEAN_GLSL = /* glsl */ `
uniform vec4 uZone[${ZONES}];
uniform float uEdge[${ZONES}];
uniform float uK[${ZONES}];
uniform float uDir[${ZONES}];
uniform float uPlan;
uniform vec3 uEdgeColor;
uniform sampler2D uAO;
uniform float uAOOn;
varying vec3 vWorldPos;
varying vec3 vWorldNormal;
float hash21(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  float a = hash21(i), b = hash21(i + vec2(1.0, 0.0)), c = hash21(i + vec2(0.0, 1.0)), d = hash21(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
// Sauberkeit (0 staubig, 1 sauber) und Leuchten der Lichtkante an einer Bodenstelle
vec2 cleanState(vec2 xz) {
  for (int i = 0; i < ${ZONES}; i++) {
    vec4 r = uZone[i];
    if (xz.x >= r.x - 0.001 && xz.x <= r.z + 0.001 && xz.y >= r.y - 0.001 && xz.y <= r.w + 0.001) {
      float k = uK[i];
      if (k <= 0.0) return vec2(0.0, 0.0);
      if (k >= 1.0) return vec2(1.0, 0.0);
      float d = (uEdge[i] - xz.x) * uDir[i];
      return vec2(smoothstep(-0.05, 0.35, d), exp(-abs(d) * 7.0));
    }
  }
  return vec2(1.0, 0.0);
}
`

/** Standardmaterial um Staubschicht, Glanz hinter der Lichtkante und Grundriss-Modus erweitern */
function patchClean(mat: THREE.MeshStandardMaterial, U: CleanU) {
  mat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, U)
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vWorldPos;\nvarying vec3 vWorldNormal;')
      .replace(
        '#include <worldpos_vertex>',
        `#include <worldpos_vertex>
        vec4 wp = vec4(transformed, 1.0);
        #ifdef USE_INSTANCING
          wp = instanceMatrix * wp;
        #endif
        wp = modelMatrix * wp;
        vWorldPos = wp.xyz;
        vWorldNormal = normalize(mat3(modelMatrix) * objectNormal);`,
      )
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>\n${CLEAN_GLSL}`)
      .replace(
        '#include <roughnessmap_fragment>',
        `#include <roughnessmap_fragment>
        float up = smoothstep(0.7, 0.95, vWorldNormal.y);
        vec2 cs = cleanState(vWorldPos.xz);
        float dust = up * (1.0 - cs.x);
        // Staubschicht aus Rauschen: matt, leicht grau und fleckig
        float n = vnoise(vWorldPos.xz * 7.0) * 0.6 + vnoise(vWorldPos.xz * 23.0) * 0.4;
        diffuseColor.rgb *= mix(1.0, 0.83 + 0.1 * n, dust);
        // Hinter der Kante: feiner Glanz auf Böden und Tischplatten
        roughnessFactor = mix(roughnessFactor, mix(0.92, 0.22, cs.x), up);
        // Vorberechnete Umgebungsverdeckung am Boden (weiche Kontaktschatten unter Möbeln und an Wänden)
        if (uAOOn > 0.5 && vWorldPos.y < 0.06 && up > 0.5) {
          float ao = texture2D(uAO, vec2(vWorldPos.x / ${W.toFixed(1)}, 1.0 - vWorldPos.z / ${D.toFixed(1)})).r;
          diffuseColor.rgb *= 1.0 - ao * 0.55;
        }
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.97, 0.975, 0.97), uPlan);`,
      )
      .replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
        totalEmissiveRadiance += uEdgeColor * cs.y * (0.35 + 0.65 * up) * 1.6;
        totalEmissiveRadiance += vec3(0.86, 0.88, 0.9) * uPlan * 0.9;`,
      )
  }
  // Eigener Cache-Schlüssel, damit three das erweiterte Programm nicht mit dem Standard verwechselt
  mat.customProgramCacheKey = () => 'cs-clean'
}

/* -------------------------------------------------------------------------------------------------- Partikel */

const DUST_VERT = /* glsl */ `
attribute vec4 aRand;
uniform float uTime;
uniform float uPixel;
uniform float uScale;  // Bildhöhe / (2 · tan(fov/2)): Weltgröße → Pixel
uniform vec4 uZone[${ZONES}];
uniform float uEdge[${ZONES}];
uniform float uK[${ZONES}];
uniform float uDir[${ZONES}];
uniform vec3 uMouse;   // xy: Zeiger in NDC, z: aktiv (0/1)
uniform vec4 uSwirl;   // xy: Tipp in NDC, z: Startzeit, w: aktiv
varying float vAlpha;
varying float vSpark;
void main() {
  vec3 p = position;
  // ruhiges Schweben
  float t = uTime * (0.05 + aRand.x * 0.06);
  p += vec3(sin(t * 6.283 + aRand.y * 40.0) * 0.18, sin(t * 3.1 + aRand.z * 30.0) * 0.12, cos(t * 5.0 + aRand.w * 20.0) * 0.18);
  float phase = 0.0;
  float gone = 0.0;
  for (int i = 0; i < ${ZONES}; i++) {
    vec4 r = uZone[i];
    if (position.x >= r.x && position.x <= r.z && position.z >= r.y && position.z <= r.w) {
      if (uK[i] >= 1.0) gone = 1.0;
      else if (uK[i] > 0.0) phase = clamp(((uEdge[i] - position.x) * uDir[i] + 0.1) / 1.1, 0.0, 1.0);
    }
  }
  // von der Kante erfasst: kurz mitwirbeln, aufsteigen und als Funken verglühen
  float a = phase * 9.0 + aRand.x * 6.283;
  float rad = 0.35 * sin(phase * 3.1416);
  p += vec3(cos(a) * rad, phase * phase * 0.9, sin(a) * rad);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vec4 clip = projectionMatrix * mv;
  // Zeiger (Desktop): Partikel weichen aus, Tipp (Touch): kleiner Wirbel
  vec2 ndc = clip.xy / clip.w;
  if (uMouse.z > 0.5) {
    vec2 dm = ndc - uMouse.xy;
    float dl = length(dm);
    mv.xy += normalize(dm + 1e-5) * smoothstep(0.16, 0.0, dl) * 0.35 * (1.0 - phase);
  }
  if (uSwirl.w > 0.5) {
    float age = uTime - uSwirl.z;
    vec2 ds = ndc - uSwirl.xy;
    float f = smoothstep(0.22, 0.0, length(ds)) * exp(-age * 1.6);
    float ang = f * 6.0;
    mv.xy += vec2(-ds.y, ds.x) * f * 2.2 + ds * f * 0.6;
  }
  gl_Position = projectionMatrix * mv;
  float spark = smoothstep(0.25, 0.55, phase) * (1.0 - smoothstep(0.7, 1.0, phase));
  vSpark = spark;
  vAlpha = (1.0 - gone) * (1.0 - smoothstep(0.75, 1.0, phase));
  // Staubkörnchen als feine Lichtpunkte: 1 bis 3 Pixel, Funken etwas größer
  float size = mix(0.0045, 0.009, spark) * (0.6 + aRand.w * 0.8);
  gl_PointSize = clamp(size * uScale / -mv.z, 1.0, 6.0) * uPixel;
}
`
const DUST_FRAG = /* glsl */ `
uniform vec3 uColor;
uniform float uOpacity;
varying float vAlpha;
varying float vSpark;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d);
  vec3 col = mix(uColor, vec3(0.85, 0.93, 1.0) * 3.0, vSpark);
  gl_FragColor = vec4(col, a * vAlpha * mix(uOpacity, 1.0, vSpark));
}
`

/* ------------------------------------------------------------------------------------------------ Texturen */

function canvasTexture(size: number, draw: (g: CanvasRenderingContext2D, s: number) => void) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  draw(c.getContext('2d')!, size)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 4
  return t
}

/** Prüfpunkt: feiner Ring mit Nummer, abgehakt mit Häkchen */
function markerTexture(n: number, done: boolean) {
  return canvasTexture(128, (g, s) => {
    g.clearRect(0, 0, s, s)
    g.lineWidth = 4
    g.strokeStyle = done ? '#2b5be6' : 'rgba(255,255,255,0.9)'
    g.fillStyle = done ? '#ffffff' : 'rgba(11,18,32,0.55)'
    g.beginPath()
    g.arc(s / 2, s / 2, s / 2 - 8, 0, Math.PI * 2)
    g.fill()
    g.stroke()
    if (done) {
      g.strokeStyle = '#2b5be6'
      g.lineWidth = 8
      g.lineCap = 'round'
      g.lineJoin = 'round'
      g.beginPath()
      g.moveTo(s * 0.32, s * 0.52)
      g.lineTo(s * 0.45, s * 0.65)
      g.lineTo(s * 0.7, s * 0.37)
      g.stroke()
    } else {
      g.fillStyle = '#ffffff'
      g.font = `500 ${s * 0.42}px system-ui, sans-serif`
      g.textAlign = 'center'
      g.textBaseline = 'middle'
      g.fillText(String(n), s / 2, s / 2 + 2)
    }
  })
}

/** Glanz-Stern (vier Spitzen) */
function starTexture() {
  return canvasTexture(128, (g, s) => {
    const c = s / 2
    const grad = g.createRadialGradient(c, c, 0, c, c, c)
    grad.addColorStop(0, 'rgba(255,255,255,1)')
    grad.addColorStop(0.15, 'rgba(200,225,255,0.6)')
    grad.addColorStop(1, 'rgba(120,170,255,0)')
    g.fillStyle = grad
    g.beginPath()
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 - Math.PI / 2
      const r = i % 2 === 0 ? c : c * 0.16
      g.lineTo(c + Math.cos(a) * r, c + Math.sin(a) * r)
    }
    g.closePath()
    g.fill()
  })
}

/** Weiche Lichtkante (quer weich, längs gleichmäßig) */
function sheetTexture() {
  return canvasTexture(256, (g, s) => {
    const grad = g.createLinearGradient(0, 0, s, 0)
    grad.addColorStop(0, 'rgba(255,255,255,0)')
    grad.addColorStop(0.5, 'rgba(255,255,255,1)')
    grad.addColorStop(1, 'rgba(255,255,255,0)')
    g.fillStyle = grad
    g.fillRect(0, 0, s, s)
    const v = g.createLinearGradient(0, 0, 0, s)
    v.addColorStop(0, 'rgba(0,0,0,1)')
    v.addColorStop(0.2, 'rgba(0,0,0,0)')
    v.addColorStop(0.85, 'rgba(0,0,0,0)')
    v.addColorStop(1, 'rgba(0,0,0,1)')
    g.globalCompositeOperation = 'destination-out'
    g.fillStyle = v
    g.fillRect(0, 0, s, s)
  })
}

/* ----------------------------------------------------------------------------------------------------- Welt */

export class NightWorld {
  readonly renderer: THREE.WebGLRenderer
  readonly scene = new THREE.Scene()
  readonly camera: THREE.PerspectiveCamera
  private composer: EffectComposer | null = null
  private bloom: UnrealBloomPass | null = null
  private U = cleanUniforms()
  private sun = new THREE.DirectionalLight('#ffffff', 2)
  private hemi = new THREE.HemisphereLight('#ffffff', '#888888', 1)
  private edgeLight = new THREE.PointLight('#cfe4ff', 0, 5, 1.6)
  private doorLight = new THREE.SpotLight('#ffe2b8', 0, 9, 0.55, 0.6, 1.4)
  private islandLights = islands.map((is) => {
    const l = new THREE.PointLight('#ffd7a0', 0, 5.5, 1.5)
    l.position.set(is.cx, 1.55, is.cz)
    return l
  })
  private sky: THREE.Mesh<THREE.SphereGeometry, THREE.ShaderMaterial>
  private ridges: THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>[] = []
  private screens: THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>[] = []
  private lamps: THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>[] = []
  private chairs: THREE.InstancedMesh
  private cups: THREE.InstancedMesh
  private papers: THREE.InstancedMesh
  private door: THREE.Group
  private doorGlow: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>
  private alarm: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>
  private sheet: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>
  private shafts: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>[] = []
  private plan: THREE.LineSegments<THREE.BufferGeometry, THREE.LineBasicMaterial>
  private markers: { open: THREE.Sprite; done: THREE.Sprite; star: THREE.Sprite; x: number; zone: number }[] = []
  private dust: THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>
  private keys: Key[]
  private curve: THREE.CatmullRomCurve3
  private targets: THREE.CatmullRomCurve3
  private mouse = new THREE.Vector2()
  private mouseOn = false
  private look = new THREE.Vector2()
  private p = 0
  private time = 0
  private dummy = new THREE.Object3D()
  private fog = new THREE.Fog('#1b2a4a', 70, 190)

  constructor(canvas: HTMLCanvasElement, opts: { mobile: boolean; quality: Quality }) {
    const hi = opts.quality === 'high'
    // Nur für die Fehlersuche: ?dbg=dbsge blendet Staub, Bloom, Himmel, Glas, Umgebungslicht aus
    const dbg = new URLSearchParams(location.search).get('dbg') ?? ''
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: !opts.mobile, powerPreference: 'high-performance', alpha: false, preserveDrawingBuffer: new URLSearchParams(location.search).has('still') })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, opts.mobile ? 1.5 : 2))
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap

    this.camera = new THREE.PerspectiveCamera(opts.mobile ? 50 : 34, 1, 0.1, 400)
    this.scene.fog = this.fog

    // Umgebungslicht für weiche Reflexionen (einmal beim Laden vorberechnet)
    const pmrem = new THREE.PMREMGenerator(this.renderer)
    if (!dbg.includes('e')) this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    pmrem.dispose()

    // Statisches Modell: eine Geometrie, ein Material mit Staub, Glanz und Lichtkante
    const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.86, metalness: 0, envMapIntensity: 0.55 })
    patchClean(mat, this.U)
    const model = new THREE.Mesh(buildStatic(), mat)
    model.castShadow = model.receiveShadow = true
    this.scene.add(model)

    const glass = new THREE.Mesh(
      buildGlass(),
      new THREE.MeshStandardMaterial({ color: '#dbe7f2', transparent: true, opacity: 0.16, roughness: 0.04, metalness: 0, envMapIntensity: 1.2, depthWrite: false }),
    )
    if (!dbg.includes('g')) this.scene.add(glass)

    // Bildschirme und Lampenköpfe (leuchten; Bloom macht den Schein)
    for (const g of buildScreens()) {
      const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: '#0d1424', toneMapped: false }))
      this.screens.push(m)
      this.scene.add(m)
    }
    for (const g of buildLampHeads()) {
      const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: '#f2efe8', side: THREE.DoubleSide, toneMapped: false }))
      this.lamps.push(m)
      this.scene.add(m)
    }
    this.islandLights.forEach((l) => this.scene.add(l))

    // Stühle, Tassen, Papier: instanziert
    const furn = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.6, envMapIntensity: 0.6 })
    // auch Stühle werden im Grundriss-Modus weiß (gleiche Uniforms)
    patchClean(furn, this.U)
    this.chairs = new THREE.InstancedMesh(chairGeo(), furn, chairs.length)
    this.chairs.castShadow = true
    this.cups = new THREE.InstancedMesh(cupGeo(), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.35, envMapIntensity: 0.9 }), cups.length)
    this.papers = new THREE.InstancedMesh(paperGeo(), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95 }), papers.length)
    this.cups.castShadow = this.papers.castShadow = true
    this.scene.add(this.chairs, this.cups, this.papers)

    // Eingangstür mit Scharnier, dahinter der beleuchtete Flur
    this.door = new THREE.Group()
    this.door.position.set(-0.08, 0, DOOR.z - DOOR.w / 2)
    const leaf = new THREE.Mesh(new THREE.BoxGeometry(0.05, DOOR.h, DOOR.w - 0.02), new THREE.MeshStandardMaterial({ color: '#f1f2ef', roughness: 0.8 }))
    leaf.position.set(0, DOOR.h / 2, DOOR.w / 2)
    leaf.castShadow = true
    this.door.add(leaf)
    this.scene.add(this.door)
    this.doorGlow = new THREE.Mesh(new THREE.PlaneGeometry(DOOR.w, DOOR.h), new THREE.MeshBasicMaterial({ color: '#000000', toneMapped: false }))
    this.doorGlow.rotation.y = Math.PI / 2
    this.doorGlow.position.set(-0.2, DOOR.h / 2, DOOR.z)
    this.scene.add(this.doorGlow)
    this.doorLight.position.set(-1.2, 2.0, DOOR.z)
    this.doorLight.target.position.set(3, 0, DOOR.z - 0.6)
    this.scene.add(this.doorLight, this.doorLight.target)
    this.alarm = new THREE.Mesh(new THREE.SphereGeometry(0.022, 12, 8), new THREE.MeshBasicMaterial({ color: '#333', toneMapped: false }))
    this.alarm.position.set(ALARM.x + 0.03, ALARM.y + 0.05, ALARM.z)
    this.scene.add(this.alarm)

    // Lichtkante als weiche, senkrechte Lichtfläche
    this.sheet = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({ map: sheetTexture(), color: '#d9ebff', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }),
    )
    this.sheet.rotation.y = Math.PI / 2
    this.scene.add(this.sheet, this.edgeLight)

    // Sonne, Himmel, Schwarzwald-Horizont
    this.sun.castShadow = true
    this.sun.shadow.mapSize.set(hi ? 2048 : 1024, hi ? 2048 : 1024)
    const sc = this.sun.shadow.camera
    sc.left = -11
    sc.right = 11
    sc.top = 9
    sc.bottom = -9
    sc.near = 1
    sc.far = 80
    this.sun.shadow.bias = -0.0004
    this.sun.shadow.normalBias = 0.02
    this.sun.target.position.set(W / 2, 0, D / 2)
    this.scene.add(this.sun, this.sun.target, this.hemi)
    this.sky = this.buildSky()
    if (!dbg.includes('s')) this.scene.add(this.sky)
    this.buildRidges()

    // Morgen: sichtbare Lichtstrahlen durch die Fensterfront
    const shaftTex = sheetTexture()
    for (let i = 0; i < 5; i++) {
      const m = new THREE.Mesh(
        new THREE.PlaneGeometry(1.2, 7),
        new THREE.MeshBasicMaterial({ map: shaftTex, color: '#fff4e2', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }),
      )
      m.position.set(1.8 + i * 2.6, 1.35, 3.1)
      m.rotation.set(-1.15, 0, 0.12)
      this.shafts.push(m)
      this.scene.add(m)
    }

    // Grundriss-Linien für die Kontrolle
    this.plan = new THREE.LineSegments(buildPlanLines(), new THREE.LineBasicMaterial({ color: '#1a4fe0', transparent: true, opacity: 0, depthTest: false }))
    this.plan.renderOrder = 5
    this.scene.add(this.plan)

    // Prüfpunkte
    const star = starTexture()
    for (const c of checkpoints) {
      const mk = (map: THREE.Texture) => {
        const s = new THREE.Sprite(new THREE.SpriteMaterial({ map, transparent: true, opacity: 0, depthTest: false, toneMapped: false }))
        s.position.set(c.x, 1.25, c.z)
        s.scale.setScalar(0.34)
        s.renderOrder = 6
        this.scene.add(s)
        return s
      }
      const open = mk(markerTexture(c.n, false))
      const done = mk(markerTexture(c.n, true))
      const st = mk(star)
      st.material.blending = THREE.AdditiveBlending
      this.markers.push({ open, done, star: st, x: c.x, zone: c.zone })
    }

    this.bakeAO(model)

    this.dust = this.buildDust(opts.mobile ? 5000 : hi ? 20000 : 9000)
    if (!dbg.includes('d')) this.scene.add(this.dust)

    this.keys = cameraKeys(opts.mobile)
    this.curve = new THREE.CatmullRomCurve3(
      this.keys.map((k) => new THREE.Vector3(...k.pos)),
      false,
      'centripetal',
    )
    this.targets = new THREE.CatmullRomCurve3(
      this.keys.map((k) => new THREE.Vector3(...k.at)),
      false,
      'centripetal',
    )

    if (hi && !opts.mobile && !dbg.includes('b')) {
      this.composer = new EffectComposer(this.renderer)
      this.composer.addPass(new RenderPass(this.scene, this.camera))
      // Nur echte Lichtquellen glühen (Bildschirme, Lampen, Funken, Kante): Schwelle über dem Weiß der Flächen
      this.bloom = new UnrealBloomPass(new THREE.Vector2(512, 512), 0.4, 0.5, 2.2)
      this.composer.addPass(this.bloom)
      this.composer.addPass(new OutputPass())
    }
    this.setProgress(0)
  }

  /**
   * Umgebungsverdeckung einmalig beim Laden backen: Draufsicht auf alles über dem Boden (je niedriger, desto dunkler),
   * zweimal weichgezeichnet, als Textur auf den Boden gelegt. Kostet zur Laufzeit nur einen Texturzugriff.
   */
  private bakeAO(model: THREE.Mesh) {
    const res = 512
    const rt = (h: number) => new THREE.WebGLRenderTarget(res, h, { type: THREE.UnsignedByteType })
    const h = Math.round((res * D) / W)
    const a = rt(h)
    const b = rt(h)
    const cam = new THREE.OrthographicCamera(0, W, 0, -D, 0.1, 20)
    // Blick senkrecht nach unten: Bild-x = Welt-x, Bild-y = -z (oben z = 0, unten z = D)
    cam.position.set(0, 10, 0)
    cam.rotation.set(-Math.PI / 2, 0, 0)
    cam.updateProjectionMatrix()
    const occ = new THREE.ShaderMaterial({
      vertexShader: `varying float vY;
        void main() {
          vec4 wp = vec4(position, 1.0);
          #ifdef USE_INSTANCING
            wp = instanceMatrix * wp;
          #endif
          wp = modelMatrix * wp;
          vY = wp.y;
          gl_Position = projectionMatrix * viewMatrix * wp;
        }`,
      fragmentShader: `varying float vY; void main(){ if (vY < 0.03) discard; gl_FragColor = vec4(vec3(0.9), 1.0); }`,
    })
    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#000')
    const m = new THREE.Mesh(model.geometry, occ)
    const ch = new THREE.InstancedMesh(this.chairs.geometry, occ, this.chairs.count)
    for (let i = 0; i < this.chairs.count; i++) {
      const mat = new THREE.Matrix4()
      const c = chairs[i]
      this.dummy.position.set(c.tidy[0], 0, c.tidy[1])
      this.dummy.rotation.set(0, c.tidy[2], 0)
      this.dummy.updateMatrix()
      mat.copy(this.dummy.matrix)
      ch.setMatrixAt(i, mat)
    }
    scene.add(m, ch)
    const r = this.renderer
    r.setRenderTarget(a)
    r.render(scene, cam)
    // Weichzeichnen in zwei Richtungen, zweimal
    const blur = new THREE.ShaderMaterial({
      uniforms: { tMap: { value: null }, uDir: { value: new THREE.Vector2() } },
      vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
      fragmentShader: `uniform sampler2D tMap; uniform vec2 uDir; varying vec2 vUv;
        void main(){ float s = 0.0; float w = 0.0;
          for (int i = -12; i <= 12; i++) { float k = exp(-float(i*i) / 60.0); s += texture2D(tMap, vUv + uDir * float(i)).r * k; w += k; }
          gl_FragColor = vec4(vec3(s / w), 1.0); }`,
      depthTest: false,
    })
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), blur)
    const qs = new THREE.Scene()
    qs.add(quad)
    const qc = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    for (let k = 0; k < 2; k++) {
      blur.uniforms.tMap.value = a.texture
      blur.uniforms.uDir.value.set(1.4 / res, 0)
      r.setRenderTarget(b)
      r.render(qs, qc)
      blur.uniforms.tMap.value = b.texture
      blur.uniforms.uDir.value.set(0, 1.4 / h)
      r.setRenderTarget(a)
      r.render(qs, qc)
    }
    r.setRenderTarget(null)
    b.dispose()
    occ.dispose()
    blur.dispose()
    this.U.uAO.value = a.texture
    this.U.uAOOn.value = 1
  }

  private buildSky() {
    const m = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      uniforms: { uTop: { value: new THREE.Color() }, uHorizon: { value: new THREE.Color() }, uGlow: { value: new THREE.Color() }, uSun: { value: new THREE.Vector3(0, 0.1, -1) }, uSunSize: { value: 0 } },
      vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `uniform vec3 uTop; uniform vec3 uHorizon; uniform vec3 uGlow; uniform vec3 uSun; uniform float uSunSize; varying vec3 vDir;
        void main(){ float h = clamp(vDir.y * 2.2, 0.0, 1.0); vec3 c = mix(uHorizon, uTop, pow(h, 0.7));
          float s = max(dot(normalize(vDir), normalize(uSun)), 0.0);
          c += uGlow * pow(s, 8.0) * 0.55 + uGlow * pow(s, 900.0) * uSunSize * 3.0;
          gl_FragColor = vec4(c, 1.0);
          #include <colorspace_fragment>
        }`,
    })
    const s = new THREE.Mesh(new THREE.SphereGeometry(180, 32, 16), m)
    s.position.set(W / 2, 0, D / 2)
    return s
  }

  /** Schwarzwald-Horizont aus dem echten Höhenprofil (Blick von Offenburg nach Osten), überhöht, zwei Ebenen */
  private buildRidges() {
    const angles = (skyline as { angles: number[] }).angles
    const layer = (radius: number, exag: number, smoothN: number, opacity: number) => {
      const n = angles.length
      const pos: number[] = []
      const idx: number[] = []
      for (let i = 0; i < n; i++) {
        // geglättete Fassung für die vordere Ebene
        let a = 0
        let c = 0
        for (let j = Math.max(0, i - smoothN); j <= Math.min(n - 1, i + smoothN); j++) {
          a += angles[j]
          c++
        }
        a /= c
        // Blickwinkel 55°..125° Azimut → Bogen vor der Fensterfront (Osten = -z)
        const az = THREE.MathUtils.degToRad(-35 + (70 * i) / (n - 1))
        const x = W / 2 + Math.sin(az) * radius
        const z = D / 2 - Math.cos(az) * radius
        const h = Math.tan(THREE.MathUtils.degToRad(a)) * radius * exag - 2
        pos.push(x, -6, z, x, h, z)
        if (i < n - 1) idx.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2)
      }
      const g = new THREE.BufferGeometry()
      g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
      g.setIndex(idx)
      const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: '#2a3550', transparent: opacity < 1, opacity, side: THREE.DoubleSide, fog: true }))
      this.ridges.push(m)
      this.scene.add(m)
    }
    layer(78, 2.1, 0, 1)
    layer(52, 1.3, 6, 0.92)
  }

  private buildDust(count: number) {
    const pos = new Float32Array(count * 3)
    const rnd = new Float32Array(count * 4)
    for (let i = 0; i < count; i++) {
      // vor allem in den Zonen, etwas dichter im Licht vor den Fenstern
      pos.set([Math.random() * W, 0.15 + Math.pow(Math.random(), 0.8) * (H - 0.4), Math.pow(Math.random(), 1.3) * D], i * 3)
      rnd.set([Math.random(), Math.random(), Math.random(), Math.random()], i * 4)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aRand', new THREE.BufferAttribute(rnd, 4))
    const m = new THREE.ShaderMaterial({
      vertexShader: DUST_VERT,
      fragmentShader: DUST_FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        ...this.U,
        uTime: { value: 0 },
        uPixel: { value: this.renderer.getPixelRatio() },
        uScale: { value: 800 },
        uMouse: { value: new THREE.Vector3() },
        uSwirl: { value: new THREE.Vector4(0, 0, -10, 0) },
        uColor: { value: new THREE.Color('#ffd9a8') },
        uOpacity: { value: 0.5 },
      },
    })
    const pts = new THREE.Points(g, m)
    pts.frustumCulled = false
    return pts
  }

  resize(w: number, h: number) {
    this.renderer.setSize(w, h, false)
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
    this.composer?.setSize(w, h)
    this.dust.material.uniforms.uScale.value = h / (2 * Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2)))
    this.bloom?.resolution.set(w / 2, h / 2)
  }

  /** Zeiger in NDC (-1..1); active = über der Szene */
  pointer(x: number, y: number, active: boolean) {
    this.mouse.set(x, y)
    this.mouseOn = active
  }

  tap(x: number, y: number) {
    this.dust.material.uniforms.uSwirl.value.set(x, y, this.time, 1)
  }

  setProgress(p: number) {
    this.p = p
    const L = lookAt(p)
    const U = this.U

    // Licht: Sonne flach durch die Fensterfront (Osten, -z), Himmel und Horizont nach Uhrzeit
    const sunAz = p < 0.84 ? 0.35 : -0.25
    const dir = new THREE.Vector3(Math.sin(sunAz), Math.max(0.02, L.sunElev), -Math.cos(sunAz)).normalize()
    this.sun.position.copy(dir.clone().multiplyScalar(40).add(new THREE.Vector3(W / 2, 0, D / 2)))
    this.sun.color.copy(L.sunColor)
    this.sun.intensity = L.sun
    this.hemi.color.copy(L.hemiSky)
    this.hemi.groundColor.copy(L.hemiGround)
    this.hemi.intensity = L.hemi
    const sky = this.sky.material.uniforms
    sky.uTop.value.copy(L.skyTop)
    sky.uHorizon.value.copy(L.skyHorizon)
    sky.uGlow.value.copy(L.glow)
    sky.uSun.value.copy(dir)
    sky.uSunSize.value = span(p, 0.86, 0.95)
    this.fog.color.copy(L.skyHorizon)
    this.ridges[0].material.color.copy(L.ridge)
    this.ridges[1].material.color.copy(L.ridge.clone().lerp(L.skyHorizon, 0.35))
    this.renderer.toneMappingExposure = L.exposure
    this.scene.environmentIntensity = L.env

    // 18:30 Ihr Team geht: Bildschirme und Lampen aus, Insel für Insel
    const off = (island: number) => span(p, PHASES.leave[0] + 0.012 + island * 0.04, PHASES.leave[0] + 0.03 + island * 0.04)
    this.screens.forEach((s, i) => {
      const k = 1 - off(desks[i].island) * (1 + (i % 4) * 0.08)
      s.material.color.setRGB(0.05 + 0.55 * Math.max(0, k), 0.08 + 0.7 * Math.max(0, k), 0.14 + 1.05 * Math.max(0, k))
    })
    this.lamps.forEach((l, i) => {
      const k = 1 - off(desks[i].island)
      l.material.color.setRGB(0.9 + 1.6 * k, 0.88 + 1.2 * k, 0.84 + 0.6 * k)
    })
    this.islandLights.forEach((l, k) => (l.intensity = 2.2 * (1 - off(k))))

    // 19:15 Wir kommen: Tür öffnet sich, Lichtstreifen aus dem Flur, Alarmanlage kurz rot, dann aus; nach der
    // Kontrolle grün und die Tür schließt
    const open = smooth(span(p, 0.2, 0.235)) * (1 - smooth(span(p, 0.81, 0.835)))
    this.door.rotation.y = -open * 1.45
    const corridor = Math.max(open, span(p, 0.2, 0.22) * (p < 0.84 ? 1 : 0))
    this.doorGlow.material.color.setRGB(1.6 * corridor, 1.35 * corridor, 1.0 * corridor)
    this.doorLight.intensity = 26 * open
    const blink = p > 0.205 && p < 0.25 ? (Math.sin(this.time * 9) > 0 ? 1 : 0.15) : 0
    const green = smooth(span(p, 0.79, 0.81)) * (p < 0.86 ? 1 : 0)
    this.alarm.material.color.setRGB(0.25 + 2.2 * blink, 0.25 + 1.6 * green, 0.25 + 0.6 * green)

    // 20:00 bis 21:30 Reinigung: Lichtkante Zone für Zone
    const ks = zoneProgress(p)
    let active = -1
    ks.forEach((k, i) => {
      U.uK.value[i] = k
      U.uEdge.value[i] = edgeX(sceneZones[i], k)
      if (k > 0 && k < 1) active = i
    })
    if (active >= 0) {
      const z = sceneZones[active]
      const x = U.uEdge.value[active]
      const fade = Math.min(1, ks[active] * 8, (1 - ks[active]) * 8)
      this.sheet.position.set(x, 1.3, (z.z0 + z.z1) / 2)
      this.sheet.scale.set(z.z1 - z.z0, 2.6, 1)
      this.sheet.material.opacity = 0.16 * fade
      this.edgeLight.position.set(x, 1.1, (z.z0 + z.z1) / 2)
      this.edgeLight.intensity = 7 * fade
    } else {
      this.sheet.material.opacity = 0
      this.edgeLight.intensity = 0
    }

    // Ordnung entsteht: Stühle rollen an ihren Platz, Tassen verschwinden, Papier richtet sich aus
    const clean = (zone: number, x: number) => {
      const z = sceneZones[zone]
      const k = ks[zone]
      if (k <= 0) return 0
      if (k >= 1) return 1
      return smooth(Math.min(1, Math.max(0, ((U.uEdge.value[zone] - x) * z.dir + 0.2) / 1.0)))
    }
    chairs.forEach((c, i) => {
      const t = clean(c.zone, c.tidy[0])
      this.dummy.position.set(lerp(c.messy[0], c.tidy[0], t), 0, lerp(c.messy[1], c.tidy[1], t))
      this.dummy.rotation.set(0, lerp(c.messy[2], c.tidy[2], t), 0)
      this.dummy.scale.setScalar(1)
      this.dummy.updateMatrix()
      this.chairs.setMatrixAt(i, this.dummy.matrix)
    })
    this.chairs.instanceMatrix.needsUpdate = true
    cups.forEach((c, i) => {
      const t = clean(c.zone, c.x)
      const s = t < 0.5 ? 1 + t * 0.3 : Math.max(0, 1.15 - (t - 0.5) * 2.3)
      this.dummy.position.set(c.x, c.y + t * 0.05, c.z)
      this.dummy.rotation.set(0, 0, 0)
      this.dummy.scale.setScalar(Math.max(0.0001, s))
      this.dummy.updateMatrix()
      this.cups.setMatrixAt(i, this.dummy.matrix)
    })
    this.cups.instanceMatrix.needsUpdate = true
    papers.forEach((pp, i) => {
      const t = clean(pp.zone, pp.x)
      this.dummy.position.set(pp.x, 0.76 + 0.025, pp.z)
      this.dummy.rotation.set(0, lerp(pp.rot, 0, t), 0)
      this.dummy.scale.set(1, lerp(1, 0.55, t), 1)
      this.dummy.updateMatrix()
      this.papers.setMatrixAt(i, this.dummy.matrix)
    })
    this.papers.instanceMatrix.needsUpdate = true

    // Prüfpunkte: erscheinen in ihrer Zone, haken sich ab, sobald die Kante sie erreicht, der Stern funkelt einmal;
    // bei der Kontrolle stehen alle abgehakt auf dem Grundriss
    const planOn = smooth(span(p, 0.735, 0.765)) * (1 - smooth(span(p, 0.8, 0.83)))
    this.markers.forEach((m) => {
      const z = sceneZones[m.zone]
      const k = ks[m.zone]
      const visible = (k > 0 && k < 1 ? Math.min(1, k * 10) : 0) + planOn
      const passed = k >= 1 || (k > 0 && (U.uEdge.value[m.zone] - m.x) * z.dir > 0)
      const since = passed ? Math.min(1, ((U.uEdge.value[m.zone] - m.x) * z.dir) / 0.9) : 0
      const done = passed ? 1 : 0
      m.open.material.opacity = Math.min(1, visible) * (1 - done)
      m.done.material.opacity = Math.min(1, visible) * done
      const fl = k > 0 && k < 1 ? Math.sin(Math.min(1, since) * Math.PI) : 0
      m.star.material.opacity = fl
      m.star.scale.setScalar(0.3 + fl * 0.5)
      const y = lerp(1.25, 0.2, planOn)
      m.open.position.y = m.done.position.y = m.star.position.y = y
    })

    // 21:45 Kontrolle: das Modell wird zum Grundriss
    U.uPlan.value = planOn * 0.9
    this.plan.material.opacity = planOn
    this.dust.material.uniforms.uOpacity.value = lerp(0.35, 0.1, span(p, 0.1, 0.22)) * (p > 0.72 ? 0 : 1)
    ;(this.dust.material.uniforms.uColor.value as THREE.Color).set(p < 0.15 ? '#ffd9a8' : '#a9c4ff')

    // 7:00: Morgenlicht, sichtbare Strahlen
    const rays = smooth(span(p, 0.88, 0.94)) * (1 - span(p, 0.98, 1) * 0.4)
    this.shafts.forEach((s, i) => (s.material.opacity = rays * (0.06 + 0.025 * Math.sin(i * 1.7))))
    if (this.bloom) this.bloom.strength = p > 0.86 ? 0.22 : 0.4
  }

  render(dt: number) {
    this.time += dt
    this.dust.material.uniforms.uTime.value = this.time
    const mu = this.dust.material.uniforms.uMouse.value as THREE.Vector3
    mu.set(this.mouse.x, this.mouse.y, this.mouseOn && this.p < PHASES.clean[1] ? 1 : 0)

    // Kamera: Position auf der Kurve nach p, weich der Maus folgend (wenige Grad)
    const n = this.keys.length
    let i = 0
    while (i < n - 2 && this.p > this.keys[i + 1].p) i++
    const a = this.keys[i]
    const b = this.keys[i + 1]
    const t = Math.min(1, Math.max(0, (this.p - a.p) / (b.p - a.p)))
    const u = (i + smooth(t)) / (n - 1)
    const pos = this.curve.getPoint(u)
    const at = this.targets.getPoint(u)
    this.look.lerp(this.mouseOn ? this.mouse : new THREE.Vector2(), 0.05)
    const off = new THREE.Vector3().subVectors(pos, at)
    off.applyAxisAngle(new THREE.Vector3(0, 1, 0), -this.look.x * 0.045)
    pos.copy(at).add(off)
    pos.y += this.look.y * 0.18
    this.camera.position.copy(pos)
    // Draufsicht: Kamera-Oben zeigt in die Tiefe, damit der Grundriss richtig herum liegt
    this.camera.up.set(0, 1, 0)
    this.camera.lookAt(at)

    if (this.composer) this.composer.render(dt)
    else this.renderer.render(this.scene, this.camera)
  }

  dispose() {
    this.scene.traverse((o) => {
      const m = o as THREE.Mesh
      m.geometry?.dispose()
      const mat = m.material as THREE.Material | THREE.Material[] | undefined
      if (Array.isArray(mat)) mat.forEach((x) => x.dispose())
      else mat?.dispose()
    })
    this.composer?.dispose()
    this.renderer.dispose()
  }
}
