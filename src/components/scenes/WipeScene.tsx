import { useRef, type CSSProperties } from 'react'
import { span, spanEase, useScrollScene } from '@/lib/scrollScene'

/**
 * Leistungen, Scroll-Stopper „Der Wisch“: Ein randloses Foto liegt hinter beschlagenem Glas. Beim Scrollen fährt eine
 * Abzieher-Kante von links nach rechts und legt das klare Bild frei, danach erscheint die Zeile darüber.
 * Ohne Bewegung: nur das klare Foto mit der Zeile.
 */

// Feste, leicht unregelmäßige Wischkante (Abweichung in % der Breite, von oben nach unten)
const EDGE = [0, 0.35, 0.1, 0.45, 0.2, -0.1, 0.3, 0.55, 0.25, 0.05, 0.4, 0.15, -0.05, 0.3, 0.5, 0.2, 0.0, 0.35, 0.15, 0.45, 0.6]

const src = (name: string) => [960, 1672].map((w) => `/images/scenes/${name}-${w}.webp ${w}w`).join(', ')

export function WipeScene() {
  const outer = useRef<HTMLElement>(null)

  useScrollScene(outer, (t) => {
    const root = outer.current
    if (!root) return
    const fog = root.querySelector<HTMLElement>('.wipe-fog')
    const blade = root.querySelector<HTMLElement>('.wipe-blade')
    const stage = root.querySelector<HTMLElement>('.wipe-stage')
    if (!fog || !blade || !stage) return
    // Kante wandert von knapp links außerhalb bis rechts hinaus; der Scrollweg selbst gibt das Tempo vor
    const x = -2 + span(t, 0.06, 0.74) * 106
    const pts = EDGE.map((j, i) => `${(x + j).toFixed(2)}% ${(i * 100) / (EDGE.length - 1)}%`)
    fog.style.clipPath = `polygon(${pts.join(', ')}, 110% 100%, 110% 0%)`
    blade.style.transform = `translateX(${((x / 100) * stage.clientWidth).toFixed(1)}px)`
    root.style.setProperty('--h', spanEase(t, 0.7, 0.9).toFixed(3))
  })

  return (
    <section ref={outer} data-no-curtain className="scene" style={{ '--scene-run': '170svh', '--scene-run-m': '110svh' } as CSSProperties} aria-labelledby="wipe-title">
      <div className="scene-stage">
        <div className="wipe-stage w-full">
          <img
            srcSet={src('wisch-klar')}
            sizes="100vw"
            src="/images/scenes/wisch-klar-1672.webp"
            alt="Fensterreinigung mit dem Abzieher: klarer Blick durch eine große Bürofensterfront ins Grüne"
            width={1672}
            height={941}
            loading="lazy"
            decoding="async"
          />
          <div className="wipe-fog" aria-hidden>
            <img srcSet={src('wisch-beschlagen')} sizes="100vw" src="/images/scenes/wisch-beschlagen-1672.webp" alt="" width={1672} height={941} loading="lazy" decoding="async" />
          </div>
          <span className="wipe-blade" aria-hidden />
          <div className="wipe-copy">
            <div className="container-site">
              <h2 id="wipe-title" className="t-h1 max-w-[14ch] text-paper">
                Klarer Blick. Jeden Morgen.
              </h2>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
