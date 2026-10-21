#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
题库构建：把散落的配置合并进 SQLite，再导出前端可用的单个 bank.js

数据源：
  pdfbank.processed.js  题目文本
  pdfbank/charts.js     图表配置
  pdfbank/taggings.js   标签配置
  pdfbank/calendars.js  日期配置
  pdfbank/schedules.js  排程配置
  pdfbank/figdata.js    图形数据
  pdfbank/notes.js      解析

输出：
  data/bank.db          SQLite（单一数据源）
  pdfbank/bank.js       前端加载
"""
import os, re, json, sqlite3, subprocess, sys

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB = os.path.join(BASE, 'data', 'bank.db')
OUT = os.path.join(BASE, 'pdfbank', 'bank.js')

SOURCES = [
    ('pdfbank/pdfbank.processed.js', 'PDFITEMS'),
    ('pdfbank/charts.js', 'CHARTS'),
    ('pdfbank/taggings.js', 'TAGGINGS'),
    ('pdfbank/calendars.js', 'CALENDARS'),
    ('pdfbank/schedules.js', 'SCHEDULES'),
    ('pdfbank/figdata.js', 'FIGDATA'),
    ('pdfbank/stardata.js', 'STARDATA'),
    ('pdfbank/combinations.js', 'COMBINATIONS'),
    ('pdfbank/connects.js', 'CONNECTS'),
    ('pdfbank/stems-zh.js', 'STEMS_ZH'),
    ('pdfbank/notes.js', 'PDFNOTES'),
]


def load_js(path, var):
    """用 node 求值 JS 文件，拿到纯 JSON"""
    full = os.path.join(BASE, path)
    if not os.path.exists(full):
        return {}
    code = ("global.window=global;require(%r);"
            "process.stdout.write(JSON.stringify(window.%s||{}));") % (full, var)
    r = subprocess.run(['node', '-e', code], capture_output=True, text=True)
    if r.returncode != 0:
        print('读取失败:', path, r.stderr[:200])
        return {}
    return json.loads(r.stdout or '{}')


def main():
    data = {}
    for path, var in SOURCES:
        data[var] = load_js(path, var)
        print(f"  {var:<12} {len(data[var])} 条")

    items = data['PDFITEMS']
    if isinstance(items, list):
        items = {i['id']: i for i in items}
    items = items or {}

    os.makedirs(os.path.dirname(DB), exist_ok=True)
    if os.path.exists(DB):
        os.remove(DB)
    con = sqlite3.connect(DB)
    con.execute("""CREATE TABLE questions(
        id TEXT PRIMARY KEY,
        page INTEGER, qtype TEXT, section TEXT,
        qText TEXT, aText TEXT, explanation_zh TEXT, explanation_en TEXT,
        qImg TEXT, aImg TEXT,
        interaction TEXT
    )""")

    # 题型覆盖：这些题看起来在 A 部分，实际考的是日期
    QTYPE_OVERRIDE = {'PDF15': 'calendar', 'PDF20': 'calendar', 'PDF34': 'tagging'}

    import re as _re
    NOISE = _re.compile(r'(这个词太常见|其他词汇太常见)')

    def clean_stem(txt, qtype):
        lines = []
        for ln in (txt or '').split('\n'):
            t = ln.strip()
            if not t:
                continue
            if NOISE.search(t) or (t.startswith('(') and t.endswith(')')):
                continue          # 提取时混进来的备注
            lines.append(t)
        out = '\n'.join(lines)
        if qtype == 'sequence' and len(out) < 20:
            out = '观察前面几个图形的变化规律，把下一格补全。'
        if qtype == 'connect' and len(out) < 20:
            out = '按规律把节点连起来，补全这条序列。'
        return out

    merged = []
    for qid, it in items.items():
        inter = {}
        if qid in data['CHARTS']:
            inter['chart'] = data['CHARTS'][qid]
        if qid in data['TAGGINGS']:
            inter['tag'] = data['TAGGINGS'][qid]
        if qid in data['CALENDARS']:
            inter['cal'] = data['CALENDARS'][qid]
        if qid in data['SCHEDULES']:
            inter['sched'] = data['SCHEDULES'][qid]
        if qid in data['FIGDATA']:
            inter['fig'] = data['FIGDATA'][qid]
        if qid in data.get('STARDATA', {}):
            inter['star'] = data['STARDATA'][qid]
        if qid in data.get('COMBINATIONS', {}):
            inter['comb'] = data['COMBINATIONS'][qid]
        if qid in data.get('CONNECTS', {}):
            inter['conn'] = data['CONNECTS'][qid]
        note = data['PDFNOTES'].get(qid) or {}
        exp = it.get('explanation') or {}

        row = {
            'id': qid,
            'page': it.get('page'),
            'qtype': QTYPE_OVERRIDE.get(qid, it.get('qtype')),
            'section': it.get('section'),
            'qText': clean_stem(it.get('qText'), QTYPE_OVERRIDE.get(qid, it.get('qtype'))),
            'qTextZh': (data.get('STEMS_ZH') or {}).get(qid, ''),
            'aText': it.get('aText') or '',
            'expZh': note.get('zh') or exp.get('zh') or '',
            'expEn': note.get('en') or exp.get('en') or '',
            'qImg': it.get('qImg'),
            'aImg': it.get('aImg'),
            'interaction': inter,
        }
        merged.append(row)
        con.execute(
            "INSERT INTO questions VALUES (?,?,?,?,?,?,?,?,?,?,?)",
            (row['id'], row['page'], row['qtype'], row['section'], row['qText'],
             row['aText'], row['expZh'], row['expEn'], row['qImg'], row['aImg'],
             json.dumps(inter, ensure_ascii=False))
        )

    con.commit()
    n = con.execute("SELECT COUNT(*) FROM questions").fetchone()[0]
    by = dict(con.execute("SELECT qtype, COUNT(*) FROM questions GROUP BY qtype").fetchall())
    con.close()

    with open(OUT, 'w', encoding='utf-8') as f:
        f.write('/* 由 build/build_db.py 从 data/bank.db 自动生成，请勿手改 */\n')
        f.write('window.BANK = ')
        json.dump({'questions': merged}, f, ensure_ascii=False)
        f.write(';\n')

    print(f"\nSQLite: {DB}  共 {n} 题")
    print("题型:", by)
    print(f"导出: {OUT}")


if __name__ == '__main__':
    main()
