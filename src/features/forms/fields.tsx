import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react'
import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import { cn } from '@/lib/cn'

/** Eingabefeld mit Linie unten (siehe .field in index.css) */
const inputCls = 'field block'

export const TextField = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; hint?: ReactNode; optional?: boolean }>(
  function TextField({ label, error, hint, optional, className, id, ...rest }, ref) {
    const uid = useId()
    const fid = id ?? uid
    return (
      <div className={className}>
        <label htmlFor={fid} className="field-label mb-1">
          {label}{' '}
          {optional ? (
            <span className="tabular-nums text-[0.75rem] font-normal text-muted">optional</span>
          ) : (
            <span aria-hidden className="text-muted">
              *
            </span>
          )}
        </label>
        <input ref={ref} id={fid} aria-invalid={!!error} aria-describedby={error ? `${fid}-e` : hint ? `${fid}-h` : undefined} className={inputCls} {...rest} />
        {hint && !error && (
          <p id={`${fid}-h`} className="mt-2 text-[0.8125rem] text-muted">
            {hint}
          </p>
        )}
        {error && (
          <p id={`${fid}-e`} role="alert" className="mt-2 text-[0.875rem] text-danger">
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
      <label htmlFor={fid} className="field-label mb-1">
        {label} {optional && <span className="tabular-nums text-[0.75rem] font-normal text-muted">optional</span>}
      </label>
      <textarea ref={ref} id={fid} rows={4} aria-invalid={!!error} className={cn(inputCls, 'resize-y')} {...rest} />
      {error && (
        <p role="alert" className="mt-2 text-[0.875rem] text-danger">
          {error}
        </p>
      )}
    </div>
  )
})

/** Rechteckige Auswahlfläche für Radio/Checkbox (gewählt = dunkel gefüllt, siehe .choice) */
export const ChoiceCard = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { label: ReactNode; description?: ReactNode; icon?: ReactNode }>(function ChoiceCard(
  { label, description, type = 'checkbox', className, ...rest },
  ref,
) {
  return (
    <label className={cn('block cursor-pointer', className)}>
      <input ref={ref} type={type} className="peer sr-only" {...rest} />
      <span className="choice h-full items-start">
        <span className="min-w-0 flex-1">
          <span className="block">{label}</span>
          {description && <span className="mt-0.5 block text-[0.875rem] font-normal opacity-70">{description}</span>}
        </span>
        <span aria-hidden className={cn('mt-1 grid size-4 shrink-0 place-items-center border border-current', type === 'radio' && 'rounded-full')}>
          <Check className="size-3 opacity-0 [:checked+.choice_&]:opacity-100" strokeWidth={3} />
        </span>
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
        <input ref={ref} id={id} type="checkbox" aria-invalid={!!error} className="mt-1 size-[1.125rem] shrink-0 accent-ink" {...rest} />
        <label htmlFor={id} className="text-[0.9375rem] leading-relaxed text-ink-2">
          Ich bin einverstanden, dass meine Angaben zur Bearbeitung meiner Anfrage verarbeitet werden. Details in der{' '}
          <Link to="/datenschutz" target="_blank" className="link">
            Datenschutzerklärung
          </Link>
          . Die Einwilligung kann ich jederzeit widerrufen.{' '}
          <span aria-hidden className="text-muted">
            *
          </span>
        </label>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-[0.875rem] text-danger">
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
  return <p className="font-medium tabular-nums text-[0.75rem] leading-relaxed text-muted">{children}</p>
}
