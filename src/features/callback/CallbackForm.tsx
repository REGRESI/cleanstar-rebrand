import { useId, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { Honeypot, PrivacyCheckbox, TextField } from '@/features/forms/fields'
import { submitForm } from '@/features/forms/submit'
import { company } from '@/content/company'

const when = [
  { id: 'sofort', label: 'So schnell wie möglich' },
  { id: 'heute', label: 'Heute um …' },
  { id: 'morgen', label: 'Morgen um …' },
] as const

const schema = z
  .object({
    name: z.string().trim().min(2, 'Bitte geben Sie Ihren Namen an.'),
    phone: z
      .string()
      .trim()
      .regex(/^[+0-9 ()/-]{6,}$/, 'Bitte prüfen Sie die Telefonnummer.'),
    when: z.enum(['sofort', 'heute', 'morgen']),
    time: z.string().optional(),
    topic: z.string().max(500).optional(),
    privacy: z.boolean().refine((v) => v, 'Bitte stimmen Sie der Datenverarbeitung zu.'),
    botcheck: z.string().optional(),
  })
  .refine((d) => d.when === 'sofort' || !!d.time, { path: ['time'], message: 'Bitte wählen Sie eine Uhrzeit.' })
type Data = z.infer<typeof schema>

const fmtDay = (offset: number) => {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  return d.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })
}

/** Formular „Rückruf anfordern“: Name, Telefonnummer, Wunschzeit. Versand über Web3Forms. */
export default function CallbackForm({ onDone }: { onDone?: () => void }) {
  const [sent, setSent] = useState<null | { preview: boolean; when: string }>(null)
  const [error, setError] = useState<string | null>(null)
  const timeId = useId()
  const { register, handleSubmit, watch, formState } = useForm<Data>({
    resolver: zodResolver(schema),
    defaultValues: { when: 'sofort', privacy: false },
  })
  const { errors, isSubmitting } = formState
  const w = watch('when')

  const onSubmit = handleSubmit(async (d) => {
    setError(null)
    const wish = d.when === 'sofort' ? 'So schnell wie möglich' : `${d.when === 'heute' ? 'Heute' : 'Morgen'}, ${fmtDay(d.when === 'heute' ? 0 : 1)}, um ${d.time} Uhr`
    const res = await submitForm({
      subject: `Rückruf: ${d.name}, ${wish}`,
      name: d.name,
      botcheck: d.botcheck,
      lines: [
        ['Name', d.name],
        ['Telefon', d.phone],
        ['Wunschzeit', wish],
        ['Anliegen', d.topic ?? ''],
        ['Seite', typeof location !== 'undefined' ? location.pathname : ''],
      ],
    })
    if (!res.ok) return setError(`Senden fehlgeschlagen (${res.error}). Bitte rufen Sie uns direkt an: ${company.phone.display}.`)
    setSent({ preview: res.preview, when: wish })
  })

  if (sent)
    return (
      <div role="status" className="p-7 sm:p-10">
        <p className="t-label">Gesendet</p>
        <h2 className="t-h3 mt-4">Wir rufen Sie zur gewünschten Zeit an.</h2>
        <p className="mt-3 text-ink-2">Ihre Wunschzeit: {sent.when}.</p>
        {sent.preview && (
          <p className="mt-6 flex gap-3 border-l border-ink pl-4 text-[0.9375rem] text-ink-2">
            <span>
              <strong>Vorschau-Modus:</strong> Es ist kein Formular-Endpunkt eingetragen. Die Anfrage wurde nicht gesendet.
            </span>
          </p>
        )}
        <button type="button" onClick={onDone} className="btn btn-outline mt-6">
          Schließen
        </button>
      </div>
    )

  return (
    <form onSubmit={onSubmit} noValidate className="relative space-y-8 p-7 sm:p-10">
      <div className="pr-10">
        <p className="t-label">{company.availability}</p>
        <h2 className="t-h3 mt-3">Rückruf anfordern</h2>
        <p className="mt-2 text-ink-2">Sagen Sie uns, wann es Ihnen passt. Wir rufen Sie an.</p>
      </div>
      <Honeypot {...register('botcheck')} />
      <div className="grid grid-cols-1 gap-x-6 gap-y-7 sm:grid-cols-2">
        <TextField label="Name" autoComplete="name" data-autofocus error={errors.name?.message} {...register('name')} />
        <TextField label="Telefonnummer" type="tel" inputMode="tel" autoComplete="tel" error={errors.phone?.message} {...register('phone')} />
      </div>
      <fieldset>
        <legend className="field-label mb-3">Wunschzeit</legend>
        <div className="grid grid-cols-1 gap-2 min-[400px]:grid-cols-3">
          {when.map((o) => (
            <label key={o.id} className="relative">
              <input type="radio" value={o.id} className="peer sr-only" {...register('when')} />
              <span className="choice cursor-pointer justify-center text-center text-[0.9375rem] font-normal peer-checked:bg-ink peer-checked:text-paper peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-blue">
                {o.label}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      {w !== 'sofort' && (
        <div>
          <label htmlFor={timeId} className="field-label mb-1">
            Uhrzeit ({w === 'heute' ? 'heute' : fmtDay(1)})
          </label>
          <input id={timeId} type="time" step={900} aria-invalid={!!errors.time} className="field block sm:max-w-48" {...register('time')} />
          {errors.time && (
            <p role="alert" className="mt-2 text-[0.875rem] text-danger">
              {errors.time.message}
            </p>
          )}
        </div>
      )}
      <TextField label="Worum geht es?" optional placeholder="z. B. Büroreinigung, ca. 300 m²" {...register('topic')} />
      <PrivacyCheckbox error={errors.privacy?.message} {...register('privacy')} />
      {error && (
        <p role="alert" className="border-l border-danger pl-4 text-[0.9375rem] text-danger">
          {error}
        </p>
      )}
      <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full sm:w-auto">
        Rückruf anfordern
        {isSubmitting && <Loader2 aria-hidden className="size-4 animate-spin" />}
      </button>
    </form>
  )
}
