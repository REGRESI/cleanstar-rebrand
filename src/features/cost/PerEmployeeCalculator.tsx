import { useId, useState } from 'react'
import { hourlyRateNetMax, hourlyRateNetMin, pricing } from '@/content/pricing'
import { formatNumber, formatEuroRange } from '@/lib/format'
import { QuoteButton } from '@/features/configurator/QuoteLink'
import { PerEmployee } from './PerEmployee'

function Range({
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
      <label htmlFor={id} className="flex flex-wrap items-baseline justify-between gap-x-3 text-sm font-medium text-ink">
        <span className="min-w-0">{label}</span>
        <span className="text-lg font-semibold whitespace-nowrap tabular-nums">
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
        className="mt-3 w-full accent-blue"
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
    <div className="grid grid-cols-1 gap-6 rounded-panel bg-glacier p-5 sm:p-8 lg:grid-cols-2 lg:gap-10">
      <div className="space-y-7">
        <Range label="Mitarbeiter in Ihren Räumen" value={employees} onChange={setEmployees} min={1} max={150} step={1} unit="Personen" />
        <Range label="Stunden pro Woche" value={hours} onChange={setHours} min={1} max={60} step={0.5} unit="Std." />
        <p className="text-sm text-muted">
          Das entspricht rund {formatEuroRange(netMin, netMax)} netto im Monat. Wie viele Stunden Ihr Objekt braucht, sehen wir bei der kostenlosen Besichtigung.
        </p>
      </div>
      <div className="flex flex-col justify-between gap-5">
        <PerEmployee netMin={netMin} netMax={netMax} employees={employees} className="shadow-soft" />
        <QuoteButton arrow>Genaues Angebot anfragen</QuoteButton>
      </div>
    </div>
  )
}
