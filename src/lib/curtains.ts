import { gsap } from './gsap'
import { EASE_CS } from './ease'
import { motionAllowed, isSmallScreen } from './motionBudget'

/**
 * Vorhang-Übergänge: Wechselt die Fläche von hell zu dunkel oder von dunkel zu hell, fährt der neue Abschnitt über den
 * vorherigen. Der vorherige bleibt dabei stehen (Verschiebung gleicht den Scrollweg aus), tritt leicht zurück
 * (Skalierung auf 0,96) und wird abgedunkelt. Die Oberkante des neuen Abschnitts ist leicht gerundet und wirft einen
 * weichen Schatten nach oben; beides verschwindet, sobald er den vorherigen ganz überdeckt.
 *
 * Animiert werden nur transform und opacity: Rundung und Schatten sind eigene Elemente, die überblendet werden.
 * Keine Layoutänderung (keine Verschiebung anderer Inhalte). Bei reduzierter Bewegung: nichts davon.
 */

const SKIP =
  /^\/(kontakt|angebot|angebote-vergleichen|wechsel-rechner|reinigungsfirma-kalkulieren|reinigungs-check|impressum|datenschutz|leistungsmappe|mappe-link|styleguide)(\/|$)/

type Tone = 'light' | 'dark' | 'other'

function toneOf(el: HTMLElement, edge: 'Start' | 'End'): Tone {
  const own = el.dataset['tone' + edge] || el.dataset.tone
  const t = own ?? (el.tagName === 'FIGURE' ? 'image' : el.classList.contains('on-dark') || el.classList.contains('bg-night') ? 'dark' : 'paper')
  return t === 'dark' ? 'dark' : t === 'paper' || t === 'surface' ? 'light' : 'other'
}

/** Sichtbare Hintergrundfarbe eines Abschnitts (transparente Abschnitte liegen auf Papier) */
function bgOf(el: HTMLElement) {
  const c = getComputedStyle(el).backgroundColor
  return /rgba\(\d+, \d+, \d+, 0\)|transparent/.test(c) ? 'var(--color-paper)' : c
}

export function setupCurtains(pathname: string): () => void {
  if (!motionAllowed() || SKIP.test(pathname) || (window as unknown as { __nc?: number }).__nc) return () => {}
  const wrap = document.getElementById('main')?.firstElementChild
  if (!wrap) return () => {}
  const blocks = (Array.from(wrap.children) as HTMLElement[]).filter((e) => !['SCRIPT', 'STYLE'].includes(e.tagName) && !e.hasAttribute('data-bridge'))

  const added: Element[] = []
  const touched: HTMLElement[] = []
  const tls: gsap.core.Timeline[] = []

  blocks.forEach((next, i) => {
    const prev = blocks[i - 1]
    if (!prev) return
    const a = toneOf(prev, 'End')
    const b = toneOf(next, 'Start')
    if (a === 'other' || b === 'other' || a === b) return
    // Abschnitte mit Formular (z. B. Bewerbung) bleiben ruhig, ebenso ausdrücklich ausgenommene
    if ([prev, next].some((e) => e.hasAttribute('data-no-curtain') || e.querySelector('form'))) return

    const small = isSmallScreen()
    // Handy: kürzerer Vorhang (der vorherige Abschnitt steht ab 65 % der Bildschirmhöhe)
    const f = small ? 0.65 : 1
    const vh = () => window.innerHeight
    // Haltestrecke: nie länger als der neue Abschnitt hoch ist, sonst schaute der alte darunter hervor
    const hold = () => Math.max(1, Math.min(f * vh(), next.offsetHeight))

    // Farbe vor dem Setzen der Klasse lesen (die Klasse ersetzt den Hintergrund)
    if (!next.style.getPropertyValue('--curtain-bg')) next.style.setProperty('--curtain-bg', bgOf(next))
    prev.classList.add('curtain-prev')
    next.classList.add('curtain-next')
    prev.style.zIndex = String(2 * i - 1)
    next.style.zIndex = String(2 * i)
    touched.push(prev, next)

    const dim = document.createElement('div')
    dim.className = 'curtain-dim'
    dim.setAttribute('aria-hidden', 'true')
    prev.appendChild(dim)
    const cap = document.createElement('div')
    cap.className = 'curtain-cap'
    cap.setAttribute('aria-hidden', 'true')
    cap.innerHTML = '<span class="curtain-shadow"></span><span class="curtain-round"></span><span class="curtain-square"></span>'
    next.prepend(cap)
    added.push(dim, cap)

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: next,
        start: () => `top ${f * 100}%`,
        end: () => `+=${hold()}`,
        scrub: true,
        invalidateOnRefresh: true,
      },
    })
    tl.fromTo(prev, { y: 0 }, { y: () => hold(), ease: 'none', duration: 1 }, 0)
      .fromTo(
        prev,
        { scale: 1 },
        {
          scale: small ? 0.975 : 0.96,
          // Mitte des noch sichtbaren Teils bleibt stehen
          transformOrigin: () => `50% ${prev.offsetHeight - (f * vh()) / 2}px`,
          ease: EASE_CS,
          duration: 1,
        },
        0,
      )
      .fromTo(dim, { opacity: 0 }, { opacity: a === 'dark' ? 0.45 : 0.28, ease: EASE_CS, duration: 1 }, 0)
      .fromTo(cap.querySelector('.curtain-shadow'), { opacity: 1 }, { opacity: 0, ease: EASE_CS, duration: 1 }, 0)
      .fromTo(cap.querySelector('.curtain-square'), { opacity: 0 }, { opacity: 1, ease: EASE_CS, duration: 1 }, 0)
    tls.push(tl)
  })

  return () => {
    tls.forEach((t) => {
      t.scrollTrigger?.kill()
      t.kill()
    })
    added.forEach((e) => e.remove())
    touched.forEach((e) => {
      e.classList.remove('curtain-prev', 'curtain-next')
      e.style.removeProperty('--curtain-bg')
      e.style.zIndex = ''
      gsap.set(e, { clearProps: 'transform,transformOrigin' })
    })
  }
}
