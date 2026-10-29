// Ähnlichkeit der Ortsseiten: Fließtext je Seite aus dist/ (Hauptinhalt ohne Kopf, Fuß, Navigation),
// Wort-Shingles (5 Wörter), Jaccard-Ähnlichkeit für jedes Paar. Ortsnamen werden neutralisiert, damit ein bloß
// ausgetauschter Name nicht als Unterschied zählt.
// Aufruf: node scripts/similarity.mjs [Schwelle, Standard 0.30]
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { places } from './similarity-places.mjs'

const LIMIT = Number(process.argv[2] ?? 0.3)
const names = places.flatMap((p) => [p.name, p.name.replace(' im Kinzigtal', '')]).sort((a, b) => b.length - a.length)
const text = (slug) => {
  const f = `dist/einzugsgebiet/${slug}/index.html`
  if (!existsSync(f)) return ''
  let h = readFileSync(f, 'utf8')
  // per Streaming nachgereichte Abschnitte gehören zum Inhalt
  const streamed = [...h.matchAll(/<div hidden id="S:\d+">([\s\S]*?)<\/div><script>\$RC\(/g)].map((m) => m[1]).join(' ')
  h = h.slice(h.indexOf('<main'), h.indexOf('</main>')) + ' ' + streamed
  h = h.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<nav[\s\S]*?<\/nav>|<section[^>]*aria-labelledby="cta-title"[\s\S]*$/g, ' ')
  let t = h.replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;|&#\d+;/g, ' ')
  for (const n of names) t = t.split(n).join(' ORT ')
  return t
    .toLowerCase()
    .replace(/[^a-zäöüß0-9 ]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
}
const shingles = (w) => {
  const s = new Set()
  for (let i = 0; i + 5 <= w.length; i++) s.add(w.slice(i, i + 5).join(' '))
  return s
}
const slugs = readdirSync('dist/einzugsgebiet', { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  // Weiterleitungen (zusammengeführte Orte) zählen nicht
  .filter((s) => !readFileSync(`dist/einzugsgebiet/${s}/index.html`, 'utf8').includes('http-equiv="refresh"'))
const sets = Object.fromEntries(slugs.map((s) => [s, shingles(text(s))]))
const pairs = []
for (let i = 0; i < slugs.length; i++)
  for (let j = i + 1; j < slugs.length; j++) {
    const a = sets[slugs[i]],
      b = sets[slugs[j]]
    let inter = 0
    for (const x of a) if (b.has(x)) inter++
    pairs.push([slugs[i], slugs[j], inter / (a.size + b.size - inter || 1)])
  }
pairs.sort((x, y) => y[2] - x[2])
const over = pairs.filter((p) => p[2] > LIMIT)
const avg = pairs.reduce((s, p) => s + p[2], 0) / pairs.length
console.log(
  `${slugs.length} Ortsseiten, ${pairs.length} Paare, Mittel ${(avg * 100).toFixed(1)} %, Maximum ${(pairs[0][2] * 100).toFixed(1)} % (${pairs[0][0]}/${pairs[0][1]}), über ${LIMIT * 100} %: ${over.length}`,
)
for (const p of pairs.slice(0, 8)) console.log(`  ${(p[2] * 100).toFixed(1)} %  ${p[0]} / ${p[1]}`)
