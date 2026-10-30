import { useEffect, useRef, useState } from 'react'
import maplibregl, { type LngLatBoundsLike, type StyleSpecification } from 'maplibre-gl'
import { Protocol } from 'pmtiles'
import 'maplibre-gl/dist/maplibre-gl.css'
import { hq, places, shortName, type Place } from '@/content/places'
import { getLocation } from '@/content/locations'
import { services } from '@/content/services'
import { MomentHeading } from '@/components/ui/MomentHeading'
import { Sparkle } from '@/components/ui/Sparkle'
import { EASE_CS } from '@/lib/ease'
import { prefersReducedMotion } from '@/lib/env'

/**
 * Geländekarte des Einzugsgebiets: MapLibre GL mit selbst gehosteten Daten, kein fremder Kartendienst.
 * - Relief: Höhenmodell (public/map/gelaende.pmtiles, Terrain Tiles von Mapzen/AWS Open Data, Terrarium-Kodierung,
 *   erzeugt mit scripts/map/build_dem.py) als Schummerung und als echtes 3D-Gelände mit Neigung.
 * - Landbedeckung, Gewässer, Orte, Straßen, Grenzen: Vektorkacheln aus OpenStreetMap-Daten über Overture Maps
 *   (public/map/ortenau.pmtiles, scripts/map/build_tiles.py).
 * Keine Schriften von außen: Ortsnamen sind HTML-Beschriftungen. Seite Einzugsgebiet und Startseite, per dynamischem Import.
 *
 * Klick auf einen Ort: Vogelflug (siehe birdFlight) mit Wolkenschichten, Durchflug durch eine dichte Wolke,
 * Wolkenschatten, Anfahrtslinie und mitlaufender Fahrzeit; Ankunft mit Markierung, Glanz-Stern und Ortsname in der
 * Moment-Schrift, danach die Ortsseite. Etwa 3,5 Sekunden, mit Escape oder Klick überspringbar. Reduzierte Bewegung:
 * direkter Seitenwechsel.
 */

export type MapApi = { fly: (p: Place) => void; highlight: (slug: string | null) => void }

// Gedeckte, realistische Geländefarben: Wald gedecktes Grün, Felder und Wiesen hell, Wasser Blaugrau
const C = {
  paper: '#f7f9fb',
  surface: '#edf1f5',
  ink: '#0b1220',
  blue: '#1a4fe0',
  land: '#eceee4',
  forest: '#9db48f',
  scrub: '#bccaa8',
  meadow: '#dfe7cf',
  field: '#ecebdc',
  orchard: '#d3dfbe',
  vineyard: '#e2dfc8',
  wetland: '#c9d8d0',
  water: '#a9bccb',
  waterway: '#93aabd',
  settle: '#dddbd6',
  roadMinor: '#f4f3ef',
  road: '#ffffff',
  roadCase: '#b9b7b0',
  roadMajor: '#fbfaf6',
  admin: '#8f9a8c',
  shadow: '#33433a',
  highlight: '#ffffff',
}
const COUNTY: LngLatBoundsLike = [
  [7.68, 48.13],
  [8.42, 48.75],
]
const ATTRIBUTION =
  '<a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">© OpenStreetMap-Mitwirkende</a>, <a href="https://overturemaps.org" target="_blank" rel="noopener">Overture Maps</a>'
const DEM_ATTRIBUTION =
  'Höhendaten: <a href="https://github.com/tilezen/joerd/blob/master/docs/attribution.md" target="_blank" rel="noopener">Terrain Tiles (Mapzen, AWS Open Data; SRTM, EU-DEM © Copernicus)</a>'

function style(): StyleSpecification {
  const w = (a: number, b: number) => ['interpolate', ['exponential', 1.6], ['zoom'], 8, a, 14, b] as unknown as number
  return {
    version: 8,
    sources: {
      o: { type: 'vector', url: 'pmtiles:///map/ortenau.pmtiles', attribution: ATTRIBUTION },
      dem: { type: 'raster-dem', url: 'pmtiles:///map/gelaende.pmtiles', encoding: 'terrarium', tileSize: 256, attribution: DEM_ATTRIBUTION },
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
      { id: 'bg', type: 'background', paint: { 'background-color': C.land } },
      {
        id: 'cover',
        type: 'fill',
        source: 'o',
        'source-layer': 'cover',
        paint: {
          'fill-color': [
            'match',
            ['get', 'kind'],
            'forest',
            C.forest,
            'scrub',
            C.scrub,
            'meadow',
            C.meadow,
            'field',
            C.field,
            'orchard',
            C.orchard,
            'vineyard',
            C.vineyard,
            'wetland',
            C.wetland,
            C.land,
          ] as unknown as string,
          'fill-antialias': false,
        },
      },
      { id: 'landuse', type: 'fill', source: 'o', 'source-layer': 'landuse', paint: { 'fill-color': C.settle, 'fill-opacity': 0.9 } },
      // Schummerung: Licht von Nordwesten, Schatten in gedecktem Grüngrau
      {
        id: 'hillshade',
        type: 'hillshade',
        source: 'dem',
        paint: {
          'hillshade-exaggeration': 0.55,
          'hillshade-shadow-color': C.shadow,
          'hillshade-highlight-color': C.highlight,
          'hillshade-accent-color': '#5f6f62',
          'hillshade-illumination-direction': 315,
        },
      },
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
      { id: 'admin', type: 'line', source: 'o', 'source-layer': 'admin', paint: { 'line-color': C.admin, 'line-opacity': 0.5, 'line-width': 0.7, 'line-dasharray': [3, 2] } },
      { id: 'rail', type: 'line', source: 'o', 'source-layer': 'rail', paint: { 'line-color': '#9a9890', 'line-width': w(0.4, 1.2) } },
      {
        id: 'roads-case',
        type: 'line',
        source: 'o',
        'source-layer': 'roads',
        filter: ['in', ['get', 'kind'], ['literal', ['motorway', 'trunk', 'primary']]],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': C.roadCase, 'line-width': w(1.6, 7.5), 'line-opacity': 0.8 },
      },
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
      // Außerhalb des Kreises leicht aufgehellt: der Ortenaukreis hebt sich dezent ab, das Gelände bleibt erkennbar
      { id: 'mask', type: 'fill', source: 'o', 'source-layer': 'mask', paint: { 'fill-color': C.paper, 'fill-opacity': 0.42 } },
      { id: 'border', type: 'line', source: 'o', 'source-layer': 'border', paint: { 'line-color': '#7d8a99', 'line-width': 1, 'line-dasharray': [4, 2] } },
      { id: 'county', type: 'line', source: 'o', 'source-layer': 'county', paint: { 'line-color': C.ink, 'line-opacity': 0.45, 'line-width': 1.3 } },
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

/**
 * Vogelflug: Die Kamera startet über Offenburg, kippt nach vorn, fliegt in einer weichen Kurve über das Relief zum Ort
 * (der Weg biegt zur Seite der Schwarzwaldkämme bzw. der Rheinebene aus), steigt unterwegs etwas auf, dreht und neigt
 * sich leicht in die Kurve und senkt sich am Ende auf den Ort. Gezeichnet Bild für Bild; onFrame bekommt den Fortschritt
 * auf der Strecke (0 bis 1) für Anfahrtslinie und Fahrzeit. Gibt eine Abbruchfunktion zurück.
 */
type LL = [number, number]
function routeCurve(from: LL, to: LL) {
  const dx = to[0] - from[0]
  const dy = to[1] - from[1]
  const len = Math.hypot(dx, dy) || 1e-6
  const side = to[0] > 8.0 ? 1 : -1
  const flip = (-dy / len) * side < 0 ? -1 : 1
  const bend = Math.min(0.1, len * 0.3)
  const c: LL = [(from[0] + to[0]) / 2 + (-dy / len) * flip * bend, (from[1] + to[1]) / 2 + (dx / len) * flip * bend]
  const at = (e: number): LL => {
    const u = 1 - e
    return [u * u * from[0] + 2 * u * e * c[0] + e * e * to[0], u * u * from[1] + 2 * u * e * c[1] + e * e * to[1]]
  }
  return { at, len, side }
}

function birdFlight(map: maplibregl.Map, home: LL, to: LL, o: { zoom: number; pitch: number; duration: number; onFrame: (route: number, k: number) => void }) {
  const start = map.getCenter()
  const z0 = map.getZoom()
  const p0 = map.getPitch()
  const b0 = map.getBearing()
  const curve = routeCurve(home, to)
  const lift = Math.min(1.2, curve.len * 6)
  const t0 = performance.now()
  let raf = 0
  // Abschnitte: 0 bis 0,16 über Offenburg einschwenken und nach vorn kippen, bis 0,84 Kurve, danach absenken
  const step = (now: number) => {
    const k = Math.min(1, (now - t0) / o.duration)
    const a = EASE_CS(Math.min(1, k / 0.16))
    const r = EASE_CS(Math.max(0, Math.min(1, (k - 0.14) / 0.72)))
    const d = EASE_CS(Math.max(0, (k - 0.8) / 0.2))
    const onCurve = curve.at(r)
    const center: LL = k < 0.16 ? [start.lng + (home[0] - start.lng) * a, start.lat + (home[1] - start.lat) * a] : onCurve
    map.jumpTo({
      center,
      zoom: z0 + 0.35 * a + (o.zoom - z0 - 0.35) * r * 0.75 + (o.zoom - z0) * 0.25 * d - Math.sin(Math.PI * r) * lift,
      pitch: p0 + (Math.min(o.pitch, 58) - p0) * a + (o.pitch - Math.min(o.pitch, 58)) * d,
      // in die Kurve drehen und leicht neigen, am Ziel mit -8° ankommen
      bearing: b0 + (-8 - b0) * r - Math.sin(Math.PI * r) * 11 * curve.side,
    })
    o.onFrame(r, k)
    if (k < 1) raf = requestAnimationFrame(step)
  }
  raf = requestAnimationFrame(step)
  return { cancel: () => cancelAnimationFrame(raf), curve }
}

/** Läuft WebGL ohne Grafikhardware (z. B. SwiftShader, llvmpipe)? */
function softwareGL() {
  const gl = document.createElement('canvas').getContext('webgl')
  const info = gl?.getExtension('WEBGL_debug_renderer_info')
  return !!info && /swiftshader|llvmpipe|software|basic render/i.test(String(gl!.getParameter(info.UNMASKED_RENDERER_WEBGL)))
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
  const overlay = useRef<HTMLDivElement>(null)
  const [arrive, setArrive] = useState<{ p: Place; xy: [number, number] } | null>(null)
  const onArrive = (p: Place | null, at: [number, number] | null) => setArrive(p && at ? { p, xy: at } : null)
  const loc = arrive ? getLocation(arrive.p.slug) : undefined
  const asked = (loc?.focus ?? []).slice(0, 3).map((f) => services.find((x) => x.slug === f.service)?.name).filter(Boolean)

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
      // leicht geneigt: Relief und Täler sind sofort als Gelände erkennbar
      pitch: small ? 28 : 38,
      bearing: -6,
      maxPitch: 70,
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
    // Echtes 3D-Gelände (leicht überhöht, damit Schwarzwald und Rheinebene lesbar werden) und ein ruhiger Himmel am Horizont.
    // Ohne Grafikhardware (Software-Rendering) nur die Schummerung: 3D-Gelände wäre dort zu langsam
    map.once('style.load', () => {
      if (!softwareGL()) map.setTerrain({ source: 'dem', exaggeration: 1.35 })
      map.setSky({
        'sky-color': '#dbe6f1',
        'horizon-color': '#eef3f8',
        'fog-color': '#eef3f8',
        'sky-horizon-blend': 0.6,
        'horizon-fog-blend': 0.6,
        'fog-ground-blend': 0.85,
        'atmosphere-blend': 0,
      })
    })

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

    // Anfahrtslinie (wird während des Flugs von Offenburg zum Ort gezeichnet)
    const HOME: LL = [hq.lng, hq.lat]
    map.once('style.load', () => {
      map.addSource('route', { type: 'geojson', data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [] } } })
      map.addLayer(
        { id: 'route', type: 'line', source: 'route', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': C.blue, 'line-width': 3.2, 'line-opacity': 0.9 } },
        'hq-ring',
      )
    })

    let flying = false
    let stop: (() => void) | null = null
    function fly(p: Place) {
      if (prefersReducedMotion()) return onOpen(p)
      if (flying) return
      flying = true
      onHover(null, null)
      // __csFlightSlow: nur für Bildfolgen in Tests (Zeitlupe), sonst 1
      const duration = (small ? 2300 : 2700) * ((window as { __csFlightSlow?: number }).__csFlightSlow ?? 1)
      const timers: number[] = []
      const anims: Animation[] = []
      const hud = overlay.current
      const meter = hud?.querySelector<HTMLElement>('[data-meter]')
      hud?.setAttribute('data-on', 'fly')
      const route = map.getSource('route') as maplibregl.GeoJSONSource | undefined
      const flight = birdFlight(map, HOME, [p.lng, p.lat], {
        zoom: small ? 12.4 : 12.8,
        pitch: small ? 52 : 62,
        duration,
        onFrame: (r) => {
          // Linie bis zur aktuellen Stelle, Fahrzeit läuft mit (ungefährer Wert aus places.ts)
          if (route) {
            const n = Math.max(2, Math.round(40 * r))
            const pts = Array.from({ length: n }, (_, i) => flight.curve.at((i / (n - 1)) * r))
            route.setData({ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: pts } })
          }
          if (meter) meter.textContent = String(Math.round(p.minutes * r))
        },
      })
      // Wolken: drei bis vier Schichten (Handy zwei) mit eigenem Tempo und eigener Größe; auf dem Höhepunkt fliegt die
      // Kamera durch eine dichte Wolke (kurz fast weiß), dann reißt sie auf. Wolkenschatten wandern über das Gelände.
      const layers = Array.from(clouds.current?.querySelectorAll<HTMLElement>('[data-cloud]') ?? [])
      layers.slice(0, small ? 2 : 4).forEach((el, i) => {
        const dir = i % 2 ? -1 : 1
        anims.push(
          el.animate(
            [
              { opacity: 0, transform: `translate3d(${8 * dir}%, ${5 + i * 2}%, 0) scale(${1.05 + i * 0.12})` },
              { opacity: 0.55 + i * 0.08, offset: 0.3 },
              { opacity: 0.85, offset: 0.48 },
              { opacity: 0.4, offset: 0.66 },
              { opacity: 0, transform: `translate3d(${-(18 + i * 9) * dir}%, ${-(8 + i * 4)}%, 0) scale(${1.4 + i * 0.25})` },
            ],
            { duration: duration * (0.9 + i * 0.05), easing: 'cubic-bezier(0.3, 0.6, 0.2, 1)', fill: 'none' },
          ),
        )
      })
      const dense = clouds.current?.querySelector<HTMLElement>('[data-dense]')
      if (dense)
        anims.push(
          dense.animate(
            [
              { opacity: 0, transform: 'scale(0.85)' },
              { opacity: 0, transform: 'scale(0.9)', offset: 0.34 },
              { opacity: 0.93, transform: 'scale(1.15)', offset: 0.5 },
              { opacity: 0, transform: 'scale(1.9)', offset: 0.66 },
              { opacity: 0, transform: 'scale(1.9)' },
            ],
            { duration, easing: 'linear', fill: 'none' },
          ),
        )
      const shade = clouds.current?.querySelector<HTMLElement>('[data-shade]')
      if (shade)
        anims.push(
          shade.animate(
            [
              { opacity: 0, transform: 'translate3d(18%, 6%, 0)' },
              { opacity: 1, offset: 0.25 },
              { opacity: 1, offset: 0.8 },
              { opacity: 0, transform: 'translate3d(-22%, -8%, 0)' },
            ],
            { duration, easing: 'linear', fill: 'none' },
          ),
        )

      // Ankunft: Markierung pulsiert, Glanz-Stern, Ortsname in der Moment-Schrift mit Fahrzeit und gefragten Leistungen;
      // danach weicher Übergang zur Ortsseite. Jederzeit mit Escape oder Klick überspringbar.
      timers.push(
        window.setTimeout(() => {
          hud?.setAttribute('data-on', 'arrive')
          onArrive(p, xy(p))
        }, duration),
      )
      timers.push(window.setTimeout(() => finish(), duration + 1000 * ((window as { __csFlightSlow?: number }).__csFlightSlow ?? 1)))
      const skip = (e: Event) => {
        if (e instanceof KeyboardEvent && e.key !== 'Escape') return
        finish()
      }
      function finish() {
        if (!flying) return
        flying = false
        stop = null
        flight.cancel()
        timers.forEach((t) => window.clearTimeout(t))
        anims.forEach((a) => a.cancel())
        removeEventListener('keydown', skip)
        removeEventListener('pointerdown', skip, true)
        hud?.removeAttribute('data-on')
        route?.setData({ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [] } })
        onArrive(null, null)
        onOpen(p)
      }
      stop = finish
      // erst nach dem auslösenden Klick lauschen
      window.setTimeout(() => {
        addEventListener('keydown', skip)
        addEventListener('pointerdown', skip, true)
      }, 0)
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
      stop?.()
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
        <div data-shade className="map-shade" />
        {['/map/wolken-1.webp', '/images/deko/wolken-2.webp', '/map/wolken-2.webp', '/images/deko/wolken-3.webp'].map((src, i) => (
          <div key={src} data-cloud className="map-cloud" style={{ backgroundImage: `url(${src})`, inset: `${-18 - i * 6}%` }} />
        ))}
        <div data-dense className="map-dense" />
      </div>
      {/* Fahrzeit während des Flugs, Ankunft mit Ortsname */}
      <div ref={overlay} className="map-hud pointer-events-none absolute inset-0" aria-live="polite">
        <p className="map-meter">
          <span className="t-label">Fahrzeit ab Offenburg</span>
          <span className="block font-medium tabular-nums text-[1.5rem] leading-none text-ink">
            ca. <span data-meter>0</span> Min.
          </span>
        </p>
        {arrive && (
          <div className={arrive.xy[1] < 210 ? 'map-arrive is-below' : 'map-arrive'} style={{ left: arrive.xy[0], top: arrive.xy[1] }}>
            <span className="map-pulse" aria-hidden />
            <Sparkle play className="absolute -top-6 left-3 size-5" />
            <div className="map-arrive-card">
              <MomentHeading as="p" text={shortName(arrive.p)} play vanish={false} className="map-arrive-name" />
              <p className="mt-2 font-medium tabular-nums text-[0.8125rem] text-muted">{arrive.p.minutes === 0 ? 'Unser Sitz' : `ca. ${arrive.p.minutes} Min. ab Offenburg`}</p>
              {asked.length > 0 && <p className="mt-1 text-[0.8125rem] text-ink-2">Gefragt: {asked.join(', ')}</p>}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
