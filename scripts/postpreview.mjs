// Verschiebt die eigenständige Vorschau-Datei nach preview/cleanstar-website.html
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs'

const html = readFileSync('dist-preview/preview.html', 'utf8')
const favicon = 'data:image/svg+xml;base64,' + readFileSync('public/favicon.svg').toString('base64')
const out = html.replace('__FAVICON__', favicon)
mkdirSync('preview', { recursive: true })
writeFileSync('preview/cleanstar-website.html', out)
rmSync('dist-preview', { recursive: true, force: true })
console.log(`✓ preview/cleanstar-website.html (${(out.length / 1024 / 1024).toFixed(2)} MB)`)
