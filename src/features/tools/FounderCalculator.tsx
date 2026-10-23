import { useMemo } from 'react'
import { pricing } from '@/content/pricing'
import { formatEuro, formatEuro2, formatNumber } from '@/lib/format'
import { Button } from '@/components/ui/Button'
import { NumberInput, Toggle, useLocalState } from './ui'
import { EMPLOYER_SHARE, MIN_WAGE_CLEANING } from './OfferCompare'

/**
 * Startwerte nur aus belegbaren Quellen (siehe Seite):
 * - Stundenlohn: Branchenmindestlohn Gebäudereinigung, Lohngruppe 1, ab 01.01.2026
 * - Lohnnebenkosten: Arbeitgeberanteile Sozialversicherung 2026 (rund 21 %)
 * - Ausfallquote: gesetzlicher Mindesturlaub 20 Arbeitstage bei 5-Tage-Woche (rund 8 % von 250 Arbeitstagen),
 *   ohne Krankheit und Feiertage
 * Alle anderen Felder sind leer und werden von den Nutzern eingetragen.
 */
const initial = {
  wage: MIN_WAGE_CLEANING as number | null,
  charges: Math.round(EMPLOYER_SHARE * 100) as number | null,
  absence: 8 as number | null,
  material: null as number | null,
  travel: null as number | null,
  insurance: null as number | null,
  fixed: null as number | null,
  hours: null as number | null,
  markup: null as number | null,
  smallBusiness: false,
}

export function founderCalc(v: typeof initial) {
  const wage = v.wage ?? 0
  const labor = (wage * (1 + (v.charges ?? 0) / 100)) / Math.max(0.01, 1 - (v.absence ?? 0) / 100)
  const variable = labor + (v.material ?? 0)
  const fixedMonth = (v.travel ?? 0) + (v.insurance ?? 0) + (v.fixed ?? 0)
  const fixedPerHour = v.hours ? fixedMonth / v.hours : null
  const cost = fixedPerHour === null ? null : variable + fixedPerHour
  const rateNet = cost === null ? null : cost * (1 + (v.markup ?? 0) / 100)
  const rateGross = rateNet === null ? null : v.smallBusiness ? rateNet : rateNet * (1 + pricing.vatRate)
  const db = rateNet === null ? null : rateNet - variable
  return {
    labor,
    variable,
    fixedMonth,
    fixedPerHour,
    cost,
    rateNet,
    rateGross,
    db,
    dbMonth: db !== null && v.hours ? db * v.hours : null,
    profitMonth: rateNet !== null && cost !== null && v.hours ? (rateNet - cost) * v.hours : null,
    revenueMonth: rateNet !== null && v.hours ? rateNet * v.hours : null,
  }
}

/** Kalkulationsrechner für Gründer: nötiger Stundensatz und Deckungsbeitrag aus eigenen Annahmen */
export function FounderCalculator() {
  const [v, setV] = useLocalState('cs-founder-calc', initial)
  const set = (p: Partial<typeof initial>) => setV((x) => ({ ...x, ...p }))
  const r = useMemo(() => founderCalc(v), [v])
  const missing = !v.hours

  const lines: [string, string, boolean?][] = [
    ['Lohnkosten je produktiver Stunde', formatEuro2(r.labor)],
    ['+ Material je Stunde', formatEuro2(v.material ?? 0)],
    ['= Variable Kosten je Stunde', formatEuro2(r.variable), true],
    ['+ Fixkosten je verkaufter Stunde', r.fixedPerHour === null ? '–' : formatEuro2(r.fixedPerHour)],
    ['= Selbstkosten je Stunde', r.cost === null ? '–' : formatEuro2(r.cost), true],
    [`+ Aufschlag ${formatNumber(v.markup ?? 0)} %`, r.cost === null || r.rateNet === null ? '–' : formatEuro2(r.rateNet - r.cost)],
  ]

  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-14 lg:grid-cols-12">
      <div className="space-y-12 lg:col-span-7">
        <fieldset className="space-y-6">
          <legend className="flex w-full items-baseline gap-4 border-t border-line pt-6 text-[1.375rem] font-medium tracking-[-0.02em]">
            <span className="t-label">01</span>
            Personal
          </legend>
          <div className="grid grid-cols-1 gap-x-5 gap-y-6 sm:grid-cols-3">
            <NumberInput label="Stundenlohn brutto" unit="€" step={0.1} value={v.wage} onChange={(x) => set({ wage: x })} hint="Start: Branchenmindestlohn 2026" />
            <NumberInput label="Lohnnebenkosten" unit="%" value={v.charges} onChange={(x) => set({ charges: x })} hint="Start: AG-Anteile SV 2026, ohne Umlagen und BG" />
            <NumberInput label="Ausfallquote" unit="%" value={v.absence} onChange={(x) => set({ absence: x })} hint="Start: nur Mindesturlaub; Krankheit und Feiertage ergänzen" />
          </div>
        </fieldset>
        <fieldset className="space-y-6">
          <legend className="flex w-full items-baseline gap-4 border-t border-line pt-6 text-[1.375rem] font-medium tracking-[-0.02em]">
            <span className="t-label">02</span>
            Material
          </legend>
          <NumberInput label="Material und Verschleiß je Stunde" unit="€" step={0.1} value={v.material} onChange={(x) => set({ material: x })} className="sm:max-w-xs" />
        </fieldset>
        <fieldset className="space-y-6">
          <legend className="flex w-full items-baseline gap-4 border-t border-line pt-6 text-[1.375rem] font-medium tracking-[-0.02em]">
            <span className="t-label">03</span>
            Fixkosten pro Monat
          </legend>
          <div className="grid grid-cols-1 gap-x-5 gap-y-6 sm:grid-cols-3">
            <NumberInput label="Fahrzeug und Fahrten" unit="€" step={10} value={v.travel} onChange={(x) => set({ travel: x })} />
            <NumberInput label="Versicherungen" unit="€" step={10} value={v.insurance} onChange={(x) => set({ insurance: x })} />
            <NumberInput
              label="Sonstige Fixkosten"
              unit="€"
              step={50}
              value={v.fixed}
              onChange={(x) => set({ fixed: x })}
              hint="Büro, Software, Beratung, Werbung, Ihr eigenes Gehalt"
            />
          </div>
        </fieldset>
        <fieldset className="space-y-6">
          <legend className="flex w-full items-baseline gap-4 border-t border-line pt-6 text-[1.375rem] font-medium tracking-[-0.02em]">
            <span className="t-label">04</span>
            Planung
          </legend>
          <div className="grid grid-cols-1 gap-x-5 gap-y-6 sm:grid-cols-2">
            <NumberInput label="Verkaufte Stunden pro Monat" unit="Std." step={10} value={v.hours} onChange={(x) => set({ hours: x })} />
            <NumberInput label="Aufschlag für Gewinn und Wagnis" unit="%" value={v.markup} onChange={(x) => set({ markup: x })} />
          </div>
          <Toggle label="Kleinunternehmerregelung (ohne Umsatzsteuer)" checked={v.smallBusiness} onChange={(x) => set({ smallBusiness: x })} />
        </fieldset>
        <button
          type="button"
          onClick={() => setV(initial)}
          className="ulink py-1 text-[0.9375rem] text-muted hover:text-ink"
        >
          Zurücksetzen
        </button>
      </div>

      <div className="space-y-10 lg:sticky lg:top-28 lg:col-span-5 lg:self-start">
        <section aria-live="polite" aria-labelledby="fc-result" className="on-dark bg-night p-6 text-paper sm:p-10">
          <h2 id="fc-result" className="t-label">
            Nötiger Stundensatz
          </h2>
          <p className="t-num mt-4">{r.rateNet === null ? '–' : formatEuro2(r.rateNet)}</p>
          <p className="mt-3 text-muted-dark">
            netto{r.rateGross !== null && !v.smallBusiness ? `, ${formatEuro2(r.rateGross)} brutto` : v.smallBusiness ? ', ohne Umsatzsteuer' : ''}
          </p>
          {missing && (
            <p className="mt-6 border-l border-paper/40 pl-4 text-[0.9375rem] text-paper">Tragen Sie die verkauften Stunden pro Monat ein, um Fixkosten und Stundensatz zu berechnen.</p>
          )}
          <dl className="mt-8 border-t border-line-dark text-[0.9375rem]">
            {lines.map(([k, val, strong]) => (
              <div key={k} className="flex justify-between gap-4 border-b border-line-dark py-2.5">
                <dt className={strong ? 'font-medium text-paper' : 'text-muted-dark'}>{k}</dt>
                <dd className={strong ? 'font-medium whitespace-nowrap tabular-nums' : 'whitespace-nowrap text-paper tabular-nums'}>{val}</dd>
              </div>
            ))}
          </dl>
          <dl className="mt-8 grid grid-cols-1 gap-x-5 gap-y-6 min-[360px]:grid-cols-2">
            {[
              ['Deckungsbeitrag je Stunde', r.db === null ? '–' : formatEuro2(r.db)],
              ['Deckungsbeitrag im Monat', r.dbMonth === null ? '–' : formatEuro(r.dbMonth)],
              ['Umsatz netto im Monat', r.revenueMonth === null ? '–' : formatEuro(r.revenueMonth)],
              ['Gewinn vor Steuern im Monat', r.profitMonth === null ? '–' : formatEuro(r.profitMonth)],
            ].map(([k, val]) => (
              <div key={k} className="border-t border-line-dark pt-3">
                <dt className="font-mono text-[0.75rem] leading-snug text-muted-dark">{k}</dt>
                <dd className="mt-2 text-[1.375rem] font-medium tracking-[-0.02em] tabular-nums">{val}</dd>
              </div>
            ))}
          </dl>
        </section>
        <p className="border-t border-line pt-5 text-[0.9375rem] leading-relaxed text-ink-2">
          <span>
            <strong className="font-medium text-ink">Beispielrechnung, keine Prognose.</strong> Das Ergebnis hängt allein von Ihren Eingaben ab. Es ist keine Zusage von Umsatz, Gewinn oder Einkommen und ersetzt
            keine Steuer- oder Unternehmensberatung.
          </span>
        </p>
        <div className="border-t border-line pt-5">
          <p className="t-h4">Nicht alles allein aufbauen?</p>
          <p className="mt-2 text-ink-2">Mit unserem Partnerprogramm nutzen Sie erprobte Abläufe, Vorlagen und Werkzeuge aus unserem Betrieb in Offenburg.</p>
          <Button to="/partner" variant="link" className="mt-5">
            Partnerprogramm ansehen
          </Button>
        </div>
      </div>
    </div>
  )
}
