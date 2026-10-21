import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FileDown, Loader2 } from 'lucide-react'
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
    <div className="rounded-panel bg-white p-5 shadow-soft ring-1 ring-line sm:p-8">
      <div className="space-y-7">
        {planRows.map((row) => {
          const opt = optionFor(row, sel)
          return (
            <fieldset key={row.id}>
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <legend className="font-semibold tracking-tight text-ink">{row.name}</legend>
                <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label={`Intervall ${row.name}`}>
                  {row.options.map((o) => (
                    <label key={o.id}>
                      <input type="radio" name={`plan-${row.id}`} checked={opt.id === o.id} onChange={() => setSel((s) => ({ ...s, [row.id]: o.id }))} className="peer sr-only" />
                      <span className="inline-flex min-h-10 cursor-pointer items-center rounded-full px-3.5 text-sm font-medium text-ink/70 ring-1 ring-line transition peer-checked:bg-blue peer-checked:text-white peer-checked:ring-blue peer-focus-visible:ring-2 peer-focus-visible:ring-blue peer-focus-visible:ring-offset-2 hover:text-ink">
                        {o.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <ol className="mt-3 grid grid-cols-12 gap-1" aria-label={`${row.name}: ${opt.id === 'aus' ? 'nicht vorgesehen' : opt.months.map((m) => MONTHS_LONG[m]).join(', ')}`}>
                {MONTHS.map((m, i) => {
                  const on = opt.months.includes(i)
                  return (
                    <li key={m} className="min-w-0">
                      <motion.span
                        aria-hidden
                        className={cn('block h-7 rounded-md sm:h-8', on ? 'bg-blue' : 'bg-glacier')}
                        initial={false}
                        animate={{ opacity: on ? 1 : 0.9, scaleY: on || reduced ? 1 : 0.6 }}
                        transition={{ duration: reduced ? 0 : 0.35, delay: reduced ? 0 : i * 0.015 }}
                      />
                      <span aria-hidden className="mt-1 block text-center text-[0.625rem] text-muted sm:text-xs">
                        {m}
                      </span>
                    </li>
                  )
                })}
              </ol>
              {opt.note && <p className="mt-1.5 text-xs text-muted">{opt.note}</p>}
            </fieldset>
          )
        })}
      </div>
      <div className="mt-8 flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">Vorschlag für ruhige Zeiten. Die genauen Termine stimmen wir mit Ihnen ab.</p>
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
          className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-blue px-6 font-semibold text-white shadow-glow transition hover:bg-blue-hover active:bg-blue-hover disabled:opacity-70"
        >
          {busy ? <Loader2 aria-hidden className="size-4 animate-spin" /> : <FileDown aria-hidden className="size-4" />}
          Ihr Reinigungsplan {year} als PDF
        </button>
      </div>
    </div>
  )
}
