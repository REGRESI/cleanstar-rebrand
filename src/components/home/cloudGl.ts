import { createQuad, GLSL_NOISE, loopWhileVisible } from '@/lib/glQuad'

/**
 * Wolken-Übergang in WebGL (Referenz ERA era/13): drei Tiefenebenen aus den freigestellten Wolkenbildern.
 *  hinten  klein, langsam, weicher (unschärfere Mip-Stufe) und blasser
 *  Mitte   mittelgroß
 *  vorne   groß, schnell, scharf, mit Licht: Oberseite heller, Unterseite leicht grau-blau
 * Jede Ebene driftet auch ohne Scrollen langsam zur Seite (gespiegelt wiederholt, keine Naht), ihre Ränder quellen und
 * lösen sich minimal (Rausch-Verzerrung). Beim Weiterscrollen werden die Wolken von unten nach oben dünner und zerfallen
 * in Fetzen (Rauschmaske frisst die Deckkraft), statt als Bild nach oben zu gleiten. Oberkante läuft weich aus.
 */
const FS = `#version 300 es
precision highp float;
in vec2 vUv;
uniform vec2 uRes;
uniform float uT;
uniform sampler2D uA;
uniform sampler2D uB;
uniform sampler2D uC;
uniform vec4 uR0; uniform vec4 uR1; uniform vec4 uR2; uniform vec4 uR3; // y, Höhe, Breite, Drift (px)
uniform vec4 uP0; uniform vec4 uP1; uniform vec4 uP2; uniform vec4 uP3; // Deckkraft, Auflösen, Unschärfe, Licht
out vec4 o;
${GLSL_NOISE}
vec4 layer(sampler2D tex, vec4 r, vec4 pm, float flip, float seed, float pale) {
  vec2 p = vec2(vUv.x * uRes.x, vUv.y * uRes.y);
  float u = (p.x - (uRes.x - r.z) * 0.5 - r.w) / r.z;
  float v = (p.y - r.x) / r.y;
  if (v < 0.0 || v > 1.0 || pm.x <= 0.0) return vec4(0.0);
  u = mix(u, -u, flip);
  // Ränder quellen und lösen sich minimal
  vec2 q = vec2(u, v) + (vec2(noise(vec2(u * 6.0, v * 5.0) + uT * 0.05 + seed), noise(vec2(u * 6.0 + 9.0, v * 5.0) - uT * 0.04 + seed)) - 0.5) * 0.014;
  vec4 c = texture(tex, q, pm.z);
  if (c.a < 0.002) return vec4(0.0);
  // Licht: Oberseite heller, Unterseite grau-blau
  float au = texture(tex, q - vec2(0.0, 0.04), pm.z + 1.0).a;
  float ad = texture(tex, q + vec2(0.0, 0.04), pm.z + 1.0).a;
  float top = clamp(c.a - au, 0.0, 1.0);
  float bot = clamp(c.a - ad, 0.0, 1.0);
  vec3 rgb = c.rgb;
  rgb += vec3(1.0) * c.a * top * 0.3 * pm.w;
  rgb = mix(rgb, vec3(0.66, 0.74, 0.85) * c.a, clamp(bot * 0.55 + smoothstep(0.55, 1.0, v) * 0.18, 0.0, 1.0) * pm.w);
  rgb = mix(rgb, vec3(0.95, 0.97, 0.99) * c.a, pale);
  // weiche Oberkante, auslaufende Unterkante
  float f = smoothstep(0.0, 0.16, v) * smoothstep(1.0, 0.74, v);
  // Auflösen von unten nach oben in Fetzen
  float field = v * 0.6 + fbm(vec2(u * 3.2, v * 3.0) + seed + uT * 0.02) * 0.6;
  float cut = 1.25 - pm.y * 1.45;
  float keep = 1.0 - smoothstep(cut - 0.06, cut + 0.06, field);
  float a = pm.x * f * keep;
  return vec4(rgb, c.a) * a;
}
void main() {
  vec4 col = layer(uC, uR0, uP0, 0.0, 1.3, 0.28);
  vec4 l = layer(uB, uR1, uP1, 0.0, 4.1, 0.1);
  col = l + col * (1.0 - l.a);
  l = layer(uA, uR2, uP2, 0.0, 7.7, 0.0);
  col = l + col * (1.0 - l.a);
  l = layer(uB, uR3, uP3, 1.0, 2.9, 0.0);
  col = l + col * (1.0 - l.a);
  o = col;
}`

type Layer = { tex: 'a' | 'b' | 'c'; ratio: number; top: [number, number]; topM: number; scale: number; up: number; drift: number; blur: number; light: number; alpha: number }
// top: [Anteil Viewport-Breite, Anteil Höhe des Bereichs]; topM: Handy (Anteil Viewport-Breite)
const LAYERS: Layer[] = [
  { tex: 'c', ratio: 1136 / 1916, top: [-0.36, 0], topM: -0.36, scale: 0.9, up: 0.16, drift: 4, blur: 2.2, light: 0.35, alpha: 0.82 },
  { tex: 'b', ratio: 1080 / 1916, top: [-0.31, 0.18], topM: -0.1, scale: 1.05, up: 0.3, drift: 9, blur: 1.0, light: 0.6, alpha: 1 },
  { tex: 'a', ratio: 821 / 1916, top: [-0.22, 0.42], topM: 0.3, scale: 1.25, up: 0.45, drift: 16, blur: 0, light: 1, alpha: 1 },
  { tex: 'b', ratio: 1080 / 1916, top: [-0.3, 0.66], topM: 0.4, scale: 1.32, up: 0.55, drift: 21, blur: 0, light: 1, alpha: 1 },
]

const span = (p: number, a: number, b: number) => Math.min(1, Math.max(0, (p - a) / (b - a)))

/** progress(): Fortschritt 0 bis 1 des Übergangs (ScrollTrigger des Bereichs) */
export function startClouds(canvas: HTMLCanvasElement, progress: () => number, onReady: () => void) {
  let q
  try {
    q = createQuad(canvas, FS)
  } catch {
    return null
  }
  if (!q) return null
  const quad = q
  const vw = () => window.innerWidth
  const big = vw() * Math.min(1.5, window.devicePixelRatio || 1) > 900
  let dead = false
  let stop: (() => void) | null = null
  const imgs = (['a', 'b', 'c'] as const).map((n) => {
    const im = new Image()
    im.decoding = 'async'
    im.src = `/images/deko/wolken-ebene-${n}-${big ? 1916 : 960}.webp`
    return im
  })
  Promise.all(imgs.map((im) => im.decode())).then(
    () => {
      if (dead) return
      quad.texture('uA', imgs[0], true)
      quad.texture('uB', imgs[1], true)
      quad.texture('uC', imgs[2], true)
      let ready = false
      stop = loopWhileVisible(canvas, (t) => {
        const ext = vw() * 0.4
        canvas.style.top = `${-ext}px`
        canvas.style.height = `calc(100% + ${ext}px)`
        const [w, h] = quad.resize(Math.min(1, window.devicePixelRatio || 1))
        const W = canvas.clientWidth
        const H = canvas.clientHeight - ext
        const k = w / W
        quad.set('uRes', w, h)
        quad.set('uT', t)
        const p = progress()
        const rise = 1 - span(p, 0, 0.35)
        const out = span(p, 0.42, 1)
        const mobile = vw() < 768
        LAYERS.forEach((L, i) => {
          const lw = W * L.scale
          const lh = lw * L.ratio
          const top = ext + (mobile ? L.topM * vw() : L.top[0] * vw() + L.top[1] * H)
          const y = top + rise * rise * 0.38 * lh - Math.pow(out, 1.4) * L.up * lh
          const dissolve = span(p, 0.45 + i * 0.03, 0.97)
          const a = L.alpha * (1 - span(p, 0.94, 1))
          quad.set(`uR${i}`, y * k, lh * k, lw * k, (t * L.drift) * k)
          quad.set(`uP${i}`, a, dissolve, L.blur, L.light)
        })
        quad.gl.clearColor(0, 0, 0, 0)
        quad.gl.clear(quad.gl.COLOR_BUFFER_BIT)
        quad.draw()
        if (!ready) {
          ready = true
          onReady()
        }
      })
    },
    () => {},
  )
  return () => {
    dead = true
    stop?.()
    quad.dispose()
  }
}
