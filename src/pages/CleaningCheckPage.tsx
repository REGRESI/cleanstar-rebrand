import { Seo } from '@/components/ui/Seo'
import { PageHero } from '@/components/ui/PageHero'
import { CleaningCheck } from '@/features/check/CleaningCheck'
import { checkQuestions } from '@/content/check'
import { breadcrumbSchema, webAppSchema } from '@/lib/schema'
import { AuthorBox } from '@/components/ui/AuthorBox'
import { pageMeta } from '@/content/pageMeta'

const meta = pageMeta['/reinigungs-check']

const trail = [
  { name: 'Startseite', path: '/' },
  { name: 'Reinigungs-Check', path: '/reinigungs-check' },
]

export default function CleaningCheckPage() {
  return (
    <>
      <Seo
        title="Reinigungs-Check: Büroreinigung testen"
        description={`Wie gut ist Ihre aktuelle Büroreinigung? ${checkQuestions.length} kurze Fragen, zwei Minuten, mit Auswertung und konkreten Hinweisen. Ohne Anmeldung, nichts wird gespeichert.`}
        path="/reinigungs-check"
        schema={[
          webAppSchema({ name: 'Reinigungs-Check', description: 'Kurzer Test der aktuellen Büroreinigung mit Auswertung und Hinweisen.', path: '/reinigungs-check', ...meta }),
          breadcrumbSchema(trail),
        ]}
      />
      <PageHero
        trail={trail}
        eyebrow="Reinigungs-Check"
        title="Wie gut ist Ihre aktuelle Reinigung?"
        lead={`${checkQuestions.length} kurze Fragen, zwei Minuten. Sie bekommen eine ehrliche Auswertung und drei konkrete Hinweise. Ohne Anmeldung, nichts wird gespeichert.`}
      />
      <section className="pb-24 lg:pb-40" aria-label="Fragen">
        <div className="container-site grid-site">
          <div className="col-span-12 lg:col-span-8 lg:col-start-4">
            <CleaningCheck />
            <AuthorBox label="Werkzeug von" author={meta.author} published={meta.published} modified={meta.modified} className="mt-20" />
          </div>
        </div>
      </section>
    </>
  )
}
