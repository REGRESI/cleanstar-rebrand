/** Führt eine Funktion aus, sobald der Browser Leerlauf hat (Fallback: Timeout). */
export function onIdle(cb: () => void, timeout = 1500) {
  const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void }
  if (w.requestIdleCallback) {
    const id = w.requestIdleCallback(cb, { timeout })
    return () => w.cancelIdleCallback?.(id)
  }
  const id = window.setTimeout(cb, 200)
  return () => window.clearTimeout(id)
}
