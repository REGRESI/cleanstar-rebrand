/**
 * Antwort-zuerst-Blöcke: Auf den wichtigsten Seiten steht direkt unter der Überschrift ein klar zitierbarer Absatz
 * (130 bis 170 Wörter), der die Hauptfrage der Seite beantwortet, dazu eine kurze Faktenliste.
 * Nur bestätigte Fakten aus company.ts, pricing.ts, services.ts und places.ts.
 * Wortzahl prüfen: node scripts/answer-length.mjs (nach npm run build)
 */
import { company } from './company'
import { pricing } from './pricing'
import { places } from './places'
import type { Service } from './services'

const rate = `${pricing.hourlyRateGrossMin} bis ${pricing.hourlyRateGrossMax} € brutto`
const founders = company.founders.map((f) => f.name).filter(Boolean) as string[]
const join = (a: string[]) => a.join(', ').replace(/, ([^,]*)$/, ' und $1')

export interface PageAnswer {
  question: string
  text: string
}

export const answers: Record<'home' | 'leistungen' | 'garantie' | 'ablauf' | 'faq' | 'fakten', PageAnswer> = {
  home: {
    question: 'Was macht CleanStar?',
    text: `CleanStar ist eine Reinigungsfirma aus ${company.seat}, die sich auf Büroreinigung für Unternehmen im ${company.serviceArea} spezialisiert hat. Gegründet wurde sie ${company.foundedYear} von ${join(founders)}, die den Betrieb selbst führen. Gereinigt wird nach einem schriftlichen Leistungsverzeichnis, das wir nach einer kostenlosen Besichtigung vor Ort mit Ihnen festlegen. Das Angebot erhalten Sie innerhalb von ${company.promises.offerHours} Stunden. Abgerechnet wird nach Mitarbeiterstunden, nicht nach Quadratmetern; der Stundensatz liegt bei ${rate}. In Ihren Räumen arbeitet ein festes Team, das Ihr Objekt kennt, und Ihre Ansprechperson ist rund um die Uhr erreichbar. Fällt jemand aus, übernimmt eine eingewiesene Vertretung. Neben der Büroreinigung übernehmen wir Unterhalts-, Fenster-, Treppenhaus-, Hallen- und Hygienereinigung. Im ersten Monat können Sie ohne Frist kündigen, danach gilt ein Monat zum Ende des Folgemonats. Unser Sitz ist die ${company.address.street} in ${company.seat}.`,
  },
  leistungen: {
    question: 'Welche Reinigungsleistungen bietet CleanStar an?',
    text: `CleanStar bietet Unternehmen im ${company.serviceArea} sechs Reinigungsleistungen aus einer Hand: Büroreinigung, Unterhaltsreinigung, Fensterreinigung, Treppenhausreinigung, Hallenreinigung und Hygienereinigung. Der Schwerpunkt liegt auf der regelmäßigen Büroreinigung, also Arbeitsplätzen, Besprechungsräumen, Teeküchen und Sanitärräumen nach festem Plan. Die Unterhaltsreinigung hält Praxen, Kanzleien und Verwaltungen dauerhaft gepflegt. Fenster und Glasflächen, Treppenhäuser, Lager- und Produktionshallen sowie Sanitär- und Sozialräume mit besonderen Hygieneanforderungen kommen dazu, wenn Sie sie brauchen. Alle Leistungen laufen über dieselbe Ansprechperson und stehen in einem schriftlichen Leistungsverzeichnis, das wir nach einer kostenlosen Besichtigung erstellen. Abgerechnet wird nach Stunden zu ${rate} je Mitarbeiterstunde, das Angebot kommt innerhalb von ${company.promises.offerHours} Stunden. Für jede Leistung gilt die Qualitätsgarantie: Passt etwas nicht, reinigen wir kostenlos nach. Mehrere Leistungen lassen sich kombinieren, etwa die Büroreinigung mit der Fensterreinigung, und stehen dann gemeinsam in einem Angebot und einem Leistungsverzeichnis.`,
  },
  garantie: {
    question: 'Was garantiert CleanStar?',
    text: `Die Qualitätsgarantie von CleanStar besteht aus acht Zusagen, an denen Sie uns messen können. Die wichtigste: Ist etwas nicht sauber, melden Sie es, und wir reinigen kostenlos nach und klären die Ursache mit dem Team, damit es nicht wieder vorkommt. Außerdem kontrollieren wir die Arbeit regelmäßig selbst vor Ort, anhand einer Checkliste, die auf Ihr Leistungsverzeichnis abgestimmt ist, und nicht erst nach einer Beschwerde. Sie haben eine feste Ansprechperson mit direkter Nummer, und bei Urlaub oder Krankheit übernimmt eine eingewiesene Vertretung. Schlüssel und Zugänge übergeben wir mit Protokoll, in Ihren Räumen arbeiten wir verschwiegen und diskret. CleanStar ist über eine Betriebshaftpflicht versichert. Überzeugt Sie die Arbeit im ersten Monat nicht, kündigen Sie ohne Frist und ohne Begründung. Danach gilt eine Kündigungsfrist von einem Monat zum Ende des Folgemonats. Alle acht Zusagen mit ihren Bedingungen finden Sie unten auf dieser Seite.`,
  },
  ablauf: {
    question: 'Wie läuft die Zusammenarbeit mit CleanStar ab?',
    text: `Die Zusammenarbeit beginnt mit einer Anfrage über den Konfigurator, per Telefon oder E-Mail; wir melden uns innerhalb von ${company.promises.responseHours} Stunden. Danach sehen wir uns Ihre Räume kostenlos vor Ort an, fragen nach Ihren Abläufen und klären Zugang, Schlüssel und Zeiten. Innerhalb von ${company.promises.offerHours} Stunden erhalten Sie ein schriftliches Angebot mit Leistungsverzeichnis, Intervallen und Preisen. Sagen Sie zu, beginnt Ihr festes Team zum vereinbarten Termin, Schlüsselübergabe und Ansprechperson werden dokumentiert. Der erste Monat ist eine Probezeit für Sie: Sie können jederzeit ohne Frist kündigen. Im laufenden Betrieb prüfen wir das Ergebnis selbst mit Checklisten und stimmen uns regelmäßig mit Ihnen ab. Ihr eigener Aufwand beschränkt sich auf das Erstgespräch und den Besichtigungstermin. Wechseln Sie von einem anderen Anbieter, zeigt der Wechsel-Rechner den frühesten Starttermin ohne Lücke in der Reinigung. Die einzelnen Schritte sehen Sie unten im Detail.`,
  },
  faq: {
    question: 'Was sollten Sie vor der Beauftragung wissen?',
    text: `Die meisten Fragen an CleanStar betreffen Kosten, Vertrag, Ablauf und Zuverlässigkeit. Die Kosten richten sich nach den Stunden, die Ihr Objekt braucht: Der Stundensatz liegt bei ${rate} je Mitarbeiterstunde. Einen pauschalen Quadratmeterpreis gibt es nicht, weil Nutzung und Ausstattung den Aufwand stärker bestimmen als die Fläche. Wie viele Stunden nötig sind, klären wir bei einer kostenlosen Besichtigung; das schriftliche Angebot folgt innerhalb von ${company.promises.offerHours} Stunden. Im ersten Monat können Sie ohne Frist kündigen, danach mit einem Monat zum Ende des Folgemonats. In Ihren Räumen arbeitet immer dasselbe Team, bei Ausfall übernimmt eine eingewiesene Vertretung. Ihre Ansprechperson erreichen Sie direkt und rund um die Uhr. Wir reinigen von ${company.seat} aus in ${places.length} Orten im ${company.serviceArea}. Weitere Antworten finden Sie unten, nach Themen sortiert. Fehlt Ihre Frage, rufen Sie uns an oder schreiben Sie uns.`,
  },
  fakten: {
    question: 'Was ist CleanStar?',
    text: `${company.legalName} ist eine Reinigungsfirma mit Sitz in ${company.seat}, ${company.address.street}. Das Unternehmen wurde ${company.foundedYear} von ${join(founders)} gegründet und hat sich auf Büroreinigung für Unternehmen im ${company.serviceArea} spezialisiert. Weitere Leistungen sind Unterhalts-, Fenster-, Treppenhaus-, Hallen- und Hygienereinigung. CleanStar arbeitet mit festen Teams und einer festen Ansprechperson; fällt eine Reinigungskraft aus, übernimmt eine eingewiesene Ersatzkraft. Abgerechnet wird nach Mitarbeiterstunden zu ${rate}. Die Objektbesichtigung ist kostenlos, das schriftliche Angebot folgt innerhalb von ${company.promises.offerHours} Stunden. Im ersten Monat ist der Vertrag ohne Frist kündbar, danach mit einem Monat zum Ende des Folgemonats. CleanStar ist rund um die Uhr telefonisch und per E-Mail erreichbar und antwortet innerhalb von ${company.promises.responseHours} Stunden. Das Team bringt über ${company.yearsOfExperience} Jahre Erfahrung in der Reinigung mit. Alle Angaben auf dieser Seite stammen aus denselben Daten wie Impressum und Angebote.`,
  },
}

/** Antwort für eine Leistungsseite, zusammengesetzt aus den Inhaltsdaten der Leistung */
export function serviceAnswer(s: Service): PageAnswer {
  const scope = join(s.scope.map((g) => g.title))
  const fit = join(s.suitableFor.map((x) => x.replace(/ \(.*\)$/, '')))
  const rhythm = join(s.intervals.map((i) => i.label.toLowerCase()))
  return {
    question: `Was umfasst die ${s.name} bei CleanStar?`,
    text: `${s.intro} Zum Leistungsumfang gehören ${scope}. Typische Objekte sind ${fit}. Übliche Rhythmen sind ${rhythm}; den genauen Takt legen wir nach Ihrem Bedarf fest. Vor dem Start sehen wir uns Ihre Räume kostenlos an und schicken Ihnen innerhalb von ${company.promises.offerHours} Stunden ein schriftliches Angebot mit Leistungsverzeichnis. Abgerechnet wird nach Stunden zu ${rate} je Mitarbeiterstunde. Ein festes Team übernimmt die Arbeit, bei Ausfall springt eine eingewiesene Vertretung ein, und im ersten Monat können Sie ohne Frist kündigen. Alle Arbeiten stehen im Leistungsverzeichnis, an dem Sie das Ergebnis jederzeit messen können.`,
  }
}
