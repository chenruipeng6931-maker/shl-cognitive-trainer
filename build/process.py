#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
提取后的处理层：清洗 + 结构化 + 质检。

做的三件事：
  1. 清洗  去掉题号行、"Question" 标签、英文硬换行
  2. 结构化 拆出 题号 / 关键词 / 题干 / 解析
  3. 质检  给每题打质量标记，输出需人工复核的清单

用法：python3 build/process.py
输入：pdfbank/pdfbank.js     输出：pdfbank/pdfbank.processed.js + 控制台报告
"""
import json, os, re, sys

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(BASE, 'pdfbank', 'pdfbank.js')
DST = os.path.join(BASE, 'pdfbank', 'pdfbank.processed.js')

FILLER = {'Question', 'Information', 'Answer:', 'Tap to fill the next image in the sequence'}
META_RE = re.compile(r'^\d+\.\s*(?:本题)?关键词\s*(.*)$')
BARE_NUM = re.compile(r'^\d+\.\s*$')


def load():
    raw = open(SRC, encoding='utf-8').read().strip()
    raw = re.sub(r'^window\.PDFITEMS\s*=\s*', '', raw)
    raw = re.sub(r';\s*$', '', raw)
    return json.loads(raw)


QTYPE = {
    'B': 'tagging',
    'C': 'chart',
    'D': 'sequence',
    'E': 'connect',
    'F': 'combination',
}


def qtype_of(it):
    """按题型分类，而不是按 PDF 的章节字母"""
    sec = it.get('section')
    if sec == 'A':
        # A 部分混着两种：有答案轴的是排程，纯文字的是日期推算
        return 'schedule' if it.get('aImg') else 'calendar'
    return QTYPE.get(sec, 'other')


def split_meta(lines):
    """剥掉题号行和 Question 之类的占位行，顺带抽出关键词与备注"""
    meta_kw = ''
    out = []
    for ln in lines:
        t = ln.strip()
        if not t:
            continue
        if BARE_NUM.match(t):
            continue
        m = META_RE.match(t)
        if m:
            rest = m.group(1).strip()
            if rest:
                parts = rest.split(None, 1)
                meta_kw = parts[0]
                if len(parts) > 1:
                    out.append(parts[1])          # 括号里的提示，保留
            continue
        if t in FILLER:
            continue
        out.append(t)
    return out, meta_kw


def merge_wrap(lines):
    """把英文硬换行接回去：上一行以字母/逗号结尾且下一行小写开头"""
    if not lines:
        return []
    out = [lines[0]]
    for ln in lines[1:]:
        prev = out[-1]
        if re.search(r'[a-z,]$', prev) and re.match(r'^[a-z]', ln):
            out[-1] = prev + ' ' + ln
        else:
            out.append(ln)
    return out


def clean(text):
    lines = text.split('\n') if text else []
    lines, kw = split_meta(lines)
    lines = merge_wrap(lines)
    return '\n'.join(lines), kw


def main():
    items = load()
    report = {'total': len(items), 'by_section': {}, 'issues': []}

    for it in items:
        q, qkw = clean(it.get('qText', ''))
        a, _ = clean(it.get('aText', ''))
        it['qText'] = q
        it['aText'] = a
        if qkw and not it.get('keyword'):
            it['keyword'] = qkw

        it['qtype'] = qtype_of(it)
        sec = it.get('section', '?')
        report['by_section'][sec] = report['by_section'].get(sec, 0) + 1

        flags = []
        if it.get('kind') == 'text':
            if len(a) < 12:
                flags.append('解析过短')
            if len(q) < 20:
                flags.append('题干过短')
        else:
            if not it.get('aImg'):
                flags.append('缺答案图')
        if not it.get('keyword'):
            flags.append('无关键词')
        it['quality'] = flags
        if flags:
            report['issues'].append((it['id'], sec, flags, q[:50], a[:50]))

    with open(DST, 'w', encoding='utf-8') as f:
        f.write('window.PDFITEMS = ')
        json.dump(items, f, ensure_ascii=False, indent=1)
        f.write(';\n')

    print(f"处理完成 {report['total']} 题 → {DST}")
    print("分部分:", dict(sorted(report['by_section'].items())))
    from collections import Counter
    print("题型分布:", dict(Counter(i.get('qtype','?') for i in items)))
    print(f"\n需要复核: {len(report['issues'])} 题")
    for iid, sec, flags, q, a in report['issues'][:15]:
        print(f"  {iid:>7} [{sec}] {','.join(flags)}")
        print(f"          题: {q!r}")
        print(f"          答: {a!r}")


if __name__ == '__main__':
    main()
