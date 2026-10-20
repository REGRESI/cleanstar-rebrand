import { Briefcase, Clock, MapPin } from 'lucide-react'
import { Seo } from '@/components/ui/Seo'
import { PageHero } from '@/components/ui/PageHero'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Picture } from '@/components/ui/Picture'
import { Todo } from '@/components/ui/Todo'
import { Accordion } from '@/components/ui/Accordion'
import { Button } from '@/components/ui/Button'
import { ApplicationForm } from '@/features/forms/ApplicationForm'
import { careers, jobs } from '@/content/site'
import { company } from '@/content/company'
import { breadcrumbSchema } from '@/lib/schema'

const trail = [
  { name: 'Start', path: '/' },
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
            In 2 Minuten bewerben
          </Button>
        }
      />
      <section className="py-24 sm:py-32" aria-labelledby="why-title">
        <div className="container-site">
          <SectionHeading eyebrow="Warum CleanStar" title="Was Sie bei uns erwartet." id="why-title" />
          <ul className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {careers.benefits.map((b) => (
              <li key={b.title} className="rounded-card bg-glacier p-6 sm:p-8" data-reveal>
                <h3 className="text-xl font-semibold tracking-tight">{b.title}</h3>
                <p className="mt-3 leading-relaxed text-muted">{b.text}</p>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-muted">
            <Todo title={careers.benefitsTodo}>{careers.benefitsTodo}</Todo>
          </p>
        </div>
      </section>
      <section className="bg-glacier py-24 sm:py-32" aria-labelledby="jobs-title">
        <div className="container-site grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeading
              eyebrow="Offene Stellen"
              title={`${open.length} ${open.length === 1 ? 'offene Stelle' : 'offene Stellen'}`}
              id="jobs-title"
              text="Keine passende Stelle dabei? Bewerben Sie sich trotzdem, wir freuen uns über gute Leute."
            />
            <div className="mt-8 hidden lg:block" data-reveal>
              <Picture id="team-work" sizes="40vw" />
            </div>
          </div>
          <div className="lg:col-span-7" data-reveal>
            <Accordion
              defaultOpen={0}
              items={open.map((j) => ({
                title: (
                  <span>
                    <span className="block">{j.title}</span>
                    <span className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm font-normal text-muted">
                      <span className="inline-flex items-center gap-1.5">
                        <Briefcase aria-hidden className="size-3.5" />
                        {j.type}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin aria-hidden className="size-3.5" />
                        {j.location}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock aria-hidden className="size-3.5" />
                        {j.times}
                      </span>
                    </span>
                  </span>
                ),
                content: (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <p className="mb-2 font-semibold text-ink">Ihre Aufgaben</p>
                      <ul className="list-disc space-y-1 pl-5">
                        {j.tasks.map((t) => (
                          <li key={t}>{t}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="mb-2 font-semibold text-ink">Was Sie mitbringen</p>
                      <ul className="list-disc space-y-1 pl-5">
                        {j.profile.map((t) => (
                          <li key={t}>{t}</li>
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
      <section id="bewerbung" className="scroll-mt-24 py-24 sm:py-32" aria-labelledby="apply-title">
        <div className="container-site grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeading
              eyebrow="Kurzbewerbung"
              title="In 2 Minuten beworben."
              id="apply-title"
              text="Name, Telefonnummer, wann Sie können. Mehr brauchen wir nicht für den ersten Schritt. Wir rufen Sie zurück."
            />
            <p className="mt-6 text-sm text-muted" data-reveal>
              Oder rufen Sie direkt an:{' '}
              <a href={company.phone.href} className="font-semibold text-ink underline underline-offset-4">
                {company.phone.display}
              </a>
            </p>
          </div>
          <div className="lg:col-span-7">
            <ApplicationForm />
          </div>
        </div>
      </section>
    </>
  )
}
