/* ============================================================
 * 图表分析：饼图（拖动扇区边界）
 * 拖动过程中只更新 SVG 节点，不触发整页重渲染
 * ============================================================ */
(function (root) {
  'use strict';

  const R = 100, CX = 130, CY = 130;
  const COLORS = ['#3b6ea5', '#6a994e', '#a44a3f', '#c08a3e', '#6b5b8e', '#4a8f8a'];

  function polar(deg) {
    const rad = (deg - 90) * Math.PI / 180;
    return [CX + R * Math.cos(rad), CY + R * Math.sin(rad)];
  }
  function sectorPath(a0, a1) {
    const [x0, y0] = polar(a0), [x1, y1] = polar(a1);
    const large = (a1 - a0) > 180 ? 1 : 0;
    return `M ${CX} ${CY} L ${x0.toFixed(2)} ${y0.toFixed(2)}
      A ${R} ${R} 0 ${large} 1 ${x1.toFixed(2)} ${y1.toFixed(2)} Z`;
  }
  function normalized(vals) {
    const sum = vals.reduce((a, b) => a + b, 0) || 1;
    return vals.map(v => v / sum * 100);
  }

  /** 只更新已存在的 SVG 节点，用于拖动过程 */
  function paint(svg, n, vals) {
    const pct = normalized(vals);
    let acc = 0;
    const paths = svg.querySelectorAll('[data-sector]');
    const texts = svg.querySelectorAll('[data-label]');
    const handles = svg.querySelectorAll('.chandle');
    for (let i = 0; i < n; i++) {
      const a0 = acc, a1 = acc + pct[i] * 3.6;
      acc = a1;
      if (paths[i]) paths[i].setAttribute('d', sectorPath(a0, a1));
      if (texts[i]) {
        const mid = (a0 + a1) / 2;
        const [lx, ly] = polar(mid);
        texts[i].setAttribute('x', (CX + (lx - CX) * 0.62).toFixed(1));
        texts[i].setAttribute('y', (CY + (ly - CY) * 0.62).toFixed(1));
        texts[i].textContent = pct[i].toFixed(0) + '%';
      }
    }
    acc = 0;
    for (let i = 0; i < n - 1; i++) {
      acc += pct[i] * 3.6;
      const [hx, hy] = polar(acc);
      if (handles[i]) { handles[i].setAttribute('cx', hx.toFixed(2)); handles[i].setAttribute('cy', hy.toFixed(2)); }
    }
  }

  function seriesOf(cfg) {
    if (cfg.series && cfg.series.length) return cfg.series;
    return [{ label: '', answer: cfg.answer }];
  }

  function renderOne(cfg, vals, n, idx) {
    const pct = normalized(vals);
    let acc = 0, paths = '', labels = '', handles = '';
    for (let i = 0; i < n; i++) {
      const a0 = acc, a1 = acc + pct[i] * 3.6;
      acc = a1;
      paths += `<path data-sector="${i}" d="${sectorPath(a0, a1)}"
        fill="${cfg.items[i].color || COLORS[i % COLORS.length]}"/>`;
      const mid = (a0 + a1) / 2;
      const [lx, ly] = polar(mid);
      labels += `<text data-label="${i}" x="${(CX + (lx - CX) * 0.62).toFixed(1)}"
        y="${(CY + (ly - CY) * 0.62).toFixed(1)}" text-anchor="middle"
        dominant-baseline="middle" font-size="12" fill="#fff" font-weight="700"
        pointer-events="none">${pct[i].toFixed(0)}%</text>`;
    }
    acc = 0;
    for (let i = 0; i < n - 1; i++) {
      acc += pct[i] * 3.6;
      const [hx, hy] = polar(acc);
      handles += `<circle class="chandle" data-i="${i}" data-series="${idx}" cx="${hx.toFixed(2)}" cy="${hy.toFixed(2)}"
        r="10" fill="#fff" stroke="#9aa3af" stroke-width="1.5" style="cursor:grab;touch-action:none"/>`;
    }
    return `<svg class="piesvg" data-series="${idx}" viewBox="0 0 260 260" width="240" height="240" style="touch-action:none">
      ${paths}${labels}${handles}</svg>`;
  }

  function renderBar(cfg, st) {
    const vals = (st && st.barVals) || cfg.items.map(() => 0);
    const max = Math.max(10, ...vals, ...(cfg.answer || []));
    const scale = 220 / max;
    const cols = cfg.items.map((it, i) => {
      const h = Math.max(2, vals[i] * scale);
      return `<div class="barcol">
        <div class="barval">${vals[i] ? vals[i] + '%' : ''}</div>
        <div class="barwrap" data-bar="${i}">
          <div class="barfill" style="height:${h}px;background:${it.color || COLORS[i % COLORS.length]}"></div>
        </div>
        <div class="barname">${it.name}</div></div>`;
    }).join('');
    const clues = (cfg.clues && cfg.clues.length)
      ? `<div class="cclues">${cfg.clues.map(c => `<div class="cclue"><b>${c.name}</b>${c.text}</div>`).join('')}</div>`
      : '';
    return `<div class="chart" id="chart">${clues}
      <div class="barchart">${cols}</div>
      <div class="shelp">拖动柱子的上边缘调整高度</div></div>`;
  }

  function bindBar(rootEl, cfg, st, onChange) {
    if (!st.barVals) st.barVals = cfg.items.map(() => 0);
    rootEl.querySelectorAll('[data-bar]').forEach(el => {
      const i = parseInt(el.dataset.bar, 10);
      let dragging = false;
      el.addEventListener('pointerdown', (e) => {
        dragging = true;
        e.preventDefault();
        const rect = el.getBoundingClientRect();
        const set = (clientY) => {
          const h = Math.max(0, rect.bottom - clientY);
          const max = Math.max(10, ...(cfg.answer || []), 10);
          st.barVals[i] = Math.round(h / 220 * max);
          onChange();
        };
        set(e.clientY);
        const move = (ev) => { if (dragging) set(ev.clientY); };
        const up = () => { dragging = false; window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
        window.addEventListener('pointermove', move);
        window.addEventListener('pointerup', up);
      });
    });
  }

  function renderLine(cfg, st) {
    const n = cfg.xLabels.length;
    const vals = (st && st.lineVals) || cfg.xLabels.map(() => cfg.yMin);
    const yMin = cfg.yMin, yMax = cfg.yMax;
    const W = 620, H = 300, PL = 60, PR = 30, PT = 20, PB = 46;
    const px = i => PL + (W - PL - PR) * (i / Math.max(1, n - 1));
    const py = v => PT + (H - PT - PB) * (1 - (v - yMin) / (yMax - yMin));

    // 网格与刻度
    let grid = '';
    const ticks = 5;
    for (let k = 0; k <= ticks; k++) {
      const v = yMin + (yMax - yMin) * k / ticks;
      const y = py(v);
      grid += `<line x1="${PL}" y1="${y}" x2="${W - PR}" y2="${y}" stroke="#eef2f7" stroke-width="1"/>
        <text x="${PL - 8}" y="${y}" text-anchor="end" dominant-baseline="middle"
          font-size="11" fill="#94a3b8">${v.toFixed(0)}${cfg.yUnit || '%'}</text>`;
    }
    let xlab = '';
    cfg.xLabels.forEach((lb, i) => {
      xlab += `<text x="${px(i)}" y="${H - PB + 22}" text-anchor="middle" font-size="11" fill="#64748b">${lb}</text>`;
    });

    const pts = vals.map((v, i) => [px(i), py(v)]);
    const path = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
    const dots = pts.map((p, i) =>
      `<circle class="ldot" data-line="${i}" cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}"
        r="9" fill="#8cc152" stroke="#fff" stroke-width="2.5" style="cursor:ns-resize;touch-action:none"/>`
    ).join('');

    const clues = (cfg.clues && cfg.clues.length)
      ? `<div class="cclues">${cfg.clues.map(c => `<div class="cclue"><b>${c.name}</b>${c.text}</div>`).join('')}</div>`
      : '';

    return `<div class="chart" id="chart">${clues}
      <svg class="linesvg" id="linesvg" viewBox="0 0 ${W} ${H}" width="100%" style="max-width:${W}px">
        ${grid}${xlab}
        <path d="${path}" fill="none" stroke="#8cc152" stroke-width="3" stroke-linejoin="round"/>
        ${dots}
      </svg>
      <div class="shelp">拖动绿色圆点调整每个数据点</div></div>`;
  }

  function bindLine(rootEl, cfg, st, onChange) {
    if (!st.lineVals) st.lineVals = cfg.xLabels.map(() => cfg.yMin);
    const svg = rootEl.querySelector('#linesvg');
    if (!svg) return;
    const W = 620, H = 300, PL = 60, PR = 30, PT = 20, PB = 46;
    const yMin = cfg.yMin, yMax = cfg.yMax;

    let drag = -1;
    svg.querySelectorAll('.ldot').forEach(el => {
      el.addEventListener('pointerdown', (e) => {
        drag = parseInt(el.dataset.line, 10);
        e.preventDefault();
        e.stopPropagation();
      });
    });

    window.addEventListener('pointermove', (e) => {
      if (drag < 0) return;
      const r = svg.getBoundingClientRect();
      const y = (e.clientY - r.top) / r.height * H;
      let v = yMin + (1 - (y - PT) / (H - PT - PB)) * (yMax - yMin);
      v = Math.max(yMin, Math.min(yMax, v));
      st.lineVals[drag] = Math.round(v * 10) / 10;
      // 直接更新，不重渲染
      const i = drag;
      const n = cfg.xLabels.length;
      const px = k => PL + (W - PL - PR) * (k / Math.max(1, n - 1));
      const py = val => PT + (H - PT - PB) * (1 - (val - yMin) / (yMax - yMin));
      const dots = svg.querySelectorAll('.ldot');
      dots[i].setAttribute('cy', py(st.lineVals[i]).toFixed(1));
      const pts = st.lineVals.map((val, k) => [px(k), py(val)]);
      svg.querySelector('path').setAttribute('d',
        pts.map((p, k) => (k ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' '));
    });
    window.addEventListener('pointerup', () => {
      if (drag >= 0) { drag = -1; onChange(); }
    });
  }

  function renderStacked(cfg, st) {
    const n = cfg.groups.length;
    const vals = (st && st.stackVals) || cfg.groups.map(() => [50, 50]);
    const maxTotal = Math.max(...(cfg.totals || cfg.groups.map(() => 100)));
    const H = 240;
    const cols = cfg.groups.map((g, i) => {
      const total = (cfg.totals || [])[i] || 100;
      const h = H * total / maxTotal;
      const top = H - h;
      const b = vals[i][0];          // 下段百分比
      const split = top + h * (1 - b / 100);
      return `<div class="stackcol">
        <div class="stackval">${total}</div>
        <div class="stackwrap" style="height:${H}px">
          <div class="stackbar" data-stack="${i}" style="top:${top}px;height:${h}px">
            <div class="stackbot" style="height:${(h * b / 100).toFixed(1)}px;background:${(cfg.series[0]||{}).color || '#3b6ea5'}">
              <span>${b}%</span></div>
            <div class="stacktop" style="height:${(h * (100 - b) / 100).toFixed(1)}px;background:${(cfg.series[1]||{}).color || '#6a994e'}">
              <span>${100 - b}%</span></div>
            <div class="stacksplit" style="top:${(h * b / 100).toFixed(1)}px"></div>
          </div>
        </div>
        <div class="stackname">${g}</div></div>`;
    }).join('');
    const legend = (cfg.series || []).map((se, i) =>
      `<span class="clegend"><i style="background:${se.color}"></i>${se.name}</span>`).join('');
    const clues = (cfg.clues && cfg.clues.length)
      ? `<div class="cclues">${cfg.clues.map(c => `<div class="cclue"><b>${c.name}</b>${c.text}</div>`).join('')}</div>`
      : '';
    return `<div class="chart" id="chart">${clues}
      <div class="stackchart" style="height:${H + 48}px">${cols}</div>
      <div class="clegendrow">${legend}</div>
      <div class="shelp">拖动每组柱子中间的分隔线调整比例</div></div>`;
  }

  function bindStacked(rootEl, cfg, st, onChange) {
    if (!st.stackVals) st.stackVals = cfg.groups.map(() => [50, 50]);
    const H = 240;
    const maxTotal = Math.max(...(cfg.totals || cfg.groups.map(() => 100)));
    let drag = -1;

    rootEl.querySelectorAll('[data-stack]').forEach(el => {
      el.addEventListener('pointerdown', (e) => {
        drag = parseInt(el.dataset.stack, 10);
        e.preventDefault();
        e.stopPropagation();
      });
    });

    window.addEventListener('pointermove', (e) => {
      if (drag < 0) return;
      const el = rootEl.querySelector(`[data-stack="${drag}"]`);
      if (!el) return;
      const r = el.getBoundingClientRect();
      const rel = (e.clientY - r.top) / r.height;       // 0=顶 1=底
      let b = (1 - rel) * 100;
      b = Math.max(2, Math.min(98, Math.round(b)));
      st.stackVals[drag] = [b, 100 - b];
      onChange();
    });
    window.addEventListener('pointerup', () => {
      if (drag >= 0) { drag = -1; onChange(); }
    });
  }

  function render(cfg, st) {
    if (cfg.type === 'stacked') return renderStacked(cfg, st);
    if (cfg.type === 'line') return renderLine(cfg, st);
    if (cfg.type === 'bar') return renderBar(cfg, st);
    const n = cfg.items.length;
    const ss = seriesOf(cfg);
    let valsArr = (st && st.values) || ss.map(() => new Array(n).fill(100 / n));
    if (!Array.isArray(valsArr[0])) valsArr = [valsArr];
    const clues = (cfg.clues && cfg.clues.length)
      ? `<div class="cclues">${cfg.clues.map(c => `<div class="cclue"><b>${c.name}</b>${c.text}</div>`).join('')}</div>`
      : '';
    const charts = ss.map((se, i) =>
      `<div class="piebox"><div class="piectl">${se.label || ''}</div>${renderOne(cfg, valsArr[i], n, i)}</div>`
    ).join('');
    const legend = cfg.items.map((it, i) =>
      `<span class="clegend"><i style="background:${it.color || COLORS[i % COLORS.length]}"></i>${it.name}</span>`
    ).join('');
    return `<div class="chart" id="chart">
      ${clues}
      <div class="pierow">${charts}</div>
      <div class="clegendrow">${legend}</div>
      <div class="shelp">拖动扇区边界调整比例，每个饼总和固定为 100%</div>
    </div>`;
  }

  function renderLegacy(cfg, st) {
    const n = cfg.items.length;
    const vals = (st && st.values) ? st.values.slice() : new Array(n).fill(100 / n);
    const pct = normalized(vals);

    let acc = 0, paths = '', labels = '', handles = '';
    for (let i = 0; i < n; i++) {
      const a0 = acc, a1 = acc + pct[i] * 3.6;
      acc = a1;
      paths += `<path data-sector="${i}" d="${sectorPath(a0, a1)}"
        fill="${cfg.items[i].color || COLORS[i % COLORS.length]}"/>`;
      const mid = (a0 + a1) / 2;
      const [lx, ly] = polar(mid);
      labels += `<text data-label="${i}" x="${(CX + (lx - CX) * 0.62).toFixed(1)}"
        y="${(CY + (ly - CY) * 0.62).toFixed(1)}" text-anchor="middle"
        dominant-baseline="middle" font-size="12" fill="#fff" font-weight="700"
        pointer-events="none">${pct[i].toFixed(0)}%</text>`;
    }
    acc = 0;
    for (let i = 0; i < n - 1; i++) {
      acc += pct[i] * 3.6;
      const [hx, hy] = polar(acc);
      handles += `<circle class="chandle" data-i="${i}" cx="${hx.toFixed(2)}" cy="${hy.toFixed(2)}"
        r="10" fill="#fff" stroke="#9aa3af" stroke-width="1.5" style="cursor:grab;touch-action:none"/>`;
    }

    const legend = cfg.items.map((it, i) =>
      `<span class="clegend"><i style="background:${it.color || COLORS[i % COLORS.length]}"></i>${it.name}</span>`
    ).join('');

    return `<div class="chart" id="chart">
      <svg class="piesvg" viewBox="0 0 260 260" width="260" height="260" style="touch-action:none">
        ${paths}${labels}${handles}
      </svg>
      <div class="clegendrow">${legend}</div>
      <div class="shelp">拖动扇区边界调整比例，总和固定为 100%</div>
    </div>`;
  }

  function bind(rootEl, cfg, st, onChange) {
    if (cfg.type === 'stacked') return bindStacked(rootEl, cfg, st, onChange);
    if (cfg.type === 'line') return bindLine(rootEl, cfg, st, onChange);
    if (cfg.type === 'bar') return bindBar(rootEl, cfg, st, onChange);
    const svgs = rootEl.querySelectorAll('.piesvg');
    if (!svgs.length) return;
    const n = cfg.items.length;
    const ss = seriesOf(cfg);
    if (!st.values) st.values = ss.map(() => new Array(n).fill(100 / n));
    if (!Array.isArray(st.values[0])) st.values = [st.values];

    let drag = { si: -1, i: -1 };

    svgs.forEach(svg => {
      const si = parseInt(svg.dataset.series, 10);
      svg.querySelectorAll('.chandle').forEach(h => {
        h.addEventListener('pointerdown', (e) => {
          drag = { si: si, i: parseInt(h.dataset.i, 10) };
          e.preventDefault();
          e.stopPropagation();
        });
      });
    });

    function onMove(e) {
      if (drag.si < 0) return;
      const svg = rootEl.querySelector(`.piesvg[data-series="${drag.si}"]`);
      if (!svg) return;
      const vals = st.values[drag.si];
      const rect = svg.getBoundingClientRect();
      const sc = 260 / rect.width;
      const x = (e.clientX - rect.left) * sc - CX;
      const y = (e.clientY - rect.top) * sc - CY;
      let deg = Math.atan2(y, x) * 180 / Math.PI + 90;
      if (deg < 0) deg += 360;

      const pct = normalized(vals);
      let lower = 0;
      for (let k = 0; k < drag.i; k++) lower += pct[k] * 3.6;
      let upper = lower;
      for (let k = 0; k <= drag.i + 1; k++) upper += pct[k] * 3.6;

      const target = Math.max(lower + 3, Math.min(upper - 3, deg));
      const ratio = (target - lower) / (upper - lower);
      const pair = pct[drag.i] + pct[drag.i + 1];
      const a = Math.max(1, Math.min(pair - 1, pair * ratio));

      const total = vals.reduce((s2, v) => s2 + v, 0);
      st.values[drag.si] = vals.slice();
      st.values[drag.si][drag.i] = total * (a / 100);
      st.values[drag.si][drag.i + 1] = total * ((pair - a) / 100);

      // 只重画这一个 svg
      const tmp = document.createElement('div');
      tmp.innerHTML = renderOne(cfg, st.values[drag.si], n, drag.si);
      const fresh = tmp.firstElementChild;
      const oldPaths = svg.querySelectorAll('[data-sector]');
      const newPaths = fresh.querySelectorAll('[data-sector]');
      const oldTexts = svg.querySelectorAll('[data-label]');
      const newTexts = fresh.querySelectorAll('[data-label]');
      const oldH = svg.querySelectorAll('.chandle');
      const newH = fresh.querySelectorAll('.chandle');
      for (let k = 0; k < oldPaths.length; k++) oldPaths[k].setAttribute('d', newPaths[k].getAttribute('d'));
      for (let k = 0; k < oldTexts.length; k++) {
        oldTexts[k].setAttribute('x', newTexts[k].getAttribute('x'));
        oldTexts[k].setAttribute('y', newTexts[k].getAttribute('y'));
        oldTexts[k].textContent = newTexts[k].textContent;
      }
      for (let k = 0; k < oldH.length; k++) {
        oldH[k].setAttribute('cx', newH[k].getAttribute('cx'));
        oldH[k].setAttribute('cy', newH[k].getAttribute('cy'));
      }
    }

    function onUp() { drag = { si: -1, i: -1 }; }

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
  }

  function check(cfg, st) {
    if (cfg.type === 'stacked') {
      const v = (st && st.stackVals) || [];
      return { ok: (cfg.answer || []).every((pair, i) =>
        pair.every((p, k) => Math.abs(p - ((v[i] || [])[k] || 0)) <= 2)) };
    }
    if (cfg.type === 'line') {
      const v = (st && st.lineVals) || [];
      return { ok: (cfg.answer || []).every((a, i) => Math.abs(a - (v[i] || 0)) <= 1) };
    }
    if (cfg.type === 'bar') {
      const v = (st && st.barVals) || [];
      return { ok: (cfg.answer || []).every((a, i) => Math.abs(a - (v[i] || 0)) <= 2) };
    }
    if (!st || !st.values) return { ok: false };
    const ss = seriesOf(cfg);
    let valsArr = st.values;
    if (!Array.isArray(valsArr[0])) valsArr = [valsArr];
    const ok = ss.every((se, si) => {
      const got = normalized(valsArr[si] || []);
      return (se.answer || cfg.answer).every((v, i) => Math.abs(v - got[i]) <= 2);
    });
    return { ok };
  }

  root.ChartType = { render, bind, check };
})(window);
