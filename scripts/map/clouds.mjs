// Wolkenschichten für den Vogelflug auf der Karte (public/map/wolken-1.webp, wolken-2.webp).
// Prozedural erzeugt (Turbulenzrauschen, weich ausgeblendet), halbtransparent, leicht.
// Aufruf: node scripts/map/clouds.mjs
import sharp from 'sharp'

// Weiße Wolken mit weichem Schatten auf der Karte darunter (sonst verschwinden sie auf dem hellen Kartengrund)
const layer = (seed, freq, cover) =>
  Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="640">
<filter id="c" x="0" y="0" width="100%" height="100%">
  <feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="5" seed="${seed}" result="n"/>
  <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  ${cover} 0 0 0 ${-cover * 0.5}" result="a"/>
  <feGaussianBlur in="a" stdDeviation="5" result="soft"/>
  <feOffset in="soft" dx="34" dy="42" result="off"/>
  <feGaussianBlur in="off" stdDeviation="14" result="sh"/>
  <feColorMatrix in="sh" type="matrix" values="0 0 0 0 0.04  0 0 0 0 0.1  0 0 0 0 0.2  0 0 0 0.45 0" result="shadow"/>
  <feColorMatrix in="soft" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0" result="body"/>
  <feMerge><feMergeNode in="shadow"/><feMergeNode in="body"/></feMerge>
</filter>
<rect width="1000" height="640" filter="url(#c)"/></svg>`)

for (const [name, seed, freq, cover] of [
  ['wolken-1', 7, 0.0036, 5],
  ['wolken-2', 23, 0.006, 4.5],
]) {
  await sharp(layer(seed, freq, cover))
    .webp({ quality: 72, alphaQuality: 85 })
    .toFile(`public/map/${name}.webp`)
}
console.log('✓ Wolken in public/map')
