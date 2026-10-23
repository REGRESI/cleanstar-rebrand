import { Picture } from '@/components/ui/Picture'
import { Button } from '@/components/ui/Button'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { company } from '@/content/company'
import { home } from '@/content/site'
import type { ImageId } from '@/content/images'

/** Die Gründer mit Gesichtern und einem Satz: drei Porträts im gleichen Format, Namen groß, Zuständigkeit in Monospace. */
export function Founders({ index }: { index?: string }) {
  const founders = company.founders.slice(0, 3)
  return (
    <section className="section" aria-labelledby="about-title">
      <div className="container-site">
        <SectionHeading layout="rail" index={index} eyebrow={home.about.eyebrow} title={home.about.headline} text={home.about.short} id="about-title" />
        <ul className="grid-site mt-16 gap-y-12 lg:mt-24">
          {founders.map((f, i) => (
            <li key={i} className="col-span-12 sm:col-span-4">
              <Picture id={f.image as ImageId} ratio="4:5" reveal sizes="(min-width:640px) 33vw, 100vw" />
              <p className="mt-5 text-[1.625rem] leading-tight font-medium tracking-[-0.025em]">{f.name ?? `Gründer ${i + 1}`}</p>
              <p className="t-label mt-2">{f.role.replace('Gründer · ', '')}</p>
            </li>
          ))}
        </ul>
        <div className="mt-14" data-reveal>
          <Button to="/ueber-uns" variant="link">
            Wer wir sind
          </Button>
        </div>
      </div>
    </section>
  )
}
