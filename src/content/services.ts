/**
 * LEISTUNGEN – Inhalte der Leistungsseiten.
 * Texte hier ändern, die Seiten passen sich automatisch an.
 */
import type { ImageId } from './images'

export interface ServiceFaq {
  q: string
  a: string
}

export interface Service {
  slug: string
  name: string
  /** Kurzer Satz für Karten */
  short: string
  /** SEO-Titel und Beschreibung */
  seoTitle: string
  seoDescription: string
  /** Überschrift (H1) */
  headline: string
  intro: string
  image: ImageId
  icon: 'desk' | 'routine' | 'window' | 'stairs' | 'hall' | 'hygiene'
  featured?: boolean
  /** Aufklappbares Leistungsverzeichnis */
  scope: { title: string; items: string[] }[]
  intervals: { label: string; text: string }[]
  suitableFor: string[]
  highlights: { title: string; text: string }[]
  faqs: ServiceFaq[]
}

export const services: Service[] = [
  {
    slug: 'bueroreinigung',
    name: 'Büroreinigung',
    short: 'Unsere Kernleistung. Arbeitsplätze, Besprechungsräume, Küchen und Sanitär, verlässlich nach festem Plan.',
    seoTitle: 'Büroreinigung in Offenburg und im Ortenaukreis',
    seoDescription:
      'Büroreinigung für Unternehmen im Ortenaukreis: fester Ansprechpartner, eingespieltes Team, Qualitätsgarantie. Kostenlose Objektbesichtigung, Angebot in 48 Stunden.',
    headline: 'Büroreinigung, auf die Sie sich verlassen können.',
    intro:
      'Ihr Büro ist morgens sauber. Jeden Tag, ohne dass Sie nachfragen müssen. Wir reinigen nach einem schriftlich vereinbarten Leistungsverzeichnis, mit festem Team und einem Ansprechpartner, der Ihr Objekt kennt.',
    image: 'svc-buero',
    icon: 'desk',
    featured: true,
    scope: [
      {
        title: 'Arbeitsplätze und Büroräume',
        items: [
          'Freie Schreibtischflächen feucht abwischen (Unterlagen bleiben unberührt)',
          'Papierkörbe leeren, Müllbeutel wechseln, Wertstoffe trennen',
          'Telefone, Tastaturen und Mäuse auf Wunsch hygienisch reinigen',
          'Fensterbänke, Ablagen und Regale in erreichbarer Höhe abstauben',
          'Teppichböden saugen, Hartböden feucht wischen',
          'Fingerabdrücke an Glastüren und Trennwänden entfernen',
          'Stühle zurückstellen, Licht aus, Fenster geschlossen',
        ],
      },
      {
        title: 'Besprechungsräume und Empfang',
        items: [
          'Tische und Stühle reinigen, Geschirr in die Küche bringen',
          'Whiteboards nach Absprache wischen',
          'Empfangstresen und Wartebereich reinigen',
          'Eingangsmatten absaugen, Eingangstüren reinigen',
        ],
      },
      {
        title: 'Küche und Teeküche',
        items: [
          'Arbeitsflächen, Spüle und Armaturen reinigen',
          'Fronten von Kühlschrank, Spülmaschine und Kaffeemaschine abwischen',
          'Spülmaschine ein- oder ausräumen (nach Vereinbarung)',
          'Mikrowelle innen und außen reinigen',
          'Boden feucht wischen, Abfälle entsorgen',
        ],
      },
      {
        title: 'Sanitärräume',
        items: [
          'WCs, Urinale, Waschbecken und Armaturen reinigen und desinfizieren',
          'Spiegel und Fliesen im Spritzbereich reinigen',
          'Seife, Papierhandtücher und Toilettenpapier auffüllen (Material vom Kunden oder von uns)',
          'Böden nass wischen und desinfizieren',
          'Hygienebehälter leeren',
        ],
      },
      {
        title: 'Verkehrsflächen',
        items: ['Flure, Aufzüge und Treppen reinigen', 'Türklinken, Lichtschalter und Handläufe desinfizierend abwischen', 'Spinnweben entfernen'],
      },
    ],
    intervals: [
      { label: 'Täglich', text: 'Für Büros mit vielen Mitarbeitenden oder Kundenverkehr. Sanitär und Küche immer frisch.' },
      { label: '2 bis 3 Mal pro Woche', text: 'Der häufigste Rhythmus für kleine und mittlere Büros.' },
      { label: 'Wöchentlich', text: 'Für kleine Büros oder Flächen mit wenig Publikumsverkehr.' },
      { label: 'Individuell', text: 'Bereiche mit unterschiedlichen Intervallen kombinieren, zum Beispiel Sanitär täglich, Büros zweimal pro Woche.' },
    ],
    suitableFor: [
      'Unternehmen mit eigenen Büroflächen',
      'Kanzleien, Steuerbüros und Agenturen',
      'Arztpraxen und Therapiezentren (Verwaltungsbereiche)',
      'Verwaltungen, Vereine und Bildungsträger',
      'Coworking Spaces und Bürogemeinschaften',
    ],
    highlights: [
      { title: 'Festes Team', text: 'Dieselben Personen in Ihrem Objekt. Sie wissen, wer bei Ihnen arbeitet.' },
      { title: 'Vor oder nach Ihren Bürozeiten', text: 'Wir reinigen, wenn es Ihren Betrieb nicht stört. Auch früh morgens oder am Wochenende.' },
      { title: 'Diskretion', text: 'Unterlagen bleiben, wo sie liegen. Bildschirme und Akten fassen wir nicht an.' },
      { title: 'Ersatzkraft bei Ausfall', text: 'Fällt jemand aus, übernimmt eine eingewiesene Vertretung. Ihre Reinigung findet statt.' },
    ],
    faqs: [
      {
        q: 'Müssen wir während der Reinigung anwesend sein?',
        a: 'Nein. Die meisten Kunden geben uns einen Schlüssel oder Transponder. Die Übergabe wird schriftlich dokumentiert, und nur das feste Team hat Zugang.',
      },
      {
        q: 'Wer stellt die Reinigungsmittel und Verbrauchsmaterialien?',
        a: 'Reinigungsmittel und Geräte bringen wir mit. Verbrauchsmaterial wie Seife, Papierhandtücher und Toilettenpapier können Sie selbst stellen oder über uns beziehen. Das legen wir im Angebot fest.',
      },
      {
        q: 'Können wir mit einer Probereinigung starten?',
        a: 'Ja. Nach der Besichtigung und dem Angebot vereinbaren wir gern eine Probereinigung. So sehen Sie vorab, wie wir arbeiten.',
      },
      {
        q: 'Was passiert, wenn etwas nicht sauber ist?',
        a: 'Sie melden es Ihrem Ansprechpartner per Telefon oder E-Mail. Wir reinigen kostenlos nach und klären die Ursache, damit es nicht wieder vorkommt.',
      },
    ],
  },
  {
    slug: 'unterhaltsreinigung',
    name: 'Unterhaltsreinigung',
    short: 'Regelmäßige Reinigung von Gewerbeflächen, Praxen und Verwaltungen in festem Rhythmus.',
    seoTitle: 'Unterhaltsreinigung für Gewerbe im Ortenaukreis',
    seoDescription:
      'Regelmäßige Unterhaltsreinigung für Praxen, Kanzleien, Verwaltungen und Gewerbeflächen in Offenburg und Umgebung. Fester Plan, festes Team, kostenlose Besichtigung.',
    headline: 'Unterhaltsreinigung im festen Rhythmus.',
    intro:
      'Die laufende Reinigung, die Ihre Räume dauerhaft in gutem Zustand hält. Wir legen gemeinsam fest, was wie oft gereinigt wird, und halten uns daran. Das Ergebnis prüfen wir regelmäßig selbst.',
    image: 'svc-unterhalt',
    icon: 'routine',
    scope: [
      {
        title: 'Böden',
        items: ['Hartböden kehren und feucht wischen', 'Teppiche und Sauberlaufzonen saugen', 'Flecken punktuell entfernen', 'Pflegemittel passend zum Bodenbelag einsetzen'],
      },
      {
        title: 'Oberflächen und Inventar',
        items: [
          'Tische, Theken und Ablagen reinigen',
          'Türen, Türrahmen und Griffe abwischen',
          'Heizkörper und Fensterbänke abstauben',
          'Glaseinsätze und Glastüren von Fingerabdrücken befreien',
        ],
      },
      {
        title: 'Sanitär und Sozialräume',
        items: [
          'Sanitäranlagen reinigen und desinfizieren',
          'Duschen und Umkleiden reinigen (falls vorhanden)',
          'Sozialräume und Pausenküchen reinigen',
          'Verbrauchsmaterial auffüllen',
        ],
      },
      {
        title: 'Abfall',
        items: ['Abfallbehälter leeren und Beutel wechseln', 'Wertstofftrennung nach Ihren Vorgaben', 'Abfall zu den Sammelstellen bringen'],
      },
    ],
    intervals: [
      { label: 'Täglich', text: 'Für stark frequentierte Flächen und Sanitärbereiche.' },
      { label: 'Mehrmals pro Woche', text: 'Der übliche Rhythmus für Praxen, Kanzleien und Verwaltungen.' },
      { label: 'Wöchentlich', text: 'Für Lager, Nebenräume und Flächen mit wenig Nutzung.' },
    ],
    suitableFor: ['Arztpraxen und Therapiepraxen', 'Kanzleien und Steuerbüros', 'Verkaufsräume und Showrooms', 'Verwaltungen und Vereinsheime', 'Schulungs- und Seminarräume'],
    highlights: [
      { title: 'Schriftliches Leistungsverzeichnis', text: 'Was gereinigt wird, steht schwarz auf weiß. Kein Interpretationsspielraum.' },
      { title: 'Anpassbar', text: 'Ändern sich Ihre Abläufe, passen wir Plan und Intervalle an.' },
      { title: 'Regelmäßige Kontrolle', text: 'Wir prüfen die Qualität selbst mit Checklisten, nicht erst wenn Sie sich melden.' },
    ],
    faqs: [
      {
        q: 'Worin unterscheidet sich Unterhaltsreinigung von Grundreinigung?',
        a: 'Die Unterhaltsreinigung ist die laufende, regelmäßige Reinigung. Eine Grundreinigung ist eine einmalige, tiefe Reinigung, zum Beispiel vor dem Start oder einmal im Jahr. Beides lässt sich kombinieren.',
      },
      {
        q: 'Können Intervalle später geändert werden?',
        a: 'Ja. Sagen Sie Ihrem Ansprechpartner Bescheid, wir passen den Plan an und bestätigen die Änderung schriftlich.',
      },
    ],
  },
  {
    slug: 'fensterreinigung',
    name: 'Fensterreinigung',
    short: 'Streifenfreie Fenster, Glastüren und Glasflächen, innen und außen, inklusive Rahmen.',
    seoTitle: 'Fensterreinigung und Glasreinigung im Ortenaukreis',
    seoDescription: 'Fensterreinigung für Büros und Gewerbe in Offenburg, Lahr, Kehl und im ganzen Ortenaukreis. Glasflächen, Rahmen und Falze. Kostenlose Besichtigung.',
    headline: 'Klare Sicht. Streifenfrei.',
    intro:
      'Saubere Fenster sind das Erste, was Besucher sehen. Wir reinigen Glasflächen, Rahmen und Falze gründlich und planbar, einzeln oder als festen Bestandteil Ihrer Büroreinigung.',
    image: 'svc-fenster',
    icon: 'window',
    scope: [
      {
        title: 'Glasflächen',
        items: ['Fensterscheiben innen und außen', 'Glastüren und Glastrennwände', 'Oberlichter in erreichbarer Höhe', 'Schaufenster und Eingangsbereiche'],
      },
      {
        title: 'Rahmen und Falze',
        items: ['Fensterrahmen feucht reinigen', 'Falze und Dichtungen säubern', 'Fensterbänke innen und außen reinigen'],
      },
      {
        title: 'Nach Absprache',
        items: ['Jalousien und Lamellen reinigen', 'Wintergärten und Glasdächer (nach Besichtigung)', 'Höhere Flächen mit passender Ausrüstung (nach Besichtigung)'],
      },
    ],
    intervals: [
      { label: 'Monatlich', text: 'Für Eingangsbereiche und Schaufenster.' },
      { label: 'Vierteljährlich', text: 'Der übliche Rhythmus für Bürofenster.' },
      { label: 'Halbjährlich oder einmalig', text: 'Zum Frühjahr, nach Bauarbeiten oder vor besonderen Anlässen.' },
    ],
    suitableFor: ['Bürogebäude und Verwaltungen', 'Ladengeschäfte und Showrooms', 'Praxen und Kanzleien', 'Hausverwaltungen'],
    highlights: [
      { title: 'Rahmen inklusive', text: 'Saubere Scheiben in schmutzigen Rahmen sehen nicht sauber aus. Deshalb gehören Rahmen dazu.' },
      { title: 'Planbar', text: 'Feste Termine im Jahr, rechtzeitig angekündigt.' },
      { title: 'Kombinierbar', text: 'Als Zusatz zur Büroreinigung mit demselben Ansprechpartner.' },
    ],
    faqs: [
      {
        q: 'Reinigen Sie auch bei Regen?',
        a: 'Leichter Regen ist meist kein Problem. Bei Starkregen oder Frost verschieben wir den Termin in Absprache mit Ihnen.',
      },
      {
        q: 'Wie hoch können Sie reinigen?',
        a: 'Das klären wir bei der Besichtigung. Je nach Höhe und Zugang setzen wir passende Ausrüstung ein oder sagen Ihnen offen, wenn eine Hubarbeitsbühne nötig ist.',
      },
    ],
  },
  {
    slug: 'treppenhausreinigung',
    name: 'Treppenhausreinigung',
    short: 'Gepflegte Treppenhäuser, Eingänge und Aufzüge für Geschäftshäuser und Wohnanlagen.',
    seoTitle: 'Treppenhausreinigung in Offenburg und Umgebung',
    seoDescription: 'Treppenhausreinigung für Geschäftshäuser, Hausverwaltungen und Wohnanlagen im Ortenaukreis. Regelmäßig, dokumentiert, mit festem Ansprechpartner.',
    headline: 'Der erste Eindruck beginnt im Treppenhaus.',
    intro:
      'Treppenhaus, Eingang und Aufzug sind die Visitenkarte eines Hauses. Wir halten sie regelmäßig sauber und dokumentieren jeden Einsatz, damit Eigentümer und Verwaltung den Überblick behalten.',
    image: 'svc-treppenhaus',
    icon: 'stairs',
    scope: [
      {
        title: 'Treppen und Podeste',
        items: ['Stufen und Podeste kehren und feucht wischen', 'Handläufe und Geländer reinigen', 'Sockelleisten abwischen'],
      },
      {
        title: 'Eingang und Aufzug',
        items: [
          'Haustür und Glaseinsätze reinigen',
          'Briefkasten- und Klingelanlage abwischen',
          'Aufzugskabine innen reinigen, Spiegel und Tableau',
          'Fußmatten absaugen oder ausklopfen',
        ],
      },
      {
        title: 'Nach Absprache',
        items: ['Kellergänge und Nebenräume', 'Treppenhausfenster', 'Spinnweben und Lampen abstauben'],
      },
    ],
    intervals: [
      { label: 'Wöchentlich', text: 'Der Standard für Geschäfts- und Mehrfamilienhäuser.' },
      { label: '14-täglich', text: 'Für kleinere Häuser mit wenig Durchgangsverkehr.' },
      { label: 'Mehrmals pro Woche', text: 'Für Häuser mit Publikumsverkehr oder Praxen im Gebäude.' },
    ],
    suitableFor: ['Geschäftshäuser mit mehreren Mietparteien', 'Hausverwaltungen', 'Eigentümergemeinschaften', 'Ärztehäuser'],
    highlights: [
      { title: 'Nachweisbar', text: 'Jeder Einsatz wird dokumentiert. Auf Wunsch mit Reinigungsplan im Treppenhaus.' },
      { title: 'Ein Ansprechpartner für die Verwaltung', text: 'Keine Abstimmung mit wechselnden Personen.' },
    ],
    faqs: [
      {
        q: 'Arbeiten Sie auch für Hausverwaltungen?',
        a: 'Ja. Wir arbeiten gern mit Hausverwaltungen zusammen und stimmen Leistungsumfang und Dokumentation direkt mit Ihnen ab.',
      },
      {
        q: 'Kann der Reinigungsplan im Haus aushängen?',
        a: 'Ja. Auf Wunsch hängen wir einen Plan aus, auf dem jeder Einsatz abgezeichnet wird.',
      },
    ],
  },
  {
    slug: 'hallenreinigung',
    name: 'Hallenreinigung',
    short: 'Reinigung von Lager-, Produktions- und Gewerbehallen mit passender Technik.',
    seoTitle: 'Hallenreinigung im Ortenaukreis',
    seoDescription: 'Hallenreinigung für Lager, Produktion und Gewerbe in Offenburg, Lahr, Kehl und Umgebung. Planbar außerhalb Ihrer Betriebszeiten. Kostenlose Besichtigung.',
    headline: 'Saubere Hallen. Ohne Ihren Betrieb aufzuhalten.',
    intro:
      'In Hallen zählt Planung: Laufwege, Maschinen, Schichtzeiten. Wir sehen uns Ihre Halle vorher an, wählen die passende Technik und reinigen dann, wenn es Ihren Betrieb nicht stört.',
    image: 'svc-halle',
    icon: 'hall',
    scope: [
      {
        title: 'Hallenböden',
        items: ['Maschinelle Bodenreinigung mit Scheuersaugtechnik (nach Besichtigung)', 'Kehren und Feuchtwischen von Verkehrswegen', 'Punktuelle Fleckentfernung'],
      },
      {
        title: 'Nebenflächen',
        items: ['Sozialräume, Umkleiden und Sanitär', 'Büros und Meisterbüros in der Halle', 'Treppen, Podeste und Galerien'],
      },
      {
        title: 'Nach Absprache',
        items: ['Regale und Ablagen in erreichbarer Höhe', 'Tore, Rolltore und Glaselemente', 'Einmalige Grundreinigung, zum Beispiel nach Umbau'],
      },
    ],
    intervals: [
      { label: 'Wöchentlich', text: 'Für Lager- und Logistikflächen mit regelmäßigem Verkehr.' },
      { label: 'Monatlich', text: 'Für Hallen mit wenig Staubentwicklung.' },
      { label: 'Einmalig', text: 'Nach Umbau, vor Audits oder zum Jahresabschluss.' },
    ],
    suitableFor: ['Lager- und Logistikhallen', 'Produktions- und Werkstatthallen', 'Ausstellungs- und Verkaufshallen', 'Sport- und Veranstaltungshallen (nach Absprache)'],
    highlights: [
      { title: 'Planung vor Ort', text: 'Wir klären Zugänge, Maschinen und Sicherheitsvorgaben vorab.' },
      { title: 'Außerhalb der Schicht', text: 'Früh, spät oder am Wochenende. Ihr Betrieb läuft weiter.' },
    ],
    faqs: [
      {
        q: 'Welche Hallenböden können Sie reinigen?',
        a: 'Beton, Beschichtungen wie Epoxid und viele weitere Industrieböden. Welche Technik passt, legen wir nach der Besichtigung fest.',
      },
      {
        q: 'Halten Sie unsere Sicherheitsvorgaben ein?',
        a: 'Ja. Wir lassen uns vor dem ersten Einsatz in Ihre Vorgaben einweisen und geben sie an das Team weiter.',
      },
    ],
  },
  {
    slug: 'hygienereinigung',
    name: 'Hygienereinigung',
    short: 'Sanitärbereiche, Küchen, Duschen und Kontaktflächen gründlich reinigen und desinfizieren.',
    seoTitle: 'Hygienereinigung und Desinfektion im Ortenaukreis',
    seoDescription: 'Hygienereinigung für Sanitärräume, Küchen, Duschen und Kontaktflächen in Unternehmen im Ortenaukreis. Mit klarem Plan und dokumentierten Abläufen.',
    headline: 'Hygiene, die man nicht sieht. Und genau deshalb ernst nimmt.',
    intro:
      'Sanitärräume, Küchen und Kontaktflächen brauchen mehr als einen feuchten Lappen. Wir arbeiten mit getrennten Farbsystemen, passenden Desinfektionsmitteln und klaren Abläufen, damit Keime nicht von einem Bereich in den nächsten wandern.',
    image: 'svc-hygiene',
    icon: 'hygiene',
    scope: [
      {
        title: 'Sanitär',
        items: [
          'WCs, Urinale und Waschbecken reinigen und desinfizieren',
          'Kalk an Armaturen und Fliesen entfernen',
          'Duschen, Abläufe und Fugen reinigen',
          'Hygieneartikel und Spender auffüllen',
        ],
      },
      {
        title: 'Küchen und Sozialräume',
        items: ['Arbeitsflächen und Spülen hygienisch reinigen', 'Griffe, Schalter und Geräteoberflächen desinfizieren', 'Kühlschränke nach Absprache ausräumen und reinigen'],
      },
      {
        title: 'Kontaktflächen',
        items: ['Türklinken, Lichtschalter, Handläufe', 'Aufzugstableaus und Tastaturen', 'Gemeinsam genutzte Geräte wie Drucker und Kaffeemaschinen'],
      },
      {
        title: 'Besondere Bereiche',
        items: ['Umkleiden und Duschen in Betrieben', 'Sauna- und Wellnessbereiche (nach Besichtigung)', 'Bereiche mit erhöhten Hygieneanforderungen (nach Absprache)'],
      },
    ],
    intervals: [
      { label: 'Täglich', text: 'Für Sanitärräume und Küchen mit regelmäßiger Nutzung.' },
      { label: 'Mehrmals täglich', text: 'Für stark frequentierte Bereiche, nach Absprache.' },
      { label: 'Einmalig', text: 'Als Grundreinigung oder nach besonderen Vorkommnissen.' },
    ],
    suitableFor: ['Unternehmen mit Sanitär- und Duschbereichen', 'Betriebe mit Kantinen oder Teeküchen', 'Fitness- und Wellnessbereiche', 'Praxen (Nicht-Behandlungsbereiche)'],
    highlights: [
      { title: 'Farbsystem', text: 'Getrennte Tücher und Eimer für Sanitär, Küche und Büro. Keine Verschleppung.' },
      { title: 'Passende Mittel', text: 'Wir setzen Desinfektion gezielt ein und nicht pauschal überall.' },
      { title: 'Dokumentiert', text: 'Auf Wunsch mit Hygieneplan und Nachweis je Einsatz.' },
    ],
    faqs: [
      {
        q: 'Welche Desinfektionsmittel verwenden Sie?',
        a: 'Wir wählen Mittel passend zu Fläche und Anforderung. Wenn Sie bestimmte Mittel vorgeben oder ausschließen möchten, berücksichtigen wir das.',
      },
      {
        q: 'Reinigen Sie auch Saunen und Duschen?',
        a: 'Ja. Weil diese Bereiche sehr unterschiedlich sind, sehen wir sie uns vorher an und legen den Aufwand gemeinsam fest.',
      },
    ],
  },
]

export const getService = (slug: string) => services.find((s) => s.slug === slug)
