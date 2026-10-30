import numpy as np, cv2, json, sys, math
from PIL import Image
D=sys.argv[1]; FS=600; OX=300; BY=900
def thin(img):
    img=img.copy().astype(np.uint8)
    changed=True
    while changed:
        changed=False
        for step in (0,1):
            P=np.pad(img,1)
            p2=P[:-2,1:-1];p3=P[:-2,2:];p4=P[1:-1,2:];p5=P[2:,2:];p6=P[2:,1:-1];p7=P[2:,:-2];p8=P[1:-1,:-2];p9=P[:-2,:-2]
            B=p2+p3+p4+p5+p6+p7+p8+p9
            seq=[p2,p3,p4,p5,p6,p7,p8,p9,p2]
            A=sum(((seq[i]==0)&(seq[i+1]==1)).astype(np.uint8) for i in range(8))
            if step==0: c=(p2*p4*p6==0)&(p4*p6*p8==0)
            else: c=(p2*p4*p8==0)&(p2*p6*p8==0)
            m=(img==1)&(B>=2)&(B<=6)&(A==1)&c
            if m.any(): img[m]=0; changed=True
    return img
N8=[(-1,-1),(-1,0),(-1,1),(0,-1),(0,1),(1,-1),(1,0),(1,1)]
def graph(sk):
    ys,xs=np.nonzero(sk); pts=set(zip(ys.tolist(),xs.tolist()))
    nb=lambda p:[(p[0]+dy,p[1]+dx) for dy,dx in N8 if (p[0]+dy,p[1]+dx) in pts]
    deg={p:len(nb(p)) for p in pts}
    nodes={p for p in pts if deg[p]!=2}
    edges=[]; used=set()
    for n in nodes:
        for q in nb(n):
            if (n,q) in used: continue
            path=[n,q]; used.add((n,q)); prev=n; cur=q
            while cur not in nodes:
                nx=[r for r in nb(cur) if r!=prev and not (r in nodes and r==path[0] and len(path)<3)]
                # bevorzugt orthogonal/gerade weiter
                if not nx: break
                nxt=nx[0]
                prev,cur=cur,nxt; path.append(cur)
                if len(path)>20000: break
            used.add((path[-1],path[-2]))
            edges.append(path)
    # pure loops without nodes
    return nodes,edges,deg
def run(ch,start_hint=None):
    im=np.array(Image.open(f'{D}/{ch}.png'))[...,3]
    ink=(im>110).astype(np.uint8)
    dist=cv2.distanceTransform(ink,cv2.DIST_L2,5)
    sk=thin(ink)
    nodes,edges,deg=graph(sk)
    # Sporne entfernen: kurze Kanten an Endpunkten
    def elen(e): return len(e)
    ends=lambda p: deg.get(p,0)==1
    keep=[]
    for e in edges:
        a,b=e[0],e[-1]
        r=max(dist[a],dist[b],dist[e[len(e)//2]])
        if (ends(a) or ends(b)) and elen(e)<r*2.2+4 and not (ends(a) and ends(b)): continue
        keep.append(e)
    # doppelte (umgekehrte) Kanten entfernen
    seen=set(); E=[]
    for e in keep:
        k=(e[0],e[-1],len(e)) ; k2=(e[-1],e[0],len(e))
        if k in seen or k2 in seen: continue
        seen.add(k); E.append(e)
    return ink,dist,E
if __name__=='__main__':
    out={}
    for ch in sys.argv[2]:
        ink,dist,E=run(ch)
        out[ch]=len(E)
        vis=cv2.cvtColor((ink*60+180).astype(np.uint8),cv2.COLOR_GRAY2BGR)
        for i,e in enumerate(E):
            col=tuple(int(c) for c in np.random.default_rng(i).integers(0,200,3))
            for (y,x) in e: cv2.circle(vis,(x,y),2,col,-1)
            cv2.putText(vis,str(i),(e[len(e)//2][1],e[len(e)//2][0]),cv2.FONT_HERSHEY_SIMPLEX,1,col,2)
        cv2.imwrite(f'{D}/skel-{ch}.png',vis[250:1150,100:1300])
    print(out)
