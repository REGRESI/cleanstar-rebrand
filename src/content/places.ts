/**
 * ORTE IM EINZUGSGEBIET – schlanke Grunddaten (Name, Fahrzeit, Koordinaten).
 * Wird von Karte, Fußzeile und Routen genutzt und ist deshalb bewusst klein.
 * Die Texte je Ort stehen in locations.ts. Neuer Ort: hier eintragen und dort Texte ergänzen.
 *
 * minutes: ungefähre Fahrzeit mit dem Auto ab Offenburg (Richtwert, ohne Verkehr).
 * Aufgenommen sind Orte bis etwa 45 Minuten Fahrzeit.
 */
export interface Place {
  slug: string
  name: string
  minutes: number
  lat: number
  lng: number
  /** Größerer Ort: Beschriftung auf der Karte, Platz in der Fußzeile */
  major?: boolean
  /** Eigene Ortsseite (/einzugsgebiet/ort). Alle übrigen Orte stehen gesammelt auf der Einzugsgebiet-Seite. */
  page?: boolean
}

export const hq = { name: 'Offenburg', lat: 48.4708, lng: 7.9408 }

export const places: Place[] = [
  { slug: 'offenburg', name: 'Offenburg', minutes: 0, lat: 48.4708, lng: 7.9408, major: true, page: true },
  { slug: 'lahr', name: 'Lahr', minutes: 25, lat: 48.3394, lng: 7.8728, major: true, page: true },
  { slug: 'kehl', name: 'Kehl', minutes: 22, lat: 48.5728, lng: 7.8156, major: true, page: true },
  { slug: 'achern', name: 'Achern', minutes: 25, lat: 48.6311, lng: 8.0764, major: true, page: true },
  { slug: 'oberkirch', name: 'Oberkirch', minutes: 20, lat: 48.5306, lng: 8.0789, major: true, page: true },
  { slug: 'gengenbach', name: 'Gengenbach', minutes: 15, lat: 48.4044, lng: 8.0144, major: true, page: true },
  { slug: 'haslach', name: 'Haslach im Kinzigtal', minutes: 30, lat: 48.2789, lng: 8.0869, major: true, page: true },
  { slug: 'appenweier', name: 'Appenweier', minutes: 12, lat: 48.5394, lng: 7.98, page: true },
  { slug: 'willstaett', name: 'Willstätt', minutes: 15, lat: 48.5422, lng: 7.8956, page: true },
  { slug: 'ortenberg', name: 'Ortenberg', minutes: 8, lat: 48.4497, lng: 7.9711 },
  { slug: 'durbach', name: 'Durbach', minutes: 12, lat: 48.4939, lng: 8.0189 },
  { slug: 'hohberg', name: 'Hohberg', minutes: 12, lat: 48.405, lng: 7.905 },
  { slug: 'schutterwald', name: 'Schutterwald', minutes: 10, lat: 48.4586, lng: 7.8775 },
  { slug: 'neuried', name: 'Neuried', minutes: 15, lat: 48.45, lng: 7.8167 },
  { slug: 'friesenheim', name: 'Friesenheim', minutes: 18, lat: 48.3739, lng: 7.8756 },
  { slug: 'renchen', name: 'Renchen', minutes: 18, lat: 48.587, lng: 8.01 },
  { slug: 'rheinau', name: 'Rheinau', minutes: 30, lat: 48.665, lng: 7.935, page: true },
  { slug: 'kappelrodeck', name: 'Kappelrodeck', minutes: 30, lat: 48.593, lng: 8.117 },
  { slug: 'sasbach', name: 'Sasbach', minutes: 28, lat: 48.638, lng: 8.093 },
  { slug: 'lautenbach', name: 'Lautenbach', minutes: 22, lat: 48.522, lng: 8.108 },
  { slug: 'oppenau', name: 'Oppenau', minutes: 30, lat: 48.474, lng: 8.159 },
  { slug: 'zell-am-harmersbach', name: 'Zell am Harmersbach', minutes: 25, lat: 48.346, lng: 8.064 },
  { slug: 'biberach', name: 'Biberach', minutes: 20, lat: 48.339, lng: 8.029 },
  { slug: 'hausach', name: 'Hausach', minutes: 30, lat: 48.284, lng: 8.177 },
  { slug: 'wolfach', name: 'Wolfach', minutes: 35, lat: 48.3, lng: 8.218, page: true },
  { slug: 'seelbach', name: 'Seelbach', minutes: 30, lat: 48.313, lng: 7.942 },
  { slug: 'kippenheim', name: 'Kippenheim', minutes: 25, lat: 48.296, lng: 7.825 },
  { slug: 'mahlberg', name: 'Mahlberg', minutes: 25, lat: 48.287, lng: 7.812 },
  { slug: 'ettenheim', name: 'Ettenheim', minutes: 30, lat: 48.257, lng: 7.812, page: true },
  { slug: 'rust', name: 'Rust', minutes: 32, lat: 48.266, lng: 7.725 },
  { slug: 'schwanau', name: 'Schwanau', minutes: 25, lat: 48.365, lng: 7.766 },
  { slug: 'meissenheim', name: 'Meißenheim', minutes: 22, lat: 48.413, lng: 7.772 },
  { slug: 'berghaupten', name: 'Berghaupten', minutes: 12, lat: 48.409, lng: 7.987 },
  { slug: 'ohlsbach', name: 'Ohlsbach', minutes: 12, lat: 48.433, lng: 7.996 },
]

/** Orte mit eigener Seite (rund ein Dutzend mit wirklich eigenständigem Inhalt) */
export const pagePlaces = places.filter((p) => p.page)

/** Ziel eines Ortslinks: eigene Seite oder die Sammlung auf der Einzugsgebiet-Seite */
export const placeHref = (p: Pick<Place, 'slug' | 'page'>) => (p.page ? `/einzugsgebiet/${p.slug}` : `/einzugsgebiet#ort-${p.slug}`)

/** Kurzname ohne Zusatz (für Überschriften und Links) */
export const shortName = (l: Pick<Place, 'name'>) => l.name.replace(' im Kinzigtal', '')
