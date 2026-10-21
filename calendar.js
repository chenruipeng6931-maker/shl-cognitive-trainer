/* ============================================================
 * 日历组件：月视图 + 点选日期
 * 每个格子显示「日期 + 星期」，选中后高亮并汇总
 * ============================================================ */
(function (root) {
  'use strict';
  const WD = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const WD_CN = ['日', '一', '二', '三', '四', '五', '六'];

  function render(cfg, st) {
    const picked = (st && st.pickedDays) || [];
    const wk = cfg.startWeekday;

    const head = WD.map((d, i) =>
      `<div class="${i === 0 || i === 6 ? 'wkend' : ''}">${WD_CN[i]}</div>`).join('');

    let cells = '';
    for (let i = 0; i < wk; i++) cells += '<div class="cal-cell empty"></div>';
    for (let d = 1; d <= cfg.days; d++) {
      const dow = (wk + d - 1) % 7;
      const on = picked.indexOf(d) >= 0;
      const weekend = dow === 0 || dow === 6;
      cells += `<div class="cal-cell ${on ? 'on' : ''} ${weekend ? 'wkend' : ''}" data-day="${d}" title="${d} 号 周${WD_CN[dow]}">
        <span class="dnum">${d}</span><span class="dwd">${WD_CN[dow]}</span></div>`;
    }

    const summary = picked.length
      ? picked.slice().sort((a, b) => a - b).map(d => d + ' 号').join('、')
      : '尚未选择';

    return `<div class="cal" id="cal">
      <div class="cal-head">${head}</div>
      <div class="cal-grid">${cells}</div>
      <div class="cal-summary"><b>已选 ${picked.length} 天</b><span>${summary}</span></div>
      ${cfg.hint ? `<div class="shelp">${cfg.hint}</div>` : ''}
    </div>`;
  }

  function bind(rootEl, cfg, st, onChange) {
    rootEl.querySelectorAll('[data-day]').forEach(el => {
      el.addEventListener('click', () => {
        const d = parseInt(el.dataset.day, 10);
        if (!st.pickedDays) st.pickedDays = [];
        const k = st.pickedDays.indexOf(d);
        if (k >= 0) st.pickedDays.splice(k, 1); else st.pickedDays.push(d);
        onChange();
      });
    });
  }

  root.Calendar = { render, bind };
})(window);
