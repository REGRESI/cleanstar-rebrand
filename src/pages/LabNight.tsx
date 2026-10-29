import { Seo } from '@/components/ui/Seo'
import { NightHero } from '@/features/night/NightHero'
import { ScrubStatement } from '@/components/ui/ScrubStatement'

/**
 * Labor: Signatur-Szene „Eine Nacht in Ihrem Büro“ als Prototyp zur Bewertung (noindex, nicht verlinkt).
 * Startseiten-Einbau vorbereitet über features.signatureScene.
 */
export default function LabNight() {
  return (
    <>
      <Seo title="Labor: Eine Nacht in Ihrem Büro" description="Prototyp der Signatur-Szene, nicht öffentlich verlinkt." path="/labor/nacht" noindex />
      <NightHero />
      <div id="nach-der-nacht">
        <ScrubStatement
          id="after-night"
          label="Nach der Szene"
          text="Hier geht die Startseite weiter: Leistungen [buero], Garantie, Einzugsgebiet."
          final="Die Szene ersetzt nur das Scroll-Video im Hero."
        />
      </div>
    </>
  )
}
