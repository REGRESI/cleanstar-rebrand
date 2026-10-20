import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Download, FileText, Info, Loader2 } from 'lucide-react'
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
    <div className="relative overflow-hidden rounded-panel bg-white shadow-soft ring-1 ring-line">
      <div className="grid grid-cols-1 lg:grid-cols-12">
        <div className="relative bg-glacier p-6 sm:p-10 lg:col-span-5">
          <div aria-hidden className="absolute -top-16 -right-16 size-56 rounded-full bg-blue/15 blur-3xl" />
          <div aria-hidden className="relative h-44 w-36 rotate-[-4deg] rounded-lg bg-white p-4 shadow-lift ring-1 ring-line">
            <FileText className="size-6 text-blue" />
            <p className="mt-2 text-[0.625rem] font-semibold tracking-wide text-ink uppercase">Partner-Infomappe</p>
            <div className="mt-3 space-y-1.5">
              {[85, 60, 75, 50, 70].map((w, i) => (
                <span key={i} className="block h-1.5 rounded-full bg-ink/15" style={{ width: `${w}%` }} />
              ))}
            </div>
          </div>
          <h3 className="relative mt-8 text-2xl font-semibold tracking-tight">Partner-Infomappe anfordern</h3>
          <p className="relative mt-3 text-muted">
            Das Partnerprogramm auf einen Blick: die zwei Wege, die Module, der Ablauf. Zum Lesen in Ruhe und zum Weitergeben an Ihre Steuerberatung.
          </p>
        </div>
        <div className="p-6 sm:p-10 lg:col-span-7">
          {state ? (
            <div role="status">
              <p className="text-xl font-semibold">Danke. Hier ist Ihre Infomappe.</p>
              <a href={d.href} download={d.file} className="mt-5 inline-flex h-12 items-center gap-2 rounded-full bg-ink px-6 font-semibold text-white transition hover:bg-ink-3">
                <Download aria-hidden className="size-4" />
                Infomappe herunterladen (PDF)
              </a>
              {state.preview && (
                <p className="mt-5 flex gap-3 rounded-xl bg-amber-50 p-4 text-sm text-amber-900 ring-1 ring-amber-200">
                  <Info aria-hidden className="size-5 shrink-0" />
                  <span>
                    <strong>Vorschau-Modus:</strong> Die Anfrage wurde nicht gesendet, weil noch kein Formular-Endpunkt eingetragen ist.
                  </span>
                </p>
              )}
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate className="relative space-y-4">
              <Honeypot {...register('botcheck')} />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <TextField label="Name" autoComplete="name" error={errors.name?.message} {...register('name')} />
                <TextField label="E-Mail" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
              </div>
              <TextField label="Ihre Region" placeholder="Landkreis oder PLZ" error={errors.region?.message} {...register('region')} />
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
                {isSubmitting ? <Loader2 aria-hidden className="size-4 animate-spin" /> : <Download aria-hidden className="size-4" />}
                Infomappe anfordern
              </button>
              <p className="text-xs text-muted">Kostenlos und unverbindlich. Der Download startet direkt nach dem Absenden.</p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
