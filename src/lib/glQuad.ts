/**
 * Kleine WebGL2-Hilfe für bildschirmfüllende Shader-Flächen (Papierkante, Pflanzen, Wolken): ein Rechteck, ein
 * Fragment-Shader, Uniforms, optionale Texturen. Gezeichnet wird nur, solange die Fläche sichtbar ist (siehe loop).
 * Ohne WebGL2 liefert createQuad null; die Aufrufer zeigen dann ihr festes Bild.
 */
const VS = `#version 300 es
in vec2 p;
out vec2 vUv;
void main() {
  vUv = vec2(p.x, 1.0 - p.y);
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`

/** Wertrauschen und fbm, für alle Shader gleich (vor den eigenen Code gesetzt) */
export const GLSL_NOISE = `
float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) { float s = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { s += a * noise(p); p = p * 2.03 + 17.1; a *= 0.5; } return s; }
`

export type Quad = {
  gl: WebGL2RenderingContext
  /** Uniform setzen (float, vec2, vec3, vec4 je nach Anzahl der Werte) */
  set: (name: string, ...v: number[]) => void
  /** Zeichenfläche an die CSS-Größe anpassen (höchstens dpr), gibt die Größe in Gerätepixeln zurück */
  resize: (dpr?: number) => [number, number]
  draw: () => void
  /** Textur aus einem Bild laden (Einheit = Reihenfolge des Aufrufs) */
  texture: (name: string, img: TexImageSource) => void
  dispose: () => void
}

export function createQuad(canvas: HTMLCanvasElement, fs: string): Quad | null {
  const gl = canvas.getContext('webgl2', { premultipliedAlpha: true, alpha: true, antialias: false })
  if (!gl) return null
  const sh = (type: number, src: string) => {
    const s = gl.createShader(type)!
    gl.shaderSource(s, src)
    gl.compileShader(s)
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || 'shader')
    return s
  }
  const prog = gl.createProgram()!
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS))
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, fs))
  gl.linkProgram(prog)
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) || 'link')
  gl.useProgram(prog)
  const buf = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buf)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), gl.STATIC_DRAW)
  const loc = gl.getAttribLocation(prog, 'p')
  gl.enableVertexAttribArray(loc)
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
  const locs = new Map<string, WebGLUniformLocation | null>()
  const u = (n: string) => {
    if (!locs.has(n)) locs.set(n, gl.getUniformLocation(prog, n))
    return locs.get(n)!
  }
  const texs: WebGLTexture[] = []
  return {
    gl,
    set: (name, ...v) => {
      const l = u(name)
      if (!l) return
      if (v.length === 1) gl.uniform1f(l, v[0])
      else if (v.length === 2) gl.uniform2f(l, v[0], v[1])
      else if (v.length === 3) gl.uniform3f(l, v[0], v[1], v[2])
      else gl.uniform4f(l, v[0], v[1], v[2], v[3])
    },
    resize: (dpr = Math.min(1.5, window.devicePixelRatio || 1)) => {
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr))
      const h = Math.max(1, Math.round(canvas.clientHeight * dpr))
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
      }
      gl.viewport(0, 0, w, h)
      return [w, h]
    },
    draw: () => gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4),
    texture: (name, img) => {
      const unit = texs.length
      const t = gl.createTexture()!
      texs.push(t)
      gl.activeTexture(gl.TEXTURE0 + unit)
      gl.bindTexture(gl.TEXTURE_2D, t)
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
      gl.generateMipmap(gl.TEXTURE_2D)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.uniform1i(u(name), unit)
    },
    dispose: () => {
      texs.forEach((t) => gl.deleteTexture(t))
      gl.deleteBuffer(buf)
      gl.deleteProgram(prog)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    },
  }
}

/**
 * Zeichenschleife, die nur läuft, solange el im Bild und der Tab sichtbar ist. frame(t, dt) bekommt Sekunden.
 * Gibt eine Funktion zum Beenden zurück.
 */
export function loopWhileVisible(el: Element, frame: (t: number, dt: number) => void, margin = '120px') {
  let raf = 0
  let seen = false
  let last = 0
  let t = 0
  const tick = (now: number) => {
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 0
    last = now
    t += dt
    frame(t, dt)
    raf = requestAnimationFrame(tick)
  }
  const start = () => {
    if (!raf && seen && document.visibilityState === 'visible') {
      last = 0
      raf = requestAnimationFrame(tick)
    }
  }
  const stop = () => {
    cancelAnimationFrame(raf)
    raf = 0
  }
  const io = new IntersectionObserver(
    ([e]) => {
      seen = e.isIntersecting
      if (seen) start()
      else stop()
    },
    { rootMargin: margin },
  )
  io.observe(el)
  const vis = () => (document.visibilityState === 'visible' ? start() : stop())
  document.addEventListener('visibilitychange', vis)
  return () => {
    stop()
    io.disconnect()
    document.removeEventListener('visibilitychange', vis)
  }
}
