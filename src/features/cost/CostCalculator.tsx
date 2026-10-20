import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Info, ShieldCheck, Users, FileCheck2, RefreshCcw } from 'lucide-react'
import { costAssumptions, pricing, net, type CostAssumptions } from '@/content/pricing'
import { formatEuro, formatEuro2, formatNumber } from '@/lib/format'
import { AnimatedNumber } from '@/components/ui/AnimatedNumber'
import { cn } from '@/lib/cn'

type Employment = 'minijob' | 'regular'

function Num({
  label,
  value,
  onChange,
  unit,
  step = 1,
  min = 0,
  max = 10000,
  hint,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  unit?: string
  step?: number
  min?: number
  max?: number
  hint?: string
}) {
  const id = `cc-${label.replace(/\W+/g, '-').toLowerCase()}`
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-ink">
        {label}
      </label>
      <div className="flex items-center rounded-xl bg-white ring-1 ring-line focus-within:ring-2 focus-within:ring-blue">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          value={value}
          step={step}
          min={min}
          max={max}
          onChange={(e) => onChange(Math.min(max, Math.max(min, Number(e.target.value) || 0)))}
          className="w-full bg-transparent px-3.5 py-3 text-base text-ink tabular-nums focus:outline-none"
          aria-describedby={hint ? `${id}-h` : undefined}
        />
        {unit && <span className="pr-3.5 text-sm text-muted">{unit}</span>}
      </div>
      {hint && (
        <p id={`${id}-h`} className="mt-1 text-xs text-muted">
          {hint}
        </p>
      )}
    </div>
  )
}

/**
 * Kostenvergleich „Eigenes Personal vs. CleanStar“.
 * Alle Annahmen sind offengelegt und editierbar. Kein Schönrechnen:
 * Ist eigenes Personal günstiger, zeigt der Rechner das auch.
 */
export function CostCalculator() {
  const [a, setA] = useState<CostAssumptions>(costAssumptions)
  const [employment, setEmployment] = useState<Employment>('minijob')
  const [vatDeductible, setVatDeductible] = useState(true)
  const [showAssumptions, setShowAssumptions] = useState(false)
  const set = (k: keyof CostAssumptions) => (v: number) => setA((p) => ({ ...p, [k]: v }))

  const calc = useMemo(() => {
    const charges = (employment === 'minijob' ? a.employerChargesMinijob : a.employerChargesRegular) / 100
    const hoursMonth = a.hoursPerWeek * pricing.weeksPerMonth
    const wage = hoursMonth * a.hourlyWage
    const employer = wage * charges
    const absenceShare = (a.vacationDays + a.sickDays) / Math.max(1, a.workingDaysPerYear)
    const coverage = hoursMonth * absenceShare * (a.coverageShare / 100) * a.hourlyWage * (1 + a.coveragePremium / 100) * (1 + charges)
    const material = a.materialPerMonth
    const admin = a.adminHoursPerMonth * a.adminHourlyCost
    const own = wage + employer + coverage + material + admin
    const toDisplay = (gross: number) => (vatDeductible ? net(gross) : gross)
    const csMin = hoursMonth * toDisplay(pricing.hourlyRateGrossMin)
    const csMax = hoursMonth * toDisplay(pricing.hourlyRateGrossMax)
    return { hoursMonth, wage, employer, coverage, material, admin, own, ownPerHour: own / Math.max(1, hoursMonth), csMin, csMax, absenceShare }
  }, [a, employment, vatDeductible])

  const verdict = calc.own < calc.csMin ? 'own' : calc.own > calc.csMax ? 'cs' : 'equal'
  const scale = Math.max(calc.own, calc.csMax) * 1.08 || 1
  const fmt = (v: number) => formatEuro(v)

  const breakdown: [string, number, string][] = [
    ['Bruttolohn', calc.wage, `${formatNumber(calc.hoursMonth)} Std. × ${formatEuro2(a.hourlyWage)}`],
    ['Arbeitgeberanteile / Abgaben', calc.employer, `${employment === 'minijob' ? a.employerChargesMinijob : a.employerChargesRegular} % vom Lohn`],
    ['Vertretung bei Urlaub und Krankheit', calc.coverage, `${formatNumber(calc.absenceShare * 100)} % Ausfallzeit, Aufschlag ${a.coveragePremium} %`],
    ['Material und Geräte', calc.material, 'pro Monat'],
    ['Verwaltung und Organisation', calc.admin, `${a.adminHoursPerMonth} Std. × ${formatEuro(a.adminHourlyCost)}`],
  ]

  return (
    <div className="overflow-hidden rounded-panel bg-white shadow-lift ring-1 ring-line">
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Eingaben */}
        <div className="border-b border-line p-6 sm:p-8 lg:col-span-5 lg:border-r lg:border-b-0">
          <h3 className="text-xl font-semibold tracking-tight">Ihre Situation</h3>
          <div className="mt-6 grid grid-cols-2 gap-4">
            <Num label="Reinigungsstunden pro Woche" value={a.hoursPerWeek} onChange={set('hoursPerWeek')} unit="Std." step={0.5} min={1} max={200} />
            <Num label="Stundenlohn eigene Kraft" value={a.hourlyWage} onChange={set('hourlyWage')} unit="€" step={0.25} min={1} max={60} />
          </div>
          <fieldset className="mt-5">
            <legend className="mb-2 text-sm font-medium text-ink">Beschäftigungsart</legend>
            <div className="grid grid-cols-2 gap-1 rounded-xl bg-glacier p-1">
              {(
                [
                  ['minijob', 'Minijob'],
                  ['regular', 'Sozialversicherungspflichtig'],
                ] as const
              ).map(([id, l]) => (
                <label
                  key={id}
                  className={cn(
                    'relative cursor-pointer rounded-lg px-3 py-2.5 text-center text-sm font-medium transition',
                    employment === id ? 'bg-white text-ink shadow-soft' : 'text-muted',
                  )}
                >
                  <input type="radio" name="employment" value={id} checked={employment === id} onChange={() => setEmployment(id)} className="peer sr-only" />
                  <span aria-hidden className="pointer-events-none absolute inset-0 rounded-lg peer-focus-visible:ring-2 peer-focus-visible:ring-blue" />
                  {l}
                </label>
              ))}
            </div>
          </fieldset>
          <label className="mt-5 flex cursor-pointer items-start gap-3">
            <input type="checkbox" checked={vatDeductible} onChange={(e) => setVatDeductible(e.target.checked)} className="mt-1 size-5 accent-blue" />
            <span className="text-sm text-ink">
              Wir sind vorsteuerabzugsberechtigt
              <span className="block text-xs text-muted">Dann zählt für Sie der Nettopreis. Viele Praxen sind es nicht, dann zählt brutto.</span>
            </span>
          </label>

          <button
            type="button"
            onClick={() => setShowAssumptions((s) => !s)}
            aria-expanded={showAssumptions}
            className="mt-6 flex w-full items-center justify-between rounded-xl bg-glacier px-4 py-3 text-sm font-semibold text-ink"
          >
            Annahmen ansehen und anpassen
            <ChevronDown aria-hidden className={cn('size-4 transition-transform', showAssumptions && 'rotate-180')} />
          </button>
          <AnimatePresence initial={false}>
            {showAssumptions && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="grid grid-cols-2 gap-4 pt-5">
                  <Num label="Abgaben Minijob" value={a.employerChargesMinijob} onChange={set('employerChargesMinijob')} unit="%" max={60} />
                  <Num label="Arbeitgeberanteil SV" value={a.employerChargesRegular} onChange={set('employerChargesRegular')} unit="%" max={60} />
                  <Num label="Urlaubstage pro Jahr" value={a.vacationDays} onChange={set('vacationDays')} max={60} />
                  <Num label="Krankheitstage pro Jahr" value={a.sickDays} onChange={set('sickDays')} max={100} />
                  <Num label="Arbeitstage pro Jahr" value={a.workingDaysPerYear} onChange={set('workingDaysPerYear')} min={100} max={366} />
                  <Num label="Ausfälle, die vertreten werden" value={a.coverageShare} onChange={set('coverageShare')} unit="%" max={100} />
                  <Num label="Aufschlag Vertretung" value={a.coveragePremium} onChange={set('coveragePremium')} unit="%" max={200} hint="z. B. Überstunden, Aushilfe" />
                  <Num label="Material pro Monat" value={a.materialPerMonth} onChange={set('materialPerMonth')} unit="€" max={5000} />
                  <Num label="Verwaltung pro Monat" value={a.adminHoursPerMonth} onChange={set('adminHoursPerMonth')} unit="Std." step={0.5} max={100} />
                  <Num label="Kosten Verwaltungsstunde" value={a.adminHourlyCost} onChange={set('adminHourlyCost')} unit="€" max={300} />
                </div>
                <button type="button" onClick={() => setA(costAssumptions)} className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-blue">
                  <RefreshCcw aria-hidden className="size-4" />
                  Auf Beispielwerte zurücksetzen
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          <p className="mt-6 flex gap-2 text-xs leading-relaxed text-muted">
            <Info aria-hidden className="mt-0.5 size-4 shrink-0" />
            Beispielwerte zur Orientierung, keine Steuer- oder Lohnberatung. Bitte passen Sie die Annahmen an Ihre Situation an.
          </p>
        </div>

        {/* Ergebnis */}
        <div className="bg-glacier/60 p-6 sm:p-8 lg:col-span-7" aria-live="polite">
          <h3 className="text-xl font-semibold tracking-tight">Monatliche Kosten im Vergleich</h3>
          <p className="mt-1 text-sm text-muted">
            Für rund {formatNumber(calc.hoursMonth)} Reinigungsstunden im Monat, {vatDeductible ? 'netto' : 'brutto'}.
          </p>

          <div className="mt-8 space-y-6">
            <div>
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-sm font-medium text-ink">Eigenes Personal (Vollkosten)</span>
                <span className="text-2xl font-semibold tracking-tight">
                  <AnimatedNumber value={calc.own} format={fmt} />
                </span>
              </div>
              <div className="mt-2 h-3 overflow-hidden rounded-full bg-white ring-1 ring-line">
                <motion.div
                  className="h-full rounded-full bg-ink"
                  initial={false}
                  animate={{ width: `${(calc.own / scale) * 100}%` }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
              <p className="mt-1 text-xs text-muted">entspricht {formatEuro2(calc.ownPerHour)} pro geleisteter Stunde</p>
            </div>
            <div>
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-sm font-medium text-ink">CleanStar</span>
                <span className="text-2xl font-semibold tracking-tight">
                  <AnimatedNumber value={calc.csMin} format={fmt} /> – <AnimatedNumber value={calc.csMax} format={fmt} />
                </span>
              </div>
              <div className="relative mt-2 h-3 overflow-hidden rounded-full bg-white ring-1 ring-line">
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full bg-blue"
                  initial={false}
                  animate={{ width: `${(calc.csMin / scale) * 100}%` }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                />
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full bg-blue/30"
                  initial={false}
                  animate={{ width: `${(calc.csMax / scale) * 100}%` }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
              <p className="mt-1 text-xs text-muted">
                {pricing.hourlyRateGrossMin} bis {pricing.hourlyRateGrossMax} € brutto pro Mitarbeiterstunde ({formatEuro2(net(pricing.hourlyRateGrossMin))} bis{' '}
                {formatEuro2(net(pricing.hourlyRateGrossMax))} netto), gleiche Stundenzahl angenommen
              </p>
            </div>
          </div>

          <div className={cn('mt-8 rounded-2xl p-5', verdict === 'own' ? 'bg-white ring-1 ring-line' : 'bg-blue text-white')}>
            {verdict === 'own' && (
              <>
                <p className="font-semibold text-ink">Rein rechnerisch ist eigenes Personal in Ihrem Fall günstiger.</p>
                <p className="mt-1 text-sm text-muted">Das sagen wir Ihnen offen. Was Sie mit uns zusätzlich bekommen:</p>
              </>
            )}
            {verdict === 'equal' && <p className="font-semibold">Die Kosten liegen in Ihrem Fall etwa gleichauf. Den Unterschied machen die Leistungen drumherum:</p>}
            {verdict === 'cs' && <p className="font-semibold">Mit CleanStar liegen Sie in Ihrem Fall günstiger, und Sie bekommen zusätzlich:</p>}
            <ul className={cn('mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2', verdict === 'own' ? 'text-ink' : 'text-white')}>
              {[
                [ShieldCheck, 'Kein Ausfallrisiko: Vertretung ist unsere Aufgabe'],
                [FileCheck2, 'Keine Lohnabrechnung, keine Einsatzplanung'],
                [Users, 'Fester Ansprechpartner und eingewiesenes Team'],
                [ShieldCheck, 'Qualitätsgarantie mit kostenloser Nachreinigung'],
              ].map(([Icon, t], i) => {
                const I = Icon as typeof ShieldCheck
                return (
                  <li key={i} className="flex items-start gap-2">
                    <I aria-hidden className={cn('mt-0.5 size-4 shrink-0', verdict === 'own' ? 'text-blue' : 'text-fresh')} />
                    {t as string}
                  </li>
                )
              })}
            </ul>
          </div>

          <details className="mt-6 text-sm">
            <summary className="cursor-pointer font-medium text-ink">So setzen sich die Kosten für eigenes Personal zusammen</summary>
            <dl className="mt-3 divide-y divide-line rounded-xl bg-white px-4 ring-1 ring-line">
              {breakdown.map(([k, val, note]) => (
                <div key={k} className="flex items-baseline justify-between gap-4 py-2.5">
                  <dt>
                    <span className="text-ink">{k}</span>
                    <span className="block text-xs text-muted">{note}</span>
                  </dt>
                  <dd className="font-semibold tabular-nums">{formatEuro(val)}</dd>
                </div>
              ))}
            </dl>
          </details>
        </div>
      </div>
    </div>
  )
}
