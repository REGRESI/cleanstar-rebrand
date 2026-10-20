import { createRoot } from 'react-dom/client'
import { createHashRouter, RouterProvider, type RouteObject } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { routes } from './routes'
import './styles/index.css'

/** Vorschau-Datei: alle Seiten in einer HTML-Datei über Hash-Routing (#/leistungen …). */
const router = createHashRouter(routes as RouteObject[])

createRoot(document.getElementById('root')!).render(
  <HelmetProvider>
    <RouterProvider router={router} />
  </HelmetProvider>,
)
