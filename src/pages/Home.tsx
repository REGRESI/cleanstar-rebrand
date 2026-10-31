import { type ReactNode } from 'react'
import { Hero } from '@/components/home/Hero'
import { NightHero } from '@/features/night/NightHero'
import { features } from '@/content/features'
import { ServicesHorizontal } from '@/components/home/ServicesHorizontal'
import { Arrival } from '@/components/home/Arrival'
import { PlantMoment } from '@/components/home/Moments'
import { ProblemSolution } from '@/components/home/ProblemSolution'
import { PaperReveal } from '@/components/ui/PaperReveal'
import { CostTeaser } from '@/components/home/CostTeaser'
import { Proof } from '@/components/home/Proof'
import { Founders } from '@/components/home/Founders'
import { ProcessTimeline } from '@/components/home/ProcessTimeline'
import { AreaTeaser } from '@/components/home/AreaTeaser'
import { MappeTeaser } from '@/components/home/MappeTeaser'
import { FinalCta } from '@/components/home/FinalCta'
import { Seo } from '@/components/ui/Seo'
import { Answer } from '@/components/ui/Answer'
import { HomeBlock, HomeTransitions } from '@/components/home/HomeTransitions'
import { hasProof } from '@/content/proof'
import { home } from '@/content/site'
import { answers } from '@/content/answers'
import { faqs } from '@/content/faq'
import { faqSchema, localBusinessSchema, organizationSchema, personSchemas, websiteSchema } from '@/lib/schema'

/** Vollständiges statisches HTML: Inhalte bleiben auch ohne Streaming-Skripte lesbar. */
const Chunk = ({ children }: { children: ReactNode }) => <>{children}</>

/** Übergangsplan und Abnahme: docs/uebergaenge-startseite.md. */
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
      <HomeTransitions>
      <HomeBlock id="hero">{features.signatureScene ? <NightHero /> : <Hero />}</HomeBlock>
      <Chunk>
        <HomeBlock id="arrival" transition="circle-title"><Arrival /></HomeBlock>
        <HomeBlock id="services" transition="horizontal-scroll" outgoing><ServicesHorizontal /></HomeBlock>
        <HomeBlock id="cost" transition="card-stack" outgoing><CostTeaser /></HomeBlock>
      </Chunk>
      <Chunk>
        {/* Papier-Reveal: Die Ärgernisse sind das Blatt, darunter liegt fest das Büro am Morgen */}
        <HomeBlock id="problems-morning" transition="flow-color" outgoing><PaperReveal sheet={<ProblemSolution tone="paper" />} image="after-office" id="morning-title" word="Am Morgen" line="Alles bereit, bevor der Erste kommt." /></HomeBlock>
        <HomeBlock id="team" transition="light-edge" outgoing><PlantMoment eyebrow="Ihr Team" id="team-moment" title="Ihr festes Team." text="Dieselben Gesichter, Abend für Abend. Bei Urlaub oder Krankheit übernimmt eine eingewiesene Vertretung." /></HomeBlock>
        <HomeBlock id="founders" transition="logo-house" outgoing><Founders /></HomeBlock>
        {hasProof() && <HomeBlock id="proof" transition="flow-color" outgoing><Proof /></HomeBlock>}
        <HomeBlock id="process" transition={hasProof() ? "card-stack" : "flow-color"}><ProcessTimeline /></HomeBlock>
      </Chunk>
      <Chunk>
        <HomeBlock id="area" transition="clouds" outgoing><AreaTeaser moment={'Unser Zuhause:\ndie Ortenau.'} /></HomeBlock>
        <HomeBlock id="mappe" transition="growing-window" outgoing><MappeTeaser immersive /></HomeBlock>
        <HomeBlock id="answer" transition="card-stack" outgoing><Answer question={answers.home.question} bottom="pb-4">
          {answers.home.text}
        </Answer></HomeBlock>
      </Chunk>
      <Chunk>
        <HomeBlock id="cta" transition="light-edge"><FinalCta /></HomeBlock>
      </Chunk>
      </HomeTransitions>
    </>
  )
}
