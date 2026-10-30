import { ViteReactSSG } from 'vite-react-ssg'
import { createBrowserRouter, matchRoutes } from 'react-router-dom'
import { routes } from './routes'
import './styles/index.css'

// Skript läuft: Sicherheitsnetz aus index.html nicht mehr nötig (sonst würden Animationen bei langsamem Laden abgeschaltet)
if (typeof window !== 'undefined') (window as Window & { __csReady?: boolean }).__csReady = true

/**
 * Seitenwechsel wie in einer App: Jeder interne Wechsel läuft über die View Transitions API (Kopfzeile bleibt stehen,
 * der alte Inhalt gleitet nach oben weg, der neue öffnet sich von unten). Zurück/Vor im Browser bleibt ohne Übergang.
 * Ohne View Transitions übernimmt Framer Motion im Layout. Bei reduzierter Bewegung kein Übergang.
 */
// vite-react-ssg hängt an jede Route einen Loader, der beim internen Wechsel JSON-Dateien mit dem Build-Hash im Namen
// lädt (ohne Prüfung der Antwort). Wir nutzen keine Loader: Nach einem neuen Deploy fehlten diese Dateien in einer noch
// offenen alten Seite, GitHub Pages lieferte die 404-Seite und .json() scheiterte („The string did not match the
// expected pattern“). Deshalb werden die Loader hier entfernt.
type AnyRoute = { loader?: unknown; children?: AnyRoute[] }
const withoutLoaders = <T extends AnyRoute>(rs: T[]): T[] => rs.map((x) => ({ ...x, loader: undefined, children: x.children && withoutLoaders(x.children) }))

const createRouter: typeof createBrowserRouter = (r, opts) => {
  const router = createBrowserRouter(withoutLoaders(r as AnyRoute[]) as typeof r, opts)
  const navigate = router.navigate.bind(router)
  const vt = typeof document !== 'undefined' && 'startViewTransition' in document && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  router.navigate = ((to: Parameters<typeof navigate>[0], o?: Parameters<typeof navigate>[1]) =>
    typeof to === 'number' || !vt
      ? navigate(to as never, o)
      : // Seiten mit Karte wechseln ohne Übergang (das Abbild der WebGL-Karte kostet Zeit), dafür sofort gerendert
        document.querySelector('.maplibregl-canvas')
        ? navigate(to, { ...o, flushSync: true })
        : navigate(to, { ...o, viewTransition: o?.viewTransition ?? true })) as typeof router.navigate
  // Seitencode vorladen, sobald ein interner Link berührt, überfahren oder fokussiert wird: Der Wechsel wartet dann
  // nicht auf den Download (der Browser lädt jedes Modul nur einmal, der Router nutzt danach dieselbe Datei)
  const done = new Set<string>()
  const preload = (e: Event) => {
    const a = (e.target as Element | null)?.closest?.('a[href^="/"]')
    const path = a?.getAttribute('href')?.split(/[?#]/)[0]
    if (!path || done.has(path)) return
    done.add(path)
    matchRoutes(router.routes, path)?.forEach((m) => {
      const lazy = (m.route as { lazy?: () => Promise<unknown> }).lazy
      lazy?.().catch(() => done.delete(path))
    })
  }
  ;['pointerover', 'touchstart', 'focusin'].forEach((t) => document.addEventListener(t, preload, { passive: true }))
  return router
}

/** Live-Build: jede Seite wird als eigenes HTML vorgerendert (vite-react-ssg). */
export const createRoot = ViteReactSSG({ routes, basename: import.meta.env.BASE_URL, customCreateRouter: createRouter })
