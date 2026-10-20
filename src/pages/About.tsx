import { Check } from 'lucide-react'
import { Seo } from '@/components/ui/Seo'
import { PageHero } from '@/components/ui/PageHero'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Picture } from '@/components/ui/Picture'
import { Fact, Todo } from '@/components/ui/Todo'
import { FinalCta } from '@/components/home/FinalCta'
import { PartnerTeaser } from '@/features/partner/PartnerTeaser'
import { company } from '@/content/company'
import { values } from '@/content/site'
import type { ImageId } from '@/content/images'
import { breadcrumbSchema } from '@/lib/schema'

const trail = [
  { name: 'Start', path: '/' },
  { name: 'Über uns', path: '/ueber-uns' },
]

export default function About() {
  const founders = company.founders.slice(0, 3)
  const timeline = company.timeline.filter((t) => t.confirmed)
  return (
    <>
      <Seo
        title="Über uns: Reinigung mit Gesicht aus Offenburg"
        description="CleanStar Dienstleistungen GbR aus Offenburg: Menschen, die Verantwortung für jedes Objekt übernehmen. Gründer, Werte und Team."
        path="/ueber-uns"
        schema={[breadcrumbSchema(trail)]}
      />
      <PageHero
        trail={trail}
        eyebrow="Über uns"
        title="Ein Reinigungsdienst, den Sie persönlich kennen."
        lead="Keine Hotline, keine Zentrale, kein wechselndes Personal. Sie sprechen mit den Gründern selbst, und das Team in Ihrem Büro bleibt dasselbe."
      />

      <section className="py-24 sm:py-32" aria-labelledby="founders-title">
        <div className="container-site">
          <SectionHeading
            eyebrow="Die Gründer"
            title="Drei Menschen. Klare Zuständigkeiten."
            id="founders-title"
            text="Bei uns wissen Sie, wen Sie anrufen. Jeder von uns hat seinen Bereich, und alle drei kennen Ihr Objekt."
          />
          <ul className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
            {founders.map((f, i) => (
              <li key={i} className="flex flex-col overflow-hidden rounded-panel bg-white ring-1 ring-line" data-reveal>
                <Picture id={f.image as ImageId} rounded="rounded-none" sizes="(min-width:768px) 33vw, 100vw" />
                <div className="flex flex-1 flex-col p-6 sm:p-7">
                  <h3 className="text-xl font-semibold tracking-tight">
                    <Fact value={f.name} fallback={`Gründer ${i + 1}`} todo="Name" />
                  </h3>
                  <p className="text-sm font-semibold text-blue">{f.role.replace('Gründer · ', '')}</p>
                  <p className="mt-4 leading-relaxed text-muted">{f.bio}</p>
                  <p className="mt-6 text-xs font-semibold tracking-[0.12em] text-ink/60 uppercase">Zuständig für</p>
                  <ul className="mt-3 space-y-2">
                    {f.focus.map((x) => (
                      <li key={x} className="flex items-start gap-2.5 text-ink">
                        <Check aria-hidden className="mt-1 size-4 shrink-0 text-fresh-ink" strokeWidth={3} />
                        {x}
                      </li>
                    ))}
                  </ul>
                  <blockquote className="mt-auto pt-7">
                    <p className="border-l-2 border-blue pl-4 leading-relaxed text-ink/85">„{f.statement}“</p>
                    {f.draft && (
                      <footer className="mt-2 pl-4">
                        <Todo title={f.draft}>Entwurf</Todo>
                      </footer>
                    )}
                  </blockquote>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-glacier py-24 sm:py-32" aria-labelledby="story-title">
        <div className="container-site grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeading eyebrow="Unsere Geschichte" title="Warum es CleanStar gibt." id="story-title" />
          </div>
          <div className="prose-cs lg:col-span-7" data-reveal>
            <p>
              Viele Unternehmen kennen das: Die Reinigungsfirma kommt, aber niemand weiß genau, wer und wann. Beschwerden landen in einer Warteschleife, und nach ein paar Monaten
              lässt die Qualität nach.
            </p>
            <p>
              CleanStar ist mit dem Anspruch angetreten, genau das anders zu machen: feste Teams, ein Ansprechpartner, der erreichbar ist, und eine Garantie, die im Alltag gilt.
              Von Offenburg aus, für Unternehmen im ganzen Ortenaukreis.
            </p>
            <p>
              <Todo title="Persönliche Gründungsgeschichte ergänzen (Jahr, Anlass, erste Kunden). Nur bestätigte Fakten.">Gründungsgeschichte ergänzen</Todo>
            </p>
          </div>
        </div>
      </section>

      <section className="py-24 sm:py-32" aria-labelledby="values-title">
        <div className="container-site">
          <SectionHeading eyebrow="Werte" title="Woran Sie uns messen können." id="values-title" />
          <ul className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v, i) => (
              <li key={v.title} className="rounded-card bg-white p-6 ring-1 ring-line sm:p-8" data-reveal>
                <span className="text-sm font-semibold text-blue">0{i + 1}</span>
                <h3 className="mt-3 text-2xl font-semibold tracking-tight">{v.title}</h3>
                <p className="mt-3 leading-relaxed text-muted">{v.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {timeline.length > 0 && (
        <section className="bg-glacier py-24 sm:py-32" aria-labelledby="timeline-title">
          <div className="container-site">
            <SectionHeading eyebrow="Meilensteine" title="Unser Weg bisher." id="timeline-title" />
            <ol className="mt-14 space-y-8 border-l border-line pl-8">
              {timeline.map((t) => (
                <li key={t.title} className="relative" data-reveal>
                  <span aria-hidden className="absolute top-1.5 -left-[2.4rem] size-3 rounded-full bg-blue ring-4 ring-glacier" />
                  <p className="text-sm font-semibold text-blue">{t.year}</p>
                  <h3 className="text-xl font-semibold">{t.title}</h3>
                  <p className="text-muted">{t.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}
      {timeline.length === 0 && company.showTodoMarkers && (
        <div className="container-site pb-8">
          <p className="text-sm text-muted">
            Firmengeschichte (Timeline) ist ausgeblendet, bis Einträge in company.ts bestätigt sind.
            <Todo>timeline confirmed: true setzen</Todo>
          </p>
        </div>
      )}

      <section className="py-24 sm:py-32" aria-labelledby="team-title">
        <div className="container-site grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7" data-reveal>
            <Picture id="team-work" sizes="(min-width:1024px) 60vw, 100vw" />
          </div>
          <div className="lg:col-span-5">
            <SectionHeading
              eyebrow="Team"
              title="Feste Teams statt wechselnder Gesichter."
              id="team-title"
              text="Unsere Mitarbeitenden arbeiten in festen Objekten und werden dort eingearbeitet. So entsteht Routine, und Sie wissen, wer bei Ihnen arbeitet."
            />
          </div>
        </div>
      </section>
      <PartnerTeaser />
      <FinalCta />
    </>
  )
}
