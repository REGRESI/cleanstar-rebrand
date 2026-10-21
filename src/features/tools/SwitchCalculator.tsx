import { useEffect, useMemo, useState } from 'react'
import { CalendarCheck, CalendarX, Check, Copy, Send, ShieldCheck } from 'lucide-react'
import { company } from '@/content/company'
import { cn } from '@/lib/cn'
import { QuoteButton } from '@/features/configurator/QuoteLink'
import { DateInput, NumberInput, SelectInput, Segmented, TextInput, useLocalState } from './ui'

type Notice = '2w' | '4w' | '1m' | '2m' | '3m' | '6m'
type Term = 'tag' | 'monat' | 'quartal'
type Kind = 'unbefristet' | 'befristet'

const notices: { id: Notice; label: string }[] = [
  { id: '2w', label: '2 Wochen' },
  { id: '4w', label: '4 Wochen' },
  { id: '1m', label: '1 Monat' },
  { id: '2m', label: '2 Monate' },
  { id: '3m', label: '3 Monate' },
  { id: '6m', label: '6 Monate' },
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
const fmt = (d: Date) => d.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
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
  const r = useMemo(
    () => (today ? computeSwitch({ today, kind: s.kind, notice: s.notice, term: s.term, start: s.start, months: s.months, renew: s.renew }) : null),
    [today, s],
  )
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
        { icon: Send, title: r.daysLeft <= 0 ? 'Heute kündigen' : 'Spätestens kündigen', date: r.noticeBy, text: 'Kündigung muss beim Anbieter eingegangen sein.' },
        { icon: CalendarX, title: 'Letzter Reinigungstag', date: r.end, text: 'beim bisherigen Anbieter (Vertragsende)' },
        { icon: CalendarCheck, title: 'Erster Tag mit CleanStar', date: r.first, text: 'ohne Lücke in der Reinigung' },
      ]
    : []

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
      <div className="space-y-5 rounded-panel bg-white p-5 shadow-soft ring-1 ring-line sm:p-8 lg:col-span-5">
        <h2 className="text-xl font-semibold tracking-tight">Ihr aktueller Vertrag</h2>
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
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
        <p className="text-xs leading-relaxed text-muted">
          Die Angaben finden Sie in Ihrem Vertrag. Maßgeblich ist immer, was dort steht. Ihre Eingaben bleiben in Ihrem Browser.
        </p>
      </div>

      <div className="space-y-6 lg:col-span-7">
        <section aria-live="polite" aria-labelledby="sw-result" className="rounded-panel bg-ink p-5 text-white sm:p-8">
          <h2 id="sw-result" className="text-xl font-semibold tracking-tight">
            Ihr Wechsel-Zeitplan
          </h2>
          {!today ? (
            <p className="mt-4 text-white/70">Wird berechnet …</p>
          ) : r?.expired ? (
            <p className="mt-4 text-white/80">Mit diesen Angaben ist der Vertrag bereits ausgelaufen oder eine Kündigung zum nächsten Termin ist nicht mehr möglich. Prüfen Sie Laufzeit und Verlängerung.</p>
          ) : !r?.end ? (
            <p className="mt-4 text-white/70">Bitte Vertragsbeginn und Laufzeit eintragen.</p>
          ) : (
            <>
              <p className="mt-2 text-white/70">
                {r.daysLeft <= 0 ? 'Wenn Sie heute kündigen,' : `Sie haben noch ${r.daysLeft} ${r.daysLeft === 1 ? 'Tag' : 'Tage'} Zeit. Wenn die Kündigung rechtzeitig eingeht,`} können Sie am{' '}
                <strong className="text-white">{fmtShort(r.first)}</strong> mit einem neuen Anbieter starten.
              </p>
              <ol className="relative mt-8 space-y-6 before:absolute before:top-2 before:bottom-2 before:left-5 before:w-px before:bg-white/15">
                {steps.map((st, i) => (
                  <li key={st.title} className="relative flex gap-4">
                    <span className={cn('relative grid size-10 shrink-0 place-items-center rounded-full ring-4 ring-ink', i === 2 ? 'bg-fresh text-ink' : 'bg-white/10 text-white')}>
                      <st.icon aria-hidden className="size-5" />
                    </span>
                    <span className="min-w-0 pt-0.5">
                      <span className="block text-sm text-white/60">{st.title}</span>
                      <span className="block text-lg font-semibold">{fmt(st.date)}</span>
                      <span className="block text-sm text-white/60">{st.text}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </>
          )}
          <div className="mt-8 flex items-start gap-3 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
            <ShieldCheck aria-hidden className="mt-0.5 size-5 shrink-0 text-fresh" />
            <p className="text-sm text-white/85">
              <strong className="text-white">Bei uns: im ersten Monat jederzeit kündbar.</strong> {company.contract.firstMonth} {company.contract.afterwards}
            </p>
          </div>
        </section>

        <section aria-labelledby="sw-letter" className="rounded-panel bg-white p-5 shadow-soft ring-1 ring-line sm:p-8">
          <h2 id="sw-letter" className="text-xl font-semibold tracking-tight">
            Kündigungsvorlage
          </h2>
          <p className="mt-1 text-sm text-muted">Neutral formuliert, zum Kopieren und Anpassen.</p>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <TextInput label="Ihr Unternehmen" value={s.me} onChange={(v) => set({ me: v })} />
            <TextInput label="Bisheriger Anbieter" value={s.firm} onChange={(v) => set({ firm: v })} />
            <TextInput label="Objekt (Adresse)" value={s.object} onChange={(v) => set({ object: v })} />
          </div>
          <pre className="mt-5 max-h-96 overflow-auto rounded-2xl bg-glacier p-4 font-sans text-sm leading-relaxed whitespace-pre-wrap text-ink ring-1 ring-line" tabIndex={0}>
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
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-blue px-5 font-semibold text-white transition hover:bg-blue-hover active:bg-blue-hover"
            >
              {copied ? <Check aria-hidden className="size-4" /> : <Copy aria-hidden className="size-4" />}
              <span aria-live="polite">{copied ? 'Kopiert' : 'Text kopieren'}</span>
            </button>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-muted">
            Hinweis: Die Vorlage ist eine allgemeine Formulierungshilfe und keine Rechtsberatung. Prüfen Sie Frist und Form (zum Beispiel Schriftform mit Unterschrift) in Ihrem Vertrag
            und senden Sie die Kündigung so, dass Sie den Zugang nachweisen können.
          </p>
        </section>

        <div className="flex flex-col gap-4 rounded-panel bg-glacier p-6 ring-1 ring-line sm:flex-row sm:items-center sm:justify-between">
          <p className="font-semibold">Neuer Anbieter gesucht? Wir besichtigen kostenlos und starten zu Ihrem Wechseltermin.</p>
          <QuoteButton arrow wrapClassName="shrink-0">
            Angebot anfragen
          </QuoteButton>
        </div>
      </div>
    </div>
  )
}
