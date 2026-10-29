# Horizont der Signatur-Szene: echtes Höhenprofil des Schwarzwalds, wie man es vom Sitz in Offenburg aus nach Osten
# sieht. Aus dem selbst gehosteten Höhenmodell (scripts/map/build_dem.py, Kachel-Cache in scripts/map/.data/dem).
# Je Blickrichtung (Azimut 55° bis 125°) der größte Höhenwinkel entlang des Strahls bis 40 km, mit Erdkrümmung.
# Ergebnis: src/features/night/skyline.json (Höhenwinkel in Grad, gleichmäßig über die Breite verteilt)
# Aufruf: python3 scripts/night/skyline.py
import json, math, os
from PIL import Image

HERE = os.path.dirname(__file__)
CACHE = os.path.join(HERE, '..', 'map', '.data', 'dem')
OUT = os.path.join(HERE, '..', '..', 'src', 'features', 'night', 'skyline.json')
LAT0, LON0 = 48.4708, 7.9408  # Sitz in Offenburg (company.address.geo)
EYE = 8.0  # Augenhöhe über Gelände in Metern (Bürofenster 2. OG)
Z = 11
R = 6371000.0
cache = {}


def elev(lat, lon):
    n = 2**Z
    xf = (lon + 180) / 360 * n
    r = math.radians(lat)
    yf = (1 - math.log(math.tan(r) + 1 / math.cos(r)) / math.pi) / 2 * n
    x, y = int(xf), int(yf)
    k = (x, y)
    if k not in cache:
        p = os.path.join(CACHE, f'{Z}-{x}-{y}.webp')
        cache[k] = Image.open(p).convert('RGB').load() if os.path.exists(p) else None
    px = cache[k]
    if px is None:
        return None
    rgb = px[min(255, int((xf - x) * 256)), min(255, int((yf - y) * 256))]
    return rgb[0] * 256 + rgb[1] + rgb[2] / 256 - 32768


h0 = elev(LAT0, LON0) + EYE
out = []
for i in range(161):
    az = math.radians(55 + 70 * i / 160)
    best = -90.0
    for d in range(300, 40000, 100):
        lat = LAT0 + (d * math.cos(az)) / 111320
        lon = LON0 + (d * math.sin(az)) / (111320 * math.cos(math.radians(LAT0)))
        h = elev(lat, lon)
        if h is None:
            continue
        drop = d * d / (2 * R)
        best = max(best, math.degrees(math.atan2(h - drop - h0, d)))
    out.append(round(best, 3))
json.dump({'from': 'Offenburg, Blick nach Osten (Azimut 55° bis 125°)', 'eye': round(h0, 1), 'angles': out}, open(OUT, 'w'))
print('Höhe Standort', round(h0), 'm, Höhenwinkel', min(out), 'bis', max(out), 'Grad')
