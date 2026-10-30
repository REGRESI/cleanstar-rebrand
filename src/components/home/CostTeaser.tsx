import { Fragment, useEffect, useRef, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { Range } from '@/features/cost/PerEmployeeCalculator'
import { AnimatedText } from '@/components/ui/AnimatedText'
import { Roll } from '@/components/ui/Roll'
import { monthlyRange, perEmployeeDay, pricing } from '@/content/pricing'
import { formatEuro, formatEuro2 } from '@/lib/format'
import { cn } from '@/lib/cn'

/**
 * Zahl, deren Ziffern beim Ändern rollen (wie ein Zählwerk): Jede Ziffer ist ein senkrechter Streifen 0 bis 9,
 * gestaffelt von links. Der lesbare Wert steht einmal im Dokument (sr-only).
 */
function RollNumber({ text, className }: { text: string; className?: string }) {
  let d = 0
  return (
    <span className={cn('rollnum', className)}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {Array.from(text).map((ch, i) =>
          /\d/.test(ch) ? (
            <span key={`${text.length}-${i}`} className="rollnum-d" style={{ '--n': ch, '--i': d++ } as CSSProperties}>
              <span>
                {Array.from({ length: 10 }, (_, k) => (
                  <Fragment key={k}>
                    {k}
                    <br />
                  </Fragment>
                ))}
              </span>
            </span>
          ) : (
            <span key={`${text.length}-${i}`}>{ch}</span>
          ),
        )}
      </span>
    </span>
  )
}

/**
 * Startseite, nach den Leistungen: Kostenrechner als dunkle Karte mit Reiter (Referenz: Terminal).
 * Links die Regler auf hellem Grund, rechts die Navy-Karte: große Monatsspanne mit rollenden Ziffern, darunter die
 * Aufschlüsselung. Werte aus pricing.ts, klar als unverbindlich gekennzeichnet.
 */
export function CostTeaser() {
  const [hours, setHours] = useState(4)
  const [staff, setStaff] = useState(2)
  const [employees, setEmployees] = useState(20)
  const r = monthlyRange(staff, hours, 1)
  const day = perEmployeeDay(r.netMin, r.netMax, employees)
  const [seen, setSeen] = useState(false)
  const card = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = card.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setSeen(true), io.disconnect()), { threshold: 0.35 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const rows = [
    { label: `Untere Spanne (${pricing.hourlyRateGrossMin} € je Stunde brutto)`, net: r.netMin, gross: r.grossMin },
    { label: `Obere Spanne (${pricing.hourlyRateGrossMax} € je Stunde brutto)`, net: r.netMax, gross: r.grossMax },
  ]

  return (
    <section className="section bg-paper" aria-labelledby="cost-title">
      <div className="container-site">
        <p className="t-label">Kosten</p>
        <AnimatedText as="h2" id="cost-title" text="Was kostet Sie Ihre Reinigung wirklich?" className="t-h2 mt-5 max-w-[18ch]" />
        <p className="t-lead mt-6 max-w-[50ch] text-ink-2">Wir rechnen nach Stunden, nicht nach Quadratmetern. Schieben Sie die Regler, die Spanne rechnet mit.</p>

        <div className="grid-site mt-14 items-start gap-y-14 lg:mt-20">
          <div className="col-span-12 space-y-10 lg:col-span-5 lg:pt-10">
            <Range label="Stunden pro Woche je Reinigungskraft" value={hours} onChange={setHours} min={1} max={20} step={0.5} unit="Std." />
            <Range label="Reinigungskräfte" value={staff} onChange={setStaff} min={1} max={6} step={1} unit={staff === 1 ? 'Kraft' : 'Kräfte'} />
            <Range label="Mitarbeitende in Ihren Räumen" value={employees} onChange={setEmployees} min={1} max={150} step={1} unit="Personen" />
            <Link to="/angebote-vergleichen" className="tlink text-ink">
              <Roll text="Zum vollständigen Angebotsvergleich" />
            </Link>
          </div>

          <div ref={card} className="tab-shadow col-span-12 lg:col-span-6 lg:col-start-7">
            <div className="tab-card is-night on-dark p-6 text-paper sm:p-10" aria-live="polite">
              <span className="tab-label t-label">Ihre Spanne</span>
              <p className="t-label">Im Monat, netto</p>
              <p className="mt-4 text-[2.5rem] leading-[1] font-medium tracking-[-0.04em] sm:text-[3.5rem] lg:text-[4rem]">
                <RollNumber text={formatEuro(r.netMin)} /> <span className="text-muted-dark">bis</span> <RollNumber text={formatEuro(r.netMax)} />
              </p>
              <dl className="mt-10 grid grid-cols-1 border-t border-line-dark sm:grid-cols-2">
                <div className="border-b border-line-dark py-4 sm:border-r sm:pr-6">
                  <dt className="t-meta">Im Monat, brutto</dt>
                  <dd className="mt-1 text-[1.25rem] font-medium">
                    {formatEuro(r.grossMin)} bis {formatEuro(r.grossMax)}
                  </dd>
                </div>
                <div className="border-b border-line-dark py-4 sm:pl-6">
                  <dt className="t-meta">Pro Mitarbeiter und Arbeitstag, netto</dt>
                  <dd className="mt-1 text-[1.25rem] font-medium">
                    {formatEuro2(day.min)} bis {formatEuro2(day.max)}
                  </dd>
                </div>
              </dl>

              {/* Aufschlüsselung: netto und Mehrwertsteuer je Spanne */}
              <div className="mt-8 space-y-5" aria-hidden>
                {rows.map((row, i) => (
                  <div key={i}>
                    <p className="flex justify-between gap-4 text-[0.875rem] text-muted-dark">
                      <span>{row.label}</span>
                      <span className="tabular-nums text-paper">{formatEuro(row.gross)}</span>
                    </p>
                    <div className="mt-2 flex h-2.5 w-full overflow-hidden rounded-full bg-night-2">
                      <span
                        className="h-full origin-left bg-paper transition-transform duration-700 ease-cs"
                        style={{ width: `${(row.net / r.grossMax) * 100}%`, transform: `scaleX(${seen ? 1 : 0})`, transitionDelay: `${i * 0.12}s` }}
                      />
                      <span
                        className="h-full origin-left bg-blue-on-dark transition-transform duration-700 ease-cs"
                        style={{ width: `${((row.gross - row.net) / r.grossMax) * 100}%`, transform: `scaleX(${seen ? 1 : 0})`, transitionDelay: `${0.25 + i * 0.12}s` }}
                      />
                    </div>
                  </div>
                ))}
                <p className="flex gap-6 text-[0.8125rem] text-muted-dark">
                  <span className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full bg-paper" /> Arbeitszeit netto
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full bg-blue-on-dark" /> 19 % Mehrwertsteuer
                  </span>
                </p>
              </div>

              <p className="mt-8 text-[0.875rem] text-muted-dark">
                Unverbindliche Richtwerte auf Basis unseres Stundensatzes. Wie viele Stunden Ihr Objekt wirklich braucht, sehen wir bei der kostenlosen Besichtigung.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
