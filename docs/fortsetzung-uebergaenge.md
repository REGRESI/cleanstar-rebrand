# Fortsetzung nach Umgebungsabbruch

Der Quellcode wurde aus bereits hochgeladenen, per Git-SHA überprüften Blobs gesichert. Die jüngsten Änderungen am Maskentest und am Mappen-Test wurden aus den ausgeführten Patches wiederhergestellt. Der Live-Branch wurde nicht verändert.

Basis: 04418ea0a1fe03e4dec9abffe5fb1880deae986d.
Zuordnung und Entscheidungen: [uebergaenge-startseite.md](uebergaenge-startseite.md).

Die lokale Umgebung wurde während der letzten Tests nicht mehr erreichbar. Die zuletzt laufenden Prüfungen gelten als offen. Screenshots aus dem Arbeitsverzeichnis waren zu diesem Zeitpunkt noch nicht als Git-Blobs übertragen und gehören nicht zu diesem Checkpoint. Die Skripte zur erneuten Erzeugung sind enthalten.

Nächste Schritte:
1. npm ci; Playwright und Browser-Testabhängigkeiten bereitstellen.
2. npm run typecheck; npm run lint; npm run build.
3. Statischen Server auf dist starten; B auf dessen Adresse setzen.
4. ONLY=/ node scripts/test-transitions.mjs.
5. node scripts/check-home-boundaries.mjs; ONLY=/ node scripts/test-navigation.mjs; node scripts/test-images.mjs; node scripts/test-mappe.mjs; node scripts/test-deploy.mjs.
6. PASS=1 und PASS=2 node scripts/review-home-transitions.mjs; Bildfolgen prüfen und sichern.
7. Lighthouse Mobile am komprimierten Produktionsbuild messen; Ziel >90 und CLS 0. Bildrate separat messen.
8. Erst nach erfolgreicher Abnahme auf claude/optimistic-hypatia-a2lf28 übernehmen, Deployment und Live-Seite prüfen.

Die bestehende Pages-Konfiguration muss auf dem Branch gh-pages bleiben.
