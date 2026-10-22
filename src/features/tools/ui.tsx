import { useEffect, useId, useState, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

const field =
  'block w-full min-w-0 rounded-xl border-0 bg-white px-3.5 py-3 text-base text-ink shadow-[inset_0_0_0_1px_var(--color-line)] transition focus:shadow-[inset_0_0_0_2px_var(--color-blue)] focus:outline-none'

/** Zahlenfeld mit Einheit. Leeres Feld = null (bewusst keine erfundenen Startwerte). */
export function NumberInput({
  label,
  value,
  onChange,
  unit,
  step = 1,
  min = 0,
  hint,
  className,
}: {
  label: ReactNode
  value: number | null
  onChange: (v: number | null) => void
  unit?: string
  step?: number
  min?: number
  hint?: ReactNode
  className?: string
}) {
  const id = useId()
  const [text, setText] = useState(value === null ? '' : String(value).replace('.', ','))
  // Wert von außen (z. B. Zurücksetzen) übernehmen
  useEffect(() => {
    const parsed = text.trim() === '' ? null : Number(text.replace(',', '.'))
    if (parsed !== value) setText(value === null ? '' : String(value).replace('.', ','))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          inputMode="decimal"
          value={text}
          step={step}
          min={min}
          onChange={(e) => {
            const t = e.target.value.replace(/[^\d,.-]/g, '')
            setText(t)
            if (t.trim() === '') return onChange(null)
            const n = Number(t.replace(',', '.'))
            if (Number.isFinite(n)) onChange(Math.max(min, n))
          }}
          className={cn(field, unit && 'pr-14')}
          aria-describedby={hint ? `${id}-h` : undefined}
        />
        {unit && <span className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-sm text-muted">{unit}</span>}
      </div>
      {hint && (
        <p id={`${id}-h`} className="mt-1.5 text-xs leading-relaxed text-muted">
          {hint}
        </p>
      )}
    </div>
  )
}

export function TextInput({
  label,
  value,
  onChange,
  placeholder,
  className,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  className?: string
}) {
  const id = useId()
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
      </label>
      <input id={id} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={field} />
    </div>
  )
}

export function SelectInput<T extends string>({
  label,
  value,
  onChange,
  options,
  className,
}: {
  label: string
  value: T
  onChange: (v: T) => void
  options: { id: T; label: string }[]
  className?: string
}) {
  const id = useId()
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
      </label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value as T)} className={cn(field, 'appearance-none bg-[length:1rem] pr-10')}>
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export function DateInput({ label, value, onChange, className }: { label: string; value: string; onChange: (v: string) => void; className?: string }) {
  const id = useId()
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
      </label>
      <input id={id} type="date" value={value} onChange={(e) => onChange(e.target.value)} className={field} />
    </div>
  )
}

/** Segmentierte Auswahl (Radio-Gruppe) */
export function Segmented<T extends string>({
  label,
  value,
  onChange,
  options,
  className,
}: {
  label: string
  value: T
  onChange: (v: T) => void
  options: { id: T; label: string }[]
  className?: string
}) {
  const name = useId()
  return (
    <fieldset className={className}>
      <legend className="mb-1.5 block text-sm font-medium text-ink">{label}</legend>
      <div className="flex flex-wrap gap-1.5 rounded-2xl bg-glacier p-1.5">
        {options.map((o) => (
          <label key={o.id} className="flex-auto">
            <input type="radio" name={name} value={o.id} checked={value === o.id} onChange={() => onChange(o.id)} className="peer sr-only" />
            <span className="flex min-h-10 cursor-pointer items-center justify-center rounded-xl px-3 text-center text-sm leading-tight font-medium text-ink/75 transition peer-checked:bg-white peer-checked:text-blue-hover peer-checked:shadow-soft peer-focus-visible:ring-2 peer-focus-visible:ring-blue">
              {o.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

/** Ja/Nein-Schalter */
export function Toggle({ label, checked, onChange }: { label: ReactNode; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center justify-between gap-4 rounded-xl bg-white px-3.5 py-2 ring-1 ring-line">
      <span className="text-sm font-medium text-ink">{label}</span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" role="switch" />
      <span
        aria-hidden
        className="relative h-6 w-11 shrink-0 rounded-full bg-ink/15 transition peer-checked:bg-blue peer-focus-visible:ring-2 peer-focus-visible:ring-blue peer-focus-visible:ring-offset-2 after:absolute after:top-0.5 after:left-0.5 after:size-5 after:rounded-full after:bg-white after:shadow after:transition peer-checked:after:translate-x-5"
      />
    </label>
  )
}

/** Eingaben nur im eigenen Browser merken (bequem, nie zwingend) */
export function useLocalState<T>(key: string, initial: T) {
  const [v, setV] = useState<T>(initial)
  const [loaded, setLoaded] = useState(false)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key)
      if (raw) setV({ ...initial, ...JSON.parse(raw) })
    } catch {
      /* Speicher nicht verfügbar: ohne Merken weiter */
    }
    setLoaded(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
  useEffect(() => {
    if (!loaded) return
    try {
      localStorage.setItem(key, JSON.stringify(v))
    } catch {
      /* ignorieren */
    }
  }, [key, v, loaded])
  return [v, setV] as const
}
