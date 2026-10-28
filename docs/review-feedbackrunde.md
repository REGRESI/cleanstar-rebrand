# Review Feedback-Runde

Strenger Art-Director-Durchgang über 14 Seiten (Startseite, Leistungen, Büroreinigung, Ablauf, Qualitätsgarantie, Über uns, Einzugsgebiet, Lahr, Büroreinigung Offenburg, Kontakt, Karriere, Partner, FAQ, Ratgeber), jeweils bei 1440 × 900 und 390 × 844 komplett durchgescrollt (Bildfolge alle 0,8 Bildschirmhöhen, Kontaktbögen). Zusätzlich automatischer Kontrastcheck (Text gegen tatsächlichen Hintergrund, WCAG AA) und SEO-Prüfung aller 75 Seiten im Build.

## Durchgang 1

| Seite | Befund | Behebung |
| --- | --- | --- |
| Alle | Keine Bild-Brücken mehr, keine Verläufe außer dem Hero-Text, Footer in Navy mit Slogan-Färbung | – |
| Alle | Horizontaler Überlauf 0, CLS höchstens 0,004 | – |
| Startseite mobil | Glasleiste über Navy-Abschnitten wirkt grau | Leiste erkennt dunkle Abschnitte darunter und wird dort zu dunklem Glas mit heller Schrift |
| Partner | Zeilen „In sieben Schritten zum Partner“ decken sich erst rund 2 s nach dem Erscheinen auf, Raster wirkt leer | Eigener Auslöser je Zeile, Aufdecken sofort beim Erscheinen (0,9 s, gestaffelt) |
| Ortsseiten, Büroreinigung Offenburg | „Auch in der Nähe“: Ortsnamen brechen mitten im Eintrag um („Reinigungsfirma / Friesenheim“) | Einträge der Punktliste umbrechen nur noch zwischen den Orten |
| Karriere | Einwilligungstext, Datenschutz-Link und Hinweis im dunklen Bewerbungsformular zu kontrastarm (2,3 bis 2,7 : 1) | Dunkel-Regeln für gedämpften Text, Links und Bildunterschriften wirken jetzt auch gegen Hilfsklassen (alle über 7 : 1) |
| Büroreinigung | Bildunterschrift des Vorher/Nachher-Reglers auf Navy 2,3 : 1 | wie oben |
| Ablauf, Garantie, Kontakt, FAQ, Ratgeber, Leistungen, Lahr, Über uns, Einzugsgebiet | ohne Befund | – |

Kontrastcheck nach den Korrekturen: keine Funde (ein Fehlalarm auf der Partnerseite: Schalter mit Farbe im oklab-Format, real weiß auf Tinte).

## SEO und GEO

- 75 indexierbare Seiten, jede mit eigenem Titel (20 bis 65 Zeichen) und eigener Beschreibung (70 bis 170 Zeichen), genau einer H1 und Canonical.
- Strukturierte Daten: BreadcrumbList 72, FAQPage 62, Service 45, Article 10, WebApplication 3, LocalBusiness 3, HowTo 2, WebSite 1, CollectionPage 1.
- Ortsseiten: FAQ-Schema enthält die drei eigenen Fragen der Seite (geprüft an Lahr).
- llms.txt und llms-full.txt werden beim Build erzeugt und listen alle Ortsseiten mit Fahrzeit.

## Durchgang 2

Siehe unten.
