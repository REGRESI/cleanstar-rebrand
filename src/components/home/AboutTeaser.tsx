import { Quote } from 'lucide-react'
import { Picture } from '@/components/ui/Picture'
import { Button } from '@/components/ui/Button'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Todo } from '@/components/ui/Todo'
import { company } from '@/content/company'
import { home } from '@/content/site'
import type { ImageId } from '@/content/images'

export function AboutTeaser() {
  const founders = company.founders.slice(0, 3)
  // Statement aus der Kundenbetreuung: das, was Geschäftsführer am meisten interessiert
  const voice = founders[1] ?? founders[0]
  return (
    <section className="py-24 sm:py-32" aria-labelledby="about-title">
      <div className="container-site grid grid-cols-1 items-center gap-14 lg:grid-cols-12">
        <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:col-span-6">
          {founders.map((f, i) => (
            <figure key={i} className={i === 1 ? 'mt-8 sm:mt-12' : ''} data-reveal>
              <Picture id={f.image as ImageId} compact sizes="(min-width:1024px) 16vw, 33vw" />
              <figcaption className="mt-3 text-xs sm:text-sm">
                <span className="block font-semibold text-ink">{f.name ?? `Gründer ${i + 1}`}</span>
                <span className="block leading-snug text-muted max-[359px]:hidden">{f.role.replace('Gründer · ', '')}</span>
              </figcaption>
            </figure>
          ))}
        </div>
        <div className="lg:col-span-6 lg:pl-8">
          <SectionHeading eyebrow={home.about.eyebrow} title={home.about.headline} id="about-title" />
          <p className="lead mt-6" data-reveal>
            {home.about.text}
          </p>
          {voice && (
            <blockquote className="relative mt-10 rounded-card bg-glacier p-6 sm:p-8" data-reveal>
              <Quote aria-hidden className="absolute -top-4 left-6 size-8 rounded-full bg-blue p-1.5 text-white" />
              <p className="text-lg leading-relaxed text-ink">„{voice.statement}“</p>
              <footer className="mt-4 text-sm text-muted">
                {voice.name}, {voice.role.replace('Gründer · ', '')}
                {voice.draft && <Todo title={voice.draft}>Entwurf</Todo>}
              </footer>
            </blockquote>
          )}
          <div className="mt-10" data-reveal>
            <Button to="/ueber-uns" variant="secondary" arrow>
              Wer wir sind
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
