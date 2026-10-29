import { useId, useState } from 'react'
import { hourlyRateNetMax, hourlyRateNetMin, pricing } from '@/content/pricing'
import { formatNumber, formatEuroRange } from '@/lib/format'
import { QuoteButton } from '@/features/configurator/QuoteLink'
import { PerEmployee } from './PerEmployee'

export function Range({
  label,
  value,
  onChange,
  min,
  max,
  step,
  unit,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  min: number
  max: number
  step: number
  unit: string
}) {
  const id = useId()
  return (
    <div>
      <label htmlFor={id} className="flex flex-wrap items-baseline justify-between gap-x-3 text-ink">
        <span className="field-label min-w-0">{label}</span>
        <span className="text-[1.5rem] font-medium tracking-[-0.02em] whitespace-nowrap tabular-nums">
          {formatNumber(value)} {unit}
        </span>
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-valuetext={`${formatNumber(value)} ${unit}`}
        className="range mt-4"
      />
    </div>
  )
}

/** Kleines Modul „Was kostet das pro Mitarbeiter?“ für die Büroreinigungs-Seite */
export function PerEmployeeCalculator() {
  const [employees, setEmployees] = useState(15)
  const [hours, setHours] = useState(8)
  const month = hours * pricing.weeksPerMonth
  const netMin = month * hourlyRateNetMin()
  const netMax = month * hourlyRateNetMax()
  return (
    <div className="grid-site gap-y-12 border-t border-line pt-8 lg:pt-10">
      <div className="col-span-12 space-y-9 lg:col-span-5">
        <Range label="Mitarbeiter in Ihren Räumen" value={employees} onChange={setEmployees} min={1} max={150} step={1} unit="Personen" />
        <Range label="Stunden pro Woche" value={hours} onChange={setHours} min={1} max={60} step={0.5} unit="Std." />
        <p className="text-[0.9375rem] text-ink-2">
          Das entspricht rund {formatEuroRange(netMin, netMax)} netto im Monat. Wie viele Stunden Ihr Objekt braucht, sehen wir bei der kostenlosen Besichtigung.
        </p>
      </div>
      <div className="col-span-12 flex flex-col justify-between gap-8 lg:col-span-6 lg:col-start-7">
        <PerEmployee netMin={netMin} netMax={netMax} employees={employees} />
        <div>
          <QuoteButton arrow>Genaues Angebot anfragen</QuoteButton>
        </div>
      </div>
    </div>
  )
}
