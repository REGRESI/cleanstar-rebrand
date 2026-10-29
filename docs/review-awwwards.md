# Review Awwwards-Runde

Art-Director-Review aller neuen Elemente bei 1440 × 900 und 390 × 844 (Bildfolgen je Element), zwei Durchgänge. Maßstab: beeindruckt es, und hilft es dem Geschäftsführer bei der Entscheidung? Ruhig, präzise, keine Effekte um der Effekte willen.

## Durchgang 1

| Element | 1440 px | 390 px | Befund und Behebung |
| --- | --- | --- | --- |
| Preloader | Logo-Symbol, Stern funkelt, „0 bis 100 % sauber“, öffnet nach oben | wie Desktop | Text stand im HTML und wäre für Suchmaschinen der erste Satz jeder Seite gewesen: Preloader wird jetzt per Skript erzeugt, nie im HTML. Dauer 0,7 bis 1,2 s, nur erster Aufruf je Sitzung, nicht bei reduzierter Bewegung. |
| Seitenübergänge | Kopfzeile bleibt, alter Inhalt gleitet nach oben, neuer öffnet sich von unten | Handy-Leiste bleibt stehen | Router übergab `viewTransition: undefined` und hob den Standard auf; korrigiert. Neue Seite startet oben (geprüft). |
| Abend/Morgen im Hero | Lichtkante läuft von links nach rechts, Headline bleibt | Hochformat-Bilder | ohne Befund; Bild lädt erst bei der ersten Benutzung |
| Drei Wege | nummerierte Zeilen, Haarlinien, Foto beim Überfahren | Fotos ausgeblendet, Zeilen groß | Nach einem Sprung (Anker, Zurück) blieben die Zeilen unsichtbar: Startpunkte der Einblendungen waren nach späten Layoutänderungen veraltet. Neu berechnet nach dem Laden, nach 2,5 s und bei jeder Höhenänderung. Für „Mehrere Standorte“ stand dieselbe Reihenfolge wie ohne Wahl; Reihenfolgen geschärft. |
| Kostenrechner | Spanne rollt, Balken flach (netto, Mehrwertsteuer) | Regler gut greifbar | Stundensatz stand doppelt (Hinweis und Steckbrief); Hinweis umformuliert |
| Brief der Gründer | Papierfläche, Absätze im Färbe-Effekt, Namen „schreiben“ sich | lesbar ab 1,25 rem | als Entwurf markiert; echte Unterschriften fehlen (OFFENE-PUNKTE.md) |
| Leistungen als Kapitel | Kapitel-Index links, Wasser-Effekt beim Überfahren | Index ausgeblendet, kein Effekt | PDF-Leistungsverzeichnis geprüft (Inhalt vollständig, Umlaute korrekt) |
| Leistungsmappe Lesemodus | Draufsicht, Doppelseite ca. 85 %, Tisch abgedunkelt und unscharf | flache Mappe (unverändert) | Pergament-Seiten 9 und 10 überlagerten Text der Seite darunter; neu aufgebaut mit eigener Kopfzeile, eigener Seitenzahl und Bildfenster. Ursache im 3D-Material (Deckkraft blieb bei 50 %) behoben. |
| Antwort-zuerst-Blöcke | Frage als Überschrift, Absatz links, Fakten rechts | Fakten unter dem Absatz | ohne Befund |
| Autorenzeile | Foto, Rolle, Kurzbio, Daten | gestapelt | ohne Befund |
| Einzugsgebiet | 12 Orte mit Seite, 22 Orte in der Liste mit Fahrzeit | wie Desktop | Orte ohne Seite fliegen auf der Karte an und zeigen Name und Fahrzeit |

## Durchgang 2

Alle Elemente erneut bei 1440 und 390 px aufgenommen: keine neuen Befunde. Die drei Wege erscheinen nach einem Sprung korrekt, Pergamentseiten ohne Überlagerung, Preloader nicht mehr im HTML.

## Messwerte

- Wortvielfalt Startseite (Typ-Token-Verhältnis): vorher 0,293 (1508 Wörter, inklusive doppelter Buchstaben-Kopien), nachher 0,516 (847 Wörter)
- Ortsseiten: 12 statt 34, Ähnlichkeit (Jaccard, 5-Wort-Shingles): Mittel 14,1 %, Maximum 20,5 % (Ettenheim/Rheinau), kein Paar über 30 %
- Bilder mit width und height im HTML: vorher 14 von 164 (9 %), nachher 164 von 164
- Sitemap: 53 Seiten, jede mit eigenem Titel, eigener Beschreibung, genau einer H1, Canonical
