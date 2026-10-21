#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
从 PDF 题库中自动切题，生成站点用的 pdfbank.js。

两种模式自动判定：
  · 图形题（D/E/F）："Answer:" 下方有图片 → 题目区/答案区各裁一张图
  · 文字题（A/B/C）："Answer:" 下方是文字   → 抽题干文字 + 解析文字（比截图清晰）

用法：
    python3 build/extract.py "<PDF 路径>" [起始页] [结束页]
"""
import sys, os, re, json
import pdfplumber

DPI = 220
OUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'pdfbank')

SECTIONS = [(2, 24, 'A'), (25, 36, 'B'), (37, 58, 'C'), (59, 73, 'D'), (74, 75, 'E'), (76, 78, 'F')]
SECTION_NAMES = {
    'A': {'zh': '日程规划', 'en': 'Calendar & planning'},
    'B': {'zh': '贴标签', 'en': 'Tagging'},
    'C': {'zh': '图表分析', 'en': 'Chart analysis'},
    'D': {'zh': '序列填图', 'en': 'Fill the sequence'},
    'E': {'zh': '连线题', 'en': 'Connect the line'},
    'F': {'zh': '组合变化', 'en': 'Button combination'},
}
HEADER_RE = re.compile(r'^SHL Cognitive Ability assessment')


def section_of(pno):
    for a, b, name in SECTIONS:
        if a <= pno <= b:
            return name
    return '?'


def clean_lines(txt):
    out = []
    for ln in (txt or '').split('\n'):
        ln = ln.strip()
        if not ln or HEADER_RE.match(ln):
            continue
        out.append(ln)
    return out


def main():
    if len(sys.argv) < 2:
        print(__doc__); sys.exit(1)
    pdf_path = sys.argv[1]
    start = int(sys.argv[2]) if len(sys.argv) > 2 else 2
    end = int(sys.argv[3]) if len(sys.argv) > 3 else 76

    os.makedirs(OUT_DIR, exist_ok=True)
    items, skipped = [], []

    with pdfplumber.open(pdf_path) as pdf:
        for pno in range(start, end + 1):
            if pno > len(pdf.pages):
                break
            pg = pdf.pages[pno - 1]
            W, H = pg.width, pg.height
            lines = pg.extract_text_lines()

            num_line = ans_line = None
            for ln in lines:
                t = ln['text'].strip()
                if num_line is None and re.match(r'^\d+\.', t):
                    num_line = ln
                if t.startswith('Answer:'):
                    ans_line = ln
            if not ans_line:
                skipped.append((pno, '没有 Answer: 锚点'))
                continue

            sec = section_of(pno)
            no, keyword = None, ''
            if num_line:
                m = re.match(r'^(\d+)\.', num_line['text'].strip())
                if m: no = int(m.group(1))
                km = re.search(r'本题关键词\s*(\S+)', num_line['text'])
                if km: keyword = km.group(1)

            q_top = (num_line['top'] - 6) if num_line else max(55, ans_line['top'] - 260)
            imgs_below = [im for im in pg.images if im['top'] > ans_line['top']]
            imgs_above = [im for im in pg.images if im['bottom'] <= ans_line['top'] + 2]

            tag = f"{pno:03d}"
            item = {
                'id': (f"PDF{no:02d}" if no else f"P{tag}"),
                'no': no, 'page': pno, 'section': sec,
                'sectionName': SECTION_NAMES.get(sec, {'zh': sec, 'en': sec}),
                'keyword': keyword,
            }

            # ---- 统一策略：题目图 + 答案图 + 题目文字 + 答案文字，有就拿 ----
            def union_box(ims, pad=5):
                return (max(6, min(i['x0'] for i in ims) - pad),
                        max(6, min(i['top'] for i in ims) - pad),
                        min(W - 6, max(i['x1'] for i in ims) + pad),
                        min(H - 6, max(i['bottom'] for i in ims) + pad))

            if imgs_above:
                box = union_box(imgs_above)
                if box[3] - box[1] > 20:
                    pg.crop(box).to_image(resolution=DPI).save(os.path.join(OUT_DIR, f"q-{tag}.png"))
                    item['qImg'] = f"pdfbank/q-{tag}.png"

            if imgs_below:
                box = union_box(imgs_below)
                if box[3] - box[1] > 20:
                    pg.crop(box).to_image(resolution=DPI).save(os.path.join(OUT_DIR, f"a-{tag}.png"))
                    item['aImg'] = f"pdfbank/a-{tag}.png"

            q_lines = clean_lines(pg.crop((16, max(10, q_top), W - 16, ans_line['top'] - 6)).extract_text())
            a_lines = clean_lines(pg.crop((16, ans_line['top'], W - 16, H - 28)).extract_text())
            item['qText'] = '\n'.join(q_lines)
            item['aText'] = '\n'.join([x for x in a_lines if not x.startswith('Answer:')])
            item['kind'] = 'image' if item.get('aImg') else 'text'

            if not item['qText'] and not item.get('qImg'):
                skipped.append((pno, '题干为空'))
                continue

            items.append(item)

    js_path = os.path.join(OUT_DIR, 'pdfbank.js')
    with open(js_path, 'w', encoding='utf-8') as f:
        f.write('window.PDFITEMS = ')
        json.dump(items, f, ensure_ascii=False, indent=1)
        f.write(';\n')

    by_sec = {}
    for it in items:
        by_sec[it['section']] = by_sec.get(it['section'], 0) + 1
    print(f"成功 {len(items)} 题 → {js_path}")
    print("分部分统计:", dict(sorted(by_sec.items())))
    if skipped:
        print(f"跳过 {len(skipped)} 页:")
        for pno, why in skipped[:10]:
            print(f"  第{pno}页 — {why}")


if __name__ == '__main__':
    main()
