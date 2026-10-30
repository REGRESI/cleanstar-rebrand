"""
Linienzeichnung aus einem Foto (Hero „Der Plan“ und Prüfpunkt-Ansicht): feine Linien in Markenblau auf Navy,
dazu ein sehr dezentes Planraster. Kantenerkennung beim Build (kantenerhaltend geglättet, dann Canny auf Basis der
Sobel-Gradienten, zwei Stufen: feine und kräftige Konturen). Ergebnis wird in WebGL und als Ersatzbild ohne WebGL
gleich verwendet. Aufruf: python3 scripts/line-art.py  (braucht opencv-python-headless, numpy, Pillow)
"""
import cv2, numpy as np
from PIL import Image

NAVY = np.array([0x0A, 0x1A, 0x33], np.float32)
LINE = np.array([0x8D, 0xA6, 0xFF], np.float32)  # blue-on-dark
GRID = np.array([0x1A, 0x4F, 0xE0], np.float32)


def lines(rgb: np.ndarray, grid_px: float) -> np.ndarray:
    g = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY)
    s = max(1.0, g.shape[1] / 1918)
    g = cv2.bilateralFilter(g, 9, 40, 9 * s)
    g = cv2.bilateralFilter(g, 9, 40, 9 * s)
    fine = cv2.Canny(g, 40, 110, L2gradient=True).astype(np.float32)
    bold = cv2.Canny(cv2.GaussianBlur(g, (0, 0), 3 * s), 25, 60, L2gradient=True).astype(np.float32)
    e = np.maximum(fine * 0.55, bold)
    e = cv2.GaussianBlur(e, (0, 0), 0.7 * s)
    e = np.clip(e / 255 * 1.6, 0, 1)[..., None]
    h, w = g.shape
    yy, xx = np.mgrid[0:h, 0:w]
    gl = ((xx % grid_px) < 1) | ((yy % grid_px) < 1)
    base = NAVY + (GRID - NAVY) * (gl[..., None] * 0.16)
    out = base * (1 - e) + LINE * e
    return out.astype(np.uint8)


def split(photo: np.ndarray, art: np.ndarray, at: float) -> np.ndarray:
    """Standbild „Staub“: links schon Plan, rechts noch Foto, dazwischen die helle Lichtkante"""
    h, w = photo.shape[:2]
    x = np.arange(w)[None, :, None].astype(np.float32)
    edge = at * w
    k = np.clip((x - edge) / (w * 0.03) + 0.5, 0, 1)
    out = art * (1 - k) + photo * k
    glow = np.exp(-(((x - edge) / (w * 0.004)) ** 2)) * 0.85 + np.exp(-(((x - edge) / (w * 0.03)) ** 2)) * 0.25
    out = out + (255 - out) * glow
    return np.clip(out, 0, 255).astype(np.uint8)


def load(path, width=None):
    im = Image.open(path).convert('RGB')
    if width and im.width != width:
        im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    return np.asarray(im)


def save(arr, path, q=82):
    Image.fromarray(arr).save(path, 'WEBP', quality=q, method=6)
    print(path)


# Hero: Plan des Büros am Abend
for size, src, w in (('d', 'public/hero/key-feierabend-d.jpg', 1918), ('m', 'public/hero/key-feierabend-p.jpg', 1280)):
    photo = load(src, w)
    art = lines(photo, 48 * w / 1918)
    save(art, f'public/hero/lines-{size}.webp')
    save(photo, f'public/hero/still-feierabend-{size}.webp', 80)
    save(split(photo.astype(np.float32), art.astype(np.float32), 0.55), f'public/hero/still-staub-{size}.webp', 80)
    if size == 'm':
        save(load('public/hero/key-morgen-p.jpg', w), 'public/hero/still-morgen-16x9-m.webp', 80)

# Prüfpunkt-Ansicht (Büroreinigung)
for w in (1024, 1600):
    photo = load('public/images/buero-am-morgen-2400.webp', w)
    save(lines(photo, 48 * w / 1918), f'public/images/lines/buero-am-morgen-{w}.webp')
