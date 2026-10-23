import { useEffect, useMemo, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { company } from '@/content/company'
import { cn } from '@/lib/cn'
import { QuoteButton } from '@/features/configurator/QuoteLink'
import { DateInput, NumberInput, SelectInput, Segmented, TextInput, useLocalState } from './ui'

type Notice = '2w' | '4w' | '1m' | '2m' | '3m' | '6m'
type Term = 'tag' | 'monat' | 'quartal'
type Kind = 'unbefristet' | 'befristet'

const notices: { id: Notice; label: string }[] = [
  { id: '2w', label: '2 Wochen' },
  { id: '4w', label: '4 Wochen' },
  { id: '1m', label: '1 Monat' },
  { id: '2m', label: '2 Monate' },
  { id: '3m', label: '3 Monate' },
  { id: '6m', label: '6 Monate' },
]

const day = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
const endOfMonth = (y: number, m: number) => new Date(y, m + 1, 0)
const isMonthEnd = (d: Date) => d.getDate() === endOfMonth(d.getFullYear(), d.getMonth()).getDate()
/** Monate addieren, Tag auf das Monatsende begrenzen */
const addMonths = (d: Date, n: number) => {
  const last = endOfMonth(d.getFullYear(), d.getMonth() + n).getDate()
  return new Date(d.getFullYear(), d.getMonth() + n, Math.min(d.getDate(), last))
}
// Tag, Monat und Jahr nie trennen: „30. November 2026“
const fmt = (d: Date) => d.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).replace(/(\d+\.) (\S+) (\d{4})/, '$1\u00A0$2\u00A0$3')
const fmtShort = (d: Date) => d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })

/** Spätester Zugang der Kündigung für ein Vertragsende */
function latestNotice(end: Date, n: Notice) {
  if (n === '2w') return addDays(end, -14)
  if (n === '4w') return addDays(end, -28)
  const m = Number(n[0])
  return isMonthEnd(end) ? endOfMonth(end.getFullYear(), end.getMonth() - m) : addMonths(end, -m)
}

export function computeSwitch(opts: { today: Date; kind: Kind; notice: Notice; term: Term; start: string; months: number | null; renew: number | null }) {
  const today = day(opts.today)
  const ok = (end: Date) => latestNotice(end, opts.notice) >= today
  let end: Date | null = null
  if (opts.kind === 'befristet') {
    if (!opts.start || !opts.months) return null
    const s = new Date(opts.start + 'T12:00:00')
    let e = addDays(addMonths(day(s), opts.months), -1)
    for (let i = 0; i < 200 && !ok(e); i++) {
      if (!opts.renew) return { end: null, expired: true }
      e = addDays(addMonths(addDays(e, 1), opts.renew), -1)
    }
    end = e
  } else if (opts.term === 'tag') {
    // Kündigung zu jedem Tag: Ende = heute plus Frist
    if (opts.notice === '2w') end = addDays(today, 14)
    else if (opts.notice === '4w') end = addDays(today, 28)
    else end = addMonths(today, Number(opts.notice[0]))
  } else {
    for (let i = 0; i < 40; i++) {
      const e = endOfMonth(today.getFullYear(), today.getMonth() + i)
      if (opts.term === 'quartal' && e.getMonth() % 3 !== 2) continue
      if (ok(e)) {
        end = e
        break
      }
    }
  }
  if (!end) return null
  const noticeBy = opts.kind === 'unbefristet' && opts.term === 'tag' ? today : latestNotice(end, opts.notice)
  return { end, noticeBy, first: addDays(end, 1), daysLeft: Math.round((noticeBy.getTime() - today.getTime()) / 86400000), expired: false }
}

const initial = {
  kind: 'unbefristet' as Kind,
  notice: '1m' as Notice,
  term: 'monat' as Term,
  start: '',
  months: 12 as number | null,
  renew: 12 as number | null,
  me: '',
  firm: '',
  object: '',
}

/** Wechsel-Rechner: spätestes Kündigungsdatum, frühester Wechsel, Zeitstrahl und Kündigungsvorlage */
export function SwitchCalculator() {
  const [s, setS] = useLocalState('cs-switch', initial)
  const set = (p: Partial<typeof initial>) => setS((x) => ({ ...x, ...p }))
  // Heute erst im Browser bestimmen (vorgerendertes HTML soll kein festes Datum enthalten)
  const [today, setToday] = useState<Date | null>(null)
  useEffect(() => setToday(new Date()), [])
  const r = useMemo(() => (today ? computeSwitch({ today, kind: s.kind, notice: s.notice, term: s.term, start: s.start, months: s.months, renew: s.renew }) : null), [today, s])
  const [copied, setCopied] = useState(false)

  const letter = `${s.me || '[Ihr Unternehmen, Anschrift]'}

${s.firm || '[Reinigungsfirma, Anschrift]'}

Kündigung des Vertrags über Reinigungsleistungen
[Vertrags- oder Kundennummer, falls vorhanden]

Sehr geehrte Damen und Herren,

hiermit kündigen wir den mit Ihnen geschlossenen Vertrag über Reinigungsleistungen für das Objekt ${s.object || '[Adresse des Objekts]'} fristgerecht zum ${r?.end ? fmtShort(r.end) : '[Datum des Vertragsendes]'}, hilfsweise zum nächstmöglichen Termin.

Bitte bestätigen Sie uns den Eingang dieser Kündigung und das Datum der Vertragsbeendigung schriftlich. Bitte geben Sie zum Vertragsende alle Schlüssel, Transponder und sonstigen Zugangsmittel zurück und teilen Sie uns mit, welche Geräte oder Materialien in Ihrem Eigentum sich noch im Objekt befinden.

Mit freundlichen Grüßen

[Name, Funktion]
[Ort, Datum]`

  const steps = r?.end
    ? [
        { title: r.daysLeft <= 0 ? 'Heute kündigen' : 'Spätestens kündigen', date: r.noticeBy, text: 'Kündigung muss beim Anbieter eingegangen sein.' },
        { title: 'Letzter Reinigungstag', date: r.end, text: 'beim bisherigen Anbieter (Vertragsende)' },
        { title: 'Erster Tag mit CleanStar', date: r.first, text: 'ohne Lücke in der Reinigung' },
      ]
    : []

  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-14 lg:grid-cols-12">
      <div className="space-y-8 border-t border-line pt-8 lg:col-span-5">
        <h2 className="t-label">Ihr aktueller Vertrag</h2>
        <Segmented
          label="Vertragsart"
          value={s.kind}
          onChange={(v) => set({ kind: v })}
          options={[
            { id: 'unbefristet', label: 'Unbefristet' },
            { id: 'befristet', label: 'Feste Laufzeit' },
          ]}
        />
        {s.kind === 'befristet' && (
          <div className="grid grid-cols-1 gap-x-5 gap-y-6 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <DateInput label="Vertragsbeginn" value={s.start} onChange={(v) => set({ start: v })} className="sm:col-span-2 lg:col-span-1 xl:col-span-2" />
            <NumberInput label="Erste Laufzeit" unit="Monate" value={s.months} onChange={(v) => set({ months: v })} />
            <NumberInput label="Verlängerung um" unit="Monate" value={s.renew} onChange={(v) => set({ renew: v })} hint="0, wenn er sich nicht verlängert" />
          </div>
        )}
        <SelectInput label="Kündigungsfrist" value={s.notice} onChange={(v) => set({ notice: v })} options={notices} />
        {s.kind === 'unbefristet' && (
          <Segmented
            label="Kündigung zum"
            value={s.term}
            onChange={(v) => set({ term: v })}
            options={[
              { id: 'monat', label: 'Monatsende' },
              { id: 'quartal', label: 'Quartalsende' },
              { id: 'tag', label: 'beliebigen Tag' },
            ]}
          />
        )}
        <p className="text-[0.8125rem] leading-relaxed text-muted">Die Angaben finden Sie in Ihrem Vertrag. Maßgeblich ist immer, was dort steht. Ihre Eingaben bleiben in Ihrem Browser.</p>
      </div>

      <div className="space-y-14 lg:col-span-6 lg:col-start-7">
        <section aria-live="polite" aria-labelledby="sw-result" className="on-dark bg-night p-6 text-paper sm:p-10">
          <h2 id="sw-result" className="t-label">
            Ihr Wechsel-Zeitplan
          </h2>
          {!today ? (
            <p className="mt-4 text-muted-dark">Wird berechnet …</p>
          ) : r?.expired ? (
            <p className="mt-4 text-paper">
              Mit diesen Angaben ist der Vertrag bereits ausgelaufen oder eine Kündigung zum nächsten Termin ist nicht mehr möglich. Prüfen Sie Laufzeit und Verlängerung.
            </p>
          ) : !r?.end ? (
            <p className="mt-4 text-muted-dark">Bitte Vertragsbeginn und Laufzeit eintragen.</p>
          ) : (
            <>
              <p className="mt-4 text-[1.25rem] leading-snug tracking-[-0.01em] text-paper">
                {r.daysLeft <= 0
                  ? 'Wenn Sie heute kündigen,'
                  : `Sie haben noch ${r.daysLeft}\u00A0${r.daysLeft === 1 ? 'Tag' : 'Tage'} Zeit. Wenn die Kündigung rechtzeitig eingeht,`}{' '}
                können Sie am <strong className="font-medium text-paper">{fmtShort(r.first)}</strong> mit einem neuen Anbieter starten.
              </p>
              <ol className="mt-8 border-t border-line-dark">
                {steps.map((st, i) => (
                  <li key={st.title} className="grid grid-cols-[2.5rem_1fr] gap-x-3 border-b border-line-dark py-4">
                    <span className="t-label pt-1">{String(i + 1).padStart(2, '0')}</span>
                    <span className="min-w-0">
                      <span className="block text-[0.9375rem] text-muted-dark">{st.title}</span>
                      <span className={cn('block text-[1.375rem] font-medium tracking-[-0.02em]', i === 2 && 'text-blue-on-dark')}>{fmt(st.date)}</span>
                      <span className="block text-[0.9375rem] text-muted-dark">{st.text}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </>
          )}
          <div className="mt-8">
            <p className="text-[0.9375rem] text-paper">
              <strong className="font-medium text-paper">Bei uns: im ersten Monat jederzeit kündbar.</strong> {company.contract.firstMonth} {company.contract.afterwards}
            </p>
          </div>
        </section>

        <section aria-labelledby="sw-letter" className="border-t border-line pt-8">
          <h2 id="sw-letter" className="t-h4">
            Kündigungsvorlage
          </h2>
          <p className="mt-1 text-ink-2">Neutral formuliert, zum Kopieren und Anpassen.</p>
          <div className="mt-6 grid grid-cols-1 gap-x-5 gap-y-6 sm:grid-cols-3">
            <TextInput label="Ihr Unternehmen" value={s.me} onChange={(v) => set({ me: v })} />
            <TextInput label="Bisheriger Anbieter" value={s.firm} onChange={(v) => set({ firm: v })} />
            <TextInput label="Objekt (Adresse)" value={s.object} onChange={(v) => set({ object: v })} />
          </div>
          <pre className="mt-6 max-h-96 overflow-auto bg-surface p-5 font-mono text-[0.8125rem] leading-relaxed whitespace-pre-wrap text-ink" tabIndex={0}>
            {letter}
          </pre>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() =>
                navigator.clipboard?.writeText(letter).then(() => {
                  setCopied(true)
                  window.setTimeout(() => setCopied(false), 2000)
                })
              }
              className="btn btn-outline"
            >
              {copied ? <Check aria-hidden className="size-4" /> : <Copy aria-hidden className="size-4" />}
              <span aria-live="polite">{copied ? 'Kopiert' : 'Text kopieren'}</span>
            </button>
          </div>
          <p className="mt-4 text-[0.8125rem] leading-relaxed text-muted">
            Hinweis: Die Vorlage ist eine allgemeine Formulierungshilfe und keine Rechtsberatung. Prüfen Sie Frist und Form (zum Beispiel Schriftform mit Unterschrift) in Ihrem
            Vertrag und senden Sie die Kündigung so, dass Sie den Zugang nachweisen können.
          </p>
        </section>

        <div className="flex flex-col gap-6 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="t-h4 max-w-md">Neuer Anbieter gesucht? Wir besichtigen kostenlos und starten zu Ihrem Wechseltermin.</p>
          <QuoteButton arrow wrapClassName="shrink-0">
            Angebot anfragen
          </QuoteButton>
        </div>
      </div>
    </div>
  )
}
