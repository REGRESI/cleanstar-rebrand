import { Seo } from '@/components/ui/Seo'
import { PageHero } from '@/components/ui/PageHero'
import { CleaningCheck } from '@/features/check/CleaningCheck'
import { checkQuestions } from '@/content/check'
import { breadcrumbSchema } from '@/lib/schema'

const trail = [
  { name: 'Start', path: '/' },
  { name: 'Reinigungs-Check', path: '/reinigungs-check' },
]

export default function CleaningCheckPage() {
  return (
    <>
      <Seo
        title="Reinigungs-Check: Büroreinigung testen"
        description={`Wie gut ist Ihre aktuelle Büroreinigung? ${checkQuestions.length} kurze Fragen, zwei Minuten, mit Auswertung und konkreten Hinweisen. Ohne Anmeldung, nichts wird gespeichert.`}
        path="/reinigungs-check"
        schema={[breadcrumbSchema(trail)]}
      />
      <PageHero
        trail={trail}
        eyebrow="Reinigungs-Check"
        title="Wie gut ist Ihre aktuelle Reinigung?"
        lead={`${checkQuestions.length} kurze Fragen, zwei Minuten. Sie bekommen eine ehrliche Auswertung und drei konkrete Hinweise. Ohne Anmeldung, nichts wird gespeichert.`}
      />
      <section className="pb-24 sm:pb-32" aria-label="Fragen">
        <div className="container-site max-w-3xl">
          <CleaningCheck />
        </div>
      </section>
    </>
  )
}
