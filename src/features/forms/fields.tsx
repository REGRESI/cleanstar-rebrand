import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react'
import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import { cn } from '@/lib/cn'

const inputCls =
  'block w-full rounded-xl border-0 bg-white px-4 py-3.5 text-base text-ink shadow-[inset_0_0_0_1px_var(--color-line)] transition placeholder:text-muted/70 focus:shadow-[inset_0_0_0_2px_var(--color-blue)] focus:outline-none aria-[invalid=true]:shadow-[inset_0_0_0_2px_var(--color-danger)]'

export const TextField = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; hint?: ReactNode; optional?: boolean }>(
  function TextField({ label, error, hint, optional, className, id, ...rest }, ref) {
    const uid = useId()
    const fid = id ?? uid
    return (
      <div className={className}>
        <label htmlFor={fid} className="mb-1.5 block text-sm font-medium text-ink">
          {label}{' '}
          {optional ? (
            <span className="font-normal text-muted">(optional)</span>
          ) : (
            <span aria-hidden className="text-blue">
              *
            </span>
          )}
        </label>
        <input ref={ref} id={fid} aria-invalid={!!error} aria-describedby={error ? `${fid}-e` : hint ? `${fid}-h` : undefined} className={inputCls} {...rest} />
        {hint && !error && (
          <p id={`${fid}-h`} className="mt-1.5 text-xs text-muted">
            {hint}
          </p>
        )}
        {error && (
          <p id={`${fid}-e`} role="alert" className="mt-1.5 text-sm text-danger">
            {error}
          </p>
        )}
      </div>
    )
  },
)

export const TextArea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; error?: string; optional?: boolean }>(function TextArea(
  { label, error, optional, className, id, ...rest },
  ref,
) {
  const uid = useId()
  const fid = id ?? uid
  return (
    <div className={className}>
      <label htmlFor={fid} className="mb-1.5 block text-sm font-medium text-ink">
        {label} {optional && <span className="font-normal text-muted">(optional)</span>}
      </label>
      <textarea ref={ref} id={fid} rows={4} aria-invalid={!!error} className={cn(inputCls, 'resize-y')} {...rest} />
      {error && (
        <p role="alert" className="mt-1.5 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  )
})

/** Auswahlkarte für Radio/Checkbox */
export const ChoiceCard = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { label: ReactNode; description?: ReactNode; icon?: ReactNode }>(function ChoiceCard(
  { label, description, icon, type = 'checkbox', className, ...rest },
  ref,
) {
  return (
    <label className={cn('group relative isolate flex cursor-pointer items-start gap-3 rounded-2xl bg-white p-4', className)}>
      <input ref={ref} type={type} className="peer sr-only" {...rest} />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 rounded-2xl ring-1 ring-line transition group-hover:ring-blue/40 peer-checked:bg-blue/[0.04] peer-checked:ring-2 peer-checked:ring-blue peer-focus-visible:ring-2 peer-focus-visible:ring-blue"
      />
      {icon && <span className="mt-0.5 text-blue">{icon}</span>}
      <span className="min-w-0 flex-1 hyphens-auto break-words">
        <span className="block font-medium text-ink">{label}</span>
        {description && <span className="mt-0.5 block text-sm text-muted">{description}</span>}
      </span>
      <span
        aria-hidden
        className={cn(
          'grid size-5 shrink-0 place-items-center border border-ink/20 text-transparent transition peer-checked:border-blue peer-checked:bg-blue peer-checked:text-white',
          type === 'radio' ? 'rounded-full' : 'rounded-md',
        )}
      >
        <Check className="size-3.5" strokeWidth={3} />
      </span>
    </label>
  )
})

/** Datenschutz-Einwilligung mit Link zur Datenschutzerklärung */
export const PrivacyCheckbox = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { error?: string }>(function PrivacyCheckbox({ error, ...rest }, ref) {
  const id = useId()
  return (
    <div>
      <div className="flex items-start gap-3">
        <input ref={ref} id={id} type="checkbox" aria-invalid={!!error} className="mt-1 size-5 shrink-0 accent-blue" {...rest} />
        <label htmlFor={id} className="text-sm leading-relaxed text-muted">
          Ich bin einverstanden, dass meine Angaben zur Bearbeitung meiner Anfrage verarbeitet werden. Details in der{' '}
          <Link to="/datenschutz" target="_blank" className="font-medium text-blue underline underline-offset-2">
            Datenschutzerklärung
          </Link>
          . Die Einwilligung kann ich jederzeit widerrufen.{' '}
          <span aria-hidden className="text-blue">
            *
          </span>
        </label>
      </div>
      {error && (
        <p role="alert" className="mt-1.5 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  )
})

/** Unsichtbares Honeypot-Feld gegen Spam-Bots */
export const Honeypot = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Honeypot(props, ref) {
  return (
    <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label>
        Bitte leer lassen
        <input ref={ref} type="text" tabIndex={-1} autoComplete="off" {...props} />
      </label>
    </div>
  )
})

export function FormNote({ children }: { children: ReactNode }) {
  return <p className="text-xs leading-relaxed text-muted">{children}</p>
}
