import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Range } from '@/features/cost/PerEmployeeCalculator'
import { monthlyRange, perEmployeeDay, pricing } from '@/content/pricing'
import { formatEuro, formatEuro2 } from '@/lib/format'
import { prefersReducedMotion } from '@/lib/env'
import { cn } from '@/lib/cn'

/** Zahl rollt weich zum neuen Wert (ohne Bewegungswunsch sofort) */
function useRolling(target: number, ms = 600) {
  const [v, setV] = useState(target)
  const from = useRef(target)
  useEffect(() => {
    if (prefersReducedMotion()) return setV(target)
    const a = from.current
    const t0 = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const k = Math.min(1, (now - t0) / ms)
      const e = 1 - Math.pow(1 - k, 3)
      const x = a + (target - a) * e
      from.current = x
      setV(x)
      if (k < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, ms])
  return v
}

function Money({ value, cents }: { value: number; cents?: boolean }) {
  const v = useRolling(value)
  return <span className="tabular-nums">{cents ? formatEuro2(v) : formatEuro(v)}</span>
}

/**
 * Startseite, nach den Leistungen: „Was kostet Sie Ihre Reinigung wirklich?“
 * Drei Regler, daneben live die Monatsspanne netto und brutto sowie die Kosten pro Mitarbeiter und Arbeitstag.
 * Darunter eine schlichte Aufschlüsselung als Balken (netto und Mehrwertsteuer, flache Flächen, keine Verläufe).
 * Werte aus pricing.ts, ausdrücklich unverbindlich.
 */
export function CostTeaser() {
  const [hours, setHours] = useState(4)
  const [staff, setStaff] = useState(2)
  const [employees, setEmployees] = useState(20)
  const r = monthlyRange(staff, hours, 1)
  const day = perEmployeeDay(r.netMin, r.netMax, employees)
  const [seen, setSeen] = useState(false)
  const bars = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = bars.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setSeen(true), io.disconnect()), { threshold: 0.4 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const rows = [
    { label: `Untere Spanne (${pricing.hourlyRateGrossMin} € je Stunde brutto)`, net: r.netMin, gross: r.grossMin },
    { label: `Obere Spanne (${pricing.hourlyRateGrossMax} € je Stunde brutto)`, net: r.netMax, gross: r.grossMax },
  ]

  return (
    <section className="section bg-surface" aria-labelledby="cost-title">
      <div className="container-site">
        <div className="grid-site gap-y-6">
          <p className="t-label col-span-12 lg:col-span-3 lg:pt-3" data-reveal>
            Kosten
          </p>
          <div className="col-span-12 lg:col-span-9">
            <h2 id="cost-title" className="t-h1 max-w-[18ch]" data-reveal>
              Was kostet Sie Ihre Reinigung wirklich?
            </h2>
            <p className="t-lead mt-6 max-w-[54ch] text-ink-2" data-reveal>
              Wir rechnen nach Stunden, nicht nach Quadratmetern. Schieben Sie die Regler, die Spanne rechnet mit.
            </p>
          </div>
        </div>

        <div className="grid-site mt-14 gap-y-14 lg:mt-20">
          <div className="col-span-12 space-y-10 lg:col-span-5">
            <Range label="Stunden pro Woche je Reinigungskraft" value={hours} onChange={setHours} min={1} max={20} step={0.5} unit="Std." />
            <Range label="Reinigungskräfte" value={staff} onChange={setStaff} min={1} max={6} step={1} unit={staff === 1 ? 'Kraft' : 'Kräfte'} />
            <Range label="Mitarbeitende in Ihren Räumen" value={employees} onChange={setEmployees} min={1} max={150} step={1} unit="Personen" />
          </div>

          <div className="col-span-12 lg:col-span-6 lg:col-start-7" aria-live="polite">
            <p className="t-label">Im Monat, netto</p>
            <p className="mt-3 text-[2.25rem] leading-[1.05] font-medium tracking-[-0.03em] text-ink sm:text-[3rem]">
              <Money value={r.netMin} /> <span className="text-muted">bis</span> <Money value={r.netMax} />
            </p>
            <dl className="mt-8 grid grid-cols-1 border-t border-line sm:grid-cols-2">
              <div className="border-b border-line py-4 sm:border-r sm:pr-6">
                <dt className="t-meta">Im Monat, brutto</dt>
                <dd className="mt-1 text-[1.25rem] font-medium text-ink">
                  <Money value={r.grossMin} /> bis <Money value={r.grossMax} />
                </dd>
              </div>
              <div className="border-b border-line py-4 sm:pl-6">
                <dt className="t-meta">Pro Mitarbeiter und Arbeitstag, netto</dt>
                <dd className="mt-1 text-[1.25rem] font-medium text-ink">
                  <Money value={day.min} cents /> bis <Money value={day.max} cents />
                </dd>
              </div>
            </dl>

            {/* Aufschlüsselung: netto und Mehrwertsteuer je Spanne */}
            <div ref={bars} className="mt-10 space-y-6" aria-hidden>
              {rows.map((row, i) => (
                <div key={i}>
                  <p className="flex justify-between gap-4 text-[0.875rem] text-ink-2">
                    <span>{row.label}</span>
                    <span className="tabular-nums">{formatEuro(row.gross)}</span>
                  </p>
                  <div className="mt-2 flex h-3 w-full overflow-hidden bg-paper">
                    <span
                      className={cn('h-full origin-left bg-ink transition-transform duration-700 ease-cs')}
                      style={{ width: `${(row.net / r.grossMax) * 100}%`, transform: `scaleX(${seen ? 1 : 0})`, transitionDelay: `${i * 0.12}s` }}
                    />
                    <span
                      className="h-full origin-left bg-blue transition-transform duration-700 ease-cs"
                      style={{ width: `${((row.gross - row.net) / r.grossMax) * 100}%`, transform: `scaleX(${seen ? 1 : 0})`, transitionDelay: `${0.25 + i * 0.12}s` }}
                    />
                  </div>
                </div>
              ))}
              <p className="flex gap-6 text-[0.8125rem] text-ink-2">
                <span className="flex items-center gap-2">
                  <span className="size-2.5 bg-ink" /> Arbeitszeit netto
                </span>
                <span className="flex items-center gap-2">
                  <span className="size-2.5 bg-blue" /> 19 % Mehrwertsteuer
                </span>
              </p>
            </div>

            <p className="mt-10 text-[0.875rem] text-ink-2">
              Unverbindliche Richtwerte bei {pricing.hourlyRateGrossMin} bis {pricing.hourlyRateGrossMax} € brutto je Mitarbeiterstunde. Wie viele Stunden Ihr Objekt wirklich braucht, sehen wir bei der kostenlosen Besichtigung.
            </p>
            <Link to="/angebote-vergleichen" className="tlink mt-6 text-ink">
              Zum vollständigen Angebotsvergleich
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
