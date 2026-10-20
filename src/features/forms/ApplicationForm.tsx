import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle2, Info, Loader2 } from 'lucide-react'
import { TextField, ChoiceCard, PrivacyCheckbox, Honeypot } from './fields'
import { submitForm } from './submit'
import { jobs } from '@/content/site'

const availability = ['Früh morgens', 'Vormittags', 'Nachmittags', 'Abends', 'Wochenende'] as const

const schema = z.object({
  job: z.string().min(1, 'Bitte wählen Sie eine Stelle.'),
  name: z.string().trim().min(2, 'Bitte geben Sie Ihren Namen an.'),
  phone: z
    .string()
    .trim()
    .min(6, 'Bitte geben Sie eine Telefonnummer an.')
    .regex(/^[+()\d\s/-]+$/, 'Bitte nur Ziffern, Leerzeichen, +, /, - verwenden.'),
  availability: z.array(z.string()).min(1, 'Bitte wählen Sie mindestens eine Zeit.'),
  license: z.enum(['ja', 'nein'], { message: 'Bitte auswählen.' }),
  privacy: z.boolean().refine((v) => v, 'Bitte stimmen Sie der Datenverarbeitung zu.'),
  botcheck: z.string().optional(),
})
type Data = z.infer<typeof schema>

/** Kurzbewerbung in 2 Minuten, optimiert fürs Handy. */
export function ApplicationForm() {
  const open = jobs.filter((j) => j.enabled)
  const [done, setDone] = useState<null | { preview: boolean }>(null)
  const [error, setError] = useState<string | null>(null)
  const { register, handleSubmit, formState } = useForm<Data>({
    resolver: zodResolver(schema),
    defaultValues: { job: open[0]?.title ?? 'Initiativbewerbung', availability: [], privacy: false },
  })
  const { errors, isSubmitting } = formState

  const onSubmit = handleSubmit(async (d) => {
    setError(null)
    const res = await submitForm({
      subject: `Bewerbung: ${d.job} (${d.name})`,
      name: d.name,
      botcheck: d.botcheck,
      lines: [
        ['Stelle', d.job],
        ['Name', d.name],
        ['Telefon', d.phone],
        ['Verfügbarkeit', d.availability.join(', ')],
        ['Führerschein', d.license],
      ],
    })
    if (!res.ok) return setError(`Senden fehlgeschlagen (${res.error}). Rufen Sie uns gern direkt an.`)
    setDone({ preview: res.preview })
  })

  if (done)
    return (
      <div role="status" className="rounded-panel bg-white p-8 ring-1 ring-line">
        <CheckCircle2 aria-hidden className="size-10 text-fresh-ink" />
        <h3 className="mt-4 text-2xl font-semibold tracking-tight">Danke für Ihre Bewerbung.</h3>
        <p className="mt-2 text-muted">Wir rufen Sie in den nächsten Tagen an.</p>
        {done.preview && (
          <p className="mt-5 flex gap-3 rounded-xl bg-amber-50 p-4 text-sm text-amber-900 ring-1 ring-amber-200">
            <Info aria-hidden className="size-5 shrink-0" />
            <span>
              <strong>Vorschau-Modus:</strong> Es ist noch kein Formular-Endpunkt eingetragen. Die Bewerbung wurde nicht gesendet.
            </span>
          </p>
        )}
      </div>
    )

  return (
    <form onSubmit={onSubmit} noValidate className="relative space-y-6 rounded-panel bg-white p-6 ring-1 ring-line sm:p-8">
      <Honeypot {...register('botcheck')} />
      <div>
        <label htmlFor="app-job" className="mb-1.5 block text-sm font-medium">
          Stelle{' '}
          <span aria-hidden className="text-blue">
            *
          </span>
        </label>
        <select
          id="app-job"
          className="block w-full rounded-xl border-0 bg-white px-4 py-3.5 text-base shadow-[inset_0_0_0_1px_var(--color-line)] focus:shadow-[inset_0_0_0_2px_var(--color-blue)] focus:outline-none"
          {...register('job')}
        >
          {open.map((j) => (
            <option key={j.title}>{j.title}</option>
          ))}
          <option>Initiativbewerbung</option>
        </select>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField label="Vor- und Nachname" autoComplete="name" error={errors.name?.message} {...register('name')} />
        <TextField label="Telefon" type="tel" inputMode="tel" autoComplete="tel" error={errors.phone?.message} {...register('phone')} />
      </div>
      <fieldset>
        <legend className="mb-2 text-sm font-medium">
          Wann können Sie arbeiten?{' '}
          <span aria-hidden className="text-blue">
            *
          </span>
        </legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {availability.map((a) => (
            <ChoiceCard key={a} value={a} label={a} className="p-3" {...register('availability')} />
          ))}
        </div>
        {errors.availability && (
          <p role="alert" className="mt-2 text-sm text-danger">
            {errors.availability.message}
          </p>
        )}
      </fieldset>
      <fieldset>
        <legend className="mb-2 text-sm font-medium">
          Führerschein Klasse B?{' '}
          <span aria-hidden className="text-blue">
            *
          </span>
        </legend>
        <div className="grid grid-cols-2 gap-2">
          <ChoiceCard type="radio" value="ja" label="Ja" className="p-3" {...register('license')} />
          <ChoiceCard type="radio" value="nein" label="Nein" className="p-3" {...register('license')} />
        </div>
        {errors.license && (
          <p role="alert" className="mt-2 text-sm text-danger">
            {errors.license.message}
          </p>
        )}
      </fieldset>
      <PrivacyCheckbox error={errors.privacy?.message} {...register('privacy')} />
      {error && (
        <p role="alert" className="rounded-xl bg-danger/10 p-4 text-sm text-danger">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={isSubmitting}
        className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-blue font-semibold text-white shadow-glow transition hover:bg-blue-hover disabled:opacity-70"
      >
        {isSubmitting && <Loader2 aria-hidden className="size-4 animate-spin" />}
        Bewerbung abschicken
      </button>
      <p className="text-center text-xs text-muted">Kein Lebenslauf nötig. Wir rufen Sie zurück.</p>
    </form>
  )
}
