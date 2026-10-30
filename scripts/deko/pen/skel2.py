import numpy as np, cv2, json, sys, math
from PIL import Image
sys.path.insert(0, sys.argv[0].rsplit('/',1)[0])
from skel import thin
D=sys.argv[1]
N8=[(-1,0),(-1,1),(0,1),(1,1),(1,0),(1,-1),(0,-1),(-1,-1)]  # im Uhrzeigersinn ab Norden
def crossing(sk,y,x):
    v=[sk[y+dy,x+dx] for dy,dx in N8]
    return sum(1 for i in range(8) if v[i]==0 and v[(i+1)%8]==1), sum(v)
def build(ink):
    sk=thin(ink); sk=np.pad(sk,2)
    ys,xs=np.nonzero(sk)
    A={};Bn={}
    for y,x in zip(ys,xs):
        A[(y,x)],Bn[(y,x)]=crossing(sk,y,x)
    isnode={p:(A[p]!=2) for p in A}
    # Knoten-Cluster
    lab={}; cl=[]
    for p in A:
        if not isnode[p] or p in lab: continue
        stack=[p]; lab[p]=len(cl); mem=[p]
        while stack:
            q=stack.pop()
            for dy,dx in N8:
                r=(q[0]+dy,q[1]+dx)
                if r in A and isnode[r] and r not in lab: lab[r]=len(cl); mem.append(r); stack.append(r)
        cl.append(mem)
    nbs=lambda p:[(p[0]+dy,p[1]+dx) for dy,dx in N8 if (p[0]+dy,p[1]+dx) in A]
    visited=set(); edges=[]
    for ci,mem in enumerate(cl):
        for m in mem:
            for q in nbs(m):
                if isnode[q] or q in visited: continue
                path=[m,q]; visited.add(q); cur=q
                end=None
                while True:
                    cand=[r for r in nbs(cur) if r not in visited and r!=path[-2]]
                    nodec=[r for r in cand if isnode[r] and lab[r]!=ci or (isnode[r] and len(path)>8)]
                    if nodec: end=nodec[0]; path.append(end); break
                    cand=[r for r in cand if not isnode[r]]
                    if not cand: break
                    # 4-Nachbarn zuerst (Treppenstufen)
                    cand.sort(key=lambda r: abs(r[0]-cur[0])+abs(r[1]-cur[1]))
                    cur=cand[0]; visited.add(cur); path.append(cur)
                edges.append({'a':ci,'b':lab[end] if end else None,'pts':path})
    # reine Schleifen ohne Knoten
    rest=[p for p in A if not isnode[p] and p not in visited]
    while rest:
        p=rest[0]; path=[p]; visited.add(p); cur=p
        while True:
            cand=[r for r in nbs(cur) if r not in visited]
            if not cand: break
            cur=cand[0]; visited.add(cur); path.append(cur)
        path.append(p); edges.append({'a':None,'b':None,'pts':path})
        rest=[q for q in rest if q not in visited]
    centers=[tuple(np.mean(m,axis=0)) for m in cl]
    return sk,cl,centers,edges,A
if __name__=='__main__':
    for ch in sys.argv[2]:
        im=np.array(Image.open(f'{D}/{ch}.png'))[...,3]; ink=(im>110).astype(np.uint8)
        sk,cl,centers,edges,A=build(ink)
        ends=sum(1 for m in cl if len(m)==1 and A[m[0]]==1)
        print(ch,'pixels',len(A),'clusters',len(cl),'endpoints',ends,'edges',len(edges),'kurz',sum(1 for e in edges if len(e['pts'])<15))
