import { ToolPage } from './ToolPage'
import { FounderCalculator } from '@/features/tools/FounderCalculator'

export default function FounderCalcPage() {
  return (
    <ToolPage
      path="/reinigungsfirma-kalkulieren"
      name="Kalkulationsrechner für Reinigungsfirmen"
      seoTitle="Reinigungsfirma kalkulieren: Rechner"
      description="Kalkulationsrechner für Gründer: Stundensatz und Deckungsbeitrag einer Reinigungsfirma aus eigenen Annahmen berechnen. Mindestlohn 2026 als Startwert."
      eyebrow="Für Gründer"
      title="Was muss eine Reinigungsstunde kosten?"
      lead="Geben Sie Ihre eigenen Annahmen ein: Lohn, Nebenkosten, Ausfallzeiten, Material, Fixkosten und Aufschlag. Der Rechner zeigt den nötigen Stundensatz und den Deckungsbeitrag. Startwerte gibt es nur dort, wo es eine belegbare Quelle gibt."
      answer="Den Stundensatz einer Reinigungsfirma berechnen Sie aus den Lohnkosten je produktiver Stunde, dem Material, den auf die verkauften Stunden umgelegten Fixkosten und einem Aufschlag für Gewinn und Wagnis. Allein der Branchenmindestlohn von 15,00 € ergibt mit Arbeitgeberanteilen und Urlaub schon rund 20 € Lohnkosten je gearbeiteter Stunde."
      ogType="partner"
      faqs={[
        {
          q: 'Welche Startwerte nutzt der Kalkulationsrechner?',
          a: 'Der Kalkulationsrechner nutzt nur belegbare Startwerte: den Branchenmindestlohn der Gebäudereinigung von 15,00 € ab 2026, rund 21 % Arbeitgeberanteile zur Sozialversicherung und 8 % Ausfall für den gesetzlichen Mindesturlaub. Alle anderen Werte tragen Sie selbst ein.',
        },
        {
          q: 'Was ist der Deckungsbeitrag?',
          a: 'Der Deckungsbeitrag ist der Stundensatz netto minus die variablen Kosten, also Lohnkosten und Material. Aus ihm werden Fixkosten und Gewinn bezahlt.',
        },
        {
          q: 'Ist das Ergebnis eine Prognose?',
          a: 'Nein, das Ergebnis ist eine Beispielrechnung auf Basis Ihrer Eingaben und keine Prognose oder Zusage von Umsatz, Gewinn oder Einkommen.',
        },
      ]}
      sources={[
        {
          title: 'Verordnung über zwingende Arbeitsbedingungen in der Gebäudereinigung',
          publisher: 'gesetze-im-internet.de',
          url: 'https://www.gesetze-im-internet.de/tvmindestlohngeb_ude_2024/',
          stand: 'Lohngruppe 1 ab 01.01.2026: 15,00 €',
        },
        {
          title: 'Aktuelle Beitragssätze in der Sozialversicherung',
          publisher: 'Techniker Krankenkasse',
          url: 'https://www.tk.de/firmenkunden/versicherung/beitraege-faq/beitragssaetze/aktuelle-beitragssaetze-in-der-sozialversicherung-2031554',
          stand: '2026 (RV 18,6 %, KV 14,6 % + Ø 2,9 %, PV 3,6 %, AV 2,6 %; je zur Hälfte, PV-Arbeitgeber 1,8 %)',
        },
        {
          title: '§ 3 Bundesurlaubsgesetz (24 Werktage, bei 5-Tage-Woche 20 Arbeitstage)',
          publisher: 'gesetze-im-internet.de',
          url: 'https://www.gesetze-im-internet.de/burlg/__3.html',
          stand: 'abgerufen Oktober 2026',
        },
      ]}
      links={[
        { to: '/ratgeber/reinigungsfirma-kalkulieren', label: 'Ratgeber: Stundensatz berechnen' },
        { to: '/ratgeber/reinigungsfirma-gruenden', label: 'Reinigungsfirma gründen' },
        { to: '/ratgeber/erste-kunden-reinigungsfirma', label: 'Erste Kunden gewinnen' },
        { to: '/partner', label: 'Partnerprogramm' },
      ]}
    >
      <FounderCalculator />
    </ToolPage>
  )
}
