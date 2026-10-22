import { useMemo, useState } from 'react'
import { Info, RotateCcw, Scale } from 'lucide-react'
import { pricing } from '@/content/pricing'
import { formatEuro, formatEuro2, formatNumber } from '@/lib/format'
import { cn } from '@/lib/cn'
import { QuoteButton } from '@/features/configurator/QuoteLink'
import { NumberInput, Segmented, TextInput, Toggle, useLocalState } from './ui'

/** Branchenmindestlohn Gebäudereinigung, Lohngruppe 1, ab 01.01.2026 (Quelle siehe Seite) */
export const MIN_WAGE_CLEANING = 15
/** Arbeitgeberanteile Sozialversicherung 2026, gerundet (Quelle siehe Seite) */
export const EMPLOYER_SHARE = 0.21

const SERVICES = [
  'Arbeitsplätze und Böden',
  'Sanitärräume',
  'Teeküche',
  'Kontaktflächen (Klinken, Schalter)',
  'Verbrauchsmaterial auffüllen',
  'Fensterreinigung',
  'Grundreinigung',
  'Schriftliches Leistungsverzeichnis',
  'Eigene Qualitätskontrolle',
] as const

type Offer = {
  name: string
  mode: 'stunde' | 'monat'
  vat: 'netto' | 'brutto'
  rate: number | null
  monthly: number | null
  hours: number | null
  staff: number | null
  visits: number | null
  services: string[]
  notice: number | null
  contact: boolean
  replacement: boolean
}

const empty = (name: string): Offer => ({
  name,
  mode: 'stunde',
  vat: 'netto',
  rate: null,
  monthly: null,
  hours: null,
  staff: 1,
  visits: null,
  services: [],
  notice: null,
  contact: false,
  replacement: false,
})

const LETTERS = ['A', 'B', 'C']
const initial = { offers: [empty('Angebot A'), empty('Angebot B'), empty('Angebot C')], employees: null as number | null }

type Result = {
  label: string
  ok: boolean
  hoursMonth: number | null
  netMonth: number | null
  effRate: number | null
  perEmpDay: number | null
  o: Offer
}

const net = (v: number, vat: Offer['vat']) => (vat === 'brutto' ? v / (1 + pricing.vatRate) : v)

function evaluate(o: Offer, i: number, employees: number | null): Result {
  const hoursMonth = o.hours && o.staff && o.visits ? o.hours * o.staff * o.visits * pricing.weeksPerMonth : null
  let netMonth: number | null = null
  if (o.mode === 'stunde' && o.rate && hoursMonth) netMonth = net(o.rate, o.vat) * hoursMonth
  if (o.mode === 'monat' && o.monthly) netMonth = net(o.monthly, o.vat)
  const effRate = netMonth && hoursMonth ? netMonth / hoursMonth : null
  const perEmpDay = netMonth && employees ? netMonth / (employees * pricing.workdaysPerMonth) : null
  return { label: o.name.trim() || `Angebot ${LETTERS[i]}`, ok: netMonth !== null, hoursMonth, netMonth, effRate, perEmpDay, o }
}

/** Neutrale Hinweise aus dem Vergleich. Kein Schlechtmachen, nur Fakten und Fragen. */
function hints(rs: Result[]) {
  const out: string[] = []
  const valid = rs.filter((r) => r.ok)
  if (valid.length < 2) return out
  const cheapest = [...valid].sort((a, b) => a.netMonth! - b.netMonth!)[0]
  const others = valid.filter((r) => r !== cheapest)
  out.push(`${cheapest.label} ist mit ${formatEuro(cheapest.netMonth!)} netto pro Monat das günstigste Angebot.`)
  const missing: string[] = []
  if (!cheapest.o.replacement && others.some((r) => r.o.replacement)) missing.push('keine Vertretungsregelung bei Ausfall')
  if (!cheapest.o.contact && others.some((r) => r.o.contact)) missing.push('keinen festen Ansprechpartner')
  const lacking = SERVICES.filter((s) => !cheapest.o.services.includes(s) && others.some((r) => r.o.services.includes(s)))
  if (lacking.length) missing.push(`nicht: ${lacking.join(', ')}`)
  if (missing.length) out.push(`${cheapest.label} enthält aber ${missing.join('; ')}. Fragen Sie nach, ob das nachträglich dazukommen kann und was es kostet.`)
  const withHours = valid.filter((r) => r.hoursMonth)
  if (withHours.length >= 2) {
    const max = Math.max(...withHours.map((r) => r.hoursMonth!))
    for (const r of withHours) {
      const diff = 1 - r.hoursMonth! / max
      if (diff >= 0.2)
        out.push(
          `${r.label} plant rund ${Math.round(diff * 100)} % weniger Stunden als das Angebot mit den meisten Stunden. Prüfen Sie, ob derselbe Leistungsumfang enthalten ist oder ob Intervalle gekürzt wurden.`,
        )
    }
  }
  const floor = MIN_WAGE_CLEANING * (1 + EMPLOYER_SHARE)
  for (const r of valid)
    if (r.effRate && r.effRate < floor)
      out.push(
        `Der effektive Stundensatz von ${r.label} (${formatEuro2(r.effRate)} netto) liegt unter den reinen Lohnkosten zum Branchenmindestlohn (${formatEuro2(MIN_WAGE_CLEANING)} plus rund 21 % Arbeitgeberanteile, zusammen ${formatEuro2(floor)}). Fragen Sie nach, wie die Stunden gerechnet sind.`,
      )
  const notices = valid.filter((r) => r.o.notice !== null)
  if (notices.length >= 2) {
    const longest = [...notices].sort((a, b) => b.o.notice! - a.o.notice!)[0]
    const shortest = [...notices].sort((a, b) => a.o.notice! - b.o.notice!)[0]
    if (longest.o.notice! > shortest.o.notice!)
      out.push(`${longest.label} hat mit ${formatNumber(longest.o.notice!)} Monaten die längste Kündigungsfrist. Das bindet Sie länger, falls die Qualität nicht stimmt.`)
  }
  return out
}

/** Angebots-Vergleich: bis zu drei Angebote auf einheitliche Werte umrechnen. Alles bleibt im Browser. */
export function OfferCompare() {
  const [state, setState] = useLocalState('cs-offer-compare', initial)
  const [tab, setTab] = useState(0)
  const results = useMemo(() => state.offers.map((o, i) => evaluate(o, i, state.employees)), [state])
  const notes = useMemo(() => hints(results), [results])
  const o = state.offers[tab]
  const set = (patch: Partial<Offer>) => setState((s) => ({ ...s, offers: s.offers.map((x, i) => (i === tab ? { ...x, ...patch } : x)) }))
  const valid = results.filter((r) => r.ok)
  const best = valid.length >= 2 ? Math.min(...valid.map((r) => r.netMonth!)) : null

  const rows: { label: string; get: (r: Result) => string }[] = [
    { label: 'Monatspreis netto', get: (r) => (r.netMonth ? formatEuro(r.netMonth) : '–') },
    { label: 'Stunden pro Monat', get: (r) => (r.hoursMonth ? formatNumber(Math.round(r.hoursMonth * 10) / 10) : '–') },
    { label: 'Effektiver Stundensatz netto', get: (r) => (r.effRate ? formatEuro2(r.effRate) : '–') },
    { label: 'Pro Mitarbeiter und Arbeitstag', get: (r) => (r.perEmpDay ? formatEuro2(r.perEmpDay) : '–') },
    { label: 'Kündigungsfrist', get: (r) => (r.o.notice !== null ? `${formatNumber(r.o.notice)} Mon.` : '–') },
    { label: 'Fester Ansprechpartner', get: (r) => (r.o.contact ? 'Ja' : 'Nein') },
    { label: 'Vertretung bei Ausfall', get: (r) => (r.o.replacement ? 'Ja' : 'Nein') },
    { label: 'Leistungen enthalten', get: (r) => `${r.o.services.length} von ${SERVICES.length}` },
  ]

  return (
    <div className="space-y-8">
      <div className="rounded-panel bg-white p-5 shadow-soft ring-1 ring-line sm:p-8">
        <div role="tablist" aria-label="Angebot auswählen" className="grid grid-cols-3 gap-1.5 rounded-2xl bg-glacier p-1.5">
          {state.offers.map((x, i) => (
            <button
              key={i}
              role="tab"
              type="button"
              aria-selected={tab === i}
              aria-controls="offer-panel"
              onClick={() => setTab(i)}
              className={cn(
                'min-h-11 truncate rounded-xl px-1.5 text-[0.8125rem] font-semibold transition min-[360px]:px-2 min-[360px]:text-sm',
                tab === i ? 'bg-white text-blue-hover shadow-soft' : 'text-ink/70 hover:text-ink',
              )}
            >
              {!x.name.trim() || x.name.trim() === `Angebot ${LETTERS[i]}` ? (
                <>
                  <span className="max-[359px]:hidden">Angebot </span>
                  {LETTERS[i]}
                </>
              ) : (
                x.name.trim()
              )}
            </button>
          ))}
        </div>

        <div id="offer-panel" role="tabpanel" className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
          <TextInput label="Anbieter" value={o.name} onChange={(v) => set({ name: v })} placeholder={`Angebot ${LETTERS[tab]}`} className="md:col-span-2" />
          <Segmented
            label="Preis laut Angebot"
            value={o.mode}
            onChange={(v) => set({ mode: v })}
            options={[
              { id: 'stunde', label: 'Stundensatz' },
              { id: 'monat', label: 'Monatspreis' },
            ]}
          />
          <Segmented
            label="Preisangabe"
            value={o.vat}
            onChange={(v) => set({ vat: v })}
            options={[
              { id: 'netto', label: 'netto' },
              { id: 'brutto', label: 'brutto' },
            ]}
          />
          {o.mode === 'stunde' ? (
            <NumberInput label="Stundensatz" unit="€/Std." step={0.5} value={o.rate} onChange={(v) => set({ rate: v })} />
          ) : (
            <NumberInput label="Monatspreis" unit="€" step={10} value={o.monthly} onChange={(v) => set({ monthly: v })} />
          )}
          <NumberInput label="Stunden pro Einsatz" unit="Std." step={0.25} value={o.hours} onChange={(v) => set({ hours: v })} />
          <NumberInput label="Anzahl Reinigungskräfte" unit="Kräfte" value={o.staff} onChange={(v) => set({ staff: v })} />
          <NumberInput label="Einsätze pro Woche" unit="× / Woche" value={o.visits} onChange={(v) => set({ visits: v })} />
          <NumberInput label="Kündigungsfrist" unit="Monate" step={0.5} value={o.notice} onChange={(v) => set({ notice: v })} />
          <div className="grid gap-2 md:col-span-2 md:grid-cols-2">
            <Toggle label="Fester Ansprechpartner" checked={o.contact} onChange={(v) => set({ contact: v })} />
            <Toggle label="Vertretung bei Ausfall" checked={o.replacement} onChange={(v) => set({ replacement: v })} />
          </div>
          <fieldset className="md:col-span-2">
            <legend className="mb-2 text-sm font-medium text-ink">Leistungen laut Angebot</legend>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {SERVICES.map((s) => {
                const on = o.services.includes(s)
                return (
                  <label key={s} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl bg-white px-3.5 py-2 ring-1 ring-line">
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={() => set({ services: on ? o.services.filter((x) => x !== s) : [...o.services, s] })}
                      className="size-4 shrink-0 accent-blue"
                    />
                    <span className="text-sm leading-snug">{s}</span>
                  </label>
                )
              })}
            </div>
          </fieldset>
        </div>

        <div className="mt-6 flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-end sm:justify-between">
          <NumberInput
            label="Mitarbeitende im Büro (für Kosten pro Kopf)"
            unit="Personen"
            value={state.employees}
            onChange={(v) => setState((s) => ({ ...s, employees: v }))}
            className="sm:max-w-xs"
          />
          <button
            type="button"
            onClick={() => {
              setState(initial)
              setTab(0)
            }}
            className="inline-flex min-h-11 items-center gap-2 self-start rounded-full px-3 text-sm font-semibold text-muted transition hover:text-ink active:bg-ink/5"
          >
            <RotateCcw aria-hidden className="size-4" />
            Alle Eingaben löschen
          </button>
        </div>
      </div>

      <section aria-labelledby="cmp-result" className="rounded-panel bg-ink p-5 text-white sm:p-8">
        <h2 id="cmp-result" className="flex items-center gap-2 text-xl font-semibold tracking-tight">
          <Scale aria-hidden className="size-5 text-fresh" />
          Vergleich
        </h2>
        <p className="mt-1 text-sm text-white/65">Alle Preise netto, umgerechnet mit {formatNumber(pricing.weeksPerMonth)} Wochen pro Monat.</p>
        <dl className="mt-6 divide-y divide-white/10">
          <div className="grid grid-cols-3 gap-2 pb-3 text-xs font-semibold tracking-wide text-white/60 uppercase sm:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <span className="hidden sm:block" />
            {results.map((r, i) => (
              <span key={i} className="truncate">
                {r.label}
              </span>
            ))}
          </div>
          {rows.map((row) => (
            <div key={row.label} className="grid grid-cols-3 gap-x-2 gap-y-1 py-3 sm:grid-cols-[1.4fr_1fr_1fr_1fr]">
              <dt className="col-span-3 text-sm text-white/70 sm:col-span-1">{row.label}</dt>
              {results.map((r, i) => (
                <dd
                  key={i}
                  className={cn('text-[0.9375rem] font-semibold tabular-nums', row.label === 'Monatspreis netto' && best !== null && r.netMonth === best && 'text-fresh')}
                >
                  {row.get(r)}
                </dd>
              ))}
            </div>
          ))}
        </dl>
        {notes.length > 0 ? (
          <ul className="mt-6 space-y-3">
            {notes.map((n) => (
              <li key={n} className="flex gap-3 rounded-2xl bg-white/5 p-4 text-sm leading-relaxed text-white/85 ring-1 ring-white/10">
                <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-fresh" />
                {n}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-6 text-sm text-white/65">Tragen Sie mindestens zwei Angebote ein, dann erscheinen hier neutrale Hinweise zu den Unterschieden.</p>
        )}
      </section>

      <div className="flex flex-col gap-4 rounded-panel bg-glacier p-6 ring-1 ring-line sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <p className="text-lg font-semibold tracking-tight">Möchten Sie uns als viertes Angebot dazunehmen?</p>
          <p className="mt-1 text-sm text-muted">Kostenlose Besichtigung, Angebot mit Leistungsverzeichnis in 48 Stunden. Im ersten Monat jederzeit kündbar.</p>
        </div>
        <QuoteButton arrow wrapClassName="shrink-0">
          Angebot anfragen
        </QuoteButton>
      </div>
    </div>
  )
}
