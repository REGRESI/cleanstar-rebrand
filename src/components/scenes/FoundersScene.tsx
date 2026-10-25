import { useRef, type CSSProperties } from 'react'
import { Picture } from '@/components/ui/Picture'
import type { ImageId } from '@/content/images'
import { paintWords, span, spanEase, useScrollScene } from '@/lib/scrollScene'

/**
 * Über uns, Scroll-Stopper: Die drei Gründerporträts liegen zunächst auseinander und leicht versetzt und rücken beim
 * Scrollen zu einer ruhigen Dreierreihe zusammen. Darunter färbt sich die Aussage Wort für Wort (wie auf der Startseite).
 * Ohne Bewegung: Reihe steht, Text in voller Farbe.
 */

const STATEMENT = 'Bei CleanStar sprechen Sie mit den Menschen, die entscheiden.'
// Startlage je Porträt: Versatz in % der eigenen Größe, Drehung in Grad
const START = [
  { dx: '-58%', dy: '14%', rot: '-4deg' },
  { dx: '0%', dy: '-9%', rot: '2.5deg' },
  { dx: '58%', dy: '20%', rot: '3.5deg' },
]

export function FoundersScene({ founders }: { founders: { name?: string | null; image: string }[] }) {
  const outer = useRef<HTMLElement>(null)
  const last = useRef<Float32Array | null>(null)

  useScrollScene(outer, (t) => {
    const root = outer.current
    if (!root) return
    root.style.setProperty('--k', spanEase(t, 0.02, 0.48).toFixed(4))
    const words = Array.from(root.querySelectorAll<HTMLElement>('[data-w]'))
    last.current ??= new Float32Array(words.length).fill(-1)
    paintWords(words, span(t, 0.36, 0.9), last.current)
  })

  return (
    <section ref={outer} className="scene" style={{ '--scene-run': '170svh', '--scene-run-m': '120svh' } as CSSProperties} aria-labelledby="founders-intro">
      <div className="scene-stage">
        <div className="founders-stage container-site flex w-full flex-col items-center text-center">
          <p className="t-label">Die Gründer</p>
          <ul className="founders-row mx-auto mt-8 lg:mt-12">
            {founders.map((f, i) => (
              <li key={i} style={{ '--dx': START[i].dx, '--dy': START[i].dy, '--rot': START[i].rot } as CSSProperties}>
                <Picture id={f.image as ImageId} ratio="4:5" sizes="(min-width:1024px) 15rem, 30vw" />
                <p className="t-meta mt-3 text-ink">{f.name}</p>
              </li>
            ))}
          </ul>
          <h2 id="founders-intro" className="founders-statement mx-auto mt-8 max-w-[22ch] lg:mt-14">
            {STATEMENT.split(' ').map((w, i) => (
              <span key={i}>
                {i > 0 && ' '}
                <span data-w className="scrub-w text-ink">
                  {w}
                </span>
              </span>
            ))}
          </h2>
        </div>
      </div>
    </section>
  )
}
