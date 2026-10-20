import type { ReactNode } from 'react'
import { Seo } from '@/components/ui/Seo'
import { PageHero } from '@/components/ui/PageHero'
import { Fact, Todo } from '@/components/ui/Todo'
import { company, fullAddress } from '@/content/company'

const trail = [
  { name: 'Start', path: '/' },
  { name: 'Datenschutz', path: '/datenschutz' },
]

/** Markiert Stellen, die rechtlich geprüft werden sollten */
const Check = ({ children }: { children: ReactNode }) => <Todo title="Rechtlich prüfen lassen">Rechtlich prüfen: {children}</Todo>

export default function Privacy() {
  const provider = company.forms.provider === 'web3forms' ? 'Web3Forms' : 'Formspree (Formspree, Inc., USA)'
  return (
    <>
      <Seo title="Datenschutzerklärung" description={`Datenschutzerklärung der ${company.legalName}.`} path="/datenschutz" />
      <PageHero
        trail={trail}
        title="Datenschutzerklärung"
        lead="Wir verarbeiten so wenige Daten wie möglich. Diese Website setzt keine Tracking- oder Marketing-Cookies, bindet keine Google Fonts ein und lädt externe Dienste erst nach Ihrer Zustimmung."
      />
      <section className="py-16 sm:py-24">
        <div className="container-site">
          <div className="prose-cs">
            {company.showTodoMarkers && (
              <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900 ring-1 ring-amber-200">
                Hinweis für den Betreiber: Diese Datenschutzerklärung ist ein sorgfältig erstellter Entwurf, ersetzt aber keine Rechtsberatung. Gelb markierte Stellen bitte vor dem
                Livegang prüfen lassen.
              </p>
            )}

            <h2>1. Verantwortlicher</h2>
            <p>
              {company.legalName}
              <br />
              {fullAddress()}
              <br />
              Vertreten durch: <Fact value={company.partners?.join(', ')} fallback="[Gesellschafter]" todo="Gesellschafter eintragen" />
              <br />
              Telefon: {company.phone.display}
              <br />
              E-Mail: <a href={`mailto:${company.email}`}>{company.email}</a>
            </p>
            <p>
              Ein Datenschutzbeauftragter ist nach unserer Einschätzung nicht zu benennen. <Check>Pflicht zur Benennung (Art. 37 DSGVO, § 38 BDSG)</Check>
            </p>

            <h2>2. Hosting und Server-Logfiles</h2>
            <p>
              Diese Website wird bei <Fact value={null} fallback="[Hosting-Anbieter, Anschrift]" todo="Hosting-Anbieter eintragen" /> gehostet. Beim Aufruf der Website verarbeitet
              der Hoster automatisch Daten, die Ihr Browser übermittelt (IP-Adresse, Datum und Uhrzeit, aufgerufene Seite, Referrer, Browser und Betriebssystem). Das ist technisch
              notwendig, um die Website auszuliefern und ihre Sicherheit zu gewährleisten. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Logfiles werden nach{' '}
              <Fact value={null} fallback="[Zeitraum]" todo="Speicherdauer laut Hoster" /> gelöscht. Mit dem Hoster besteht ein Vertrag zur Auftragsverarbeitung nach Art. 28 DSGVO.{' '}
              <Check>AV-Vertrag mit Hoster abschließen</Check>
            </p>

            <h2>3. Cookies und lokale Speicherung</h2>
            <p>
              Wir setzen keine Cookies zu Analyse- oder Marketingzwecken. Damit Ihre Eingaben im Angebots-Konfigurator nicht verloren gehen, speichern wir sie vorübergehend im
              Sitzungsspeicher Ihres Browsers (sessionStorage). Diese Daten verlassen Ihr Gerät nicht und werden beim Schließen des Browserfensters gelöscht. Diese Speicherung ist
              für den von Ihnen gewünschten Dienst unbedingt erforderlich (§ 25 Abs. 2 Nr. 2 TDDDG). Ein Cookie-Banner ist deshalb nicht notwendig.{' '}
              <Check>Einschätzung bestätigen</Check>
            </p>

            <h2>4. Schriftarten</h2>
            <p>Die verwendeten Schriftarten sind lokal auf unserem Server gespeichert. Es besteht keine Verbindung zu Google oder anderen Schriftanbietern.</p>

            <h2>5. Kontaktformular, Angebots-Konfigurator und Bewerbungsformular</h2>
            <p>
              Wenn Sie uns über ein Formular kontaktieren, verarbeiten wir Ihre Angaben (z. B. Name, Unternehmen, E-Mail, Telefon, Angaben zum Objekt, Nachricht) zur Bearbeitung
              Ihrer Anfrage und für Anschlussfragen. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (vorvertragliche Maßnahmen) sowie Ihre Einwilligung nach Art. 6 Abs. 1 lit. a
              DSGVO, die Sie jederzeit widerrufen können.
            </p>
            <p>
              Für den Versand der Formulare nutzen wir den Dienst {provider}. Ihre Eingaben werden dabei an den Dienst übertragen und von dort per E-Mail an uns weitergeleitet.
              Dabei kann eine Übermittlung in die USA stattfinden.{' '}
              <Check>Anbieter, Sitz, AV-Vertrag und Drittlandübermittlung (Angemessenheitsbeschluss / Standardvertragsklauseln) für den gewählten Formular-Dienst ergänzen</Check>
            </p>
            <p>Anfragen löschen wir, sobald sie erledigt sind und keine gesetzlichen Aufbewahrungspflichten (z. B. aus Handels- und Steuerrecht) entgegenstehen.</p>
            <p>
              Bewerbungsdaten verarbeiten wir zur Durchführung des Bewerbungsverfahrens (Art. 6 Abs. 1 lit. b DSGVO). Kommt kein Arbeitsverhältnis zustande, löschen wir die Daten
              spätestens sechs Monate nach Abschluss des Verfahrens. <Check>Frist bestätigen</Check>
            </p>

            <h2>6. Partnerprogramm: Partneranfragen und Infomappe</h2>
            <p>
              Wenn Sie sich für unser Partnerprogramm interessieren, verarbeiten wir die Angaben aus der Partneranfrage (z. B. Name, Kontaktdaten, gewünschte Region, Angaben zu
              Ihrer Firma oder Ihrer beruflichen Situation, gewünschter Starttermin und eine freiwillige Einschätzung zum Investitionsrahmen) sowie bei Anforderung der Infomappe
              Name, E-Mail und Region. Zweck ist die Prüfung einer möglichen Zusammenarbeit und die Kontaktaufnahme. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (vorvertragliche
              Maßnahmen) sowie Ihre Einwilligung nach Art. 6 Abs. 1 lit. a DSGVO. Der Versand erfolgt über den in Abschnitt 5 genannten Formular-Dienst. Kommt keine Zusammenarbeit
              zustande, löschen wir die Daten spätestens zwölf Monate nach dem letzten Kontakt, sofern Sie nicht in eine längere Speicherung eingewilligt haben.{' '}
              <Check>Zweck, Rechtsgrundlage und Speicherdauer für Partneranfragen</Check>
            </p>

            <h2>7. Terminbuchung über Cal.com</h2>
            <p>
              Für die Buchung einer Objektbesichtigung können Sie einen Kalender des Anbieters Cal.com, Inc. (USA) nutzen. Der Kalender wird erst geladen, wenn Sie auf „Kalender
              laden“ klicken. Erst dann werden Daten (z. B. IP-Adresse, Browserdaten und Ihre Eingaben bei der Buchung) an Cal.com übertragen. Rechtsgrundlage ist Ihre Einwilligung
              (Art. 6 Abs. 1 lit. a DSGVO, § 25 Abs. 1 TDDDG). <Check>Datenschutzinformationen und Drittlandübermittlung zu Cal.com ergänzen</Check>
            </p>

            <h2>8. Kontakt per E-Mail, Telefon oder WhatsApp</h2>
            <p>
              Wenn Sie uns per E-Mail oder Telefon kontaktieren, verarbeiten wir Ihre Angaben zur Bearbeitung Ihres Anliegens (Art. 6 Abs. 1 lit. b bzw. f DSGVO).
              {company.whatsapp.enabled && (
                <>
                  {' '}
                  Nutzen Sie WhatsApp, gelten zusätzlich die Datenschutzbestimmungen von WhatsApp Ireland Ltd. <Check>WhatsApp-Hinweis</Check>
                </>
              )}
            </p>

            <h2>9. Karte</h2>
            <p>Die Karte unseres Einzugsgebiets ist eine eigene Grafik. Es werden keine externen Kartendienste geladen.</p>

            <h2>10. Ihre Rechte</h2>
            <p>
              Sie haben das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung der Verarbeitung (Art. 18), Datenübertragbarkeit (Art. 20)
              und Widerspruch (Art. 21 DSGVO). Eine erteilte Einwilligung können Sie jederzeit mit Wirkung für die Zukunft widerrufen. Wenden Sie sich dazu einfach an{' '}
              {company.email}.
            </p>
            <p>
              Sie können sich außerdem bei einer Datenschutz-Aufsichtsbehörde beschweren, zum Beispiel beim Landesbeauftragten für den Datenschutz und die Informationsfreiheit
              Baden-Württemberg.
            </p>

            <h2>11. SSL-/TLS-Verschlüsselung</h2>
            <p>Diese Website nutzt aus Sicherheitsgründen eine TLS-Verschlüsselung. Sie erkennen sie an „https://“ in der Adresszeile.</p>

            <p className="text-sm text-muted">
              Stand: <Fact value={null} fallback="[Monat Jahr]" todo="Datum beim Livegang eintragen" />
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
