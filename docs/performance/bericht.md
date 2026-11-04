# Flüssig auf Mobile – Bericht (Abschluss-Fix)

Stand: 4. November 2026, Branch `claude/optimistic-hypatia-a2lf28`. Gestaltung und Inhalte sind gleich geblieben; vereinfacht
wurde nur, wo es für flüssiges Scrollen nötig war (Liste unten).

## Messverfahren

`scripts/test-performance.mjs` (Chromium mit CDP, statischer Build aus `dist`):

- Geräteprofile **iPhone 13** und **Android-Mittelklasse (Pixel 5)**, CPU **4-fach gedrosselt**.
- Echte Touch-Wischgesten (`Input.dispatchTouchEvent`, halbe Bildschirmhöhe in rund 130 ms, danach Schwung), von oben
  bis zum Seitenende.
- **Ruckler**: Anteil der Frames über zwei Bildschirmtakten (> 34 ms). Ein Frame von genau zwei Takten (33,3 ms) zählt
  nicht als Ruckler, er wird nur informativ als „zwei Takte“ ausgewiesen (in `perf-*.json`).
- **Long Tasks** > 100 ms während des Scrollens (PerformanceObserver), längster Frame.
- **Sprünge**: Scrollposition ändert sich ohne Geste (später als 2,5 s nach der letzten) oder um mehr als eine
  Bildschirmhöhe in einem Frame.
- **Tote Gesten**: Wischen bewegt die Seite nicht, obwohl das Ende nicht erreicht ist.
- Ziele: Ruckler < 5 %, kein Frame > 200 ms, keine Long Tasks > 100 ms, keine Sprünge, keine toten Gesten.
- „Vorher“ ist der Stand vor dieser Runde (gleicher Rechner, gleiches Verfahren).

Zusätzlich läuft auf GitHub Actions bei jedem Push ein **WebKit-Rauchtest** (Safari-Engine, iPhone 13): jede der sechs
Seiten bis zum Ende scrollen, keine toten Gesten, keine Skriptfehler (`ENGINE=webkit`, Schritt im Workflow
`pages.yml`). Lokal ist WebKit nicht installiert.

## Ergebnisse vorher → nachher

### iPhone 13

| Seite | Ruckler vorher → nachher | längster Frame | Long Tasks > 100 ms (längster) | Sprünge | tote Gesten | Ziel erreicht |
| --- | --- | --- | --- | --- | --- | --- |
| Startseite | 10,7 % → **2,7 %** | 867 → **217 ms** | 146 (863 ms) → **1** (181 ms) | 0 → 0 | 2 → **0** | nein |
| Leistungen | 2,1 % → **0,2 %** | 167 → **50 ms** | 5 (184 ms) → **0** (0 ms) | 0 → 0 | 0 → **0** | ja |
| Qualitätsgarantie | 3,8 % → **0,7 %** | 417 → **67 ms** | 37 (397 ms) → **0** (62 ms) | 0 → 0 | 1 → **0** | ja |
| Ablauf | 5,2 % → **0,5 %** | 283 → **67 ms** | 90 (271 ms) → **0** (50 ms) | 0 → 0 | 2 → **0** | ja |
| Einzugsgebiet | 3,9 % → **0,6 %** | 683 → **50 ms** | 14 (657 ms) → **0** (0 ms) | 0 → 0 | 0 → **0** | ja |
| Über uns | 3,1 % → **0,8 %** | 367 → **83 ms** | 52 (358 ms) → **0** (73 ms) | 0 → 0 | 1 → **0** | ja |

### Android Mittelklasse (Pixel 5)

| Seite | Ruckler vorher → nachher | längster Frame | Long Tasks > 100 ms (längster) | Sprünge | tote Gesten | Ziel erreicht |
| --- | --- | --- | --- | --- | --- | --- |
| Startseite | 11,1 % → **2,1 %** | 883 → **83 ms** | 137 (877 ms) → **0** (69 ms) | 0 → 0 | 5 → **0** | ja |
| Leistungen | 2,2 % → **0,4 %** | 167 → **83 ms** | 2 (109 ms) → **0** (69 ms) | 0 → 0 | 0 → **0** | ja |
| Qualitätsgarantie | 4,1 % → **1,7 %** | 483 → **83 ms** | 45 (481 ms) → **0** (72 ms) | 0 → 0 | 1 → **0** | ja |
| Ablauf | 4,2 % → **0,4 %** | 250 → **83 ms** | 79 (251 ms) → **0** (74 ms) | 0 → 0 | 1 → **0** | ja |
| Einzugsgebiet | 3,9 % → **0,4 %** | 700 → **50 ms** | 11 (672 ms) → **0** (54 ms) | 0 → 0 | 2 → **0** | ja |
| Über uns | 3,6 % → **0,5 %** | 417 → **83 ms** | 54 (378 ms) → **0** (67 ms) | 0 → 0 | 1 → **0** | ja |

**11 von 12 Läufen erreichen alle Ziele.** Offen bleibt die Startseite auf dem iPhone-Profil: In etwa jedem zweiten Lauf
tritt **eine** einzelne Aufgabe von 120–180 ms auf (in den übrigen Läufen: keine über 100 ms, längster Frame 83–100 ms).
Die Spur zeigt dafür keinen Skript-Auslöser mehr, sondern Stilberechnung und Übergabe an den Compositor (Commit) in
headless Chromium ohne Grafikkarte (Software-Rendering bei vierfach gedrosselter CPU). Die beiden echten Ursachen, die
die Spur vorher zeigte, sind behoben (siehe unten: Caveat-Schrift, Unschärfe-Keyframes).

## Lighthouse Mobile (lokal, Median aus 3 Läufen)

| Seite | vorher | nachher | TBT vorher → nachher | LCP | CLS |
| --- | --- | --- | --- | --- | --- |
| Startseite | 94 | **94** | 90–100 ms → **108 ms** | 2,3 s | 0 |
| Leistungen | 88–89 | **93** | 188–231 ms → **4 ms** | 2,6 s | 0,005 |
| Einzugsgebiet | 63 | **93** | 3,3–3,5 s → **0 ms** | 2,5 s | 0–0,063 |

Ein erster Startseiten-Lauf direkt nach dem Bauen ergab 82 (TBT 470 ms, kalter Start der Lighthouse-Instanz); alle
folgenden Läufe lagen bei 93–95. Die Werte schwanken auf diesem Rechner um ±2 Punkte.

## Was entfernt wurde

- **Scroll-Sperre an Überschriften** (`src/lib/headingGate.ts`, `data-heading-hold`/`data-heading-active` samt CSS): die
  Seite wird nie mehr angehalten oder verschoben. Moment-Überschriften starten bei rund 30 % Sichtbarkeit und laufen
  zeitbasiert ab; lesbar bleiben sie über die Lage im Fluss bzw. `position: sticky` (Desktop).
- **Haltephasen**: Lese-Haltestrecken am Handy, Ankunfts-Halt der Karte, Haltestrecken der Übergänge Leistungen → Kosten,
  Ort → Mappe, Mappe → Antwort, Team und Ablauf (jetzt „im Fluss“ mit Kartenkante). Details: `docs/performance/pins.md`.
- **Smooth Scroll auf Touch**: Lenis läuft nur noch mit Maus/Trackpad; kein `touchMultiplier`, kein `normalizeScroll`,
  `lagSmoothing` auf Standard.
- **Toter Code**: `FounderPortrait.tsx`, `ScrubText.tsx`, `headingGate.ts`, die eigene CSS-Datei für die Handschrift
  (`hand.css`) sowie drei Testskripte, die die Sperre prüften (`test-heading-hold`, `test-moment-entrances`,
  `test-arrival-water`).
- **Doppeltes Bild**: Seitenende-Bild der Startseite war dasselbe wie das „Am Morgen“-Bild (Bildtest jetzt grün).

## Was am Handy vereinfacht wurde

- **WebGL**: höchstens eine Szene (Hero-Staub nur am Desktop; Papierkante, Pflanzen und Wolken am Handy als feste
  Bildfassung). Karte am Handy erst auf Tippen („Karte bewegen“). Zeichenflächen mit DPR ≤ 1,5 und Pause außerhalb
  des Bildes; Slogan-Partikel halbiert (850, schwache Geräte 500).
- **Geräteklasse** (`src/lib/deviceClass.ts`): voll / eine Szene / keine; schwache Hardware, reduzierte Bewegung,
  Datensparmodus oder gemessene Startbildrate unter 40 fps schalten auf die einfache Fassung (`html.low-power`).
- **Keine animierten Filter** (Unschärfe, Helligkeit), kein `backdrop-filter`, nur `transform`/`opacity`. Neu in dieser
  Runde: eigene Keyframes ohne `filter` für Überschriften-Wörter und Moment-Buchstaben. Ein per `!important`
  abgeschalteter Filter in den Keyframes ließ den Browser sonst jedes Wort als eigene Ebene führen (bis zu 120 Ebenen
  je Überschrift).
- **Buchstaben**: Farbwelle und Scroll-Text wortweise statt buchstabenweise (deutlich unter 150 animierten Zeichen);
  Zeilen der Überschriften werden nur einmal je Breite vermessen statt bei jedem Hineinscrollen.
- **Ärgernisse und Ablauf-Linie** ohne Neuzeichnen je Frame (Schaltpunkte statt stufenloser Werte).
- **Handy-Leiste** ermittelt den dunklen Hintergrund per IntersectionObserver statt `elementsFromPoint` je Frame.
- **Pins**: Mobile höchstens 3 je Seite und ≤ 150 svh, Desktop höchstens 5 und ≤ 200 svh, `svh`-Höhen, ein
  `ScrollTrigger.refresh()` nach Bildern und Schriften, Höhenänderungen nur in Scrollpausen.
- **Schrift Caveat** wird jetzt in der Haupt-CSS deklariert. Vorher kam die `@font-face`-Regel erst mit dem
  vorgeladenen Mappen-Code; schon das Antippen eines Links (Vorladen) erzwang dadurch einen Neuaufbau des ganzen
  Dokuments (bis 90 ms bei gedrosselter CPU mitten im Wischen).

## Fehler und Reste

- **Konsole**: 11 Seiten × Desktop und iPhone ohne Fehler und Warnungen. Ausgenommen sind nur Meldungen von headless
  Chromium selbst (Software-WebGL ohne Grafikkarte). Die einzige Meldung der Seite (`THREE.Clock` veraltet, aus
  react-three-fiber in der Leistungsmappe) wird über `THREE.setConsoleFunction` gezielt ausgeblendet.
- **Deploy-Test** („The string did not match the expected pattern“): grün in Chromium; WebKit läuft auf GitHub Actions.
- **Bundle**: `app.js` 625,4 KB → 626,0 KB (gzip 215,1 → 215,3 KB), `app.css` 190,9 → 194,1 KB (gzip 35,1 → 35,6 KB).
  Die Größe ist praktisch unverändert. Entfernter Code und die neuen Handy-Regeln samt Geräteklasse heben sich auf; der
  Gewinn liegt in der Laufzeit, nicht in der Dateigröße. framer-motion und GSAP bleiben beide (beide breit im
  Einsatz, ein Ersatz wäre ein großer Umbau ohne Messgewinn beim Scrollen).

## Tests (lokal, Build aus `dist`)

| Test | Ergebnis |
| --- | --- |
| Performance (`test-performance.mjs`, 2 Profile × 6 Seiten) | 11/12 grün, Startseite iPhone siehe oben |
| Übergänge (`test-transitions.mjs`, alle Seiten, Desktop + Mobile) | grün, 3398 Aufnahmen ohne leere Bildschirme oder Überschneidungen |
| Lesestrecken (`test-home-reading.mjs`) | grün (an die Regeln ohne Haltephase angepasst) |
| Abschnittsgrenzen (`check-home-boundaries.mjs`) | grün, CLS 0 |
| Navigation (`test-navigation.mjs`) | siehe Abschlussmeldung |
| Leistungsmappe (`test-mappe.mjs`) | grün, 147 Prüfungen |
| Neuladen Scroll-Text (`test-reload.mjs`) | grün, 80 Läufe |
| Bilder (`test-images.mjs`) | grün, 53 Seiten |
| Deploy (`test-deploy.mjs`) | grün (Chromium) |
| Pins (`CHECK=1 inventory-pins.mjs`) | grün |

## WebKit (Safari-Engine)

- GitHub Actions, Lauf 114 (Commit `ec4de43`): Deploy-Test in Chromium und WebKit grün, WebKit-Rauchtest grün. Alle
  sechs Seiten werden bis zum Ende gescrollt, ohne tote Gesten und ohne Skriptfehler.
- Lauf 113 brach einmal auf `/ueber-uns/` ab, weil der WebKit-Tab geschlossen wurde. Lauf 114 mit identischem App-Code
  lief grün; der Abbruch ließ sich nicht wiederholen. Damit ein solcher Absturz künftig als Fehler genau dieser Seite
  gemeldet wird statt den ganzen Test abzubrechen, fängt der WebKit-Test ihn jetzt ab.
- Neu: Nach jeder Veröffentlichung prüft der Workflow die **Live-Seite** zusätzlich in WebKit (iPhone 13) auf allen
  sechs Hauptseiten.

## Video

`docs/performance/startseite-iphone13-cpu4x.webm`: Startseite im iPhone-13-Profil, CPU vierfach gedrosselt, mit
Touch-Wischgesten von oben bis zum Seitenende (69 s).
