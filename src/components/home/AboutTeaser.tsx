import { Quote } from 'lucide-react'
import { Picture } from '@/components/ui/Picture'
import { Button } from '@/components/ui/Button'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Fact } from '@/components/ui/Todo'
import { company } from '@/content/company'
import { home } from '@/content/site'
import type { ImageId } from '@/content/images'

export function AboutTeaser() {
  const founders = company.founders.slice(0, 3)
  return (
    <section className="py-24 sm:py-32" aria-labelledby="about-title">
      <div className="container-site grid grid-cols-1 items-center gap-14 lg:grid-cols-12">
        <div className="grid grid-cols-2 gap-4 lg:col-span-6">
          {founders.slice(0, 2).map((f, i) => (
            <figure key={i} className={i === 1 ? 'mt-12' : ''} data-reveal>
              <Picture id={f.image as ImageId} sizes="(min-width:1024px) 25vw, 50vw" />
              <figcaption className="mt-3 text-sm">
                <span className="block font-semibold text-ink">
                  <Fact value={f.name} fallback={`Gründer ${i + 1}`} todo="Name eintragen" />
                </span>
                <span className="text-muted">{f.role}</span>
              </figcaption>
            </figure>
          ))}
        </div>
        <div className="lg:col-span-6 lg:pl-8">
          <SectionHeading eyebrow={home.about.eyebrow} title={home.about.headline} id="about-title" />
          <p className="lead mt-6" data-reveal>
            {home.about.text}
          </p>
          <blockquote className="relative mt-10 rounded-card bg-glacier p-6 sm:p-8" data-reveal>
            <Quote aria-hidden className="absolute -top-4 left-6 size-8 rounded-full bg-blue p-1.5 text-white" />
            <p className="text-lg leading-relaxed text-ink">
              <Fact
                value={founders[0]?.statement}
                fallback="Persönliches Statement der Gründer: warum CleanStar, was Ihnen bei jedem Auftrag wichtig ist."
                todo="Statement in company.ts eintragen"
              />
            </p>
          </blockquote>
          <div className="mt-10" data-reveal>
            <Button to="/ueber-uns" variant="secondary" arrow>
              Mehr über uns
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
