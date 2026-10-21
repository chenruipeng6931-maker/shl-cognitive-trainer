#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""从答案时间轴自动生成 schedules 配置片段"""
import sys, json
import numpy as np
from PIL import Image

def classify(rgb):
    r,g,b = [int(v) for v in rgb]
    if r>238 and g>238 and b>238: return 'w'
    mx,mn = max(r,g,b), min(r,g,b)
    if mx-mn < 26: return 'x'
    if b>150 and b>r+40 and b>g+30: return 'b'
    if g>80 and g>r+25 and g>b+25: return 'g'
    if r>200 and g>110 and b<120: return 'o'
    if g>170 and b>170 and r<140: return 'c'
    return '?'

def decode(path, n):
    a = np.array(Image.open(path).convert('RGB'))
    mx=a.max(axis=2).astype(int); mn=a.min(axis=2).astype(int)
    sat=((mx-mn>40)&(a.sum(axis=2)<720))
    row=int(np.argmax(sat.sum(axis=1)))
    # 往下挪到色块中部
    for dy in (6,8,10,12,4,2,0):
        if row+dy < a.shape[0] and sat[row+dy].sum()>0:
            row=row+dy; break
    xs=np.where(a[row].sum(axis=1)<720)[0]
    x0,x1=xs.min(),xs.max()
    out=[]
    for i in range(n):
        cx=int(x0+(x1-x0)/n*(i+0.5))
        patch=a[row, max(0,cx-2):cx+3].reshape(-1,3)
        out.append(classify(np.median(patch,axis=0)))
    return ''.join(out)

def build(codes, start, tasks):
    """把颜色串转成 busy 段与 answer 映射"""
    step=0.5
    busy=[]; i=0
    while i < len(codes):
        if codes[i]=='x':
            j=i
            while j<len(codes) and codes[j]=='x': j+=1
            busy.append({'start': round(start+i*step,2), 'len': round((j-i)*step,2)})
            i=j
        else: i+=1
    col2task={'b':0,'g':1,'o':2,'c':3}
    ans={}
    for i,ch in enumerate(codes):
        if ch in col2task:
            k=col2task[ch]
            if k < len(tasks) and tasks[k]['id'] not in ans:
                ans[tasks[k]['id']]=round(start+i*step,2)
    return busy, ans

if __name__=='__main__':
    cfg=json.load(open(sys.argv[1]))
    for c in cfg:
        codes=decode(c['img'], c['n'])
        busy,ans=build(codes, c['start'], c['tasks'])
        print(f"\n// {c['id']}  {codes}")
        print(json.dumps({'dayStart':c['start'],'dayEnd':c['start']+c['n']*0.5,
                          'busy':busy,'tasks':c['tasks'],'answer':ans},
                         ensure_ascii=False, indent=2))
