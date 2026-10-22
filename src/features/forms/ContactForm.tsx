import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle2, Info, Loader2, Send } from 'lucide-react'
import { TextField, TextArea, PrivacyCheckbox, Honeypot } from './fields'
import { submitForm } from './submit'
import { company } from '@/content/company'

const schema = z.object({
  name: z.string().trim().min(2, 'Bitte geben Sie Ihren Namen an.'),
  company: z.string().optional(),
  email: z.string().trim().email('Bitte prüfen Sie die E-Mail-Adresse.'),
  phone: z.string().optional(),
  message: z.string().trim().min(10, 'Bitte schreiben Sie uns kurz, worum es geht.').max(3000),
  privacy: z.boolean().refine((v) => v, 'Bitte stimmen Sie der Datenverarbeitung zu.'),
  botcheck: z.string().optional(),
})
type Data = z.infer<typeof schema>

export function ContactForm() {
  const [state, setState] = useState<null | { preview: boolean }>(null)
  const [error, setError] = useState<string | null>(null)
  const { register, handleSubmit, formState, reset } = useForm<Data>({ resolver: zodResolver(schema), defaultValues: { privacy: false } })
  const { errors, isSubmitting } = formState

  const onSubmit = handleSubmit(async (d) => {
    setError(null)
    const res = await submitForm({
      subject: `Kontaktanfrage: ${d.name}${d.company ? ` (${d.company})` : ''}`,
      replyTo: d.email,
      name: d.name,
      botcheck: d.botcheck,
      lines: [
        ['Name', d.name],
        ['Unternehmen', d.company ?? ''],
        ['E-Mail', d.email],
        ['Telefon', d.phone ?? ''],
        ['Nachricht', d.message],
      ],
    })
    if (!res.ok) return setError(`Senden fehlgeschlagen (${res.error}). Bitte schreiben Sie direkt an ${company.email}.`)
    setState({ preview: res.preview })
    reset()
  })

  if (state)
    return (
      <div role="status" className="rounded-panel bg-white p-8 ring-1 ring-line">
        <CheckCircle2 aria-hidden className="size-10 text-fresh-ink" />
        <h3 className="mt-4 text-2xl font-semibold tracking-tight">Danke für Ihre Nachricht.</h3>
        <p className="mt-2 text-muted">Wir melden uns innerhalb von {company.promises.responseHours} Stunden.</p>
        {state.preview && (
          <p className="mt-5 flex gap-3 rounded-xl bg-amber-50 p-4 text-sm text-amber-900 ring-1 ring-amber-200">
            <Info aria-hidden className="size-5 shrink-0" />
            <span>
              <strong>Vorschau-Modus:</strong> Es ist noch kein Formular-Endpunkt eingetragen. Die Nachricht wurde nicht gesendet.
            </span>
          </p>
        )}
        <button type="button" onClick={() => setState(null)} className="mt-6 font-semibold text-blue">
          Weitere Nachricht schreiben
        </button>
      </div>
    )

  return (
    <form onSubmit={onSubmit} noValidate className="relative space-y-5 rounded-panel bg-white p-6 ring-1 ring-line sm:p-8">
      <Honeypot {...register('botcheck')} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField label="Name" autoComplete="name" error={errors.name?.message} {...register('name')} />
        <TextField label="Unternehmen" optional autoComplete="organization" {...register('company')} />
        <TextField label="E-Mail" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
        <TextField label="Telefon" type="tel" optional autoComplete="tel" {...register('phone')} />
      </div>
      <TextArea label="Ihre Nachricht" error={errors.message?.message} {...register('message')} />
      <PrivacyCheckbox error={errors.privacy?.message} {...register('privacy')} />
      {error && (
        <p role="alert" className="rounded-xl bg-danger/10 p-4 text-sm text-danger">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex h-12 items-center gap-2 rounded-full bg-blue px-6 font-semibold text-white shadow-glow transition hover:bg-blue-hover disabled:opacity-70"
      >
        {isSubmitting ? <Loader2 aria-hidden className="size-4 animate-spin" /> : <Send aria-hidden className="size-4" />}
        Nachricht senden
      </button>
    </form>
  )
}
