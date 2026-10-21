/* ============================================================
 * 组合变化：给出初始箭头和目标箭头，选择能让二者一致的按钮组合
 * cfg = {
 *   buttons: [{id,label}],
 *   answer: [id...],
 *   initial: {rot, shape, dashed, thin, pattern},
 *   target:  {rot, shape, dashed, thin, pattern}
 * }
 * ============================================================ */
(function (root) {
  'use strict';

  let uid = 0;

  function defaults(o) {
    return Object.assign({ rot: 45, shape: 'circle', dashed: true, thin: false, pattern: false }, o || {});
  }

  function arrowSVG(st, size) {
    const pid = 'arrowpat' + (++uid);
    const box = st.shape === 'square'
      ? `<rect x="26" y="26" width="68" height="68" rx="6" fill="none"
           stroke="#6a994e" stroke-width="1.6" ${st.dashed ? 'stroke-dasharray="5 4"' : ''}/>`
      : `<circle cx="60" cy="60" r="34" fill="none"
           stroke="#6a994e" stroke-width="1.6" ${st.dashed ? 'stroke-dasharray="5 4"' : ''}/>`;
    const w = st.thin ? 5 : 12;              // 箭杆粗细
    const head = st.thin ? 11 : 18;
    const fill = st.pattern ? `url(#${pid})` : '#6a994e';
    return `<svg viewBox="0 0 120 120" width="${size}" height="${size}">
      <defs><pattern id="${pid}" width="7" height="7" patternUnits="userSpaceOnUse">
        <rect width="7" height="7" fill="#8fb46a"/>
        <circle cx="2.2" cy="2.2" r="1.1" fill="#ffffff"/>
        <circle cx="5.4" cy="5.4" r="1.1" fill="#3f5f33"/></pattern></defs>
      ${box}
      <g transform="rotate(${st.rot} 60 60)">
        <line x1="60" y1="60" x2="88" y2="60" stroke="${fill}" stroke-width="${w}" stroke-linecap="round"/>
        <polygon points="98,60 80,${60 - head / 1.5} 80,${60 + head / 1.5}" fill="${fill}"/>
      </g>
    </svg>`;
  }

  // 每个按钮对箭头状态的作用
  const EFFECTS = {
    ccw90: s => ({ rot: s.rot - 90 }),
    ccw45: s => ({ rot: s.rot - 45 }),
    square: s => ({ shape: 'square' }),
    thin: s => ({ thin: true }),
    pattern: s => ({ pattern: true }),
    solid: s => ({ dashed: false })
  };

  function applyEffects(cfg, sel) {
    let s = defaults(cfg.initial);
    (cfg.buttons || []).forEach(b => {
      if (sel.indexOf(b.id) >= 0 && EFFECTS[b.id]) {
        s = Object.assign(s, EFFECTS[b.id](s));
      }
    });
    return s;
  }

  function render(cfg, st) {
    const sel = st.sel || [];
    const cur = applyEffects(cfg, sel);
    const tgt = defaults(cfg.target);
    const btns = cfg.buttons.map((b, i) => {
      const on = sel.indexOf(b.id) >= 0;
      // 有 arrowMode 时只显示编号，让用户自己试出每个按钮的作用
      const label = cfg.arrowMode ? (i + 1) : b.label;
      return `<button class="cbtn ${on ? 'on' : ''} ${cfg.arrowMode ? 'num' : ''}"
        data-btn="${b.id}" type="button">${label}</button>`;
    }).join('');
    const showArrow = !!(cfg.initial && cfg.target);
    const arrowRow = showArrow
      ? `<div class="arow">
          <div class="abox"><div class="alabel">当前</div>${arrowSVG(cur, 132)}</div>
          <div class="aeq">=</div>
          <div class="abox"><div class="alabel">目标</div>${arrowSVG(tgt, 132)}</div>
        </div>`
      : '';
    const hint = sel.length
      ? (cfg.arrowMode
          ? '已选中：' + sel.map(id => (cfg.buttons.findIndex(b => b.id === id) + 1)).join('、') + ' 号按钮'
          : sel.map(id => (cfg.buttons.find(b => b.id === id) || {}).label).join('、'))
      : (cfg.arrowMode ? '逐个点击按钮，观察箭头如何变化' : '选择符合题意的项目');
    return `<div class="comb">
      ${arrowRow}
      <div class="cgrid">${btns}</div>
      <div class="cal-summary"><b>已选 ${sel.length} 个</b><span>${hint}</span></div>
    </div>`;
  }

  function bind(rootEl, cfg, st, onChange) {
    if (!st.sel) st.sel = [];
    rootEl.querySelectorAll('[data-btn]').forEach(el => {
      el.addEventListener('click', () => {
        if (st.revealed) return;
        const id = el.dataset.btn;
        const k = st.sel.indexOf(id);
        if (k >= 0) st.sel.splice(k, 1); else st.sel.push(id);
        onChange();
      });
    });
  }

  function check(cfg, st) {
    const a = (cfg.answer || []).slice().sort().join(',');
    const b = (st.sel || []).slice().sort().join(',');
    return { ok: a === b };
  }

  root.CombinationType = { render, bind, check, arrowSVG, applyEffects };
})(window);
