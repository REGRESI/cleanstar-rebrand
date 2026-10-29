import { ViteReactSSG } from 'vite-react-ssg'
import { createBrowserRouter } from 'react-router-dom'
import { routes } from './routes'
import './styles/index.css'

// Skript läuft: Sicherheitsnetz aus index.html nicht mehr nötig (sonst würden Animationen bei langsamem Laden abgeschaltet)
if (typeof window !== 'undefined') (window as Window & { __csReady?: boolean }).__csReady = true

/**
 * Seitenwechsel wie in einer App: Jeder interne Wechsel läuft über die View Transitions API (Kopfzeile bleibt stehen,
 * der alte Inhalt gleitet nach oben weg, der neue öffnet sich von unten). Zurück/Vor im Browser bleibt ohne Übergang.
 * Ohne View Transitions übernimmt Framer Motion im Layout. Bei reduzierter Bewegung kein Übergang.
 */
const createRouter: typeof createBrowserRouter = (r, opts) => {
  const router = createBrowserRouter(r, opts)
  const navigate = router.navigate.bind(router)
  const vt = typeof document !== 'undefined' && 'startViewTransition' in document && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  router.navigate = ((to: Parameters<typeof navigate>[0], o?: Parameters<typeof navigate>[1]) =>
    // Seiten mit WebGL-Bühne (Karte, Leistungsmappe) wechseln ohne Übergang: Das Abbild der Bühne kostet Zeit
    typeof to === 'number' || !vt || document.querySelector('.maplibregl-canvas, [data-page-slot]')
      ? navigate(to as never, o)
      : navigate(to, { ...o, viewTransition: o?.viewTransition ?? true })) as typeof router.navigate
  return router
}

/** Live-Build: jede Seite wird als eigenes HTML vorgerendert (vite-react-ssg). */
export const createRoot = ViteReactSSG({ routes, basename: import.meta.env.BASE_URL, customCreateRouter: createRouter })
