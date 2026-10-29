import { NightStage } from './NightStage'
import { QuoteButton } from '@/features/configurator/QuoteLink'
import { home } from '@/content/site'

/**
 * Hero mit Signatur-Szene: Einstieg mit der echten H1 der Startseite, am Ende (7:00) Headline und Haupt-CTA.
 * Der Text der Szene steht vollständig im HTML.
 */
export function NightHero({ next = 'nach-der-nacht' }: { next?: string }) {
  return (
    <NightStage
      onSkipTo={next}
      intro={
        <div className="container-site">
          <h1 id="night-title" className="max-w-[16ch]">
            <span className="t-label block">{home.hero.kicker}</span>
            <span className="t-display mt-4 block whitespace-pre-line">{home.hero.headline}</span>
          </h1>
          <p className="t-lead mt-6 max-w-[34ch]">Eine Nacht in Ihrem Büro. Scrollen Sie, wir zeigen Ihnen, was passiert, wenn Sie gehen.</p>
        </div>
      }
      outro={
        <div className="container-site">
          <p className="t-label">7:00 · Ihr Büro ist bereit</p>
          <p className="t-display mt-4 max-w-[14ch] whitespace-pre-line">{home.hero.headline}</p>
          <div className="mt-8">
            <QuoteButton size="lg" arrow>
              {home.hero.cta}
            </QuoteButton>
          </div>
        </div>
      }
    />
  )
}
