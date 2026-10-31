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

## Entscheidungen

- Echte, einmal gerenderte Abschnitte statt Textkopien, Screenshots oder zusätzlicher Fokusziele.
- Ein tatsächliches, vorab reserviertes Spacer-Element hält die alte Fläche bis zur vollständigen Übernahme fest. Padding allein reicht dafür bei CSS Sticky nicht.
- Keine zusätzlichen Scrollstrecken für Karten, Lichtkanten oder Farbwechsel. Der normale Eintritt in den Bildschirm ist ihr Übergangsweg.
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

## Prüfung und Zwischenstand

Vor Ausfall der lokalen Arbeitsumgebung:
- Build und Typecheck erfolgreich; Lint erfolgreich.
- Lighthouse Mobile: **95/100**, FCP 2,2 s, LCP 2,2 s, TBT 140 ms, CLS 0, Speed Index 3,0 s. Lokaler Produktionsbuild mit Gzip und Standard-Mobile-Simulation; kein Messwert der veröffentlichten Seite.
- Navigation: **152 Prüfungen bestanden** (Desktop und Mobile, ausgehend von der Startseite).
- Bildregeln: **53 Seiten bestanden**.
- Deploy-Test: Chromium bestanden; WebKit lokal wegen fehlender Systembibliotheken nicht ausgeführt.
- Grenzprüfung, Reduced Motion und No-JS bestanden; CLS an den geprüften Grenzen 0.
- Mehrere Bildfolgen-Durchgänge erzeugt und visuell geprüft. Die letzten Korrekturen betreffen die Haltefläche und Layout-Verschiebungen durch Lichtkanten.
- Ein früher vollständiger Scroll-Test zeigte noch Leerraum; ein späterer Lauf und die Wiederholung der Mappenprüfung liefen beim Umgebungsabbruch noch. Diese Ergebnisse werden ausdrücklich nicht als bestanden gewertet.

Offen: abschließender vollständiger Scroll-Test, abschließende Mappenprüfung, gesicherte Bildfolgen im Repository, abschließende Lighthouse-Messung auf exakt dem gespeicherten Stand, 60-fps-Messung und Live-Veröffentlichung/Prüfung.
