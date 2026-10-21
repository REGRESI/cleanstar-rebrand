import { Clock, ShieldCheck } from 'lucide-react'
import { CountUp } from '@/components/ui/CountUp'
import { RiskFreeSeal } from '@/components/ui/RiskFreeSeal'
import { trustFacts } from '@/content/site'
import { company } from '@/content/company'

/** Vertrauensleiste direkt unter dem Hero: Risikofrei-Siegel, Absicherung, Erreichbarkeit und echte Kennzahlen aus company.ts */
export function TrustBar() {
  return (
    <section aria-label="Kernfakten" className="relative border-y border-line bg-white">
      <div className="container-site">
        <div className="flex flex-col gap-4 border-b border-line py-6 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-8" data-reveal>
          <RiskFreeSeal />
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink">
            {company.liabilityInsurance && (
              <li className="inline-flex items-center gap-2">
                <ShieldCheck aria-hidden className="size-4 text-blue" />
                Betriebshaftpflichtversichert
              </li>
            )}
            <li className="inline-flex items-center gap-2">
              <Clock aria-hidden className="size-4 text-blue" />
              {company.availability}
            </li>
          </ul>
        </div>
        <ul className="grid grid-cols-2 divide-line lg:grid-cols-4 lg:divide-x">
          {trustFacts.slice(0, 4).map((f, i) => (
            <li key={i} className="flex flex-col gap-1 border-line py-8 odd:pr-4 even:pl-4 max-lg:[&:nth-child(-n+2)]:border-b lg:px-8 lg:py-10 lg:first:pl-0" data-reveal>
              <span className="text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
                {f.prefix && <span className="mr-1.5 text-2xl font-medium text-muted sm:text-3xl">{f.prefix.trim()}</span>}
                {f.countUp && f.value !== undefined ? <CountUp value={f.value} suffix={f.suffix} /> : f.text}
              </span>
              <span className="text-sm leading-snug text-muted sm:text-[0.9375rem]">{f.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
