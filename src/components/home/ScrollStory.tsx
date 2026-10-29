import { Fragment, useEffect, useRef, useState, type CSSProperties } from 'react'
import { QuoteButton } from '@/features/configurator/QuoteLink'
import { Sparkle } from '@/components/ui/Sparkle'
import { Letters } from '@/components/ui/ScrubText'
import { RiskFreeSeal } from '@/components/ui/RiskFreeSeal'
import { paintLetters } from '@/lib/scrollScene'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { prefersReducedMotion } from '@/lib/env'
import { cn } from '@/lib/cn'

/**
 * Abschnitt 2 der Startseite: Der Text „wird sauber“. Beim Scrollen färbt er sich Wort für Wort vom hellen Grau
 * zum vollen Textton, der letzte Satz ins Markenblau. Kleine Bildkacheln tauchen auf, sobald die Färbung sie erreicht.
 *
 * Im HTML steht der Text vollständig in voller Farbe (Suchmaschinen, Screenreader, ohne JavaScript, reduzierte Bewegung).
 * Die Aufhellung ist rein optisch: CSS-Variable --p je Wort, nur mit .js-motion. Der Abschnitt ist sticky statt
 * gepinnt (kein eingefügter Abstand, keine Layoutverschiebung); der Platz für die Bilder ist von Anfang an reserviert.
 */

type Img = { kind: 'img'; img: 'feierabend' | 'schluessel' | 'team' | 'kaffee'; after: string }
type Token = { kind: 'word'; text: string; blue?: boolean } | Img

const TEXT =
  'Wenn Ihr Team Feierabend macht [feierabend], kommen wir. Mit Ihrem Schlüssel [schluessel], nach festem Plan und mit einem Team, das Ihr Büro kennt [team]. Fällt jemand aus, ist trotzdem jemand da. Und am Morgen wartet ein sauberes Büro [kaffee].'
// Pointe in Blau. Die Leitidee selbst steht nur im Hero und im Footer, hier dieselbe Aussage mit anderen Worten.
const FINAL = 'Jeden Morgen. Ohne Erinnerung, ohne Nachfrage.'

const ALT: Record<Img['img'], string> = {
  feierabend: 'Großraumbüro am Abend nach Feierabend',
  schluessel: 'Büroschlüssel am Lederanhänger',
  team: 'Die drei Gründer: Nico, Lino und Eknoor',
  kaffee: 'Kaffee am Morgen',
}

/** Text in Wörter und Bildmarken zerlegen; Satzzeichen hinter einer Bildmarke hängen am Bild */
function tokenize(text: string, blue = false): Token[] {
  return text.split(' ').map((t) => {
    const m = t.match(/^\[(\w+)\](.*)$/)
    return m ? { kind: 'img', img: m[1] as Img['img'], after: m[2] } : { kind: 'word', text: t, blue }
  })
}
const tokens: Token[] = [...tokenize(TEXT), ...tokenize(FINAL, true)]

const founders = [1, 2, 3].map((i) => `/images/scrub/gruender-${i}.webp`)

/** Kachel im Fließtext (Größe in em, damit sie mit der Schrift wächst) */
function Tile({ img, rot }: { img: Img['img']; rot: number }) {
  if (img === 'team')
    return (
      <span className="story-tile story-team" style={{ '--r': `${rot}deg` } as CSSProperties} aria-label={ALT.team} role="img">
        <span>
          {founders.map((src, k) => (
            <img key={src} src={src} alt="" width={96} height={96} loading="lazy" decoding="async" style={{ zIndex: 3 - k }} />
          ))}
        </span>
      </span>
    )
  return (
    <span className="story-tile" style={{ '--r': `${rot}deg` } as CSSProperties}>
      <span>
        <img src={`/images/scrub/${img}.webp`} alt={ALT[img]} width={96} height={96} loading="lazy" decoding="async" />
      </span>
    </span>
  )
}

export function ScrollStory() {
  const outer = useRef<HTMLElement>(null)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const root = outer.current
    if (!root || prefersReducedMotion() || !document.documentElement.classList.contains('js-motion')) return
    const words = Array.from(root.querySelectorAll<HTMLElement>('[data-w]'))
    const letters = Array.from(root.querySelectorAll<HTMLElement>('[data-l]'))
    // letzter Buchstabe je Wort: Kacheln erscheinen, wenn die Färbung das Wort davor erreicht hat
    const lastOf = words.map((w) => letters.indexOf(w.lastElementChild as HTMLElement))
    const tiles = Array.from(root.querySelectorAll<HTMLElement>('[data-tile]'))
    const cta = root.querySelector<HTMLElement>('[data-story-cta]')
    const n = letters.length
    const last = new Float32Array(n).fill(-1)
    let finished = false
    const apply = (t: number) => {
      // Färbung zwischen 4 % und 86 % des Scrollwegs, Buchstabe für Buchstabe mit weicher Überlappung, danach Abschluss
      paintLetters(letters, Math.max(0, Math.min(1, (t - 0.04) / 0.82)), last)
      for (const el of tiles) el.toggleAttribute('data-on', last[lastOf[Number(el.dataset.tile)]] > 0.55)
      const complete = last[n - 1] >= 1
      cta?.toggleAttribute('data-on', t > 0.9)
      if (complete && !finished) {
        finished = true
        setDone(true)
      }
    }
    apply(0)
    // Niedrige Bildschirme: Abschnitt steht nicht, gefärbt wird beim Durchscrollen
    const flow = window.matchMedia('(max-height: 620px)').matches
    const st = ScrollTrigger.create({
      trigger: root,
      start: flow ? 'top 70%' : 'top top',
      end: flow ? 'bottom 85%' : 'bottom bottom',
      scrub: 0.6,
      animation: gsap.to({}, { duration: 1 }),
      onUpdate: (self) => apply(self.progress),
    })
    // sofort den richtigen Stand zeigen (z. B. nach einem Neuladen mitten im Abschnitt)
    apply(st.progress)
    return () => st.kill()
  }, [])

  // Wort vor dem Bild, Bild und folgendes Satzzeichen bilden eine untrennbare Einheit (kein Komma allein am Zeilenanfang)
  let w = -1
  const nodes = []
  for (let k = 0; k < tokens.length; k++) {
    const t = tokens[k]
    if (t.kind === 'img') continue
    w++
    const word = (
      <span data-w className={cn('story-w', t.blue ? 'is-blue text-blue' : 'text-ink')}>
        <Letters text={t.text} />
      </span>
    )
    const next = tokens[k + 1]
    if (next?.kind === 'img') {
      // Bild erscheint, wenn die Färbung das Wort davor erreicht
      const rot = [-7, 6, -5, 7][['feierabend', 'schluessel', 'team', 'kaffee'].indexOf(next.img)]
      const tileAt = w
      if (next.after) w++
      nodes.push(
        <Fragment key={k}>
          {k > 0 ? ' ' : ''}
          <span className="whitespace-nowrap">
            {word}{' '}
            <span data-tile={tileAt} className={cn('story-tile-wrap', next.img === 'team' && 'is-team')}>
              <Tile img={next.img} rot={rot} />
            </span>
            {next.after && (
              <span data-w className="story-w text-ink">
                <Letters text={next.after} />
              </span>
            )}
          </span>
        </Fragment>,
      )
      continue
    }
    nodes.push(
      <Fragment key={k}>
        {k > 0 ? ' ' : ''}
        {word}
        {k === tokens.length - 1 && (
          <span className="relative inline-block w-0">
            <Sparkle play={done} className="absolute bottom-[0.55em] left-[0.1em] size-[0.55em]" />
          </span>
        )}
      </Fragment>,
    )
  }

  return (
    <section ref={outer} className="story" aria-labelledby="story-title">
      <div className="story-stage">
        <div className="container-site w-full">
          <h2 id="story-title" className="sr-only">
            Unser Versprechen
          </h2>
          <p className="story-text max-w-[22ch] sm:max-w-[24ch] lg:max-w-[30ch]">{nodes}</p>
          <div data-story-cta className="story-cta mt-6 flex flex-wrap items-center gap-x-8 gap-y-3 sm:mt-10 lg:mt-14">
            <QuoteButton size="lg" arrow>
              Kostenlose Besichtigung
            </QuoteButton>
            <RiskFreeSeal className="text-[0.9375rem]" label="Im ersten Monat ohne Frist kündbar" />
          </div>
        </div>
      </div>
    </section>
  )
}
