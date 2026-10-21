# SEO außerhalb der Website: Checkliste für CleanStar

Die Website ist technisch fertig. Wie weit oben sie bei Google und in KI-Antworten erscheint, hängt jetzt
vor allem an Dingen, die nur Sie selbst erledigen können. Die Liste ist nach Wirkung sortiert:
oben das, was am meisten bringt.

**Firmendaten, überall exakt gleich schreiben (NAP):**

```
CleanStar Dienstleistungen GbR
Prinz-Eugen-Str. 80
77654 Offenburg
0173 8512107
info@cleanstar-dienstleistungen.de
https://www.cleanstar-dienstleistungen.de/
```

Immer genau so: „Prinz-Eugen-Str. 80“ (nicht „Straße“), Telefon mit Leerzeichen wie oben, Website mit www.
Abweichende Schreibweisen in Verzeichnissen schwächen das lokale Ranking.

---

## Priorität 1: diese Woche

### 1. Google Search Console einrichten (ca. 20 Minuten)

1. https://search.google.com/search-console öffnen, mit dem Google-Konto der Firma anmelden.
2. „Property hinzufügen“ → **Domain** wählen → `cleanstar-dienstleistungen.de` eingeben.
3. Google zeigt einen TXT-Eintrag (`google-site-verification=…`). Diesen beim Domain-Anbieter in den
   DNS-Einstellungen als **TXT-Eintrag** für die Hauptdomain (`@`) anlegen. Nichts anderes ändern.
4. Zurück in der Search Console auf „Bestätigen“ klicken. Kann bis zu einer Stunde dauern, selten länger.
5. Links „Sitemaps“ → `https://www.cleanstar-dienstleistungen.de/sitemap.xml` eintragen → „Senden“.
6. Oben in die Suchleiste nacheinander diese Adressen eingeben und jeweils „Indexierung beantragen“ klicken:
   - `https://www.cleanstar-dienstleistungen.de/`
   - `https://www.cleanstar-dienstleistungen.de/leistungen/bueroreinigung/`
   - `https://www.cleanstar-dienstleistungen.de/bueroreinigung/offenburg/`
   - `https://www.cleanstar-dienstleistungen.de/ratgeber/`
7. Danach einmal im Monat ansehen: „Leistung“ (Klicks, Suchbegriffe) und „Seiten“ (Fehler bei der Indexierung).

### 2. Bing Webmaster Tools (ca. 5 Minuten)

Bing liefert auch die Suchergebnisse für ChatGPT-Suche und Copilot, deshalb wichtig.

1. https://www.bing.com/webmasters öffnen, anmelden.
2. „Aus Google Search Console importieren“ wählen. Das übernimmt Website und Sitemap automatisch.
3. Unter „Sitemaps“ prüfen, dass die Sitemap übernommen wurde.

### 3. Google-Unternehmensprofil optimieren (ca. 1 Stunde)

Unter https://business.google.com bearbeiten:

- **Unternehmensname:** `CleanStar Dienstleistungen` (ohne Zusätze wie „Büroreinigung Offenburg“, das verstößt gegen die Richtlinien)
- **Primäre Kategorie:** die Kategorie für Gebäudereinigung bzw. Büroreinigung (in der Auswahlliste „Gebäudereinigung“ oder „Reinigung“ eingeben und die genaueste wählen)
- **Weitere Kategorien:** Fensterreinigung, Reinigungsdienst bzw. die passenden Einträge aus der Liste
- **Servicegebiet:** Offenburg, Lahr, Kehl, Achern, Oberkirch, Gengenbach, Haslach im Kinzigtal und weitere Orte (bis zu 20 Einträge möglich). Da Kunden nicht ins Büro kommen, kann die Adresse ausgeblendet werden. Die Adresse muss trotzdem hinterlegt sein.
- **Öffnungszeiten:** „Immer geöffnet“ (passt zu 24/7 erreichbar)
- **Telefon und Website:** wie oben. Website: `https://www.cleanstar-dienstleistungen.de/`
- **Leistungen:** Büroreinigung, Unterhaltsreinigung, Fensterreinigung, Treppenhausreinigung, Hallenreinigung, Hygienereinigung, jeweils mit einem Satz Beschreibung (Texte von den Leistungsseiten übernehmen)
- **Beschreibung (fertiger Text, 746 von 750 möglichen Zeichen):**

  > CleanStar Dienstleistungen ist eine Reinigungsfirma aus Offenburg, spezialisiert auf Büroreinigung für Unternehmen im Ortenaukreis. Wir reinigen Büros, Praxen, Kanzleien, Treppenhäuser und Gewerbeflächen mit festen Teams, die Ihr Objekt kennen. Sie haben einen festen Ansprechpartner mit direkter Nummer, rund um die Uhr erreichbar. Fällt eine Reinigungskraft aus, übernimmt eine eingewiesene Vertretung. Passt etwas nicht, reinigen wir kostenlos nach. Wir besichtigen Ihr Objekt kostenlos und schicken Ihnen innerhalb von 48 Stunden ein schriftliches Angebot mit Leistungsverzeichnis. Abgerechnet wird offen nach Mitarbeiterstunden. Im ersten Monat können Sie jederzeit kündigen. Gegründet 2024 von Nico Schütterle, Lino Resham und Eknoor Singh.

- **Fotos:** Logo, Titelbild, Fotos der drei Gründer, Team bei der Arbeit (mit Einverständnis), Fahrzeug mit Logo falls vorhanden. Echte Fotos, keine Stockbilder. Mindestens 10 Fotos, danach jeden Monat 2 bis 3 neue.
- **Beiträge:** alle zwei bis vier Wochen ein kurzer Beitrag, zum Beispiel ein neuer Ratgeber-Artikel mit Link, ein Tipp zur Grundreinigung im Sommer, ein Hinweis auf den Reinigungsplan.
- **Danach:** den Link zum Profil in `src/content/company.ts` bei `profiles.google` eintragen. Er erscheint dann automatisch in den strukturierten Daten („sameAs“).

### 4. Bewertungen sammeln (laufend)

Bewertungen sind für das lokale Ranking der wichtigste Faktor, den Sie selbst beeinflussen.

**Ablauf:**

1. Im Unternehmensprofil auf „Bewertungen anfordern“ klicken und den Kurzlink kopieren. Google bietet dort auch einen QR-Code an.
2. Zeitpunkt: nach dem ersten Monat bei einem neuen Kunden, nach einer schnell erledigten Reklamation, nach einer Grundreinigung, die gut ankam.
3. Persönlich fragen, nicht per Massenmail. Am besten der feste Ansprechpartner.
4. Jede Bewertung innerhalb von zwei Tagen beantworten, auch die kritischen, sachlich und freundlich.

**Fertige Nachricht (E-Mail oder WhatsApp):**

> Guten Tag Herr/Frau [Name], vielen Dank für die Zusammenarbeit im ersten Monat. Wenn Sie mit uns zufrieden sind, würden Sie uns mit einer kurzen Google-Bewertung sehr helfen. Es dauert eine Minute: [Link]. Und wenn etwas nicht passt, sagen Sie es mir bitte direkt. Viele Grüße, [Name], CleanStar

**QR-Code-Idee:** Den QR-Code aus dem Profil auf die Rückseite der Visitenkarte und auf eine kleine Karte drucken, die nach der ersten Grundreinigung oder beim Quartalsgespräch übergeben wird: „Zufrieden? Wir freuen uns über Ihre Bewertung.“

**Nicht erlaubt:** Bewertungen kaufen, Gegenleistungen anbieten, Bewertungen von Freunden oder Mitarbeitenden schreiben lassen. Das verstößt gegen die Google-Richtlinien und kann rechtliche Folgen haben.

---

## Priorität 2: in den nächsten vier Wochen

### 5. Einträge in Branchenverzeichnissen

Überall mit den exakt gleichen Firmendaten (siehe oben), gleicher Beschreibung und Link zur Website.

| Verzeichnis | Adresse | Hinweis |
| --- | --- | --- |
| Apple Business Connect | https://businessconnect.apple.com | Für Apple Karten und Siri |
| Bing Places | https://www.bingplaces.com | Kann aus dem Google-Profil importieren |
| Gelbe Seiten | https://www.gelbeseiten.de | Kostenloser Grundeintrag |
| Das Örtliche | https://www.dasoertliche.de | Grundeintrag über Gelbe Seiten bzw. Telefonbuchverlag |
| 11880 | https://www.11880.com | Kostenloser Grundeintrag |
| Handwerkskammer Freiburg | Betriebsbörse bzw. Handwerkersuche der Kammer | Eintrag als eingetragener Handwerksbetrieb |
| IHK Südlicher Oberrhein | Firmenverzeichnis, falls Mitgliedschaft besteht | |
| Gebäudereiniger-Innung | Mitgliederverzeichnis, falls Mitglied | Starkes Vertrauenssignal |
| Regionale Verzeichnisse | z. B. Branchenbuch der Stadt Offenburg, Gewerbeverzeichnisse der Gemeinden, Wirtschaftsförderung Ortenau | Auf den Websites der Gemeinden nach „Branchenverzeichnis“ suchen |

Kostenpflichtige Zusatzpakete der Verzeichnisse sind für das Ranking nicht nötig.

### 6. Website im Profil der Gründer verlinken

Auf LinkedIn und Xing bei allen drei Gründern CleanStar als Arbeitgeber eintragen und die Website verlinken.
Das stärkt die Verbindung zwischen Personen und Firma, die auch KI-Systeme auswerten.

---

## Priorität 3: laufend

### 7. Lokale Backlinks

Links von regionalen Websites sind für das lokale Ranking wertvoll. Ideen:

- **Vereine:** Sponsoring eines Sportvereins oder einer Jugendmannschaft in Offenburg. Vereine nennen Sponsoren meist mit Link auf ihrer Website.
- **Lokale Presse:** Offenburger Tageblatt, Baden Online, Stadtanzeiger. Anlass für eine Meldung: Gründung durch drei junge Unternehmer aus der Region, Partnerprogramm, eine besondere Aktion.
- **Partnerbetriebe:** Hausverwaltungen, Hausmeisterservices, Facility-Manager, Steuerberater oder IT-Dienstleister, mit denen Sie zusammenarbeiten. Gegenseitige Empfehlung auf der Website.
- **Kunden:** Zufriedene Kunden fragen, ob sie CleanStar als Dienstleister erwähnen (zum Beispiel auf einer Seite „Partner“ oder „Unser Team“).
- **Hochschule Offenburg:** Vorträge oder Praktikumsplätze, zum Beispiel im Bereich Wirtschaft (Nico studiert Wirtschaftsmathematik).
- **Gewerbevereine und Wirtschaftsförderung:** Mitgliedschaft im Gewerbeverein Offenburg oder der umliegenden Gemeinden, oft mit Eintrag und Link.
- **Ratgeber teilen:** Die Ratgeber-Artikel (z. B. Kosten, Leistungsverzeichnis, Hygiene) bei LinkedIn teilen. Gute Artikel werden von anderen verlinkt.

### 8. Inhalte pflegen

- Ratgeber-Artikel einmal im Jahr prüfen, besonders Mindestlohn und Sozialversicherung (neue Werte jeweils zum 1. Januar). Der Branchenmindestlohn für 2027 wird gerade verhandelt: sobald er feststeht, Artikel aktualisieren und das Datum `modified` in der Artikeldatei anpassen.
- Echte Kundenstimmen und Kundenlogos aufnehmen, sobald Freigaben vorliegen (siehe OFFENE-PUNKTE.md).
- Neue Fotos vom Team und von echten Objekten (mit Einverständnis) auf Website und Google-Profil.

### 9. Erfolg messen (monatlich, 15 Minuten)

- Search Console: Klicks, Impressionen, durchschnittliche Position für „Büroreinigung Offenburg“, „Reinigungsfirma Offenburg“ und die Städte.
- Google-Unternehmensprofil: Anrufe, Website-Klicks, Routenanfragen.
- Anfragen über die Website: Woher kamen sie? Einfach bei jedem Erstgespräch fragen „Wie sind Sie auf uns gekommen?“ und notieren.
