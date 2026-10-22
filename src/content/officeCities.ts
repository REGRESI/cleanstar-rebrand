/**
 * KOMBISEITEN „Büroreinigung [Ort]“ unter /bueroreinigung/<slug>.
 * Nur für die fünf größten Orte und nur für Büroreinigung (keine weiteren Kombinationen).
 * Jede Seite hat eigenen Text. Allgemeine Aussagen über den Ort müssen wahr sein,
 * keine erfundenen Firmennamen, Gewerbegebiete oder Zahlen.
 * Die Beispielrechnungen nutzen die Stundensätze aus pricing.ts.
 */
export interface OfficeCity {
  slug: string
  name: string
  /** Title-Tag ohne Zusatz (max. 39 Zeichen, Keyword vorn) */
  seoTitle: string
  seoDescription: string
  /** Direkte Antwort ganz oben, ohne Kontext verständlich */
  answer: string
  intro: string
  sections: { title: string; paragraphs: string[]; list?: string[] }[]
  /** Beispielrechnung: Kräfte, Stunden pro Einsatz, Einsätze pro Woche */
  example: { label: string; staff: number; hours: number; visits: number; note: string }
  faqs: { q: string; a: string }[]
}

export const officeCities: OfficeCity[] = [
  {
    slug: 'offenburg',
    name: 'Offenburg',
    seoTitle: 'Büroreinigung Offenburg: Festes Team',
    seoDescription: 'Büroreinigung in Offenburg vom Betrieb mit Sitz in der Stadt: festes Team, fester Ansprechpartner, Ersatz bei Ausfall. 35 bis 45 € brutto pro Stunde.',
    answer:
      'CleanStar ist eine Reinigungsfirma mit Sitz in Offenburg, die sich auf Büroreinigung für Unternehmen spezialisiert hat. Wir reinigen Büros, Praxen und Verwaltungen in der ganzen Stadt mit festem Team, festem Ansprechpartner und Ersatzkraft bei Ausfall, zu 35 bis 45 € brutto pro Mitarbeiterstunde.',
    intro:
      'Offenburg ist nicht nur ein Ort in unserem Einzugsgebiet, sondern unser Sitz. Das merken Sie im Alltag: Wenn morgens etwas nicht passt, ist Ihr Ansprechpartner schnell vor Ort, und eine Zusatzreinigung vor einem wichtigen Termin lässt sich meist kurzfristig einschieben.',
    sections: [
      {
        title: 'Für welche Büros in Offenburg wir arbeiten',
        paragraphs: [
          'Als Kreisstadt hat Offenburg eine besondere Mischung: Verwaltungen und Behörden, Kanzleien und Steuerbüros in der Innenstadt, Agenturen und Medienunternehmen, Praxen, Banken und Versicherungen. Dazu kommen Gewerbegebiete, in denen das Büro direkt neben Werkstatt, Lager oder Produktion liegt.',
          'Für uns zählt nicht die Größe, sondern dass die Reinigung zu Ihrer Nutzung passt. Ein Steuerbüro mit sechs Arbeitsplätzen braucht etwas anderes als eine Verwaltung über drei Etagen mit Kantine. Deshalb sehen wir uns jedes Objekt vorher an.',
        ],
      },
      {
        title: 'Was bei der Büroreinigung in Offenburg dazugehört',
        paragraphs: ['Den genauen Umfang halten wir in einem Leistungsverzeichnis fest. Typisch für Büros in Offenburg sind:'],
        list: [
          'Arbeitsplätze: freie Tischflächen, Telefone und Tastaturen nach Absprache, Papierkörbe',
          'Böden: saugen und feucht wischen, je nach Belag',
          'Küche und Teeküche: Arbeitsflächen, Spüle, Außenseiten der Geräte',
          'Sanitärräume: Toiletten, Waschbecken, Spiegel, Nachfüllen von Verbrauchsmaterial nach Absprache',
          'Empfang und Besprechungsräume: besonders gründlich, weil hier Ihre Kunden sitzen',
        ],
      },
      {
        title: 'Zeiten, die zu Ihrem Betrieb passen',
        paragraphs: [
          'Die meisten Büros in Offenburg lassen wir vor Arbeitsbeginn oder nach Feierabend reinigen, damit niemand gestört wird. Kanzleien und Praxen mit Publikumsverkehr bevorzugen oft den frühen Morgen, damit alles frisch ist, wenn die ersten Mandanten oder Patienten kommen.',
          'Die vereinbarten Zeiten stehen im Angebot. Wenn sich bei Ihnen etwas ändert, etwa durch neue Bürozeiten oder einen Umzug innerhalb der Stadt, passen wir den Plan an.',
        ],
      },
      {
        title: 'Warum der Sitz in Offenburg für Sie zählt',
        paragraphs: [
          'Fällt eine Reinigungskraft aus, übernimmt eine Ersatzkraft, die Ihr Objekt kennt. Weil unser Sitz in der Stadt ist, sind Vertretungen hier besonders einfach zu organisieren. Und wenn doch einmal etwas nicht passt, reinigen wir kostenlos nach, ohne lange Anfahrt.',
        ],
      },
    ],
    example: {
      label: 'Steuerbüro in der Innenstadt, rund 10 Arbeitsplätze',
      staff: 1,
      hours: 2,
      visits: 3,
      note: 'eine Reinigungskraft, dreimal pro Woche je zwei Stunden',
    },
    faqs: [
      {
        q: 'Wie schnell kann die Büroreinigung in Offenburg starten?',
        a: 'Die Büroreinigung in Offenburg kann meist kurz nach der Besichtigung starten. Das Angebot bekommen Sie innerhalb von 48 Stunden, den Starttermin legen wir gemeinsam fest.',
      },
      {
        q: 'Reinigen Sie in Offenburg auch Praxen und Kanzleien?',
        a: 'Ja, in Offenburg reinigen wir neben Büros auch Praxen, Kanzleien und Steuerbüros. Für Praxen stimmen wir die Hygieneanforderungen im Leistungsverzeichnis ab.',
      },
      {
        q: 'Gibt es in Offenburg eine Mindestgröße für Büros?',
        a: 'Nein, eine feste Mindestgröße gibt es nicht. Auch kleine Büros in Offenburg reinigen wir, zum Beispiel einmal pro Woche. Abgerechnet wird nach tatsächlicher Arbeitszeit.',
      },
      {
        q: 'Kann ich in Offenburg vorher sehen, wie Sie arbeiten?',
        a: 'Ja, im ersten Monat können Sie jederzeit kündigen, ohne Kündigungsfrist. So sehen Sie im Alltag, wie wir in Ihrem Büro in Offenburg arbeiten, ohne langfristige Bindung.',
      },
    ],
  },
  {
    slug: 'lahr',
    name: 'Lahr',
    seoTitle: 'Büroreinigung Lahr: Büro & Halle',
    seoDescription:
      'Büroreinigung in Lahr für Verwaltungen, Praxen und Betriebe mit Büro und Halle. Festes Team, Ersatzkraft bei Ausfall, Qualitätsgarantie. Angebot in 48 Stunden.',
    answer:
      'CleanStar reinigt Büros in Lahr, von der Praxis in der Innenstadt bis zur Verwaltung im Gewerbebetrieb. Wir kommen aus Offenburg, rund 25 Minuten entfernt, arbeiten mit festem Team und Ersatzkraft bei Ausfall und berechnen 35 bis 45 € brutto pro Mitarbeiterstunde.',
    intro:
      'Lahr ist die zweitgrößte Stadt der Ortenau und wirtschaftlich breit aufgestellt. Viele Unternehmen hier haben nicht nur ein Büro, sondern auch Lager, Werkstatt oder Produktion. Genau dafür ist es praktisch, wenn ein Dienstleister alles aus einer Hand reinigt.',
    sections: [
      {
        title: 'Büro und Halle aus einer Hand',
        paragraphs: [
          'In Lahr reinigen wir häufig Objekte, in denen Verwaltung und Betrieb unter einem Dach liegen. Das Büro wird meist mehrmals pro Woche gereinigt, Sozialräume und Sanitärbereiche ebenso, die Halle dagegen in einem eigenen Rhythmus, oft monatlich.',
          'Für Sie heißt das: ein Angebot, ein Leistungsverzeichnis mit getrennten Intervallen, eine Rechnung und ein Ansprechpartner, der alle Bereiche kennt.',
        ],
      },
      {
        title: 'Typische Objekte in Lahr',
        paragraphs: ['Lahr hat Industrie, Handel und Dienstleistung. Bei uns sind das vor allem:'],
        list: [
          'Verwaltungen von Produktions- und Handelsbetrieben',
          'Büros auf den Gewerbe- und Logistikflächen am früheren Flugplatz',
          'Praxen, Kanzleien und Büros in der Innenstadt',
          'Sozialräume und Umkleiden für Teams im Schichtbetrieb',
        ],
      },
      {
        title: 'Verlässlich trotz 25 Minuten Anfahrt',
        paragraphs: [
          'Die Anfahrt über die B3 oder die A5 ist planbar. Wichtiger als die Minuten ist, was passiert, wenn jemand krank wird: Für jedes Objekt in Lahr ist eine Ersatzkraft eingewiesen. Ihre Reinigung findet zur gewohnten Zeit statt, ohne dass Sie etwas organisieren müssen.',
          'Unser Ansprechpartner kommt regelmäßig selbst zur Qualitätskontrolle vorbei. Fällt dabei etwas auf, klären wir es mit dem Team, bevor Sie es bemerken.',
        ],
      },
      {
        title: 'Reinigungszeiten im Schichtbetrieb',
        paragraphs: [
          'Betriebe mit Schichtarbeit können nicht einfach abends abschließen. Wir richten die Zeiten nach Ihrem Ablauf, zum Beispiel zwischen zwei Schichten, früh am Morgen oder am Wochenende. Die Zeiten stehen schriftlich im Angebot.',
        ],
      },
    ],
    example: {
      label: 'Verwaltung mit Sozialräumen in einem Gewerbebetrieb',
      staff: 1,
      hours: 3,
      visits: 3,
      note: 'eine Reinigungskraft, dreimal pro Woche je drei Stunden, Hallenreinigung zusätzlich nach Bedarf',
    },
    faqs: [
      {
        q: 'Was kostet die Büroreinigung in Lahr?',
        a: 'Die Büroreinigung in Lahr kostet wie überall im Ortenaukreis 35 bis 45 € brutto pro Mitarbeiterstunde. Den Stundenbedarf ermitteln wir bei der kostenlosen Besichtigung.',
      },
      {
        q: 'Können Sie in Lahr Büro und Halle gemeinsam übernehmen?',
        a: 'Ja, in Lahr übernehmen wir Büro und Halle gemeinsam, mit getrennten Intervallen im Leistungsverzeichnis, einem Ansprechpartner und einer Rechnung.',
      },
      {
        q: 'Reinigen Sie in Lahr auch zwischen zwei Schichten?',
        a: 'Ja, für Betriebe in Lahr mit Schichtarbeit reinigen wir zwischen den Schichten, früh morgens oder am Wochenende. Die genauen Zeiten legen wir bei der Besichtigung fest.',
      },
      {
        q: 'Wie oft kontrollieren Sie die Qualität in Lahr?',
        a: 'Unser Ansprechpartner kontrolliert die Reinigung in Lahr regelmäßig selbst nach Checkliste. Den Rhythmus legen wir im Angebot fest.',
      },
    ],
  },
  {
    slug: 'kehl',
    name: 'Kehl',
    seoTitle: 'Büroreinigung Kehl: Feste Zeiten',
    seoDescription: 'Büroreinigung in Kehl am Rhein: Empfang, Besprechungsräume und Büros jeden Morgen bereit. Festes Team, fester Ansprechpartner, Ersatz bei Ausfall.',
    answer:
      'CleanStar übernimmt die Büroreinigung in Kehl für Unternehmen in der Innenstadt, am Hafen und in den Ortsteilen. Wir kommen aus Offenburg, gut 20 Minuten entfernt, reinigen in festen Zeitfenstern mit festem Team und berechnen 35 bis 45 € brutto pro Mitarbeiterstunde.',
    intro:
      'Kehl liegt direkt gegenüber von Straßburg, viele Betriebe hier arbeiten über die Grenze hinweg. Wer Kunden und Partner aus beiden Ländern empfängt, will, dass Empfang und Besprechungsräume jeden Morgen einwandfrei sind. Dafür sorgen wir.',
    sections: [
      {
        title: 'Der erste Eindruck zählt doppelt',
        paragraphs: [
          'Ein Besprechungsraum mit Kaffeerändern oder ein Empfang mit vollem Papierkorb fällt auf, besonders bei Besuchern, die zum ersten Mal kommen. Deshalb reinigen wir die Bereiche mit Kundenkontakt in Kehl besonders gründlich und, wenn gewünscht, häufiger als die übrigen Büros.',
          'Was genau dazugehört, halten wir im Leistungsverzeichnis fest: vom Glastisch im Besprechungsraum bis zur Eingangstür.',
        ],
      },
      {
        title: 'Objekte, die wir in Kehl reinigen',
        paragraphs: ['Kehl hat Hafen, Logistik und Industrie, eine Hochschule, Verwaltungen und viele Dienstleister. Für uns heißt das vor allem:'],
        list: [
          'Büros und Verwaltungen von Logistik- und Industriebetrieben',
          'Kanzleien, Beratungen und Agenturen in der Innenstadt',
          'Praxen mit Patienten aus Deutschland und Frankreich',
          'Treppenhäuser in Geschäftshäusern mit mehreren Mietparteien',
        ],
      },
      {
        title: 'Feste Zeitfenster',
        paragraphs: [
          'Wir reinigen in Kehl in festen Zeitfenstern, die zu Ihren Öffnungszeiten passen. Das Team kennt Ihr Objekt, Ihre Schlüsselregelung und Ihre Wünsche. Fällt jemand aus, übernimmt eine eingewiesene Ersatzkraft.',
          'Fensterreinigung und Treppenhausreinigung lassen sich mit demselben Ansprechpartner dazu buchen, in eigenen Intervallen.',
        ],
      },
      {
        title: 'Sprache und Abrechnung',
        paragraphs: [
          'Angebot, Leistungsverzeichnis und Rechnung bekommen Sie bei uns auf Deutsch, abgerechnet wird nach Mitarbeiterstunden. Ihr Ansprechpartner ist direkt erreichbar, ohne Hotline.',
        ],
      },
    ],
    example: {
      label: 'Agentur mit Empfang und zwei Besprechungsräumen',
      staff: 1,
      hours: 2.5,
      visits: 2,
      note: 'eine Reinigungskraft, zweimal pro Woche je zweieinhalb Stunden',
    },
    faqs: [
      {
        q: 'Zu welchen Zeiten reinigen Sie Büros in Kehl?',
        a: 'Büros in Kehl reinigen wir in festen Zeitfenstern vor oder nach Ihren Öffnungszeiten. Die Zeiten legen wir bei der Besichtigung fest und halten sie im Angebot fest.',
      },
      {
        q: 'Reinigen Sie in Kehl auch Büros am Hafen?',
        a: 'Ja, wir reinigen in Kehl Büros in der Innenstadt, am Hafen und in den Ortsteilen. Für Betriebe mit Lager bieten wir zusätzlich Hallenreinigung an.',
      },
      {
        q: 'Was kostet die Büroreinigung in Kehl?',
        a: 'Die Büroreinigung in Kehl kostet 35 bis 45 € brutto pro Mitarbeiterstunde. Wie viele Stunden nötig sind, klären wir bei der kostenlosen Besichtigung.',
      },
      {
        q: 'Kann ich in Kehl auch die Fenster mitreinigen lassen?',
        a: 'Ja, in Kehl buchen Sie die Fensterreinigung mit demselben Ansprechpartner dazu, in einem eigenen Intervall, zum Beispiel vierteljährlich.',
      },
    ],
  },
  {
    slug: 'achern',
    name: 'Achern',
    seoTitle: 'Büroreinigung Achern: mit Vertretung',
    seoDescription: 'Büroreinigung in Achern für Mittelstand, Praxen und Verwaltungen. Festes Team, eingewiesene Ersatzkraft bei Ausfall, schriftliches Angebot in 48 Stunden.',
    answer:
      'CleanStar übernimmt die regelmäßige Büroreinigung in Achern für mittelständische Betriebe, Praxen und Verwaltungen. Wir sind über die A5 in rund 25 Minuten vor Ort, arbeiten mit festem Team und einer eingewiesenen Ersatzkraft und berechnen 35 bis 45 € brutto pro Mitarbeiterstunde.',
    intro:
      'Achern ist der Wirtschaftsstandort im Norden der Ortenau, mit vielen mittelständischen Betrieben aus Produktion, Handwerk und Handel. Hier zählt vor allem eines: dass die Reinigung zuverlässig stattfindet, auch wenn jemand ausfällt.',
    sections: [
      {
        title: 'Die Vertretungsregel',
        paragraphs: [
          'Der häufigste Ärger mit Reinigungsfirmen ist eine Reinigung, die einfach ausfällt. Bei uns ist für jedes Objekt in Achern eine Ersatzkraft eingewiesen. Sie kennt Ihre Räume, die Schlüsselregelung und das Leistungsverzeichnis und übernimmt zur gewohnten Zeit.',
          'Sie müssen dafür nichts tun und nichts nachfragen.',
        ],
      },
      {
        title: 'Für wen wir in Achern arbeiten',
        paragraphs: ['In Achern reinigen wir vor allem:'],
        list: [
          'Verwaltungen und Büros mittelständischer Betriebe',
          'Sozialräume, Umkleiden und Sanitärbereiche in Produktionsbetrieben',
          'Praxen und Kanzleien in der Stadt',
          'Betriebe in Sasbach, Kappelrodeck und Renchen in der Nachbarschaft',
        ],
      },
      {
        title: 'Unterhaltsreinigung für den ganzen Betrieb',
        paragraphs: [
          'Viele Betriebe in Achern brauchen mehr als die Reinigung der Büros. Flure, Treppen, Sozialräume und Sanitärbereiche werden täglich genutzt und gehören deshalb ins Leistungsverzeichnis, oft in einem höheren Rhythmus als die Büros selbst.',
          'Wir schlagen bei der Besichtigung Intervalle vor, die zur Nutzung passen, und erklären, wo Sie sparen können, ohne dass es auffällt.',
        ],
      },
    ],
    example: {
      label: 'Verwaltung eines mittelständischen Betriebs mit Sozialräumen',
      staff: 2,
      hours: 2,
      visits: 5,
      note: 'zwei Reinigungskräfte, fünfmal pro Woche je zwei Stunden',
    },
    faqs: [
      {
        q: 'Was passiert in Achern, wenn die Reinigungskraft krank ist?',
        a: 'In Achern übernimmt dann eine eingewiesene Ersatzkraft zur gewohnten Zeit. Sie kennt Ihr Objekt und das Leistungsverzeichnis, Sie müssen nichts organisieren.',
      },
      {
        q: 'Wie weit ist Achern von Ihrem Sitz entfernt?',
        a: 'Achern liegt rund 25 Minuten von unserem Sitz in Offenburg entfernt, über die A5 gut planbar.',
      },
      {
        q: 'Reinigen Sie in Achern auch Sozialräume und Umkleiden?',
        a: 'Ja, in Achern reinigen wir neben Büros auch Sozialräume, Umkleiden, Flure und Sanitärbereiche. Was wie oft gereinigt wird, steht im Leistungsverzeichnis.',
      },
      {
        q: 'Betreuen Sie auch Orte rund um Achern?',
        a: 'Ja, neben Achern betreuen wir auch Sasbach, Kappelrodeck, Renchen und Oberkirch.',
      },
    ],
  },
  {
    slug: 'oberkirch',
    name: 'Oberkirch',
    seoTitle: 'Büroreinigung Oberkirch: Feste Teams',
    seoDescription: 'Büroreinigung in Oberkirch und im Renchtal: festes Team statt wechselnder Gesichter, schriftliches Leistungsverzeichnis und eigene Qualitätskontrolle.',
    answer:
      'CleanStar reinigt Büros, Praxen und Gewerbeflächen in Oberkirch und im Renchtal. Wir kommen aus Offenburg, rund 20 Minuten entfernt, schicken immer dasselbe Team, kontrollieren die Qualität selbst und berechnen 35 bis 45 € brutto pro Mitarbeiterstunde.',
    intro:
      'Oberkirch ist das Tor zum Renchtal. Viele Betriebe hier haben schlechte Erfahrungen mit wechselnden Reinigungskräften gemacht: Jede Woche kommt jemand Neues, der nicht weiß, was zu tun ist. Bei uns kommt immer dasselbe Team.',
    sections: [
      {
        title: 'Feste Gesichter statt wechselnder Kräfte',
        paragraphs: [
          'Ein festes Team kennt Ihr Büro: wo die empfindlichen Geräte stehen, welche Türen abgeschlossen bleiben, wo der Papierkorb im Besprechungsraum steht. Das spart Ihnen Erklärungen und sorgt für gleichbleibende Qualität.',
          'Für Urlaub und Krankheit ist eine Ersatzkraft eingewiesen, die Ihr Objekt ebenfalls kennt.',
        ],
      },
      {
        title: 'Alles schriftlich',
        paragraphs: [
          'Bevor wir anfangen, bekommen Sie ein Leistungsverzeichnis: welche Räume, welche Tätigkeiten, wie oft. Darauf können Sie sich berufen, und darauf kontrollieren wir selbst. So gibt es keine Diskussionen darüber, was eigentlich vereinbart war.',
        ],
        list: [
          'Räume und Flächen mit Intervall',
          'Tätigkeiten je Raumart, zum Beispiel Büro, Küche, Sanitär',
          'Reinigungszeiten und Schlüsselregelung',
          'Ansprechpartner mit direkter Nummer',
        ],
      },
      {
        title: 'Oberkirch und das Renchtal',
        paragraphs: [
          'Von Oberkirch aus betreuen wir auch Lautenbach und Oppenau. Für diese Orte planen wir feste Reinigungstage, damit Team und Anfahrt verlässlich sind.',
          'In Oberkirch selbst gibt es neben Industrie und Handwerk auch viele Praxen und Dienstleister, die das ganze Tal versorgen. Für Praxen stimmen wir die Hygieneanforderungen im Leistungsverzeichnis ab.',
        ],
      },
    ],
    example: {
      label: 'Praxis mit Wartezimmer und zwei Behandlungsräumen',
      staff: 1,
      hours: 1.5,
      visits: 5,
      note: 'eine Reinigungskraft, fünfmal pro Woche je anderthalb Stunden',
    },
    faqs: [
      {
        q: 'Kommt in Oberkirch immer dieselbe Reinigungskraft?',
        a: 'Ja, in Oberkirch kommt immer dasselbe feste Team. Nur bei Urlaub oder Krankheit übernimmt eine Ersatzkraft, die Ihr Objekt vorher kennengelernt hat.',
      },
      {
        q: 'Reinigen Sie auch Praxen in Oberkirch?',
        a: 'Ja, wir reinigen in Oberkirch auch Praxen. Die Hygieneanforderungen stimmen wir im Leistungsverzeichnis mit Ihnen ab.',
      },
      {
        q: 'Was kostet die Büroreinigung in Oberkirch?',
        a: 'Die Büroreinigung in Oberkirch kostet 35 bis 45 € brutto pro Mitarbeiterstunde, wie überall im Ortenaukreis. Den Stundenbedarf ermitteln wir bei der kostenlosen Besichtigung.',
      },
      {
        q: 'Betreuen Sie von Oberkirch aus das ganze Renchtal?',
        a: 'Wir betreuen neben Oberkirch auch Lautenbach und Oppenau im Renchtal. Für Betriebe weiter oben im Tal fragen Sie uns gern an.',
      },
    ],
  },
]

export const getOfficeCity = (slug: string) => officeCities.find((c) => c.slug === slug)
