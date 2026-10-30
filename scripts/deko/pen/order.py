import numpy as np, cv2, json, sys, math
from PIL import Image
sys.path.insert(0, sys.argv[0].rsplit('/',1)[0])
from skel2 import build
D=sys.argv[1]; FS=600; OX=300+2; BY=900+2   # +2: Rand aus np.pad
# Startpunkt je Buchstabe von Hand (Richtung, aus der man mit dem Füller beginnt): 'tl' oben links, 'bl' unten links, 'tr', 'br', 'l' ganz links, 't' ganz oben
START=json.loads(sys.argv[3]) if len(sys.argv)>3 else {}
def angle(v): return math.atan2(v[0],v[1])
def direction(pts,frm_end):
    p=pts if not frm_end else pts[::-1]
    k=min(len(p)-1,12)
    return (p[k][0]-p[0][0],p[k][1]-p[0][1])
def order(ch):
    im=np.array(Image.open(f'{D}/{ch}.png'))[...,3]; ink=(im>110).astype(np.uint8)
    dist=cv2.distanceTransform(np.pad(ink,2),cv2.DIST_L2,5)
    sk,cl,centers,edges,A=build(ink)
    # Sporne: Kante mit freiem Ende, kürzer als 2,6 x Strichradius
    deg={}
    for e in edges:
        for k in ('a','b'):
            if e[k] is not None: deg[e[k]]=deg.get(e[k],0)+1
    def free(n): return n is None or deg.get(n,0)==1
    E=[]
    for e in edges:
        r=max(dist[p] for p in e['pts'])
        if (free(e['a'])!=free(e['b'])) and len(e['pts'])<r*2.6+6: continue
        E.append(e)
    # Startkante
    endpts=[]
    for i,e in enumerate(E):
        for side,n in (('s',e['a']),('e',e['b'])):
            if free(n): p=e['pts'][0] if side=='s' else e['pts'][-1]; endpts.append((i,side,p))
    starts=endpts if endpts else [(0,'s',None),(0,'e',None)]
    best=None
    for (i0,side,_) in starts:
        st=walk(E,i0,side)
        # dicke Striche abwärts (Füllerdruck), wenige Absetzer
        score=0
        for s_ in st:
            for k in range(1,len(s_)):
                (y0,x0),(y1,x1)=s_[k-1],s_[k]
                r=float(dist[y1,x1]); score+=(y1-y0)*(r*r)
        score-=len(st)*4000
        if best is None or score>best[0]: best=(score,st)
    strokes=best[1]
    return finish(strokes,dist,ink)
def walk(E,i0,side):
    used=set(); strokes=[]
    def take(i,rev):
        pts=E[i]['pts'][::-1] if rev else E[i]['pts']; used.add(i); return pts
    seq=take(i0,side=='e'); cur=list(seq)
    node=E[i0]['a'] if side=='e' else E[i0]['b']
    while len(used)<len(E):
        nxt=None
        if node is not None:
            vin=direction(cur,True); vin=(-vin[0],-vin[1])
            best=None
            for i,e in enumerate(E):
                if i in used: continue
                for rev,n in ((False,e['a']),(True,e['b'])):
                    if n==node:
                        vout=direction(e['pts'][::-1] if rev else e['pts'],False)
                        d=abs((angle(vout)-angle(vin)+math.pi)%(2*math.pi)-math.pi)
                        if best is None or d<best[0]: best=(d,i,rev)
            if best: nxt=best
        if nxt:
            _,i,rev=nxt; pts=take(i,rev); cur+=pts[1:]; e=E[i]; node=e['a'] if rev else e['b']
        else:
            strokes.append(cur)
            # Absetzen: nächstgelegene freie Kante (bevorzugt mit freiem Ende)
            last=cur[-1]; cand=[]
            for i,e in enumerate(E):
                if i in used: continue
                for rev in (False,True):
                    p=e['pts'][-1] if rev else e['pts'][0]
                    cand.append((math.hypot(p[0]-last[0],p[1]-last[1]),i,rev))
            _,i,rev=min(cand); pts=take(i,rev); cur=list(pts); e=E[i]; node=e['a'] if rev else e['b']
    strokes.append(cur)
    return strokes
def finish(strokes,dist,ink):
    # in em, Ursprung = Stiftposition auf der Grundlinie; Radius aus der Distanztransformation
    res=[]
    for s in strokes:
        out=[]; acc=0; last=None
        for k,(y,x) in enumerate(s):
            if last is not None: acc+=math.hypot(y-last[0],x-last[1])
            if k==0 or k==len(s)-1 or acc>=5:
                out.append([round((x-OX)/FS,4),round((y-BY)/FS,4),round(float(dist[y,x])/FS,4)]); acc=0
            last=(y,x)
        res.append(out)
    return ink,res
if __name__=='__main__':
    allres={}
    for ch in sys.argv[2]:
        ink,res=order(ch); allres[ch]=res
        vis=cv2.cvtColor((ink*40+200).astype(np.uint8),cv2.COLOR_GRAY2BGR)
        tot=sum(len(s) for s in res); k=0
        for si,s in enumerate(res):
            for (x,y,r) in s:
                t=k/max(1,tot-1); k+=1
                col=(int(255*(1-t)),40,int(255*t))
                cv2.circle(vis,(int(x*FS+300),int(y*FS+900)),3,col,-1)
            x,y,_=s[0]; cv2.putText(vis,f'{si+1}',(int(x*FS+300)-10,int(y*FS+900)-12),cv2.FONT_HERSHEY_SIMPLEX,1.2,(0,150,0),3)
        cv2.imwrite(f'{D}/ord-{ch}.png',vis[250:1150,100:1300])
    json.dump(allres,open(f'{D}/strokes.json','w'))
    print({k:[len(s) for s in v] for k,v in allres.items()})
