#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""从答案图里解码饼图各扇区占比（按色相分类，抗色差）"""
import sys, json
import numpy as np
from PIL import Image
import colorsys

def classify(r, g, b):
    h, s, v = colorsys.rgb_to_hsv(r/255, g/255, b/255)
    if s < 0.18 or v < 0.25:      # 灰/白/黑
        return None
    hd = h * 360
    if 15 <= hd < 50:   return 'orange'
    if 50 <= hd < 150:  return 'green'
    if 150 <= hd < 190: return 'teal'
    if 190 <= hd < 260: return 'blue'
    if 260 <= hd < 320: return 'purple'
    return 'red'                   # 320-360 与 0-15

def decode(path):
    a = np.array(Image.open(path).convert('RGB')).astype(int)
    H, W, _ = a.shape
    counts = {}
    step = 2
    for y in range(0, H, step):
        for x in range(0, W, step):
            c = classify(*a[y, x])
            if c: counts[c] = counts.get(c, 0) + 1
    total = sum(counts.values())
    if not total: return None
    items = [(k, v/total*100) for k, v in counts.items() if v/total > 0.03]
    items.sort(key=lambda t: -t[1])
    return items

if __name__ == '__main__':
    r = decode(sys.argv[1])
    print(" | ".join(f"{n}={p:.0f}%" for n, p in r) if r else "FAIL")
