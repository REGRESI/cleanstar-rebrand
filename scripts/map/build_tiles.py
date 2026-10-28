# Vektorkacheln für die Karte des Einzugsgebiets (public/map/ortenau.pmtiles).
# Quelle: Overture-Maps-Daten (aus OpenStreetMap abgeleitet, © OpenStreetMap-Mitwirkende, ODbL), siehe fetch_overture.py.
# Die Karte wird über GitHub Pages ausgeliefert: kein fremder Kartendienst, keine Besucherdaten an Dritte.
#
# Ebenen:  mask (außerhalb des Kreises), county (Ortenaukreis), admin (Gemeindegrenzen), border (Staatsgrenze),
#          landuse (Siedlungsflächen), water (Flächen), waterway (Flüsse, Kanäle), roads (Straßen nach Klasse), rail
# Zoom 7 bis 13, darüber vergrößert MapLibre selbst.
# Aufruf: python3 scripts/map/build_tiles.py
import gzip
import math
import os
import time

import mapbox_vector_tile
import numpy as np
import pyarrow.parquet as pq
import shapely
from pmtiles.tile import Compression, TileType, zxy_to_tileid
from pmtiles.writer import Writer
from shapely import wkb
from shapely.geometry import box

HERE = os.path.dirname(__file__)
DATA = os.path.join(HERE, '.data')
OUT = os.path.join(HERE, '..', '..', 'public', 'map', 'ortenau.pmtiles')
W, S, E, N = 7.05, 47.95, 8.95, 48.98
ZMIN, ZMAX = 7, 13
R = 6378137.0


def merc(geom):
    """Längen-/Breitengrad → Web-Mercator (Meter)"""

    def f(c):
        x = np.radians(c[:, 0]) * R
        y = np.log(np.tan(np.pi / 4 + np.radians(np.clip(c[:, 1], -85, 85)) / 2)) * R
        return np.column_stack([x, y])

    return shapely.transform(geom, f)


def read(name, cols):
    t = pq.read_table(os.path.join(DATA, name), columns=cols).to_pylist()
    for r in t:
        r['geometry'] = wkb.loads(r['geometry'])
    return t


t0 = time.time()
area = box(W, S, E, N)
features = {k: [] for k in ['mask', 'county', 'admin', 'border', 'landuse', 'water', 'waterway', 'roads', 'rail']}
# (Ebene, Geometrie, Eigenschaften, kleinster Zoom)


def add(layer, geom, props, minzoom):
    if geom is None or geom.is_empty:
        return
    geom = geom.intersection(area)
    if geom.is_empty:
        return
    features[layer].append((merc(geom), props, minzoom))


# Verwaltungsgrenzen
div = read('divarea.parquet', ['subtype', 'names', 'country', 'geometry'])
county = next(r['geometry'] for r in div if r['subtype'] == 'county' and (r['names'] or {}).get('primary') == 'Ortenaukreis')
add('county', county, {}, ZMIN)
add('mask', area.difference(county), {}, ZMIN)
for r in div:
    if r['subtype'] == 'locality' and r['country'] == 'DE' and r['geometry'].intersects(county):
        add('admin', r['geometry'].boundary, {}, 10)
de = next(r['geometry'] for r in div if r['subtype'] == 'country' and r['country'] == 'DE')
add('border', de.boundary, {}, ZMIN)

# Siedlungsflächen (dezent, damit Orte erkennbar sind)
for r in read('landuse.parquet', ['subtype', 'class', 'geometry']):
    if r['subtype'] in ('residential', 'developed') and r['geometry'].geom_type in ('Polygon', 'MultiPolygon'):
        add('landuse', r['geometry'], {'kind': r['subtype']}, 10)

# Gewässer: Flächen (Rhein, Seen, Altrheinarme) und Linien (Flüsse, Kanäle, Bäche erst nah)
for r in read('water.parquet', ['subtype', 'class', 'geometry']):
    g = r['geometry']
    if g.geom_type in ('Polygon', 'MultiPolygon'):
        if r['subtype'] in ('river', 'lake', 'water', 'reservoir', 'canal', 'pond') and r['class'] not in ('swimming_pool', 'wastewater'):
            add('water', g, {}, ZMIN if g.area > 1e-4 else 10)
    elif g.geom_type in ('LineString', 'MultiLineString'):
        if r['subtype'] == 'river':
            add('waterway', g, {'kind': 'river'}, 8)
        elif r['class'] == 'canal':
            add('waterway', g, {'kind': 'canal'}, 10)
        elif r['subtype'] == 'stream':
            add('waterway', g, {'kind': 'stream'}, 12)

# Straßen nach Bedeutung, Schienen fein
ROADZ = {'motorway': 7, 'trunk': 7, 'primary': 8, 'secondary': 9, 'tertiary': 10, 'residential': 12, 'unclassified': 12, 'living_street': 13}
for r in read('segments.parquet', ['subtype', 'class', 'geometry']):
    if r['subtype'] == 'road' and r['class'] in ROADZ:
        add('roads', r['geometry'], {'kind': r['class']}, ROADZ[r['class']])
    elif r['subtype'] == 'rail' and r['class'] == 'standard_gauge':
        add('rail', r['geometry'], {}, 10)

print('Daten gelesen', {k: len(v) for k, v in features.items()}, round(time.time() - t0), 's')

# Räumliche Indizes je Ebene
index = {k: (shapely.STRtree([g for g, _, _ in v]) if v else None) for k, v in features.items()}

WORLD = 2 * math.pi * R


def tile_bounds(z, x, y):
    size = WORLD / 2**z
    minx = -WORLD / 2 + x * size
    maxy = WORLD / 2 - y * size
    return minx, maxy - size, minx + size, maxy


def lonlat_to_tile(lon, lat, z):
    n = 2**z
    x = int((lon + 180) / 360 * n)
    y = int((1 - math.log(math.tan(math.radians(lat)) + 1 / math.cos(math.radians(lat))) / math.pi) / 2 * n)
    return x, y


tiles = []
for z in range(ZMIN, ZMAX + 1):
    x0, y0 = lonlat_to_tile(W, N, z)
    x1, y1 = lonlat_to_tile(E, S, z)
    tol = WORLD / 2**z / 4096 * 1.5  # gut ein Kachelpixel
    for x in range(x0, x1 + 1):
        for y in range(y0, y1 + 1):
            b = tile_bounds(z, x, y)
            pad = (b[2] - b[0]) * 64 / 4096
            clip = box(b[0] - pad, b[1] - pad, b[2] + pad, b[3] + pad)
            layers = []
            for name, feats in features.items():
                if not feats:
                    continue
                out = []
                for i in index[name].query(clip):
                    g, props, mz = feats[i]
                    if z < mz:
                        continue
                    c = shapely.clip_by_rect(g, *clip.bounds)
                    if c.is_empty:
                        continue
                    c = shapely.simplify(c, tol, preserve_topology=True)
                    if c.is_empty or (c.geom_type in ('Polygon', 'MultiPolygon') and c.area < tol * tol * 4):
                        continue
                    out.append({'geometry': c, 'properties': props})
                if out:
                    layers.append({'name': name, 'features': out})
            if not layers:
                continue
            data = mapbox_vector_tile.encode(layers, default_options={'quantize_bounds': b, 'extents': 4096})
            tiles.append((zxy_to_tileid(z, x, y), gzip.compress(data, mtime=0)))
    print('Zoom', z, 'fertig', len(tiles), 'Kacheln', round(time.time() - t0), 's')

tiles.sort(key=lambda t: t[0])
os.makedirs(os.path.dirname(OUT), exist_ok=True)
with open(OUT, 'wb') as f:
    w = Writer(f)
    for tid, data in tiles:
        w.write_tile(tid, data)
    w.finalize(
        {
            'tile_type': TileType.MVT,
            'tile_compression': Compression.GZIP,
            'min_lon_e7': int(W * 1e7),
            'min_lat_e7': int(S * 1e7),
            'max_lon_e7': int(E * 1e7),
            'max_lat_e7': int(N * 1e7),
            'center_zoom': 9,
            'center_lon_e7': int(7.95 * 1e7),
            'center_lat_e7': int(48.45 * 1e7),
        },
        {
            'name': 'CleanStar Einzugsgebiet',
            'attribution': '© OpenStreetMap-Mitwirkende, Overture Maps Foundation',
            'vector_layers': [{'id': k, 'fields': {}} for k in features],
        },
    )
print('✓', OUT, round(os.path.getsize(OUT) / 1024), 'KB', round(time.time() - t0), 's')
