import { useEffect, useRef, useState, type ReactNode } from 'react'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { AnimatedText } from '@/components/ui/AnimatedText'
import { home } from '@/content/site'
import { ScrollTrigger } from '@/lib/gsap'
import { prefersReducedMotion } from '@/lib/env'

interface Props {
  eyebrow?: string
  headline?: string
  lead?: string
  items?: { problem: string; solution: string }[]
  id?: string
}

/**
 * Eine Zeile: Erreicht sie den Blick, wischt eine helle Lichtkante von links über den Problem-Satz. Hinter ihr wird
 * der Satz blass und löst sich auf, eine Linie streicht ihn durch; gleichzeitig färbt sich rechts die Lösung mit der
 * Farbwelle ein. Am Ende bleibt das Problem sehr blass und durchgestrichen lesbar, die Lösung kräftig.
 * An die Scrollposition gekoppelt, Zeile für Zeile. Reduzierte Bewegung: Endzustand sofort.
 */
function Row({ i, problem, solution }: { i: number; problem: string; solution: string }) {
  const ref = useRef<HTMLLIElement>(null)
  const [go, setGo] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (prefersReducedMotion() || !document.documentElement.classList.contains('js-motion')) {
      el.style.setProperty('--w', '1')
      setGo(true)
      return
    }
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top 82%',
      end: 'top 42%',
      scrub: 0.4,
      onUpdate: (s) => {
        el.style.setProperty('--w', s.progress.toFixed(3))
        // Lösung färbt sich ein und beim Zurückscrollen wieder aus
        setGo(s.progress > 0.3)
      },
    })
    el.style.setProperty('--w', st.progress.toFixed(3))
    setGo(st.progress > 0.3)
    return () => st.kill()
  }, [])
  return (
    <li ref={ref} className="ps-row grid grid-cols-[2.5rem_1fr] gap-x-4 border-t border-line-dark py-8 sm:grid-cols-[4rem_1fr] lg:grid-cols-12 lg:gap-x-8 lg:py-10">
      <span className="t-label pt-1 lg:col-span-1">{String(i + 1).padStart(2, '0')}</span>
      <p className="ps-problem lg:col-span-5">
        <span className="sr-only">Vorher: </span>
        <span className="ps-problem-text">{problem}</span>
        <span aria-hidden className="ps-edge" />
      </p>
      <div className="col-start-2 mt-3 lg:col-span-6 lg:col-start-7 lg:mt-0">
        <span className="sr-only">Bei uns: </span>
        <AnimatedText as="p" text={solution} trigger={go} orphans={false} className="text-[1.25rem] leading-[1.35] font-medium tracking-[-0.015em] text-paper" />
      </div>
    </li>
  )
}

/**
 * „Das kennen Sie vielleicht“: Probleme und Lösungen als nummerierte Zeilen auf Navy, mit Wisch-Animation je Zeile.
 */
export function ProblemSolution({
  eyebrow = home.problems.eyebrow,
  headline = home.problems.headline,
  lead = home.problems.lead,
  items = home.problems.items,
  id = 'problems-title',
  squeegee,
}: Props & { /** Ende wie mit einem Fensterabzieher weggezogen (Startseite; der nächste Abschnitt braucht .squeegee-under) */ squeegee?: boolean }) {
  const section = (
    <section className="on-dark section bg-night text-paper" aria-labelledby={id} data-squeegee={squeegee || undefined}>
      <div className="container-site">
        <SectionHeading layout="split" eyebrow={eyebrow} title={headline} text={lead} id={id} />
        <ol className="mt-16 lg:mt-24">
          {items.map((it, i) => (
            <Row key={i} i={i} problem={it.problem} solution={it.solution} />
          ))}
        </ol>
      </div>
      {squeegee && <div aria-hidden className="squeegee-tail" />}
    </section>
  )
  return squeegee ? <Squeegee>{section}</Squeegee> : section
}

/**
 * Abzieher-Kante (Prinzip aus Shopify Editions „Papierkante“, bei uns ein Fensterabzieher): Am Ende der Ärgernisse
 * zieht eine leicht schräge, absolut gerade Kante den Navy-Abschnitt nach oben weg. An der Kante ein schmaler,
 * glänzender Wasserfilm mit feinen Lichtreflexen, ein paar Tropfen laufen an ihr entlang nach unten. Darunter liegt
 * schon der nächste helle Abschnitt mit Inhalt. Die Kante bewegt sich nur durch den leeren Navy-Auslauf (80 % der
 * Bildschirmhöhe) unter den Zeilen, nie über Text. Scroll-gesteuert, auch rückwärts.
 * Technik: clip-path polygon() auf dem Navy-Abschnitt, Wasserfilm und Tropfen als SVG über der Kante.
 * Reduzierte Bewegung oder ohne JavaScript: kein Auslauf, normale Kante.
 */
function Squeegee({ children }: { children: ReactNode }) {
  const wrap = useRef<HTMLDivElement>(null)
  const film = useRef<SVGSVGElement>(null)
  const line = useRef<SVGGElement>(null)
  useEffect(() => {
    const el = wrap.current
    const sec = el?.querySelector<HTMLElement>('section')
    const tail = el?.querySelector<HTMLElement>('.squeegee-tail')
    if (!el || !sec || !tail || prefersReducedMotion() || !document.documentElement.classList.contains('js-motion')) return
    const apply = (p: number) => {
      const W = sec.offsetWidth
      const H = sec.offsetHeight
      const T = tail.offsetHeight
      // Neigung: rechts etwa 6 % der Breite tiefer als links (höchstens 90 px)
      const s = Math.min(90, W * 0.06)
      // Schnitt: von unterhalb des Auslaufs bis über seinen oberen Rand (Kante samt Neigung ganz durch)
      const cut = -s + (T + 2 * s) * p
      const yl = H - cut - s
      const yr = H - cut + s
      sec.style.clipPath = p <= 0 ? '' : `polygon(0 0, 100% 0, 100% ${Math.min(H, yr).toFixed(1)}px, 0 ${Math.min(H, yl).toFixed(1)}px)`
      if (film.current && line.current) {
        const on = p > 0 && p < 1
        film.current.style.opacity = on ? '1' : '0'
        film.current.setAttribute('viewBox', `0 0 ${W} 120`)
        film.current.style.top = `${(yl - 40).toFixed(1)}px`
        // Linie in Film-Koordinaten von (0, 40) bis (W, 40 + 2s)
        line.current.setAttribute('transform', `rotate(${((Math.atan2(2 * s, W) * 180) / Math.PI).toFixed(3)} 0 40)`)
        film.current.style.setProperty('--len', `${Math.hypot(W, 2 * s).toFixed(0)}px`)
      }
    }
    const st = ScrollTrigger.create({ trigger: tail, start: 'top bottom', end: 'bottom top', scrub: 0.3, onUpdate: (x) => apply(x.progress), onRefresh: (x) => apply(x.progress) })
    apply(st.progress)
    return () => {
      st.kill()
      sec.style.clipPath = ''
    }
  }, [])
  return (
    <div ref={wrap} className="squeegee relative z-[2]" data-tone-start="dark" data-tone-end="paper">
      {children}
      <svg ref={film} aria-hidden className="squeegee-film" preserveAspectRatio="none">
        <defs>
          <linearGradient id="sq-sheen" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="0.18" stopColor="#cfe6ff" stopOpacity="0.75" />
            <stop offset="0.55" stopColor="#9cc6ef" stopOpacity="0.28" />
            <stop offset="1" stopColor="#9cc6ef" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="sq-trail" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#9cc6ef" stopOpacity="0" />
            <stop offset="1" stopColor="#9cc6ef" stopOpacity="0.6" />
          </linearGradient>
        </defs>
        <g ref={line}>
          {/* Wasserfilm unter der Kante, darauf feine Lichtreflexe */}
          <rect x="0" y="40" width="200%" height="16" fill="url(#sq-sheen)" />
          <rect x="0" y="39" width="200%" height="1.6" fill="#ffffff" opacity="0.9" />
          {[0.08, 0.21, 0.37, 0.52, 0.66, 0.83].map((x, i) => (
            <rect key={i} className="squeegee-glint" x={`${x * 100}%`} y="41.5" width={28 + (i % 3) * 18} height="1.4" rx="0.7" fill="#ffffff" style={{ animationDelay: `${i * 0.37}s` }} />
          ))}
          {/* Tropfen laufen an der Kante entlang nach unten (zur tieferen Seite) */}
          {[0, 1, 2, 3].map((i) => (
            <g key={i} className="squeegee-drop" style={{ animationDelay: `${i * 1.15}s`, animationDuration: `${4.2 + i * 0.6}s` }}>
              {/* kurze nasse Spur hinter dem Tropfen */}
              <rect x={-46} y={49.2} width="44" height="2.4" rx="1.2" fill="url(#sq-trail)" />
              <ellipse cx="0" cy="51" rx={5.2 + (i % 2) * 1.4} ry={6.4 + (i % 2) * 1.6} fill="#b9d8f6" fillOpacity="0.8" stroke="#3f74b3" strokeOpacity="0.45" strokeWidth="1" />
              <ellipse cx="-1.6" cy="48.6" rx="1.6" ry="2" fill="#ffffff" />
            </g>
          ))}
        </g>
      </svg>
    </div>
  )
}
