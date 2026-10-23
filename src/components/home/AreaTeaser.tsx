import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { places, shortName } from '@/content/places'
import { home } from '@/content/site'
import { company } from '@/content/company'

/** Einzugsgebiet kompakt: Kennzahlen und die größeren Orte als Tabelle mit Fahrzeit, Link zur Karte. */
export function AreaTeaser({ index }: { index?: string }) {
  const maxMin = Math.max(...places.map((p) => p.minutes))
  const major = places.filter((p) => p.major)
  return (
    <section className="section" aria-labelledby="area-title">
      <div className="container-site">
        <SectionHeading layout="rail" index={index} eyebrow={home.area.eyebrow} title={home.area.headline} id="area-title" />
        <div className="grid-site mt-16 gap-y-12 lg:mt-24">
          <div className="col-span-12 grid grid-cols-2 gap-x-5 lg:col-span-5 lg:col-start-4 lg:gap-x-8" data-reveal>
            <div className="border-t border-line pt-6">
              <p className="t-num">{places.length}</p>
              <p className="t-label mt-4">Orte im {company.serviceArea}</p>
            </div>
            <div className="border-t border-line pt-6">
              <p className="t-num">{maxMin}</p>
              <p className="t-label mt-4">Minuten Fahrzeit, höchstens</p>
            </div>
            <p className="col-span-2 mt-10 text-ink-2">
              Von {company.seat} aus betreuen wir Unternehmen im ganzen Kreis. Kurze Wege, damit wir kurzfristig da sind, wenn etwas ist.
            </p>
            <div className="col-span-2 mt-8">
              <Button to="/einzugsgebiet" variant="link">
                Karte mit allen Orten
              </Button>
            </div>
          </div>
          <table className="col-span-12 w-full border-b border-line text-left lg:col-span-3 lg:col-start-10">
            <caption className="sr-only">Größere Orte und Fahrzeit ab {company.seat}</caption>
            <thead className="sr-only">
              <tr>
                <th scope="col">Ort</th>
                <th scope="col">Fahrzeit</th>
              </tr>
            </thead>
            <tbody>
              {major.map((p) => (
                <tr key={p.slug} className="border-t border-line">
                  <th scope="row" className="py-3 font-normal">
                    <Link to={`/einzugsgebiet/${p.slug}`} className="ulink">
                      {shortName(p)}
                    </Link>
                  </th>
                  <td className="py-3 text-right font-mono text-[0.8125rem] whitespace-nowrap text-muted">{p.minutes ? `${p.minutes} Min.` : 'Sitz'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
