"""
Wolkenebenen für den Übergang „Wolken“ (Referenz: ERA, era/05): weiße, weich schattierte Wolken mit Transparenz,
aus mehrstufigem Rauschen erzeugt (keine Fremdbilder). Dazu die Eck-Pflanze aus bilder/mappe/mappe-pflanze.png,
zugeschnitten. Aufruf: python3 scripts/clouds.py  (numpy, opencv-python-headless, Pillow)
"""
import numpy as np, cv2
from PIL import Image

rng = np.random.default_rng(7)


def fbm(h, w, octaves=6, base=4):
    out = np.zeros((h, w), np.float32)
    amp, tot = 1.0, 0.0
    for o in range(octaves):
        s = base * 2 ** o
        g = rng.random((s + 1, int(s * w / h) + 1)).astype(np.float32)
        out += cv2.resize(g, (w, h), interpolation=cv2.INTER_CUBIC) * amp
        tot += amp
        amp *= 0.55
    return out / tot


def layer(w, h, cover, seed_shift, bottom_heavy):
    n = fbm(h, w)
    n = (n - n.min()) / (n.max() - n.min())
    yy = np.linspace(0, 1, h)[:, None]
    # dichter am unteren bzw. oberen Rand, frei in der Mitte
    bias = (yy ** 1.6) if bottom_heavy else ((1 - yy) ** 1.6)
    d = n * 0.75 + bias * 0.55 - (1 - cover)
    a = np.clip(d * 3.2, 0, 1) ** 1.3
    a = cv2.GaussianBlur(a, (0, 0), 3)
    # Schattierung: Unterseite der Wolken leicht grau-blau
    shade = cv2.GaussianBlur(n, (0, 0), 6)
    rgb = np.stack([235 + 20 * shade, 240 + 15 * shade, 248 + 7 * shade], -1)
    rgb = np.clip(rgb, 0, 255)
    img = np.dstack([rgb, a * 255]).astype(np.uint8)
    return Image.fromarray(img, 'RGBA')


for i, (cover, bottom) in enumerate([(0.62, True), (0.55, False), (0.5, True)]):
    im = layer(1600, 900, cover, i, bottom)
    im.save(f'public/images/deko/wolken-{i + 1}.webp', 'WEBP', quality=72, method=6)
    print('wolken', i + 1)

p = Image.open('bilder/mappe/mappe-pflanze.png').convert('RGBA')
bb = p.getchannel('A').point(lambda v: 255 if v > 40 else 0).getbbox()
p = p.crop(bb)
p.thumbnail((900, 900), Image.LANCZOS)
p.save('public/images/deko/pflanze-ecke.webp', 'WEBP', quality=80, method=6)
print('pflanze', p.size)
