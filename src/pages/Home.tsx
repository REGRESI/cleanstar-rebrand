import { Suspense, type ReactNode } from 'react'
import { Hero } from '@/components/home/Hero'
import { NightHero } from '@/features/night/NightHero'
import { features } from '@/content/features'
import { ServicesCarousel } from '@/components/home/ServicesCarousel'
import { ProblemSolution } from '@/components/home/ProblemSolution'
import { CostTeaser } from '@/components/home/CostTeaser'
import { Proof } from '@/components/home/Proof'
import { Founders } from '@/components/home/Founders'
import { AreaTeaser } from '@/components/home/AreaTeaser'
import { MappeTeaser } from '@/components/home/MappeTeaser'
import { FinalCta } from '@/components/home/FinalCta'
import { Seo } from '@/components/ui/Seo'
import { Answer } from '@/components/ui/Answer'
import { CircleTransition } from '@/components/ui/CircleTransition'
import { home } from '@/content/site'
import { answers } from '@/content/answers'
import { faqs } from '@/content/faq'
import { faqSchema, localBusinessSchema, organizationSchema, personSchemas, websiteSchema } from '@/lib/schema'

/** Eigene Suspense-Grenzen: React hydriert die Abschnitte in kleinen Häppchen (weniger Blocking Time). */
const Chunk = ({ children }: { children: ReactNode }) => <Suspense fallback={null}>{children}</Suspense>

/**
 * Startseite, gekürzt: Der Hero erzählt die Nacht (Feierabend, Staub, Plan, Morgen); was danach dasselbe noch einmal
 * sagte (Scroll-Text, Bildband am Abend), ist entfallen. Je Abschnitt genau eine Fläche (Klarweiß, Eisblau, Navy).
 * 1 Hero → Kreis (Eisblau) · 2 Leistungen als Karussell (Eisblau) · 3 Kostenrechner (Klarweiß, dunkle Karte) ·
 * 4 Das kennen Sie vielleicht (Navy) · Kreis über Teamfoto (Klarweiß) · 5 Gründer (Klarweiß) · Beweise (nur mit
 * Einträgen) · 6 Einzugsgebiet · 7 Leistungsmappe (Navy) · Kurz beantwortet · Kreis (Eisblau) · 8 Abschluss (Eisblau).
 */
export default function Home() {
  return (
    <>
      <Seo
        title={home.seoTitle}
        description={home.seoDescription}
        path="/"
        ogType="start"
        schema={[organizationSchema(), localBusinessSchema(), ...personSchemas(), websiteSchema(), faqSchema(faqs.filter((f) => f.featured && !f.todo))]}
      />
      {/* Signatur-Szene nach Freigabe (features.signatureScene) statt des Heros; bleibt ausgeschaltet */}
      {features.signatureScene ? <NightHero /> : <Hero />}
      <Chunk>
        <ServicesCarousel />
        <CostTeaser />
      </Chunk>
      <Chunk>
        <ProblemSolution />
        <CircleTransition image="team-briefing" tone="paper" text="Drei Gründer aus Offenburg" orbit />
        <Founders />
        <Proof />
      </Chunk>
      <Chunk>
        <AreaTeaser />
        <MappeTeaser />
        <Answer question={answers.home.question} className="section-top" bottom="pb-4">
          {answers.home.text}
        </Answer>
      </Chunk>
      <Chunk>
        <CircleTransition image="team-work" tone="surface" text="Wir kommen, wenn Sie gehen" orbit />
        <FinalCta />
      </Chunk>
    </>
  )
}
