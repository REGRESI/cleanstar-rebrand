import { useEffect, useId, useState, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

/** Eingabefeld mit Linie unten (siehe .field in index.css) */
const field = 'field block min-w-0'
const labelCls = 'field-label mb-1'

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
      <label htmlFor={id} className={labelCls}>
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
        {unit && <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center font-mono text-[0.8125rem] text-muted">{unit}</span>}
      </div>
      {hint && (
        <p id={`${id}-h`} className="mt-2 text-[0.8125rem] leading-relaxed text-muted">
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
      <label htmlFor={id} className={labelCls}>
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
      <label htmlFor={id} className={labelCls}>
        {label}
      </label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value as T)} className={cn(field, 'pr-8')}>
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
      <label htmlFor={id} className={labelCls}>
        {label}
      </label>
      <input id={id} type="date" value={value} onChange={(e) => onChange(e.target.value)} className={field} />
    </div>
  )
}

/** Rechteckige Segmente ohne eigenes Label (Radio-Gruppe): 1-px-Rahmen, gewählt = dunkel gefüllt */
export function Segments<T extends string>({
  name,
  value,
  onChange,
  options,
  className,
}: {
  name: string
  value: T
  onChange: (v: T) => void
  options: { id: T; label: string }[]
  className?: string
}) {
  return (
    <div className={cn('flex flex-wrap shadow-[inset_0_0_0_1px_var(--color-line-strong)]', className)}>
      {options.map((o) => (
        <label key={o.id} className="flex-auto">
          <input type="radio" name={name} value={o.id} checked={value === o.id} onChange={() => onChange(o.id)} className="peer sr-only" />
          <span className="flex min-h-11 cursor-pointer items-center justify-center px-3 text-center text-[0.9375rem] leading-tight text-ink-2 transition-colors duration-300 peer-checked:bg-ink peer-checked:text-paper peer-focus-visible:outline-2 peer-focus-visible:outline-blue hover:text-ink">
            {o.label}
          </span>
        </label>
      ))}
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
      <legend className="field-label mb-3">{label}</legend>
      <Segments name={name} value={value} onChange={onChange} options={options} />
    </fieldset>
  )
}

/** Ja/Nein-Schalter */
export function Toggle({ label, checked, onChange }: { label: ReactNode; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex min-h-12 cursor-pointer items-center justify-between gap-4 border-b border-line py-2">
      <span className="text-[1rem] text-ink">{label}</span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" role="switch" />
      <span
        aria-hidden
        className="relative h-6 w-11 shrink-0 shadow-[inset_0_0_0_1px_var(--color-line-strong)] transition-colors duration-300 peer-checked:bg-ink peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-blue after:absolute after:top-1 after:left-1 after:size-4 after:bg-ink after:transition-transform after:duration-300 peer-checked:after:translate-x-5 peer-checked:after:bg-paper"
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
