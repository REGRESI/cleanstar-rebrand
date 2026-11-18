import{c as m,G as h,l as g}from"./glQuad-DEJ_hlwE.js";const x=.06,w=`#version 300 es
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
${h}
void main() {
  float m = ${x.toFixed(3)};
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
}`;function k(t,s,l,n,d){let r;try{r=m(s,w)}catch{return null}if(!r)return null;const e=r;e.gl.enable(e.gl.BLEND);let a=!1;const v=()=>{e.texture("uTex",t),e.set("uCorner",l?1:0),e.set("uAspect",t.naturalWidth/t.naturalHeight),e.set("uAmp",.02)},f=()=>g(s,p=>{e.resize(),e.set("uT",p+(l?11:0)),e.set("uKick",n.kick*(l?.7:1));const o=t.getBoundingClientRect();e.set("uMouse",(n.mx-o.left)/o.width,(n.my-o.top)/o.height,n.mOn),e.gl.clearColor(0,0,0,0),e.gl.clear(e.gl.COLOR_BUFFER_BIT),e.draw(),a||(a=!0,d())});let i=null,c=!1;const u=()=>{c||(v(),i=f())};return t.complete&&t.naturalWidth?t.decode().then(u,u):t.addEventListener("load",()=>t.decode().then(u,u),{once:!0}),()=>{c=!0,i?.(),e.dispose()}}export{k as startPlant};
