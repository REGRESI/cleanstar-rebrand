/** Höhe von 100svh in Pixeln (kleinste Viewport-Höhe, unabhängig von der ein- und ausfahrenden Adressleiste) */
let ruler: HTMLDivElement | null = null
export function svh() {
  if (typeof document === 'undefined') return 800
  if (!ruler) {
    ruler = document.createElement('div')
    ruler.style.cssText = 'position:absolute;top:0;left:0;width:0;height:100svh;visibility:hidden;pointer-events:none'
    document.body.appendChild(ruler)
  }
  return ruler.offsetHeight || window.innerHeight
}
