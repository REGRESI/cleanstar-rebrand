import{c as E,G as F,l as _}from"./glQuad-GWTsCGl1.js";const I=`#version 300 es
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
${F}
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
  // Licht: Oberseite etwas heller, Unterseite leicht grau-blau (weich, innerhalb der Deckkraft)
  float au = texture(tex, q - vec2(0.0, 0.05), pm.z + 2.0).a;
  float ad = texture(tex, q + vec2(0.0, 0.05), pm.z + 2.0).a;
  float top = smoothstep(0.0, 0.6, c.a - au);
  float bot = smoothstep(0.0, 0.6, c.a - ad);
  vec3 rgb = c.rgb;
  rgb = mix(rgb, vec3(c.a), top * 0.22 * pm.w);
  rgb = mix(rgb, vec3(0.70, 0.77, 0.87) * c.a, clamp(bot * 0.35 + smoothstep(0.55, 1.0, v) * 0.15, 0.0, 1.0) * pm.w);
  rgb = min(rgb, vec3(c.a));
  rgb = mix(rgb, vec3(0.95, 0.97, 0.99) * c.a, pale);
  // weiche Oberkante, auslaufende Unterkante
  float f = smoothstep(0.0, 0.16, v) * smoothstep(1.0, 0.74, v);
  // Auflösen von unten nach oben in Fetzen
  float keep = 1.0;
  if (pm.y > 0.0) {
    vec2 fp = vec2(u * 3.2, v * 3.0) + seed + uT * 0.02;
    float field = v * 0.6 + (noise(fp) * 0.55 + noise(fp * 2.1 + 5.0) * 0.3 + noise(fp * 4.3 + 9.0) * 0.15) * 0.6;
    float cut = 1.25 - pm.y * 1.45;
    keep = 1.0 - smoothstep(cut - 0.06, cut + 0.06, field);
  }
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
}`,W=[{tex:"c",ratio:1136/1916,top:[-.36,0],topM:-.36,scale:.9,up:.16,drift:4,blur:2.2,light:.35,alpha:.82},{tex:"b",ratio:1080/1916,top:[-.31,.18],topM:-.1,scale:1.05,up:.3,drift:9,blur:1,light:.6,alpha:1},{tex:"a",ratio:821/1916,top:[-.22,.42],topM:.3,scale:1.25,up:.45,drift:16,blur:0,light:1,alpha:1},{tex:"b",ratio:1080/1916,top:[-.3,.66],topM:.4,scale:1.32,up:.55,drift:21,blur:0,light:1,alpha:1}],f=(l,c,v)=>Math.min(1,Math.max(0,(l-c)/(v-c)));function N(l,c,v,T){let m;try{m=E(l,I)}catch{return null}if(!m)return null;const e=m,r=()=>window.innerWidth,O=r()*Math.min(1.5,window.devicePixelRatio||1)>900;let R=!1,h=null;const i=["a","b","c"].map(u=>{const o=new Image;return o.decoding="async",o.src=`/images/deko/wolken-ebene-${u}-${O?1916:960}.webp`,o});return Promise.all(i.map(u=>u.decode())).then(()=>{if(R)return;e.texture("uA",i[0],!0),e.texture("uB",i[1],!0),e.texture("uC",i[2],!0);let u=!1,o=!1;const w=[.75,.55,.4];let d=0,n=0,g=0;h=_(l,(y,k)=>{if(k>0&&c()>.02&&c()<.98&&(n+=k,++g>=30||n>.5)){const t=n/g;if(t>.06||t>.022&&d===w.length-1){h?.(),T();return}t>.022&&d++,n=0,g=0}const s=r()*.4;l.style.top=`${-s}px`,l.style.height=`calc(100% + ${s}px)`;const a=c();if(a>=.999){o||(e.gl.disable(e.gl.SCISSOR_TEST),e.gl.clearColor(0,0,0,0),e.gl.clear(e.gl.COLOR_BUFFER_BIT),o=!0);return}o=!1;const[P,S]=e.resize(Math.min(w[d],window.devicePixelRatio||1)*(r()<768?1.33:1)),M=l.clientWidth,U=l.clientHeight-s,p=P/M;e.set("uRes",P,S),e.set("uT",y);const B=1-f(a,0,.35),q=f(a,.42,1),z=r()<768;W.forEach((t,x)=>{const C=M*t.scale,b=C*t.ratio,D=s+(z?t.topM*r():t.top[0]*r()+t.top[1]*U)+B*B*.38*b-Math.pow(q,1.4)*t.up*b,$=f(a,.45+x*.03,.97),A=t.alpha*(1-f(a,.94,1));e.set(`uR${x}`,D*p,b*p,C*p,y*t.drift*p),e.set(`uP${x}`,A,$,t.blur,t.light)}),e.clip()&&(e.gl.clearColor(0,0,0,0),e.gl.clear(e.gl.COLOR_BUFFER_BIT),e.draw()),u||(u=!0,v())})},()=>{}),()=>{R=!0,h?.(),e.dispose()}}export{N as startClouds};
