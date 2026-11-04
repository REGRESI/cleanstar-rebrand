import{c as h,G as m,l as p}from"./glQuad-DEJ_hlwE.js";const v=`#version 300 es
precision highp float;
in vec2 vUv;
uniform vec2 uRes;   // CSS-Pixel
uniform float uT;    // Sekunden
uniform float uS;    // Scrollweg in Pixeln
uniform float uA;    // Amplitude der großen Form
uniform float uMid;  // mittlere Lage der Kante
uniform float uK;    // Maßstab der Rissform (Handy feiner)
uniform vec3 uPaper;
out vec4 o;
${m}
void main() {
  float x = vUv.x * uRes.x;
  float y = vUv.y * uRes.y;
  float s = uS, t = uT, k = uK;
  // große Berge, mittlere Buckel, kleine Zacken; jede Oktave wandert anders zur Seite
  float n1 = noise(vec2((x + s * 0.22) / (560.0 * k), s * 0.0016 + t * 0.05)) - 0.5;
  float n2 = noise(vec2((x - s * 0.35) / (210.0 * k) + 7.0, s * 0.0032 + t * 0.08)) - 0.5;
  float n3 = noise(vec2((x + s * 0.5) / (74.0 * k) + 3.0, s * 0.006 + t * 0.12)) - 0.5;
  float n4 = noise(vec2(x / (26.0 * k) + 11.0, s * 0.012 + t * 0.2)) - 0.5;
  float n5 = noise(vec2(x / (8.0 * k), s * 0.03 + t * 0.4)) - 0.5;
  float tilt = (noise(vec2(5.3, s * 0.0011 + t * 0.03)) - 0.5) * 2.0;
  float b = uMid + uA * (1.5 * n1 + 0.6 * n2) + 16.0 * k * n3 + 6.0 * k * n4 + 2.2 * n5
          + tilt * (x / uRes.x - 0.5) * uA * 0.9;
  float d = y - b; // > 0 unter der Kante

  // Schatten unter der Kante
  float sh = 0.34 * exp(-max(d, 0.0) / 14.0) + 0.14 * exp(-max(d, 0.0) / 46.0);
  sh *= smoothstep(-1.0, 2.0, d);
  vec4 col = vec4(vec3(0.04, 0.10, 0.20) * sh, sh);

  // heller Faserrand außerhalb des Papiers: dichtes, halbdurchsichtiges Fasergewebe, flackert leicht
  float bw = (7.0 + 6.0 * noise(vec2(x / 30.0, s * 0.01 + t * 0.25)) + 2.0 * noise(vec2(x / 7.0, t * 0.9 + s * 0.02))) * mix(0.7, 1.0, k);
  // Gewebe: unregelmäßig, nahe am Papier dicht und weiß, nach außen flockig
  float weave = 0.35 + 0.65 * fbm(vec2(x / 2.4 + d * 0.35, d / 2.2 + t * 0.2));
  float core = smoothstep(0.45 * bw, 0.0, d);
  float band = step(0.0, d) * max(core, smoothstep(bw, 0.2 * bw, d) * smoothstep(0.42, 0.62, weave));
  // vereinzelte Haarfasern, schräg abstehend
  float hx = x + d * (noise(vec2(x / 40.0, 1.7)) - 0.5) * 1.6;
  float hl = pow(noise(vec2(hx / 1.6, s * 0.015 + t * 0.6)), 9.0) * 26.0;
  float hair = step(bw * 0.5, d) * step(d, bw + hl) * smoothstep(0.78, 0.97, noise(vec2(hx / 0.9, 3.1))) * 0.7;
  // kleine Papierfetzen kurz unter der Kante
  float bit = smoothstep(0.9, 0.93, noise(vec2(x / 6.0, y / 6.0) + vec2(s * 0.004, t * 0.05)));
  bit *= smoothstep(18.0, 8.0, d) * step(bw, d) * 0.9;
  float fa = clamp(max(max(band * 0.92, hair), bit), 0.0, 1.0);
  col = vec4(vec3(1.0) * fa, fa) + col * (1.0 - fa);

  // Papier: an der Rissstelle feine graue Faserlinie, dann die Papierfläche
  float wf = 0.72 + 0.28 * noise(vec2(x / 1.6, y / 5.0));
  float seam = exp(-abs(d + 2.0) / 1.8) * (1.0 - wf) * 0.5;
  vec3 pc = uPaper * (1.0 - 0.09 * seam);
  float pa = smoothstep(0.8, -0.8, d);
  o = vec4(pc, 1.0) * pa + col * (1.0 - pa);
}`;function w(t,d){let o;try{o=h(t,v)}catch{return null}if(!o)return null;const e=o,s=getComputedStyle(t.parentElement).backgroundColor.match(/[\d.]+/g)?.map(Number)??[247,249,251];e.set("uPaper",s[0]/255,s[1]/255,s[2]/255);let r=!1;const a=()=>{const n=window.innerHeight,l=window.innerWidth<768,i=Math.min(110,Math.max(40,n*(l?.065:.09))),c=i*1.15+12,f=Math.round(c+i*1.2+70);t.style.height=`${f}px`,e.set("uA",i),e.set("uMid",c),e.set("uK",l?.6:1)};a(),window.addEventListener("resize",a);const u=p(t,n=>{e.resize(),e.set("uRes",t.clientWidth,t.clientHeight),e.set("uT",n+40),e.set("uS",window.scrollY),e.draw(),r||(r=!0,d())});return()=>{u(),window.removeEventListener("resize",a),e.dispose()}}export{w as startPaperEdge};
