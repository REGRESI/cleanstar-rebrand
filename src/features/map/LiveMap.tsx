import { useEffect, useRef } from 'react'
import maplibregl, { type LngLatBoundsLike, type StyleSpecification } from 'maplibre-gl'
import { Protocol } from 'pmtiles'
import 'maplibre-gl/dist/maplibre-gl.css'
import { places, shortName, type Place } from '@/content/places'
import { EASE_CS } from '@/lib/ease'
import { prefersReducedMotion } from '@/lib/env'

/**
 * Echte, gestaltete Karte des Einzugsgebiets: MapLibre GL mit selbst gehosteten Vektorkacheln (public/map/ortenau.pmtiles,
 * aus OpenStreetMap-Daten über Overture Maps, erzeugt mit scripts/map/build_tiles.py). Kein fremder Kartendienst,
 * keine Schriften von außen: Ortsnamen sind HTML-Beschriftungen. Nur auf der Seite Einzugsgebiet, per dynamischem Import.
 *
 * Klick auf einen Ort: Vogelflug (Kamera kippt, zoomt und fliegt hin, Wolkenschichten ziehen durch und lichten sich am
 * Ziel), danach öffnet sich die Ortsseite. Reduzierte Bewegung: direkter Seitenwechsel.
 */

export type MapApi = { fly: (p: Place) => void; highlight: (slug: string | null) => void }

const C = {
  paper: '#f7f9fb',
  surface: '#edf1f5',
  ink: '#0b1220',
  blue: '#1a4fe0',
  water: '#d5e0ea',
  waterway: '#bccbdb',
  settle: '#e7ecf2',
  roadMinor: '#e1e6ec',
  road: '#ccd4dd',
  roadMajor: '#b8c2cd',
  admin: '#d6dce3',
}
const COUNTY: LngLatBoundsLike = [
  [7.68, 48.13],
  [8.42, 48.75],
]
const ATTRIBUTION =
  '<a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">© OpenStreetMap-Mitwirkende</a>, <a href="https://overturemaps.org" target="_blank" rel="noopener">Overture Maps</a>'

function style(): StyleSpecification {
  const w = (a: number, b: number) => ['interpolate', ['exponential', 1.6], ['zoom'], 8, a, 14, b] as unknown as number
  return {
    version: 8,
    sources: {
      o: { type: 'vector', url: 'pmtiles:///map/ortenau.pmtiles', attribution: ATTRIBUTION },
      places: {
        type: 'geojson',
        promoteId: 'slug',
        data: {
          type: 'FeatureCollection',
          features: places.map((p) => ({
            type: 'Feature',
            properties: { slug: p.slug, major: !!p.major, hq: p.slug === 'offenburg' },
            geometry: { type: 'Point', coordinates: [p.lng, p.lat] },
          })),
        },
      },
    },
    layers: [
      { id: 'bg', type: 'background', paint: { 'background-color': C.paper } },
      { id: 'landuse', type: 'fill', source: 'o', 'source-layer': 'landuse', paint: { 'fill-color': C.settle } },
      { id: 'water', type: 'fill', source: 'o', 'source-layer': 'water', paint: { 'fill-color': C.water } },
      {
        id: 'waterway',
        type: 'line',
        source: 'o',
        'source-layer': 'waterway',
        paint: {
          'line-color': C.waterway,
          'line-width': [
            'interpolate',
            ['exponential', 1.6],
            ['zoom'],
            8,
            ['match', ['get', 'kind'], 'river', 1, 'canal', 0.6, 0.4],
            14,
            ['match', ['get', 'kind'], 'river', 3, 'canal', 2, 1.2],
          ] as unknown as number,
        },
      },
      { id: 'admin', type: 'line', source: 'o', 'source-layer': 'admin', paint: { 'line-color': C.admin, 'line-width': 0.7, 'line-dasharray': [3, 2] } },
      { id: 'rail', type: 'line', source: 'o', 'source-layer': 'rail', paint: { 'line-color': C.road, 'line-width': w(0.4, 1.2) } },
      {
        id: 'roads-minor',
        type: 'line',
        source: 'o',
        'source-layer': 'roads',
        filter: ['in', ['get', 'kind'], ['literal', ['residential', 'unclassified', 'living_street']]],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': C.roadMinor, 'line-width': w(0.4, 3) },
      },
      {
        id: 'roads',
        type: 'line',
        source: 'o',
        'source-layer': 'roads',
        filter: ['in', ['get', 'kind'], ['literal', ['primary', 'secondary', 'tertiary']]],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': C.road, 'line-width': w(0.6, 4.5) },
      },
      {
        id: 'roads-major',
        type: 'line',
        source: 'o',
        'source-layer': 'roads',
        filter: ['in', ['get', 'kind'], ['literal', ['motorway', 'trunk']]],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': C.roadMajor, 'line-width': w(1, 6) },
      },
      // Außerhalb des Kreises leicht abgedeckt: der Ortenaukreis hebt sich dezent ab
      { id: 'mask', type: 'fill', source: 'o', 'source-layer': 'mask', paint: { 'fill-color': C.surface, 'fill-opacity': 0.78 } },
      { id: 'border', type: 'line', source: 'o', 'source-layer': 'border', paint: { 'line-color': '#9aa6b4', 'line-width': 1, 'line-dasharray': [4, 2] } },
      { id: 'county', type: 'line', source: 'o', 'source-layer': 'county', paint: { 'line-color': C.ink, 'line-opacity': 0.4, 'line-width': 1.2 } },
      {
        id: 'hq-ring',
        type: 'circle',
        source: 'places',
        filter: ['==', ['get', 'hq'], true],
        paint: { 'circle-radius': 13, 'circle-color': 'rgba(0,0,0,0)', 'circle-stroke-color': C.blue, 'circle-stroke-width': 1.2 },
      },
      {
        id: 'places',
        type: 'circle',
        source: 'places',
        paint: {
          'circle-color': C.blue,
          'circle-radius': ['case', ['get', 'hq'], 6.5, ['boolean', ['feature-state', 'on'], false], 7, ['get', 'major'], 4.5, 3.5],
          'circle-stroke-color': C.paper,
          'circle-stroke-width': 1.5,
          'circle-radius-transition': { duration: 300 },
        },
      },
    ],
  }
}

let protocolAdded = false

export default function LiveMap({
  onReady,
  onHover,
  onOpen,
  api,
}: {
  onReady: () => void
  onHover: (p: Place | null, xy: [number, number] | null) => void
  onOpen: (p: Place) => void
  api: React.MutableRefObject<MapApi | null>
}) {
  const box = useRef<HTMLDivElement>(null)
  const clouds = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!box.current) return
    if (!protocolAdded) {
      maplibregl.addProtocol('pmtiles', new Protocol().tile)
      protocolAdded = true
    }
    const small = window.matchMedia('(max-width: 767px)').matches
    const map = new maplibregl.Map({
      container: box.current,
      style: style(),
      bounds: COUNTY,
      fitBoundsOptions: { padding: small ? 16 : 32 },
      // nie über den Datenausschnitt hinaus (sonst leere Ränder)
      maxBounds: [
        [7.05, 47.95],
        [8.95, 48.98],
      ],
      minZoom: 8,
      maxZoom: 15,
      attributionControl: { compact: true },
      dragRotate: false,
      pitchWithRotate: false,
      // Seite scrollt normal weiter: Zoomen mit Strg bzw. zwei Fingern
      cooperativeGestures: true,
      locale: {
        'CooperativeGesturesHandler.WindowsHelpText': 'Zum Zoomen Strg gedrückt halten und scrollen',
        'CooperativeGesturesHandler.MacHelpText': 'Zum Zoomen ⌘ gedrückt halten und scrollen',
        'CooperativeGesturesHandler.MobileHelpText': 'Karte mit zwei Fingern bewegen',
        'NavigationControl.ZoomIn': 'Hineinzoomen',
        'NavigationControl.ZoomOut': 'Herauszoomen',
        'AttributionControl.ToggleAttribution': 'Quellenangabe ein- und ausblenden',
      },
    })
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')

    // Beschriftungen der größeren Orte als HTML (keine Schriftdateien von außen)
    const labels = places
      .filter((p) => p.major)
      .map((p) => {
        const el = document.createElement('span')
        el.className = p.slug === 'offenburg' ? 'map-label is-hq' : 'map-label'
        el.textContent = p.slug === 'offenburg' ? 'Offenburg · Sitz' : shortName(p)
        el.setAttribute('aria-hidden', 'true')
        return new maplibregl.Marker({ element: el, anchor: 'left', offset: [p.slug === 'offenburg' ? 18 : 9, 0] }).setLngLat([p.lng, p.lat]).addTo(map)
      })

    let hover: string | null = null
    const setOn = (slug: string | null) => {
      if (hover) map.setFeatureState({ source: 'places', id: hover }, { on: false })
      hover = slug
      if (slug) map.setFeatureState({ source: 'places', id: slug }, { on: true })
    }
    const xy = (p: Place) => {
      const pt = map.project([p.lng, p.lat])
      return [pt.x, pt.y] as [number, number]
    }
    map.on('mousemove', 'places', (e) => {
      const slug = e.features?.[0]?.properties?.slug as string | undefined
      const p = places.find((x) => x.slug === slug)
      if (!p || slug === hover) return
      setOn(slug!)
      map.getCanvas().style.cursor = 'pointer'
      onHover(p, xy(p))
    })
    map.on('mouseleave', 'places', () => {
      setOn(null)
      map.getCanvas().style.cursor = ''
      onHover(null, null)
    })
    map.on('click', 'places', (e) => {
      const p = places.find((x) => x.slug === e.features?.[0]?.properties?.slug)
      if (p) fly(p)
    })

    let flying = false
    function fly(p: Place) {
      if (prefersReducedMotion()) return onOpen(p)
      if (flying) return
      flying = true
      onHover(null, null)
      const duration = small ? 1500 : 2300
      map.flyTo({ center: [p.lng, p.lat], zoom: small ? 12.4 : 12.8, pitch: small ? 40 : 52, bearing: -8, duration, curve: 1.3, easing: EASE_CS, essential: true })
      // Wolken ziehen durch (zwei Schichten mit unterschiedlichem Tempo, Handy: eine) und lichten sich am Ziel
      const layers = Array.from(clouds.current?.children ?? []) as HTMLElement[]
      layers.slice(0, small ? 1 : 2).forEach((el, i) => {
        el.animate(
          [
            { opacity: 0, transform: 'translate3d(6%, 4%, 0) scale(1.1)' },
            { opacity: small ? 0.55 : i ? 0.65 : 0.8, offset: 0.4 },
            { opacity: small ? 0.45 : i ? 0.5 : 0.7, offset: 0.7 },
            { opacity: 0, transform: `translate3d(${i ? -26 : -14}%, ${i ? -12 : -7}%, 0) scale(${i ? 1.5 : 1.3})` },
          ],
          { duration: duration + 250, easing: 'cubic-bezier(0.2, 0.7, 0.1, 1)', fill: 'none' },
        )
      })
      // Seitenwechsel nach der festen Flugdauer (unabhängig von Zwischenereignissen der Kamera)
      window.setTimeout(() => {
        flying = false
        onOpen(p)
      }, duration + 200)
    }

    api.current = {
      fly,
      highlight: (slug) => {
        if (!map.isStyleLoaded()) return
        setOn(slug)
        const p = places.find((x) => x.slug === slug)
        onHover(p ?? null, p ? xy(p) : null)
      },
    }
    map.once('load', () => onReady())
    return () => {
      api.current = null
      labels.forEach((m) => m.remove())
      map.remove()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <div className="absolute inset-0">
        <div ref={box} className="size-full" />
      </div>
      <div ref={clouds} aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="map-cloud" style={{ backgroundImage: 'url(/map/wolken-1.webp)' }} />
        <div className="map-cloud" style={{ backgroundImage: 'url(/map/wolken-2.webp)' }} />
      </div>
    </>
  )
}
