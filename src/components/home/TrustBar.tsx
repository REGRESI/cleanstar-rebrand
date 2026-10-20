import { CountUp } from '@/components/ui/CountUp'
import { trustFacts } from '@/content/site'

/** Vertrauensleiste mit echten, bestätigten Werten aus company.ts */
export function TrustBar() {
  return (
    <section aria-label="Kernfakten" className="relative border-y border-line bg-white">
      <div className="container-site">
        <ul className="grid grid-cols-2 divide-line lg:grid-cols-4 lg:divide-x">
          {trustFacts.slice(0, 4).map((f, i) => (
            <li key={i} className="flex flex-col gap-1 border-line py-8 odd:pr-4 even:pl-4 max-lg:[&:nth-child(-n+2)]:border-b lg:px-8 lg:py-10 lg:first:pl-0" data-reveal>
              <span className="text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
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
