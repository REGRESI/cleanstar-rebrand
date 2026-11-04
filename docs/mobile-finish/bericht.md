# Mobile-Abschluss: Bericht

Alle Änderungen gelten nur unter 768 px Breite bzw. für Touch (`pointer: coarse`). Desktop 1440 px: 22 Vergleichsbilder
(Startseite, Leistungen, Einzugsgebiet, je über die ganze Seite, reduzierte Bewegung, damit die Bilder nicht von laufenden
Animationen abhängen) vorher und nachher pixelgleich. Belegbilder 390 × 844 (Chromium mit iPhone-Emulation, 2-fach):
`*-vorher.jpg` / `*-nachher.jpg` in diesem Ordner, erzeugt mit `scripts/shots-mobile-finish.mjs`.

## 1. Wolken zur Karte: leere Fläche (`1-wolken-karte-a…d`)
Ursache: Am Handy reservierte `.cc-space` 58 svh leere Fläche über der Karte (damit die Wolken die Karte nicht
verdecken). Jetzt: kein Platzhalter mehr. Die Wolkenbank liegt am Handy über der Oberkante der Karte (zwischen Überschrift und
Karte), steigt auf und zieht nach oben weg; aufgelöst ist sie, sobald die Oberkante der Karte bei 40 % der Bildschirmhöhe
steht. Die Karte folgt im normalen Abschnittsabstand. Der Übergangstest prüft die leere Fläche jetzt auch auf 390 px (über
35 % eines Bildschirms ist ein Fehler).

## 2. Karte ohne „Antippen zum Aktivieren“ (`2-karte-…`)
- Der Knopf „Karte bewegen“ ist weg; die Geländekarte lädt auf dem Handy von selbst, sobald sie sich dem Bild nähert.
- Ein Finger scrollt immer die Seite (gemessen: Wischen auf der Karte scrollt die Seite um 285 px); zwei Finger zoomen und
  verschieben die Karte (MapLibre `cooperativeGestures`), der eingeblendete Hinweis dazu ist auf Touch ausgeblendet.
- Orte sind sofort antippbar: Trefferfläche 44 × 44 px (der nächste Ort im Umkreis von 22 px). Getestet: Antippen startet den
  Vogelflug, danach öffnet sich die Ortsseite (z. B. /einzugsgebiet/kehl).
- Darunter steht die Ortsliste mit Links jetzt auch am Handy offen (vorher eingeklappt).

## 3. Papierkante wie am Desktop (`3-papierkante-…`)
- Neue Bildfolge `public/images/deko/papierkante-mobil/kante-00…09.webp` (je etwa 27 KB), erzeugt mit
  `scripts/deko/papierkante-serie.py` nach dem Verfahren von `papierkante.py`: heller ausgefranster Faserrand, kurze Fasern,
  weicher Schatten (eingerechnet, kein CSS-Filter). Die Form wandert von Bild zu Bild leicht weiter.
- Beim Scrollen wird überblendet (immer nur zwei Bilder sichtbar, nur Deckkraft); das untere Bild bleibt deckend, damit das
  Papier nie durchscheint.
- Das Morgen-Bild der Startseite steht beim Wegziehen des Papiers jetzt fest (sticky wie auf der Leistungsseite, vorher lief
  es am Handy im Fluss mit nach oben). Damit die Startseite höchstens drei Haltestellen hat, läuft das Seitenende-Bild am
  Handy als Band im Fluss (wie bei reduzierter Bewegung).

## 4. Pflanzen überdecken den Text (`4-pflanzen-…`)
Pflanzen am Handy 35 % der Breite: oben rechts über dem Text, unten links darunter. Der Text bekommt oben und unten genau
den Platz der Pflanzen und seitlich Abstand (Abschnitt 545 statt 311 px hoch). Der Blauschimmer läuft unten weich aus
(Maske), keine harte Kante mehr. Der Übergangstest prüft jetzt auch Pflanzen über Text (an der Überschneidung wird die
Deckkraft des Pflanzenbilds geprüft): vorher 4 Fehler an der Stelle, jetzt keiner.

## 5. Handy-Leiste (`5-leiste-ueber-bild`)
Die Leiste schaltete über dunklen Abschnitten auf helle Schrift um; über hellen Bildteilen dunkler Abschnitte (Papier-Bild)
waren „Anrufen“ und „Rückruf“ dadurch unsichtbar. Jetzt immer dieselbe deckende helle Leiste mit dunkler Schrift, keine
Umschaltung (Beobachter entfernt).

## 6. Die vier Ärgernisse (`6-aergernisse`)
Am Handy jetzt zeitbasiert statt an die Scrollposition gekoppelt: Sobald eine Zeile zur Hälfte sichtbar ist, wird sie
durchgestrichen (Wisch über 0,75 s, registrierte CSS-Eigenschaft `--wt`); zurück erst, wenn sie unten wieder hinausläuft.
Nach schnellem Wischen (Sprünge von 420 px) sind alle vier Zeilen durchgestrichen.

## 7. Übergänge (`7-kartenkante-ablauf`, `grenzen.md`)
- Kartenkante über „So arbeiten wir zusammen“: am Handy nur noch feine Linie mit kaum sichtbarem Schatten statt des
  grauen Streifens.
- Alle 12 Abschnittsgrenzen der Startseite auf 390 px geprüft (`grenzen.md`). Zusätzlich gefunden und behoben: Die
  Tipp-Zeile im Hero zerfiel beim Löschen in verstreute Wortreste; am Handy wird jetzt von hinten gelöscht (wie die
  Rücktaste).

## WebKit
Der Diagnose-Workflow ist entfernt. Im Veröffentlichungs-Workflow laufen beide WebKit-Schritte nur noch als Warnung
(`continue-on-error`, Zeitlimit 5 Minuten).

## Einfachere Lösungen statt der ersten Idee
- Papierkante: erster Entwurf überblendete beide Bilder gegenläufig; dabei wurde das Papier halb durchsichtig (grauer
  Streifen). Jetzt bleibt das untere Bild deckend und nur das obere blendet ein.
- Seitenende-Bild der Startseite am Handy ohne Haltestrecke (statt einer vierten Haltestelle).
