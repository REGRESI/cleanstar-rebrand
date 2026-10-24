import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
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
      <div role="status" className="border-t border-line pt-8">
        <p className="t-label">Gesendet</p>
        <h3 className="t-h3 mt-4">Danke für Ihre Bewerbung.</h3>
        <p className="mt-3 text-ink-2">Wir rufen Sie in den nächsten Tagen an.</p>
        {done.preview && (
          <p className="mt-6 flex gap-3 border-l border-ink pl-4 text-[0.9375rem] text-ink-2">
            <span>
              <strong>Vorschau-Modus:</strong> Es ist noch kein Formular-Endpunkt eingetragen. Die Bewerbung wurde nicht gesendet.
            </span>
          </p>
        )}
      </div>
    )

  return (
    <form onSubmit={onSubmit} noValidate className="relative space-y-8">
      <Honeypot {...register('botcheck')} />
      <div>
        <label htmlFor="app-job" className="field-label mb-1">
          Stelle{' '}
          <span aria-hidden className="text-muted">
            *
          </span>
        </label>
        <select id="app-job" className="field block" {...register('job')}>
          {open.map((j) => (
            <option key={j.title}>{j.title}</option>
          ))}
          <option>Initiativbewerbung</option>
        </select>
      </div>
      <div className="grid grid-cols-1 gap-x-6 gap-y-7 sm:grid-cols-2">
        <TextField label="Vor- und Nachname" autoComplete="name" error={errors.name?.message} {...register('name')} />
        <TextField label="Telefon" type="tel" inputMode="tel" autoComplete="tel" error={errors.phone?.message} {...register('phone')} />
      </div>
      <fieldset>
        <legend className="field-label mb-3">
          Wann können Sie arbeiten?{' '}
          <span aria-hidden className="text-muted">
            *
          </span>
        </legend>
        <div className="grid grid-cols-1 gap-2 min-[440px]:grid-cols-2 sm:grid-cols-3">
          {availability.map((a) => (
            <ChoiceCard key={a} value={a} label={a} {...register('availability')} />
          ))}
        </div>
        {errors.availability && (
          <p role="alert" className="mt-2 text-[0.875rem] text-danger">
            {errors.availability.message}
          </p>
        )}
      </fieldset>
      <fieldset>
        <legend className="field-label mb-3">
          Führerschein Klasse B?{' '}
          <span aria-hidden className="text-muted">
            *
          </span>
        </legend>
        <div className="grid grid-cols-2 gap-2">
          <ChoiceCard type="radio" value="ja" label="Ja" {...register('license')} />
          <ChoiceCard type="radio" value="nein" label="Nein" {...register('license')} />
        </div>
        {errors.license && (
          <p role="alert" className="mt-2 text-[0.875rem] text-danger">
            {errors.license.message}
          </p>
        )}
      </fieldset>
      <PrivacyCheckbox error={errors.privacy?.message} {...register('privacy')} />
      {error && (
        <p role="alert" className="border-l border-danger pl-4 text-[0.9375rem] text-danger">
          {error}
        </p>
      )}
      <button type="submit" disabled={isSubmitting} className="btn btn-primary btn-lg w-full">
        {isSubmitting && <Loader2 aria-hidden className="size-4 animate-spin" />}
        Bewerbung abschicken
      </button>
      <p className="font-medium tabular-nums text-[0.75rem] text-muted">Kein Lebenslauf nötig. Wir rufen Sie zurück.</p>
    </form>
  )
}
