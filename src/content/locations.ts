/**
 * EINZUGSGEBIET – Orte im Ortenaukreis.
 * Aus dieser Liste entstehen die Karte und die Standortseiten /einzugsgebiet/<slug>.
 *
 * minutes: ungefähre Fahrzeit mit dem Auto ab Offenburg (Richtwert, ohne Verkehr).
 * TODO: Fahrzeiten bei Bedarf einmal mit eigener Erfahrung abgleichen.
 */
export interface Location {
  slug: string
  name: string
  minutes: number
  /** Geografische Koordinaten (für die SVG-Karte) */
  lat: number
  lng: number
  /** Eigener Einleitungstext pro Ort (nicht kopieren) */
  intro: string
  /** Zweiter Absatz: wie wir dort arbeiten */
  detail: string
  /** Nachbarorte für interne Verlinkung */
  nearby: string[]
}

export const hq = { name: 'Offenburg', lat: 48.4708, lng: 7.9408 }

export const locations: Location[] = [
  {
    slug: 'offenburg',
    name: 'Offenburg',
    minutes: 0,
    lat: 48.4708,
    lng: 7.9408,
    intro:
      'Offenburg ist unser Sitz. Von hier aus betreuen wir Büros in der Innenstadt, in der Nordoststadt und in den Gewerbegebieten rund um die Stadt. Kurze Wege bedeuten für Sie: Wenn etwas ist, sind wir schnell da.',
    detail:
      'Ob Kanzlei in der Altstadt, Agentur im Gewerbegebiet oder Verwaltung mit mehreren Etagen: Wir sehen uns Ihre Räume kostenlos an und schicken Ihnen innerhalb von 48 Stunden ein Angebot. Reinigt wird vor oder nach Ihren Bürozeiten.',
    nearby: ['ortenberg', 'schutterwald', 'durbach', 'appenweier'],
  },
  {
    slug: 'lahr',
    name: 'Lahr',
    minutes: 25,
    lat: 48.3394,
    lng: 7.8728,
    intro:
      'Lahr ist nach Offenburg die zweitgrößte Stadt der Ortenau, mit vielen Betrieben in Industrie, Handel und Dienstleistung. Für Unternehmen in Lahr übernehmen wir die Büroreinigung mit festem Team und einem Ansprechpartner, der direkt erreichbar ist.',
    detail:
      'Die Anfahrt über die B3 oder die A5 ist planbar. Größere Objekte mit Büro und Halle betreuen wir aus einer Hand, zum Beispiel Büroreinigung mehrmals pro Woche und Hallenreinigung im Monatsrhythmus.',
    nearby: ['friesenheim', 'hohberg'],
  },
  {
    slug: 'kehl',
    name: 'Kehl',
    minutes: 22,
    lat: 48.5728,
    lng: 7.8156,
    intro:
      'Kehl liegt direkt am Rhein gegenüber von Straßburg. Viele Unternehmen hier arbeiten grenzüberschreitend und haben Kunden, die einen gepflegten ersten Eindruck erwarten. Wir sorgen dafür, dass Empfang, Besprechungsräume und Büros jeden Morgen bereit sind.',
    detail:
      'Für Büros im Hafengebiet und in der Innenstadt reinigen wir in festen Zeitfenstern, abgestimmt auf Ihre Öffnungszeiten. Fensterreinigung und Treppenhausreinigung lassen sich mit demselben Ansprechpartner dazu buchen.',
    nearby: ['willstaett', 'neuried'],
  },
  {
    slug: 'achern',
    name: 'Achern',
    minutes: 25,
    lat: 48.6311,
    lng: 8.0764,
    intro:
      'Achern im Norden der Ortenau ist über die A5 schnell erreichbar. Für Unternehmen in Achern und den umliegenden Gemeinden übernehmen wir die regelmäßige Büro- und Unterhaltsreinigung, verlässlich und mit festen Zeiten.',
    detail:
      'Gerade bei Objekten etwas weiter von Offenburg entfernt zählt die Vertretungsregel: Fällt jemand aus, übernimmt eine eingewiesene Ersatzkraft. Ihre Reinigung findet trotzdem statt.',
    nearby: ['oberkirch', 'appenweier'],
  },
  {
    slug: 'oberkirch',
    name: 'Oberkirch',
    minutes: 20,
    lat: 48.5306,
    lng: 8.0789,
    intro: 'Oberkirch ist das Tor zum Renchtal. Hier betreuen wir Büros, Praxen und Gewerbeflächen, die eine Reinigung mit festem Rhythmus suchen statt wechselnder Gesichter.',
    detail:
      'Wir legen mit Ihnen fest, welche Bereiche wie oft gereinigt werden, und halten das schriftlich fest. Die Qualität kontrollieren wir regelmäßig selbst, damit Sie nicht nachkontrollieren müssen.',
    nearby: ['achern', 'durbach', 'appenweier'],
  },
  {
    slug: 'gengenbach',
    name: 'Gengenbach',
    minutes: 15,
    lat: 48.4044,
    lng: 8.0144,
    intro:
      'Gengenbach im Kinzigtal verbindet historische Altstadt mit modernen Betrieben am Ortsrand. Für Büros und Praxen in Gengenbach sind wir in rund einer Viertelstunde vor Ort.',
    detail:
      'Ob kleines Büro in der Altstadt oder Verwaltung im Gewerbegebiet: Wir besichtigen Ihr Objekt kostenlos und schlagen ein Intervall vor, das zu Ihrer Nutzung passt. Nicht mehr und nicht weniger.',
    nearby: ['ortenberg', 'haslach', 'durbach'],
  },
  {
    slug: 'haslach',
    name: 'Haslach im Kinzigtal',
    minutes: 30,
    lat: 48.2789,
    lng: 8.0869,
    intro:
      'Haslach liegt im mittleren Kinzigtal und ist Mittelpunkt für viele Gemeinden ringsum. Unternehmen hier sollen nicht auf eine verlässliche Büroreinigung verzichten, nur weil die nächste große Stadt etwas entfernt ist.',
    detail:
      'Wir planen Einsätze in Haslach so, dass das Team fest eingeteilt ist und Ihr Objekt kennt. Fragen und Wünsche gehen direkt an Ihren Ansprechpartner, ohne Callcenter und Ticketsystem.',
    nearby: ['gengenbach'],
  },
  {
    slug: 'appenweier',
    name: 'Appenweier',
    minutes: 12,
    lat: 48.5394,
    lng: 7.98,
    intro:
      'Appenweier liegt nördlich von Offenburg an einem wichtigen Bahn- und Straßenknoten. Für Betriebe hier sind wir in wenigen Minuten erreichbar, auch wenn kurzfristig etwas zu tun ist.',
    detail:
      'Kleine Büros profitieren von unserem wöchentlichen Rhythmus, größere Betriebe kombinieren Büroreinigung mit Fenster- und Treppenhausreinigung. Alles läuft über einen Ansprechpartner.',
    nearby: ['offenburg', 'willstaett', 'oberkirch'],
  },
  {
    slug: 'willstaett',
    name: 'Willstätt',
    minutes: 15,
    lat: 48.5422,
    lng: 7.8956,
    intro:
      'Willstätt im Hanauerland liegt zwischen Offenburg und Kehl. Die Gemeinde hat sich mit ihren Gewerbegebieten zu einem Standort für Handwerk, Handel und Logistik entwickelt.',
    detail:
      'Für Betriebe mit Büro und Lager bieten wir beides aus einer Hand: Büroreinigung im festen Rhythmus und Hallenreinigung nach Bedarf. Das spart Abstimmung und Rechnungen.',
    nearby: ['kehl', 'appenweier', 'offenburg'],
  },
  {
    slug: 'ortenberg',
    name: 'Ortenberg',
    minutes: 8,
    lat: 48.4497,
    lng: 7.9711,
    intro: 'Ortenberg grenzt direkt an Offenburg, unterhalb des bekannten Schlosses. Für Büros und Praxen in Ortenberg sind wir in wenigen Minuten vor Ort, kürzer geht es kaum.',
    detail:
      'Die kurze Entfernung macht auch flexible Lösungen einfach, etwa eine zusätzliche Reinigung vor einem wichtigen Kundentermin. Sprechen Sie Ihren Ansprechpartner einfach an.',
    nearby: ['offenburg', 'gengenbach', 'hohberg'],
  },
  {
    slug: 'durbach',
    name: 'Durbach',
    minutes: 12,
    lat: 48.4939,
    lng: 8.0189,
    intro:
      'Durbach ist für seinen Weinbau bekannt. Neben Weingütern und Gastronomie gibt es hier Büros, Praxen und Betriebe, die eine verlässliche Reinigung brauchen. Wir sind in rund zehn Minuten aus Offenburg da.',
    detail:
      'Für Betriebe mit Verkaufs- oder Empfangsräumen reinigen wir vor der Öffnung, damit alles bereit ist, wenn die ersten Gäste kommen. Büros und Sanitärbereiche gehören selbstverständlich dazu.',
    nearby: ['offenburg', 'oberkirch', 'gengenbach'],
  },
  {
    slug: 'hohberg',
    name: 'Hohberg',
    minutes: 12,
    lat: 48.405,
    lng: 7.905,
    intro: 'Hohberg mit den Ortsteilen Hofweier, Niederschopfheim und Diersburg liegt südlich von Offenburg an der B3 und A5. Unternehmen hier erreichen wir schnell und planbar.',
    detail:
      'Wir übernehmen die Reinigung von Büros, Praxen und Sozialräumen in Hohberg im festen Rhythmus. Im ersten Monat können Sie jederzeit kündigen, so testen Sie uns ohne Risiko.',
    nearby: ['ortenberg', 'friesenheim', 'schutterwald'],
  },
  {
    slug: 'schutterwald',
    name: 'Schutterwald',
    minutes: 10,
    lat: 48.4586,
    lng: 7.8775,
    intro: 'Schutterwald liegt westlich von Offenburg, mit Anschluss an die A5 und eigenem Gewerbegebiet. Für Unternehmen in Schutterwald sind wir quasi Nachbarn.',
    detail:
      'Ob Büro, Werkstatt mit Sozialräumen oder Lagerhalle: Wir sehen uns das Objekt an und erstellen ein Angebot, das zu Ihrer tatsächlichen Nutzung passt. Innerhalb von 48 Stunden.',
    nearby: ['offenburg', 'neuried', 'hohberg'],
  },
  {
    slug: 'neuried',
    name: 'Neuried',
    minutes: 15,
    lat: 48.45,
    lng: 7.8167,
    intro:
      'Neuried erstreckt sich westlich von Offenburg bis an den Rhein, mit den Ortsteilen Altenheim, Ichenheim, Dundenheim und Müllen. Betriebe hier betreuen wir mit kurzen Anfahrtswegen.',
    detail:
      'Wir reinigen Büros, Praxen und Gewerbeflächen in Neuried zu Zeiten, die Ihren Betrieb nicht stören. Wer einen festen Ansprechpartner statt einer Hotline möchte, ist bei uns richtig.',
    nearby: ['schutterwald', 'kehl'],
  },
  {
    slug: 'friesenheim',
    name: 'Friesenheim',
    minutes: 18,
    lat: 48.3739,
    lng: 7.8756,
    intro: 'Friesenheim liegt zwischen Offenburg und Lahr direkt an der A5 und B3. Die gute Anbindung hat viele Betriebe angezogen, vom Handwerk bis zur Logistik.',
    detail:
      'Für Unternehmen in Friesenheim kombinieren wir Büroreinigung, Hallenreinigung und Hygienereinigung nach Bedarf. Ein Ansprechpartner, ein Angebot, ein Team, das Ihr Objekt kennt.',
    nearby: ['lahr', 'hohberg'],
  },
]

export const getLocation = (slug: string) => locations.find((l) => l.slug === slug)
