import { PortraitHeadline } from '@/components/ui/PortraitPulse'
import { Picture } from '@/components/ui/Picture'
import type { ImageId } from '@/content/images'
import { Button } from '@/components/ui/Button'
import { RiskFreeSeal } from '@/components/ui/RiskFreeSeal'
import { home } from '@/content/site'
import { company } from '@/content/company'
import { QuoteButton } from '@/features/configurator/QuoteLink'
import { useOfficeWay } from '@/features/office/officeWay'

/**
 * Abschluss auf heller Fläche (Referenz: ERA): Überschrift mit Farbwelle und rundem Gründer-Porträt (Ring-Puls),
 * kurzer Satz, zwei Buttons, daneben ein Foto. Danach folgt das Seitenende (Bild zum Streifen, Footer).
 * tone: Fläche, passend zum Abschnitt davor
 */
export function FinalCta({ headline = home.finalCta.headline, tone = 'surface', image }: { headline?: string; tone?: 'surface' | 'paper'; image?: ImageId }) {
  const [way] = useOfficeWay()
  return (
    <section className={tone === 'surface' ? 'section bg-surface text-ink' : 'section bg-paper text-ink'} aria-labelledby="cta-title">
      <div className="container-site grid-site items-center gap-y-14">
        <div className="col-span-12 lg:col-span-6">
          <p className="t-label">{home.finalCta.eyebrow}</p>
          <PortraitHeadline id="cta-title" text={headline} className="t-h2 mt-5 max-w-[18ch]" />
          <p className="t-lead mt-6 max-w-[46ch] text-ink-2">{home.finalCta.text}</p>
          {way && <p className="mt-4 text-ink">{way.cta}</p>}
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <QuoteButton size="lg" arrow>
              Kostenlose Besichtigung
            </QuoteButton>
            <Button href={company.phone.href} variant="outline" size="lg">
              {`Anrufen: ${company.phone.display}`}
            </Button>
          </div>
          {image && <RiskFreeSeal label="Laufzeit und Kündigung auf einen Blick" className="mt-10" />}
        </div>
        {/* Kein festes Foto mehr (es stand auf jeder Seite gleich); optional ein Bild, das auf der Seite sonst nicht vorkommt */}
        {image ? (
          <div className="col-span-12 lg:col-span-5 lg:col-start-8">
            <div className="card-shadow overflow-hidden rounded-[14px]">
              <Picture id={image} aspect="aspect-[4/5] sm:aspect-[4/3] lg:aspect-[4/5]" sizes="(min-width:1024px) 36vw, 100vw" />
            </div>
          </div>
        ) : (
          <div className="col-span-12 lg:col-span-5 lg:col-start-8">
            <dl className="card-shadow rounded-[14px] bg-paper px-7 py-4 sm:px-9">
              {home.finalCta.facts.map((f) => (
                <div key={f.value} className="flex items-baseline gap-6 border-b border-line py-6">
                  <dt className="w-[3.6ch] shrink-0 text-[clamp(2.25rem,1.6rem+1.6vw,3.25rem)] leading-none font-medium tracking-[-0.04em] tabular-nums text-blue">{f.value}</dt>
                  <dd className="text-ink-2">{f.label}</dd>
                </div>
              ))}
              <div className="py-6">
                <RiskFreeSeal label="Laufzeit und Kündigung auf einen Blick" />
              </div>
            </dl>
          </div>
        )}
      </div>
    </section>
  )
}
