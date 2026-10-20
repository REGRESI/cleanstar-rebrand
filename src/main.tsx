import { ViteReactSSG } from 'vite-react-ssg'
import { routes } from './routes'
import './styles/index.css'

// Skript läuft: Sicherheitsnetz aus index.html nicht mehr nötig (sonst würden Animationen bei langsamem Laden abgeschaltet)
if (typeof window !== 'undefined') (window as Window & { __csReady?: boolean }).__csReady = true

/** Live-Build: jede Seite wird als eigenes HTML vorgerendert (vite-react-ssg). */
export const createRoot = ViteReactSSG({ routes, basename: import.meta.env.BASE_URL })
