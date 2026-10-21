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

## Karriere

- **Stellen bestätigen:** Beide Stellen (Reinigungskraft, Objektleitung) stehen online. Bitte bestätigen und Stundenumfang sowie Vergütung ergänzen oder eine Stelle mit `enabled: false` ausblenden (`src/content/site.ts`, `jobs`).
- **Leistungen für Mitarbeitende** (Bezahlung, Zuschläge, Arbeitskleidung, Fahrtkosten) nur ergänzen, wenn bestätigt.

## Partnerprogramm

- **Konditionen** (Einstiegsgebühr, laufende Gebühr, Vertragslaufzeit, Gebietsschutz) festlegen und anwaltlich prüfen lassen. Danach `partnerFlags.showConditions: true`.
- In der Partner-FAQ bleiben diese Punkte bewusst offen formuliert („klären wir im Gespräch“, „regelt der Partnervertrag“): Firmenname von Bestandsfirmen, Gebietsschutz, Laufzeit, Kapitalbedarf, Weitergabe von Anfragen, Bestandskunden, nebenberuflicher Start, Voraussetzungen für Gründer.

## Inhalte, die die Website stärker machen

- **Echte Kundenstimmen** mit Einverständnis (`testimonials.enabled`) und **Kundenlogos** mit Freigabe (`clientLogos.enabled`).
- **Gründungsgeschichte** in eigenen Worten (Anlass, erste Kunden) für die Seite Über uns.

## Technik

- **Formular-Test:** Der Web3Forms-Key ist eingetragen und die Formulare senden echt. Bitte nach dem Livegang einmal eine Testanfrage (Betreff „TEST Website“) über das Kontaktformular senden und prüfen, ob sie im Postfach ankommt. Bei Web3Forms ggf. die Domain www.cleanstar-dienstleistungen.de als erlaubte Absender-Domain eintragen.
- **Sicherheitsupdate React Router:** `npm audit` meldet zwei mittlere Schwachstellen in react-router 6. Die Behebung erfordert ein Update auf Version 7 (größere Umstellung, separat einplanen).
