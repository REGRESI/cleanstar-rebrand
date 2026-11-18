// Sperrt die gebaute Website (dist) mit Passwort: Jede HTML-Seite bekommt die Passwort-Abfrage aus
// scripts/preview-gate.mjs und ein noindex-Tag. Läuft im Veröffentlichungs-Workflow NACH den Tests, damit die Tests
// gegen die freie Version laufen; lokale Builds (npm run build) bleiben unverändert.
// Aufruf: node scripts/apply-gate.mjs   (Entsperren: im Workflow den Schritt „Passwort-Sperre einbauen“ entfernen)
// Keine echte Zugangskontrolle: siehe Hinweis in preview-gate.mjs.
import { createHash } from 'node:crypto'
import { readdirSync, readFileSync, statSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { previewGateHead, previewGateBody, LIVE_TEXT } from './preview-gate.mjs'

const dist = new URL('../dist/', import.meta.url).pathname
const head = previewGateHead()
const body = previewGateBody(LIVE_TEXT)

const walk = (dir) =>
  readdirSync(dir).flatMap((n) => {
    const f = join(dir, n)
    return statSync(f).isDirectory() ? walk(f) : f.endsWith('.html') ? [f] : []
  })

let n = 0
let skipped = 0
for (const f of walk(dist)) {
  let html = readFileSync(f, 'utf8')
  if (html.includes('id="cs-gate"')) continue
  // Weiterleitungsseiten (Meta-Refresh) bleiben unverändert; das Ziel trägt die Sperre
  if (html.includes('http-equiv="refresh"') || !html.includes('</head>') || !/<body[^>]*>/.test(html)) {
    skipped++
    continue
  }
  html = html.replace('</head>', () => `${head}\n</head>`).replace(/<body([^>]*)>/, (m) => `${m}\n${body}`)
  writeFileSync(f, html)
  n++
}
if (n < 20) throw new Error(`Sperre nur auf ${n} Seiten eingebaut`)

// Cloudflare-Pages-Kopfzeilen: die neuen Inline-Skripte per Hash freigeben (GitHub Pages ignoriert die Datei)
const hf = join(dist, '_headers')
if (existsSync(hf)) {
  const hashes = [...(head + body).matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map((m) => `'sha256-${createHash('sha256').update(m[1]).digest('base64')}'`)
  let h = readFileSync(hf, 'utf8')
  h = h.replace(/script-src 'self'/, `script-src 'self' ${hashes.join(' ')}`)
  writeFileSync(hf, h)
}
console.log(`✓ Passwort-Sperre auf ${n} Seiten eingebaut (${skipped} Weiterleitungen unverändert)`)
