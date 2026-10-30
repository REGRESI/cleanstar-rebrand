import { Seo } from '@/components/ui/Seo'
import { Button } from '@/components/ui/Button'
import { PageHero } from '@/components/ui/PageHero'
import { Answer } from '@/components/ui/Answer'
import { ImageBand } from '@/components/ui/ImageBand'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Picture } from '@/components/ui/Picture'
import { Todo } from '@/components/ui/Todo'
import { RevealText } from '@/components/ui/RevealText'
import { FeatureColumns } from '@/components/ui/Editorial'
import { FinalCta } from '@/components/home/FinalCta'
import { FounderLetter } from '@/components/ui/FounderLetter'
import { Arrival } from '@/components/home/Arrival'
import { FoundersScene } from '@/components/scenes/FoundersScene'
import { Collage } from '@/components/ui/Collage'
import { PartnerTeaser } from '@/features/partner/PartnerTeaser'
import { company } from '@/content/company'
import { values } from '@/content/site'
import { breadcrumbSchema, organizationSchema, personSchemas } from '@/lib/schema'

/** Wer ist wofür zuständig? who = Index in company.founders */
const responsibilities = [
  { topic: 'Angebot und Kalkulation', example: 'Sie möchten wissen, was die Reinigung kostet, oder Leistungen ergänzen.', who: 0 },
  { topic: 'Rechnungen und Buchhaltung', example: 'Sie haben eine Frage zu einer Rechnung oder brauchen Unterlagen für Ihre Buchhaltung.', who: 0 },
  { topic: 'Laufende Betreuung', example: 'Sie haben im Alltag einen Wunsch oder eine Frage zur Reinigung.', who: 1 },
  { topic: 'Qualität und Reklamation', example: 'Etwas ist nicht so, wie es sein soll. Wir kümmern uns und reinigen kostenlos nach.', who: 1 },
  { topic: 'Team und Vertretung', example: 'Sie möchten wissen, wer bei Ihnen reinigt, oder jemand fällt aus.', who: 2 },
  { topic: 'Schlüssel und Zugang', example: 'Schlüsselübergabe, Alarmanlage oder geänderte Schließzeiten.', who: 2 },
]

const trail = [
  { name: 'Startseite', path: '/' },
  { name: 'Über uns', path: '/ueber-uns' },
]

export default function About() {
  const founders = company.founders.slice(0, 3)
  const timeline = company.timeline.filter((t) => t.confirmed)
  return (
    <>
      <Seo
        title="Über uns: Gründer von CleanStar"
        description="Die Gründer von CleanStar aus Offenburg: Nico Schütterle, Lino Resham und Eknoor Singh. Wer wofür zuständig ist, was uns wichtig ist und wie wir arbeiten."
        path="/ueber-uns"
        schema={[organizationSchema(), ...personSchemas(), breadcrumbSchema(trail)]}
      />
      <PageHero
        trail={trail}
        eyebrow="Über uns"
        title="Ein Reinigungsdienst, den Sie persönlich kennen."
        lead="Keine Hotline, keine Zentrale, kein wechselndes Personal. Sie sprechen mit den Gründern selbst, und das Team in Ihrem Büro bleibt dasselbe."
      />

      <FoundersScene founders={founders} eyebrow="Die Gründer" />

      <section className="section pt-0!" aria-labelledby="founders-title">
        <div className="container-site">
          <SectionHeading
            layout="rail"
            eyebrow="Wer wir sind"
            title="Drei Menschen. Klare Zuständigkeiten."
            id="founders-title"
            text="Bei uns wissen Sie, wen Sie anrufen. Jeder von uns hat seinen Bereich, und alle drei kennen Ihr Objekt."
          />
          <ul className="grid-site mt-16 gap-y-16 lg:mt-24">
            {founders.map((f, i) => (
              <li key={i} className="col-span-12 md:col-span-4">
                <span aria-hidden className="rule mb-6 block" />
                <h3 className="text-[2.25rem] leading-none font-medium tracking-[-0.04em] lg:text-[2.75rem]">{f.name ?? `Gründer ${i + 1}`}</h3>
                <p className="t-meta mt-3">{f.role.replace('Gründer · ', '')}</p>
                <p className="mt-5 text-ink-2">{f.bio}</p>
                <p className="t-label mt-8">Zuständig für</p>
                <ul className="mt-3 border-t border-line">
                  {f.focus.map((x) => (
                    <li key={x} className="border-b border-line py-2.5">
                      {x}
                    </li>
                  ))}
                </ul>
                {f.draft && <Todo title={f.draft}>Entwurf</Todo>}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Zitat: große Typografie, kein Kasten (das Porträt steht schon bei den Gründern, jedes Foto nur einmal je Seite) */}
      {founders[1] && (
        <section className="on-dark section bg-night text-paper" aria-label="Zitat">
          <figure className="container-site grid-site gap-y-10 lg:items-end">
            <blockquote className="col-span-12 lg:col-span-10">
              <RevealText as="p" text={`„${founders[1].statement}“`} className="t-h2" />
              <figcaption className="t-meta mt-8">
                {founders[1].name}, {founders[1].role.replace('Gründer · ', '')}
              </figcaption>
            </blockquote>
          </figure>
        </section>
      )}

      <section className="section" aria-labelledby="who-title">
        <div className="container-site">
          <SectionHeading
            layout="rail"
            eyebrow="Zuständigkeiten"
            title="Wer ist wofür zuständig?"
            id="who-title"
            text="Kein Weiterverbinden, kein „Da muss ich nachfragen“. Für jedes Anliegen gibt es einen Verantwortlichen."
          />
          <div className="mt-14 hidden grid-cols-12 gap-x-8 pb-3 font-medium tabular-nums text-[0.75rem] text-muted lg:grid" aria-hidden>
            <span className="col-span-4">Anliegen</span>
            <span className="col-span-5">Zum Beispiel</span>
            <span className="col-span-3 text-right">Zuständig</span>
          </div>
          <ul className="mt-10 border-b border-line lg:mt-0">
            {responsibilities.map((r) => {
              const f = founders[r.who]
              return (
                <li key={r.topic} className="grid grid-cols-1 gap-x-8 gap-y-1 border-t border-line py-5 lg:grid-cols-12 lg:py-6">
                  <span className="text-[1.25rem] font-medium tracking-[-0.015em] lg:col-span-4">{r.topic}</span>
                  <span className="text-ink-2 lg:col-span-5">{r.example}</span>
                  {f && <span className="mt-2 font-medium tabular-nums text-[0.8125rem] lg:col-span-3 lg:mt-1 lg:text-right">{f.name}</span>}
                </li>
              )
            })}
          </ul>
          <div className="mt-10">
            <Button to="/leistungsmappe" variant="link">
              Alles über uns kompakt: die Leistungsmappe zum Blättern
            </Button>
          </div>
        </div>
      </section>

      <section className="section bg-surface" aria-labelledby="story-title">
        <div className="container-site grid-site gap-y-10">
          <span aria-hidden className="rule col-span-12 mb-4" />
          <div className="col-span-12 lg:col-span-4">
            <p className="t-label mb-6">Unsere Geschichte</p>
            <RevealText as="h2" text="Warum es CleanStar gibt." id="story-title" className="t-h3" />
            <Collage className="mt-12 max-w-md lg:mt-16" layers={[{ id: 'quality-check' }, { id: 'svc-buero-detail' }, { id: 'svc-unterhalt' }]} />
          </div>
          <div className="prose-cs col-span-12 lg:col-span-7 lg:col-start-6">
            <p className="t-lead">
              Viele Unternehmen kennen das: Die Reinigungsfirma kommt, aber niemand weiß genau, wer und wann. Beschwerden landen in einer Warteschleife, und nach ein paar Monaten
              lässt die Qualität nach.
            </p>
            <p>
              CleanStar ist mit dem Anspruch angetreten, genau das anders zu machen: feste Teams, ein Ansprechpartner, der erreichbar ist, und eine Garantie, die im Alltag gilt.
              Von Offenburg aus, für Unternehmen im ganzen Ortenaukreis.
            </p>
            <p>
              Wir sind drei Gründer mit klar verteilten Aufgaben: Zahlen und Angebote, Kundenbetreuung und Qualität, Team und Einsatzplanung. Unser Team bringt über{' '}
              {company.yearsOfExperience} Jahre Erfahrung in der Reinigung mit. Und weil wir rund um die Uhr erreichbar sind, bleibt bei uns kein Anliegen liegen.
            </p>
          </div>
        </div>
      </section>

      <Arrival image="evening-clean" id="about-moment" title={'Drei Gründer.\nEin Versprechen.'} edge="GEGRÜNDET IN OFFENBURG">
        <div className="container-site text-center">
          <p className="t-lead mx-auto max-w-[40ch] text-ink-2">Nico Schütterle, Lino Resham und Eknoor Singh führen den Betrieb selbst und sind direkt für Sie erreichbar.</p>
          {/* versetztes Bildpaar wie auf der Startseite (48 % und 34 %, siehe .arrive-cards) */}
          <div className="arrive-cards mt-5 text-left lg:mt-6">
            <div className="card-shadow arrive-card overflow-hidden rounded-[10px]">
              <Picture id="team-briefing" aspect="size-full" sizes="(min-width:1024px) 34vw, 90vw" />
            </div>
            <div className="card-shadow arrive-card overflow-hidden rounded-[10px]">
              <Picture id="inspection" aspect="size-full" sizes="(min-width:1024px) 26vw, 55vw" />
            </div>
          </div>
        </div>
      </Arrival>
      <FounderLetter />

      <section className="section" aria-labelledby="values-title">
        <div className="container-site">
          <SectionHeading layout="rail" eyebrow="Werte" title="Woran Sie uns messen können." id="values-title" />
          <FeatureColumns className="mt-14 lg:mt-20" items={values} />
        </div>
      </section>

      {timeline.length > 0 && (
        <section className="section pt-0!" aria-labelledby="timeline-title">
          <div className="container-site">
            <SectionHeading layout="rail" eyebrow="Meilensteine" title="Unser Weg bisher." id="timeline-title" />
            <ol className="mt-14 border-b border-line lg:mt-20">
              {timeline.map((t) => (
                <li key={t.title} className="grid-site gap-y-2 border-t border-line py-7">
                  <p className="col-span-12 font-medium tabular-nums text-[0.9375rem] lg:col-span-3">{t.year}</p>
                  <h3 className="col-span-12 text-[1.5rem] leading-tight font-medium tracking-[-0.02em] lg:col-span-4">{t.title}</h3>
                  <p className="col-span-12 text-ink-2 lg:col-span-5">{t.text}</p>
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

      <ImageBand id="after-office" loop="wagen" />
      <section className="on-dark section bg-night text-paper" aria-labelledby="team-title">
        <div className="container-site grid-site gap-y-8 lg:items-end">
          <div className="col-span-12 lg:col-span-6">
            <p className="t-label mb-6">Team</p>
            <RevealText as="h2" text="Feste Teams statt ständig neuer Gesichter." id="team-title" className="t-h2" />
          </div>
          <p className="t-lead col-span-12 measure text-paper lg:col-span-5 lg:col-start-8">
            Unsere Mitarbeitenden arbeiten in festen Objekten und werden dort eingearbeitet. So entsteht Routine, und Sie wissen, wer bei Ihnen arbeitet.
          </p>
        </div>
      </section>
      <PartnerTeaser className="pt-20 pb-12 sm:pt-28 lg:pt-36 lg:pb-14" />
      <Answer
        dark
      >{`CleanStar wurde ${company.foundedYear} in Offenburg von Nico Schütterle, Lino Resham und Eknoor Singh gegründet. Die drei Gesellschafter führen den Betrieb selbst und sind direkt für Kunden erreichbar.`}</Answer>
      <FinalCta />
    </>
  )
}
