# CleanStar Dienstleistungen: Website

Neue Website für CleanStar Dienstleistungen GbR, Offenburg. Büroreinigung für Unternehmen im Ortenaukreis.

- **Vorschau zum Durchklicken:** `preview/cleanstar-website.html` per Doppelklick im Browser öffnen. Funktioniert ohne Server und ohne Internet (alle Seiten, 3D, Konfigurator, Animationen).
- **Livegang:** `npm run build` erzeugt im Ordner `dist/` fertige HTML-Seiten für jedes normale Webhosting.

---

## Befehle

| Befehl | Wozu |
| --- | --- |
| `npm install` | einmalig: Abhängigkeiten installieren (Node.js 20 oder neuer) |
| `npm run dev` | Entwicklungsserver unter http://localhost:5173 |
| `npm run build` | Live-Build: vorgerenderte Seiten, `sitemap.xml`, `404.html`, `.htaccess` in `dist/` |
| `npm run build:pages` | Online-Vorschau für GitHub Pages bauen: Basis `/cleanstar-rebrand/`, Passwort-Sperre, noindex, „[VORSCHAU]“ im Betreff der Formulare |
| `npm run build:preview` | eine einzige HTML-Datei `preview/cleanstar-website.html` mit allen Seiten (Hash-Routing `#/leistungen` …) |
| `npm run serve` | den Live-Build lokal ansehen |
| `npm run lint` / `npm run typecheck` | Code prüfen |
| `npm run images` | Fotos aus `bilder/` in AVIF/WebP umwandeln (siehe BILDER.md) |
| `npm run hero` | Bildsequenzen für das Scroll-Video aus `bilder/hero/hero-1..3.mp4` erzeugen (benötigt ffmpeg) |
| `npm run docs:bilder` | `BILDER.md` neu erzeugen |
| `npm run docs:leistungsverzeichnis` | Muster-Leistungsverzeichnis (PDF) aus `src/content/floorplan.ts` neu erzeugen |
| `node scripts/generate-assets.mjs` | Favicons, OG-Bild, Logo-PNG und Checklisten-PDF neu erzeugen |

## Was ändere ich wo?

Alle Inhalte liegen in **`src/content/`**. Für Textänderungen müssen Sie keinen Code anfassen: Text zwischen den Anführungszeichen ändern, speichern, neu bauen.

| Datei | Inhalt |
| --- | --- |
| `company.ts` | **Firmendaten:** Name, Adresse, Telefon, E-Mail, Erreichbarkeit (24/7), Gesellschafter, USt-ID, Vertragsbedingungen, Reklamationsfrist, Cal.com-Link, Formular-Dienst, Gründer, Firmengeschichte, WhatsApp |
| `pricing.ts` | **Preise:** Stundensatz brutto min/max, MwSt., Wochen pro Monat, Annahmen des Kostenrechners |
| `services.ts` | die sechs Leistungen inkl. Leistungsverzeichnis, Intervalle, Zielgruppen, FAQ je Leistung |
| `locations.ts` | Orte im Einzugsgebiet: Fahrzeit, Koordinaten für die Karte, eigener Text je Ort. Neuer Ort = neuer Eintrag, die Seite entsteht automatisch |
| `faq.ts` | alle FAQ (`featured: true` = erscheint auf der Startseite) |
| `site.ts` | Texte der Startseite, Ablauf, Garantie-Prüfpunkte, Werte, Karriere, Stellenangebote, Testimonials, Kundenlogos, Navigation |
| `images.ts` | alle Bilder mit Alt-Text, Seitenverhältnis und Bild-Prompt |
| `floorplan.ts` | Büro-Grundriss „Was wird bei Ihnen gereinigt?“: Bereiche und Leistungen mit Häufigkeit (auch Quelle für das Muster-Leistungsverzeichnis als PDF) |
| `check.ts` | Fragen, Punkte und Hinweise des Reinigungs-Checks (`/reinigungs-check`) |

### Fehlende Daten

Werte, die noch fehlen, stehen in `company.ts` auf `null`. Die Website zeigt dann einen neutralen Text oder blendet die Stelle aus. Was noch zu klären ist, steht in **`OFFENE-PUNKTE.md`**. Zum Prüfen lassen sich mit `showTodoMarkers: true` gelbe Hinweise auf der Seite einblenden.

### Vertrauenselemente

- **Risikofrei-Siegel** „Erster Monat jederzeit kündbar“ (`src/components/ui/RiskFreeSeal.tsx`): unter dem Hero, im Konfigurator, auf Garantie- und Ablauf-Seite und im Abschluss-CTA. Klick öffnet die Vertragsbedingungen aus `company.ts → contract`.
- **Ihr Ansprechpartner** (`ContactPerson.tsx`): Foto, Name, Rolle, Telefon und „Jetzt erreichbar · 24/7“. Wer gezeigt wird, steuert `company.newClientContact` (Index in `founders`).
- **Kosten pro Mitarbeiter:** im Konfigurator (Weg A) und auf der Büroreinigungs-Seite. Monatsbetrag netto ÷ Mitarbeiter ÷ 21,7 Arbeitstage (`pricing.workdaysPerMonth`).
- **PDF-Zusammenfassung** am Ende des Konfigurators: wird im Browser erzeugt (jsPDF, erst beim Klick geladen), nichts wird gesendet.
- **Für Ihre Unterlagen** (Kontakt, Anker `#unterlagen`): Firmendaten zum Kopieren, Muster-Leistungsverzeichnis und Checkliste als PDF.

### Preise ändern

`src/content/pricing.ts`:

```ts
hourlyRateGrossMin: 35,  // € brutto pro Mitarbeiterstunde
hourlyRateGrossMax: 45,
vatRate: 0.19,
weeksPerMonth: 4.33,
```

Der Konfigurator rechnet: `Mitarbeiter × Stunden × Einsätze pro Woche × 4,33 × Stundensatz`, netto prominent, brutto darunter. Alle Preise sind als unverbindlich gekennzeichnet.

### Formulare einrichten (ohne eigenen Server)

Alle Formulare (Konfigurator, Kontakt, Bewerbung) senden an den Dienst in `company.ts → forms`.

**Web3Forms (voreingestellt):** Auf https://web3forms.com mit `info@cleanstar-dienstleistungen.de` einen kostenlosen Access Key erstellen und bei `accessKey` eintragen.
**Alternativ Formspree:** `provider: 'formspree'`, `endpoint: 'https://formspree.io/f/XXXX'`.

Der Web3Forms-Key ist eingetragen, die Formulare senden echt. Ohne Key laufen sie im **Vorschau-Modus**: voll durchklickbar, am Ende Erfolgsmeldung mit Hinweis „Vorschau-Modus“, es wird nichts gesendet.

Die Anfrage kommt übersichtlich formatiert als E-Mail (alle Angaben inkl. gewähltem Weg A/B und Richtpreis). Eine **Bestätigungsmail an den Kunden** richten Sie im Dashboard des Dienstes ein (Web3Forms Pro „Autoresponder“ bzw. Formspree „Autoresponse“) und setzen danach `confirmationEmail: true`.

### Objektbesichtigung online buchen (Cal.com)

`company.ts → booking.calUrl` (eingetragen: `https://cal.com/eknoor-singh-x9pw3a/30min`). Der Kalender lädt erst nach Klick auf „Kalender laden“ (DSGVO). Ohne Link erscheint ein Hinweis mit Telefon und Anfrage-Button.

### Bilder

Siehe **BILDER.md**: Liste aller 23 Bilder mit Dateiname, Seitenverhältnis, Mindestauflösung und fertigem Bild-Prompt. Ablauf: Foto nach `bilder/` → `npm run images` → in `images.ts` `available: true` → `npm run build`. Die Vorschau-Datei bettet vorhandene Fotos automatisch komprimiert ein (`npm run build:preview`). Bildausschnitt bei Bedarf pro Bild mit `position` (z. B. `'50% 30%'`) in `images.ts` steuern.

### Partnerprogramm pflegen (`/partner`)

Alle Inhalte stehen in `src/content/partner.ts`. Die Seite ist bewusst nicht in der Hauptnavigation (nur Footer, dezenter Link im Desktop-Header, unten im Mobilmenü, Hinweis auf „Über uns“ und „Karriere“).

- **Module an/aus:** in `partnerModules` bei einem Modul `enabled: false` setzen. Bestätigte Module: `todo` entfernen (Kommentare `// TODO: mit Nico abstimmen` markieren alles noch Offene).
- **Regionen vergeben:** in `bwRegions` beim Kreis `status: 'vergeben'` setzen (`'gesucht'` = frei, `'stammgebiet'` = CleanStar selbst). Die Karte und die Auswahllisten passen sich an. Die Deutschland-Ansicht schalten Sie mit `partnerFlags.showGermany` ein oder aus.
- **Konditionen einblenden:** Werte in `partnerConditions` eintragen, anwaltlich prüfen lassen, dann `partnerFlags.showConditions: true`. Bis dahin steht dort der Hinweis auf das persönliche Gespräch.
- **Partnerstimmen:** nur echte Zitate mit Einverständnis in `partnerTestimonials`, dann `partnerFlags.showTestimonials: true`.
- **Infomappe:** Platzhalter-PDF `public/downloads/cleanstar-partner-infomappe.pdf` (erzeugt von `scripts/generate-assets.mjs`). Durch die finale Mappe ersetzen, Dateiname beibehalten.
- Partneranfragen und Infomappen-Anforderungen laufen über denselben Formular-Dienst wie alle anderen Formulare (Betreff „Partneranfrage …“ bzw. „Partner-Infomappe angefordert …“).

Wichtig: keine Umsatz-, Gewinn- oder Einkommensangaben und keine erfundenen Partnerzahlen auf die Seite schreiben (vorvertragliche Aufklärungspflichten bei Franchise-Systemen).

### Hero-Video austauschen

1. Neue Clips als `bilder/hero/hero-1.mp4`, `hero-2.mp4`, `hero-3.mp4` ablegen (Reihenfolge = Abspielreihenfolge).
2. `npm run hero` ausführen. Das Skript verbindet die Clips mit kurzer Überblendung, entfernt den Ton und erzeugt die Bildsequenzen in `public/hero/`.
3. In `scripts/hero-frames.mjs` gibt es zwei Stellschrauben: `CUT_FROM`/`CUT_TO` (übersprungene Frames, aktuell eine Doppelbelichtung im Quellvideo) und `STILL_CENTER` (Bildmitte der hochkant zugeschnittenen Einstiegsbilder für das Handy). Beide passen nur zu den aktuellen Clips und müssen bei neuen Videos geprüft werden.
4. Untertitel zum Video: `src/content/site.ts → home.hero.sceneSteps`.

### Testimonials und Kundenlogos

In `site.ts` vorbereitet, aber ausgeblendet (`enabled: false`). Nur echte Zitate bzw. freigegebene Logos eintragen, dann `enabled: true`.

### Farben, Schrift, Logo

- **Farben:** `src/styles/index.css`, Block `@theme` (Ink, CleanStar Blue, Glacier, Fresh …). Ein Wert geändert = überall geändert.
- **Schrift:** Inter (variabel), lokal eingebunden unter `src/assets/fonts/`, keine Verbindung zu Google.
- **Logo:** `src/assets/brand/logo.svg` ist ein Nachbau des Original-Logos als sauberes SVG (Schrift: Poppins Regular in Pfade umgewandelt, Haus und Sterne nachgezeichnet). Das Original-PNG liegt daneben (`logo-original.png`).

## Online-Vorschau (GitHub Pages)

Bei jedem Push auf `claude/optimistic-hypatia-a2lf28` baut `.github/workflows/pages-preview.yml` die Vorschau und legt sie in den Branch `gh-pages`. Adresse: https://regresi.github.io/cleanstar-rebrand/

- **Passwort:** `cleanstar2026`, gilt für die Browser-Sitzung. Ändern in `scripts/preview-gate.mjs` (Hash). Die Sperre hält zufällige Besucher fern, ist aber kein echter Zugriffsschutz: Das Repository ist öffentlich.
- **Nicht bei Google:** jede Seite trägt `noindex`, dazu `robots.txt` mit `Disallow: /` (Suchmaschinen lesen robots.txt nur im Wurzelverzeichnis der Domain, entscheidend ist der noindex-Tag).
- **Formulare** senden echt, der Betreff beginnt mit „[VORSCHAU]“. Im Footer steht „Vorschau-Version“.
- Der normale Build (`npm run build`) ist davon nicht betroffen: keine Sperre, indexierbar, Basis `/`.

## Livegang

1. `npm run build`
2. Den **Inhalt** von `dist/` per FTP/SFTP in das Webverzeichnis hochladen.
3. Apache-Hosting: Die mitgelieferte `.htaccess` regelt 404-Seite, HTTPS-Weiterleitung, Caching und Kompression. Bei nginx entsprechend `error_page 404 /404.html;` setzen.
4. `sitemap.xml` in der Google Search Console einreichen.

Domain ändern: `company.ts → siteUrl`, `public/robots.txt` und `scripts/postbuild.mjs` (`SITE`).

## Technik

- Vite 7, React 19, TypeScript, React Router 6, Tailwind CSS 4
- Live-Build mit `vite-react-ssg` (jede Seite eigenes HTML mit Title, Description, Canonical, Open Graph, Twitter Card, JSON-LD), Vorschau mit `vite-plugin-singlefile` + Hash-Routing
- GSAP + ScrollTrigger (Scroll-Animationen), Lenis (Smooth Scroll), Framer Motion (Microinteractions)
- Hero: Scroll-Video als Bildsequenz auf `<canvas>` (kein `<video>`-Scrubbing, ruckelfrei auch auf iOS)
- React Hook Form + Zod für Formulare
- Strukturierte Daten: `ProfessionalService` (LocalBusiness), `Service`, `FAQPage`, `BreadcrumbList`

**Performance und Barrierefreiheit**

- Hero-Video: Das erste Frame ist ein normales Bild (schnelles LCP). Die übrigen Frames laden erst nach dem Seitenaufbau, grob nach fein (jedes 16., 8., 4. … Frame), mit dezenter Fortschrittslinie. Desktop 120 Frames in nativer Auflösung (1918 × 1080, WebP 82), Handy 90 Frames im 16:9-Format (1280 × 720, WebP 80) als Karte unter einem bildschirmfüllenden Einstieg mit dem Außenbild, Vorschau 60 Frames (1600 px, WebP 70). Der Canvas zeichnet 1:1 ohne Skalierung, die Bildfläche wird nie größer als 1918 × 1080 CSS-Pixel. Bleibt man an einem der vier Schlüsselmomente stehen (150 ms), blendet das scharfe Standbild (JPG aus `bilder/hero/`) weich darüber. Datensparmodus oder Ladefehler: Standbild.
- `prefers-reduced-motion`: kein Scroll-Video (nur das Morgenbild), keine Scroll-Animationen, kein Smooth Scroll, kein Custom Cursor. Alle Inhalte statisch sichtbar.
- Lighthouse (Mobil, lokal gemessen): Performance 92–96, Accessibility 98–100, Best Practices 100, SEO 100 auf allen Seiten (die 404-Seite ist absichtlich `noindex`).
- Keine Cookies, keine externen Schriften, eigene SVG-Karte statt Google Maps. Externe Dienste (Cal.com) erst nach Klick.

## Struktur

```
src/
  content/        ← alle Texte, Firmendaten, Preise, Bilder (hier ändern)
  pages/          ← eine Datei pro Seite
  components/     ← Layout, Startseiten-Abschnitte, UI-Bausteine, 3D-Szene
  features/       ← Konfigurator, Kostenrechner, Karte, Slider, Formulare, Buchung
  styles/         ← Design-Tokens und globale Styles
public/           ← robots.txt, Favicons, OG-Bild, downloads/ (Checkliste als PDF)
scripts/          ← Build-Helfer (Sitemap, Vorschau, Bilder, Assets)
preview/          ← fertige Einzeldatei-Vorschau
```

## Offene Punkte

Siehe **`OFFENE-PUNKTE.md`**.
