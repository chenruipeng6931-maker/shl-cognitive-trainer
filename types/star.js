/* ============================================================
 * 星形序列题：六芒星 7 区域填色
 * cfg = { seq:[code,code,code], ans:code }
 * code: 7 位字符串，顺序=右下,中心,上,右上,下,左下,左上
 *       w=空白 g=绿色 c=花纹
 * ============================================================ */
(function (root) {
  'use strict';
  const F = window.HEXFACES || [];
  const CYCLE = ['w', 'g', 'c'];
  let uid = 0;

  function fillOf(code, pid) {
    if (code === 'g') return '#6a994e';
    if (code === 'c') return `url(#${pid})`;
    return 'transparent';
  }

  function svg(cols, size, opt) {
    opt = opt || {};
    const pid = 'hexpat' + (++uid);
    const parts = [];
    parts.push(`<svg class="hexsvg" viewBox="-1 -1.15 2 2.3" width="${size}" height="${(size*1.15)|0}">`);
    parts.push(`<defs><pattern id="${pid}" width="0.09" height="0.09" patternUnits="userSpaceOnUse">
      <rect width="0.09" height="0.09" fill="#fff"/>
      <circle cx="0.045" cy="0.045" r="0.018" fill="#6c5ce7"/></pattern></defs>`);
    F.forEach((f, i) => {
      const pts = f.map(p => p[0] + ',' + p[1]).join(' ');
      const bad = opt.diff && opt.diff[i];
      const stroke = bad ? '#dc2626' : '#9AA6B6';
      const sw = bad ? 0.045 : 0.022;
      const cur = opt.interactive ? ' style="cursor:pointer"' : '';
      const df = opt.interactive ? ` data-hf="${i}"` : '';
      parts.push(`<polygon points="${pts}" fill="${fillOf(cols[i] || 'w', pid)}"
        stroke="${stroke}" stroke-width="${sw}"${cur}${df}/>`);
    });
    parts.push('</svg>');
    return parts.join('');
  }

  function render(cfg, st) {
    const cols = st.userHex || new Array(7).fill('w');
    let html = '<div class="starcard">';
    html += '<div class="figrow">'
      + cfg.seq.map(c => `<div class="figbox">${svg(c, 150)}</div>`).join('<span class="arrow">→</span>')
      + `<span class="arrow">→</span><div class="figbox blank">?</div></div>`;
    if (!st.revealed) {
      html += `<div class="canvasbox"><div class="figbox big">${svg(cols, 300, { interactive: true })}</div>
        <div class="canvasnote">点击区域填色：空白 → 绿色 → 花纹 → 空白</div></div>
        <div class="actions"><div class="right">
          <button class="btn primary" id="btnReveal" type="button">提交答案</button></div></div>`;
      return html + '</div>';
    }
    const ans = cfg.ans || 'wwwwwww';
    const diff = cols.map((c, i) => c !== ans[i]);
    const n = diff.filter(Boolean).length;
    html += `<div class="figcompare">
      <div class="figbox"><div class="figcap">你的作答</div>${svg(cols, 230, { diff })}</div>
      <div class="figbox"><div class="figcap">正确答案</div>${svg(ans, 230)}</div></div>`;
    html += `<div class="feedback show ${n ? 'bad' : 'good'}">
      <div class="res">${n ? '✗ 有 ' + n + ' 个区域与答案不同' : '✓ 全部正确'}</div></div>`;
    return html + '</div>';
  }

  function bind(rootEl, cfg, st, onChange) {
    if (!st.userHex) st.userHex = new Array(7).fill('w');
    rootEl.querySelectorAll('[data-hf]').forEach(el => {
      el.addEventListener('click', () => {
        if (st.revealed) return;
        const i = parseInt(el.dataset.hf, 10);
        const k = CYCLE.indexOf(st.userHex[i]);
        st.userHex[i] = CYCLE[(k + 1) % CYCLE.length];
        onChange();
      });
    });
  }

  function check(cfg, st) {
    const ans = cfg.ans || '';
    const got = (st.userHex || []).join('');
    return { ok: got === ans };
  }

  root.StarType = { render, bind, check };
})(window);
