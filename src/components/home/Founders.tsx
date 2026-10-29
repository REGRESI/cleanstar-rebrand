import { Button } from '@/components/ui/Button'
import { FoundersScene } from '@/components/scenes/FoundersScene'
import { company } from '@/content/company'
import { home } from '@/content/site'

/**
 * Gründer auf der Startseite: dieselbe Szene wie auf Über uns (Porträts rücken zusammen und färben sich ein, die Aussage
 * färbt sich Buchstabe für Buchstabe). Inhalt nur so viel wie nötig, mehr auf Über uns.
 */
export function Founders() {
  return (
    <FoundersScene
      founders={company.founders.slice(0, 3)}
      eyebrow={home.about.eyebrow}
      after={
        <div className="mt-8 lg:mt-10">
          <Button to="/ueber-uns" variant="link">
            Die Gründer kennenlernen
          </Button>
        </div>
      }
    />
  )
}
