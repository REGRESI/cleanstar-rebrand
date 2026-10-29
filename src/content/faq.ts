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
    a: 'Wir rechnen nach Stunden pro Mitarbeiter ab. Der Stundensatz liegt zwischen 35 und 45 € brutto (rund 29,41 bis 37,82 € netto). Wie viele Stunden Ihr Objekt braucht, hängt von Fläche, Nutzung und Ausstattung ab. Sanitärbereiche oder Duschen brauchen deutlich mehr Zeit als reine Büroflächen. Deshalb sehen wir uns Ihr Objekt kostenlos an und schicken Ihnen innerhalb von 48 Stunden ein verbindliches Angebot.',
  },
  {
    category: 'Kosten und Vertrag',
    q: 'Warum gibt es keinen Preis pro Quadratmeter?',
    a: 'Weil er selten stimmt. 200 m² Großraumbüro sind in einer Stunde gesaugt, 200 m² mit Teeküche, Duschen und vielen Glastüren nicht. Ein Quadratmeterpreis wäre entweder zu hoch für Sie oder später nicht zu halten. Wir kalkulieren lieber ehrlich nach tatsächlichem Aufwand.',
  },
  {
    category: 'Kosten und Vertrag',
    q: 'Ist die Objektbesichtigung wirklich kostenlos?',
    a: 'Ja. Die Besichtigung und das Angebot sind kostenlos und unverbindlich. Sie gehen damit keine Verpflichtung ein.',
  },
  {
    category: 'Kosten und Vertrag',
    featured: true,
    q: 'Wie lange bin ich gebunden?',
    a: 'Im ersten Monat gar nicht: Sie können jederzeit kündigen, ohne Frist. So testen Sie uns ohne Risiko. Danach gilt eine Kündigungsfrist von einem Monat zum Ende des Folgemonats. Wir möchten, dass Sie bleiben, weil die Arbeit stimmt, nicht weil ein Vertrag Sie bindet.',
  },
  {
    category: 'Kosten und Vertrag',
    q: 'Bekomme ich eine Rechnung mit Mehrwertsteuer?',
    a: 'Ja. Sie erhalten eine ordentliche Rechnung mit Netto, Mehrwertsteuer und Brutto, sodass Sie als Unternehmen die Vorsteuer abziehen können.',
  },
  {
    category: 'Ablauf',
    featured: true,
    q: 'Wie schnell können Sie starten?',
    a: 'Nach Ihrer Anfrage melden wir uns innerhalb von 24 Stunden und vereinbaren einen Besichtigungstermin. Das Angebot erhalten Sie innerhalb von 48 Stunden nach der Besichtigung. Der Start hängt dann von Ihrem Wunschtermin und der Teamplanung ab.',
  },
  {
    category: 'Ablauf',
    q: 'Kann ich Sie vorher testen?',
    a: 'Ja, und zwar ohne Risiko: Im ersten Monat können Sie jederzeit kündigen, ohne Frist. Eine einzelne Probereinigung vor dem Start ist auf Wunsch nach Absprache möglich.',
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
    a: 'Sie melden es der Person, die Sie bei uns betreut. Wir reinigen kostenlos nach und klären die Ursache mit dem Team, damit es nicht wieder vorkommt. Den genauen Ablauf finden Sie auf unserer Seite zur Qualitätsgarantie.',
  },
  {
    category: 'Qualität und Sicherheit',
    q: 'Wie gehen Sie mit unseren Schlüsseln um?',
    a: 'Die Schlüsselübergabe wird schriftlich dokumentiert. Zugang hat nur Ihr festes Team. Alarmanlagen und Schließzeiten halten wir schriftlich fest, damit jeder im Team weiß, was zu tun ist.',
  },
  {
    category: 'Qualität und Sicherheit',
    q: 'Sind Sie versichert?',
    a: 'Ja. Wir sind betriebshaftpflichtversichert. Geht trotz aller Sorgfalt einmal etwas zu Bruch, sind Sie abgesichert. Einen Nachweis senden wir Ihnen auf Anfrage gern zu.',
  },
  {
    category: 'Qualität und Sicherheit',
    q: 'Welche Reinigungsmittel verwenden Sie?',
    a: 'Mittel, die zur jeweiligen Oberfläche passen. Wenn Sie bestimmte Mittel wünschen oder ausschließen möchten, sagen Sie es uns bei der Besichtigung. Wir halten es im Leistungsverzeichnis fest.',
  },
  {
    category: 'Qualität und Sicherheit',
    q: 'Wie stellen Sie Diskretion sicher?',
    a: 'Unterlagen auf Schreibtischen bleiben, wo sie liegen. Bildschirme und Akten fassen wir nicht an. Was wir in Ihren Räumen sehen, bleibt dort.',
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
    a: 'Das legen wir im Angebot fest. Stellen Sie das Material selbst, füllen wir es bei jeder Reinigung auf.',
  },
  {
    category: 'Organisation',
    q: 'Kann ich Leistungen später ändern oder ergänzen?',
    a: 'Jederzeit. Sagen Sie Ihrem Ansprechpartner Bescheid, wir passen Plan und Angebot an und bestätigen die Änderung schriftlich.',
  },
]
