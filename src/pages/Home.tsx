import { Suspense, type ReactNode } from 'react'
import { Hero } from '@/components/home/Hero'
import { TrustBar } from '@/components/home/TrustBar'
import { ProblemSolution } from '@/components/home/ProblemSolution'
import { ServicesGrid } from '@/components/home/ServicesGrid'
import { GuaranteeTeaser } from '@/components/home/GuaranteeTeaser'
import { ProcessTimeline } from '@/components/home/ProcessTimeline'
import { AboutTeaser } from '@/components/home/AboutTeaser'
import { Testimonials, ClientLogos } from '@/components/home/Testimonials'
import { FaqTeaser } from '@/components/home/FaqTeaser'
import { FinalCta } from '@/components/home/FinalCta'
import { FloorPlan } from '@/features/floorplan/FloorPlan'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Seo } from '@/components/ui/Seo'
import { AreaMap } from '@/features/map/AreaMap'
import { home } from '@/content/site'
import { faqs } from '@/content/faq'
import { faqSchema, localBusinessSchema, websiteSchema } from '@/lib/schema'
import { Answer } from '@/components/ui/Answer'

/** Eigene Suspense-Grenzen: React hydriert die Abschnitte in kleinen Häppchen (weniger Blocking Time). */
const Chunk = ({ children }: { children: ReactNode }) => <Suspense fallback={null}>{children}</Suspense>

export default function Home() {
  return (
    <>
      <Seo
        title={home.seoTitle}
        description={home.seoDescription}
        path="/"
        ogType="start"
        schema={[localBusinessSchema(), websiteSchema(), faqSchema(faqs.filter((f) => f.featured && !f.todo))]}
      />
      <Hero />
      <Answer className="pt-14 sm:pt-20">{home.answer}</Answer>
      <Chunk>
        <TrustBar />
        <ClientLogos />
      </Chunk>
      <Chunk>
        <ProblemSolution checkLink />
      </Chunk>
      <Chunk>
        <ServicesGrid />
      </Chunk>
      <Chunk>
        <section className="py-24 sm:py-32" aria-labelledby="plan-title">
          <div className="container-site">
            <SectionHeading
              eyebrow="Raum für Raum"
              title="Was wird bei Ihnen gereinigt?"
              id="plan-title"
              text="Tippen Sie auf einen Bereich. Sie sehen, was dort gemacht wird und wie oft. Genau so steht es später in Ihrem Leistungsverzeichnis."
            />
            <div className="mt-12" data-reveal>
              <FloorPlan />
            </div>
          </div>
        </section>
      </Chunk>
      <Chunk>
        <GuaranteeTeaser />
        <ProcessTimeline />
      </Chunk>
      <Chunk>
        <section className="py-24 sm:py-32" aria-labelledby="area-title">
          <div className="container-site">
            <SectionHeading
              eyebrow="Einzugsgebiet"
              title="Zuhause im Ortenaukreis. Schnell vor Ort."
              text="Von Offenburg aus betreuen wir Unternehmen im ganzen Kreis. Fahren Sie mit der Maus über die Karte oder tippen Sie auf einen Ort."
              id="area-title"
            />
            <div className="mt-12" data-reveal>
              <AreaMap />
            </div>
          </div>
        </section>
      </Chunk>
      <Chunk>
        <FaqTeaser />
      </Chunk>
      <Chunk>
        <AboutTeaser />
        <Testimonials />
        <FinalCta />
      </Chunk>
    </>
  )
}
