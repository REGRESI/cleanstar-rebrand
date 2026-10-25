// Kurze, stumme Video-Loops aus den Hero-Videos (public/loops/): nahtlos, weil das Ende in den Anfang überblendet.
// Je Loop WebM (VP9) und MP4 (H.264) plus Standbild (erstes Bild des Loops) als Poster.
// Loop-Punkte so gewählt, dass Anfang und Ende möglichst gleich aussehen (Bildvergleich je Zehntelsekunde).
// Aufruf: node scripts/loops.mjs   (braucht ffmpeg)
import { execFileSync } from 'node:child_process'
import { mkdirSync, statSync } from 'node:fs'

const OUT = 'public/loops'
mkdirSync(OUT, { recursive: true })

const loops = [
  // Mitarbeiterin wischt einen Schreibtisch, Kamera fährt heran und wieder zurück (Anfang und Ende gleicher Ausschnitt)
  { name: 'wischen', src: 'bilder/hero/hero-3.mp4', from: 0.5, to: 4.9, fade: 1 },
  // Reinigungswagen fährt durch das Großraumbüro, Kamera steht
  { name: 'wagen', src: 'bilder/hero/hero-2.mp4', from: 0, to: 4.0, fade: 0.6 },
]

const run = (args) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...args], { stdio: 'inherit' })

for (const l of loops) {
  const d = l.to - l.from
  const FADE = l.fade // Überblendung Ende → Anfang in Sekunden
  // A: Clip ohne die ersten FADE Sekunden, B: die ersten FADE Sekunden; am Ende von A blendet B ein.
  // Das letzte Bild entspricht damit dem Bild bei FADE, mit dem der nächste Durchlauf beginnt.
  const filter =
    `[0:v]trim=${l.from + FADE}:${l.to},setpts=PTS-STARTPTS,scale=1280:-2,fps=30,format=yuv420p[a];` +
    `[0:v]trim=${l.from}:${l.from + FADE},setpts=PTS-STARTPTS,scale=1280:-2,fps=30,format=yuv420p[b];` +
    `[a][b]xfade=transition=fade:duration=${FADE}:offset=${(d - 2 * FADE).toFixed(3)}[v]`
  run([
    '-i',
    l.src,
    '-filter_complex',
    filter,
    '-map',
    '[v]',
    '-an',
    '-c:v',
    'libx264',
    '-preset',
    'slow',
    '-crf',
    '27',
    '-movflags',
    '+faststart',
    '-pix_fmt',
    'yuv420p',
    `${OUT}/${l.name}.mp4`,
  ])
  run(['-i', `${OUT}/${l.name}.mp4`, '-an', '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '40', '-row-mt', '1', '-deadline', 'good', `${OUT}/${l.name}.webm`])
  run(['-i', `${OUT}/${l.name}.mp4`, '-frames:v', '1', '-c:v', 'libwebp', '-quality', '78', `${OUT}/${l.name}.webp`])
  const kb = (f) => Math.round(statSync(`${OUT}/${l.name}.${f}`).size / 1024)
  console.log(`✓ ${l.name}: ${(d - FADE).toFixed(1)} s, mp4 ${kb('mp4')} KB, webm ${kb('webm')} KB, poster ${kb('webp')} KB`)
}
