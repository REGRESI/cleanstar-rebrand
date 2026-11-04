# Papierkante für das Handy als Bildfolge: python3 scripts/deko/papierkante-serie.py <Papierfarbe hex> <Anzahl> <Ausgabeordner>
# Gleiches Verfahren wie papierkante.py (Rausch-Oktaven, heller ausgefranster Faserrand, kurze Fasern), aber
#  - die Form wandert: die Stützpunkte jeder Oktave gleiten weich von einem Satz zum nächsten (Bild i bei t = i/(n-1)),
#    benachbarte Bilder unterscheiden sich nur leicht; überblendet wirkt die Kante lebendig
#  - der weiche Schatten ist eingerechnet (am Handy kein CSS-Filter nötig)
#  - 1200 px breit für 115 vw am Handy (etwa 2,6-fach), Spannweite der Kante für die schmale Breite angepasst
import numpy as np, sys, os
from PIL import Image, ImageFilter
col_hex = sys.argv[1] if len(sys.argv) > 1 else 'f7f9fb'
N = int(sys.argv[2]) if len(sys.argv) > 2 else 10
out_dir = sys.argv[3] if len(sys.argv) > 3 else 'public/images/deko/papierkante-mobil'
os.makedirs(out_dir, exist_ok=True)
W, H = 1200, 300
rng = np.random.default_rng(11)
OCT = ((620, 62), (260, 30), (110, 12), (40, 5), (14, 2.2), (5, 1.0))
# je Oktave zwei Stützpunkt-Sätze A und B; Bild i liegt bei t = i/(N-1) auf dem Weg A -> B (Kosinus-Überblendung)
sets = [(rng.uniform(-1, 1, int(W / wl) + 3), rng.uniform(-1, 1, int(W / wl) + 3)) for wl, _ in OCT]
def noise_from(pts, wl):
    xs = np.arange(W) / wl
    i = np.floor(xs).astype(int); f = xs - i; f = f * f * (3 - 2 * f)
    return pts[i] * (1 - f) + pts[i + 1] * f
def noise1d(n, wl, r):
    k = int(n / wl) + 3
    pts = r.uniform(-1, 1, k)
    xs = np.arange(n) / wl
    i = np.floor(xs).astype(int); f = xs - i; f = f * f * (3 - 2 * f)
    return pts[i] * (1 - f) + pts[i + 1] * f
col = np.array([int(col_hex[i:i + 2], 16) for i in (0, 2, 4)], np.float32)
Y = np.arange(H)[:, None]
for n in range(N):
    t = n / max(1, N - 1)
    k = 0.5 - 0.5 * np.cos(np.pi * t)
    edge = np.zeros(W)
    for (wl, amp), (A, B) in zip(OCT, sets):
        edge += amp * noise_from(A * (1 - k) + B * k, wl)
    edge = edge + 110  # Mittellage; Spannweite etwa ±100 px (am Handy rund ±40 CSS-Pixel)
    r = np.random.default_rng(100 + n)  # Faserrand und Fasern je Bild leicht anders (lebendig, ohne Sprung)
    d = Y - edge[None, :]
    paper = np.clip(0.5 - d, 0, 1)
    rimw = 12 + 5 * noise1d(W, 60, r) + 2.5 * noise1d(W, 11, r)
    fray = np.zeros((H, W))
    for wl, a in ((1.6, 0.55), (3.2, 0.3), (7, 0.15)):
        g = r.uniform(0, 1, (int(H / wl) + 3, int(W / wl) + 3))
        fray += a * np.array(Image.fromarray((g * 255).astype(np.uint8)).resize((W + int(wl * 3), H + int(wl * 3)), Image.BICUBIC))[:H, :W] / 255
    tt = d / rimw[None, :]
    edgev = tt - 0.55 * (fray - 0.5)
    rim = np.clip(1.15 - edgev, 0, 1) ** 1.6 * (d > -1)
    rim = rim * (d < rimw[None, :] * 1.9)
    hair = np.zeros((H, W))
    for _ in range(260):
        x0 = r.integers(0, W); y0 = edge[x0] + rimw[x0] * r.uniform(0.5, 1.1)
        ln = r.uniform(2, 7); ang = r.uniform(-1.1, 1.1) + np.pi / 2
        for s_ in np.linspace(0, ln, int(ln * 3)):
            xx = int(x0 + np.cos(ang) * s_); yy = int(y0 + np.sin(ang) * s_)
            if 0 <= xx < W and 0 <= yy < H: hair[yy, xx] = max(hair[yy, xx], 0.6 * (1 - s_ / ln) + 0.1)
    hair = np.array(Image.fromarray((hair * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.5))) / 255
    alpha = np.clip(np.maximum(paper, np.maximum(rim, hair * 0.9)), 0, 1)
    rgbw = np.clip(np.maximum(rim, hair) * (d > 0) * 1.0, 0, 1)[..., None]
    rgb = col * (1 - rgbw) + np.array([255, 255, 255]) * rgbw
    shade = np.clip(1 - np.abs(d + 3) / 3, 0, 1) * 0.05
    rgb = rgb * (1 - shade[..., None])
    # Schatten wie am Desktop (drop-shadow 0 10px 14px / 0,3 und 0 2px 3px / 0,18), hier in das Bild gerechnet
    a8 = Image.fromarray((alpha * 255).astype(np.uint8))
    def sh(dy, blur, op):
        s = Image.new('L', (W, H), 0); s.paste(a8, (0, dy))
        return np.array(s.filter(ImageFilter.GaussianBlur(blur))) / 255 * op
    shadow = 1 - (1 - sh(26, 18, 0.3)) * (1 - sh(5, 4, 0.18))
    # nur unterhalb des Blatts sichtbar; oberhalb der Kante deckt das Papier
    sa = shadow * (1 - alpha)
    out_a = alpha + sa
    sc = np.array([10, 26, 51], np.float32)
    out_rgb = (rgb * alpha[..., None] + sc * sa[..., None]) / np.maximum(out_a[..., None], 1e-6)
    out = np.dstack([out_rgb, np.clip(out_a, 0, 1) * 255]).astype(np.uint8)
    # oben 3 px abschneiden (Überlappung mit dem Blatt, wie am Desktop)
    img = Image.fromarray(out[3:])
    img.save(os.path.join(out_dir, f'kante-{n:02d}.webp'), 'WEBP', quality=82, method=6)
print('gespeichert', N, 'Bilder in', out_dir, 'Höhe', H - 3)
