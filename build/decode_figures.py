#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
把 D 部分图形题解码成「区域颜色矩阵」，供站点用 SVG 重建。

几何：square16 —— 外框 + 内框(1/4~3/4) + 中十字 + 两条对角线 = 16 个面
输出：pdfbank/figdata.js
"""
import math, json, os, sys
import numpy as np
from PIL import Image
from scipy import ndimage
import pdfplumber

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(BASE, 'pdfbank', 'figdata.js')
PDF = "/Users/ollpass/Application for hkma/SHL题库 通用 补充资料/SHL题库可搜索版本v/英文带关键词可搜索.pdf"

SEGS = [
    ((0,0),(1,0)), ((1,0),(1,1)), ((1,1),(0,1)), ((0,1),(0,0)),
    ((.25,.25),(.75,.25)), ((.75,.25),(.75,.75)), ((.75,.75),(.25,.75)), ((.25,.75),(.25,.25)),
    ((.5,0),(.5,1)), ((0,.5),(1,.5)),
    ((0,0),(1,1)), ((1,0),(0,1)),
]

def _inter(p1,p2,p3,p4):
    d=(p2[0]-p1[0])*(p4[1]-p3[1])-(p2[1]-p1[1])*(p4[0]-p3[0])
    if abs(d)<1e-12: return None
    t=((p3[0]-p1[0])*(p4[1]-p3[1])-(p3[1]-p1[1])*(p4[0]-p3[0]))/d
    u=((p3[0]-p1[0])*(p2[1]-p1[1])-(p3[1]-p1[1])*(p2[0]-p1[0]))/d
    if -1e-9<=t<=1+1e-9 and -1e-9<=u<=1+1e-9:
        return (p1[0]+t*(p2[0]-p1[0]), p1[1]+t*(p2[1]-p1[1]))
    return None

def build_faces():
    pts=[[] for _ in SEGS]
    for i,(a,b) in enumerate(SEGS):
        pts[i]=[a,b]
        for j,(c,d) in enumerate(SEGS):
            if i!=j:
                p=_inter(a,b,c,d)
                if p: pts[i].append(p)
    edges=set()
    for i,(a,b) in enumerate(SEGS):
        L=math.dist(a,b); uniq=[]
        for p in pts[i]:
            if not any(math.dist(p,q)<1e-7 for q in uniq): uniq.append(p)
        uniq.sort(key=lambda p: math.dist(a,p)/L if L else 0)
        for k in range(len(uniq)-1):
            e=tuple(sorted([uniq[k],uniq[k+1]]))
            if math.dist(e[0],e[1])>1e-7: edges.add(e)
    adj={}
    for u,v in edges:
        adj.setdefault(u,[]).append(v); adj.setdefault(v,[]).append(u)
    ang=lambda u,v: math.atan2(v[1]-u[1], v[0]-u[0])
    for u in adj: adj[u].sort(key=lambda v: ang(u,v))
    used=set(); faces=[]
    for u in list(adj):
        for v in adj[u]:
            if (u,v) in used: continue
            face=[]; cu,cv=u,v
            while (cu,cv) not in used:
                used.add((cu,cv)); face.append(cu)
                nb=adj[cv]; k=nb.index(cu); cu,cv=cv,nb[(k-1)%len(nb)]
            if len(face)>=3:
                area=sum(face[i][0]*face[(i+1)%len(face)][1]-face[(i+1)%len(face)][0]*face[i][1]
                         for i in range(len(face)))/2
                if area>1e-9: faces.append(face)
    return faces

FACES = build_faces()
INNER = []
for f in FACES:
    A=0;cx=0;cy=0
    for i in range(len(f)):
        x1,y1=f[i]; x2,y2=f[(i+1)%len(f)]
        c=x1*y2-x2*y1; A+=c; cx+=(x1+x2)*c; cy+=(y1+y2)*c
    A*=0.5
    INNER.append((cx/(6*A), cy/(6*A)))


def components(img):
    """连通域检测：膨胀只用于连通，bbox 仍取原始像素范围，避免 bbox 被撑大"""
    arr=np.array(img.convert('RGB'))
    mask=(arr.astype(int).sum(axis=2) < 735)
    lbl,n=ndimage.label(ndimage.binary_dilation(mask, iterations=2))
    out=[]
    for i in range(1,n+1):
        sel = (lbl==i) & mask          # 关键：只用原始非白像素算 bbox
        ys,xs=np.where(sel)
        if len(xs)<400: continue
        out.append((int(xs.min()),int(ys.min()),int(xs.max()),int(ys.max()),len(xs)))
    return out


def classify(img, box, faces):
    x0,y0,x1,y1=box; W,H=x1-x0,y1-y0
    res=[]
    for (cx,cy) in INNER:
        X,Y=x0+cx*W, y0+cy*H
        s=[img.getpixel((int(X+dx),int(Y+dy)))
           for dx in range(-2,3) for dy in range(-2,3)
           if 0<=int(X+dx)<img.width and 0<=int(Y+dy)<img.height]
        if not s: res.append('?'); continue
        r=sum(p[0] for p in s)/len(s); g=sum(p[1] for p in s)/len(s); b=sum(p[2] for p in s)/len(s)
        if r>232 and g>232 and b>232: res.append('w')
        elif g>r+18 and g>b+28:   res.append('g')
        else:                      res.append('c')
    return res


def main():
    data={}
    with pdfplumber.open(PDF) as pdf:
        for pno in range(59, 74):
            pg=pdf.pages[pno-1]
            lines=pg.extract_text_lines()
            ans=next((l for l in lines if l['text'].strip().startswith('Answer:')), None)
            num=next((l for l in lines if l['text'].strip()[:2].strip().rstrip('.').isdigit()), None)
            if not ans: continue
            no=None
            m=None
            for l in lines:
                import re
                mm=re.match(r'^(\d+)\.', l['text'].strip())
                if mm: no=int(mm.group(1)); break
            above=[i for i in pg.images if i['bottom']<=ans['top']+2]
            below=[i for i in pg.images if i['top']>ans['top']]
            if not above: continue

            ub=(min(i['x0'] for i in above)-3, min(i['top'] for i in above)-3,
                max(i['x1'] for i in above)+3, max(i['bottom'] for i in above)+3)
            qimg=pg.crop(ub).to_image(resolution=400).original
            comps=[c for c in components(qimg) if abs((c[2]-c[0])-(c[3]-c[1]))<12 and (c[2]-c[0])>60]
            comps.sort(key=lambda c:(c[1],c[0]))
            if len(comps)<3: 
                print(f"  p{pno}: 只找到 {len(comps)} 个正方形组件，跳过")
                continue
            seq=[classify(qimg,(c[0],c[1],c[2],c[3]),FACES) for c in comps[:3]]

            ansf=None
            if below:
                bb=(min(i['x0'] for i in below)-3, min(i['top'] for i in below)-3,
                    max(i['x1'] for i in below)+3, max(i['bottom'] for i in below)+3)
                aimg=pg.crop(bb).to_image(resolution=400).original
                ac=[c for c in components(aimg) if abs((c[2]-c[0])-(c[3]-c[1]))<14]
                if ac:
                    big=max(ac,key=lambda c:c[4])
                    ansf=classify(aimg,(big[0],big[1],big[2],big[3]),FACES)

            data[f"PDF{no}"]={'geo':'square16','seq':seq,'ans':ansf}
            print(f"  PDF{no:02d}  seq={[''.join(s) for s in seq]}  ans={''.join(ansf) if ansf else '-'}")

    with open(OUT,'w',encoding='utf-8') as f:
        f.write('window.FIGDATA = ')
        json.dump(data,f,ensure_ascii=False)
        f.write(';\n')
    print(f"\n输出 {len(data)} 题 → {OUT}")

if __name__=='__main__':
    main()
