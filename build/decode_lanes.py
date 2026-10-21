#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""从题目图里识别多条时间轴，逐格判定 空闲/占用 并输出配置片段"""
import sys, json
import numpy as np
from PIL import Image


def axis_rows(a):
    """灰块所在的行区间 = 每条轴"""
    R, G, B = a[:, :, 0], a[:, :, 1], a[:, :, 2]
    gray = (abs(R - G) < 14) & (abs(G - B) < 14) & (R > 150) & (R < 190)
    cnt = gray.sum(axis=1)
    segs, run = [], None
    for y in range(a.shape[0]):
        if cnt[y] > 8:
            if run is None: run = [y, y]
            else: run[1] = y
        else:
            if run and run[1] - run[0] >= 30: segs.append(tuple(run))
            run = None
    if run and run[1] - run[0] >= 30: segs.append(tuple(run))
    return segs


def axis_span(a, y):
    """轴的水平范围：只取「亮」像素（白/灰），排除深色背景与深色文字"""
    row = a[y]
    bright = row.min(axis=1) > 140
    xs = np.where(bright)[0]
    if len(xs) == 0: return None
    # 找最长的一段连续亮区，避免左侧标题干扰
    runs, start = [], xs[0]
    for i in range(1, len(xs)):
        if xs[i] != xs[i-1] + 1:
            runs.append((start, xs[i-1])); start = xs[i]
    runs.append((start, xs[-1]))
    runs.sort(key=lambda r: r[1]-r[0], reverse=True)
    return runs[0]


def sample(a, y, x0, x1, n):
    codes = []
    for i in range(n):
        cx = int(x0 + (x1 - x0) / n * (i + 0.5))
        # 取格中心附近一小块，用众数抗噪
        ys = range(max(0, y-6), min(a.shape[0], y+7))
        xs = range(max(0, cx-4), min(a.shape[1], cx+5))
        vals = np.array([a[yy, xx] for yy in ys for xx in xs])
        med = np.median(vals, axis=0)
        if med.min() > 200: codes.append('w')
        elif abs(med[0]-med[1]) < 16 and abs(med[1]-med[2]) < 16 and 140 < med[0] < 200:
            codes.append('x')
        else:
            codes.append('w')
    return ''.join(codes)


def to_busy(codes, start):
    busy, i = [], 0
    while i < len(codes):
        if codes[i] == 'x':
            j = i
            while j < len(codes) and codes[j] == 'x': j += 1
            busy.append({'start': round(start + i*0.5, 2), 'len': round((j-i)*0.5, 2)})
            i = j
        else:
            i += 1
    return busy


def decode(path, n, start, names, slot_len, answer=None):
    a = np.array(Image.open(path).convert('RGB'))
    segs = axis_rows(a)
    lanes = []
    for k, (y0, y1) in enumerate(segs[:len(names)]):
        y = (y0 + y1) // 2
        sp = axis_span(a, y)
        if not sp: continue
        codes = sample(a, y, sp[0], sp[1], n)
        lanes.append({
            'name': names[k],
            'busy': to_busy(codes, start),
            'editable': k == len(names) - 1
        })
    return {
        'mode': 'lanes',
        'dayStart': start,
        'dayEnd': start + n * 0.5,
        'lanes': lanes,
        'slotLen': slot_len,
        'answer': answer
    }


if __name__ == '__main__':
    cfg = json.load(open(sys.argv[1]))
    out = {}
    for c in cfg:
        out[c['id']] = decode(c['img'], c['n'], c['start'], c['names'], c['slotLen'], c.get('answer'))
        print(f"{c['id']}: " + " | ".join(
            f"{l['name']}=" + ''.join('x' if b else 'w' for b in [False]) for l in out[c['id']]['lanes']))
    json.dump(out, open(sys.argv[2], 'w'), ensure_ascii=False, indent=1)
    print("→", sys.argv[2])
