import { ViteReactSSG } from 'vite-react-ssg'
import { routes } from './routes'
import './styles/index.css'

/** Live-Build: jede Seite wird als eigenes HTML vorgerendert (vite-react-ssg). */
export const createRoot = ViteReactSSG({ routes, basename: import.meta.env.BASE_URL })
