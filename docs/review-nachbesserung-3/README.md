# Review Nachbesserung 3 (Lebendigkeit)

Je Punkt eine Bildfolge: oben die Referenz (Bild für Bild angesehen), darunter CleanStar mit 12 Bildern am Desktop
(1440 × 900) und 12 am Handy (390 × 844). Leitfrage bei jedem Durchgang: Wirkt es lebendig und natürlich oder mechanisch?

| Punkt | Bild | Technik |
| --- | --- | --- |
| 1 Papierkante | `1-papierkante.jpg` | WebGL-Shader `src/components/ui/paperEdge.ts` |
| 2 Pflanzen | `2-pflanzen.jpg`, `2-pflanzen-wind.jpg` | WebGL-Verformung `src/components/home/plantWind.ts` |
| 3 Wolken | `3-wolken.jpg` | WebGL, drei Tiefen `src/components/home/cloudGl.ts` |
| 4 Karte am Handy | in `3-wolken.jpg` (Handy-Zeile) | Abstand `.cc-space` nur am Handy |

## 1 Papierkante

- **Referenz:** Bilder 4 bis 20 von `shopify/07-papier-reveal`. Die Rissform ist in jedem Bild eine andere: Berge wandern,
  wachsen und schrumpfen, die Kante steigt nicht als gerade Linie, der weiße Faserrand flackert.
- **Durchgang 1:** Kante als Fragment-Shader über dem fest liegenden Bild. Rauschen über (Breite, Scrollweg, Zeit) in fünf
  Oktaven, jede wandert anders zur Seite; eine eigene Neigung lässt mal die linke, mal die rechte Seite schneller hochreißen.
  Ergebnis: Die Form lebt, aber der weiße Rand verschwand auf unserem hellen Papier, und die Fetzen sahen aus wie Tropfen.
- **Durchgang 2:** Der helle Faserrand liegt außerhalb des Papiers (wie bei Shopify), dicht am Papier, nach außen flockig,
  dazu vereinzelte schräge Haarfasern und kleine Fetzen. Ein erster Versuch wirkte wie ein Kamm aus Eiszapfen; mit
  unregelmäßigem Gewebe (fbm statt senkrechter Streifen) wirkt er jetzt wie gerissenes Papier. Ohne Scrollen atmet die
  Kante sehr langsam weiter; außer Sicht wird nicht gezeichnet. Handy: feinere Rissform, kleinere Amplitude.
  Reduzierte Bewegung und ohne WebGL: die feste Kante aus Nachbesserung 2.

## 2 Pflanzen

- **Referenz:** `era/03-blumen-abschnitt`, die Bougainvillea steigt mit dem Scrollen und bewegt sich leicht.
- **Durchgang 1:** Statt eines CSS-Wiegens des ganzen Bilds verschiebt ein Shader jeden Bildpunkt: Auslenkung = Abstand vom
  Befestigungspunkt (oben bzw. Ecke unten links) × Wind aus drei Sinus-Wellen (Perioden 3, 4,1 und 6,3 s) plus Rauschen.
  Der Ansatz bleibt ruhig, die Spitzen schwingen rund 2 % der Bildbreite (`2-pflanzen-wind.jpg` zeigt den Unterschied).
- **Durchgang 2:** Feder-Schwung bei schnellem Scrollen (weich ausschwingend), Ausweichen der Blätter vor der Maus
  (Desktop), Parallaxe steigt rund 12 % der Pflanzenhöhe. Die Zeichenfläche ist 6 % größer als das Bild, damit schwingende
  Spitzen nicht abgeschnitten werden. Reduzierte Bewegung: nur die Parallaxe.

## 3 Wolken

- **Referenz:** `era/13-wolken-uebergang`, Wolken steigen auf, liegen in mehreren Tiefen, lösen sich zur Landschaft hin auf.
- **Durchgang 1:** Drei Tiefen (hinten klein, langsam, weicher und blasser; vorne groß, schnell, scharf), Eigendrift ohne
  Scrollen (gespiegelte Wiederholung, keine Naht), quellende Ränder per Rausch-Verzerrung, Auflösen von unten nach oben in
  Fetzen statt Wegschieben. Fund: Das Licht auf der Oberseite zeichnete einen harten weißen Umriss (Aufkleber-Wirkung),
  und die Wolken schoben sich über die Moment-Überschrift.
- **Durchgang 2:** Licht weich und innerhalb der Deckkraft (Oberseite etwas heller, Unterseite leicht grau-blau),
  Überschrift liegt über den Wolken. Leistung: Es wird nur der sichtbare Streifen gezeichnet, nach dem Übergang gar nichts
  mehr; ist ein Gerät zu langsam, sinkt die Auflösung stufenweise, und im Notfall übernehmen die festen Bild-Ebenen.

## 4 Karte am Handy

Auf 360, 390 und 430 px lag die Karte halb unter den Wolken und war beim Auflösen schon vorbeigescrollt. Am Handy gibt es
jetzt über der Karte Raum für den Übergang (58 svh); die Karte kommt erst frei ins Bild, wenn sich die Wolken aufgelöst
haben. Desktop unverändert.
