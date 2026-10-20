import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'
import { readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'

const root = fileURLToPath(new URL('.', import.meta.url))

/**
 * Stellt Download-Dateien aus public/downloads bereit.
 * Live-Build: normaler Pfad (/downloads/...).
 * Vorschau-Datei: als data-URI eingebettet, damit der Download ohne Server funktioniert.
 */
function downloadsPlugin(inline: boolean): Plugin {
  const id = 'virtual:downloads'
  const files = { checklist: 'checkliste-gute-bueroreinigung.pdf', partnerInfo: 'cleanstar-partner-infomappe.pdf' }
  return {
    name: 'cleanstar-downloads',
    resolveId: (source) => (source === id ? '\0' + id : null),
    load(loadId) {
      if (loadId !== '\0' + id) return null
      const entries = Object.entries(files).map(([key, file]) => {
        const href = inline ? 'data:application/pdf;base64,' + readFileSync(`${root}public/downloads/${file}`).toString('base64') : `/downloads/${file}`
        return `  ${key}: { href: ${JSON.stringify(href)}, file: ${JSON.stringify(file)} },`
      })
      return `export default {\n${entries.join('\n')}\n}`
    },
  }
}

export default defineConfig(({ mode }) => {
  const isPreview = mode === 'preview'
  return {
    plugins: [react(), tailwindcss(), downloadsPlugin(isPreview), ...(isPreview ? [viteSingleFile({ removeViteModuleLoader: true })] : [])],
    resolve: { alias: { '@': `${root}src` } },
    define: { __PREVIEW__: JSON.stringify(isPreview) },
    build: isPreview
      ? {
          outDir: 'dist-preview',
          assetsInlineLimit: 100_000_000,
          chunkSizeWarningLimit: 5000,
          rollupOptions: { input: `${root}preview.html` },
        }
      : { chunkSizeWarningLimit: 1200 },
    ssgOptions: {
      dirStyle: 'nested',
      formatting: 'none',
      script: 'async',
      includedRoutes(paths: string[]) {
        return paths.filter((p) => !p.includes(':') && p !== '*')
      },
    },
  }
})
