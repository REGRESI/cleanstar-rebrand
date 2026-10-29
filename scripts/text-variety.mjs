// Wortvielfalt einer vorgerenderten Seite: Typ-Token-Verhältnis (TTR) und wiederholte Phrasen.
// Aufruf: npm run build && node scripts/text-variety.mjs /  (weitere Pfade möglich)
import { readFileSync } from 'node:fs'

const KEY = ['fester ansprechpartner', 'festen ansprechpartner', 'ersatz bei ausfall', 'ersatzkraft bei ausfall', 'festes team', 'festen team', 'erster monat jederzeit kündbar', 'im ersten monat jederzeit kündigen', 'ohne dass sie nachfragen müssen']

function text(path) {
  const file = `dist${path.endsWith('/') ? path : path + '/'}index.html`
  let h = readFileSync(file, 'utf8')
  // per Streaming nachgereichte Abschnitte (<div hidden id="S:…">, danach $RC-Skript) vor dem Entfernen der Skripte sichern
  const parts = [...h.matchAll(/<div hidden id="S:\d+">([\s\S]*?)<\/div><script>\$RC\(/g)].map((m) => m[1])
  h = h.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ')
  // nur sichtbarer Inhalt: Kopf ohne Meta, sr-only-Doppelungen der Buchstaben-Effekte entfernen
  h = h.replace(/<span[^>]*aria-hidden="true"[^>]*>[\s\S]*?<\/span>/g, ' ')
  const strip = (x) => x.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<span[^>]*aria-hidden="true"[^>]*>[\s\S]*?<\/span>/g, ' ')
  const streamed = parts.map(strip).join(' ')
  const body = h.slice(h.indexOf('<main'), h.indexOf('</main>')) + ' ' + streamed
  return body
    // Inline-Elemente ohne Zwischenraum (Buchstaben-Spans bilden ein Wort), Blöcke mit
    .replace(/<\/?(span|a|b|strong|em|i|sup|sub)(\s[^>]*)?>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&[a-z]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

for (const path of process.argv.slice(2).length ? process.argv.slice(2) : ['/']) {
  const t = text(path)
  const words = t.toLowerCase().match(/[a-zäöüß0-9]+/g) ?? []
  const ttr = new Set(words).size / words.length
  const grams = new Map()
  for (const n of [4, 5, 6]) for (let i = 0; i + n <= words.length; i++) {
    const g = words.slice(i, i + n).join(' ')
    grams.set(g, (grams.get(g) ?? 0) + 1)
  }
  const rep = [...grams].filter(([, c]) => c > 1).sort((a, b) => b[1] - a[1] || b[0].length - a[0].length)
  // nur längste nicht überlappende Phrasen anzeigen
  const shown = []
  for (const [g, c] of rep) if (!shown.some(([s]) => s.includes(g))) shown.push([g, c])
  const low = t.toLowerCase()
  console.log(`${path}: ${words.length} Wörter, ${new Set(words).size} verschieden, TTR ${ttr.toFixed(3)}`)
  for (const k of KEY) {
    const n = low.split(k).length - 1
    if (n > 1) console.log(`  Kernaussage ${n}× wörtlich: „${k}“`)
  }
  for (const [g, c] of shown.slice(0, 25)) console.log(`  ${c}× „${g}“`)
}

// Fundstellen mit Umgebung: SHOW="phrase" node scripts/text-variety.mjs /
if (process.env.SHOW) {
  const t = text(process.argv[2] ?? '/')
  const low = t.toLowerCase()
  let i = -1
  while ((i = low.indexOf(process.env.SHOW.toLowerCase(), i + 1)) >= 0) console.log('  …' + t.slice(Math.max(0, i - 90), i + 90) + '…')
}
