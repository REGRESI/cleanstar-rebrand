import { useEffect, useMemo, useRef, useState } from 'react'
import { useForm, Controller, type Path } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Building, Briefcase, Store, Shapes, ClipboardCheck, Calculator, Eye, Minus, Plus, CheckCircle2, FileDown, Info, Loader2 } from 'lucide-react'
import { quoteSchema, defaultQuote, stepFields, stepTitles, objectTypes, specialAreas, intervals, timeSlots, extras, type QuoteData } from './schema'
import { useQuote } from './QuoteContext'
import { monthlyRange, perEmployeeDay, pricing, hourlyRateNetMin, hourlyRateNetMax } from '@/content/pricing'
import { PerEmployee } from '@/features/cost/PerEmployee'
import { RiskFreeSeal } from '@/components/ui/RiskFreeSeal'
import { ContactPerson } from '@/components/ui/ContactPerson'
import { company } from '@/content/company'
import { formatEuro, formatEuro2, formatNumber } from '@/lib/format'
import { AnimatedNumber } from '@/components/ui/AnimatedNumber'
import { ChoiceCard, TextField, TextArea, PrivacyCheckbox, Honeypot } from '@/features/forms/fields'
import { submitForm } from '@/features/forms/submit'
import { cn } from '@/lib/cn'

const STORAGE = 'cleanstar-angebot'
const icons = { buero: Building, praxis: Briefcase, gewerbe: Store, sonstiges: Shapes }

function load(): QuoteData {
  try {
    const raw = sessionStorage.getItem(STORAGE)
    if (raw) return { ...defaultQuote, ...JSON.parse(raw), privacy: false, botcheck: '' }
  } catch {
    /* Speicher nicht verfügbar */
  }
  return defaultQuote
}

/* ---------- Bausteine ---------- */
function Stepper({
  value,
  onChange,
  min,
  max,
  step = 1,
  label,
  unit,
  id,
}: {
  value: number
  onChange: (v: number) => void
  min: number
  max: number
  step?: number
  label: string
  unit?: string
  id: string
}) {
  const clamp = (v: number) => Math.min(max, Math.max(min, Math.round(v / step) * step))
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-ink">
        {label}
      </label>
      <div className="flex items-center gap-2 rounded-2xl bg-white p-1.5 ring-1 ring-line">
        <button
          type="button"
          aria-label={`${label} verringern`}
          onClick={() => onChange(clamp(value - step))}
          className="grid size-11 place-items-center rounded-xl bg-glacier text-ink transition hover:bg-glacier-2 disabled:opacity-40"
          disabled={value <= min}
        >
          <Minus className="size-4" />
        </button>
        <div className="flex flex-1 items-baseline justify-center gap-1">
          <input
            id={id}
            type="number"
            inputMode="decimal"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(clamp(Number(e.target.value) || min))}
            className="w-16 bg-transparent text-center text-xl font-semibold text-ink tabular-nums focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
          />
          {unit && <span className="text-sm text-muted">{unit}</span>}
        </div>
        <button
          type="button"
          aria-label={`${label} erhöhen`}
          onClick={() => onChange(clamp(value + step))}
          className="grid size-11 place-items-center rounded-xl bg-glacier text-ink transition hover:bg-glacier-2 disabled:opacity-40"
          disabled={value >= max}
        >
          <Plus className="size-4" />
        </button>
      </div>
    </div>
  )
}

export function PriceRange({ staff, hours, visits, dark }: { staff: number; hours: number; visits: number; dark?: boolean }) {
  const r = monthlyRange(staff, hours, visits)
  const fmt = useMemo(() => (v: number) => formatEuro(v), [])
  return (
    <div className={cn('rounded-2xl p-5 sm:p-6', dark ? 'bg-ink text-white' : 'bg-glacier text-ink')}>
      <p className={cn('text-xs font-semibold tracking-[0.12em] uppercase', dark ? 'text-fresh' : 'text-blue')}>Unverbindliche Richtpreis-Spanne pro Monat</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl" aria-live="polite">
        <AnimatedNumber value={r.netMin} format={fmt} /> – <AnimatedNumber value={r.netMax} format={fmt} />
        <span className={cn('ml-2 text-base font-medium', dark ? 'text-muted-dark' : 'text-muted')}>netto</span>
      </p>
      <p className={cn('mt-1 text-sm', dark ? 'text-muted-dark' : 'text-muted')}>
        {formatEuro(r.grossMin)} – {formatEuro(r.grossMax)} brutto inkl. {Math.round(pricing.vatRate * 100)} % MwSt.
      </p>
      <p className={cn('mt-4 border-t pt-4 text-xs leading-relaxed', dark ? 'border-white/10 text-muted-dark' : 'border-line text-muted')}>
        Grundlage: {staff} {staff === 1 ? 'Reinigungskraft' : 'Reinigungskräfte'} × {formatNumber(hours)} Std. × {visits} Einsätze pro Woche × {formatNumber(pricing.weeksPerMonth)}{' '}
        Wochen = rund {formatNumber(r.hours)} Stunden im Monat, zu {formatEuro2(hourlyRateNetMin())} bis {formatEuro2(hourlyRateNetMax())} netto pro Stunde. Unverbindliche
        Orientierung. Das finale Angebot erstellen wir nach einer kurzen Objektbesichtigung oder auf Basis Ihrer Angaben.
      </p>
    </div>
  )
}

/* ---------- Konfigurator ---------- */
export default function Configurator({ variant = 'page', onDone }: { variant?: 'page' | 'modal'; onDone?: () => void }) {
  const { prefill } = useQuote()
  const [step, setStep] = useState(0)
  const [dir, setDir] = useState(1)
  const [result, setResult] = useState<null | { preview: boolean; data: QuoteData }>(null)
  const [sendError, setSendError] = useState<string | null>(null)
  const top = useRef<HTMLDivElement>(null)

  const form = useForm<QuoteData>({ resolver: zodResolver(quoteSchema), defaultValues: defaultQuote, mode: 'onTouched' })
  const { register, control, watch, setValue, trigger, handleSubmit, formState, reset } = form
  const { errors, isSubmitting } = formState

  // Zwischenstand laden und Vorauswahl übernehmen
  useEffect(() => {
    const data = load()
    reset(prefill ? { ...data, objectType: prefill } : data)
  }, [prefill, reset])

  // Zwischenstand speichern
  useEffect(() => {
    const sub = watch((v) => {
      try {
        const { privacy: _p, botcheck: _b, ...rest } = v
        void _p
        void _b
        sessionStorage.setItem(STORAGE, JSON.stringify(rest))
      } catch {
        /* ignorieren */
      }
    })
    return () => sub.unsubscribe()
  }, [watch])

  const v = watch()
  const range = monthlyRange(v.staff, v.hours, v.visits)

  // Intervall aus Weg A vorschlagen
  useEffect(() => {
    if (v.path !== 'A' || v.interval) return
    const match = intervals.find((i) => i.visits === v.visits)
    setValue('interval', match ? match.id : 'individuell')
  }, [v.path, v.visits, v.interval, setValue])

  const go = async (to: number) => {
    if (to > step) {
      const ok = await trigger(stepFields[step] as Path<QuoteData>[])
      if (!ok) return
    }
    setDir(to > step ? 1 : -1)
    setStep(to)
    requestAnimationFrame(() => top.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }))
  }

  const onSubmit = handleSubmit(async (data) => {
    setSendError(null)
    const type = objectTypes.find((o) => o.id === data.objectType)?.label ?? data.objectType
    const interval = intervals.find((i) => i.id === data.interval)?.label ?? data.interval
    const lines: [string, string][] = [
      ['Unternehmen', data.company],
      ['Ansprechpartner', data.name],
      ['E-Mail', data.email],
      ['Telefon', data.phone],
      ['Ort des Objekts', data.location],
      ['Objektart', type],
      ['Besondere Bereiche', data.areas.join(', ')],
      ['Gewählter Weg', data.path === 'A' ? 'A: Aktuelle Zeiten bekannt' : 'B: Neues Objekt / Zeiten unbekannt'],
    ]
    if (data.path === 'A') {
      const r = monthlyRange(data.staff, data.hours, data.visits)
      lines.push(
        ['Reinigungskräfte gleichzeitig', String(data.staff)],
        ['Mitarbeiter in den Räumen', String(data.employees)],
        ['Stunden pro Einsatz', formatNumber(data.hours)],
        ['Einsätze pro Woche', String(data.visits)],
        ['Richtpreis netto/Monat', `${formatEuro(r.netMin)} bis ${formatEuro(r.netMax)}`],
        ['Richtpreis brutto/Monat', `${formatEuro(r.grossMin)} bis ${formatEuro(r.grossMax)}`],
        [
          'Pro Mitarbeiter und Arbeitstag netto',
          `${formatEuro2(perEmployeeDay(r.netMin, r.netMax, data.employees).min)} bis ${formatEuro2(perEmployeeDay(r.netMin, r.netMax, data.employees).max)}`,
        ],
      )
    } else {
      lines.push(['Fläche ca.', `${data.area} m²`], ['Etagen', String(data.floors)])
    }
    lines.push(
      ['Intervall', interval + (data.intervalNote ? ` (${data.intervalNote})` : '')],
      ['Wunschzeiten', data.times.join(', ')],
      ['Zusatzleistungen', data.extras.join(', ')],
      ['Wunschtermin Besichtigung', [data.visitDate, data.visitTime].filter(Boolean).join(', ')],
      ['Nachricht', data.message ?? ''],
    )
    const res = await submitForm({ subject: `Angebotsanfrage: ${data.company} (${type}, Weg ${data.path})`, replyTo: data.email, name: data.name, lines, botcheck: data.botcheck })
    if (!res.ok) {
      setSendError(`Die Anfrage konnte nicht gesendet werden (${res.error}). Bitte rufen Sie uns an oder schreiben Sie an ${company.email}.`)
      return
    }
    setResult({ preview: res.preview, data })
    try {
      sessionStorage.removeItem(STORAGE)
    } catch {
      /* ignorieren */
    }
  })

  const isModal = variant === 'modal'
  const pad = isModal ? 'p-6 sm:p-10' : 'p-6 sm:p-10 lg:p-12'

  if (result)
    return (
      <Success
        result={result}
        isModal={isModal}
        onDone={onDone}
        onRestart={() => {
          reset(defaultQuote)
          setResult(null)
          setStep(0)
        }}
      />
    )

  return (
    <div ref={top} className={cn('relative', pad)}>
      {/* Kopf + Fortschritt */}
      <div className="pr-12">
        <p className="eyebrow">Angebot in 48 Stunden</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
          {['Was sollen wir reinigen?', 'Wie ist Ihre Reinigung heute aufgestellt?', 'Wie oft und wann?', 'Darf es noch etwas sein?', 'Wohin dürfen wir uns melden?'][step]}
        </h2>
      </div>
      <div className="mt-6" aria-label={`Schritt ${step + 1} von ${stepTitles.length}`}>
        <div className="flex gap-1.5">
          {stepTitles.map((t, i) => (
            <button
              key={t}
              type="button"
              onClick={() => i < step && go(i)}
              disabled={i >= step}
              aria-current={i === step ? 'step' : undefined}
              aria-label={`Schritt ${i + 1}: ${t}${i < step ? ' (zurück zu diesem Schritt)' : ''}`}
              className="group flex-1 text-left disabled:cursor-default"
            >
              <span className="block h-1.5 overflow-hidden rounded-full bg-glacier-2">
                <motion.span
                  className="block h-full rounded-full bg-blue"
                  initial={false}
                  animate={{ width: i < step ? '100%' : i === step ? '50%' : '0%' }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                />
              </span>
              <span className={cn('mt-2 hidden text-xs font-medium sm:block', i <= step ? 'text-ink' : 'text-muted')}>
                {i + 1}. {t}
              </span>
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted sm:hidden">
          Schritt {step + 1} von {stepTitles.length}: {stepTitles[step]}
        </p>
      </div>

      <form onSubmit={onSubmit} noValidate className="mt-8">
        <Honeypot {...register('botcheck')} />
        <AnimatePresence mode="wait" custom={dir} initial={false}>
          <motion.div
            key={step}
            custom={dir}
            initial={{ opacity: 0, x: dir * 28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -28 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            {step === 0 && (
              <div className="space-y-8">
                <fieldset>
                  <legend className="mb-3 text-sm font-medium text-ink">Art des Objekts</legend>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {objectTypes.map((o) => {
                      const Icon = icons[o.id]
                      return (
                        <ChoiceCard
                          key={o.id}
                          type="radio"
                          value={o.id}
                          label={o.label}
                          description={o.description}
                          icon={<Icon className="size-5" />}
                          {...register('objectType')}
                        />
                      )
                    })}
                  </div>
                  {errors.objectType && (
                    <p role="alert" className="mt-2 text-sm text-danger">
                      {errors.objectType.message}
                    </p>
                  )}
                </fieldset>
                <fieldset>
                  <legend className="mb-1 text-sm font-medium text-ink">Besondere Bereiche</legend>
                  <p className="mb-3 text-sm text-muted">Mehrfachauswahl. Diese Bereiche beeinflussen den Aufwand am stärksten.</p>
                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                    {specialAreas.map((a) => (
                      <ChoiceCard key={a} value={a} label={a} className="p-3.5" {...register('areas')} />
                    ))}
                  </div>
                </fieldset>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6">
                <fieldset>
                  <legend className="sr-only">Wissen Sie, wie Ihre aktuelle Reinigung aufgestellt ist?</legend>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <ChoiceCard
                      type="radio"
                      value="A"
                      icon={<Calculator className="size-5" />}
                      label="Ja, ich kenne die aktuellen Zeiten"
                      description="Dann rechnen wir Ihnen gleich eine Richtpreis-Spanne aus."
                      {...register('path')}
                    />
                    <ChoiceCard
                      type="radio"
                      value="B"
                      icon={<Eye className="size-5" />}
                      label="Nein, bzw. neues Objekt"
                      description="Dann sehen wir uns Ihre Räume kostenlos an."
                      {...register('path')}
                    />
                  </div>
                  {errors.path && (
                    <p role="alert" className="mt-2 text-sm text-danger">
                      {errors.path.message}
                    </p>
                  )}
                </fieldset>

                {v.path === 'A' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <Controller
                        control={control}
                        name="staff"
                        render={({ field }) => <Stepper id="cfg-staff" label="Reinigungskräfte gleichzeitig" value={field.value} onChange={field.onChange} min={1} max={20} />}
                      />
                      <Controller
                        control={control}
                        name="hours"
                        render={({ field }) => (
                          <Stepper id="cfg-hours" label="Dauer pro Einsatz" unit="Std." value={field.value} onChange={field.onChange} min={0.5} max={12} step={0.5} />
                        )}
                      />
                      <Controller
                        control={control}
                        name="visits"
                        render={({ field }) => <Stepper id="cfg-visits" label="Einsätze pro Woche" value={field.value} onChange={field.onChange} min={1} max={7} />}
                      />
                    </div>
                    <PriceRange staff={v.staff} hours={v.hours} visits={v.visits} />
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,14rem)_1fr] sm:items-end">
                      <Controller
                        control={control}
                        name="employees"
                        render={({ field }) => (
                          <Stepper id="cfg-employees" label="Wie viele Mitarbeiter arbeiten in den Räumen?" value={field.value} onChange={field.onChange} min={1} max={2000} />
                        )}
                      />
                      <PerEmployee netMin={range.netMin} netMax={range.netMax} employees={v.employees} />
                    </div>
                  </motion.div>
                )}

                {v.path === 'B' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                    <Controller
                      control={control}
                      name="area"
                      render={({ field }) => (
                        <div>
                          <label htmlFor="cfg-area" className="mb-2 flex items-baseline justify-between text-sm font-medium text-ink">
                            Fläche ungefähr <span className="text-lg font-semibold tabular-nums">{field.value >= 5000 ? 'über 5.000' : formatNumber(field.value)} m²</span>
                          </label>
                          <input
                            id="cfg-area"
                            type="range"
                            min={50}
                            max={5000}
                            step={50}
                            value={field.value}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            aria-valuetext={`${field.value} Quadratmeter`}
                            className="w-full accent-blue"
                          />
                          <div className="mt-1 flex justify-between text-xs text-muted">
                            <span>50 m²</span>
                            <span>5.000 m²+</span>
                          </div>
                        </div>
                      )}
                    />
                    <Controller
                      control={control}
                      name="floors"
                      render={({ field }) => <Stepper id="cfg-floors" label="Etagen" value={field.value} onChange={field.onChange} min={1} max={30} />}
                    />
                    <div className="flex gap-4 rounded-2xl bg-glacier p-5">
                      <ClipboardCheck aria-hidden className="mt-0.5 size-6 shrink-0 text-blue" />
                      <div>
                        <p className="font-semibold text-ink">Ein ehrliches Angebot statt einer geschätzten Zahl.</p>
                        <p className="mt-1 text-sm leading-relaxed text-muted">
                          Jedes Objekt ist anders. Damit Sie ein ehrliches Angebot bekommen statt einer geschätzten Zahl, die später nicht stimmt, schauen wir uns Ihre Räume
                          kostenlos an. Danach haben Sie das Angebot innerhalb von 48 Stunden.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8">
                <fieldset>
                  <legend className="mb-3 text-sm font-medium text-ink">Gewünschtes Intervall</legend>
                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                    {intervals.map((i) => (
                      <ChoiceCard key={i.id} type="radio" value={i.id} label={i.label} className="p-3.5" {...register('interval')} />
                    ))}
                  </div>
                  {errors.interval && (
                    <p role="alert" className="mt-2 text-sm text-danger">
                      {errors.interval.message}
                    </p>
                  )}
                  {v.interval === 'individuell' && (
                    <TextField className="mt-4" label="Ihr Wunsch-Rhythmus" optional placeholder="z. B. Sanitär täglich, Büros 2× pro Woche" {...register('intervalNote')} />
                  )}
                </fieldset>
                <fieldset>
                  <legend className="mb-3 text-sm font-medium text-ink">Wunschzeiten</legend>
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {timeSlots.map((t) => (
                      <ChoiceCard key={t} value={t} label={t} className="p-3.5" {...register('times')} />
                    ))}
                  </div>
                </fieldset>
              </div>
            )}

            {step === 3 && (
              <fieldset>
                <legend className="mb-3 text-sm font-medium text-ink">Zusatzleistungen (optional)</legend>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {extras.map((x) => (
                    <ChoiceCard key={x.id} value={x.id} label={x.id} description={x.description} {...register('extras')} />
                  ))}
                </div>
              </fieldset>
            )}

            {step === 4 && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <TextField label="Unternehmen" autoComplete="organization" error={errors.company?.message} {...register('company')} />
                  <TextField label="Ihr Name" autoComplete="name" error={errors.name?.message} {...register('name')} />
                  <TextField label="E-Mail" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
                  <TextField label="Telefon" type="tel" autoComplete="tel" error={errors.phone?.message} {...register('phone')} />
                </div>
                <TextField
                  label="Ort des Objekts"
                  placeholder="z. B. Offenburg, Hauptstraße"
                  autoComplete="address-level2"
                  error={errors.location?.message}
                  {...register('location')}
                />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <TextField label="Wunschtermin für die kostenlose Besichtigung" type="date" optional min={new Date().toISOString().slice(0, 10)} {...register('visitDate')} />
                  <div>
                    <label htmlFor="cfg-vt" className="mb-1.5 block text-sm font-medium text-ink">
                      Tageszeit <span className="font-normal text-muted">(optional)</span>
                    </label>
                    <select
                      id="cfg-vt"
                      className="block w-full rounded-xl border-0 bg-white px-4 py-3.5 text-base text-ink shadow-[inset_0_0_0_1px_var(--color-line)] focus:shadow-[inset_0_0_0_2px_var(--color-blue)] focus:outline-none"
                      {...register('visitTime')}
                    >
                      <option value="">Egal</option>
                      <option>Vormittags</option>
                      <option>Mittags</option>
                      <option>Nachmittags</option>
                    </select>
                  </div>
                </div>
                <TextArea label="Nachricht" optional placeholder="Besonderheiten, Schlüssel, Zugang, Fragen …" {...register('message')} />
                <PrivacyCheckbox error={errors.privacy?.message} {...register('privacy')} />
                {sendError && (
                  <p role="alert" className="rounded-xl bg-danger/10 p-4 text-sm text-danger">
                    {sendError}
                  </p>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="mt-10 flex items-center justify-between gap-3 border-t border-line pt-6">
          {step > 0 ? (
            <button type="button" onClick={() => go(step - 1)} className="inline-flex h-12 items-center gap-2 rounded-full px-4 font-semibold text-ink transition hover:bg-ink/5">
              <ArrowLeft aria-hidden className="size-4" />
              Zurück
            </button>
          ) : (
            <span className="text-xs text-muted">Kostenlos und unverbindlich</span>
          )}
          {step < stepTitles.length - 1 ? (
            <button
              type="button"
              onClick={() => go(step + 1)}
              className="inline-flex h-12 items-center gap-2 rounded-full bg-blue px-6 font-semibold text-white shadow-glow transition hover:bg-blue-hover"
            >
              Weiter
              <ArrowRight aria-hidden className="size-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-12 items-center gap-2 rounded-full bg-blue px-6 font-semibold text-white shadow-glow transition hover:bg-blue-hover disabled:opacity-70"
            >
              {isSubmitting ? <Loader2 aria-hidden className="size-4 animate-spin" /> : null}
              Anfrage senden
            </button>
          )}
        </div>
        {step === stepTitles.length - 1 && (
          <div className="mt-5 flex justify-center sm:justify-end">
            <RiskFreeSeal />
          </div>
        )}
        {isModal && step === 0 && (
          <p className="mt-4 text-center text-xs text-muted">
            Lieber in Ruhe?{' '}
            <Link to="/angebot" onClick={onDone} className="font-medium text-blue underline underline-offset-2">
              Konfigurator als eigene Seite öffnen
            </Link>
          </p>
        )}
      </form>
    </div>
  )
}

/* ---------- Abschluss ---------- */
function Success({ result, isModal, onDone, onRestart }: { result: { preview: boolean; data: QuoteData }; isModal: boolean; onDone?: () => void; onRestart: () => void }) {
  const d = result.data
  const r = d.path === 'A' ? monthlyRange(d.staff, d.hours, d.visits) : null
  const pe = r ? perEmployeeDay(r.netMin, r.netMax, d.employees) : null
  const [pdfBusy, setPdfBusy] = useState(false)
  const rows: [string, string][] = [
    ['Objekt', objectTypes.find((o) => o.id === d.objectType)?.label ?? ''],
    ['Besondere Bereiche', d.areas.join(', ') || 'keine'],
    ['Weg', d.path === 'A' ? 'Aktuelle Zeiten bekannt' : 'Besichtigung vor Ort'],
    ...(d.path === 'A'
      ? ([
          ['Einsatz', `${d.staff} ${d.staff === 1 ? 'Reinigungskraft' : 'Reinigungskräfte'} × ${formatNumber(d.hours)} Std., ${d.visits}× pro Woche`],
          ['Mitarbeiter in den Räumen', String(d.employees)],
          ['Richtpreis netto/Monat', `${formatEuro(r!.netMin)} – ${formatEuro(r!.netMax)}`],
          ['Richtpreis brutto/Monat', `${formatEuro(r!.grossMin)} – ${formatEuro(r!.grossMax)}`],
          ['Pro Mitarbeiter und Arbeitstag', `ca. ${formatEuro2(pe!.min)} – ${formatEuro2(pe!.max)} netto`],
        ] as [string, string][])
      : ([
          ['Fläche ca.', `${formatNumber(d.area)} m²`],
          ['Etagen', String(d.floors)],
        ] as [string, string][])),
    ['Intervall', (intervals.find((i) => i.id === d.interval)?.label ?? d.interval) + (d.intervalNote ? ` (${d.intervalNote})` : '')],
    ['Wunschzeiten', d.times.join(', ') || 'flexibel'],
    ['Zusatzleistungen', d.extras.join(', ') || 'keine'],
    ['Kontakt', `${d.name}, ${d.company}`],
    ['Besichtigung', [d.visitDate, d.visitTime].filter(Boolean).join(', ') || 'nach Absprache'],
  ]
  return (
    <div className={cn('p-6 sm:p-10', !isModal && 'lg:p-12')} role="status">
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        className="grid size-16 place-items-center rounded-full bg-fresh/15 text-fresh-ink"
      >
        <CheckCircle2 aria-hidden className="size-9" />
      </motion.div>
      <h2 className="mt-6 text-3xl font-semibold tracking-tight">Vielen Dank. Wir melden uns innerhalb von {company.promises.responseHours} Stunden.</h2>
      <p className="mt-3 text-muted">Hier ist die Zusammenfassung Ihrer Angaben.{company.forms.confirmationEmail && <> Eine Kopie erhalten Sie per E-Mail an {d.email}.</>}</p>
      {result.preview && (
        <p className="mt-5 flex gap-3 rounded-xl bg-amber-50 p-4 text-sm text-amber-900 ring-1 ring-amber-200">
          <Info aria-hidden className="size-5 shrink-0" />
          <span>
            <strong>Vorschau-Modus:</strong> Es ist noch kein Formular-Endpunkt eingetragen (src/content/company.ts → forms). Die Anfrage wurde nicht gesendet.
          </span>
        </p>
      )}
      <dl className="mt-8 divide-y divide-line rounded-2xl bg-glacier px-5 text-sm">
        {rows.map(([k, val]) => (
          <div key={k} className="grid grid-cols-1 gap-0.5 py-3 min-[400px]:grid-cols-[9rem_1fr] min-[400px]:gap-3 sm:grid-cols-[12rem_1fr]">
            <dt className="text-muted">{k}</dt>
            <dd className="font-medium text-ink">{val}</dd>
          </div>
        ))}
      </dl>
      {r && (
        <p className="mt-3 text-xs text-muted">Unverbindliche Orientierung. Das finale Angebot erstellen wir nach einer kurzen Objektbesichtigung oder auf Basis Ihrer Angaben.</p>
      )}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <RiskFreeSeal variant="card" className="sm:col-span-2" />
        <ContactPerson compact title="Ihr Ansprechpartner" className="sm:col-span-2" />
      </div>
      <div className="btn-row mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={pdfBusy}
          onClick={async () => {
            setPdfBusy(true)
            try {
              const { downloadSummaryPdf } = await import('./summaryPdf')
              await downloadSummaryPdf({
                rows: rows.filter(([k]) => !k.startsWith('Richtpreis') && k !== 'Pro Mitarbeiter und Arbeitstag'),
                company: d.company,
                price: r
                  ? {
                      net: `${formatEuro(r.netMin)} – ${formatEuro(r.netMax)}`,
                      gross: `${formatEuro(r.grossMin)} – ${formatEuro(r.grossMax)}`,
                      perEmployee: pe ? `${formatEuro2(pe.min)} – ${formatEuro2(pe.max)}` : undefined,
                    }
                  : undefined,
              })
            } finally {
              setPdfBusy(false)
            }
          }}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-ink px-6 font-semibold text-white transition hover:bg-ink-2 disabled:opacity-70"
        >
          {pdfBusy ? <Loader2 aria-hidden className="size-4 animate-spin" /> : <FileDown aria-hidden className="size-4" />}
          Zusammenfassung als PDF herunterladen
        </button>
        {isModal ? (
          <button type="button" onClick={onDone} className="inline-flex min-h-12 items-center justify-center rounded-full bg-blue px-6 font-semibold text-white">
            Schließen
          </button>
        ) : (
          <Link to="/" className="inline-flex min-h-12 items-center justify-center rounded-full bg-blue px-6 font-semibold text-white">
            Zur Startseite
          </Link>
        )}
        <button type="button" onClick={onRestart} className="inline-flex min-h-12 items-center justify-center rounded-full px-5 font-semibold text-ink ring-1 ring-line">
          Neue Anfrage
        </button>
      </div>
    </div>
  )
}
