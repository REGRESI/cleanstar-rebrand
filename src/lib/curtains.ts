import { gsap } from './gsap'
import { EASE_CS } from './ease'
import { motionAllowed, isSmallScreen } from './motionBudget'

/**
 * Vorhang-Übergänge (nur Desktop): Wechselt die Fläche von hell zu dunkel oder von dunkel zu hell, fährt der neue
 * Abschnitt über den vorherigen, aber erst, wenn dessen Inhalt vollständig gelesen werden konnte. Der Vorhang läuft
 * nur über den Abstand unter dem letzten Inhalt: Der vorherige bleibt dort kurz stehen, tritt leicht zurück
 * (Skalierung auf 0,96) und wird abgedunkelt. Die Oberkante des neuen Abschnitts ist leicht gerundet und wird beim
 * Ankommen gerade. Abschnitte unter 1,2 Bildschirmhöhen scrollen normal.
 *
 * Animiert werden nur transform und opacity: Die Rundung ist eine eigene, flache Fläche (kein Verlauf, kein Schatten).
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
  // Handy: keine Vorhänge, sondern eine ruhige, normale Abschnittsfolge
  if (!motionAllowed() || SKIP.test(pathname) || isSmallScreen()) return () => {}
  const wrap = document.getElementById('main')?.firstElementChild
  if (!wrap) return () => {}
  const blocks = (Array.from(wrap.children) as HTMLElement[]).filter((e) => !['SCRIPT', 'STYLE'].includes(e.tagName))

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

    // Kurze Abschnitte scrollen normal: Ein Vorhang über weniger als 1,2 Bildschirmhöhen wirkt hektisch
    const vh = window.innerHeight
    if (prev.offsetHeight < 1.2 * vh || next.offsetHeight < 1.2 * vh) return
    // Überdeckt wird erst, wenn der Inhalt des vorherigen Abschnitts ganz gelesen werden konnte:
    // Der Vorhang läuft nur über den Abstand unter dem letzten Inhalt (Unterkante Inhalt am oberen Bildschirmrand).
    const gap = () => {
      const box = prev.getBoundingClientRect()
      let bottom = box.top
      for (const c of Array.from(prev.children)) if (!c.classList.contains('curtain-dim')) bottom = Math.max(bottom, c.getBoundingClientRect().bottom)
      return Math.max(0, Math.min(box.bottom - bottom, next.offsetHeight))
    }
    if (gap() < 48) return

    // Farbe vor dem Setzen der Klasse lesen
    next.style.setProperty('--curtain-bg', bgOf(next))
    prev.classList.add('curtain-prev')
    next.classList.add('curtain-next')
    prev.style.zIndex = String(2 * i - 1)
    next.style.zIndex = String(2 * i)
    touched.push(prev, next)

    const dim = document.createElement('div')
    dim.className = 'curtain-dim'
    dim.setAttribute('aria-hidden', 'true')
    prev.appendChild(dim)
    // Gerundete Oberkante: flache Fläche in der Farbe des neuen Abschnitts, die beim Ankommen gerade wird
    const cap = document.createElement('div')
    cap.className = 'curtain-cap'
    cap.setAttribute('aria-hidden', 'true')
    cap.innerHTML = '<span class="curtain-round"></span><span class="curtain-square"></span>'
    next.prepend(cap)
    added.push(dim, cap)

    let g = gap()
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: next,
        start: () => `top ${(g = gap())}px`,
        end: () => `+=${g}`,
        scrub: true,
        invalidateOnRefresh: true,
      },
    })
    tl.fromTo(prev, { y: 0 }, { y: () => g, ease: 'none', duration: 1 }, 0)
      .fromTo(
        prev,
        { scale: 1 },
        {
          scale: 0.96,
          // Mitte des noch sichtbaren Streifens bleibt stehen
          transformOrigin: () => `50% ${prev.offsetHeight - g / 2}px`,
          ease: EASE_CS,
          duration: 1,
        },
        0,
      )
      .fromTo(dim, { opacity: 0 }, { opacity: a === 'dark' ? 0.45 : 0.28, ease: EASE_CS, duration: 1 }, 0)
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
