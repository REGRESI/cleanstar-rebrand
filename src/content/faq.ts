/**
 * FAQ – häufige Fragen.
 * `todo: true` markiert Antworten, die Fakten enthalten, die noch bestätigt werden müssen.
 * `featured: true` = erscheint auf der Startseite.
 */
export interface Faq {
  q: string
  a: string
  category: 'Kosten und Vertrag' | 'Ablauf' | 'Qualität und Sicherheit' | 'Organisation'
  featured?: boolean
  todo?: string
}

export const faqs: Faq[] = [
  {
    category: 'Kosten und Vertrag',
    featured: true,
    q: 'Was kostet eine Büroreinigung?',
    a: 'Wir rechnen nach Stunden pro Mitarbeiter ab. Der Stundensatz liegt zwischen 35 und 45 € brutto (rund 29,41 bis 37,82 € netto). Wie viele Stunden Ihr Objekt braucht, hängt von Fläche, Nutzung und Ausstattung ab. Sanitärbereiche oder Duschen brauchen deutlich mehr Zeit als reine Büroflächen. Deshalb sehen wir uns Ihr Objekt kostenlos an und schicken Ihnen innerhalb von 48 Stunden ein verbindliches Angebot.',
  },
  {
    category: 'Kosten und Vertrag',
    q: 'Warum gibt es keinen Preis pro Quadratmeter?',
    a: 'Weil er selten stimmt. 200 m² Großraumbüro sind in einer Stunde gesaugt, 200 m² mit Teeküche, Duschen und vielen Glastüren nicht. Ein Quadratmeterpreis wäre entweder zu hoch für Sie oder später nicht zu halten. Wir kalkulieren lieber ehrlich nach tatsächlichem Aufwand.',
  },
  {
    category: 'Kosten und Vertrag',
    q: 'Ist die Objektbesichtigung wirklich kostenlos?',
    a: 'Ja. Die Besichtigung und das Angebot sind kostenlos und unverbindlich. Sie gehen damit keine Verpflichtung ein.',
  },
  {
    category: 'Kosten und Vertrag',
    featured: true,
    q: 'Wie lange läuft der Vertrag und wie kann ich kündigen?',
    a: 'Laufzeit und Kündigungsfrist legen wir im Angebot transparent fest. Unser Ziel ist, dass Sie bleiben, weil die Arbeit stimmt, nicht weil ein Vertrag Sie bindet.',
    todo: 'Standard-Laufzeit und Kündigungsfrist eintragen (z. B. „monatlich kündbar“ oder „3 Monate zum Monatsende“).',
  },
  {
    category: 'Kosten und Vertrag',
    q: 'Bekomme ich eine Rechnung mit ausgewiesener Mehrwertsteuer?',
    a: 'Ja. Sie erhalten eine ordentliche Rechnung mit Netto, Mehrwertsteuer und Brutto, sodass Sie als Unternehmen die Vorsteuer abziehen können.',
  },
  {
    category: 'Ablauf',
    featured: true,
    q: 'Wie schnell können Sie starten?',
    a: 'Nach Ihrer Anfrage melden wir uns innerhalb von 24 Stunden und vereinbaren einen Besichtigungstermin. Das Angebot erhalten Sie innerhalb von 48 Stunden nach der Besichtigung. Der Start hängt dann von Ihrem Wunschtermin und der Teamplanung ab.',
  },
  {
    category: 'Ablauf',
    q: 'Gibt es eine Probereinigung?',
    a: 'Ja. Vor dem regulären Start können wir eine Probereinigung vereinbaren. So sehen Sie, wie wir arbeiten, und wir lernen Ihr Objekt kennen.',
  },
  {
    category: 'Ablauf',
    q: 'Zu welchen Zeiten reinigen Sie?',
    a: 'Dann, wenn es Ihren Betrieb am wenigsten stört: früh morgens vor Arbeitsbeginn, abends nach Feierabend oder am Wochenende. Die Zeiten legen wir gemeinsam fest.',
  },
  {
    category: 'Ablauf',
    q: 'Welche Orte betreuen Sie?',
    a: 'Unser Sitz ist in Offenburg. Wir sind im gesamten Ortenaukreis tätig, unter anderem in Lahr, Kehl, Achern, Oberkirch, Gengenbach, Haslach, Appenweier, Willstätt, Ortenberg, Durbach, Hohberg, Schutterwald, Neuried und Friesenheim.',
  },
  {
    category: 'Qualität und Sicherheit',
    featured: true,
    q: 'Was passiert, wenn etwas nicht sauber ist?',
    a: 'Sie melden es Ihrem festen Ansprechpartner. Wir reinigen kostenlos nach und klären die Ursache mit dem Team, damit es nicht wieder vorkommt. Den genauen Ablauf finden Sie auf unserer Seite zur Qualitätsgarantie.',
  },
  {
    category: 'Qualität und Sicherheit',
    q: 'Wie gehen Sie mit unseren Schlüsseln um?',
    a: 'Die Schlüsselübergabe wird schriftlich dokumentiert. Nur das feste Team und die Objektleitung haben Zugriff. Schlüssel werden nicht beschriftet aufbewahrt, sodass sie keinem Objekt zugeordnet werden können.',
    todo: 'Schlüsselprozess (Protokoll, unbeschriftete Aufbewahrung) bestätigen.',
  },
  {
    category: 'Qualität und Sicherheit',
    q: 'Sind Sie versichert?',
    a: 'Für Schäden, die bei unserer Arbeit entstehen, besteht eine Betriebshaftpflichtversicherung. Einen Nachweis senden wir Ihnen auf Anfrage gern zu.',
    todo: 'Betriebshaftpflicht bestätigen. Ohne Bestätigung diese Antwort nicht veröffentlichen.',
  },
  {
    category: 'Qualität und Sicherheit',
    q: 'Welche Reinigungsmittel verwenden Sie?',
    a: 'Wir setzen Mittel gezielt und sparsam ein, passend zur Oberfläche. Wo möglich, verwenden wir umweltschonende Produkte und dosieren genau. Wenn Sie bestimmte Mittel wünschen oder ausschließen möchten, berücksichtigen wir das.',
    todo: 'Eingesetzte Produkte bzw. Zertifikate (z. B. EU Ecolabel) nur nennen, wenn bestätigt.',
  },
  {
    category: 'Qualität und Sicherheit',
    q: 'Wie stellen Sie Diskretion sicher?',
    a: 'Unterlagen auf Schreibtischen bleiben unberührt, Bildschirme und Akten fassen wir nicht an. Unser Team ist zur Verschwiegenheit verpflichtet. Auf Wunsch unterzeichnen wir zusätzlich Ihre eigene Vertraulichkeitsvereinbarung.',
    todo: 'Bestätigen, dass Mitarbeitende eine Verschwiegenheitserklärung unterschreiben.',
  },
  {
    category: 'Organisation',
    featured: true,
    q: 'Was passiert, wenn eine Reinigungskraft krank ist?',
    a: 'Dann übernimmt eine eingewiesene Ersatzkraft. Sie müssen sich nicht darum kümmern, Ihre Reinigung findet wie geplant statt.',
  },
  {
    category: 'Organisation',
    q: 'Habe ich wirklich immer denselben Ansprechpartner?',
    a: 'Ja. Sie bekommen einen festen Ansprechpartner mit direkter Telefonnummer. Keine Hotline, kein Ticketsystem.',
  },
  {
    category: 'Organisation',
    q: 'Wer stellt Verbrauchsmaterial wie Seife und Papierhandtücher?',
    a: 'Das legen wir im Angebot fest. Sie können das Material selbst stellen, dann füllen wir nur auf, oder es über uns beziehen.',
    todo: 'Bestätigen, ob CleanStar Verbrauchsmaterial liefert.',
  },
  {
    category: 'Organisation',
    q: 'Kann ich Leistungen später ändern oder ergänzen?',
    a: 'Jederzeit. Sagen Sie Ihrem Ansprechpartner Bescheid, wir passen Plan und Angebot an und bestätigen die Änderung schriftlich.',
  },
]
