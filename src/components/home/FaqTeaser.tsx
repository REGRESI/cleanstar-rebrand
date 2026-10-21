import { Accordion } from '@/components/ui/Accordion'
import { Button } from '@/components/ui/Button'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Todo } from '@/components/ui/Todo'
import { faqs } from '@/content/faq'

export function FaqTeaser() {
  const items = faqs.filter((f) => f.featured).slice(0, 5)
  return (
    <section className="py-24 sm:py-32" aria-labelledby="faq-title">
      <div className="container-site grid grid-cols-1 gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <SectionHeading eyebrow="Häufige Fragen" title="Was Sie vor dem ersten Gespräch wissen sollten." id="faq-title" />
          <p className="lead mt-5" data-reveal>
            Die Fragen, die uns Geschäftsführer und Office-Manager am häufigsten stellen.
          </p>
          <div className="mt-8" data-reveal>
            <Button to="/faq" variant="secondary" arrow>
              Alle Fragen
            </Button>
          </div>
        </div>
        <div className="lg:col-span-8" data-reveal>
          <Accordion
            items={items.map((f) => ({
              title: f.q,
              content: (
                <>
                  {f.a}
                  {f.todo && <Todo title={f.todo}>{f.todo}</Todo>}
                </>
              ),
            }))}
          />
        </div>
      </div>
    </section>
  )
}
