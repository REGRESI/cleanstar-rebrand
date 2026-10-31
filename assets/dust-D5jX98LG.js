const R=`#version 300 es
in vec2 p;
uniform vec4 uRect; // x, y, w, h in Pixeln (y nach unten)
uniform vec2 uRes;
out vec2 vUv;
void main() {
  vUv = p;
  vec2 px = uRect.xy + p * uRect.zw;
  gl_Position = vec4(px / uRes * 2.0 - 1.0, 0.0, 1.0);
  gl_Position.y = -gl_Position.y;
}`,g=`#version 300 es
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
}`,T=`#version 300 es
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
}`,A=`#version 300 es
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
}`;function x(r,o,i){const t=r.createProgram();for(const[e,s]of[[r.VERTEX_SHADER,o],[r.FRAGMENT_SHADER,i]]){const n=r.createShader(e);if(r.shaderSource(n,s),r.compileShader(n),!r.getShaderParameter(n,r.COMPILE_STATUS))throw new Error(r.getShaderInfoLog(n)??"shader");r.attachShader(t,n)}if(r.linkProgram(t),!r.getProgramParameter(t,r.LINK_STATUS))throw new Error(r.getProgramInfoLog(t)??"link");return t}function _(){try{const o=document.createElement("canvas").getContext("webgl2");if(!o)return!1;const i=o.getExtension("WEBGL_debug_renderer_info"),t=i?String(o.getParameter(i.UNMASKED_RENDERER_WEBGL)):"";return o.getExtension("WEBGL_lose_context")?.loseContext(),!(/swiftshader|llvmpipe|software|basic render/i.test(t)&&!/[?&]force/.test(location.search))}catch{return!1}}function w(r){const o=navigator,i=(o.hardwareConcurrency??8)<=4||(o.deviceMemory??8)<=4;return r?i?18e3:35e3:i?6e4:12e4}class U{constructor(o,i,t){this.canvas=o;const e=o.getContext("webgl2",{alpha:!0,antialias:!1,premultipliedAlpha:!0,powerPreference:"high-performance"});if(!e)throw new Error("webgl2");this.gl=e,o.addEventListener("webglcontextlost",()=>this.lost=!0),this.quad=x(e,R,g),this.pts=x(e,T,A),this.qVao=e.createVertexArray(),e.bindVertexArray(this.qVao);const s=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,s),e.bufferData(e.ARRAY_BUFFER,new Float32Array([0,0,1,0,0,1,1,1]),e.STATIC_DRAW);const n=e.getAttribLocation(this.quad,"p");e.enableVertexAttribArray(n),e.vertexAttribPointer(n,2,e.FLOAT,!1,0,0);const l=16/9;this.cols=Math.round(Math.sqrt(t*l));const h=Math.round(this.cols/l);this.count=this.cols*h;const c=new Float32Array(this.count*2),f=new Float32Array(this.count*4);let v=1234567;const p=()=>((v=v*16807%2147483647)-1)/2147483646;for(let u=0,a=0;u<h;u++)for(let d=0;d<this.cols;d++,a++){c[a*2]=(d+.5)/this.cols,c[a*2+1]=(u+.5)/h;for(let m=0;m<4;m++)f[a*4+m]=p()}this.pVao=e.createVertexArray(),e.bindVertexArray(this.pVao);for(const[u,a,d]of[["aUv",c,2],["aRnd",f,4]]){const m=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,m),e.bufferData(e.ARRAY_BUFFER,a,e.STATIC_DRAW);const E=e.getAttribLocation(this.pts,u);e.enableVertexAttribArray(E),e.vertexAttribPointer(E,d,e.FLOAT,!1,0,0)}e.bindVertexArray(null);for(const u of[i.a,i.lines,i.b]){const a=e.createTexture();e.bindTexture(e.TEXTURE_2D,a),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,e.NONE),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,u),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),this.tex.push(a)}}canvas;gl;quad;pts;qVao;pVao;tex=[];count;cols;rect={x:0,y:0,w:1,h:1};clip={x:0,y:0,w:1,h:1};dpr=1;lost=!1;motion=1;get points(){return this.count}resize(o,i,t,e,s){this.dpr=s,this.canvas.width=Math.round(o*s),this.canvas.height=Math.round(i*s),this.rect=t,this.clip=e}render(o,i){if(this.lost)return;const t=this.gl,e=this.dpr,s=[this.rect.x*e,this.rect.y*e,this.rect.w*e,this.rect.h*e],n=[this.canvas.width,this.canvas.height],l=.05;t.viewport(0,0,n[0],n[1]),t.clearColor(0,0,0,0),t.clear(t.COLOR_BUFFER_BIT);const h=(v,p)=>p.forEach((u,a)=>{t.activeTexture(t.TEXTURE0+a),t.bindTexture(t.TEXTURE_2D,this.tex[[0,1,2][a]]),t.uniform1i(t.getUniformLocation(v,u),a)});t.disable(t.BLEND);const c=this.clip;t.enable(t.SCISSOR_TEST),t.scissor(Math.round(c.x*e),Math.round(n[1]-(c.y+c.h)*e),Math.round(c.w*e),Math.round(c.h*e)),t.useProgram(this.quad),h(this.quad,["uA","uL","uB"]),t.uniform4fv(t.getUniformLocation(this.quad,"uRect"),s),t.uniform2fv(t.getUniformLocation(this.quad,"uRes"),n),t.uniform1f(t.getUniformLocation(this.quad,"uEdge"),o),t.uniform1f(t.getUniformLocation(this.quad,"uSpread"),l);const f=o<=1?o:o-1;t.uniform1f(t.getUniformLocation(this.quad,"uGlow"),f>.002&&f<.998?1:0),t.bindVertexArray(this.qVao),t.drawArrays(t.TRIANGLE_STRIP,0,4),t.disable(t.SCISSOR_TEST),f>.002&&f<.998&&(t.enable(t.BLEND),t.blendFunc(t.ONE,t.ONE_MINUS_SRC_ALPHA),t.useProgram(this.pts),t.activeTexture(t.TEXTURE0),t.bindTexture(t.TEXTURE_2D,this.tex[0]),t.uniform1i(t.getUniformLocation(this.pts,"uA"),0),t.activeTexture(t.TEXTURE1),t.bindTexture(t.TEXTURE_2D,this.tex[2]),t.uniform1i(t.getUniformLocation(this.pts,"uB"),1),t.uniform4fv(t.getUniformLocation(this.pts,"uRect"),s),t.uniform2fv(t.getUniformLocation(this.pts,"uRes"),n),t.uniform1f(t.getUniformLocation(this.pts,"uEdge"),o),t.uniform1f(t.getUniformLocation(this.pts,"uSpread"),l),t.uniform1f(t.getUniformLocation(this.pts,"uTime"),i),t.uniform1f(t.getUniformLocation(this.pts,"uCell"),s[2]/this.cols),t.uniform1f(t.getUniformLocation(this.pts,"uLife"),.32),t.uniform1f(t.getUniformLocation(this.pts,"uLead"),.36),t.uniform1f(t.getUniformLocation(this.pts,"uMotion"),this.motion*e),t.bindVertexArray(this.pVao),t.drawArrays(t.POINTS,0,this.count)),t.bindVertexArray(null)}destroy(){const o=this.gl;this.tex.forEach(i=>o.deleteTexture(i)),o.deleteProgram(this.quad),o.deleteProgram(this.pts),o.getExtension("WEBGL_lose_context")?.loseContext()}}export{U as Dust,_ as dustSupported,w as particleBudget};
