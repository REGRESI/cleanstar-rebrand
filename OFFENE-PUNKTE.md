# Offene Punkte

Diese Punkte kann nur CleanStar klären. Auf der Website erscheinen dazu keine gelben Hinweise mehr
(`showTodoMarkers: false` in `src/content/company.ts`). Wo ein Wert fehlt, zeigt die Website einen
neutralen Text oder blendet die Stelle aus.

## Recht und Datenschutz

- **Datenschutzerklärung rechtlich prüfen lassen.** Sie ist sorgfältig erstellt, ersetzt aber keine Rechtsberatung.
- **Hosting GitHub Pages:** In der Datenschutzerklärung (Abschnitt 2) als Anbieter eingetragen. Bitte rechtlich prüfen lassen: Drittlandübermittlung in die USA und Vertragsgrundlage mit GitHub (Data Protection Agreement, EU-U.S. Data Privacy Framework).
- **DNS und HTTPS:** www.cleanstar-dienstleistungen.de muss per CNAME auf regresi.github.io zeigen; in Settings → Pages „Enforce HTTPS“ aktivieren, sobald das Zertifikat ausgestellt ist (siehe README).
- **Web3Forms:** Anbieter, Sitz und Drittlandübermittlung prüfen, AV-Vertrag abschließen, Abschnitt 5 der Datenschutzerklärung ggf. ergänzen.
- **Cal.com:** Drittlandübermittlung (USA) und AV-Vertrag prüfen, Abschnitt 7 ggf. ergänzen.
- **Verantwortlich nach § 18 Abs. 2 MStV:** steht jetzt Nico Schütterle (erster Gesellschafter). Bitte bestätigen oder ändern.
- **Datenschutzbeauftragter:** Einschätzung „nicht zu benennen“ bestätigen.
- **Speicherfristen** für Bewerbungen (6 Monate) und Partneranfragen (12 Monate) bestätigen.
- **Bildnachweise:** Der Abschnitt im Impressum ist ausgeblendet. Falls Bilder mit KI erstellt wurden oder von Dritten stammen, bitte einen passenden Hinweis festlegen.

## Fakten

- **Reklamationsfrist** fehlt (`complaintPeriod`). Die Website sagt neutral „kurzfristig“. Mit einer festen Frist (z. B. „24 Stunden“ oder „am nächsten Werktag“) erscheint sie automatisch in Garantie und Reklamationsablauf.
- **Direkte Nummer der Ansprechpartner:** Die Karte „Ihr Ansprechpartner“ zeigt Nico Schütterle mit der Firmennummer 0173 8512107 und „Jetzt erreichbar · 24/7“. Bitte bestätigen, dass Anrufe dort direkt bei Nico bzw. einem der Gründer ankommen.
- **Kontrollrhythmus:** Die Website sagt „den Rhythmus legen wir im Angebot fest“. Mit einem festen Rhythmus (z. B. monatlich) wird die Aussage stärker.
- **Bestätigungsmail an Kunden** (Web3Forms Pro): erst einrichten, dann `forms.confirmationEmail: true` setzen.
- **WhatsApp:** ist ausgeschaltet (`whatsapp.enabled: false`). Bei Bedarf einschalten.
- **Firmen-Timeline:** Nur „2024 Gründung in Offenburg“ ist bestätigt. Weitere Meilensteine (z. B. erste feste Büroobjekte mit Jahr) in `company.ts` eintragen und `confirmed: true` setzen.

## Aussagen, die vor einer Veröffentlichung bestätigt werden sollten

- **Nachhaltigkeit:** Aussagen zu Dosierung, Mikrofasertüchern und umweltschonenden Mitteln wurden entfernt. Bei Bedarf mit bestätigten Angaben wieder aufnehmen.
- **Verschwiegenheitserklärung der Mitarbeitenden:** Die Aussage „zur Verschwiegenheit verpflichtet“ wurde entfernt. Wenn es eine schriftliche Erklärung gibt, wieder ergänzen.
- **Verbrauchsmaterial:** Ob CleanStar Seife, Papier usw. liefert, ist offen. Die Website sagt „legen wir im Angebot fest“.
- **Muster-Leistungsverzeichnis und Grundriss** (`src/content/floorplan.ts`): branchenübliche Standardleistungen und Intervalle. Bitte einmal durchsehen.
- **Kostenvergleich eigenes Personal:** Annahmen in `src/content/pricing.ts` (Lohnnebenkosten, Ausfalltage) mit Steuerberatung oder Lohnbüro abgleichen.
- **Fahrzeiten** auf der Seite Einzugsgebiet sind ungefähre Werte.

## Bilder

- **Funken-Portal Vorher/Nachher (Seite Leistungen) ist gebaut, aber ausgeschaltet** (`features.sparkPortal: false` in `src/content/features.ts`, Ansicht auf /labor/portal, noindex). Grund: `vorher-buero` und `nachher-buero` sind nicht deckungsgleich. Die Architektur (Fenster, Decke, Säule) lässt sich zur Deckung bringen, die Möbel rechts stehen aber an anderen Stellen; im wachsenden Kreis springen die Tische sichtbar. Benötigt wird ein Bildpaar vom Stativ aus exakt derselben Position (gleiche Brennweite, gleicher Ausschnitt, nur Zustand und Licht verschieden). Danach Schalter auf `true` setzen.

## Karriere

- **Stellen bestätigen:** Beide Stellen (Reinigungskraft, Objektleitung) stehen online. Bitte bestätigen und Stundenumfang sowie Vergütung ergänzen oder eine Stelle mit `enabled: false` ausblenden (`src/content/site.ts`, `jobs`).
- **Leistungen für Mitarbeitende** (Bezahlung, Zuschläge, Arbeitskleidung, Fahrtkosten) nur ergänzen, wenn bestätigt.

## Partnerprogramm

- **Konditionen** (Einstiegsgebühr, laufende Gebühr, Vertragslaufzeit, Gebietsschutz) festlegen und anwaltlich prüfen lassen. Danach `partnerFlags.showConditions: true`.
- In der Partner-FAQ bleiben diese Punkte bewusst offen formuliert („klären wir im Gespräch“, „regelt der Partnervertrag“): Firmenname von Bestandsfirmen, Gebietsschutz, Laufzeit, Kapitalbedarf, Weitergabe von Anfragen, Bestandskunden, nebenberuflicher Start, Voraussetzungen für Gründer.

## Inhalte, die die Website stärker machen

- **Echte Kundenstimmen** mit Einverständnis (`testimonials.enabled`) und **Kundenlogos** mit Freigabe (`clientLogos.enabled`).
- **Gründungsgeschichte** in eigenen Worten (Anlass, erste Kunden) für die Seite Über uns.

## SEO, Standorte und Ratgeber (neu)

- **Externe SEO-Aufgaben:** Search Console, Bing, Google-Unternehmensprofil, Bewertungen, Verzeichnisse. Ausführliche Anleitung in **SEO-TODO-EXTERN.md**.
- **Google-Profil-Link:** nach Einrichtung in `src/content/company.ts` bei `profiles.google` eintragen (erscheint dann in den strukturierten Daten).
- **Neue Orte im Einzugsgebiet:** 19 Orte ergänzt (Renchen, Rheinau, Kappelrodeck, Sasbach, Lautenbach, Oppenau, Zell am Harmersbach, Biberach, Hausach, Wolfach, Seelbach, Kippenheim, Mahlberg, Ettenheim, Rust, Schwanau, Meißenheim, Berghaupten, Ohlsbach). Bitte bestätigen, dass CleanStar dort wirklich reinigt, und die ungefähren Fahrzeiten (`src/content/places.ts`) prüfen. Nicht gewünschte Orte einfach aus `places.ts` und `locations.ts` löschen.
- **Ortstexte** (`src/content/locations.ts`) und **Kombiseiten** (`src/content/officeCities.ts`): enthalten nur allgemeine, wahre Aussagen über die Orte. Bitte einmal querlesen, ob alles zu Ihrer Erfahrung passt. Die Beispielrechnungen auf den Kombiseiten sind Richtwerte aus den Stundensätzen.
- **Ratgeber** (`src/content/ratgeber/`): Rechtliche und steuerliche Angaben sind mit Quellen belegt (Stand Oktober 2026), ersetzen aber keine Beratung. Einmal im Jahr prüfen, besonders zum 1. Januar (Mindestlohn, Sozialversicherung, Minijob). Der Branchenmindestlohn Gebäudereinigung für 2027 wird gerade verhandelt.
- **Artikel-Autoren:** Jeder Artikel ist einem Gründer zugeordnet (Foto, Rolle). Bitte bestätigen oder in der Artikeldatei bei `author` ändern (0 = Nico, 1 = Lino, 2 = Eknoor).
- **Rückruf-Formular:** sendet über Web3Forms mit Betreff „Rückruf: …“. Einmal testen und prüfen, dass die Anfrage ankommt.
- **Partnerprogramm:** Ratgeber und Kalkulationsrechner verweisen auf das Partnerprogramm. Konditionen bleiben „klären wir im Gespräch“, bis sie festgelegt sind.

## Technik

- **Formular-Test:** Der Web3Forms-Key ist eingetragen und die Formulare senden echt. Bitte nach dem Livegang einmal eine Testanfrage (Betreff „TEST Website“) über das Kontaktformular senden und prüfen, ob sie im Postfach ankommt. Bei Web3Forms ggf. die Domain www.cleanstar-dienstleistungen.de als erlaubte Absender-Domain eintragen.
- **Sicherheitsupdate React Router:** `npm audit` meldet zwei mittlere Schwachstellen in react-router 6. Die Behebung erfordert ein Update auf Version 7 (größere Umstellung, separat einplanen).

## Redesign

- **Schrift:** Die Wunschschrift Switzer (Fontshare) war aus der Arbeitsumgebung nicht abrufbar. Eingesetzt ist Instrument Sans (SIL Open Font License, lokal eingebunden); die frühere Monospace-Schrift ist entfernt. Wenn Switzer gewünscht ist, die WOFF2-Datei unter `src/assets/fonts/` ablegen und in `src/styles/index.css` (`@font-face` und `--font-sans`) tauschen. Die Lizenz von Fontshare bitte vorher prüfen.
- **Belege (`src/content/proof.ts`):** Der Bereich „Beweise“ auf der Startseite ist ausgeblendet (`enabled: false`), weil es noch keine freigegebenen Kundenstimmen, Objekte oder Logos gibt. Einträge nur mit schriftlicher Zustimmung des Kunden eintragen, dann `enabled: true` setzen.
- **Fotoshooting:** Die Shot-Liste steht in `BILDER.md` (Abschnitt „Shot-Liste für das Fotoshooting“). Die aktuellen Bilder funktionieren, ein einheitliches Shooting würde das Design deutlich stärken.
- **Styleguide:** `/styleguide` ist intern, nicht verlinkt, `noindex` und nicht in der Sitemap.

## Leistungsmappe (/leistungsmappe)

- **Fotos der Schreibtisch-Szene:** liegen jetzt alle in `bilder/mappe/` (Tisch quer und hoch, Kaffee, Pflanze, Stift, Schlüssel, Visitenkarte, Einband). Neue Fotos dort ablegen und `node scripts/mappe-assets.mjs` ausführen; das Skript erkennt sie am Namen (auch „Kugelschreiber“, „Sukkulente“, „Eichenholz“, „Tischplatte“), die Tisch-Ausrichtung am Seitenverhältnis.
- **Tischfoto-Auflösung:** Das Querformat hat 1672 px. Auf großen Bildschirmen fangen eine leichte Randunschärfe und feines Filmkorn das auf. Ein Foto mit mindestens 3000 px Breite wäre schärfer.
- **Startseiten-Standbild:** `public/mappe/teaser.webp` ist ein Standbild der Szene. Nach neuen Fotos bitte neu erzeugen (Szene öffnen, Bildschirmfoto 1200 × 800 ohne Bedienleiste).
- **Personalisierte Mappe:** Links erzeugt die interne Seite `/mappe-link` (nicht verlinkt, nicht in der Sitemap, noindex). Sie ist öffentlich erreichbar, verrät aber nichts Vertrauliches.
- **Nacht-Uhr:** Die Uhrzeiten sind als Beispielablauf gekennzeichnet. Bitte prüfen, ob die Reihenfolge zu Ihrem tatsächlichen Ablauf passt (`src/features/mappe/extras.tsx`, `nightEvents`).
- **Anfragekarte:** sendet über Web3Forms mit Betreff „Besichtigung (Leistungsmappe): Firma“. Einmal testen.
- **Inhalte** kommen aus den Inhaltsdateien (`site.ts`, `company.ts`, `services.ts`, `floorplan.ts`, `pricing.ts`, `places.ts`, `proof.ts`). Das Kapitel „Referenzen“ erscheint automatisch, sobald `proof.ts` freigegebene Einträge hat.
- **Smartphone:** Die flache Mappe zeigt die Seiten verkleinert; längere Texte sind dort klein. Wer lesen statt blättern möchte, nutzt „Als Text lesen“ oder das PDF.

## Karte Einzugsgebiet (/einzugsgebiet)

- **Kartendaten:** Die Karte nutzt selbst gehostete Vektorkacheln (`public/map/ortenau.pmtiles`, aus OpenStreetMap-Daten über Overture Maps, ODbL). Aktualisieren: `python3 scripts/map/fetch_overture.py …` (Aufrufe stehen im Kopf der Datei), danach `python3 scripts/map/build_tiles.py`. Die Quellenangabe „© OpenStreetMap-Mitwirkende, Overture Maps“ steht in der Karte und muss bleiben.
- **Fahrzeiten:** weiterhin Richtwerte aus `src/content/places.ts`.
- **Ortstexte:** Charakter und je zwei weitere Fragen pro Ort stehen in `src/content/locationsExtra.ts`. Bitte einmal gegenlesen, ob alles zu Ihrer Arbeitsweise passt. Ähnlichkeit der Ortsseiten prüfen: `node scripts/similarity.mjs` (nach `npm run build`).

## Awwwards-Runde

- **Brief der Gründer (Über uns):** Der Text in `src/content/letter.ts` ist ein Entwurf (`draft: true`). Bitte von Nico, Lino und Eknoor lesen, anpassen und freigeben, danach `draft: false` setzen.
- **Unterschriften fehlen:** Unter dem Brief stehen die Vornamen vorerst in Handschrift (Caveat). Für echte Unterschriften bitte je eine Datei `bilder/unterschriften/nico.png`, `lino.png`, `eknoor.png` (schwarz auf weiß oder transparent, mindestens 800 px breit) ablegen. Daraus wird ein SVG-Strich erzeugt, der sich beim Erscheinen „schreibt“.
- **Drei Wege (Startseite):** Die Startwerte im Konfigurator (z. B. 15 Mitarbeitende, 300 m² beim kleinen Büro) sind nur Vorbelegungen zum Anpassen. Bitte prüfen, ob sie zu Ihren typischen Objekten passen (`src/features/office/officeWay.ts`).
- **Profile für das Organization-Schema:** In `src/content/company.ts` unter `profiles` den Link zum Google-Unternehmensprofil (`google`), zur LinkedIn-Seite (`linkedin`) und weitere Profile (`others`) eintragen. Leere Felder werden weggelassen.
- **Ortsseiten zusammengeführt:** Eigene Seiten haben nur noch 12 Orte (in `src/content/places.ts` mit `page: true`). Die übrigen 22 Orte stehen mit Fahrzeit auf `/einzugsgebiet/`; ihre alten Adressen leiten dorthin weiter (GitHub Pages: Meta-Refresh mit Canonical, Cloudflare und Apache: echte 301). Soll ein Ort wieder eine eigene Seite bekommen, `page: true` setzen und seine Texte in `locations.ts`/`locationsExtra.ts` ausbauen.
- **Datumsangaben:** „Zuletzt aktualisiert“ für Werkzeuge und Fakten-Seite steht in `src/content/pageMeta.ts`, für Ratgeber im jeweiligen Artikel (`modified`). Bei inhaltlichen Änderungen bitte mitpflegen.
- **Sprachnachricht von Nico:** Das runde Gründer-Porträt mit Ring-Puls ist vorbereitet, aber nur Bild. Liegt eine Sprachnachricht vor (z. B. `bilder/audio/nico.m4a`), wird das Porträt zum Abspielknopf.

## Nachbesserung 2

- **Landschaftsfoto für den Wolken-Übergang fehlt:** Unter den Wolken sollte ein gestochen scharfes Landschaftsbild der Ortenau liegen, ohne Gebäude im Vordergrund. Das vorhandene `region-ortenau` zeigt Häuser im Vordergrund und ist nur 1916 px breit. Deshalb geben die Wolken vorerst direkt die Geländekarte frei (Blick von oben, passt zur Wolken-Höhe). Für die volle Fassung bitte `bilder/landschaft-ortenau.jpg` ablegen (Querformat, mindestens 2400 px breit, scharf). Bildprompt:
  ```
  Wide aerial landscape photograph of the Ortenau region in Baden-Württemberg, Germany: the Rhine plain with green fields and vineyards in the foreground, rolling foothills of the Black Forest in the middle, forested mountains on the horizon, clear blue sky with a few small clouds, bright morning sunlight, tack sharp from front to back, no buildings in the foreground, no text. Very high resolution, 21:9.
  ```
- **Eck-Pflanzen kleiner als gewünscht:** `pflanze-ecke-1.png` hat 1024 × 1536 px, `pflanze-ecke-2.png` 1312 × 1199 px (gewünscht mindestens 1600 px). Sie werden nur in Originalgröße oder kleiner ausgeliefert, nicht hochgerechnet; am Desktop ist das ausreichend scharf. Größere Fassungen (Prompt siehe Nachbesserungs-Auftrag) einfach unter demselben Namen ablegen und die Web-Fassungen in `public/images/deko/` (AVIF und WebP mit Transparenz) neu erzeugen.
- **Wolken:** Aus `wolken-1.png` (1916 × 821 px) entstehen drei Ebenen (`wolken-ebene-a/b/c.png`, Ausschnitte und Spiegelung). Echte zweite und dritte Wolkenbilder (`wolken-2.png`, `wolken-3.png`) würden die Wiederholung weiter verringern.
- **Papierkante:** Die hochgeladene `papierkante.png` wird nicht verwendet: Ihr Faserrand ist rund 60 px breit und grau, in der Vergrößerung wirkt er wie ein Schatten statt wie Papier. Die Kante wird stattdessen mit `scripts/deko/papierkante.py` erzeugt (mehrere Rausch-Oktaven, dichter weißer Faserrand, einzelne Fasern, Papierfarbe aus unserer Palette). Vergleich: `docs/review-nachbesserung-2/2-papier-kante-vergroessert.jpg`.
- **Funken-Portal bleibt aus** (siehe „Bilder“): weiterhin kein deckungsgleiches Bildpaar.
- **Safari/WebKit:** Der Deploy-Test läuft im Veröffentlichungs-Workflow in Chromium und WebKit. Lokal stand nur Chromium zur Verfügung; die Prüfung in echtem Safari auf iPhone/Mac bitte einmal von Hand machen (Startseite: Papier-Reveal, Wolken, Moment-Schrift; Qualitätsgarantie: Karten ziehen und umdrehen).
