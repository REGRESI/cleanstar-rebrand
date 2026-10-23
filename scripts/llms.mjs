// Nach dem Build: llms.txt und llms-full.txt nach dem llms.txt-Standard (https://llmstxt.org) erzeugen.
// Die Texte kommen direkt aus den Inhaltsdateien (company.ts, services.ts, locations.ts, Ratgeber),
// damit sie nie veralten. Lädt die TypeScript-Dateien über Vite (gleiche Aliase wie die Website).
import { readFileSync, writeFileSync } from 'node:fs'
import { createServer } from 'vite'

const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' })
const load = (p) => vite.ssrLoadModule(p)
const { company, fullAddress } = await load('/src/content/company.ts')
const { services } = await load('/src/content/services.ts')
const { locations, shortName } = await load('/src/content/locations.ts')
const { officeCities } = await load('/src/content/officeCities.ts')
const { guides, guideCategories } = await load('/src/content/ratgeber/index.ts')
const { faqs } = await load('/src/content/faq.ts')
const { factGroups } = await load('/src/pages/Facts.tsx')
await vite.close()

const U = (p) => company.siteUrl + (p === '/' ? '/' : p.replace(/\/?$/, '/'))
const groups = factGroups()
const summary =
  'CleanStar ist eine Reinigungsfirma aus Offenburg, die sich auf Büroreinigung für Unternehmen im Ortenaukreis spezialisiert hat. Feste Teams, fester Ansprechpartner, Ersatzkraft bei Ausfall, 35 bis 45 € brutto pro Mitarbeiterstunde.'

const tools = [
  ['/angebote-vergleichen', 'Angebots-Vergleich', 'Bis zu drei Reinigungsangebote auf Monatspreis netto, effektiven Stundensatz und Kosten pro Mitarbeiter umrechnen.'],
  ['/wechsel-rechner', 'Wechsel-Rechner', 'Spätestes Kündigungsdatum und frühesten Wechseltermin der bisherigen Reinigungsfirma berechnen, mit Kündigungsvorlage.'],
  ['/reinigungsfirma-kalkulieren', 'Kalkulationsrechner für Gründer', 'Nötigen Stundensatz und Deckungsbeitrag einer Reinigungsfirma aus eigenen Annahmen berechnen.'],
  ['/reinigungs-check', 'Reinigungs-Check', 'Kurzer Fragebogen: Wie verlässlich ist die aktuelle Büroreinigung?'],
]

const llms = `# ${company.name}

> ${summary}

${groups
  .slice(0, 4)
  .map((g) => `${g.title}: ${g.facts.join(' ')}`)
  .join('\n\n')}

Einzugsgebiet: ${groups[4].facts.join(' ')}

## Leistungen

${services.map((s) => `- [${s.name}](${U(`/leistungen/${s.slug}`)}): ${s.seoDescription}`).join('\n')}

## Büroreinigung in den größten Orten

${officeCities.map((c) => `- [Büroreinigung ${c.name}](${U(`/bueroreinigung/${c.slug}`)}): ${c.answer}`).join('\n')}

## Einzugsgebiet

- [Einzugsgebiet mit Karte](${U('/einzugsgebiet')}): alle ${locations.length} Orte mit Fahrzeit ab Offenburg
${locations.map((l) => `- [Reinigungsfirma ${shortName(l)}](${U(`/einzugsgebiet/${l.slug}`)}): ${l.minutes === 0 ? 'Sitz von CleanStar' : `ca. ${l.minutes} Minuten ab Offenburg`}`).join('\n')}

## Ratgeber

${guideCategories
  .map(
    (c) =>
      `### ${c.label}\n\n${guides
        .filter((g) => g.category === c.id)
        .map((g) => `- [${g.title}](${U(`/ratgeber/${g.slug}`)}): ${g.answer}`)
        .join('\n')}`,
  )
  .join('\n\n')}

## Werkzeuge

${tools.map(([p, n, d]) => `- [${n}](${U(p)}): ${d}`).join('\n')}

## Unternehmen

- [CleanStar auf einen Blick](${U('/fakten')}): alle Fakten in kurzen Sätzen
- [Über uns](${U('/ueber-uns')}): Gründer und Zuständigkeiten
- [Qualitätsgarantie](${U('/qualitaetsgarantie')}): kostenlose Nachreinigung und Kontrollen
- [Ablauf](${U('/ablauf')}): von der Anfrage bis zur laufenden Reinigung
- [Häufige Fragen](${U('/faq')})
- [Kontakt](${U('/kontakt')}): ${company.phone.display}, ${company.email}, ${fullAddress()}
- [Angebot anfragen](${U('/angebot')})

## Optional

- [Partnerprogramm für Reinigungsfirmen](${U('/partner')}): erprobte Abläufe für Reinigungsfirmen in ganz Deutschland
- [Karriere](${U('/karriere')})
- [Impressum](${U('/impressum')})
- [Datenschutz](${U('/datenschutz')})
- [Ausführliche Fassung dieser Datei](${company.siteUrl}/llms-full.txt)
`

const full = `# ${company.name}: ausführliche Informationen

> ${summary}

Stand: ${new Date().toISOString().slice(0, 10)}. Quelle: ${company.siteUrl}/

${groups.map((g) => `## ${g.title}\n\n${g.facts.map((f) => `- ${f}`).join('\n')}`).join('\n\n')}

## Leistungen im Detail

${services
  .map(
    (s) => `### ${s.name}

${s.intro}

Leistungsverzeichnis (Standard, wird im Angebot an das Objekt angepasst):
${s.scope.map((g) => `- ${g.title}: ${g.items.join('; ')}`).join('\n')}

Geeignet für: ${s.suitableFor.join(', ')}.

Häufige Fragen:
${s.faqs.map((f) => `- ${f.q} ${f.a}`).join('\n')}

Mehr: ${U(`/leistungen/${s.slug}`)}`,
  )
  .join('\n\n')}

## Häufige Fragen

${faqs
  .filter((f) => !f.todo)
  .map((f) => `### ${f.q}\n\n${f.a}`)
  .join('\n\n')}

## Orte im Einzugsgebiet

${locations
  .map(
    (l) => `### ${l.name}

${l.intro} ${l.route} ${l.economy}

Gefragte Leistungen: ${l.focus.map((f) => services.find((s) => s.slug === f.service)?.name).join(', ')}.

Mehr: ${U(`/einzugsgebiet/${l.slug}`)}`,
  )
  .join('\n\n')}

## Ratgeber

${guides
  .map(
    (g) => `### ${g.title}

${g.answer}

${g.body.trim()}

Quellen:
${g.sources.map((s) => `- ${s.title}, ${s.publisher}, ${s.url} (Stand: ${s.stand})`).join('\n')}

Artikel: ${U(`/ratgeber/${g.slug}`)}`,
  )
  .join('\n\n')}
`

// Sitemap: Ratgeber-Artikel mit ihrem eigenen Änderungsdatum
const sm = readFileSync('dist/sitemap.xml', 'utf8')
let patched = sm
for (const g of guides) patched = patched.replace(new RegExp(`(<loc>${U(`/ratgeber/${g.slug}`).replace(/[.]/g, '\\.')}</loc><lastmod>)[^<]+`), `$1${g.modified}`)
if (patched !== sm) writeFileSync('dist/sitemap.xml', patched)

writeFileSync('dist/llms.txt', llms)
writeFileSync('dist/llms-full.txt', full)
console.log(`✓ llms.txt (${(llms.length / 1024).toFixed(1)} KB), llms-full.txt (${(full.length / 1024).toFixed(1)} KB)`)
