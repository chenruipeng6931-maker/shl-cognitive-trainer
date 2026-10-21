/* ============================================================
 *  应用逻辑：手写题库 + 训练模式 / 模拟考试 / 中英双语
 *  题库由 bank.js 提供（window.BANK），图形由 render.js 绘制
 * ============================================================ */
(function () {
  'use strict';


  const view = document.getElementById('view');

  /* ---------------- 题型信息 ---------------- */
  const TYPE_INFO = {
    series: {
      label: { zh: '序列推理', en: 'Series' },
      title: { zh: '按规律，下一个图形应该是？', en: 'Which figure comes next in the series?' }
    },
    matrix: {
      label: { zh: '矩阵补全', en: 'Matrix' },
      title: { zh: '哪一个图形能补全九宫格？', en: 'Which figure completes the grid?' }
    },
    analogy: {
      label: { zh: '图形类比', en: 'Analogy' },
      title: { zh: '第一组的变化规律同样适用于第二组，问号处是？', en: 'The same change applies to the second pair. What replaces the question mark?' }
    },
    odd: {
      label: { zh: '找异类', en: 'Odd one out' },
      title: { zh: '哪一个图形不符合其他图形的共同规律？', en: 'Which figure does NOT follow the common rule?' }
    },
    classify: {
      label: { zh: '归类判断', en: 'Classification' },
      title: { zh: '前三个图形符合同一条规律，下列哪一个也符合？', en: 'The first three figures share a rule. Which option also follows it?' }
    },
  };

  // 按题型分类（不按 PDF 章节）
  const QTYPE_INFO = {
    schedule: {
      label: { zh: '时间排程', en: 'Scheduling' },
      title: { zh: '把任务安排进时间表', en: 'Fit the tasks into the schedule' }
    },
    calendar: {
      label: { zh: '日期推算', en: 'Calendar' },
      title: { zh: '推算出符合条件的日期', en: 'Work out the right dates' }
    },
    tagging: {
      label: { zh: '标签归类', en: 'Tagging' },
      title: { zh: '把标签匹配到对应位置', en: 'Match each badge to its place' }
    },
    chart: {
      label: { zh: '图表分析', en: 'Charts' },
      title: { zh: '按数据调整图表', en: 'Adjust the chart to fit the data' }
    },
    sequence: {
      label: { zh: '序列填图', en: 'Sequence' },
      title: { zh: '按规律，下一格应该填成什么样？', en: 'What should the next figure look like?' }
    },
    connect: {
      label: { zh: '连线题', en: 'Connect' },
      title: { zh: '把对应的项目连起来', en: 'Connect the matching pairs' }
    },
    combination: {
      label: { zh: '组合变化', en: 'Combination' },
      title: { zh: '按规律组合出结果', en: 'Combine them following the rule' }
    }
  };
  Object.keys(QTYPE_INFO).forEach((k) => { TYPE_INFO[k] = QTYPE_INFO[k]; });

  /* ---------------- i18n ---------------- */
  const I18N = {
    zh: {
      appTitle: 'SHL 练习',
      appSub: '手写题库 + PDF 题库 · 中英双语',
      modeTrain: '训练模式',
      modeExam: '模拟考试',
      typeFilter: '题型',
      allTypes: '全部题型',
      answered: '已答',
      correct: '正确',
      rate: '正确率',
      streak: '连对',
      resetStats: '重置',
      skip: '跳过这题',
      next: '下一题',
      correctMsg: '回答正确',
      wrongMsg: '回答错误',
      correctIs: '正确答案是',
      trainHint: '',
      examTitle: '模拟考试',
      examDesc: '计时作答，过程中不显示答案，交卷后统一批改并给出逐题解析。',
      numQuestions: '题目数量',
      timeLimit: '限时',
      minutes: '分钟',
      startExam: '开始考试',
      submit: '交卷',
      prevQ: '上一题',
      nextQ: '下一题',
      question: '第',
      of: '/',
      timeUp: '时间到，已自动交卷',
      yourScore: '正确率',
      timeUsed: '用时',
      unanswered: '未作答',
      restart: '再考一次',
      backToTrain: '返回训练',
      breakdownTitle: '分题型正确率',
      reviewTitle: '逐题解析',
      yourAnswer: '你的答案',
      correctAnswer: '正确答案',
      notAnswered: '未作答',
      examHint: '快捷键 <kbd>1</kbd>–<kbd>5</kbd> 选择，<kbd>←</kbd> <kbd>→</kbd> 切换题目。',
      confirmSubmit: '还有题目未作答，确定交卷吗？',
      bankSize: '题库共',
      reveal: '显示答案',
      submitAnswer: '提交答案',
      answerLabel: '答案',
      selfRight: '答对了',
      selfWrong: '没答对',
      pdfHint: '',
      showImage: '查看原图',
      hideImage: '收起原图',
      clickHint: '点击格子填色：空白 → 绿色 → 花纹 → 空白。填完再点「显示答案」对比。',
      yourFill: '你的作答',
      answerFill: '正确答案',
      diffNote: '有 {n} 个格子与答案不同',
      allPlacedRight: '全部任务位置正确',
      placedRight: '个任务位置正确',
      pickSlot: '点下面这条轴选一个',
      correctDates: '正确日期',
      correctAnswer: '正确答案',
      datesAllRight: '日期全部正确',
      minutesShort: '分钟的时段'
    },
    en: {
      appTitle: 'Inductive Reasoning Practice',
      appSub: 'Hand-written + PDF bank · bilingual',
      modeTrain: 'Practice',
      modeExam: 'Mock Exam',
      typeFilter: 'Type',
      allTypes: 'All types',
      answered: 'Answered',
      correct: 'Correct',
      rate: 'Accuracy',
      streak: 'Streak',
      resetStats: 'Reset',
      skip: 'Skip',
      next: 'Next',
      correctMsg: 'Correct',
      wrongMsg: 'Incorrect',
      correctIs: 'The correct answer is',
      trainHint: '',
      examTitle: 'Mock Exam',
      examDesc: 'Timed, no feedback during the test. You get a score and a full review at the end.',
      numQuestions: 'Questions',
      timeLimit: 'Time limit',
      minutes: 'min',
      startExam: 'Start exam',
      submit: 'Submit',
      prevQ: 'Previous',
      nextQ: 'Next',
      question: 'Question',
      of: 'of',
      timeUp: 'Time is up — submitted automatically',
      yourScore: 'Score',
      timeUsed: 'Time used',
      unanswered: 'Unanswered',
      restart: 'Take another',
      backToTrain: 'Back to practice',
      breakdownTitle: 'Accuracy by type',
      reviewTitle: 'Question review',
      yourAnswer: 'Your answer',
      correctAnswer: 'Correct answer',
      notAnswered: 'Not answered',
      examHint: 'Keys <kbd>1</kbd>–<kbd>5</kbd> to answer, <kbd>←</kbd> <kbd>→</kbd> to navigate.',
      confirmSubmit: 'Some questions are unanswered. Submit anyway?',
      bankSize: 'Bank:',
      reveal: 'Show answer',
      submitAnswer: 'Submit answer',
      answerLabel: 'Answer',
      selfRight: 'I got it',
      selfWrong: 'I missed it',
      pdfHint: '',
      showImage: 'Show source image',
      hideImage: 'Hide source image',
      clickHint: 'Click a region to cycle its colour: blank → green → pattern → blank. Then reveal the answer to compare.',
      yourFill: 'Your answer',
      answerFill: 'Correct answer',
      diffNote: '{n} region(s) differ from the answer',
      allPlacedRight: 'All tasks placed correctly',
      placedRight: 'tasks placed correctly',
      pickSlot: 'Click the bottom lane to pick a',
      correctDates: 'Correct dates',
      correctAnswer: 'Correct answer',
      datesAllRight: 'All dates correct',
      minutesShort: 'min slot'
    }
  };

  let lang = localStorage.getItem('rg-lang') === 'en' ? 'en' : 'zh';
  const DAY_KEY = 'shl-daily-v1';
  const SEEN_KEY = 'shl-seen-v1';

  function loadSeen() {
    try { return JSON.parse(localStorage.getItem(SEEN_KEY) || '{}'); } catch (e) { return {}; }
  }
  function markSeen(id) {
    const d = loadSeen();
    if (!d[id]) { d[id] = Date.now(); try { localStorage.setItem(SEEN_KEY, JSON.stringify(d)); } catch (e) {} }
  }

  function loadDaily() {
    try { return JSON.parse(localStorage.getItem(DAY_KEY) || '{}'); } catch (e) { return {}; }
  }
  function recordDay(ok, ms) {
    const d = loadDaily();
    const k = new Date().toISOString().slice(0, 10);
    if (!d[k]) d[k] = { t: 0, c: 0, ms: 0 };
    d[k].t++;
    if (ok) d[k].c++;
    if (ms && ms > 0) d[k].ms = (d[k].ms || 0) + ms;
    try { localStorage.setItem(DAY_KEY, JSON.stringify(d)); } catch (e) {}
  }

  function fmtDur(ms) {
    if (!ms || ms < 1000) return '0 秒';
    const s = Math.round(ms / 1000);
    if (s < 60) return s + ' 秒';
    const m = Math.floor(s / 60), r = s % 60;
    if (m < 60) return r ? m + ' 分 ' + r + ' 秒' : m + ' 分';
    const h = Math.floor(m / 60);
    return h + ' 小时 ' + (m % 60) + ' 分';
  }
  function last7() {
    const d = loadDaily();
    const out = [];
    for (let i = 6; i >= 0; i--) {
      const dt = new Date(Date.now() - i * 86400000);
      const k = dt.toISOString().slice(0, 10);
      out.push({ k, label: (dt.getMonth() + 1) + '/' + dt.getDate(), v: d[k] || null });
    }
    return out;
  }

  const t = (k) => (I18N[lang][k] !== undefined ? I18N[lang][k] : k);
  const letters = 'ABCDEF';

  /* ---------------- 载入并规范化题库 ---------------- */
  function shuffleArr(a) {
    const b = a.slice();
    for (let i = b.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = b[i]; b[i] = b[j]; b[j] = tmp;
    }
    return b;
  }

  // 题库单一数据源：由 build/build_db.py 从 data/bank.db 导出
  const POOL = ((window.BANK && window.BANK.questions) || []).map((q) => {
    const it = q.interaction || {};
    return {
      id: q.id,
      type: q.qtype,
      kind: q.qImg ? 'pdfimage' : 'pdftext',
      page: q.page,
      qText: q.qText || '',
      qTextZh: q.qTextZh || '',
      aText: q.aText || '',
      qImg: q.qImg || null,
      aImg: q.aImg || null,
      fig: it.fig || null,
      star: it.star || null,
      comb: it.comb || null,
      conn: it.conn || null,
      mem: it.mem || null,
      sched: it.sched || null,
      cal: it.cal || null,
      chart: it.chart || null,
      tag: it.tag || null,
      explanation: { zh: q.expZh || '', en: q.expEn || '' }
    };
  });

  const TYPES = Object.keys(TYPE_INFO).filter(ty => POOL.some(q => q.type === ty));

  /* ---------------- 状态 ---------------- */
  const state = {
    view: 'home',
    mode: 'train',
    train: { item: null, answered: false, revealed: false, picked: -1, total: 0, correct: 0, streak: 0, type: 'all', lastId: null, userCols: null, placed: {} },
    exam: {
      phase: 'config', items: [], answers: [], idx: 0,
      remaining: 0, durationMin: 36, count: 24, scope: 'all',
      timer: null, startedAt: 0, autoSubmitted: false
    }
  };

  /* ---------------- 渲染 ---------------- */
  const CELL = 112;
  const LAYOUT_SINGLE = ['sequence', 'connect', 'combination'];

  function fmtH(h) {
    const hh = Math.floor(h), mm = Math.round((h - hh) * 60);
    return String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0');
  }

  function splitExplanation(exp) {
    const raw = String(exp || '').trim();
    if (!raw) return { rule: '', steps: [], pitfall: '' };
    const lines = raw.split(/\n+/).map(l => l.trim()).filter(Boolean);
    // 显式分段标记
    let rule = '', pitfall = '', steps = [];
    lines.forEach(l => {
      if (/^(易错|注意|坑)/.test(l)) pitfall = l.replace(/^(易错点?|注意|坑)[:：]?/, '').trim();
      else if (/^(规律|关键|规则)/.test(l)) rule = l.replace(/^(规律|关键|规则)[:：]?/, '').trim();
      else steps.push(l);
    });
    // 没有显式规律时，第一行当规律
    if (!rule && steps.length > 1) rule = steps.shift();
    return { rule, steps, pitfall };
  }

  function appDialog(opts) {
    return new Promise((resolve) => {
      const o = opts || {};
      const mask = document.createElement('div');
      mask.className = 'dlg-mask';
      mask.innerHTML = `<div class="dlg" role="dialog" aria-modal="true">
        <div class="dlg-title">${escapeHTML(o.title || '确认')}</div>
        <div class="dlg-text">${escapeHTML(o.text || '')}</div>
        <div class="dlg-actions">
          <button type="button" class="btn" data-dlg="cancel">${escapeHTML(o.cancel || '取消')}</button>
          <button type="button" class="btn ${o.danger ? 'bad' : 'primary'}" data-dlg="ok">${escapeHTML(o.ok || '确定')}</button>
        </div></div>`;
      document.body.appendChild(mask);
      const close = (v) => { mask.remove(); document.removeEventListener('keydown', onKey); resolve(v); };
      const onKey = (ev) => {
        if (ev.key === 'Escape') close(false);
        if (ev.key === 'Enter') close(true);
      };
      mask.querySelector('[data-dlg="ok"]').addEventListener('click', () => close(true));
      mask.querySelector('[data-dlg="cancel"]').addEventListener('click', () => close(false));
      mask.addEventListener('click', (ev) => { if (ev.target === mask) close(false); });
      document.addEventListener('keydown', onKey);
      mask.querySelector('[data-dlg="ok"]').focus();
    });
  }

  function feedbackBlock(opts) {
    const o = opts || {};
    const cls = o.ok ? 'good' : 'bad';
    const head = o.ok ? '✓ 回答正确' : '✗ 回答错误';
    let body = '';
    if (o.detail) body += `<div class="wrongnote">${o.detail}</div>`;

    const parts = splitExplanation(o.exp);
    if (parts.rule) {
      body += `<div class="exp-rule"><div class="ex-label">关键规律</div><div class="ex-text">${escapeHTML(parts.rule)}</div></div>`;
    }
    if (parts.steps.length) {
      body += `<div class="exp-steps"><div class="ex-label">推导过程</div>
        <ol>${parts.steps.map(x => `<li>${escapeHTML(x)}</li>`).join('')}</ol></div>`;
    }
    if (parts.pitfall) {
      body += `<div class="exp-pitfall"><div class="ex-label">易错点</div><div class="ex-text">${escapeHTML(parts.pitfall)}</div></div>`;
    }
    if (!parsed(parts)) {
      body += `<div class="exp">${escapeHTML(o.exp || '')}</div>`;
    }
    return `<div class="feedback show ${cls}">
      <div class="res">${head}</div>${body}</div>`;
  }

  function parsed(p) {
    return !!(p.rule || p.steps.length || p.pitfall);
  }

  function stemText(q) {
    if (lang === 'zh' && q.qTextZh) return q.qTextZh;
    return q.qText || '';
  }

  function escapeHTML(str) {
    return String(str).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  }

  function figureCard(q, s, onChange) {
    const S = 168, B = 300;
    const cols = s.userCols || new Array(16).fill('w');
    let html = '<div class="figcard">';

    html += '<div class="figrow">'
      + q.fig.seq.map(c => `<div class="figbox">${window.Figure.svg(c, S)}</div>`).join('<span class="arrow">→</span>')
      + `<span class="arrow">→</span><div class="figbox blank">?</div></div>`;

    if (!s.revealed) {
      html += `<div class="canvasbox"><div class="figbox big">${window.Figure.svg(cols, B, { interactive: true })}</div>
        <div class="canvasnote">${t('clickHint')}</div></div>
        <div class="actions"><div class="right">
          <button class="btn primary" id="btnReveal" type="button">${t('submitAnswer')}</button></div></div>`;
      return html + '</div>';
    }

    const ans = q.fig.ans;
    const diff = cols.map((c, i) => c !== ans[i]);
    const nDiff = diff.filter(Boolean).length;

    html += `<div class="figcompare">
      <div class="figbox"><div class="figcap">${t('yourFill')}</div>${window.Figure.svg(cols, 250, { diff })}</div>
      <div class="figbox"><div class="figcap">${t('answerFill')}</div>${window.Figure.svg(ans, 250)}</div>
    </div>`;
    html += feedbackBlock({
      ok: nDiff === 0,
      detail: nDiff ? `<b>差异：</b>有 ${nDiff} 个格子与答案不同` : '',
      exp: (q.explanation && q.explanation[lang]) || q.aText || ''
    });
    return html + '</div>';
  }

  function scheduleCard(q, s, onChange) {
    const isLanes = q.sched.mode === 'lanes';
    let html = '<div class="schedcard">';

    if (isLanes) {
      const cfg2 = Object.assign({}, q.sched, {
        editable_help: `${t('pickSlot')} ${q.sched.slotLen * 60} ${t('minutesShort')}`
      });
      html += window.Schedule.renderLanes(cfg2, s);
    } else {
      html += window.Schedule.render(q.sched, s);
    }

    if (!s.revealed) {
      html += `<div class="actions"><div class="right">
        <button class="btn primary" id="btnReveal" type="button">${t('submitAnswer')}</button></div></div>`;
      return html + '</div>';
    }

    if (isLanes) {
      const ans = q.sched.answer;
      const need = [];
      for (let i = 0; i < (ans.len || 0.5); i += 0.5) need.push(+(ans.start + i).toFixed(2));
      const got = ((s.picks || {})[ans.lane] || []).map(v => +v.toFixed(2)).sort((a, b) => a - b);
      const ok = got.length === need.length && need.every((v, i) => Math.abs(v - got[i]) < 0.01);
      const ansCfg = Object.assign({}, q.sched, { editable_help: '' });
      ansCfg.lanes = q.sched.lanes.map((ln, i) =>
        Object.assign({}, ln, { editable: !!(ans && ans.lane === i) }));
      const ansSt = ans ? { pick: { lane: ans.lane, start: ans.start } } : {};
      html += `<div class="schedlabel">${t('yourFill')}</div>`;
      html += window.Schedule.renderLanes(Object.assign({}, q.sched, { editable_help: '' }), s);
      html += `<div class="schedlabel ok">${t('answerFill')}</div>`;
      html += window.Schedule.renderLanes(ansCfg, ansSt);
      html += feedbackBlock({
        ok,
        detail: ok ? '' : `<b>正确答案：</b>车道 ${ans.lane + 1}，${fmtH(ans.start)} 起 ${ans.len || 0.5} 小时`,
        exp: (q.explanation && q.explanation[lang]) || q.aText || ''
      });
      return html + '</div>';
    }

    // 用同样的时间轴渲染正确答案，和用户排布上下对齐
    let right = 0, total = 0;
    if (q.sched.answer) {
      q.sched.tasks.forEach((tk) => {
        total++;
        if (Math.abs((s.placed[tk.id] == null ? -99 : s.placed[tk.id]) - q.sched.answer[tk.id]) < 0.01) right++;
      });
      html += `<div class="schedlabel">${t('yourFill')}</div>`;
      html += window.Schedule.render(q.sched, s, { readonly: true });
      html += `<div class="schedlabel ok">${t('answerFill')}</div>`;
      html += window.Schedule.render(q.sched, null, { readonly: true, fixed: q.sched.answer });
    }
    const aText = (q.explanation && q.explanation[lang]) || q.aText || '';
    const head = q.sched.answer
      ? (right === total ? '✓ ' + t('allPlacedRight') : `${right}/${total} ${t('placedRight')}`)
      : '';
    html += `<div class="feedback show ${(!q.sched.answer || right === total) ? 'good' : 'bad'}"><div class="res">${head || t('answerLabel')}</div>
      <div class="exp">${escapeHTML(aText)}</div></div>`;
    return html + '</div>';
  }

  function calendarCard(q, s, onChange) {
    let html = '<div class="calcard">';
    html += window.Calendar.render(q.cal, s);

    if (!s.revealed) {
      html += `<div class="actions"><div class="right">
        <button class="btn primary" id="btnReveal" type="button">${t('submitAnswer')}</button></div></div>`;
      return html + '</div>';
    }

    const picked = s.pickedDays || [];
    const ans = q.cal.answer || [];
    const hit = ans.filter(d => picked.indexOf(d) >= 0).length;
    const ok = hit === ans.length && picked.length === ans.length;

    html += feedbackBlock({
      ok,
      detail: ok ? '' : `<b>你的答案：</b>${picked.length ? picked.join('、') : '未选'}　　<b>正确答案：</b>${ans.join('、')}`,
      exp: (q.explanation && q.explanation[lang]) || q.aText || ''
    });
    return html + '</div>';
  }

  function chartCard(q, s, onChange) {
    let html = '<div class="chartcard">';
    html += window.ChartType.render(q.chart, s);

    if (!s.revealed) {
      html += `<div class="actions"><div class="right">
        <button class="btn primary" id="btnReveal" type="button">${t('submitAnswer')}</button></div></div>`;
      return html + '</div>';
    }

    const res = window.ChartType.check(q.chart, s);
    const chartAns = (q.chart.series && q.chart.series.length)
      ? q.chart.series.map(se => se.label + ' ' + se.answer.join('% / ') + '%').join('；')
      : (q.chart.answer || []).join('% / ') + '%';
    html += feedbackBlock({
      ok: res.ok,
      detail: res.ok ? '' : `<b>正确答案：</b>${chartAns}`,
      exp: (q.explanation && q.explanation[lang]) || q.aText || ''
    });
    return html + '</div>';
  }

  function sourceImgHTML() { return ''; }

  function tagCard(q, s, onChange) {
    let html = '<div class="tagcard">';
    html += window.TaggingType.render(q.tag, s);

    if (!s.revealed) {
      html += `<div class="actions"><div class="right">
        <button class="btn primary" id="btnReveal" type="button">${t('submitAnswer')}</button></div></div>`;
      return html + '</div>';
    }
    const res = window.TaggingType.check(q.tag, s);
    const tagAns = Object.keys(q.tag.answer)
      .map(k => k + ' → ' + ((q.tag.badgeLabels && q.tag.badgeLabels[q.tag.answer[k]]) || q.tag.answer[k]))
      .join('，');
    html += feedbackBlock({
      ok: res.ok,
      detail: res.ok ? '' : `<b>正确答案：</b>${tagAns}`,
      exp: (q.explanation && q.explanation[lang]) || q.aText || ''
    });
    return html + '</div>';
  }

  function starCard(q, s, onChange) {
    let html = '<div class="starcard">';
    html += window.StarType.render(q.star, s);
    return html + '</div>';
  }

  function combCard(q, s, onChange) {
    let html = '<div class="combcard">';
    html += window.CombinationType.render(q.comb, s);
    if (!s.revealed) {
      html += `<div class="actions"><div class="right">
        <button class="btn primary" id="btnReveal" type="button">${t('submitAnswer')}</button></div></div>`;
      return html + '</div>';
    }
    const res = window.CombinationType.check(q.comb, s);
    const ans = q.comb.answer.map(id => {
      const idx = q.comb.buttons.findIndex(b => b.id === id);
      return q.comb.arrowMode ? ('按钮 ' + (idx + 1)) : ((q.comb.buttons.find(b => b.id === id) || {}).label);
    }).join(' + ');
    html += feedbackBlock({
      ok: res.ok,
      detail: res.ok ? '' : `<b>正确答案：</b>${ans}`,
      exp: (q.explanation && q.explanation[lang]) || q.aText || ''
    });
    return html + '</div>';
  }

  function connCard(q, s, onChange) {
    let html = '<div class="conncard">';
    html += window.ConnectType.render(q.conn, s);
    if (!s.revealed) {
      html += `<div class="actions"><div class="right">
        <button class="btn primary" id="btnReveal" type="button">${t('submitAnswer')}</button></div></div>`;
      return html + '</div>';
    }
    const res = window.ConnectType.check(q.conn, s);
    const connAns = q.conn.edges
      ? q.conn.edges.map(e => e.join('–')).join('，')
      : q.conn.answer.join(' → ');
    html += feedbackBlock({
      ok: res.ok,
      detail: res.ok ? '' : `<b>正确答案：</b>${connAns}`,
      exp: (q.explanation && q.explanation[lang]) || q.aText || ''
    });
    return html + '</div>';
  }

  function memCard(q, s, onChange) {
    let html = '<div class="memcardwrap">';
    html += window.MemoryType.render(q.mem, s);
    return html + '</div>';
  }

  function pdfCard(q, s, onChange) {
    if (q.mem && window.MemoryType) return memCard(q, s, onChange);
    if (q.conn && window.ConnectType) return connCard(q, s, onChange);
    if (q.comb && window.CombinationType) return combCard(q, s, onChange);
    if (q.star && window.StarType) return starCard(q, s, onChange);
    if (q.tag && window.TaggingType) return tagCard(q, s, onChange);
    if (q.chart && window.ChartType) return chartCard(q, s, onChange);
    if (q.cal && window.Calendar) return calendarCard(q, s, onChange);
    if (q.sched && window.Schedule) return scheduleCard(q, s, onChange);
    if (q.fig && q.fig.ans && window.Figure && window.Figure.ready()) return figureCard(q, s, onChange);
    let html = '<div class="pdfitem">';

    if (q.qText) {
      html += `<div class="qtext">${escapeHTML(stemText(q))}</div>`;
    }

    // 原图：纯图题、或 C 部分（图表）默认展开，其余默认收起


    if (!s.revealed) {
      html += `<div class="actions"><div class="right">
        <button class="btn primary" id="btnReveal" type="button">${t('submitAnswer')}</button></div></div>`;
      return html + '</div>';
    }


    const aText = (q.explanation && q.explanation[lang]) || q.aText || '';
    html += `<div class="feedback show good"><div class="res">${t('answerLabel')}</div>
      <div class="exp">${escapeHTML(aText)}</div></div>`;
    return html + '</div>';
  }

  function judgeItem(q, st) {
    if (!st) return false;
    if (q.sched && q.sched.answer) {
      if (q.sched.mode === 'lanes') {
        const ans = q.sched.answer;
        const need = [];
        for (let i = 0; i < (ans.len || 0.5); i += 0.5) need.push(+(ans.start + i).toFixed(2));
        const got = ((st.picks || {})[ans.lane] || []).map(v => +v.toFixed(2)).sort((a, b) => a - b);
        if (got.length !== need.length) return false;
        return need.every((v, i) => Math.abs(v - got[i]) < 0.01);
      }
      return q.sched.tasks.every(tk =>
        st.placed && Math.abs((st.placed[tk.id] == null ? -99 : st.placed[tk.id]) - q.sched.answer[tk.id]) < 0.01);
    }
    if (q.cal && q.cal.answer) {
      const p = st.pickedDays || [];
      const a = q.cal.answer;
      return p.length === a.length && a.every(d => p.indexOf(d) >= 0);
    }
    if (q.mem) {
      return window.MemoryType.check(q.mem, st).ok;
    }
    if (q.star) {
      return window.StarType.check(q.star, st).ok;
    }
    if (q.tag && q.tag.answer) {
      return window.TaggingType.check(q.tag, st).ok;
    }
    if (q.chart && q.chart.answer) {
      return window.ChartType.check(q.chart, st).ok;
    }
    if (q.fig && q.fig.ans && st.userCols) {
      return q.fig.ans.every((c, i) => c === st.userCols[i]);
    }
    return false;
  }

  function drawItem(type) {
    let pool = POOL;
    if (type && type !== 'all') pool = POOL.filter(q => q.type === type);
    if (!pool.length) pool = POOL;
    let cand = pool;
    if (pool.length > 1 && state.train.lastId) {
      const filtered = pool.filter(q => q.id !== state.train.lastId);
      if (filtered.length) cand = filtered;
    }
    return cand[Math.floor(Math.random() * cand.length)];
  }

  /* ---------------- 训练模式 ---------------- */
  function startTimer(st) {
    st.startedAt = Date.now();
    st.elapsed = 0;
  }

  function newTrainItem() {
    const s = state.train;
    s.item = drawItem(s.type);
    s.lastId = s.item.id;
    s.answered = false;
    s.revealed = false;
    s.picked = -1;
    s.userCols = new Array(16).fill('w');
    s.placed = {};
    s.pickedDays = [];
    s.lineVals = null;
    s.stackVals = null;
    s.barVals = null;
    s.links = [];
    s.userHex = null;
    s.memPhase = 'ready';
    s.memIdx = 0;
    s.memCols = null;
    s.startedAt = Date.now();
    s.elapsed = 0;
    renderTrain();
  }

  function typeOptions(sel) {
    const opts = [`<option value="all">${t('allTypes')}</option>`];
    TYPES.forEach(ty => {
      opts.push(`<option value="${ty}" ${ty === sel ? 'selected' : ''}>${TYPE_INFO[ty].label[lang]}</option>`);
    });
    return opts.join('');
  }

  const HOME_I18N = {
    zh: {
      title: '认知能力训练',
      sub: (n) => `七种题型，${n} 道题。按题型单独练，或整卷限时模拟。`,
      start: '开始练习',
      cont: (x) => `继续 · ${x}`,
      secTypes: '题型训练',
      secTypesHint: '选择一种题型开始',
      exam: '模拟考试',
      examDesc: '24 题，36 分钟，交卷后统一批改并给出分题型报告',
      examGo: '开始',
      recent: '最近练习',
      recentEmpty: '还没有作答记录，做几道题后会显示正确率与用时。',
      kAcc: '正确率', kDone: '已答', kAvg: '平均每题',
      types: {
        sequence: ['图形序列', '补全下一帧图形'],
        schedule: ['时间安排', '把任务排进时间轴'],
        calendar: ['日历排期', '推算符合条件的日期'],
        chart: ['数字图表', '调整图表比例'],
        tagging: ['标签归类', '把标签放到对应位置'],
        connect: ['节点连线', '连成完整序列'],
        combination: ['组合变换', '选出正确的按钮组合']
      }
    },
    en: {
      title: 'Cognitive Ability Training',
      sub: (n) => `Seven question types, ${n} items. Practise one type or take a timed full test.`,
      start: 'Start practising',
      cont: (x) => `Continue · ${x}`,
      secTypes: 'Practice by type',
      secTypesHint: 'Pick a question type to begin',
      exam: 'Mock test',
      examDesc: '24 questions, 36 minutes. Marked together at the end with a per-type report.',
      examGo: 'Start',
      recent: 'Recent activity',
      recentEmpty: 'No attempts yet. Accuracy and timing appear after you answer a few questions.',
      kAcc: 'Accuracy', kDone: 'Answered', kAvg: 'Avg / question',
      types: {
        sequence: ['Sequences', 'Complete the next figure'],
        schedule: ['Scheduling', 'Place tasks on a timeline'],
        calendar: ['Calendar dates', 'Work out the dates'],
        chart: ['Charts', 'Adjust the chart proportions'],
        tagging: ['Tagging', 'Match tags to positions'],
        connect: ['Connections', 'Link the sequence'],
        combination: ['Combinations', 'Choose the right buttons']
      }
    }
  };

  function renderHome() {
    const H = HOME_I18N[lang] || HOME_I18N.zh;
    const days = last7();
    const bars = days.map(d => {
      const pct = d.v && d.v.t ? Math.round(d.v.c / d.v.t * 100) : null;
      const h = pct === null ? 4 : Math.max(6, pct * 0.9);
      return `<div class="dcol">
        <div class="dval">${pct === null ? '—' : pct + '%'}</div>
        <div class="dbar"><i style="height:${h}%;background:${pct === null ? '#e2e8f0' : (pct >= 80 ? '#2d6a4f' : pct >= 60 ? '#8a6d3b' : '#9b2c2c')}"></i></div>
        <div class="dlabel">${d.label}</div>
        <div class="dcount">${d.v ? d.v.c + '/' + d.v.t : ''}</div></div>`;
    }).join('');

    const allDaily = loadDaily();
    const total = Object.values(allDaily).reduce(
      (a, b) => ({ t: a.t + b.t, c: a.c + b.c, ms: a.ms + (b.ms || 0) }),
      { t: 0, c: 0, ms: 0 });
    const overall = total.t ? Math.round(total.c / total.t * 100) : null;
    const todayKey = new Date().toISOString().slice(0, 10);
    const todayRec = allDaily[todayKey] || {};
    const todayMs = todayRec.ms || 0;
    const totalMs = total.ms || 0;
    const avgMs = total.t ? Math.round(totalMs / total.t) : 0;

    // 各题型小示意图（统一线条风格）
    const mini = {
      sequence: `<svg viewBox="0 0 108 56" class="mini"><g fill="none" stroke="#566477" stroke-width="1.4">
        <rect x="4" y="12" width="26" height="26" rx="2"/><path d="M9 23h16M9 30h16"/>
        <rect x="38" y="12" width="26" height="26" rx="2"/><path d="M43 30h16M43 23h16"/>
        <rect x="72" y="12" width="26" height="26" rx="2"/><path d="M77 16v16M84 16v16"/></g></svg>`,
      schedule: `<svg viewBox="0 0 108 56" class="mini"><g stroke="#566477" stroke-width="1.2" fill="none">
        <line x1="6" y1="40" x2="102" y2="40"/>
        <line x1="6" y1="14" x2="6" y2="40"/></g>
        <g fill="#B4BECB"><rect x="16" y="18" width="26" height="10" rx="2"/>
        <rect x="52" y="24" width="18" height="10" rx="2"/></g>
        <g fill="#365DE8"><rect x="76" y="14" width="18" height="10" rx="2"/></g></svg>`,
      calendar: `<svg viewBox="0 0 108 56" class="mini"><g fill="none" stroke="#566477" stroke-width="1.2">
        <rect x="24" y="8" width="60" height="42" rx="3"/><line x1="24" y1="18" x2="84" y2="18"/>
        <line x1="39" y1="8" x2="39" y2="50"/><line x1="54" y1="8" x2="54" y2="50"/>
        <line x1="69" y1="8" x2="69" y2="50"/></g>
        <g fill="#B4BECB"><circle cx="31" cy="28" r="3"/><circle cx="46" cy="36" r="3"/>
        <circle cx="76" cy="28" r="3"/></g>
        <circle cx="61" cy="28" r="4" fill="#365DE8"/></svg>`,
      chart: `<svg viewBox="0 0 108 56" class="mini"><g fill="none" stroke="#566477" stroke-width="1.2">
        <line x1="10" y1="46" x2="100" y2="46"/><line x1="10" y1="46" x2="10" y2="8"/></g>
        <g fill="#B4BECB"><rect x="20" y="26" width="12" height="20"/>
        <rect x="38" y="18" width="12" height="28"/></g>
        <rect x="56" y="32" width="12" height="14" fill="#365DE8"/>
        <g fill="#B4BECB"><rect x="74" y="22" width="12" height="24"/></g></svg>`,
      tagging: `<svg viewBox="0 0 108 56" class="mini">
        <g fill="none" stroke="#566477" stroke-width="1.2">
        <rect x="40" y="6" width="28" height="12" rx="2"/><rect x="40" y="22" width="28" height="12" rx="2"/>
        <rect x="40" y="38" width="28" height="12" rx="2"/></g>
        <g fill="#B4BECB"><circle cx="76" cy="12" r="4"/><circle cx="76" cy="28" r="4"/></g>
        <circle cx="76" cy="44" r="4" fill="#365DE8"/></svg>`,
      connect: `<svg viewBox="0 0 108 56" class="mini">
        <g stroke="#566477" stroke-width="1.3" fill="none">
        <line x1="20" y1="38" x2="46" y2="18"/><line x1="46" y1="18" x2="76" y2="36"/></g>
        <g fill="#fff" stroke="#566477" stroke-width="1.3">
        <circle cx="20" cy="38" r="6"/><circle cx="46" cy="18" r="6"/><circle cx="76" cy="36" r="6"/></g>
        <circle cx="76" cy="36" r="6" fill="#365DE8" stroke="#365DE8"/></svg>`,
      combination: `<svg viewBox="0 0 108 56" class="mini">
        <g fill="none" stroke="#566477" stroke-width="1.3">
        <circle cx="28" cy="28" r="13"/><rect x="56" y="15" width="26" height="26" rx="2"/></g>
        <g stroke="#365DE8" stroke-width="2" fill="none">
        <line x1="28" y1="28" x2="37" y2="19"/><line x1="69" y1="28" x2="78" y2="37"/></g>
        <g fill="#365DE8"><polygon points="40,17 34,19 38,23"/>
        <polygon points="81,39 75,37 79,33"/></g></svg>`
    };

    const counts = {};
    POOL.forEach(q => { counts[q.type] = (counts[q.type] || 0) + 1; });
    const entries = ['sequence', 'schedule', 'calendar', 'chart', 'tagging', 'connect', 'combination']
      .filter(ty => counts[ty])
      .map(ty => {
        const t2 = H.types[ty] || [ty, ''];
        return { type: ty, name: t2[0], desc: t2[1], n: counts[ty] };
      });

    const cards = entries.map(e => `
      <button class="tcard" data-type="${e.type}" type="button">
        <div class="tc-mini">${mini[e.type] || ''}</div>
        <div class="tc-body">
          <div class="tc-name">${e.name}</div>
          <div class="tc-desc">${e.desc}</div>
        </div>
        <div class="tc-n">${e.n}</div>
      </button>`).join('');

    const lastQ = state.train.lastId;
    const lastType = lastQ && POOL.find(q => q.id === lastQ);
    const continueLabel = lastType
      ? H.cont(TYPE_INFO[lastType.type].label[lang])
      : H.start;

    view.innerHTML = `<div class="home2">
      <section class="hero2">
        <div class="hero2-main">
          <h1>${H.title}</h1>
          <p>${H.sub(POOL.length)}</p>
        </div>
        <button class="btn primary hero2-cta" data-go="train" type="button">${continueLabel}</button>
      </section>

      <section class="typeselect">
        <div class="sec-head"><h2>${H.secTypes}</h2><span>${H.secTypesHint}</span></div>
        <div class="tgrid">${cards}</div>
      </section>

      <section class="bottomrow">
        <button class="examcard" data-go="exam" type="button">
          <div class="ec-left">
            <div class="ec-name">${H.exam}</div>
            <div class="ec-desc">${H.examDesc}</div>
          </div>
          <div class="ec-meta">${H.examGo} →</div>
        </button>
        <div class="recent">
          <div class="sec-head"><h3>${H.recent}</h3></div>
          ${overall === null
            ? `<div class="recent-empty">${H.recentEmpty}</div>`
            : `<div class="recent-stats">
                 <div class="rs-item"><span>${H.kAcc}</span><b>${overall}%</b></div>
                 <div class="rs-item"><span>${H.kDone}</span><b>${total.t}</b></div>
                 <div class="rs-item"><span>${H.kAvg}</span><b>${avgMs ? fmtDur(avgMs) : '—'}</b></div>
               </div>
               <div class="dchart">${bars}</div>`}
        </div>
      </section>
    </div>`;

    // 事件
    view.querySelectorAll('[data-type]').forEach(el => {
      el.addEventListener('click', () => {
        state.train.type = el.dataset.type;
        state.train.item = null;
        state.view = 'train';
        renderChrome(); renderTabs(); renderTrain();
      });
    });

    const clearBtn = view.querySelector('#btnClearStats');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        appDialog({
          title: '清空记录',
          text: '会清空所有作答记录和用时统计，此操作不可恢复。',
          ok: '清空', cancel: '取消', danger: true
        }).then((yes) => {
          if (!yes) return;
          try { localStorage.removeItem(DAY_KEY); } catch (e) {}
          renderHome();
        });
        return;
      });
    }

    view.querySelectorAll('[data-go]').forEach(el => {
      el.addEventListener('click', () => {
        state.view = el.dataset.go;
        try {
          if (state.view === 'train') { renderChrome(); renderTabs(); renderTrain(); }
          else { renderChrome(); switchMode('exam'); }
        } catch (err) {
          document.title = 'ERR: ' + (err && err.message);
          console.error(err);
        }
      });
    });
  }

  function renderTrain() {
    renderChrome();
    const s = state.train;
    if (!s.item) { s.item = drawItem(s.type); s.lastId = s.item.id; s.startedAt = Date.now(); s.elapsed = 0; }
    const q = s.item;
    const rate = s.total ? Math.round(s.correct / s.total * 100) + '%' : '—';

    view.innerHTML = `
      <div class="toolbar">
        <label class="field">${t('typeFilter')}<select id="selType">${typeOptions(s.type)}</select></label>
        <div style="margin-left:auto;display:flex;align-items:center;gap:12px">
          <span style="font-size:12.5px;color:var(--faint)">${t('bankSize')} ${POOL.length}</span>
          <button class="btn" id="btnReset" data-act="reset" type="button">${t('resetStats')}</button>
        </div>
      </div>

      <div class="statbar">
        <span>${t('answered')} <b>${s.total}</b></span>
        <span>${t('correct')} <b>${s.correct}</b></span>
        <span>${t('rate')} <b>${rate}</b></span>
        <span>${t('streak')} <b>${s.streak}</b></span>
      </div>

      <div class="card">
        <div class="qhead">
          <span class="tag">${TYPE_INFO[q.type].label[lang]}</span>
          <span class="qtitle">${TYPE_INFO[q.type].title[lang]}</span>
        </div>
        <div class="workarea ${LAYOUT_SINGLE.indexOf(q.type) >= 0 ? 'single' : ''}">
          <div class="wa-left">
            ${q.qText ? `<div class="qtext">${escapeHTML(stemText(q))}</div>` : ''}
          </div>
          <div class="wa-right">${pdfCard(q, s)}</div>
        </div>
        <div class="actions">
          <button class="btn" id="btnSkip" data-act="skip" type="button">${t('skip')}</button>
          <div class="right">
            <button class="btn primary" id="btnNext" data-act="next" type="button" ${s.answered ? '' : 'disabled'}>${t('next')}</button>
          </div>
        </div>
      </div>
    `;


    view.querySelector('#btnReset').addEventListener('click', () => {
      s.total = 0; s.correct = 0; s.streak = 0; renderTrain();
    });
    view.querySelector('#btnSkip').addEventListener('click', newTrainItem);
    view.querySelector('#btnNext').addEventListener('click', newTrainItem);

    if (state.train.item && state.train.item.cal && window.Calendar) {
      if (!state.train.pickedDays) state.train.pickedDays = [];
      window.Calendar.bind(view, state.train.item.cal, state.train, renderTrain);
    }

    if (state.train.item && state.train.item.mem && window.MemoryType) {
      window.MemoryType.bind(view, state.train.item.mem, state.train, renderTrain);
    }

    if (state.train.item && state.train.item.conn && window.ConnectType) {
      window.ConnectType.bind(view, state.train.item.conn, state.train, renderTrain);
    }

    if (state.train.item && state.train.item.comb && window.CombinationType) {
      window.CombinationType.bind(view, state.train.item.comb, state.train, renderTrain);
    }

    if (state.train.item && state.train.item.star && window.StarType) {
      window.StarType.bind(view, state.train.item.star, state.train, renderTrain);
    }

    if (state.train.item && state.train.item.tag && window.TaggingType) {
      window.TaggingType.bind(view, state.train.item.tag, state.train, renderTrain);
    }

    if (state.train.item && state.train.item.chart && window.ChartType) {
      window.ChartType.bind(view, state.train.item.chart, state.train, renderTrain);
    }

    if (state.train.item && state.train.item.sched) {
      const sc = state.train.item.sched;
      if (sc.mode === 'lanes') window.Schedule.bindLanes(view, sc, state.train, renderTrain);
      else window.Schedule.bind(view, sc, state.train, renderTrain);
    }

    view.querySelectorAll('[data-face]').forEach(el => {
      el.addEventListener('click', () => {
        if (s.revealed) return;
        if (!s.userCols) s.userCols = new Array(16).fill('w');
        const i = parseInt(el.dataset.face, 10);
        s.userCols[i] = window.Figure.nextColor(s.userCols[i]);
        renderTrain();
      });
    });

    const imgBtn = view.querySelector('#btnToggleImg');
    if (imgBtn) {
      const wrap = view.querySelector('#qimgwrap');
      imgBtn.addEventListener('click', () => {
        const hidden = wrap.classList.toggle('hidden');
        imgBtn.textContent = hidden ? t('showImage') : t('hideImage');
      });
    }

    const revBtn = view.querySelector('#btnReveal');
    if (revBtn) revBtn.addEventListener('click', () => {
      if (s.answered) return;
      s.revealed = true;
      s.answered = true;
      const ok = judgeItem(s.item, s);
      const elapsed = s.startedAt ? Date.now() - s.startedAt : 0;
      s.elapsed = elapsed;
      recordDay(ok, elapsed);
      if (s.item && s.item.id) markSeen(s.item.id);
      s.total++;
      if (ok) { s.correct++; s.streak++; } else { s.streak = 0; }
      renderTrain();
    });

    view.querySelectorAll('[data-opt]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (s.answered) return;
        s.picked = parseInt(btn.dataset.opt, 10);
        s.answered = true;
        s.total++;
        if (s.picked === q.answerIndex) { s.correct++; s.streak++; } else { s.streak = 0; }
        renderTrain();
      });
    });
  }

  /* ---------------- 模拟考试 ---------------- */
  function countChoices() {
    const want = [12, 24, 36];
    const all = want.filter(c => c <= POOL.length);
    return all.length ? all : [POOL.length];
  }
  function durationChoices() { return [18, 36, 45]; }

  function examCandidates(scope) {
    const seen = loadSeen();
    if (scope === 'unseen') {
      const pool = POOL.filter(q => !seen[q.id]);
      return pool.length >= 6 ? pool : POOL;
    }
    if (scope === 'seen') {
      const pool = POOL.filter(q => seen[q.id]);
      return pool.length >= 6 ? pool : POOL;
    }
    return POOL;
  }

  function renderExamConfig() {
    const e = state.exam;
    const counts = countChoices();
    if (counts.indexOf(e.count) < 0) e.count = counts[0];
    view.innerHTML = `
      <div class="card center" style="padding:44px 24px">
        <h2 style="margin:0 0 10px;font-size:22px;color:var(--navy)">${t('examTitle')}</h2>
        <p style="color:var(--muted);font-size:14px;margin:0 auto 26px;max-width:520px">${t('examDesc')}</p>
        <div class="toolbar" style="display:inline-flex;justify-content:center;border:0;box-shadow:none;background:transparent;padding:0;margin-bottom:26px">
          <label class="field">${t('numQuestions')}
            <select id="selCount">${counts.map(n => `<option value="${n}" ${n === e.count ? 'selected' : ''}>${n}</option>`).join('')}</select>
          </label>
          <label class="field">${t('timeLimit')}
            <select id="selDur">${durationChoices().map(n => `<option value="${n}" ${n === e.durationMin ? 'selected' : ''}>${n} ${t('minutes')}</option>`).join('')}</select>
          </label>
          <label class="field">抽题范围
            <select id="selScope">
              <option value="all" ${e.scope === 'all' ? 'selected' : ''}>不区分</option>
              <option value="unseen" ${e.scope === 'unseen' ? 'selected' : ''}>只抽没做过的</option>
              <option value="seen" ${e.scope === 'seen' ? 'selected' : ''}>只抽做过的</option>
            </select>
          </label>
        </div>
        <div><button class="btn primary" id="btnStart" type="button" style="padding:11px 34px">${t('startExam')}</button></div>
      </div>
    `;
    view.querySelector('#selCount').addEventListener('change', (ev) => { e.count = parseInt(ev.target.value, 10); });
    view.querySelector('#selDur').addEventListener('change', (ev) => { e.durationMin = parseInt(ev.target.value, 10); });
    view.querySelector('#selScope').addEventListener('change', (ev) => { e.scope = ev.target.value; });
    view.querySelector('#btnStart').addEventListener('click', startExam);
  }

  function startExam() {
    const e = state.exam;
    const pool = examCandidates(e.scope || 'all');
    const n = Math.min(e.count, pool.length);
    e.items = shuffleArr(pool).slice(0, n);
    e.answers = new Array(e.items.length).fill(-1);
    e.states = e.items.map(() => ({ placed: {}, pickedDays: [], userCols: new Array(16).fill('w'), pick: null, revealed: false, answered: false }));
    e.idx = 0;
    e.phase = 'running';
    e.autoSubmitted = false;
    e.remaining = e.durationMin * 60;
    e.startedAt = Date.now();
    if (e.timer) clearInterval(e.timer);
    e.timer = setInterval(() => {
      e.remaining--;
      const clock = document.getElementById('clock');
      if (clock) {
        clock.textContent = fmtTime(e.remaining);
        if (e.remaining <= 60) clock.classList.add('warn');
      }
      if (e.remaining <= 0) { clearInterval(e.timer); e.timer = null; submitExam(true); }
    }, 1000);
    renderExam();
  }

  function fmtTime(sec) {
    const s = Math.max(0, sec);
    return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
  }

  function renderExam() {
    const e = state.exam;
    if (!e.items.length) { renderExamConfig(); return; }
    const q = e.items[e.idx];
    const pct = Math.round(((e.idx + 1) / e.items.length) * 100);
    const answeredCount = e.answers.filter(a => a >= 0).length;

    const palette = e.items.map((_, i) =>
      `<button type="button" data-jump="${i}" class="${e.answers[i] >= 0 ? 'done' : ''} ${i === e.idx ? 'cur' : ''}">${i + 1}</button>`
    ).join('');

    view.innerHTML = `
      <div class="exambar">
        <div class="clock" id="clock">${fmtTime(e.remaining)}</div>
        <div class="progress"><div class="bar"><i style="width:${pct}%"></i></div></div>
        <div style="font-size:13px;color:var(--muted);white-space:nowrap">
          ${t('question')} <b style="color:var(--ink)">${e.idx + 1}</b> ${t('of')} ${e.items.length}
          · ${answeredCount}/${e.items.length}
        </div>
      </div>

      <div class="card">
        <div class="qhead">
          <span class="tag">${TYPE_INFO[q.type].label[lang]}</span>
          <span class="qtitle">${TYPE_INFO[q.type].title[lang]}</span>
        </div>
        <div class="workarea">
          <div class="wa-left">
            ${q.qText ? `<div class="qtext">${escapeHTML(stemText(q))}</div>` : ''}
          </div>
          <div class="wa-right">${pdfCard(q, e.states[e.idx], () => renderExam())}</div>
        </div>
        <div class="actions">
          <button class="btn" id="btnPrev" type="button" ${e.idx === 0 ? 'disabled' : ''}>${t('prevQ')}</button>
          <div class="right">
            <button class="btn" id="btnNextQ" type="button" ${e.idx === e.items.length - 1 ? 'disabled' : ''}>${t('nextQ')}</button>
            <button class="btn navy" id="btnSubmit" type="button">${t('submit')}</button>
          </div>
        </div>
      </div>

      <div class="palette">${palette}</div>
    `;

    view.querySelectorAll('[data-opt]').forEach(btn => {
      btn.addEventListener('click', () => {
        e.answers[e.idx] = parseInt(btn.dataset.opt, 10);
        renderExam();
      });
    });
    view.querySelectorAll('[data-jump]').forEach(btn => {
      btn.addEventListener('click', () => { e.idx = parseInt(btn.dataset.jump, 10); renderExam(); });
    });
    view.querySelector('#btnPrev').addEventListener('click', () => { if (e.idx > 0) { e.idx--; renderExam(); } });
    view.querySelector('#btnNextQ').addEventListener('click', () => { if (e.idx < e.items.length - 1) { e.idx++; renderExam(); } });
    view.querySelector('#btnSubmit').addEventListener('click', () => {
      const un = e.answers.filter(a => a < 0).length;
      if (un > 0) {
        appDialog({
          title: t('confirmSubmit'),
          text: t('confirmSubmitHint') || '',
          ok: '交卷', cancel: '继续答题'
        }).then((yes) => { if (yes) submitExam(false); });
        return;
      }
      submitExam(false);
    });
  }

  function submitExam(auto) {
    const e = state.exam;
    if (e.timer) { clearInterval(e.timer); e.timer = null; }
    e.phase = 'done';
    e.autoSubmitted = !!auto;
    e.timeUsed = Math.min(e.durationMin * 60, Math.round((Date.now() - e.startedAt) / 1000));
    renderExamResult();
  }

  function renderExamResult() {
    const e = state.exam;
    let correct = 0;
    const perType = {};
    e.items.forEach((q, i) => {
      const ok = judgeItem(q, e.states[i]);
      if (ok) correct++;
      if (!perType[q.type]) perType[q.type] = { n: 0, ok: 0 };
      perType[q.type].n++;
      if (ok) perType[q.type].ok++;
    });
    const pct = Math.round(correct / e.items.length * 100);
    const un = e.answers.filter(a => a < 0).length;

    const breakdown = Object.keys(perType).map(k => {
      const d = perType[k];
      const p = Math.round(d.ok / d.n * 100);
      return `<div class="brow">
        <span class="name">${TYPE_INFO[k].label[lang]}</span>
        <span class="bar"><i style="width:${p}%"></i></span>
        <span class="val">${d.ok}/${d.n}</span>
      </div>`;
    }).join('');

    const review = e.items.map((q, i) => {
      const ok = judgeItem(q, e.states[i]);
      const mineTxt = ok ? '✓' : '✗';
      const stemMini = '';

      return `<div class="review-item ${ok ? 'right' : 'miss'}">
        <div class="review-head">
          <span>#${i + 1}</span>
          <span class="tag">${TYPE_INFO[q.type].label[lang]}</span>
          <span class="verdict">${ok ? '✓' : '✗'}</span>
          <span>${t('yourAnswer')}: <b>${mineTxt}</b> · ${t('correctAnswer')}: <b>${letters[q.answerIndex]}</b></span>
        </div>
        <div class="review-body">
          <div class="review-figs mini">${stemMini}</div>
        </div>
        <div class="review-exp">${q.explanation[lang]}</div>
      </div>`;
    }).join('');

    view.innerHTML = `
      ${e.autoSubmitted ? `<div class="feedback show bad" style="margin-bottom:16px"><div class="res">⏱ ${t('timeUp')}</div></div>` : ''}
      <div class="card">
        <div class="score-hero">
          <div class="score-num">${pct}%</div>
          <div class="score-lbl">${t('yourScore')}</div>
          <div class="score-meta">
            <div><b>${correct}/${e.items.length}</b>${t('correct')}</div>
            <div><b>${fmtTime(e.timeUsed)}</b>${t('timeUsed')}</div>
            <div><b>${un}</b>${t('unanswered')}</div>
          </div>
        </div>

        <div class="breakdown">
          <h3>${t('breakdownTitle')}</h3>
          ${breakdown}
        </div>

        <div class="review">
          <h3>${t('reviewTitle')}</h3>
          ${review}
        </div>

        <div class="actions" style="margin-top:22px">
          <button class="btn" id="btnBack" type="button">${t('backToTrain')}</button>
          <div class="right"><button class="btn primary" id="btnAgain" type="button">${t('restart')}</button></div>
        </div>
      </div>
    `;

    view.querySelector('#btnAgain').addEventListener('click', () => { state.exam.phase = 'config'; renderExamConfig(); });
    view.querySelector('#btnBack').addEventListener('click', () => { switchMode('train'); });
  }

  /* ---------------- 模式 ---------------- */
  function switchMode(mode) {
    state.mode = mode;
    if (mode === 'train') renderTrain();
    else if (state.exam.phase === 'running') renderExam();
    else if (state.exam.phase === 'done') renderExamResult();
    else renderExamConfig();
    renderTabs();
  }

  function renderTabs() {
    const bar = document.querySelector('.modes');
    if (bar) bar.style.display = state.view === 'home' ? 'none' : '';
    document.querySelectorAll('.modes button').forEach(b => {
      b.classList.toggle('on', b.dataset.mode === state.mode);
    });
  }

  function renderChrome() {
    if (backBtn) backBtn.style.display = state.view === 'home' ? 'none' : '';
    document.getElementById('appTitle').textContent = t('appTitle');
    document.getElementById('appSub').textContent = t('appSub');
    document.querySelectorAll('.lang button').forEach(b => b.classList.toggle('on', b.dataset.lang === lang));
    document.querySelectorAll('.modes button').forEach(b => {
      b.textContent = b.dataset.mode === 'train' ? t('modeTrain') : t('modeExam');
    });
  }

  const backBtn = document.getElementById('btnHome');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      state.view = 'home';
      renderChrome();
      renderTabs();
      renderHome();
      window.scrollTo({ top: 0 });
    });
  }
  const brandEl = document.querySelector('.brand');
  if (brandEl) {
    brandEl.style.cursor = 'pointer';
    brandEl.addEventListener('click', () => {
      state.view = 'home';
      renderTabs();
      renderHome();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  document.querySelectorAll('.lang button').forEach(b => {
    b.addEventListener('click', () => {
      lang = b.dataset.lang;
      localStorage.setItem('rg-lang', lang);
      document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
      renderChrome();
      if (state.view === 'home') {
        renderTabs();
        renderHome();
      } else if (state.exam.phase === 'running') {
        renderExam();
      } else if (state.exam.phase === 'done') {
        renderExamResult();
      } else {
        switchMode(state.mode);
      }
    });
  });
  document.querySelectorAll('.modes button').forEach(b => {
    b.addEventListener('click', () => switchMode(b.dataset.mode));
  });

  /* ---------------- 事件委托（不受重渲染影响） ---------------- */
  view.addEventListener('change', (e) => {
    const el = e.target;
    if (!el || !el.id) return;
    if (el.id === 'selType') {
      state.train.type = el.value;
      newTrainItem();
    }
  });
  view.addEventListener('click', (e) => {
    const el = e.target.closest && e.target.closest('[data-act]');
    if (!el) return;
    const act = el.dataset.act;
    if (act === 'reset') {
      const s = state.train;
      s.total = 0; s.correct = 0; s.streak = 0; renderTrain();
    } else if (act === 'skip' || act === 'next') {
      newTrainItem();
    }
  });

  /* ---------------- 键盘 ---------------- */
  document.addEventListener('keydown', (ev) => {
    if (ev.target.tagName === 'SELECT' || ev.target.tagName === 'INPUT') return;
    const n = parseInt(ev.key, 10);

    if (state.mode === 'train') {
      const s = state.train;
      if (n >= 1 && n <= 6) {
        const i = n - 1;
        if (!s.answered && s.item && s.item.options && i < s.item.options.length) {
          s.picked = i; s.answered = true; s.total++;
          if (i === s.item.answerIndex) { s.correct++; s.streak++; } else { s.streak = 0; }
          renderTrain();
        }
      } else if (ev.key === 'Enter' || ev.key === ' ') {
        if (s.item && s.item.kind && !s.revealed) {
          ev.preventDefault(); s.revealed = true; renderTrain();
        } else if (s.answered) {
          ev.preventDefault(); newTrainItem();
        }
      }
      return;
    }

    if (state.mode === 'exam' && state.exam.phase === 'running') {
      const e = state.exam;
      if (n >= 1 && n <= 6) {
        const i = n - 1;
        if (i < e.items[e.idx].options.length) { e.answers[e.idx] = i; renderExam(); }
      } else if (ev.key === 'ArrowLeft') {
        if (e.idx > 0) { e.idx--; renderExam(); }
      } else if (ev.key === 'ArrowRight') {
        if (e.idx < e.items.length - 1) { e.idx++; renderExam(); }
      }
    }
  });

  /* ---------------- 启动 ---------------- */
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  renderChrome();
  renderTabs();
  if (!POOL.length) {
    view.innerHTML = '<div class="card">题库为空，请检查 bank.js。</div>';
  } else {
    // 支持 ?id=PDF58 直接打开某一题
    let deepQid = null;
    try {
      const qid = new URLSearchParams(location.search).get('id');
      if (qid) {
        const it = POOL.find(q => q.id === qid);
        if (it) { state.train.type = it.type; state.train.item = it; state.train.lastId = it.id; }
        deepQid = qid;
      }
    } catch (err) { /* ignore */ }

    // 支持 ?type= 直接定位题型
    let deepType = null;
    try {
      const qt = new URLSearchParams(location.search).get('type');
      if (qt && TYPES.indexOf(qt) >= 0) { state.train.type = qt; state.train.item = null; deepType = qt; }
    } catch (err) { /* ignore */ }

    const hash = (location.hash || '').replace('#', '');
    if (hash === 'exam' || hash === 'exam-run') {
      state.view = 'exam';
      switchMode('exam');
      if (hash === 'exam-run') startExam();
    } else if (deepQid || deepType) {
      state.view = 'train';
      renderTrain();
    } else {
      state.view = 'home';
      renderTabs();
      renderHome();
    }
  }
})();
