import raw from '@/content/mappe-assets.json'

export interface MappeAsset {
  file: string
  width: number
  height: number
}

/** Vorhandene Ebenen der Szene (erzeugt von scripts/mappe-assets.mjs). Fehlende Fotos ersetzt die Szene selbst. */
export function mappeAsset(name: string): MappeAsset | undefined {
  const a = (raw as Record<string, Partial<MappeAsset>>)[name]
  return a && a.file ? (a as MappeAsset) : undefined
}

/** Tischfläche: Foto, sonst die erzeugte Steinoberfläche */
export const tableFile = (portrait: boolean) =>
  mappeAsset(portrait ? 'tisch-hoch' : 'tisch-quer')?.file ?? mappeAsset('tisch')?.file ?? (portrait ? '/mappe/tisch-hoch.webp' : '/mappe/tisch-quer.webp')
