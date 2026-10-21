// Nach dem Live-Build: sitemap.xml, 404.html und .htaccess erzeugen
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const SITE = 'https://cleanstar-dienstleistungen.de'
const dist = 'dist'

// alle vorgerenderten Seiten einsammeln
const pages = []
const walk = (dir) => {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f)
    if (statSync(p).isDirectory()) walk(p)
    else if (f === 'index.html') pages.push('/' + p.slice(dist.length + 1).replace(/index\.html$/, ''))
  }
}
walk(dist)

// PDF-Erzeugung (jsPDF) erst beim Klick laden: vite-react-ssg setzt für alle dynamischen Imports
// einer Seite modulepreload-Links. Die schweren PDF-Bausteine nehmen wir wieder heraus.
const lazyOnly = /<link rel="modulepreload"[^>]*href="\/assets\/(summaryPdf|jspdf\.es\.min|html2canvas\.esm|purify\.es|index\.es)-[^"]+\.js">/g
for (const page of pages) {
  const file = join(dist, page, 'index.html')
  const html = readFileSync(file, 'utf8')
  const out = html.replace(lazyOnly, '')
  if (out !== html) writeFileSync(file, out)
}
const urls = pages.filter((p) => !p.startsWith('/404')).sort()
const today = new Date().toISOString().slice(0, 10)
const prio = (u) =>
  u === '/' ? '1.0' : u.startsWith('/leistungen') || u === '/angebot' ? '0.9' : u.startsWith('/einzugsgebiet/') ? '0.7' : u.match(/impressum|datenschutz/) ? '0.2' : '0.6'
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${SITE}${u}</loc><lastmod>${today}</lastmod><priority>${prio(u)}</priority></url>`).join('\n')}
</urlset>
`
writeFileSync(join(dist, 'sitemap.xml'), xml)

// 404-Seite für normales Webhosting
if (existsSync(join(dist, '404/index.html'))) writeFileSync(join(dist, '404.html'), readFileSync(join(dist, '404/index.html')))

// Apache: Fehlerseite, Caching, Kompression
writeFileSync(
  join(dist, '.htaccess'),
  `ErrorDocument 404 /404.html
Options -Indexes
DirectorySlash On

<IfModule mod_rewrite.c>
  RewriteEngine On
  # https erzwingen
  RewriteCond %{HTTPS} off
  RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</IfModule>

<IfModule mod_headers.c>
  Header always set X-Content-Type-Options "nosniff"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
  Header always set Permissions-Policy "camera=(), microphone=(), geolocation=()"
  <FilesMatch "\\.(js|css|woff2|avif|webp|png|svg)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>
  <FilesMatch "\\.html$">
    Header set Cache-Control "no-cache"
  </FilesMatch>
</IfModule>

<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css application/javascript image/svg+xml application/xml
</IfModule>
`,
)
console.log(`✓ sitemap.xml (${urls.length} Seiten), 404.html, .htaccess`)
