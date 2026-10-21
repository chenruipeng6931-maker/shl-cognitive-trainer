#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""把 A 类的答案时间轴解码成「每格颜色序列」"""
import sys
import numpy as np
from PIL import Image

def classify(rgb):
    r,g,b = [int(v) for v in rgb]
    if r>238 and g>238 and b>238: return 'w'          # 白
    mx,mn = max(r,g,b), min(r,g,b)
    if mx-mn < 26: return 'x'                          # 灰
    if b>150 and b>r+40 and b>g+30: return 'b'         # 蓝
    if g>r+30 and g>b+30: return 'g'                   # 绿
    if r>200 and g>120 and b<110: return 'o'           # 橙
    if g>170 and b>170 and r<140: return 'c'           # 青
    return '?'

def decode(path, n, row=None):
    im = Image.open(path).convert('RGB')
    a = np.array(im)
    H,W,_ = a.shape
    # 找彩色区域所在行：非白像素最多的一行
    nonwhite = (a.sum(axis=2) < 720)
    if row is None:
        counts = nonwhite.sum(axis=1)
        row = int(np.argmax(counts)) + 3
    # 该行非白像素的 x 范围
    xs = np.where(nonwhite[row])[0]
    if len(xs)==0: return None
    x0,x1 = xs.min(), xs.max()
    step = (x1-x0)/n
    out=[]
    for i in range(n):
        cx = int(x0 + step*(i+0.5))
        cy = row
        # 取小块中位数，抗噪
        patch = a[max(0,cy-2):cy+3, max(0,cx-2):cx+3].reshape(-1,3)
        med = np.median(patch, axis=0)
        out.append(classify(med))
    return ''.join(out), (x0,x1,row)

if __name__ == '__main__':
    path, n = sys.argv[1], int(sys.argv[2])
    r = decode(path, n)
    print(r[0] if r else 'FAIL', r[1] if r else '')
