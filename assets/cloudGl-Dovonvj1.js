import{c as F,G as _,l as I}from"./glQuad-GWTsCGl1.js";const $=`#version 300 es
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
${_}
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
}`,W=[{tex:"c",ratio:1136/1916,top:[-.36,0],topM:-.36,scale:.9,up:.16,drift:4,blur:2.2,light:.35,alpha:.82},{tex:"b",ratio:1080/1916,top:[-.31,.18],topM:-.1,scale:1.05,up:.3,drift:9,blur:1,light:.6,alpha:1},{tex:"a",ratio:821/1916,top:[-.22,.42],topM:.3,scale:1.25,up:.45,drift:16,blur:0,light:1,alpha:1},{tex:"b",ratio:1080/1916,top:[-.3,.66],topM:.4,scale:1.32,up:.55,drift:21,blur:0,light:1,alpha:1}],p=(o,c,f)=>Math.min(1,Math.max(0,(o-c)/(f-c)));function N(o,c,f,T){let v;try{v=F(o,$)}catch{return null}if(!v)return null;const e=v,r=()=>window.innerWidth,O=r()*Math.min(1.5,window.devicePixelRatio||1)>900;let x=!1,m=null;const i=["a","b","c"].map(a=>{const l=new Image;return l.decoding="async",l.src=`/images/deko/wolken-ebene-${a}-${O?1916:960}.webp`,l});return Promise.all(i.map(a=>a.decode())).then(()=>{if(x)return;e.texture("uA",i[0],!0),e.texture("uB",i[1],!0),e.texture("uC",i[2],!0);let a=!1,l=!1;const R=[.75,.55,.4];let h=0,n=0,d=0;m=I(o,(w,y)=>{if(y>0&&c()>.02&&c()<.98&&(n+=y,++d>=30||n>.5)){const t=n/d;if(t>.06||t>.022&&h===R.length-1){m?.(),T();return}t>.022&&h++,n=0,d=0}const k=r()*.4,u=c();if(u>=.999){l||(e.gl.disable(e.gl.SCISSOR_TEST),e.gl.clearColor(0,0,0,0),e.gl.clear(e.gl.COLOR_BUFFER_BIT),l=!0);return}l=!1;const[P,S]=e.resize(Math.min(R[h],window.devicePixelRatio||1)*(r()<768?1.33:1)),M=o.clientWidth,U=o.clientHeight-k,s=P/M;e.set("uRes",P,S),e.set("uT",w);const B=1-p(u,0,.35),q=p(u,.42,1),z=r()<768;W.forEach((t,b)=>{const C=M*t.scale,g=C*t.ratio,D=k+(z?t.topM*r():t.top[0]*r()+t.top[1]*U)+B*B*.38*g-Math.pow(q,1.4)*t.up*g,A=p(u,.45+b*.03,.97),E=t.alpha*(1-p(u,.94,1));e.set(`uR${b}`,D*s,g*s,C*s,w*t.drift*s),e.set(`uP${b}`,E,A,t.blur,t.light)}),e.clip()&&(e.gl.clearColor(0,0,0,0),e.gl.clear(e.gl.COLOR_BUFFER_BIT),e.draw()),a||(a=!0,f())})},()=>{}),()=>{x=!0,m?.(),e.dispose()}}export{N as startClouds};
