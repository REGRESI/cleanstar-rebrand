/**
 * Wasser-Effekt für Leistungsfotos: Beim Überfahren mit der Maus bricht sich das Licht entlang der Bewegung,
 * als würde ein feuchtes Tuch über die Fläche wischen. Die Spur läuft nach etwa einer Sekunde aus.
 * Reines WebGL (keine Bibliothek), gezeichnet wird nur, solange eine Spur lebt.
 */
const VS = `attribute vec2 p;varying vec2 uv;void main(){uv=p*.5+.5;uv.y=1.-uv.y;gl_Position=vec4(p,0.,1.);}`
const N = 24
const FS = `precision mediump float;
varying vec2 uv;
uniform sampler2D tex;
uniform vec2 cover;   // Skalierung für object-cover
uniform vec2 focus;   // object-position (0..1)
uniform float aspect; // Breite / Höhe der Fläche
uniform vec3 pts[${N}]; // x, y, Alter (0..1, >=1 = tot)
void main(){
  vec2 off = vec2(0.);
  float light = 0.;
  for (int i = 0; i < ${N}; i++) {
    vec3 q = pts[i];
    if (q.z >= 1.) continue;
    vec2 d = uv - q.xy;
    d.x *= aspect;
    float r = length(d);
    float k = (1. - q.z) * (1. - q.z);
    // Welle läuft nach außen, klingt mit Abstand und Alter ab
    float w = sin(r * 70. - q.z * 9.) * exp(-r * 16.) * k;
    off += normalize(d + 1e-5) * w * 0.006;
    light += w * 0.035;
  }
  vec2 t = (uv + off - 0.5) * cover + 0.5 + (focus - 0.5) * (1. - cover);
  vec4 c = texture2D(tex, t);
  gl_FragColor = vec4(c.rgb + light, 1.);
}`

export interface Water {
  move: (x: number, y: number) => void
  destroy: () => void
}

/** Nur am Desktop mit Maus, mit Bewegungswunsch und WebGL */
export function waterSupported() {
  if (typeof window === 'undefined') return false
  if (!matchMedia('(pointer: fine) and (min-width: 1024px)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  try {
    return !!document.createElement('canvas').getContext('webgl')
  } catch {
    return false
  }
}

export function createWater(canvas: HTMLCanvasElement, img: HTMLImageElement, focus: [number, number], onActive: (on: boolean) => void): Water | null {
  const gl = canvas.getContext('webgl', { premultipliedAlpha: false, antialias: false })
  if (!gl) return null
  const sh = (type: number, src: string) => {
    const s = gl.createShader(type)!
    gl.shaderSource(s, src)
    gl.compileShader(s)
    return s
  }
  const prog = gl.createProgram()!
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS))
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS))
  gl.linkProgram(prog)
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null
  gl.useProgram(prog)
  const buf = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buf)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
  const loc = gl.getAttribLocation(prog, 'p')
  gl.enableVertexAttribArray(loc)
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
  const tex = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, tex)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  try {
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img)
  } catch {
    return null
  }
  const u = (n: string) => gl.getUniformLocation(prog, n)
  const uCover = u('cover')
  const uAspect = u('aspect')
  const uPts = u('pts')
  gl.uniform2f(u('focus'), focus[0], focus[1])

  const pts: { x: number; y: number; t: number }[] = []
  let raf = 0
  let last = 0
  const LIFE = 1000

  const size = () => {
    const r = canvas.getBoundingClientRect()
    const dpr = Math.min(2, devicePixelRatio || 1)
    canvas.width = Math.round(r.width * dpr)
    canvas.height = Math.round(r.height * dpr)
    gl.viewport(0, 0, canvas.width, canvas.height)
    const a = r.width / r.height
    const ia = img.naturalWidth / img.naturalHeight
    // object-cover: die kürzere Seite füllt, die längere wird beschnitten
    gl.uniform2f(uCover, a > ia ? 1 : a / ia, a > ia ? ia / a : 1)
    gl.uniform1f(uAspect, a)
  }
  size()

  const draw = (now: number) => {
    const data = new Float32Array(N * 3)
    let alive = 0
    for (let i = 0; i < N; i++) {
      const p = pts[i]
      const age = p ? (now - p.t) / LIFE : 1
      data.set([p?.x ?? 0, p?.y ?? 0, Math.min(1, age)], i * 3)
      if (age < 1) alive++
    }
    gl.uniform3fv(uPts, data)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    if (alive) raf = requestAnimationFrame(draw)
    else {
      raf = 0
      onActive(false)
    }
  }

  return {
    move(x, y) {
      const now = performance.now()
      // höchstens alle 40 ms ein neuer Punkt der Spur
      if (now - last < 40) return
      last = now
      pts.push({ x, y, t: now })
      if (pts.length > N) pts.shift()
      if (!raf) {
        size()
        onActive(true)
        raf = requestAnimationFrame(draw)
      }
    },
    destroy() {
      cancelAnimationFrame(raf)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    },
  }
}
