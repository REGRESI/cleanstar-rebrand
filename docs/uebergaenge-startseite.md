# Startseite: Übergänge

Basis der Bestandsaufnahme: `04418ea`, Branch `claude/optimistic-hypatia-a2lf28`.

| Grenze | Vorher | Übergang und Begründung |
|---|---|---|
| Hero → Ankunft | Kreis mit Titel | Kreis mit Titel: öffnet das Versprechen über dem Büro am Morgen |
| Ankunft → Leistungen | Horizontaler Leistungsablauf | Horizontal-Scroll: nur hier, sechs Leistungen in einer zusammenhängenden Bewegung |
| Leistungen → Kosten | **Kein eigener Übergang** | Karten-Stapel: aus den Leistungen wird das konkrete Angebot |
| Kosten → Probleme / Lösungen | **Kein eigener Übergang** | Fließende Farbe 1: ruhiger Wechsel zur Beratung |
| Probleme / Lösungen → Am Morgen | Papierkante | Papier-Reveal: Probleme wegschieben, Ergebnis freilegen; einmal |
| Am Morgen → Ihr festes Team | **Kein eigener Übergang** | Lichtkante 1: vom sauberen Ergebnis zu den Menschen dahinter |
| Ihr festes Team → Gründer | **Kein eigener Übergang** | Zoom durch das Logo-Haus: genau einmal als Abschnittsübergang |
| Gründer → Ablauf | **Kein eigener Übergang** | Fließende Farbe 2: ruhiger Wechsel zu den Schritten der Zusammenarbeit |
| Ablauf → Einzugsgebiet | Wolken über der Geländekarte | Wolken: Blick über die Ortenau; einmal, an der bisherigen Stelle |
| Einzugsgebiet → Leistungsmappe | **Kein eigener Übergang** | Wachsendes Bildfenster: der vorhandene Mappentisch wird zum Hintergrund |
| Leistungsmappe → Kurz beantwortet | **Kein eigener Übergang** | Karten-Stapel: kompakte Fakten nach dem Buch |
| Kurz beantwortet → Abschluss / Besichtigung | **Kein eigener Übergang** | Lichtkante 2: Klarheit führt zum nächsten Schritt |
| Abschluss → Footer mit Abschlussfoto | Bild-zu-Streifen | Bild-zu-Streifen: nur vor dem Footer |

Keine zwei gleichen Übergänge direkt hintereinander. Es gibt höchstens zwei große Momente hintereinander, zwei Farbwechsel und je einen Papier-, Wolken- und Hausübergang.

## Bedingte Inhalte

`Proof` ist deaktiviert und enthält keine freigegebenen Belege. Es wird nichts erfunden. Bei späterer Freigabe: Gründer → Belege = Farbwechsel 2; Belege → Ablauf = Karten-Stapel. Die Prüfung zählt die tatsächlich gerenderten Abschnitte.

## Visuelle Prüfung

Zwei Bildfolgen-Durchgänge für Desktop und Mobile liegen in `docs/review-uebergaenge/durchgang-1/` und `durchgang-2/`: je fünf Bilder pro geprüftem Eintritt und eine Kontaktfolge. Alle fünf neuen Übergangsarten sind auf beiden Formaten enthalten. Beide Durchgänge wurden visuell anhand der Kontaktfolgen geprüft.

Kritischer Vergleich gegen Papierkante und Wolken:
- Die alte Szene bleibt bis zur Übernahme stehen. Ein echtes Halteelement ersetzt den zunächst unzureichenden Padding-Ansatz; dadurch entsteht kein leerer Streifen zwischen den Flächen.
- Das Bildfenster füllt am Ende den Bildschirm. Es verwendet dasselbe Foto und echte Inhalte; beim Übernehmen erscheint keine zweite Bildkopie.
- Die Hauskontur bleibt erkennbar und löst vollständig auf. Die Lichtkante bleibt als Glaswisch bewusst ruhiger als die organische Papierkante.
- Die zwei Farbwechsel trennen die großen Momente mit weicher Kante und gestaffelten Inhalten. Doppelte Überschriftenanimationen wurden an diesen Stellen entfernt.
- Mobile behält dieselben Übergangsarten. Mehr Platz unter den versetzten Gründerporträts verhindert eine Kollision mit dem nächsten Abschnitt.
- Die Abschlusspositionen sind gefüllt; Rückwärtsscrollen nimmt die Übergänge zurück. Papierkante und Wolken bleiben an ihren bisherigen Stellen.

## Messung und Abnahme

Vollständiger Lauf: [GitHub Actions 41194008104](https://github.com/REGRESI/cleanstar-rebrand/actions/runs/41194008104), geprüft auf `98c4439`.

- `npm run build`, Typecheck und Lint erfolgreich.
- Startseite: **621 Scrollpositionen**, Desktop und Mobile, 0 Leerbilder / erkannte Überschneidungen.
- Jede Abschnittsgrenze registriert, einschließlich Papiergrenze in der Doppelszene und Footer. Reduced Motion und No-JS bestanden; CLS 0 in allen vier Grenzprüfungen.
- Navigation: **152 Prüfungen bestanden**. Bildregeln: **53 Seiten bestanden**.
- Leistungsmappe: **147 Prüfungen bestanden**. Der freie Klickpunkt liegt am Seitenkopf, fern vom 3D-Lesebändchen; dessen beabsichtigter Sprung zu den Konditionen darf nicht als Rückwärtsblättern geprüft werden.
- Deploy-Verhalten mit und ohne alte Dateien: Chromium und WebKit bestanden.
- Zwei vollständige Bildfolgen-Durchgänge gesichert. Messwerte beider Formate: CLS 0, keine Skriptfehler.
- Lighthouse Mobile: **95/100**, FCP und LCP 2,3 s, TBT 120 ms, CLS 0, Speed Index 2,9 s. Produktionsbuild mit Gzip und Standard-Mobile-Simulation; kein Lighthouse-Messwert der veröffentlichten Domain. Der vorherige Lauf mit demselben Produktionsquellstand erreichte 96/100.
- Vollständige Repo-Textsuche nach dem bisherigen Slogan und seinen kennzeichnenden Teilstücken: keine Treffer.

**Offener Leistungsnachweis:** Die zusätzliche Bildzeitmessung läuft auf einem GitHub-Runner mit Software-WebGL. Im letzten Lauf wurden je nach Szene etwa 3–8 fps am Desktop und 6–30 fps im mobilen Viewport gemessen. Das erfüllt 60 fps in dieser Umgebung nicht und ersetzt keine Geräteprüfung mit echter GPU. Die 60-fps-Geräteabnahme wird ausdrücklich nicht als bestanden dargestellt. Rohwerte stehen in `docs/review-uebergaenge/frame-times.json`.

## Veröffentlichung

Der geprüfte Produktionsquellstand wird auf `claude/optimistic-hypatia-a2lf28` übernommen. GitHub Pages bleibt auf `gh-pages`. Die Live-Prüfung wartet ausdrücklich auf HTML mit dem neuen Slogan und den Übergangsmarkierungen und prüft danach Desktop und Mobile, Navigation, Bilder, Metadaten und fehlende Dateien.

## Nachbesserung nach der Scroll-Rückmeldung

Die bisherige Abnahme hat echte Touch-Bedienung und die Lesezeit nicht ausreichend erfasst. Die folgenden Änderungen ersetzen die ursprüngliche Umsetzung an den betroffenen Stellen:

- **Kosten → Probleme:** Beide Inhalte bleiben vollständig deckend im normalen Dokumentfluss. Keine Verschiebung oder Transparenz des Rechners, keine übereinanderliegenden Textflächen. Ein 96-px-Farbverlauf verbindet die Flächen. Das Blatt des Papier-Reveals bekommt mindestens eine kleine Bildschirmhöhe, damit kein Stück des späteren Bürofotos vor dem eigentlichen Papierübergang hervorschaut.
- **Team → Gründer:** Eine zusätzliche volle Bildschirmhöhe Scrollweg liegt zwischen dem vollständig sichtbaren Team-Abschnitt und dem Start des Hauses (900 px bei 1440 × 900, 844 px bei 390 × 844). Der Team-Titel ist sofort lesbar und hat keine zusätzliche Schreib- oder Ausblendanimation.
- **Mobile Wackeln:** Unsichtbarer Glanz und die vergrößerte Hauskontur konnten die Dokumentbreite über die Handybreite hinaus vergrößern. Reproduziert: 411 px Dokumentbreite bei 390 px Bildschirmbreite; der visuelle Viewport verschob sich beim Wischen um 46 px. `overflow-x: clip` am Übergangscontainer begrenzt die Dekorationen, ohne einen zusätzlichen Scrollcontainer für Sticky zu erzeugen. Der Touch-Regressionstest prüft jetzt 390 px Dokumentbreite, eine unveränderte Textposition beim Wischen und die Breite während des Haus-Zooms.
- **Animationsaufwand:** Kein `getBoundingClientRect()` zwischen Style-Schreibvorgängen im laufenden Übergang. Bildschirmhöhe aus einem stabilen `100svh`-Messpunkt statt wechselnder Browserleisten-Höhe. Geometrie wird nur beim Einrichten/Refresh gemessen. Die Lichtkante bleibt direkt an ihrer Maske.
- **Touch-Budget:** Native Touch-Bewegung (`syncTouch: false`) mit den bisherigen Navigations- und Zurück-Funktionen, Pflanzen mit Bild/CSS-Bewegung statt zwei dauernden WebGL-Flächen, keine großflächigen Kartenfilter, kleinere WebGL-Auflösung. Der Hero behält seine Erzählung; seine Partikel bekommen eine niedrigere mobile Auflösung und wechseln bei Überlastung früher auf den vorhandenen CSS-Effekt.

Neue Regression: `npm run test:home-reading`. Aufnahmen und Messwerte: `docs/review-uebergaenge/scrollkorrektur/`; die zusätzliche Bildfolge liegt in `durchgang-scrollfix-1/`.

Der Kacheltest unterscheidet eine absichtlich gehaltene, vollständig lesbare Szene mit beiden geladenen Pflanzenmotiven von fehlendem Inhalt; Leerbild- und Überschneidungsprüfung bleiben aktiv. Die Glyphenprüfung schneidet enger um die Überschrift, damit bewegte Nachbarabschnitte nicht als angeblich kollidierende Buchstabentinte zählen.

Abnahme der Nachbesserung: Build, Typecheck und Lint bestanden; **643 Scrollaufnahmen** (329 Desktop, 314 Mobile) ohne Leerbilder oder erkannte Textüberschneidungen; **152 Navigationstests bestanden**. Lesezeit und native Touch-Geste bestanden. Grenzprüfung mit Reduced Motion und No-JS bestanden, ebenso die neue Bildfolge; **CLS 0 auf Desktop und Mobile**. Lighthouse Mobile am lokalen Gzip-Produktionsbuild: **95/100**. Die genauen Messwerte und Protokolle stehen in `scrollkorrektur/abnahme.json` und `scrollkorrektur/logs/`.

Die 60-fps-Geräteabnahme bleibt eine Geräteprüfung; der neue Touch-Test ersetzt sie nicht. Er erfasst konkrete Wischgesten, Rückwärtssprünge, seitlichen Überlauf, Lesezeit und die Position des sichtbaren Textes.

## Entscheidungen

- Echte, einmal gerenderte Abschnitte statt Textkopien, Screenshots oder zusätzlicher Fokusziele.
- Ein tatsächliches, vorab reserviertes Spacer-Element hält die alte Fläche bis zur vollständigen Übernahme fest. Padding allein reicht dafür bei CSS Sticky nicht.
- Eine zusätzliche Lesephase vor dem Logo-Haus; keine zusätzlichen Scrollstrecken für Karten, Lichtkanten oder Farbwechsel. Der normale Eintritt in den Bildschirm ist ihr Übergangsweg.
- Bildfenster mit dem bereits vorhandenen Foto des Mappentischs; keine doppelten Fotos.
- Die Hauskontur stammt aus dem Logo und dem vorhandenen Preloader. Die scrollgesteuerte Hausmaske kommt genau einmal vor.
- Bei Reduced Motion normale, lesbare Abschnitte ohne Masken oder Überlagerung; auch ohne JavaScript bleibt das vollständige HTML lesbar.
- Tastaturfokus holt den nächsten Abschnitt vollständig ins Bild. Rückwärtsscrollen nimmt die Übergänge zurück.
- WebGL startet erst in der Nähe des jeweiligen Abschnitts. Bild-Ersatz bleibt vorhanden. Neue Übergänge werden ebenfalls erst beim Annähern vorbereitet.
- Markenversprechen ab dem ersten Paint lesbar; Scroll-Erzählung und Bildsequenz starten danach.
- Bewegliche Lichtkanten verwenden Transform statt wechselnder Layout-Koordinaten. Bei hohen Altabschnitten werden großflächige Unschärfefilter zugunsten der Bildrate vermieden.
- Der Slogan kommt zentral aus `brand`: **Sauber. Ohne Wenn und Aber.** Footer-Partikel tasten die aktuelle DOM-Schrift ab; Mappe und ihr PDF verwenden dieselbe Quelle. OG-Bild neu erzeugt, `slogan` im Schema ergänzt, Fakten und llms-Dateien aktualisiert.
- Der Abschnittstest prüft jede gerenderte Abschnittsgrenze, die Papiergrenze innerhalb der Doppelszene und den Footer auf Registrierung. Er prüft Wiederholungen und die Höchstzahlen der Effekte.
- Maskierte oder verdeckte Textteile dürfen nicht als sichtbare Überschneidung gezählt werden; die Prüfung berücksichtigt die jeweilige tatsächliche Ebene.
- Die Mappenprüfung wartet auf die fertige Szene und lässt dem Zeiger zwei Bilder vor dem Klick Zeit, wie bereits beim Wischtest.
