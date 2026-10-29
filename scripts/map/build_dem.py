# Höhenmodell für die Geländekarte des Einzugsgebiets (public/map/gelaende.pmtiles).
# Quelle: Terrain Tiles (Mapzen/Tilezen, AWS Open Data, Terrarium-Kodierung), offene Höhendaten u. a. aus SRTM und
# EU-DEM; Attribution siehe https://github.com/tilezen/joerd/blob/master/docs/attribution.md
# Die Kacheln werden einmal geladen, verlustfrei als WebP gespeichert und als PMTiles selbst ausgeliefert:
# kein fremder Kartendienst, keine Besucherdaten an Dritte.
#
# Ausschnitt: Zoom 7 bis 11 für den ganzen Kartenausschnitt, Zoom 12 nur für den Ortenaukreis (Zielgebiet des Vogelflugs).
# Darüber vergrößert MapLibre selbst.
# Aufruf: python3 scripts/map/build_dem.py
import io
import math
import os
import urllib.request
from concurrent.futures import ThreadPoolExecutor

from PIL import Image
from pmtiles.tile import Compression, TileType, zxy_to_tileid
from pmtiles.writer import Writer

HERE = os.path.dirname(__file__)
CACHE = os.path.join(HERE, '.data', 'dem')
OUT = os.path.join(HERE, '..', '..', 'public', 'map', 'gelaende.pmtiles')
FULL = (7.05, 47.95, 8.95, 48.98)
COUNTY = (7.68, 48.13, 8.42, 48.75)
URL = 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'


def tiles(bbox, z):
    w, s, e, n = bbox

    def tx(lon):
        return int((lon + 180) / 360 * 2**z)

    def ty(lat):
        r = math.radians(lat)
        return int((1 - math.log(math.tan(r) + 1 / math.cos(r)) / math.pi) / 2 * 2**z)

    return [(z, x, y) for x in range(tx(w), tx(e) + 1) for y in range(ty(n), ty(s) + 1)]


def fetch(t):
    z, x, y = t
    path = os.path.join(CACHE, f'{z}-{x}-{y}.webp')
    if not os.path.exists(path):
        with urllib.request.urlopen(URL.format(z=z, x=x, y=y), timeout=60) as r:
            png = r.read()
        # verlustfrei: die Farbwerte sind Höhen, jede Abweichung wäre ein Fehler im Relief
        Image.open(io.BytesIO(png)).convert('RGB').save(path, 'WEBP', lossless=True, method=6)
    with open(path, 'rb') as f:
        return t, f.read()


os.makedirs(CACHE, exist_ok=True)
todo = [t for z in range(7, 12) for t in tiles(FULL, z)] + tiles(COUNTY, 12)
with ThreadPoolExecutor(8) as pool:
    data = sorted(pool.map(fetch, todo), key=lambda r: zxy_to_tileid(*r[0]))

with open(OUT, 'wb') as f:
    w = Writer(f)
    for (z, x, y), b in data:
        w.write_tile(zxy_to_tileid(z, x, y), b)
    w.finalize(
        {
            'tile_type': TileType.WEBP,
            'tile_compression': Compression.NONE,
            'min_zoom': 7,
            'max_zoom': 12,
            'min_lon_e7': int(FULL[0] * 1e7),
            'min_lat_e7': int(FULL[1] * 1e7),
            'max_lon_e7': int(FULL[2] * 1e7),
            'max_lat_e7': int(FULL[3] * 1e7),
            'center_zoom': 9,
            'center_lon_e7': int(7.95 * 1e7),
            'center_lat_e7': int(48.47 * 1e7),
        },
        {'attribution': 'Terrain Tiles (Mapzen, AWS Open Data)', 'encoding': 'terrarium'},
    )
print(len(data), 'Kacheln,', round(os.path.getsize(OUT) / 1e6, 1), 'MB')
