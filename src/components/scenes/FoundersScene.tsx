import { useRef, type CSSProperties, type ReactNode } from 'react'
import { Picture } from '@/components/ui/Picture'
import type { ImageId } from '@/content/images'
import { paintLetters, span, spanEase, useScrollScene } from '@/lib/scrollScene'
import { Letters } from '@/components/ui/ScrubText'

/**
 * Über uns, Scroll-Stopper: Die drei Gründerporträts liegen zunächst auseinander und leicht versetzt und rücken beim
 * Scrollen zu einer ruhigen Dreierreihe zusammen und färben sich dabei nacheinander von Schwarzweiß zu Farbe. Darunter färbt sich die Aussage Buchstabe für Buchstabe (wie auf der Startseite).
 * Ohne Bewegung: Reihe steht, Text in voller Farbe.
 */

const STATEMENT = 'Bei CleanStar sprechen Sie mit den Menschen, die entscheiden.'
// Startlage je Porträt: Versatz in % der eigenen Größe, Drehung in Grad
const START = [
  { dx: '-58%', dy: '14%', rot: '-4deg' },
  { dx: '0%', dy: '-9%', rot: '2.5deg' },
  { dx: '58%', dy: '20%', rot: '3.5deg' },
]

/**
 * Wird auf Über uns und auf der Startseite verwendet (gleiche Gestaltung und Animation).
 * eyebrow: kleine Zeile über „Drei Gründer.“; after: Inhalt unter der Aussage (Startseite: Link zu Über uns)
 */
export function FoundersScene({
  founders,
  eyebrow = 'Über uns',
  after,
  className,
}: {
  founders: { name?: string | null; image: string }[]
  eyebrow?: string
  after?: ReactNode
  className?: string
}) {
  const outer = useRef<HTMLElement>(null)
  const last = useRef<Float32Array | null>(null)

  useScrollScene(outer, (t) => {
    const root = outer.current
    if (!root) return
    root.style.setProperty('--k', spanEase(t, 0.02, 0.48).toFixed(4))
    // Porträts färben sich nacheinander ein (Schwarzweiß-Kopie blendet aus)
    root.querySelectorAll<HTMLElement>('[data-gray]').forEach((g, i) => g.style.setProperty('opacity', (1 - spanEase(t, 0.06 + i * 0.1, 0.36 + i * 0.1)).toFixed(3)))
    const letters = Array.from(root.querySelectorAll<HTMLElement>('[data-l]'))
    last.current ??= new Float32Array(letters.length).fill(-1)
    paintLetters(letters, span(t, 0.36, 0.9), last.current)
  })

  return (
    <section ref={outer} className={className ? `scene ${className}` : 'scene'} style={{ '--scene-run': '170svh', '--scene-run-m': '120svh' } as CSSProperties} aria-labelledby="founders-intro">
      <div className="scene-stage">
        <div className="founders-stage container-site flex w-full flex-col items-center text-center">
          <p className="t-label">{eyebrow}</p>
          <p className="t-h1 mt-3">Drei Gründer.</p>
          <ul className="founders-row mx-auto mt-6 lg:mt-10">
            {founders.map((f, i) => (
              <li key={i} style={{ '--dx': START[i].dx, '--dy': START[i].dy, '--rot': START[i].rot } as CSSProperties}>
                <div className="relative">
                  <Picture id={f.image as ImageId} ratio="4:5" sizes="(min-width:1024px) 15rem, 30vw" />
                  <div data-gray aria-hidden className="founder-gray pointer-events-none absolute inset-0">
                    <Picture id={f.image as ImageId} ratio="4:5" sizes="(min-width:1024px) 15rem, 30vw" className="grayscale" />
                  </div>
                </div>
                <p className="t-meta mt-3 text-ink">{f.name}</p>
              </li>
            ))}
          </ul>
          <h2 id="founders-intro" className="founders-statement mx-auto mt-8 max-w-[22ch] lg:mt-14">
            {STATEMENT.split(' ').map((w, i) => (
              <span key={i}>
                {i > 0 && ' '}
                <span className="whitespace-nowrap text-ink">
                  <Letters text={w} />
                </span>
              </span>
            ))}
          </h2>
          {after}
        </div>
      </div>
    </section>
  )
}
