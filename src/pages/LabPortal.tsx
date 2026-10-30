import { Seo } from '@/components/ui/Seo'
import { SparkPortal } from '@/components/services/SparkPortal'
import { ScrubStatement } from '@/components/ui/ScrubStatement'

/**
 * Labor: Funken-Portal Vorher/Nachher zur Bewertung (noindex, nicht verlinkt).
 * Einbau auf der Seite Leistungen vorbereitet über features.sparkPortal.
 */
export default function LabPortal() {
  return (
    <>
      <Seo title="Labor: Funken-Portal" description="Prototyp des Vorher/Nachher-Portals, nicht öffentlich verlinkt." path="/labor/portal" noindex />
      <div className="h-[40svh]" />
      <SparkPortal />
      <ScrubStatement id="after-portal" label="Nach dem Portal" text="Hier geht die Seite Leistungen weiter." final="Das Portal braucht ein deckungsgleiches Bildpaar." />
    </>
  )
}
