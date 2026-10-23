import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowDown, Loader2 } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useReducedMotion } from '@/lib/env'
import { MONTHS, MONTHS_LONG, defaultSelection, optionFor, planRows, planYear } from './yearPlan'
import { useLocalState } from './ui'

/** Jahres-Reinigungsplan: zwölf Monate als Leiste, Intervalle per Umschalter, Download als PDF */
export function YearPlan() {
  const [sel, setSel] = useLocalState('cs-year-plan', defaultSelection)
  const [busy, setBusy] = useState(false)
  const reduced = useReducedMotion()
  // Planjahr erst im Browser bestimmen, vorgerendert gilt das Jahr des Builds
  const [year, setYear] = useState(planYear())
  useEffect(() => setYear(planYear()), [])

  return (
    <div>
      <div className="border-b border-line">
        {planRows.map((row) => {
          const opt = optionFor(row, sel)
          return (
            <fieldset key={row.id} className="border-t border-line py-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <legend className="text-[1.25rem] font-medium tracking-[-0.015em] text-ink">{row.name}</legend>
                <div className="flex flex-wrap shadow-[inset_0_0_0_1px_var(--color-line-strong)]" role="radiogroup" aria-label={`Intervall ${row.name}`}>
                  {row.options.map((o) => (
                    <label key={o.id} className="flex-auto">
                      <input type="radio" name={`plan-${row.id}`} checked={opt.id === o.id} onChange={() => setSel((s) => ({ ...s, [row.id]: o.id }))} className="peer sr-only" />
                      <span className="flex min-h-10 cursor-pointer items-center justify-center px-3.5 text-[0.9375rem] text-ink-2 transition-colors duration-300 peer-checked:bg-ink peer-checked:text-paper peer-focus-visible:outline-2 peer-focus-visible:outline-blue hover:text-ink">
                        {o.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <ol className="mt-4 grid grid-cols-12 gap-px" aria-label={`${row.name}: ${opt.id === 'aus' ? 'nicht vorgesehen' : opt.months.map((m) => MONTHS_LONG[m]).join(', ')}`}>
                {MONTHS.map((m, i) => {
                  const on = opt.months.includes(i)
                  return (
                    <li key={m} className="min-w-0">
                      <motion.span
                        aria-hidden
                        className={cn('block h-6 origin-bottom sm:h-7', on ? 'bg-blue' : 'bg-surface')}
                        initial={false}
                        animate={{ opacity: on ? 1 : 0.9, scaleY: on || reduced ? 1 : 0.6 }}
                        transition={{ duration: reduced ? 0 : 0.35, delay: reduced ? 0 : i * 0.015 }}
                      />
                      <span aria-hidden className="mt-1.5 block text-center font-mono text-[0.625rem] text-muted sm:text-[0.6875rem]">
                        {m}
                      </span>
                    </li>
                  )
                })}
              </ol>
              {opt.note && <p className="mt-2 text-[0.8125rem] text-muted">{opt.note}</p>}
            </fieldset>
          )
        })}
      </div>
      <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[0.9375rem] text-ink-2">Vorschlag für ruhige Zeiten. Die genauen Termine stimmen wir mit Ihnen ab.</p>
        <button
          type="button"
          disabled={busy}
          onClick={async () => {
            setBusy(true)
            try {
              const { downloadYearPlanPdf } = await import('./yearPlanPdf')
              await downloadYearPlanPdf(sel, year)
            } finally {
              setBusy(false)
            }
          }}
          className="btn btn-outline shrink-0"
        >
          Ihr Reinigungsplan {year} als PDF
          {busy ? <Loader2 aria-hidden className="size-4 animate-spin" /> : <ArrowDown aria-hidden className="size-4" strokeWidth={1.75} />}
        </button>
      </div>
    </div>
  )
}
