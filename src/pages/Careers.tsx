import { Seo } from '@/components/ui/Seo'
import { PageHero } from '@/components/ui/PageHero'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Collage } from '@/components/ui/Collage'
import { LoopVideo } from '@/components/ui/LoopVideo'
import { Todo } from '@/components/ui/Todo'
import { Accordion } from '@/components/ui/Accordion'
import { Button } from '@/components/ui/Button'
import { FeatureColumns } from '@/components/ui/Editorial'
import { ApplicationForm } from '@/features/forms/ApplicationForm'
import { PartnerTeaser } from '@/features/partner/PartnerTeaser'
import { careers, jobs } from '@/content/site'
import { company } from '@/content/company'
import { breadcrumbSchema } from '@/lib/schema'

const trail = [
  { name: 'Startseite', path: '/' },
  { name: 'Karriere', path: '/karriere' },
]

export default function Careers() {
  const open = jobs.filter((j) => j.enabled)
  return (
    <>
      <Seo title={careers.seoTitle} description={careers.seoDescription} path="/karriere" schema={[breadcrumbSchema(trail)]} />
      <PageHero
        trail={trail}
        eyebrow="Karriere"
        title={careers.headline}
        lead={careers.intro}
        image="careers"
        actions={
          <Button
            href="#bewerbung"
            size="lg"
            arrow
            onClick={(e) => {
              e.preventDefault()
              document.getElementById('bewerbung')?.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            In 2 Minuten bewerben
          </Button>
        }
      />
      <section className="section" aria-labelledby="why-title">
        <div className="container-site">
          <SectionHeading layout="rail" eyebrow="Warum CleanStar" title="Was Sie bei uns erwartet." id="why-title" />
          <FeatureColumns className="mt-14 lg:mt-20" items={careers.benefits} />
          <p className="mt-6 text-sm text-muted">
            <Todo title={careers.benefitsTodo}>{careers.benefitsTodo}</Todo>
          </p>
        </div>
      </section>
      <div className="container-site pb-20 sm:pb-28 lg:pb-36">
        <Collage
          className="mx-auto max-w-4xl"
          layers={[{ id: 'team-work' }, { id: 'partner-onboarding' }, { node: <LoopVideo name="wischen" className="size-full" position="30% 50%" /> }]}
        />
      </div>
      <section className="section bg-surface" aria-labelledby="jobs-title">
        <div className="container-site grid-site gap-y-12">
          <div className="col-span-12 lg:col-span-4">
            <SectionHeading
              eyebrow="Offene Stellen"
              title={`${open.length} ${open.length === 1 ? 'offene Stelle' : 'offene Stellen'}`}
              id="jobs-title"
              size="h3"
              text="Keine passende Stelle dabei? Bewerben Sie sich trotzdem, wir freuen uns über gute Leute."
            />
          </div>
          <div className="col-span-12 lg:col-span-7 lg:col-start-6" data-reveal>
            <Accordion
              defaultOpen={0}
              items={open.map((j) => ({
                title: (
                  <span>
                    <span className="block">{j.title}</span>
                    <span className="mt-2 block tabular-nums text-[0.75rem] font-normal tracking-normal text-muted">
                      {j.type} · {j.location} · {j.times}
                    </span>
                  </span>
                ),
                content: (
                  <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                    <div>
                      <p className="t-label mb-3">Ihre Aufgaben</p>
                      <ul className="border-t border-line">
                        {j.tasks.map((t) => (
                          <li key={t} className="border-b border-line py-2.5">
                            {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="t-label mb-3">Was Sie mitbringen</p>
                      <ul className="border-t border-line">
                        {j.profile.map((t) => (
                          <li key={t} className="border-b border-line py-2.5">
                            {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                    {j.todo && (
                      <p className="sm:col-span-2">
                        <Todo>{j.todo}</Todo>
                      </p>
                    )}
                  </div>
                ),
              }))}
            />
          </div>
        </div>
      </section>
      <section id="bewerbung" className="on-dark section scroll-mt-24 bg-night text-paper" aria-labelledby="apply-title">
        <div className="container-site grid-site gap-y-12">
          <div className="col-span-12 lg:col-span-4">
            <SectionHeading
              eyebrow="Kurzbewerbung"
              title="In 2 Minuten beworben."
              id="apply-title"
              size="h3"
              text="Name, Telefonnummer, wann Sie können. Mehr brauchen wir nicht für den ersten Schritt. Wir rufen Sie zurück."
            />
            <p className="mt-8 text-muted-dark" data-reveal>
              Oder rufen Sie direkt an:{' '}
              <a href={company.phone.href} className="ulink font-medium text-paper">
                {company.phone.display}
              </a>
            </p>
          </div>
          <div className="col-span-12 lg:col-span-7 lg:col-start-6">
            <ApplicationForm />
          </div>
        </div>
      </section>
      <div className="pt-24 lg:pt-36">
        <PartnerTeaser />
      </div>
    </>
  )
}
