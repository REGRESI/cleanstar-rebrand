import { createQuad, GLSL_NOISE, loopWhileVisible } from '@/lib/glQuad'

/**
 * Wind für die freigestellten Eck-Pflanzen (Referenz ERA era/03): Das Pflanzenbild liegt als Textur auf einer
 * WebGL-Fläche und wird pro Bildpunkt verschoben. Die Verschiebung wächst mit dem Abstand vom Befestigungspunkt (oben
 * hängend bzw. aus der Ecke wachsend): der Ansatz bleibt fast ruhig, die Spitzen schwingen am meisten. Wind aus mehreren
 * langsamen Sinus-Wellen (Perioden 3 bis 7 s) plus Rauschen, damit nicht alles im Gleichtakt wackelt. Dazu ein
 * Feder-Schwung bei schnellem Scrollen und ein leichtes Ausweichen der Blätter, wenn die Maus nah vorbeifährt.
 * Die Zeichenfläche ist etwas größer als das Bild (Rand M), damit schwingende Spitzen nicht abgeschnitten werden.
 */
const M = 0.06
const FS = `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uTex;
uniform float uT;
uniform float uCorner;   // 0: hängt von oben, 1: wächst aus der Ecke unten links
uniform float uAmp;      // Auslenkung an den Spitzen (Anteil der Bildbreite)
uniform float uKick;     // Feder-Schwung vom Scrollen
uniform vec3 uMouse;     // x, y in Bildkoordinaten, Stärke
uniform float uAspect;   // Breite / Höhe des Bilds
out vec4 o;
${GLSL_NOISE}
void main() {
  float m = ${M.toFixed(3)};
  vec2 uv = vUv * (1.0 + 2.0 * m) - m;
  // Abstand vom Befestigungspunkt (0 am Ansatz, 1 an den Spitzen)
  float w = uCorner < 0.5 ? clamp(uv.y, 0.0, 1.2) : clamp(length(vec2(uv.x, 1.0 - uv.y)) / 1.2, 0.0, 1.2);
  w = pow(w, 1.6);
  float t = uT;
  // Wind: drei langsame Wellen, entlang der Ranke phasenverschoben, plus Rauschen
  float along = uCorner < 0.5 ? uv.y : length(vec2(uv.x, 1.0 - uv.y));
  float wind = sin(t * 6.2832 / 6.3 + along * 2.6) * 0.55
             + sin(t * 6.2832 / 4.1 + along * 5.3 + uv.x * 2.0) * 0.28
             + sin(t * 6.2832 / 3.0 + along * 9.0 + 1.7) * 0.12
             + (noise(vec2(uv.x * 3.0 + t * 0.15, uv.y * 3.0 - t * 0.1)) - 0.5) * 0.7;
  vec2 dir = uCorner < 0.5 ? vec2(1.0, 0.18) : vec2(0.75, 0.55);
  vec2 d = dir * (wind * uAmp + uKick) * w;
  // Maus: Blätter in der Nähe weichen aus
  vec2 dm = uv - uMouse.xy;
  dm.y /= uAspect;
  float near = exp(-dot(dm, dm) / 0.012);
  d += normalize(dm + 1e-4) * near * uMouse.z * 0.035 * (0.3 + w);
  vec2 su = uv - d;
  vec4 c = texture(uTex, su);
  c *= step(0.0, su.x) * step(su.x, 1.0) * step(0.0, su.y) * step(su.y, 1.0);
  o = c;
}`

export type PlantHandle = { stop: () => void }

/** state: gemeinsamer Zustand des Abschnitts (Scroll-Schwung, Maus in Seitenkoordinaten) */
export function startPlant(img: HTMLImageElement, canvas: HTMLCanvasElement, corner: boolean, state: { kick: number; mx: number; my: number; mOn: number }, onReady: () => void) {
  let q
  try {
    q = createQuad(canvas, FS)
  } catch {
    return null
  }
  if (!q) return null
  const quad = q
  quad.gl.enable(quad.gl.BLEND)
  let ready = false
  const load = () => {
    quad.texture('uTex', img)
    quad.set('uCorner', corner ? 1 : 0)
    quad.set('uAspect', img.naturalWidth / img.naturalHeight)
    quad.set('uAmp', 0.02)
  }
  const go = () =>
    loopWhileVisible(canvas, (t) => {
      quad.resize()
      quad.set('uT', t + (corner ? 11 : 0))
      quad.set('uKick', state.kick * (corner ? 0.7 : 1))
      const r = img.getBoundingClientRect()
      quad.set('uMouse', (state.mx - r.left) / r.width, (state.my - r.top) / r.height, state.mOn)
      quad.gl.clearColor(0, 0, 0, 0)
      quad.gl.clear(quad.gl.COLOR_BUFFER_BIT)
      quad.draw()
      if (!ready) {
        ready = true
        onReady()
      }
    })
  let stop: (() => void) | null = null
  let dead = false
  const begin = () => {
    if (dead) return
    load()
    stop = go()
  }
  if (img.complete && img.naturalWidth) img.decode().then(begin, begin)
  else img.addEventListener('load', () => img.decode().then(begin, begin), { once: true })
  return () => {
    dead = true
    stop?.()
    quad.dispose()
  }
}

export const PLANT_MARGIN = M
