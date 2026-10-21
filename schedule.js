/* ============================================================
 * 时间排程组件
 *   · 横轴时间，30 分钟一格
 *   · 已占用时段灰色，待安排任务可拖拽
 *   · 自动吸附 + 重叠检测
 * ============================================================ */
(function (root) {
  'use strict';

  const PX_PER_HOUR = 64;
  const SNAP = 0.5;          // 吸附到 30 分钟
  const COLORS = ['#3b6ea5', '#6a994e', '#a44a3f', '#c08a3e', '#6b5b8e', '#4a8f8a'];

  function fmt(h) {
    const hh = Math.floor(h);
    const mm = Math.round((h - hh) * 60);
    const ap = hh >= 12 ? 'pm' : 'am';
    const h12 = hh % 12 === 0 ? 12 : hh % 12;
    return `${h12}:${String(mm).padStart(2, '0')} ${ap}`;
  }

  function overlaps(a, b) { return a.start < b.start + b.len - 1e-9 && b.start < a.start + a.len - 1e-9; }

  /** 渲染整块排程 UI */
  function render(cfg, st, opt) {
    opt = opt || {};
    const span = cfg.dayEnd - cfg.dayStart;
    const W = span * PX_PER_HOUR;
    const placed = opt.fixed || (st && st.placed) || {};

    // 已放置的块
    let blocks = '';
    cfg.tasks.forEach((t, i) => {
      const s = placed[t.id];
      if (s === undefined || s === null) return;
      const left = (s - cfg.dayStart) * PX_PER_HOUR;
      const w = t.len * PX_PER_HOUR;
      const clash = conflicts(cfg, placed, t.id);
      const narrow = w < 58;
      blocks += `<div class="sblock ${clash ? 'clash' : ''} ${narrow ? 'narrow' : ''}" ${opt.readonly ? '' : `data-move="${t.id}"`} title="${t.name} · ${fmt(s)}"
        style="left:${left}px;width:${w}px;background:${COLORS[i % COLORS.length]}">
        ${narrow ? '' : `<span>${t.name}</span>`}<b>${fmt(s)}</b></div>`;
    });

    // 已占用
    cfg.busy.forEach(b => {
      const left = (b.start - cfg.dayStart) * PX_PER_HOUR;
      const w = b.len * PX_PER_HOUR;
      const narrowBusy = w < 56;
      blocks += `<div class="sbusy ${narrowBusy ? 'narrow' : ''}" style="left:${left}px;width:${w}px">${narrowBusy ? '' : `<span>${b.label || ''}</span>`}</div>`;
    });

    // 刻度
    let ticks = '';
    for (let h = 0; h <= span; h++) {
      const x = h * PX_PER_HOUR;
      const hh = cfg.dayStart + h;
      const label = String(hh % 12 === 0 ? 12 : hh % 12);
      ticks += `<div class="stick" style="left:${x}px">
        <span>${label}</span></div>`;
      if (h < span) {
        ticks += `<div class="shalf" style="left:${x + PX_PER_HOUR / 2}px"></div>`;
      }
    }

    const pending = cfg.tasks.filter(t => placed[t.id] === undefined || placed[t.id] === null);

    if (opt.readonly) {
      return `<div class="sched"><div class="saxis" style="width:${W}px">
        ${ticks}<div class="slane">${blocks}</div></div></div>`;
    }

    return `<div class="sched" id="sched">
      <div class="saxis" style="width:${W}px">
        ${ticks}
        <div class="slane" id="slane">${blocks}</div>
      </div>
      <div class="spool" id="spool">
        ${pending.length ? pending.map((t, i) => {
          const idx = cfg.tasks.indexOf(t);
          return `<div class="stask" draggable="true" data-task="${t.id}"
            style="background:${COLORS[idx % COLORS.length]}">
            <span>${t.name}</span><b>${t.len * 60} min</b></div>`;
        }).join('') : '<span class="sdone">任务都放好了</span>'}
      </div>
      <div class="shelp">把任务块拖到时间轴上；放上去后可以再拖动，双击移除。</div>
    </div>`;
  }

  /** 某任务是否与其他块冲突 */
  function conflicts(cfg, placed, taskId) {
    const t = cfg.tasks.find(x => x.id === taskId);
    const s = placed[taskId];
    if (!t || s === undefined || s === null) return false;
    const me = { start: s, len: t.len };
    if (s < cfg.dayStart || s + t.len > cfg.dayEnd) return true;
    for (const b of cfg.busy) if (overlaps(me, b)) return true;
    for (const o of cfg.tasks) {
      if (o.id === taskId) continue;
      const os = placed[o.id];
      if (os === undefined || os === null) continue;
      if (overlaps(me, { start: os, len: o.len })) return true;
    }
    return false;
  }

  /** 绑定拖拽 */
  function bind(rootEl, cfg, st, onChange) {
    const lane = rootEl.querySelector('#slane');
    const sched = rootEl.querySelector('#sched');

    function snapTime(clientX) {
      const r = lane.getBoundingClientRect();
      const h = (clientX - r.left) / PX_PER_HOUR + cfg.dayStart;
      return Math.round(h / SNAP) * SNAP;
    }

    // 从待安排区拖出
    rootEl.querySelectorAll('.stask').forEach(el => {
      el.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', el.dataset.task);
        e.dataTransfer.effectAllowed = 'move';
      });
    });

    // 已放置的块再拖动
    rootEl.querySelectorAll('[data-move]').forEach(el => {
      el.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', el.dataset.move);
      });
      el.addEventListener('dblclick', () => {
        delete st.placed[el.dataset.move];
        onChange();
      });
    });

    lane.addEventListener('dragover', (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; });
    lane.addEventListener('drop', (e) => {
      e.preventDefault();
      const id = e.dataTransfer.getData('text/plain');
      if (!id) return;
      st.placed[id] = snapTime(e.clientX);
      onChange();
    });

    // 触屏兜底：点一下任务再点时间轴
    rootEl.querySelectorAll('.stask').forEach(el => {
      el.addEventListener('click', () => {
        st.selected = el.dataset.task;
        rootEl.querySelectorAll('.stask').forEach(x => x.classList.remove('sel'));
        el.classList.add('sel');
      });
    });
    lane.addEventListener('click', (e) => {
      if (!st.selected) return;
      st.placed[st.selected] = snapTime(e.clientX);
      st.selected = null;
      onChange();
    });
  }

  root.Schedule = { render, bind, conflicts, fmt };
})(window);

/* ============================================================
 * 多资源模式（lane mode）：多条占用轴 + 在空白资源上选时段
 * cfg = { mode:'lanes', dayStart, dayEnd, lanes:[{name,busy,editable}],
 *         slotLen, answer:{lane, start} }
 * ============================================================ */
(function (root) {
  'use strict';
  const PX = 64;
  const SNAP = 0.5;

  function f2s(h) {
    const hh = Math.floor(h), mm = Math.round((h - hh) * 60);
    return String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0');
  }

  function f2(h) {
    const hh = Math.floor(h), mm = Math.round((h - hh) * 60);
    const ap = hh >= 12 ? 'pm' : 'am';
    const h12 = hh % 12 === 0 ? 12 : hh % 12;
    return `${h12}:${String(mm).padStart(2, '0')} ${ap}`;
  }

  function renderLanes(cfg, st) {
    const span = cfg.dayEnd - cfg.dayStart;
    const W = span * PX;
    const st0 = st || {};
    const pick = st0.pick;

    let ticks = '';
    for (let h = 0; h <= span; h++) {
      const hh = cfg.dayStart + h;
      ticks += `<div class="stick" style="left:${h * PX}px"><span>${hh % 12 === 0 ? 12 : hh % 12}</span></div>`;
      if (h < span) ticks += `<div class="shalf" style="left:${h * PX + PX / 2}px"></div>`;
    }

    const rows = cfg.lanes.map((ln, li) => {
      let blocks = '';
      (ln.busy || []).forEach(b => {
        const wBusy = b.len * PX;
        blocks += `<div class="sbusy ${wBusy < 56 ? 'narrow' : ''}" style="left:${(b.start - cfg.dayStart) * PX}px;width:${wBusy}px">
          ${wBusy < 56 ? '' : `<span>${b.label || ''}</span>`}</div>`;
      });
      if (ln.editable) {
        const sel = ((st0.picks && st0.picks[li]) || []).slice().sort((a, b) => a - b);
        // 把连续的半小时合并成一段
        let run = null;
        const flush = () => {
          if (!run) return;
          const w = (run.end - run.start) * PX;
          const label = w >= 60 ? `<span>${f2s(run.start)}–${f2s(run.end)}</span>` : '';
          blocks += `<div class="sslot" style="left:${(run.start - cfg.dayStart) * PX}px;width:${w}px">${label}</div>`;
          run = null;
        };
        sel.forEach(start => {
          if (run && Math.abs(start - run.end) < 0.01) run.end = start + SNAP;
          else { flush(); run = { start, end: start + SNAP }; }
        });
        flush();
      }
      return `<div class="slane-row">
        <div class="slane-name ${ln.editable ? 'target' : ''}">${ln.name}</div>
        <div class="saxis slim ${ln.editable ? 'clickable' : ''}" style="width:${W}px" data-lane="${li}">
          ${ticks}${blocks}
        </div>
      </div>`;
    }).join('');

    return `<div class="lanes">${rows}
      <div class="shelp">${cfg.editable_help || ''}</div></div>`;
  }

  function bindLanes(rootEl, cfg, st, onChange) {
    rootEl.querySelectorAll('.saxis.clickable').forEach(el => {
      el.addEventListener('click', (e) => {
        const li = parseInt(el.dataset.lane, 10);
        const r = el.getBoundingClientRect();
        let h = (e.clientX - r.left) / PX + cfg.dayStart;
        h = Math.round(h / SNAP) * SNAP;          // 对齐到 30 分钟
        h = Math.max(cfg.dayStart, Math.min(cfg.dayEnd - SNAP, h));
        if (!st.picks) st.picks = {};
        if (!st.picks[li]) st.picks[li] = [];
        const arr = st.picks[li];
        const k = arr.indexOf(h);
        if (k >= 0) arr.splice(k, 1); else arr.push(h);
        arr.sort((a, b) => a - b);
        st.pick = arr.length ? { lane: li, start: arr[0] } : null;
        onChange();
      });
    });
  }

  root.Schedule.renderLanes = renderLanes;
  root.Schedule.bindLanes = bindLanes;
  root.Schedule.f2 = f2;
  root.Schedule.f2s = f2s;
})(window);
