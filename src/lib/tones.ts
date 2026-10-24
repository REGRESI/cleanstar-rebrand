/**
 * Übergänge zwischen Abschnitten: Hat der Abschnitt davor bzw. danach eine andere Fläche (hell, Papierfläche,
 * dunkel, randloses Bild), entfällt die Haarlinie, die genau am Anfang bzw. Ende seines Inhalts liegt, samt ihrem
 * Innenabstand. So bleibt am Übergang nur der Abschnittsabstand, oben wie unten gleich.
 * Elemente bekommen dafür data-no-top bzw. data-no-bottom (CSS in index.css).
 * Abweichende Kanten lassen sich mit data-tone-start / data-tone-end festlegen (z. B. Seitenkopf, der mit einem Bild endet).
 * Positionen werden über offsetTop bestimmt, also ohne Transformationen (Einblend-Animationen verfälschen nichts).
 */
function markTones(doc: Document) {
  const main = doc.getElementById('main')
  const wrap = main && main.firstElementChild
  if (!wrap) return
  const blocks: HTMLElement[] = []
  for (const el of Array.from(wrap.children) as HTMLElement[]) if (el.tagName !== 'SCRIPT' && el.tagName !== 'STYLE') blocks.push(el)
  const footer = doc.querySelector<HTMLElement>('body footer')
  if (footer) blocks.push(footer)
  const tone = (el: HTMLElement, edge: 'Start' | 'End') => {
    const own = el.dataset['tone' + edge] || el.dataset.tone
    if (own) return own
    if (el.tagName === 'FIGURE') return 'image'
    const c = el.classList
    if (c.contains('on-dark') || c.contains('bg-night')) return 'dark'
    if (c.contains('bg-surface')) return 'surface'
    return 'paper'
  }
  const absTop = (e: HTMLElement) => {
    let y = 0
    for (let n: HTMLElement | null = e; n; n = n.offsetParent as HTMLElement | null) y += n.offsetTop
    return y
  }
  // Nur Linien, keine Rahmen: Buttons, Felder und Kästen mit Seitenrand bleiben unangetastet
  const isLine = (e: HTMLElement, cs: CSSStyleDeclaration, side: 'Top' | 'Bottom') =>
    e.classList.contains('rule') ||
    (parseFloat(cs[('border' + side + 'Width') as 'borderTopWidth']) > 0 &&
      parseFloat(cs.borderLeftWidth) === 0 &&
      parseFloat(cs.borderRightWidth) === 0 &&
      !e.matches('.btn, .field, .choice, input, select, textarea, button'))

  doc.querySelectorAll('[data-no-top],[data-no-bottom]').forEach((e) => {
    e.removeAttribute('data-no-top')
    e.removeAttribute('data-no-bottom')
  })
  const jobs: { el: HTMLElement; top: boolean; bottom: boolean }[] = []
  blocks.forEach((el, i) => {
    const prev = blocks[i - 1]
    const next = blocks[i + 1]
    const top = !!prev && tone(prev, 'End') !== tone(el, 'Start')
    const bottom = !!next && tone(next, 'Start') !== tone(el, 'End')
    if (top || bottom) jobs.push({ el, top, bottom })
  })
  if (footer && jobs.some((j) => j.el === footer && j.top)) footer.setAttribute('data-no-top', '')

  // Innenabstand nur bei Flächen ohne eigenen Hintergrund und ohne Rahmen entfernen (keine Buttons, Felder, Karten)
  const bare = (e: HTMLElement, s: CSSStyleDeclaration) =>
    !e.matches('.btn, .field, .choice, .tlink, .ulink, input, select, textarea, button, label, summary, picture, img, svg, canvas, video') &&
    /rgba\(\d+, \d+, \d+, 0\)|transparent/.test(s.backgroundColor) &&
    parseFloat(s.borderLeftWidth) === 0 &&
    parseFloat(s.borderRightWidth) === 0

  // Mehrere Durchgänge: Fällt eine Linie oder ein Abstand weg, rückt das Nächste an den Rand
  for (let pass = 0; pass < 4; pass++) {
    let changed = false
    for (const { el, top, bottom } of jobs) {
      if (el === footer) continue
      const cs = getComputedStyle(el)
      const start = absTop(el) + parseFloat(cs.paddingTop)
      const end = absTop(el) + el.offsetHeight - parseFloat(cs.paddingBottom)
      el.querySelectorAll<HTMLElement>('*').forEach((e) => {
        if (!(e instanceof HTMLElement) || !e.offsetParent) return
        const t = absTop(e)
        const b = t + e.offsetHeight
        if (top && !e.hasAttribute('data-no-top') && Math.abs(t - start) <= 2) {
          const s = getComputedStyle(e)
          if (isLine(e, s, 'Top') || (parseFloat(s.paddingTop) > 0 && bare(e, s))) {
            e.setAttribute('data-no-top', '')
            changed = true
          }
        }
        if (bottom && !e.hasAttribute('data-no-bottom') && Math.abs(b - end) <= 2) {
          const s = getComputedStyle(e)
          if (isLine(e, s, 'Bottom') || (parseFloat(s.paddingBottom) > 0 && bare(e, s))) {
            e.setAttribute('data-no-bottom', '')
            changed = true
          }
        }
      })
    }
    if (!changed) break
  }
}

export const markSectionTones = () => markTones(document)

/** Dieselbe Funktion als Inline-Skript nach dem Footer: läuft im vorgerenderten HTML vor dem ersten Zeichnen */
export const inlineMarkTones = `(${markTones.toString()})(document)`
