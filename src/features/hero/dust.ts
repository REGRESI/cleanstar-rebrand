/**
 * Hero „Das Büro zerfällt zu Staub und wird zum Plan“ in WebGL2 (ohne Bibliothek, eigener Chunk).
 *
 * Eine gemeinsame Größe steuert alles: die Kante e (0 bis 2).
 *  0 bis 1  Zerfall: Eine helle Lichtkante zieht von links nach rechts durch das Abendfoto. Hinter ihr lösen sich die
 *           Pixel als Partikel (Farbe aus dem Foto), wirbeln kurz und treiben weg; darunter bleibt der Plan
 *           (Linienzeichnung desselben Büros, siehe scripts/line-art.py).
 *  1 bis 2  Zusammensetzen: Die Partikel fliegen zurück und setzen sich hinter einer zweiten Lichtkante zum Morgenfoto
 *           zusammen.
 * Tiefe: Helligkeit des Pixels plus Zufall; tiefere Partikel bewegen sich stärker und werden größer (räumlicher Zerfall).
 * Bewegung im Vertex-Shader (Rauschen, Wirbel, Drift), gezeichnet wird nur, solange sich etwas ändert.
 */

const VS_QUAD = `#version 300 es
in vec2 p;
uniform vec4 uRect; // x, y, w, h in Pixeln (y nach unten)
uniform vec2 uRes;
out vec2 vUv;
void main() {
  vUv = p;
  vec2 px = uRect.xy + p * uRect.zw;
  gl_Position = vec4(px / uRes * 2.0 - 1.0, 0.0, 1.0);
  gl_Position.y = -gl_Position.y;
}`

const FS_QUAD = `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uA;
uniform sampler2D uL;
uniform sampler2D uB;
uniform float uEdge;
uniform float uSpread;
uniform float uGlow;
out vec4 o;
float front(float e) { return e * (1.0 + 2.0 * uSpread) - uSpread; }
void main() {
  vec3 a = texture(uA, vUv).rgb;
  vec3 l = texture(uL, vUv).rgb;
  vec3 b = texture(uB, vUv).rgb;
  float x = vUv.x;
  vec3 col;
  float f;
  if (uEdge <= 1.0) {
    f = front(uEdge);
    col = mix(l, a, smoothstep(f - 0.004, f + 0.004, x));
  } else {
    f = front(uEdge - 1.0);
    col = mix(b, l, smoothstep(f - 0.004, f + 0.004, x));
  }
  // Lichtkante: schmaler heller Kern, weicher Schein
  float d = x - f;
  float core = exp(-pow(d / 0.0022, 2.0));
  float halo = exp(-pow(d / 0.03, 2.0)) * 0.28 + exp(-pow(d / 0.11, 2.0)) * 0.08;
  col += (vec3(1.0) - col) * core * 0.92 * uGlow;
  col += vec3(0.55, 0.7, 1.0) * halo * uGlow;
  o = vec4(col, 1.0);
}`

const VS_PTS = `#version 300 es
in vec2 aUv;
in vec4 aRnd;
uniform vec4 uRect;
uniform vec2 uRes;
uniform float uEdge;
uniform float uSpread;
uniform float uTime;
uniform float uCell;
uniform float uLife;
uniform float uLead;
uniform float uMotion;
uniform sampler2D uA;
uniform sampler2D uB;
out vec4 vCol;
float front(float e) { return e * (1.0 + 2.0 * uSpread) - uSpread; }
out float vRound;
// Verschiebung eines gelösten Partikels nach Lebensanteil t (0 = am Platz, 1 = weggetrieben)
vec3 drift(float t, vec2 uv, vec4 r) {
  float depth = r.y;
  // kurzer Wirbel direkt nach dem Lösen, dann Drift nach rechts oben mit Rauschen
  float swirlA = r.z * 6.2832 + t * (7.0 + 6.0 * r.w);
  float swirlR = (14.0 + 34.0 * r.w) * smoothstep(0.0, 0.18, t);
  vec2 sw = vec2(cos(swirlA), sin(swirlA)) * swirlR;
  vec2 flow = vec2(sin(uv.y * 11.0 + r.x * 6.0 + uTime * 0.7), cos(uv.x * 9.0 + r.z * 5.0 - uTime * 0.6));
  vec2 away = vec2(0.45 + 1.0 * r.x, -0.25 - 0.9 * r.y) * (220.0 + 520.0 * depth);
  vec2 off = sw + flow * 70.0 * t + away * pow(t, 1.5);
  return vec3(off * uMotion, depth);
}
void main() {
  vec2 home = uRect.xy + aUv * uRect.zw;
  float x = aUv.x + (aRnd.x - 0.5) * 0.035;
  float alpha = 0.0;
  float heat = 0.0;
  float t = 0.0;
  vec3 col;
  if (uEdge <= 1.0) {
    float s = (front(uEdge) - x) / uLife;
    col = textureLod(uA, aUv, 0.0).rgb;
    if (s > 0.0 && s < 1.0) {
      t = s;
      alpha = pow(1.0 - s, 1.2);
      heat = 1.0 - smoothstep(0.0, 0.08, s);
    }
  } else {
    float k = 1.0 + (front(uEdge - 1.0) - x) / uLead;
    col = textureLod(uB, aUv, 0.0).rgb;
    if (k > 0.0 && k < 1.0) {
      t = 1.0 - k;
      alpha = smoothstep(0.0, 0.3, k);
      heat = smoothstep(0.82, 1.0, k);
    }
  }
  if (alpha <= 0.002) {
    gl_Position = vec4(2.0, 2.0, 0.0, 1.0);
    gl_PointSize = 0.0;
    vCol = vec4(0.0);
    vRound = 0.0;
    return;
  }
  vec3 d = drift(t, aUv, aRnd);
  float lum = dot(col, vec3(0.299, 0.587, 0.114));
  float depth = clamp(d.z * 0.7 + lum * 0.6 - 0.2, 0.0, 1.0);
  vec2 pos = home + d.xy;
  // Pseudo-Tiefe: tiefer liegende Partikel weichen nach außen (Perspektive) und werden größer
  vec2 c = uRes * 0.5;
  pos = c + (pos - c) * (1.0 + depth * t * 0.45 * uMotion);
  gl_Position = vec4(pos / uRes * 2.0 - 1.0, 0.0, 1.0);
  gl_Position.y = -gl_Position.y;
  // am Platz deckt der Punkt seine Zelle (wirkt wie ein Pixel), gelöst wird er zu feinem, rundem Staub
  float fine = smoothstep(0.0, 0.16, t);
  gl_PointSize = uCell * mix(1.3, 0.75 + depth * 0.9, fine);
  vRound = fine;
  col = mix(col, vec3(1.0), heat * 0.55);
  vCol = vec4(col, alpha);
}`

const FS_PTS = `#version 300 es
precision mediump float;
in vec4 vCol;
in float vRound;
out vec4 o;
void main() {
  vec2 q = gl_PointCoord * 2.0 - 1.0;
  // Quadrat (Pixel) → Kreis (Staub)
  float sq = max(abs(q.x), abs(q.y));
  float r = mix(sq * sq, dot(q, q), vRound);
  float a = vCol.a * (1.0 - smoothstep(0.62, 1.0, r));
  if (a < 0.01) discard;
  o = vec4(vCol.rgb * a, a);
}`

function compile(gl: WebGL2RenderingContext, vs: string, fs: string) {
  const prog = gl.createProgram()!
  for (const [type, src] of [
    [gl.VERTEX_SHADER, vs],
    [gl.FRAGMENT_SHADER, fs],
  ] as const) {
    const sh = gl.createShader(type)!
    gl.shaderSource(sh, src)
    gl.compileShader(sh)
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh) ?? 'shader')
    gl.attachShader(prog, sh)
  }
  gl.linkProgram(prog)
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) ?? 'link')
  return prog
}

/** Software-Renderer (kein Grafikchip) oder kein WebGL2: Ersatz mit Überblendungen */
export function dustSupported(): boolean {
  try {
    const c = document.createElement('canvas')
    const gl = c.getContext('webgl2')
    if (!gl) return false
    const ext = gl.getExtension('WEBGL_debug_renderer_info')
    const r = ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : ''
    gl.getExtension('WEBGL_lose_context')?.loseContext()
    if (/swiftshader|llvmpipe|software|basic render/i.test(r) && !/[?&]force/.test(location.search)) return false
    return true
  } catch {
    return false
  }
}

/** Partikelzahl je Gerät: Richtwert 120.000 (Desktop), 35.000 (Handy), schwächere Geräte weniger */
export function particleBudget(mobile: boolean) {
  const nav = navigator as Navigator & { deviceMemory?: number }
  const weak = (nav.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 4
  if (mobile) return weak ? 18000 : 35000
  return weak ? 60000 : 120000
}

export interface Rect {
  x: number
  y: number
  w: number
  h: number
}

export class Dust {
  private gl: WebGL2RenderingContext
  private quad: WebGLProgram
  private pts: WebGLProgram
  private qVao: WebGLVertexArrayObject
  private pVao: WebGLVertexArrayObject
  private tex: WebGLTexture[] = []
  private count: number
  private cols: number
  private rect: Rect = { x: 0, y: 0, w: 1, h: 1 }
  private clip: Rect = { x: 0, y: 0, w: 1, h: 1 }
  private dpr = 1
  private lost = false
  motion = 1

  constructor(
    private canvas: HTMLCanvasElement,
    imgs: { a: TexImageSource; lines: TexImageSource; b: TexImageSource },
    count: number,
  ) {
    const gl = canvas.getContext('webgl2', { alpha: true, antialias: false, premultipliedAlpha: true, powerPreference: 'high-performance' })
    if (!gl) throw new Error('webgl2')
    this.gl = gl
    canvas.addEventListener('webglcontextlost', () => (this.lost = true))
    this.quad = compile(gl, VS_QUAD, FS_QUAD)
    this.pts = compile(gl, VS_PTS, FS_PTS)

    // Bildfläche
    this.qVao = gl.createVertexArray()!
    gl.bindVertexArray(this.qVao)
    const qb = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, qb)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), gl.STATIC_DRAW)
    const qp = gl.getAttribLocation(this.quad, 'p')
    gl.enableVertexAttribArray(qp)
    gl.vertexAttribPointer(qp, 2, gl.FLOAT, false, 0, 0)

    // Partikel: Raster im Seitenverhältnis 16:9, je Punkt Bildkoordinate und vier Zufallswerte
    const aspect = 16 / 9
    this.cols = Math.round(Math.sqrt(count * aspect))
    const rows = Math.round(this.cols / aspect)
    this.count = this.cols * rows
    const uv = new Float32Array(this.count * 2)
    const rnd = new Float32Array(this.count * 4)
    let seed = 1234567
    const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646
    for (let j = 0, i = 0; j < rows; j++)
      for (let k = 0; k < this.cols; k++, i++) {
        uv[i * 2] = (k + 0.5) / this.cols
        uv[i * 2 + 1] = (j + 0.5) / rows
        for (let c = 0; c < 4; c++) rnd[i * 4 + c] = rand()
      }
    this.pVao = gl.createVertexArray()!
    gl.bindVertexArray(this.pVao)
    for (const [name, data, size] of [
      ['aUv', uv, 2],
      ['aRnd', rnd, 4],
    ] as const) {
      const b = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, b)
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
      const loc = gl.getAttribLocation(this.pts, name)
      gl.enableVertexAttribArray(loc)
      gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0)
    }
    gl.bindVertexArray(null)

    for (const img of [imgs.a, imgs.lines, imgs.b]) {
      const t = gl.createTexture()!
      gl.bindTexture(gl.TEXTURE_2D, t)
      gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      this.tex.push(t)
    }
  }

  get points() {
    return this.count
  }

  /** Größe der Zeichenfläche (CSS-Pixel), Lage des Fotos darin (wie object-cover) und sichtbares Bildfenster */
  resize(w: number, h: number, rect: Rect, clip: Rect, dpr: number) {
    this.dpr = dpr
    this.canvas.width = Math.round(w * dpr)
    this.canvas.height = Math.round(h * dpr)
    this.rect = rect
    this.clip = clip
  }

  render(edge: number, time: number) {
    if (this.lost) return
    const gl = this.gl
    const d = this.dpr
    const r = [this.rect.x * d, this.rect.y * d, this.rect.w * d, this.rect.h * d]
    const res = [this.canvas.width, this.canvas.height]
    const spread = 0.05
    gl.viewport(0, 0, res[0], res[1])
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)

    const bind = (prog: WebGLProgram, names: string[]) =>
      names.forEach((n, i) => {
        gl.activeTexture(gl.TEXTURE0 + i)
        gl.bindTexture(gl.TEXTURE_2D, this.tex[[0, 1, 2][i]])
        gl.uniform1i(gl.getUniformLocation(prog, n), i)
      })

    gl.disable(gl.BLEND)
    // Foto und Plan nur im Bildfenster (Handy: Fenster oben), die Partikel dürfen darüber hinaus treiben
    const c = this.clip
    gl.enable(gl.SCISSOR_TEST)
    gl.scissor(Math.round(c.x * d), Math.round(res[1] - (c.y + c.h) * d), Math.round(c.w * d), Math.round(c.h * d))
    gl.useProgram(this.quad)
    bind(this.quad, ['uA', 'uL', 'uB'])
    gl.uniform4fv(gl.getUniformLocation(this.quad, 'uRect'), r)
    gl.uniform2fv(gl.getUniformLocation(this.quad, 'uRes'), res)
    gl.uniform1f(gl.getUniformLocation(this.quad, 'uEdge'), edge)
    gl.uniform1f(gl.getUniformLocation(this.quad, 'uSpread'), spread)
    // Lichtkante nur, solange sie im Bild läuft
    const local = edge <= 1 ? edge : edge - 1
    gl.uniform1f(gl.getUniformLocation(this.quad, 'uGlow'), local > 0.002 && local < 0.998 ? 1 : 0)
    gl.bindVertexArray(this.qVao)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    gl.disable(gl.SCISSOR_TEST)

    if (local > 0.002 && local < 0.998) {
      gl.enable(gl.BLEND)
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
      gl.useProgram(this.pts)
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, this.tex[0])
      gl.uniform1i(gl.getUniformLocation(this.pts, 'uA'), 0)
      gl.activeTexture(gl.TEXTURE1)
      gl.bindTexture(gl.TEXTURE_2D, this.tex[2])
      gl.uniform1i(gl.getUniformLocation(this.pts, 'uB'), 1)
      gl.uniform4fv(gl.getUniformLocation(this.pts, 'uRect'), r)
      gl.uniform2fv(gl.getUniformLocation(this.pts, 'uRes'), res)
      gl.uniform1f(gl.getUniformLocation(this.pts, 'uEdge'), edge)
      gl.uniform1f(gl.getUniformLocation(this.pts, 'uSpread'), spread)
      gl.uniform1f(gl.getUniformLocation(this.pts, 'uTime'), time)
      gl.uniform1f(gl.getUniformLocation(this.pts, 'uCell'), r[2] / this.cols)
      gl.uniform1f(gl.getUniformLocation(this.pts, 'uLife'), 0.32)
      gl.uniform1f(gl.getUniformLocation(this.pts, 'uLead'), 0.36)
      gl.uniform1f(gl.getUniformLocation(this.pts, 'uMotion'), this.motion * d)
      gl.bindVertexArray(this.pVao)
      gl.drawArrays(gl.POINTS, 0, this.count)
    }
    gl.bindVertexArray(null)
  }

  destroy() {
    const gl = this.gl
    this.tex.forEach((t) => gl.deleteTexture(t))
    gl.deleteProgram(this.quad)
    gl.deleteProgram(this.pts)
    gl.getExtension('WEBGL_lose_context')?.loseContext()
  }
}
