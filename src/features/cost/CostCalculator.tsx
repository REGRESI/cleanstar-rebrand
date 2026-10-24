import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { costAssumptions, pricing, net, type CostAssumptions } from '@/content/pricing'
import { formatEuro, formatEuro2, formatNumber, formatEuro2Range } from '@/lib/format'
import { AnimatedNumber } from '@/components/ui/AnimatedNumber'
import { cn } from '@/lib/cn'
import { EASE_CS_ARRAY } from '@/lib/ease'
import { Segments } from '@/features/tools/ui'

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
      <label htmlFor={id} className="field-label mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          value={value}
          step={step}
          min={min}
          max={max}
          onChange={(e) => onChange(Math.min(max, Math.max(min, Number(e.target.value) || 0)))}
          className={cn('field tabular-nums', unit && 'pr-12')}
          aria-describedby={hint ? `${id}-h` : undefined}
        />
        {unit && <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center font-medium tabular-nums text-[0.8125rem] text-muted">{unit}</span>}
      </div>
      {hint && (
        <p id={`${id}-h`} className="mt-1.5 text-[0.8125rem] text-muted">
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
  const fmtInt = (v: number) => Math.round(v).toLocaleString('de-DE')

  const breakdown: [string, number, string][] = [
    ['Bruttolohn', calc.wage, `${formatNumber(calc.hoursMonth)} Std. × ${formatEuro2(a.hourlyWage)}`],
    ['Arbeitgeberanteile / Abgaben', calc.employer, `${employment === 'minijob' ? a.employerChargesMinijob : a.employerChargesRegular} % vom Lohn`],
    ['Vertretung bei Urlaub und Krankheit', calc.coverage, `${formatNumber(calc.absenceShare * 100)} % Ausfallzeit, Aufschlag ${a.coveragePremium} %`],
    ['Material und Geräte', calc.material, 'pro Monat'],
    ['Verwaltung und Organisation', calc.admin, `${a.adminHoursPerMonth} Std. × ${formatEuro(a.adminHourlyCost)}`],
  ]

  return (
    <div className="border-t border-line pt-8 lg:pt-10">
      <div className="grid-site gap-y-16">
        {/* Eingaben */}
        <div className="col-span-12 lg:col-span-5">
          <h3 className="t-label">Ihre Situation</h3>
          <div className="mt-6 grid grid-cols-1 gap-x-5 gap-y-6 min-[400px]:grid-cols-2">
            <Num label="Stunden pro Woche" value={a.hoursPerWeek} onChange={set('hoursPerWeek')} unit="Std." step={0.5} min={1} max={200} />
            <Num label="Stundenlohn eigene Kraft" value={a.hourlyWage} onChange={set('hourlyWage')} unit="€" step={0.25} min={1} max={60} />
          </div>
          <fieldset className="mt-8">
            <legend className="field-label mb-3">Beschäftigungsart</legend>
            <Segments
              name="employment"
              value={employment}
              onChange={setEmployment}
              options={[
                { id: 'minijob', label: 'Minijob' },
                { id: 'regular', label: 'Sozialversicherungspflichtig' },
              ]}
            />
          </fieldset>
          <label className="mt-8 flex cursor-pointer items-start gap-3">
            <input type="checkbox" checked={vatDeductible} onChange={(e) => setVatDeductible(e.target.checked)} className="mt-1 size-[1.125rem] accent-ink" />
            <span className="text-ink">
              Wir sind vorsteuerabzugsberechtigt
              <span className="block text-[0.8125rem] text-muted">Dann zählt für Sie der Nettopreis. Viele Praxen sind es nicht, dann zählt brutto.</span>
            </span>
          </label>

          <button
            type="button"
            onClick={() => setShowAssumptions((s) => !s)}
            aria-expanded={showAssumptions}
            className="mt-8 flex w-full items-center justify-between border-y border-line py-4 text-left font-medium text-ink"
          >
            Annahmen ansehen und anpassen
            <span aria-hidden className="relative block size-3 shrink-0">
              <span className="absolute inset-x-0 top-1/2 h-px bg-current" />
              <span className={cn('absolute inset-y-0 left-1/2 w-px bg-current transition-transform duration-500 ease-cs', showAssumptions && 'scale-y-0')} />
            </span>
          </button>
          <AnimatePresence initial={false}>
            {showAssumptions && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.45, ease: EASE_CS_ARRAY }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 gap-x-5 gap-y-6 pt-6 min-[400px]:grid-cols-2">
                  <Num label="Abgaben Minijob" value={a.employerChargesMinijob} onChange={set('employerChargesMinijob')} unit="%" max={60} />
                  <Num label="Arbeitgeberanteil SV" value={a.employerChargesRegular} onChange={set('employerChargesRegular')} unit="%" max={60} />
                  <Num label="Urlaubstage pro Jahr" value={a.vacationDays} onChange={set('vacationDays')} max={60} />
                  <Num label="Krankheitstage pro Jahr" value={a.sickDays} onChange={set('sickDays')} max={100} />
                  <Num label="Arbeitstage pro Jahr" value={a.workingDaysPerYear} onChange={set('workingDaysPerYear')} min={100} max={366} />
                  <Num label="Ausfälle, die vertreten werden" value={a.coverageShare} onChange={set('coverageShare')} unit="%" max={100} />
                  <Num label="Aufschlag Vertretung" value={a.coveragePremium} onChange={set('coveragePremium')} unit="%" max={200} hint="z. B. Überstunden, Aushilfe" />
                  <Num label="Material pro Monat" value={a.materialPerMonth} onChange={set('materialPerMonth')} unit="€" max={5000} />
                  <Num label="Verwaltung pro Monat" value={a.adminHoursPerMonth} onChange={set('adminHoursPerMonth')} unit="Std." step={0.5} max={100} />
                  <Num label="Kosten Verwaltungsstunde" value={a.adminHourlyCost} onChange={set('adminHourlyCost')} unit="€" max={300} />
                </div>
                <button type="button" onClick={() => setA(costAssumptions)} className="ulink mt-6 text-[0.9375rem] text-ink">
                  Auf Beispielwerte zurücksetzen
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          <p className="mt-6 text-[0.8125rem] leading-relaxed text-muted">
            Beispielwerte zur Orientierung, keine Steuer- oder Lohnberatung. Bitte passen Sie die Annahmen an Ihre Situation an.
          </p>
        </div>

        {/* Ergebnis */}
        <div className="col-span-12 lg:col-span-6 lg:col-start-7" aria-live="polite">
          <h3 className="t-label">Monatliche Kosten im Vergleich</h3>
          <p className="mt-3 text-ink-2">
            Für rund {formatNumber(calc.hoursMonth)} Reinigungsstunden im Monat, {vatDeductible ? 'netto' : 'brutto'}.
          </p>

          <div className="mt-10 space-y-10">
            <div>
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-ink">Eigenes Personal (Vollkosten)</span>
                <span className="text-[1.75rem] font-medium tracking-[-0.03em] tabular-nums">
                  <AnimatedNumber value={calc.own} format={fmt} />
                </span>
              </div>
              <div className="mt-3 h-1.5 bg-surface">
                <motion.div className="h-full bg-ink" initial={false} animate={{ width: `${(calc.own / scale) * 100}%` }} transition={{ duration: 0.6, ease: EASE_CS_ARRAY }} />
              </div>
              <p className="mt-2 font-medium tabular-nums text-[0.75rem] text-muted">entspricht {formatEuro2(calc.ownPerHour)} pro geleisteter Stunde</p>
            </div>
            <div>
              <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                <span className="text-ink">CleanStar</span>
                <span className="text-[1.5rem] font-medium tracking-[-0.03em] whitespace-nowrap tabular-nums min-[420px]:text-[1.75rem]">
                  <AnimatedNumber value={calc.csMin} format={fmtInt} />
                  {'\u00A0'}bis{'\u00A0'}
                  <AnimatedNumber value={calc.csMax} format={fmt} />
                </span>
              </div>
              <div className="relative mt-3 h-1.5 bg-surface">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-blue/30"
                  initial={false}
                  animate={{ width: `${(calc.csMax / scale) * 100}%` }}
                  transition={{ duration: 0.6, ease: EASE_CS_ARRAY }}
                />
                <motion.div
                  className="absolute inset-y-0 left-0 bg-blue"
                  initial={false}
                  animate={{ width: `${(calc.csMin / scale) * 100}%` }}
                  transition={{ duration: 0.6, ease: EASE_CS_ARRAY }}
                />
              </div>
              <p className="mt-2 font-medium tabular-nums text-[0.75rem] text-muted">
                {pricing.hourlyRateGrossMin} bis {pricing.hourlyRateGrossMax} € brutto pro Mitarbeiterstunde (
                {formatEuro2Range(net(pricing.hourlyRateGrossMin), net(pricing.hourlyRateGrossMax))} netto), gleiche Stundenzahl angenommen
              </p>
            </div>
          </div>

          <div className="mt-12 border-t border-line pt-6">
            {verdict === 'own' && (
              <>
                <p className="t-h4">Rein rechnerisch ist eigenes Personal in Ihrem Fall günstiger.</p>
                <p className="mt-2 text-ink-2">Das sagen wir Ihnen offen. Was Sie mit uns zusätzlich bekommen:</p>
              </>
            )}
            {verdict === 'equal' && <p className="t-h4">Die Kosten liegen in Ihrem Fall etwa gleichauf. Den Unterschied machen die Leistungen drumherum:</p>}
            {verdict === 'cs' && <p className="t-h4">Mit CleanStar liegen Sie in Ihrem Fall günstiger, und Sie bekommen zusätzlich:</p>}
            <ul className="mt-5 border-t border-line">
              {[
                'Kein Ausfallrisiko: Vertretung ist unsere Aufgabe',
                'Keine Lohnabrechnung, keine Einsatzplanung',
                'Fester Ansprechpartner und eingewiesenes Team',
                'Qualitätsgarantie mit kostenloser Nachreinigung',
              ].map((t, i) => (
                <li key={t} className="flex gap-4 border-b border-line py-3">
                  <span className="t-label w-6 shrink-0 pt-0.5">{String(i + 1).padStart(2, '0')}</span>
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <details className="mt-8">
            <summary className="ulink cursor-pointer font-medium text-ink">So setzen sich die Kosten für eigenes Personal zusammen</summary>
            <dl className="mt-4 border-t border-line">
              {breakdown.map(([k, val, note]) => (
                <div key={k} className="flex items-baseline justify-between gap-4 border-b border-line py-3">
                  <dt>
                    <span className="text-ink">{k}</span>
                    <span className="block font-medium tabular-nums text-[0.75rem] text-muted">{note}</span>
                  </dt>
                  <dd className="font-medium whitespace-nowrap tabular-nums">{formatEuro(val)}</dd>
                </div>
              ))}
            </dl>
          </details>
        </div>
      </div>
    </div>
  )
}
