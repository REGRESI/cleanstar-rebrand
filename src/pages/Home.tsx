import { Suspense, type ReactNode } from 'react'
import { Hero } from '@/components/home/Hero'
import { NightHero } from '@/features/night/NightHero'
import { features } from '@/content/features'
import { ScrollStory } from '@/components/home/ScrollStory'
import { OfficeWays } from '@/components/home/OfficeWays'
import { ProblemSolution } from '@/components/home/ProblemSolution'
import { ServicesGrid } from '@/components/home/ServicesGrid'
import { CostTeaser } from '@/components/home/CostTeaser'
import { Proof } from '@/components/home/Proof'
import { Founders } from '@/components/home/Founders'
import { AreaTeaser } from '@/components/home/AreaTeaser'
import { MappeTeaser } from '@/components/home/MappeTeaser'
import { ToolsLine } from '@/components/home/ToolsLine'
import { FinalCta } from '@/components/home/FinalCta'
import { Seo } from '@/components/ui/Seo'
import { Answer } from '@/components/ui/Answer'
import { ImageBand } from '@/components/ui/ImageBand'
import { home } from '@/content/site'
import { answers } from '@/content/answers'
import { faqs } from '@/content/faq'
import { faqSchema, localBusinessSchema, organizationSchema, personSchemas, websiteSchema } from '@/lib/schema'

/** Eigene Suspense-Grenzen: React hydriert die Abschnitte in kleinen Häppchen (weniger Blocking Time). */
const Chunk = ({ children }: { children: ReactNode }) => <Suspense fallback={null}>{children}</Suspense>

/**
 * Startseite: eine Geschichte in acht Schritten.
 * 1 Hero mit Scroll-Video (Leitidee) · 2 Scroll-Text, der sich Wort für Wort färbt (Versprechen), danach ein randloses Bildband · 3 Das kennen Sie vielleicht (dunkel) ·
 * 4 Leistungen · 5 Beweise (nur mit Einträgen) · 6 Gründer (Papierfläche) · 7 Einzugsgebiet · Auf einen Blick und Werkzeuge ·
 * 8 Abschluss (dunkel). Die Leitidee steht im Hero und im Footer. Nie mehr als zwei helle Textabschnitte hintereinander.
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
      {/* Signatur-Szene nach Freigabe (features.signatureScene): ersetzt Scroll-Video und Scroll-Text, die dieselbe
          Geschichte erzählen (Wir kommen, wenn Sie gehen; am Morgen ist alles sauber) */}
      {features.signatureScene ? <NightHero /> : <Hero />}
      <Chunk>
        {!features.signatureScene && <ScrollStory />}
        {features.signatureScene && <span id="nach-der-nacht" />}
        <Answer question={answers.home.question} className="section-top" bottom="pb-4">
          {answers.home.text}
        </Answer>
        <OfficeWays />
        <ImageBand id="evening-clean" />
      </Chunk>
      <Chunk>
        <ProblemSolution />
      </Chunk>
      <Chunk>
        <ServicesGrid />
        <CostTeaser />
      </Chunk>
      <Chunk>
        <Proof />
        <Founders />
        <AreaTeaser />
        <MappeTeaser />
        {/* Schlussblock vor dem Abschluss: Werkzeuge in einer Zeile */}
        <ToolsLine />
      </Chunk>
      <Chunk>
        <FinalCta />
      </Chunk>
    </>
  )
}
