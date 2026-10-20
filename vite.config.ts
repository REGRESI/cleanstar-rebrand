import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'
import { readFileSync, existsSync, readdirSync } from 'node:fs'
import sharp from 'sharp'
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

/**
 * Bilder für die Einzeldatei-Vorschau: stark komprimierte WebP (1200 px) als data-URI.
 * Im Live-Build bleibt das Modul leer, dort kommen die responsiven Dateien aus public/images.
 */
function previewImagesPlugin(inline: boolean): Plugin {
  const id = 'virtual:preview-images'
  return {
    name: 'cleanstar-preview-images',
    resolveId: (source) => (source === id ? '\0' + id : null),
    async load(loadId) {
      if (loadId !== '\0' + id) return null
      if (!inline || !existsSync(`${root}bilder`)) return 'export default {}'
      const entries: string[] = []
      for (const f of readdirSync(`${root}bilder`).filter((x) => /\.(jpe?g|png|webp)$/i.test(x))) {
        const buf = await sharp(`${root}bilder/${f}`).resize({ width: 1200, withoutEnlargement: true }).webp({ quality: 52, effort: 6 }).toBuffer()
        entries.push(`  ${JSON.stringify(f.replace(/\.[^.]+$/, ''))}: ${JSON.stringify('data:image/webp;base64,' + buf.toString('base64'))},`)
      }
      return `export default {\n${entries.join('\n')}\n}`
    },
  }
}

/**
 * Hero-Scroll-Video: Bildsequenzen und Schlüsselbilder aus public/hero (erzeugt mit npm run hero).
 * Live-Build: Pfade, Frames werden im Browser nachgeladen.
 * Vorschau-Datei: reduzierte Sequenz (public/hero/p) und Schlüsselbilder als data-URI.
 */
function heroFramesPlugin(inline: boolean): Plugin {
  const id = 'virtual:hero-frames'
  const dir = `${root}public/hero`
  const list = (sub: string) =>
    existsSync(`${dir}/${sub}`)
      ? readdirSync(`${dir}/${sub}`)
          .filter((f) => f.endsWith('.webp'))
          .sort()
      : []
  const data = (file: string) => `data:image/${file.endsWith('.jpg') ? 'jpeg' : 'webp'};base64,` + readFileSync(`${dir}/${file}`).toString('base64')
  return {
    name: 'cleanstar-hero-frames',
    resolveId: (source) => (source === id ? '\0' + id : null),
    load(loadId) {
      if (loadId !== '\0' + id) return null
      const manifest = existsSync(`${dir}/keys.json`) ? JSON.parse(readFileSync(`${dir}/keys.json`, 'utf8')) : { keys: [], previewCrop: [] }
      const stillNames = ['aussen-d', 'aussen-m', 'morgen-d', 'morgen-m']
      const still = Object.fromEntries(stillNames.map((k) => [k, inline ? data(`still-${k}.webp`) : `/hero/still-${k}.webp`]))
      const keys = manifest.keys.map((k: { name: string; progress: number }) => ({
        ...k,
        d: inline ? data(`key-${k.name}-p.jpg`) : `/hero/key-${k.name}-d.jpg`,
        m: inline ? null : `/hero/key-${k.name}-m.jpg`,
      }))
      if (inline) {
        // In der Vorschau nutzen Handy und Desktop dieselbe eingebettete Sequenz (nur einmal einbetten).
        // Auf dem Handy wird sie mit previewCrop im 4:5-Ausschnitt gezeichnet.
        const desktop = list('p').map((f) => data(`p/${f}`))
        return `const d = ${JSON.stringify(desktop)}\nexport default { desktop: d, mobile: d, mobileCrop: ${JSON.stringify(manifest.previewCrop)}, still: ${JSON.stringify(still)}, keys: ${JSON.stringify(keys)}, inline: true }`
      }
      const desktop = list('d').map((f) => `/hero/d/${f}`)
      const mobile = list('m').map((f) => `/hero/m/${f}`)
      return `export default ${JSON.stringify({ desktop, mobile, mobileCrop: null, still, keys, inline })}`
    },
  }
}

export default defineConfig(({ mode }) => {
  const isPreview = mode === 'preview'
  return {
    plugins: [
      react(),
      tailwindcss(),
      downloadsPlugin(isPreview),
      previewImagesPlugin(isPreview),
      heroFramesPlugin(isPreview),
      ...(isPreview ? [viteSingleFile({ removeViteModuleLoader: true })] : []),
    ],
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
