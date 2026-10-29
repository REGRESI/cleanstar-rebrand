import { Fragment, useEffect, useRef, type CSSProperties } from 'react'
import { Letters } from '@/components/ui/ScrubText'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { paintLetters } from '@/lib/scrollScene'
import { prefersReducedMotion } from '@/lib/env'
import { cn } from '@/lib/cn'
import { TILES, type TileId } from '@/content/statements'

/**
 * Kernsatz einer Seite im Färbe-Effekt der Startseite: Der Satz färbt sich beim Durchscrollen Buchstabe für Buchstabe
 * vom hellen Grau zum vollen Textton, der Schlusssatz ins Markenblau. Kleine Bildkacheln im Text tauchen auf, sobald
 * die Färbung sie erreicht. Nicht gepinnt, gekoppelt an die Lage im Bildschirm.
 *
 * Text mit Bildmarken in eckigen Klammern, z. B. „Von Offenburg aus [region] sind wir …“ (siehe content/statements.ts).
 * Im HTML steht der Text vollständig in voller Farbe; ohne Bewegung bleibt er so, die Bilder sind sichtbar.
 */

type Token = { kind: 'word'; text: string; blue: boolean } | { kind: 'img'; img: TileId; after: string }

function tokenize(text: string, blue: boolean): Token[] {
  return text
    .split(' ')
    .filter(Boolean)
    .map((t) => {
      const m = t.match(/^\[(\w+)\](.*)$/)
      return m ? { kind: 'img', img: m[1] as TileId, after: m[2] } : { kind: 'word', text: t, blue }
    })
}

function Tile({ img, rot }: { img: TileId; rot: number }) {
  const t = TILES[img]
  return (
    <span className="story-tile" style={{ '--r': `${rot}deg` } as CSSProperties}>
      <span>
        <img src={`/images/scrub/${img}.webp`} alt={t.alt} width={96} height={96} loading="lazy" decoding="async" />
      </span>
    </span>
  )
}

const ROT = [-6, 5, -4, 7]

export function ScrubStatement({
  text,
  final,
  label,
  id,
  dark,
  className,
}: {
  text: string
  /** Schlusssatz in Markenblau */
  final?: string
  /** Unsichtbare Überschrift des Abschnitts (für die Gliederung) */
  label: string
  id: string
  dark?: boolean
  className?: string
}) {
  const ref = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion() || !document.documentElement.classList.contains('js-motion')) return
    const words = Array.from(el.querySelectorAll<HTMLElement>('[data-w]'))
    const letters = Array.from(el.querySelectorAll<HTMLElement>('[data-l]'))
    const lastOf = words.map((w) => letters.indexOf(w.lastElementChild as HTMLElement))
    const tiles = Array.from(el.querySelectorAll<HTMLElement>('[data-tile]'))
    const last = new Float32Array(letters.length).fill(-1)
    const apply = (t: number) => {
      paintLetters(letters, t, last)
      for (const tile of tiles) tile.toggleAttribute('data-on', last[lastOf[Number(tile.dataset.tile)]] > 0.55)
    }
    apply(0)
    const st = ScrollTrigger.create({ trigger: el, start: 'top 82%', end: 'bottom 48%', scrub: 0.6, animation: gsap.to({}, { duration: 1 }), onUpdate: (s) => apply(s.progress) })
    apply(st.progress)
    return () => st.kill()
  }, [])

  const tokens = [...tokenize(text, false), ...(final ? tokenize(final, true) : [])]
  // Wort vor dem Bild, Bild und folgendes Satzzeichen bilden eine untrennbare Einheit
  let w = -1
  let n = 0
  const nodes = []
  for (let k = 0; k < tokens.length; k++) {
    const t = tokens[k]
    if (t.kind === 'img') continue
    w++
    const word = (
      <span data-w className={cn('story-w', t.blue ? (dark ? 'is-blue text-logo-sky' : 'is-blue text-blue') : dark ? 'text-paper' : 'text-ink')}>
        <Letters text={t.text} />
      </span>
    )
    const next = tokens[k + 1]
    if (next?.kind === 'img') {
      const tileAt = w
      if (next.after) w++
      nodes.push(
        <Fragment key={k}>
          {k > 0 ? ' ' : ''}
          <span className="whitespace-nowrap">
            {word}{' '}
            <span data-tile={tileAt} className="story-tile-wrap">
              <Tile img={next.img} rot={ROT[n++ % ROT.length]} />
            </span>
            {next.after && (
              <span data-w className={cn('story-w', dark ? 'text-paper' : 'text-ink')}>
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
      </Fragment>,
    )
  }

  return (
    <section className={cn('section', dark && 'on-dark bg-night text-paper', className)} aria-labelledby={id}>
      <div className="container-site">
        <h2 id={id} className="sr-only">
          {label}
        </h2>
        <p ref={ref} className="statement-text max-w-[22ch] sm:max-w-[26ch] lg:max-w-[30ch]">
          {nodes}
        </p>
      </div>
    </section>
  )
}
