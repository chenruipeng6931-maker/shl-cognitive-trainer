/* ============================================================
 * 连线题：按住节点拖动，实时显示跟随的线；松手落在目标节点上即连接
 * 同时也保留「点击两次」作为备用操作
 * cfg = { nodes:[{id,x,y}], answer:[...] 或 edges:[[a,b],...] }
 * ============================================================ */
(function (root) {
  'use strict';

  const W = 640, H = 420, R = 26;

  function render(cfg, st) {
    const links = st.links || [];
    const init = cfg.initial || [];
    let lines = '';
    init.forEach(([a, b]) => {
      const na = cfg.nodes.find(n => n.id === a);
      const nb = cfg.nodes.find(n => n.id === b);
      if (!na || !nb) return;
      lines += `<line x1="${na.x * W}" y1="${na.y * H}" x2="${nb.x * W}" y2="${nb.y * H}"
        stroke="#94a3b8" stroke-width="4" stroke-linecap="round"/>`;
    });
    links.forEach(([a, b]) => {
      const na = cfg.nodes.find(n => n.id === a);
      const nb = cfg.nodes.find(n => n.id === b);
      if (!na || !nb) return;
      lines += `<line x1="${na.x * W}" y1="${na.y * H}" x2="${nb.x * W}" y2="${nb.y * H}"
        stroke="#7cb342" stroke-width="3.5" stroke-linecap="round"/>`;
    });
    const nodes = cfg.nodes.map(n => {
      const sel = st.pick === n.id;
      return `<g class="cnode" data-node="${n.id}" style="cursor:grab">
        <circle cx="${n.x * W}" cy="${n.y * H}" r="${R}"
          fill="${sel ? '#2563eb' : '#8cc152'}" stroke="${sel ? '#1d4ed8' : '#7cb342'}" stroke-width="2.5"/>
        <text x="${n.x * W}" y="${n.y * H}" text-anchor="middle" dominant-baseline="middle"
          font-size="13" font-weight="700" fill="#fff" pointer-events="none">${n.id}</text></g>`;
    }).join('');

    return `<div class="connect">
      <svg class="connsvg" id="connsvg" viewBox="0 0 ${W} ${H}" width="100%"
        style="max-width:${W}px;touch-action:none">
        ${lines}
        <line id="dragline" x1="0" y1="0" x2="0" y2="0"
          stroke="#2563eb" stroke-width="3" stroke-dasharray="7 5" stroke-linecap="round"
          style="display:none"/>
        ${nodes}
      </svg>
      <div class="cal-summary"><b>已连 ${links.length} 条线${init.length ? '（题目已给出 ' + init.length + ' 条）' : ''}</b>
        <span>${links.map(([a, b]) => a + ' – ' + b).join('，') || '按住一个节点拖到另一个节点即可连线'}</span></div>
      <div class="shelp">拖动时能看到连线；也可以点两个节点连线。点已连的线两端可删除。</div>
    </div>`;
  }

  function bind(rootEl, cfg, st, onChange) {
    if (!st.links) st.links = [];
    const svg = rootEl.querySelector('#connsvg');
    if (!svg) return;
    const drag = svg.querySelector('#dragline');

    let from = null;      // 当前拖动起点节点 id
    let moved = false;

    function toLocal(e) {
      const r = svg.getBoundingClientRect();
      return {
        x: (e.clientX - r.left) / r.width * W,
        y: (e.clientY - r.top) / r.height * H
      };
    }

    function nodeAt(pt) {
      let best = null, bd = R * 1.35;
      cfg.nodes.forEach(n => {
        const d = Math.hypot(pt.x - n.x * W, pt.y - n.y * H);
        if (d < bd) { bd = d; best = n.id; }
      });
      return best;
    }

    function startDrag(id, pt) {
      from = id;
      moved = false;
      const n = cfg.nodes.find(x => x.id === id);
      drag.setAttribute('x1', n.x * W);
      drag.setAttribute('y1', n.y * H);
      drag.setAttribute('x2', pt.x);
      drag.setAttribute('y2', pt.y);
      drag.style.display = '';
    }

    function endDrag(pt) {
      if (!from) return;
      drag.style.display = 'none';
      const target = nodeAt(pt);
      if (target && target !== from && moved) {
        const pair = [from, target];
        const k = st.links.findIndex(l =>
          (l[0] === pair[0] && l[1] === pair[1]) || (l[0] === pair[1] && l[1] === pair[0]));
        if (k >= 0) st.links.splice(k, 1); else st.links.push(pair);
        st.pick = null;
        from = null;
        onChange();
        return;
      }
      // 没拖远 → 视为点击，走两次点击逻辑
      if (!moved) {
        if (!st.pick) { st.pick = from; }
        else if (st.pick !== from) {
          const pair = [st.pick, from];
          const k = st.links.findIndex(l =>
            (l[0] === pair[0] && l[1] === pair[1]) || (l[0] === pair[1] && l[1] === pair[0]));
          if (k >= 0) st.links.splice(k, 1); else st.links.push(pair);
          st.pick = null;
        } else {
          st.pick = null;
        }
        from = null;
        onChange();
        return;
      }
      from = null;
      onChange();
    }

    svg.addEventListener('pointerdown', (e) => {
      const pt = toLocal(e);
      const id = nodeAt(pt);
      if (!id) return;
      e.preventDefault();
      svg.setPointerCapture && svg.setPointerCapture(e.pointerId);
      startDrag(id, pt);
    });

    svg.addEventListener('pointermove', (e) => {
      if (!from) return;
      const pt = toLocal(e);
      moved = true;
      drag.setAttribute('x2', pt.x);
      drag.setAttribute('y2', pt.y);
    });

    svg.addEventListener('pointerup', (e) => {
      if (!from) return;
      endDrag(toLocal(e));
    });

    svg.addEventListener('pointercancel', () => {
      if (from) { drag.style.display = 'none'; from = null; }
    });
  }

  function check(cfg, st) {
    let need;
    if (cfg.edges) {
      need = cfg.edges.map(([a, b]) => [a, b].sort().join('|'));
    } else {
      need = [];
      for (let i = 0; i < cfg.answer.length - 1; i++) {
        need.push([cfg.answer[i], cfg.answer[i + 1]].sort().join('|'));
      }
    }
    const init = (cfg.initial || []).map(([a, b]) => [a, b].sort().join('|'));
    const got = (st.links || []).map(([a, b]) => [a, b].sort().join('|'))
      .filter(g => init.indexOf(g) < 0);
    const want = need.filter(n => init.indexOf(n) < 0);
    const ok = got.length === want.length && want.every(n => got.indexOf(n) >= 0);
    return { ok };
  }

  root.ConnectType = { render, bind, check };
})(window);
