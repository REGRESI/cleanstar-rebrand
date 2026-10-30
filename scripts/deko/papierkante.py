# Papierkante (gerissen, mit Faserrand) prozedural erzeugen: python3 scripts/deko/papierkante.py <Papierfarbe hex> <Seed> <Ausgabe.png>
# Kante aus mehreren Rausch-Oktaven (keine sichtbare Wiederholung), dichter heller Faserrand mit ausgefranster Außenkante,
# wenige kurze Fasern. Schatten kommt per CSS (drop-shadow). Ergebnis 3840 px breit (2x für 1920).
import numpy as np, sys
from PIL import Image, ImageFilter
rng=np.random.default_rng(int(sys.argv[2]) if len(sys.argv)>2 else 7)
W,H=3840,420
x=np.arange(W)
def noise1d(n,wl,rng):
    k=int(n/wl)+3
    pts=rng.uniform(-1,1,k)
    xs=np.arange(n)/wl
    i=np.floor(xs).astype(int); f=xs-i
    f=f*f*(3-2*f)
    return pts[i]*(1-f)+pts[i+1]*f
edge=np.zeros(W)
for wl,amp in ((1700,250),(700,120),(280,40),(95,13),(34,5),(11,2.4),(4,1.1)):
    edge+=amp*noise1d(W,wl,rng)
edge=edge-edge.min()+40   # Kante zwischen 40 und ~ 40+Spannweite
print('span',edge.max()-edge.min())
Y=np.arange(H)[:,None]
ss=4  # Kantenglättung
d=Y-edge[None,:]           # >0 unter der Kante
paper=np.clip(0.5-d,0,1)   # 1 über der Kante, weicher Übergang 1px
# Faserrand: dichtes, helles Band, Außenkante fein ausgefranst (Rauschen in hoher Frequenz)
rimw=14+6*noise1d(W,70,rng)+3.5*noise1d(W,13,rng)
fray=np.zeros((H,W))
for wl,a in ((1.6,0.55),(3.2,0.3),(7,0.15)):
    g=rng.uniform(0,1,(int(H/wl)+3,int(W/wl)+3))
    fray+=a*np.array(Image.fromarray((g*255).astype(np.uint8)).resize((W+int(wl*3),H+int(wl*3)),Image.BICUBIC))[:H,:W]/255
t=d/rimw[None,:]
# innen deckend, nach außen auslaufend; das Ausfransen verschiebt die Grenze je Pixel
edgev=t-0.55*(fray-0.5)
rim=np.clip(1.15-edgev,0,1)**1.6*(d>-1)
rim=rim*(d<rimw[None,:]*1.9)
# wenige kurze, feine Fasern
hair=np.zeros((H,W))
for _ in range(700):
    x0=rng.integers(0,W); y0=edge[x0]+rimw[x0]*rng.uniform(0.5,1.1)
    ln=rng.uniform(2,8); ang=rng.uniform(-1.1,1.1)+np.pi/2
    for s_ in np.linspace(0,ln,int(ln*3)):
        xx=int(x0+np.cos(ang)*s_); yy=int(y0+np.sin(ang)*s_)
        if 0<=xx<W and 0<=yy<H: hair[yy,xx]=max(hair[yy,xx],0.6*(1-s_/ln)+0.1)
hair=np.array(Image.fromarray((hair*255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.5)))/255
alpha=np.clip(np.maximum(paper,np.maximum(rim,hair*0.9)),0,1)
col=np.array([int(sys.argv[1][i:i+2],16) for i in (0,2,4)],np.float32)
# Faserrand etwas heller als das Papier (weiß), leichte Tiefe direkt an der Kante
rgbw=np.clip(np.maximum(rim,hair)*(d>0)*1.0,0,1)[...,None]
rgb=col*(1-rgbw)+np.array([255,255,255])*rgbw
# feine Schattierung: Papier direkt über der Kante minimal dunkler (Dicke des Papiers)
shade=np.clip(1-np.abs(d+3)/3,0,1)*0.05
rgb=rgb*(1-shade[...,None])
out=np.dstack([rgb,alpha*255]).astype(np.uint8)
ymax=int(edge.max()+rimw.max()+26)
Image.fromarray(out[:ymax]).save(sys.argv[3])
print('saved',out[:ymax].shape)
