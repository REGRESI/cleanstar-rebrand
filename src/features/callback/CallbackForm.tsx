import { useId, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle2, Info, Loader2, PhoneIncoming } from 'lucide-react'
import { Honeypot, PrivacyCheckbox, TextField } from '@/features/forms/fields'
import { submitForm } from '@/features/forms/submit'
import { company } from '@/content/company'
import { cn } from '@/lib/cn'

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
    const wish = d.when === 'sofort' ? 'So schnell wie möglich' : `${d.when === 'heute' ? 'Heute' : 'Morgen'}, ${fmtDay(d.when === 'heute' ? 0 : 1)}, um ${d.time} Uhr`
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
      <div role="status" className="p-6 sm:p-8">
        <CheckCircle2 aria-hidden className="size-10 text-fresh-ink" />
        <h2 className="mt-4 text-2xl font-semibold tracking-tight">Wir rufen Sie zur gewünschten Zeit an.</h2>
        <p className="mt-2 text-muted">Ihre Wunschzeit: {sent.when}.</p>
        {sent.preview && (
          <p className="mt-5 flex gap-3 rounded-xl bg-amber-50 p-4 text-sm text-amber-900 ring-1 ring-amber-200">
            <Info aria-hidden className="size-5 shrink-0" />
            <span>
              <strong>Vorschau-Modus:</strong> Es ist kein Formular-Endpunkt eingetragen. Die Anfrage wurde nicht gesendet.
            </span>
          </p>
        )}
        <button type="button" onClick={onDone} className="mt-6 inline-flex min-h-11 items-center rounded-full bg-ink px-5 font-semibold text-white">
          Schließen
        </button>
      </div>
    )

  return (
    <form onSubmit={onSubmit} noValidate className="relative space-y-5 p-6 sm:p-8">
      <div className="pr-10">
        <p className="flex items-center gap-2 text-sm font-semibold text-blue-hover">
          <PhoneIncoming aria-hidden className="size-4" />
          {company.availability}
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">Rückruf anfordern</h2>
        <p className="mt-1 text-muted">Sagen Sie uns, wann es Ihnen passt. Wir rufen Sie an.</p>
      </div>
      <Honeypot {...register('botcheck')} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField label="Name" autoComplete="name" data-autofocus error={errors.name?.message} {...register('name')} />
        <TextField label="Telefonnummer" type="tel" inputMode="tel" autoComplete="tel" error={errors.phone?.message} {...register('phone')} />
      </div>
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-ink">Wunschzeit</legend>
        <div className="grid grid-cols-1 gap-2 min-[400px]:grid-cols-3">
          {when.map((o) => (
            <label key={o.id} className="relative">
              <input type="radio" value={o.id} className="peer sr-only" {...register('when')} />
              <span
                className={cn(
                  'flex min-h-12 cursor-pointer items-center justify-center rounded-xl bg-white px-3 text-center text-sm leading-tight font-medium ring-1 ring-line transition',
                  'peer-checked:bg-blue-soft/50 peer-checked:text-blue-hover peer-checked:ring-2 peer-checked:ring-blue peer-focus-visible:ring-2 peer-focus-visible:ring-blue',
                )}
              >
                {o.label}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      {w !== 'sofort' && (
        <div>
          <label htmlFor={timeId} className="mb-1.5 block text-sm font-medium text-ink">
            Uhrzeit ({w === 'heute' ? 'heute' : fmtDay(1)})
          </label>
          <input
            id={timeId}
            type="time"
            step={900}
            aria-invalid={!!errors.time}
            className="block w-full rounded-xl border-0 bg-white px-4 py-3.5 text-base text-ink shadow-[inset_0_0_0_1px_var(--color-line)] focus:shadow-[inset_0_0_0_2px_var(--color-blue)] focus:outline-none sm:max-w-48"
            {...register('time')}
          />
          {errors.time && (
            <p role="alert" className="mt-1.5 text-sm text-danger">
              {errors.time.message}
            </p>
          )}
        </div>
      )}
      <TextField label="Worum geht es?" optional placeholder="z. B. Büroreinigung, ca. 300 m²" {...register('topic')} />
      <PrivacyCheckbox error={errors.privacy?.message} {...register('privacy')} />
      {error && (
        <p role="alert" className="rounded-xl bg-danger/10 p-4 text-sm text-danger">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-blue px-6 font-semibold text-white shadow-glow transition hover:bg-blue-hover active:bg-blue-hover disabled:opacity-70 sm:w-auto"
      >
        {isSubmitting ? <Loader2 aria-hidden className="size-4 animate-spin" /> : <PhoneIncoming aria-hidden className="size-4" />}
        Rückruf anfordern
      </button>
    </form>
  )
}
