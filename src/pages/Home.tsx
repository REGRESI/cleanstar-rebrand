import { Suspense, type ReactNode } from 'react'
import { Hero } from '@/components/home/Hero'
import { BrandPromise } from '@/components/home/BrandPromise'
import { ProblemSolution } from '@/components/home/ProblemSolution'
import { ServicesGrid } from '@/components/home/ServicesGrid'
import { Proof } from '@/components/home/Proof'
import { Founders } from '@/components/home/Founders'
import { AreaTeaser } from '@/components/home/AreaTeaser'
import { ToolsLine } from '@/components/home/ToolsLine'
import { FinalCta } from '@/components/home/FinalCta'
import { Seo } from '@/components/ui/Seo'
import { Answer } from '@/components/ui/Answer'
import { home } from '@/content/site'
import { faqs } from '@/content/faq'
import { hasProof } from '@/content/proof'
import { faqSchema, localBusinessSchema, websiteSchema } from '@/lib/schema'

/** Eigene Suspense-Grenzen: React hydriert die Abschnitte in kleinen Häppchen (weniger Blocking Time). */
const Chunk = ({ children }: { children: ReactNode }) => <Suspense fallback={null}>{children}</Suspense>

/**
 * Startseite: eine Geschichte in acht Schritten.
 * 1 Hero mit Scroll-Video (Leitidee) · 2 Versprechen · 3 Das kennen Sie vielleicht · 4 Leistungen ·
 * 5 Beweise (nur mit Einträgen) · 6 Gründer · 7 Einzugsgebiet · 8 Abschluss.
 * Werkzeuge und Ratgeber nur als eine Zeile.
 */
export default function Home() {
  // Abschnittsnummern: Beweise zählen nur mit, wenn sie erscheinen
  const proof = hasProof()
  const n = (i: number) => String(i).padStart(2, '0')
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
      <Chunk>
        <BrandPromise />
        <Answer>{home.answer}</Answer>
      </Chunk>
      <Chunk>
        <ProblemSolution index="02" />
      </Chunk>
      <Chunk>
        <ServicesGrid index="03" />
      </Chunk>
      <Chunk>
        <Proof index="04" />
        <Founders index={n(proof ? 5 : 4)} />
        <AreaTeaser index={n(proof ? 6 : 5)} />
        <ToolsLine />
      </Chunk>
      <Chunk>
        <FinalCta index={n(proof ? 7 : 6)} />
      </Chunk>
    </>
  )
}
