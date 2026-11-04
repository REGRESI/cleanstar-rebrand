import{c as U,G as $,l as A}from"./glQuad-DEJ_hlwE.js";const C=`#version 300 es
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
${$}
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
}`,T=[{tex:"c",ratio:1136/1916,top:[-.36,0],topM:-.36,scale:.9,up:.16,drift:4,blur:2.2,light:.35,alpha:.82},{tex:"b",ratio:1080/1916,top:[-.31,.18],topM:-.1,scale:1.05,up:.3,drift:9,blur:1,light:.6,alpha:1},{tex:"a",ratio:821/1916,top:[-.22,.42],topM:.3,scale:1.25,up:.45,drift:16,blur:0,light:1,alpha:1},{tex:"b",ratio:1080/1916,top:[-.3,.66],topM:.4,scale:1.32,up:.55,drift:21,blur:0,light:1,alpha:1}],p=(o,u,f)=>Math.min(1,Math.max(0,(o-u)/(f-u)));function F(o,u,f){let m;try{m=U(o,C)}catch{return null}if(!m)return null;const e=m,c=()=>window.innerWidth,y=c()*Math.min(1.5,window.devicePixelRatio||1)>900;let d=!1,x=null;const a=["a","b","c"].map(l=>{const r=new Image;return r.decoding="async",r.src=`/images/deko/wolken-ebene-${l}-${y?1916:960}.webp`,r});return Promise.all(a.map(l=>l.decode())).then(()=>{if(d)return;e.texture("uA",a[0],!0),e.texture("uB",a[1],!0),e.texture("uC",a[2],!0);let l=!1;x=A(o,r=>{const i=c()*.4;o.style.top=`${-i}px`,o.style.height=`calc(100% + ${i}px)`;const[b,P]=e.resize(Math.min(1,window.devicePixelRatio||1)),g=o.clientWidth,k=o.clientHeight-i,n=b/g;e.set("uRes",b,P),e.set("uT",r);const s=u(),w=1-p(s,0,.35),M=p(s,.42,1),q=c()<768;T.forEach((t,v)=>{const R=g*t.scale,h=R*t.ratio,z=i+(q?t.topM*c():t.top[0]*c()+t.top[1]*k)+w*w*.38*h-Math.pow(M,1.4)*t.up*h,B=p(s,.45+v*.03,.97),D=t.alpha*(1-p(s,.94,1));e.set(`uR${v}`,z*n,h*n,R*n,r*t.drift*n),e.set(`uP${v}`,D,B,t.blur,t.light)}),e.gl.clearColor(0,0,0,0),e.gl.clear(e.gl.COLOR_BUFFER_BIT),e.draw(),l||(l=!0,f())})},()=>{}),()=>{d=!0,x?.(),e.dispose()}}export{F as startClouds};
