/**
 * SELBSTTEST „Wie gut ist Ihre aktuelle Reinigung?“ (Seite /reinigungs-check)
 * Punkte je Antwort: 2 = gut, 1 = mittel, 0 = schwach. Der Hinweis erscheint in der Auswertung,
 * wenn bei der Frage nicht die volle Punktzahl erreicht wurde.
 * Es wird nichts gespeichert oder gesendet.
 */
export interface CheckQuestion {
  q: string
  answers: { label: string; points: 0 | 1 | 2 }[]
  hint: { title: string; text: string }
}

export const checkQuestions: CheckQuestion[] = [
  {
    q: 'Kommt Ihre Reinigung immer zur vereinbarten Zeit?',
    answers: [
      { label: 'Ja, immer', points: 2 },
      { label: 'Meistens', points: 1 },
      { label: 'Eher nicht', points: 0 },
    ],
    hint: { title: 'Feste Zeiten schriftlich vereinbaren', text: 'Tage und Zeitfenster gehören ins Angebot. Dann wissen Sie jederzeit, wann gereinigt wird.' },
  },
  {
    q: 'Haben Sie einen festen Ansprechpartner, der direkt erreichbar ist?',
    answers: [
      { label: 'Ja, mit direkter Nummer', points: 2 },
      { label: 'Nur eine Zentrale oder Hotline', points: 1 },
      { label: 'Nein', points: 0 },
    ],
    hint: { title: 'Ein Name, eine Nummer', text: 'Ein fester Ansprechpartner, der Ihr Objekt kennt, spart Ihnen jede Woche Zeit und Nerven.' },
  },
  {
    q: 'Was passiert, wenn die Reinigungskraft krank ist?',
    answers: [
      { label: 'Ersatz kommt automatisch', points: 2 },
      { label: 'Ich muss nachfragen', points: 1 },
      { label: 'Dann fällt die Reinigung aus', points: 0 },
    ],
    hint: { title: 'Vertretung muss geregelt sein', text: 'Fällt jemand aus, sollte eine eingewiesene Ersatzkraft kommen, ohne dass Sie sich darum kümmern.' },
  },
  {
    q: 'Bekommen Sie schriftlich, was gereinigt wird?',
    answers: [
      { label: 'Ja, ein Leistungsverzeichnis', points: 2 },
      { label: 'Nur grob im Vertrag', points: 1 },
      { label: 'Nein', points: 0 },
    ],
    hint: { title: 'Leistungsverzeichnis Raum für Raum', text: 'Was drinsteht, wird gemacht. Ohne schriftliche Liste lässt sich Qualität nicht einfordern.' },
  },
  {
    q: 'Reinigt bei Ihnen meist dasselbe Team?',
    answers: [
      { label: 'Ja, immer dieselben', points: 2 },
      { label: 'Wechselt öfter', points: 1 },
      { label: 'Jede Woche jemand anderes', points: 0 },
    ],
    hint: { title: 'Feste Teams statt wechselnder Gesichter', text: 'Wer Ihr Objekt kennt, arbeitet gründlicher und geht mit Schlüsseln und Unterlagen sicherer um.' },
  },
  {
    q: 'Was passiert, wenn etwas nicht sauber ist?',
    answers: [
      { label: 'Es wird kurzfristig nachgereinigt', points: 2 },
      { label: 'Erst nach mehrmaligem Nachhaken', points: 1 },
      { label: 'Eigentlich gar nichts', points: 0 },
    ],
    hint: { title: 'Kostenlose Nachreinigung', text: 'Eine Reklamation sollte ein Anruf sein, kein Projekt. Nachgereinigt wird kurzfristig und kostenlos.' },
  },
  {
    q: 'Prüft Ihr Dienstleister die Qualität selbst?',
    answers: [
      { label: 'Ja, regelmäßig vor Ort', points: 2 },
      { label: 'Nur wenn ich mich beschwere', points: 1 },
      { label: 'Nie', points: 0 },
    ],
    hint: { title: 'Kontrollen ohne Ihr Zutun', text: 'Regelmäßige Qualitätskontrollen vor Ort sorgen dafür, dass das Niveau nach Monaten noch stimmt.' },
  },
  {
    q: 'Wie lange sind Sie an Ihren Vertrag gebunden?',
    answers: [
      { label: 'Kurzfristig kündbar', points: 2 },
      { label: 'Mehrere Monate', points: 1 },
      { label: 'Ein Jahr oder länger', points: 0 },
    ],
    hint: { title: 'Flexibel bleiben', text: 'Ein Dienstleister, der gut arbeitet, braucht keine lange Bindung. Bei uns ist der erste Monat jederzeit kündbar.' },
  },
]

export const checkResult = (percent: number) =>
  percent >= 80
    ? { title: 'Gut aufgestellt.', text: 'Ihre Reinigung läuft verlässlich. Wenn das so bleibt, gibt es keinen Grund zu wechseln. Die Punkte unten lohnen trotzdem einen Blick.' }
    : percent >= 50
      ? { title: 'Solide, mit Luft nach oben.', text: 'Vieles funktioniert, aber an einigen Stellen kostet Sie Ihre Reinigung mehr Aufmerksamkeit, als sie sollte.' }
      : { title: 'Hier geht deutlich mehr.', text: 'Sie kümmern sich um Dinge, um die sich Ihr Dienstleister kümmern sollte. Das lässt sich ändern, ohne Risiko.' }
