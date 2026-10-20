import { createRoot } from 'react-dom/client'
import { createHashRouter, RouterProvider, type RouteObject } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { routes } from './routes'
import './styles/index.css'

// Skript läuft: Sicherheitsnetz aus index.html nicht mehr nötig (sonst würden Animationen bei langsamem Laden abgeschaltet)
if (typeof window !== 'undefined') (window as Window & { __csReady?: boolean }).__csReady = true

/** Vorschau-Datei: alle Seiten in einer HTML-Datei über Hash-Routing (#/leistungen …). */
const router = createHashRouter(routes as RouteObject[])

createRoot(document.getElementById('root')!).render(
  <HelmetProvider>
    <RouterProvider router={router} />
  </HelmetProvider>,
)
