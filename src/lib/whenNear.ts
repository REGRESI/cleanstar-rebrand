/** Compile decorative WebGL only near its section; the image fallback is already present. */
export function whenNear(element: Element, start: () => void) {
  let cancelled = false
  const io = new IntersectionObserver(entries => {
    if (cancelled || !entries.some(e => e.isIntersecting)) return
    io.disconnect()
    start()
  }, { rootMargin: '1000px 0px' })
  io.observe(element)
  return () => { cancelled = true; io.disconnect() }
}
