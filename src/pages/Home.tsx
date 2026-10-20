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
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Seo } from '@/components/ui/Seo'
import { BeforeAfter } from '@/features/slider/BeforeAfter'
import { AreaMap } from '@/features/map/AreaMap'
import { home } from '@/content/site'
import { faqs } from '@/content/faq'
import { faqSchema, localBusinessSchema } from '@/lib/schema'
import { company } from '@/content/company'

/** Eigene Suspense-Grenzen: React hydriert die Abschnitte in kleinen Häppchen (weniger Blocking Time). */
const Chunk = ({ children }: { children: ReactNode }) => <Suspense fallback={null}>{children}</Suspense>

export default function Home() {
  return (
    <>
      <Seo
        title={`${company.name} | ${home.seoTitle}`}
        bare
        description={home.seoDescription}
        path="/"
        schema={[localBusinessSchema(), faqSchema(faqs.filter((f) => f.featured && !f.todo))]}
      />
      <Hero />
      <Chunk>
        <TrustBar />
        <ClientLogos />
      </Chunk>
      <Chunk>
        <ProblemSolution />
      </Chunk>
      <Chunk>
        <ServicesGrid />
      </Chunk>
      <Chunk>
        <GuaranteeTeaser />
        <ProcessTimeline />
      </Chunk>
      <Chunk>
        <section className="bg-glacier py-24 sm:py-32" aria-labelledby="ba-title">
          <div className="container-site grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-4">
              <SectionHeading eyebrow={home.beforeAfter.eyebrow} title={home.beforeAfter.headline} id="ba-title" />
              <p className="lead mt-5" data-reveal>
                {home.beforeAfter.lead}
              </p>
            </div>
            <div className="lg:col-span-8" data-reveal>
              <BeforeAfter before="before-office" after="after-office" />
            </div>
          </div>
        </section>
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
        <AboutTeaser />
        <Testimonials />
      </Chunk>
      <Chunk>
        <FaqTeaser />
        <FinalCta />
      </Chunk>
    </>
  )
}
