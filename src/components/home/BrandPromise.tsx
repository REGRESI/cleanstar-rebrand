import { CountUp } from '@/components/ui/CountUp'
import { RevealText } from '@/components/ui/RevealText'
import { RiskFreeSeal } from '@/components/ui/RiskFreeSeal'
import { Button } from '@/components/ui/Button'
import { Stat } from '@/components/ui/Editorial'
import { home, trustFacts } from '@/content/site'

/**
 * Abschnitt 2 der Startseite: die drei Versprechen in einem Satz als Beweis der Leitidee,
 * dazu „Erster Monat jederzeit kündbar“ und die Kennzahlen (echte Werte aus company.ts).
 */
export function BrandPromise() {
  return (
    <section className="section" aria-labelledby="promise-title">
      <div className="container-site">
        <div className="grid-site gap-y-6">
          <span aria-hidden data-reveal-rule className="rule col-span-12 mb-2 lg:mb-6" />
          <p className="t-label col-span-12 lg:col-span-3 lg:pt-3" data-reveal>
            {home.promise.eyebrow}
          </p>
          <RevealText as="h2" id="promise-title" text={home.promise.statement} className="t-h2 col-span-12 lg:col-span-9" />
          <div className="col-span-12 mt-6 lg:col-span-5 lg:col-start-4 lg:mt-12">
            <p className="t-lead text-ink" data-reveal>
              {home.promise.lead}
            </p>
            <div className="mt-8" data-reveal>
              <Button to="/qualitaetsgarantie" variant="link">
                So funktioniert die Qualitätsgarantie
              </Button>
            </div>
          </div>
          <div className="col-span-12 mt-4 lg:col-span-3 lg:col-start-10 lg:mt-12" data-reveal>
            <RiskFreeSeal />
          </div>
        </div>

        <ul className="grid-site mt-20 gap-y-10 lg:mt-32" aria-label="Kennzahlen">
          {trustFacts.slice(0, 4).map((f, i) => (
            <li key={i} className="col-span-6 lg:col-span-3" data-reveal>
              <Stat
                value={
                  <>
                    {f.prefix && <span className="mr-2 align-top text-[0.4em] tracking-[-0.02em]">{f.prefix.trim()}</span>}
                    {f.countUp && f.value !== undefined ? <CountUp value={f.value} suffix={f.suffix} /> : f.text}
                  </>
                }
                label={f.label}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
