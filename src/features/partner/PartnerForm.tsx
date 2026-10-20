import { useEffect, useRef, useState } from 'react'
import { useForm, type Path } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Building2, CheckCircle2, Info, Loader2, Rocket } from 'lucide-react'
import { bwRegions, partnerFormOptions as opt, partnerWays, type PartnerWay } from '@/content/partner'
import { company } from '@/content/company'
import { ChoiceCard, Honeypot, PrivacyCheckbox, TextArea, TextField } from '@/features/forms/fields'
import { submitForm } from '@/features/forms/submit'
import { cn } from '@/lib/cn'

const schema = z
  .object({
    way: z.enum(['bestand', 'gruendung'], { message: 'Bitte wählen Sie Ihren Weg.' }),
    companyName: z.string().optional(),
    since: z.string().optional(),
    employees: z.string().optional(),
    businessShare: z.string().optional(),
    currentJob: z.string().optional(),
    experience: z.string().optional(),
    experienceText: z.string().max(600).optional(),
    region: z.string().trim().min(2, 'Bitte geben Sie Ihre Wunschregion an (Landkreis oder PLZ).').max(120),
    start: z.string().min(1, 'Bitte wählen Sie einen Starttermin.'),
    mode: z.string().min(1, 'Bitte auswählen.'),
    investment: z.string().optional(),
    name: z.string().trim().min(2, 'Bitte geben Sie Ihren Namen an.').max(120),
    email: z.string().trim().email('Bitte prüfen Sie die E-Mail-Adresse.'),
    phone: z
      .string()
      .trim()
      .min(6, 'Bitte geben Sie eine Telefonnummer an.')
      .regex(/^[+()\d\s/-]+$/, 'Bitte nur Ziffern, Leerzeichen, +, /, - verwenden.'),
    callback: z.string().optional(),
    message: z.string().max(2000).optional(),
    privacy: z.boolean().refine((v) => v, 'Bitte stimmen Sie der Datenverarbeitung zu.'),
    botcheck: z.string().optional(),
  })
  .superRefine((d, ctx) => {
    const req = (field: keyof typeof d, message: string) => {
      if (!d[field] || String(d[field]).trim() === '') ctx.addIssue({ code: 'custom', path: [field], message })
    }
    if (d.way === 'bestand') {
      req('companyName', 'Bitte geben Sie den Firmennamen an.')
      req('since', 'Bitte geben Sie an, seit wann es die Firma gibt.')
      req('employees', 'Bitte auswählen.')
      req('businessShare', 'Bitte auswählen.')
    }
    if (d.way === 'gruendung') {
      req('currentJob', 'Bitte beschreiben Sie kurz Ihre aktuelle Tätigkeit.')
      req('experience', 'Bitte auswählen.')
    }
  })

type Data = z.infer<typeof schema>

const STEPS = ['Weg', 'Details', 'Region', 'Start', 'Rahmen', 'Kontakt']
const TITLES = [
  'Wo stehen Sie heute?',
  'Erzählen Sie uns kurz von sich.',
  'In welcher Region möchten Sie starten?',
  'Wann soll es losgehen?',
  'Welchen Rahmen stellen Sie sich vor?',
  'Wie erreichen wir Sie?',
]
const FIELDS: (keyof Data)[][] = [
  ['way'],
  ['companyName', 'since', 'employees', 'businessShare', 'currentJob', 'experience'],
  ['region'],
  ['start', 'mode'],
  ['investment'],
  ['name', 'email', 'phone', 'privacy'],
]

function Err({ msg }: { msg?: string }) {
  return msg ? (
    <p role="alert" className="mt-2 text-sm text-danger">
      {msg}
    </p>
  ) : null
}

/** Mehrstufige Partneranfrage. Weg und Region werden aus Umschalter und Karte vorausgefüllt. */
export function PartnerForm({ way, region }: { way: PartnerWay; region: string }) {
  const [step, setStep] = useState(0)
  const [dir, setDir] = useState(1)
  const [done, setDone] = useState<null | { preview: boolean }>(null)
  const [error, setError] = useState<string | null>(null)
  const top = useRef<HTMLDivElement>(null)
  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    setError: setFieldError,
    clearErrors,
    getValues,
    formState,
  } = useForm<Data>({
    resolver: zodResolver(schema),
    defaultValues: { way, region, privacy: false, start: '', mode: '', investment: '' },
    mode: 'onTouched',
  })
  const { errors, isSubmitting } = formState
  const v = watch()

  useEffect(() => setValue('way', way), [way, setValue])
  // Fehlermeldung eines Feldes verschwindet, sobald es geändert wird (kein Springen beim Weiterklicken)
  useEffect(() => {
    const sub = watch((_, { name }) => {
      if (name) clearErrors(name)
    })
    return () => sub.unsubscribe()
  }, [watch, clearErrors])
  useEffect(() => {
    if (region) setValue('region', region, { shouldValidate: true })
  }, [region, setValue])

  /** Pflichtfelder je nach Weg (Schritt 2). Objekt-Regeln von Zod greifen erst beim Absenden, daher hier direkt. */
  const checkDetails = () => {
    const d = getValues()
    const need: [keyof Data, string][] =
      d.way === 'bestand'
        ? [
            ['companyName', 'Bitte geben Sie den Firmennamen an.'],
            ['since', 'Bitte geben Sie an, seit wann es die Firma gibt.'],
            ['employees', 'Bitte auswählen.'],
            ['businessShare', 'Bitte auswählen.'],
          ]
        : [
            ['currentJob', 'Bitte beschreiben Sie kurz Ihre aktuelle Tätigkeit.'],
            ['experience', 'Bitte auswählen.'],
          ]
    clearErrors(FIELDS[1] as Path<Data>[])
    let ok = true
    for (const [f, msg] of need) {
      if (!d[f] || String(d[f]).trim() === '') {
        setFieldError(f as Path<Data>, { type: 'required', message: msg })
        ok = false
      }
    }
    return ok
  }

  const go = async (to: number) => {
    if (to > step && step === 1 && !checkDetails()) return
    if (to > step && step !== 1 && !(await trigger(FIELDS[step] as Path<Data>[]))) return
    setDir(to > step ? 1 : -1)
    setStep(to)
    requestAnimationFrame(() => top.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }))
  }

  const onSubmit = handleSubmit(async (d) => {
    setError(null)
    const lines: [string, string][] = [
      ['Weg', partnerWays[d.way].label],
      ...(d.way === 'bestand'
        ? ([
            ['Firmenname', d.companyName ?? ''],
            ['Firma besteht seit', d.since ?? ''],
            ['Mitarbeitende', d.employees ?? ''],
            ['Anteil Geschäftskunden', d.businessShare ?? ''],
          ] as [string, string][])
        : ([
            ['Aktuelle Tätigkeit', d.currentJob ?? ''],
            ['Erfahrung in Reinigung oder Führung', [d.experience, d.experienceText].filter(Boolean).join(': ')],
          ] as [string, string][])),
      ['Wunschregion', d.region],
      ['Starttermin', d.start],
      ['Haupt-/nebenberuflich', d.mode],
      ['Investitionsrahmen (Selbsteinschätzung)', d.investment || 'keine Angabe'],
      ['Name', d.name],
      ['E-Mail', d.email],
      ['Telefon', d.phone],
      ['Rückruf erwünscht', d.callback || 'keine Angabe'],
      ['Nachricht', d.message ?? ''],
    ]
    const res = await submitForm({ subject: `Partneranfrage: ${d.name} (${partnerWays[d.way].short}, ${d.region})`, replyTo: d.email, name: d.name, lines, botcheck: d.botcheck })
    if (!res.ok) return setError(`Die Anfrage konnte nicht gesendet werden (${res.error}). Bitte rufen Sie uns an oder schreiben Sie an ${company.email}.`)
    setDone({ preview: res.preview })
  })

  if (done)
    return (
      <div role="status" className="p-6 sm:p-10">
        <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="grid size-16 place-items-center rounded-full bg-fresh/15 text-fresh-ink">
          <CheckCircle2 aria-hidden className="size-9" />
        </motion.div>
        <h3 className="mt-6 text-3xl font-semibold tracking-tight">Vielen Dank für Ihr Interesse.</h3>
        <p className="mt-3 text-muted">Wir melden uns persönlich bei Ihnen, um ein unverbindliches Erstgespräch zu vereinbaren.</p>
        {done.preview && (
          <p className="mt-5 flex gap-3 rounded-xl bg-amber-50 p-4 text-sm text-amber-900 ring-1 ring-amber-200">
            <Info aria-hidden className="size-5 shrink-0" />
            <span>
              <strong>Vorschau-Modus:</strong> Es ist noch kein Formular-Endpunkt eingetragen (src/content/company.ts → forms). Die Anfrage wurde nicht gesendet.
            </span>
          </p>
        )}
      </div>
    )

  const choice = 'grid grid-cols-1 gap-2.5 sm:grid-cols-2'

  return (
    <div ref={top} className="scroll-mt-28 p-6 sm:p-10">
      <p className="eyebrow">Unverbindliche Partneranfrage</p>
      <h3 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{TITLES[step]}</h3>
      <div className="mt-6 flex gap-1.5" aria-label={`Schritt ${step + 1} von ${STEPS.length}`}>
        {STEPS.map((t, i) => (
          <button
            key={t}
            type="button"
            disabled={i >= step}
            onClick={() => go(i)}
            aria-label={`Schritt ${i + 1}: ${t}`}
            aria-current={i === step ? 'step' : undefined}
            className="flex-1 text-left disabled:cursor-default"
          >
            <span className="block h-1.5 overflow-hidden rounded-full bg-glacier-2">
              <motion.span className="block h-full rounded-full bg-blue" initial={false} animate={{ width: i < step ? '100%' : i === step ? '50%' : '0%' }} />
            </span>
            <span className={cn('mt-2 hidden text-xs font-medium md:block', i <= step ? 'text-ink' : 'text-muted')}>
              {i + 1}. {t}
            </span>
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted md:hidden">
        Schritt {step + 1} von {STEPS.length}: {STEPS[step]}
      </p>

      <form onSubmit={onSubmit} noValidate className="mt-8">
        <Honeypot {...register('botcheck')} />
        <AnimatePresence mode="wait" initial={false} custom={dir}>
          <motion.div
            key={step}
            initial={{ opacity: 0, x: dir * 28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -28 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            {step === 0 && (
              <fieldset>
                <legend className="sr-only">Ihr Weg</legend>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <ChoiceCard
                    type="radio"
                    value="bestand"
                    icon={<Building2 className="size-5" />}
                    label={partnerWays.bestand.label}
                    description="Sie führen bereits einen Reinigungsbetrieb."
                    {...register('way')}
                  />
                  <ChoiceCard
                    type="radio"
                    value="gruendung"
                    icon={<Rocket className="size-5" />}
                    label={partnerWays.gruendung.label}
                    description="Sie möchten sich selbstständig machen."
                    {...register('way')}
                  />
                </div>
                <Err msg={errors.way?.message} />
              </fieldset>
            )}

            {step === 1 && v.way === 'bestand' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <TextField label="Firmenname" autoComplete="organization" error={errors.companyName?.message} {...register('companyName')} />
                  <TextField label="Seit wann gibt es die Firma?" placeholder="z. B. 2015" inputMode="numeric" error={errors.since?.message} {...register('since')} />
                </div>
                <fieldset>
                  <legend className="mb-2 text-sm font-medium text-ink">Anzahl Mitarbeitende</legend>
                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                    {opt.employees.map((o) => (
                      <ChoiceCard key={o} type="radio" value={o} label={o} className="p-3" {...register('employees')} />
                    ))}
                  </div>
                  <Err msg={errors.employees?.message} />
                </fieldset>
                <fieldset>
                  <legend className="mb-2 text-sm font-medium text-ink">Anteil Geschäftskunden am Umsatz</legend>
                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                    {opt.businessShare.map((o) => (
                      <ChoiceCard key={o} type="radio" value={o} label={o} className="p-3" {...register('businessShare')} />
                    ))}
                  </div>
                  <Err msg={errors.businessShare?.message} />
                </fieldset>
              </div>
            )}

            {step === 1 && v.way === 'gruendung' && (
              <div className="space-y-6">
                <TextField label="Was machen Sie aktuell beruflich?" error={errors.currentJob?.message} {...register('currentJob')} />
                <fieldset>
                  <legend className="mb-2 text-sm font-medium text-ink">Haben Sie Erfahrung in der Reinigung oder in Führung?</legend>
                  <div className={choice}>
                    <ChoiceCard type="radio" value="ja" label="Ja" className="p-3" {...register('experience')} />
                    <ChoiceCard type="radio" value="nein" label="Nein" className="p-3" {...register('experience')} />
                  </div>
                  <Err msg={errors.experience?.message} />
                </fieldset>
                <TextArea label="Kurz beschreiben" optional placeholder="z. B. 3 Jahre Objektleitung, Teamleitung im Einzelhandel …" {...register('experienceText')} />
              </div>
            )}

            {step === 2 && (
              <div>
                <TextField
                  label="Gewünschte Region"
                  placeholder="Landkreis oder Postleitzahl"
                  list="partner-regionen"
                  hint="Tipp: Auf der Karte weiter oben können Sie Ihre Region direkt anklicken."
                  error={errors.region?.message}
                  {...register('region')}
                />
                <datalist id="partner-regionen">
                  {bwRegions
                    .filter((x) => x.status === 'gesucht')
                    .map((x) => (
                      <option key={x.id} value={x.name} />
                    ))}
                </datalist>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <fieldset>
                  <legend className="mb-2 text-sm font-medium text-ink">Gewünschter Start</legend>
                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                    {opt.start.map((o) => (
                      <ChoiceCard key={o} type="radio" value={o} label={o} className="p-3" {...register('start')} />
                    ))}
                  </div>
                  <Err msg={errors.start?.message} />
                </fieldset>
                <fieldset>
                  <legend className="mb-2 text-sm font-medium text-ink">Haupt- oder nebenberuflich?</legend>
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                    {opt.mode.map((o) => (
                      <ChoiceCard key={o} type="radio" value={o} label={o} className="p-3" {...register('mode')} />
                    ))}
                  </div>
                  <Err msg={errors.mode?.message} />
                </fieldset>
              </div>
            )}

            {step === 4 && (
              <fieldset>
                <legend className="mb-1 text-sm font-medium text-ink">Geplanter Investitionsrahmen (optional)</legend>
                <p className="mb-3 text-sm text-muted">
                  Nur eine grobe Selbsteinschätzung, damit wir das Gespräch gut vorbereiten können. Sie können den Schritt auch überspringen.
                </p>
                <div className={choice}>
                  {opt.investment.map((o) => (
                    <ChoiceCard key={o} type="radio" value={o} label={o} className="p-3" {...register('investment')} />
                  ))}
                </div>
              </fieldset>
            )}

            {step === 5 && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <TextField label="Vor- und Nachname" autoComplete="name" error={errors.name?.message} {...register('name')} />
                  <TextField label="E-Mail" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
                  <TextField label="Telefon" type="tel" autoComplete="tel" error={errors.phone?.message} {...register('phone')} />
                  <div>
                    <label htmlFor="pf-cb" className="mb-1.5 block text-sm font-medium text-ink">
                      Rückruf am besten <span className="font-normal text-muted">(optional)</span>
                    </label>
                    <select
                      id="pf-cb"
                      className="block w-full rounded-xl border-0 bg-white px-4 py-3.5 text-base shadow-[inset_0_0_0_1px_var(--color-line)] focus:shadow-[inset_0_0_0_2px_var(--color-blue)] focus:outline-none"
                      {...register('callback')}
                    >
                      <option value="">Bitte wählen</option>
                      {opt.callback.map((o) => (
                        <option key={o}>{o}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <TextArea label="Nachricht" optional placeholder="Fragen, Ideen, Ihre Situation …" {...register('message')} />
                <PrivacyCheckbox error={errors.privacy?.message} {...register('privacy')} />
                <p className="text-xs text-muted">Ihre Anfrage ist unverbindlich. Verbindlich ist erst ein schriftlicher Partnervertrag.</p>
                {error && (
                  <p role="alert" className="rounded-xl bg-danger/10 p-4 text-sm text-danger">
                    {error}
                  </p>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-10 flex items-center justify-between gap-3 border-t border-line pt-6">
          {step > 0 ? (
            <button type="button" onClick={() => go(step - 1)} className="inline-flex h-12 items-center gap-2 rounded-full px-4 font-semibold text-ink transition hover:bg-ink/5">
              <ArrowLeft aria-hidden className="size-4" />
              Zurück
            </button>
          ) : (
            <span className="text-xs text-muted">Unverbindlich, ca. 2 Minuten</span>
          )}
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={() => go(step + 1)}
              className="inline-flex h-12 items-center gap-2 rounded-full bg-blue px-6 font-semibold text-white shadow-glow transition hover:bg-blue-hover"
            >
              {step === 4 && !v.investment ? 'Überspringen' : 'Weiter'}
              <ArrowRight aria-hidden className="size-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-12 items-center gap-2 rounded-full bg-blue px-6 font-semibold text-white shadow-glow transition hover:bg-blue-hover disabled:opacity-70"
            >
              {isSubmitting && <Loader2 aria-hidden className="size-4 animate-spin" />}
              Anfrage senden
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
