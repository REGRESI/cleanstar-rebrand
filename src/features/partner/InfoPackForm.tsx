import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowDown, Loader2 } from 'lucide-react'
import downloads from 'virtual:downloads'
import { TextField, PrivacyCheckbox, Honeypot } from '@/features/forms/fields'
import { submitForm } from '@/features/forms/submit'
import { company } from '@/content/company'

const schema = z.object({
  name: z.string().trim().min(2, 'Bitte geben Sie Ihren Namen an.'),
  email: z.string().trim().email('Bitte prüfen Sie die E-Mail-Adresse.'),
  region: z.string().trim().min(2, 'Bitte geben Sie Ihre Region an.'),
  privacy: z.boolean().refine((v) => v, 'Bitte stimmen Sie der Datenverarbeitung zu.'),
  botcheck: z.string().optional(),
})
type Data = z.infer<typeof schema>

/**
 * Partner-Infomappe: kurzes Formular (Name, E-Mail, Region), danach sofortiger Download.
 * So erfahren wir, wer sich interessiert, und Interessenten müssen nicht auf eine E-Mail warten.
 */
export function InfoPackForm({ region }: { region: string }) {
  const d = downloads.partnerInfo
  const [state, setState] = useState<null | { preview: boolean }>(null)
  const [error, setError] = useState<string | null>(null)
  const { register, handleSubmit, formState } = useForm<Data>({
    resolver: zodResolver(schema),
    values: { name: '', email: '', region, privacy: false },
    resetOptions: { keepDirtyValues: true },
  })
  const { errors, isSubmitting } = formState

  const onSubmit = handleSubmit(async (v) => {
    setError(null)
    const res = await submitForm({
      subject: `Partner-Infomappe angefordert: ${v.name} (${v.region})`,
      replyTo: v.email,
      name: v.name,
      botcheck: v.botcheck,
      lines: [
        ['Name', v.name],
        ['E-Mail', v.email],
        ['Region', v.region],
      ],
    })
    if (!res.ok) return setError(`Senden fehlgeschlagen (${res.error}). Schreiben Sie uns gern an ${company.email}.`)
    setState({ preview: res.preview })
  })

  return (
    <div className="grid-site gap-y-10 border-y border-line py-10 lg:py-14">
      <div className="col-span-12 lg:col-span-5">
        <p className="t-label">Partner-Infomappe · PDF</p>
        <h3 className="t-h3 mt-4">Partner-Infomappe anfordern</h3>
        <p className="mt-4 text-ink-2">Das Partnerprogramm auf einen Blick: die zwei Wege, die Module, der Ablauf. Zum Lesen in Ruhe und zum Weitergeben an Ihre Steuerberatung.</p>
      </div>
      <div className="col-span-12 lg:col-span-6 lg:col-start-7">
        {state ? (
          <div role="status">
            <p className="t-h4">Danke. Hier ist Ihre Infomappe.</p>
            <a href={d.href} download={d.file} className="btn btn-outline mt-6">
              Infomappe herunterladen (PDF)
              <ArrowDown aria-hidden className="size-4" strokeWidth={1.75} />
            </a>
            {state.preview && (
              <p className="mt-6 flex gap-3 border-l border-ink pl-4 text-[0.9375rem] text-ink-2">
                <span>
                  <strong>Vorschau-Modus:</strong> Die Anfrage wurde nicht gesendet, weil noch kein Formular-Endpunkt eingetragen ist.
                </span>
              </p>
            )}
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate className="relative space-y-8">
            <Honeypot {...register('botcheck')} />
            <div className="grid grid-cols-1 gap-x-6 gap-y-7 sm:grid-cols-2">
              <TextField label="Name" autoComplete="name" error={errors.name?.message} {...register('name')} />
              <TextField label="E-Mail" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
            </div>
            <TextField label="Ihre Region" placeholder="Landkreis oder PLZ" error={errors.region?.message} {...register('region')} />
            <PrivacyCheckbox error={errors.privacy?.message} {...register('privacy')} />
            {error && (
              <p role="alert" className="border-l border-danger pl-4 text-[0.9375rem] text-danger">
                {error}
              </p>
            )}
            <button type="submit" disabled={isSubmitting} className="btn btn-primary">
              Infomappe anfordern
              {isSubmitting ? <Loader2 aria-hidden className="size-4 animate-spin" /> : <ArrowDown aria-hidden className="size-4" strokeWidth={1.75} />}
            </button>
            <p className="font-mono text-[0.75rem] text-muted">Kostenlos und unverbindlich. Der Download startet direkt nach dem Absenden.</p>
          </form>
        )}
      </div>
    </div>
  )
}
