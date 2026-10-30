/**
 * Schalter für Funktionen, die erst nach Freigabe live gehen.
 * signatureScene: Signatur-Szene „Eine Nacht in Ihrem Büro“ ersetzt im Hero der Startseite das Scroll-Video.
 * Bis zur Freigabe läuft sie nur auf /labor/nacht (noindex, nicht verlinkt).
 * sparkPortal: Funken-Portal Vorher/Nachher auf der Seite Leistungen. Aus, bis ein deckungsgleiches Bildpaar vorliegt
 * (siehe OFFENE-PUNKTE.md); zur Ansicht auf /labor/portal (noindex, nicht verlinkt).
 */
export const features = {
  signatureScene: false,
  sparkPortal: false,
}
