# Kartendaten für das Einzugsgebiet: Overture-Maps-Daten (aus OpenStreetMap abgeleitet, ODbL) für den Ausschnitt
# Ortenaukreis und Umgebung laden. Gelesen werden nur die Zeilengruppen im Ausschnitt (anonymer S3-Zugriff).
# Aufruf (einmalig, Ergebnis in scripts/map/.data, nicht im Repository):
#   python3 scripts/map/fetch_overture.py theme=divisions/type=division_area id,names,subtype,class,geometry,country,region divarea.parquet
#   python3 scripts/map/fetch_overture.py theme=base/type=water id,subtype,class,geometry,names water.parquet
#   python3 scripts/map/fetch_overture.py theme=transportation/type=segment id,subtype,class,geometry,names segments.parquet
#   python3 scripts/map/fetch_overture.py theme=base/type=land_use id,subtype,class,geometry landuse.parquet
# Danach: python3 scripts/map/build_tiles.py  (braucht pyarrow, shapely, mapbox-vector-tile, pmtiles)
import sys, time, pyarrow.fs as pafs, pyarrow.dataset as ds, pyarrow.parquet as pq, pyarrow.compute as pc
W, S, E, N = 7.05, 47.95, 8.95, 48.98
fs = pafs.S3FileSystem(anonymous=True, region='us-west-2')
base = 'overturemaps-us-west-2/release/2026-10-21.0'
theme, cols, out = sys.argv[1], sys.argv[2].split(','), sys.argv[3]
d = ds.dataset(f'{base}/{theme}', filesystem=fs, format='parquet')
f = (pc.field('bbox', 'xmax') >= W) & (pc.field('bbox', 'xmin') <= E) & (pc.field('bbox', 'ymax') >= S) & (pc.field('bbox', 'ymin') <= N)
t0 = time.time()
tbl = d.to_table(columns=cols + ['bbox'], filter=f)
import os
os.makedirs(os.path.join(os.path.dirname(__file__), '.data'), exist_ok=True)
pq.write_table(tbl, os.path.join(os.path.dirname(__file__), '.data', out))
print(theme, tbl.num_rows, round(time.time() - t0), 's')
