import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowRight, Loader2 } from 'lucide-react'
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
      <div role="status" className="border-t border-line pt-8">
        <p className="t-label">Gesendet</p>
        <h3 className="t-h3 mt-4">Danke für Ihre Nachricht.</h3>
        <p className="mt-3 text-ink-2">Wir melden uns innerhalb von {company.promises.responseHours} Stunden.</p>
        {state.preview && (
          <p className="mt-6 flex gap-3 border-l border-ink pl-4 text-[0.9375rem] text-ink-2">
            <span>
              <strong>Vorschau-Modus:</strong> Es ist noch kein Formular-Endpunkt eingetragen. Die Nachricht wurde nicht gesendet.
            </span>
          </p>
        )}
        <button type="button" onClick={() => setState(null)} className="ulink mt-6 font-medium text-ink">
          Weitere Nachricht schreiben
        </button>
      </div>
    )

  return (
    <form onSubmit={onSubmit} noValidate className="relative space-y-8">
      <Honeypot {...register('botcheck')} />
      <div className="grid grid-cols-1 gap-x-6 gap-y-7 sm:grid-cols-2">
        <TextField label="Name" autoComplete="name" error={errors.name?.message} {...register('name')} />
        <TextField label="Unternehmen" optional autoComplete="organization" {...register('company')} />
        <TextField label="E-Mail" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
        <TextField label="Telefon" type="tel" optional autoComplete="tel" {...register('phone')} />
      </div>
      <TextArea label="Ihre Nachricht" error={errors.message?.message} {...register('message')} />
      <PrivacyCheckbox error={errors.privacy?.message} {...register('privacy')} />
      {error && (
        <p role="alert" className="border-l border-danger pl-4 text-[0.9375rem] text-danger">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={isSubmitting}
        className="btn btn-primary"
      >
        Nachricht senden
        {isSubmitting ? <Loader2 aria-hidden className="size-4 animate-spin" /> : <ArrowRight aria-hidden className="btn-arrow size-4" strokeWidth={1.75} />}
      </button>
    </form>
  )
}
