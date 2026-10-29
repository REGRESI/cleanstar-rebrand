# Umzug auf Cloudflare Pages

Warum: GitHub Pages kann keine Sicherheits-Header setzen (HSTS, Content-Security-Policy usw.) und ist laut Nutzungsbedingungen nicht für kommerzielle Websites gedacht. Cloudflare Pages liest die Dateien `_headers` und `_redirects`, die der Build bereits erzeugt.

Bis zum Umzug läuft GitHub Pages unverändert weiter. Nichts davon muss an einem Stück passieren: Schritte 1 bis 3 lassen sich testen, ohne die Domain anzufassen.

## Was im Projekt schon vorbereitet ist

| Datei | Zweck |
| --- | --- |
| `dist/_headers` | HSTS (1 Jahr, inklusive Subdomains), Content-Security-Policy, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy, Caching |
| `dist/_redirects` | echte 301-Weiterleitungen der 22 zusammengeführten Ortsseiten auf `/einzugsgebiet/` |
| `.node-version` | Node 22 für den Build |
| `scripts/postbuild.mjs` | erzeugt beides bei jedem `npm run build`; auf Cloudflare (Umgebungsvariable `CF_PAGES`) entfallen die Ersatzseiten für Weiterleitungen |

Die Content-Security-Policy erlaubt nur die eigene Domain, Web3Forms bzw. Formspree für Formulare und Cal.com für die Terminbuchung. Inline-Skripte sind einzeln per Prüfsumme freigegeben. Kommt ein neuer Dienst dazu (z. B. ein anderer Formular-Anbieter), muss er in `scripts/postbuild.mjs` ergänzt werden.

## 1. Konto anlegen

1. Auf https://dash.cloudflare.com/sign-up ein Konto mit `info@cleanstar-dienstleistungen.de` anlegen und die E-Mail bestätigen.
2. Der kostenlose Tarif reicht.

## 2. Repository verbinden

1. Im Dashboard links **Workers & Pages** öffnen, dann **Erstellen** → Reiter **Pages** → **Mit Git verbinden**.
2. GitHub-Konto verbinden und das Repository `REGRESI/cleanstar-rebrand` auswählen (Zugriff nur auf dieses Repository genügt).
3. Projektname: `cleanstar` (daraus wird die Testadresse `cleanstar.pages.dev`).

## 3. Build-Einstellungen

| Feld | Wert |
| --- | --- |
| Produktionszweig | `claude/optimistic-hypatia-a2lf28` (oder später `main`, falls Sie zusammenführen) |
| Framework-Voreinstellung | Keine |
| Build-Befehl | `npm run build` |
| Ausgabeverzeichnis | `dist` |
| Umgebungsvariablen | keine nötig (Node 22 kommt aus `.node-version`; zur Sicherheit kann `NODE_VERSION` = `22` gesetzt werden) |

**Speichern und bereitstellen.** Der erste Build dauert einige Minuten. Danach unter `https://cleanstar.pages.dev` prüfen:

- Startseite, Leistungsmappe, Karte im Einzugsgebiet, ein Formular (Absenden testen), Terminbuchung.
- Eine alte Ortsadresse, z. B. `https://cleanstar.pages.dev/einzugsgebiet/ortenberg/`, muss auf `/einzugsgebiet/` weiterleiten.
- Sicherheits-Header: die Testadresse auf https://securityheaders.com eingeben, erwartet wird Note A oder besser.

## 4. Domain www.cleanstar-dienstleistungen.de umziehen

1. Im Pages-Projekt **Benutzerdefinierte Domains** → **Benutzerdefinierte Domain einrichten** → `www.cleanstar-dienstleistungen.de` eingeben.
2. Cloudflare zeigt an, welcher DNS-Eintrag nötig ist. Bei IONOS (DNS bleibt bei IONOS) ist das:

| Typ | Name | Wert | Hinweis |
| --- | --- | --- | --- |
| CNAME | `www` | `cleanstar.pages.dev` | ersetzt den bisherigen Eintrag, der auf GitHub (`…github.io`) zeigt |

3. Bei IONOS: **Domains & SSL** → Domain auswählen → **DNS** → den bestehenden CNAME-Eintrag für `www` bearbeiten und den Wert auf `cleanstar.pages.dev` ändern. Falls Cloudflare zusätzlich einen TXT-Eintrag zur Bestätigung verlangt, diesen genau so anlegen.
4. Die Domain ohne www (`cleanstar-dienstleistungen.de`): bei IONOS als **Weiterleitung** auf `https://www.cleanstar-dienstleistungen.de` einstellen (HTTP-Weiterleitung 301). So bleibt das DNS bei IONOS, und Cloudflare muss nur `www` bedienen.
5. Warten, bis Cloudflare die Domain als **Aktiv** anzeigt (meist wenige Minuten, höchstens 24 Stunden). Das Zertifikat stellt Cloudflare selbst aus.

**Nicht anfassen:** alle MX-Einträge, SPF/DKIM/DMARC (TXT-Einträge mit `v=spf1`, `v=DKIM1`, `v=DMARC1`), `autodiscover`, `mail`, `smtp`, `imap` und andere E-Mail-Einträge. Die E-Mail läuft weiter über IONOS.

**Zu HSTS:** Die Website sendet `Strict-Transport-Security` mit `includeSubDomains`. Damit verlangen Browser für ein Jahr HTTPS auf allen Subdomains von `cleanstar-dienstleistungen.de`. Falls Sie eine Subdomain ohne HTTPS nutzen (z. B. eine alte Webmail-Adresse), vorher Bescheid geben, dann wird `includeSubDomains` entfernt.

## 5. Nach dem Umzug: GitHub Pages abschalten

Erst wenn `https://www.cleanstar-dienstleistungen.de` über Cloudflare ausgeliefert wird (Prüfung: securityheaders.com zeigt die neuen Header):

1. In GitHub: Repository → **Settings** → **Pages** → bei **Source** „None“ wählen bzw. **Unpublish site**.
2. Den Workflow `.github/workflows/pages.yml` deaktivieren: Repository → **Actions** → „Website auf GitHub Pages“ → **…** → **Disable workflow**. (Oder die Datei löschen lassen.)
3. Den Zweig `gh-pages` können Sie anschließend löschen.

## Rückweg

Falls etwas nicht passt: den CNAME `www` bei IONOS wieder auf den alten GitHub-Wert setzen und GitHub Pages erneut aktivieren. Innerhalb weniger Minuten bis Stunden liefert wieder GitHub aus.
