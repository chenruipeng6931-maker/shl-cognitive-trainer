/* ============================================================
 * 标签归类：把数字/文字徽章分配到每个名字
 * cfg = { people:[{name}], badges:[1..6], answer:{name:badge} }
 * ============================================================ */
(function (root) {
  'use strict';

  function render(cfg, st) {
    const placed = (st && st.assigned) || {};
    const used = Object.values(placed);

    const pool = cfg.badges.map(b => {
      const isUsed = used.indexOf(b) >= 0;
      const label = (cfg.badgeLabels && cfg.badgeLabels[b]) || b;
      return `<button class="tbadge ${isUsed ? 'used' : ''} ${String(label).length > 2 ? 'txt' : ''}" data-badge="${b}" type="button"
        draggable="${isUsed ? 'false' : 'true'}" ${isUsed ? 'disabled' : ''}>${label}</button>`;
    }).join('');

    const rows = cfg.people.map((p, i) => {
      const cur = placed[p.name];
      return `<div class="trow" data-person="${i}">
        <span class="tname">${p.name}</span>
        <button class="tslot ${cur ? 'filled' : ''}" data-slot="${p.name}" type="button" data-drop="1">
          ${cur || ''}
        </button>
      </div>`;
    }).join('');

    const clues = (cfg.clues && cfg.clues.length)
      ? `<div class="tclues">${cfg.clues.map(c => `<div class="tclue"><b>${c.name}</b>${c.text}</div>`).join('')}</div>`
      : '';

    return `<div class="tagging" id="tagging">
      ${clues}
      <div class="tpool">${pool}</div>
      <div class="tlist">${rows}</div>
      <div class="shelp">先点一个徽章，再点名字后面的格子放进去；点已放的格子可以取回</div>
    </div>`;
  }

  function bind(rootEl, cfg, st, onChange) {
    if (!st.assigned) st.assigned = {};
    if (st.selectedBadge === undefined) st.selectedBadge = null;

    rootEl.querySelectorAll('[data-badge]').forEach(el => {
      el.addEventListener('click', () => {
        st.selectedBadge = parseInt(el.dataset.badge, 10);
        rootEl.querySelectorAll('[data-badge]').forEach(x => x.classList.remove('sel'));
        el.classList.add('sel');
      });
      el.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', el.dataset.badge);
        e.dataTransfer.effectAllowed = 'move';
      });
    });

    // 拖拽放置
    rootEl.querySelectorAll('[data-drop]').forEach(el => {
      el.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        el.classList.add('over');
      });
      el.addEventListener('dragleave', () => el.classList.remove('over'));
      el.addEventListener('drop', (e) => {
        e.preventDefault();
        el.classList.remove('over');
        const b = parseInt(e.dataTransfer.getData('text/plain'), 10);
        if (!isNaN(b)) { st.assigned[el.dataset.slot] = b; onChange(); }
      });
    });

    rootEl.querySelectorAll('[data-slot]').forEach(el => {
      el.addEventListener('click', () => {
        const name = el.dataset.slot;
        if (st.assigned[name] !== undefined) {
          delete st.assigned[name];          // 取回
        } else if (st.selectedBadge !== null) {
          st.assigned[name] = st.selectedBadge;
          st.selectedBadge = null;
        }
        onChange();
      });
    });
  }

  function check(cfg, st) {
    const a = st && st.assigned || {};
    const keys = Object.keys(cfg.answer);
    const ok = keys.every(k => a[k] === cfg.answer[k]);
    return { ok, detail: keys.map(k => `${k}:${a[k] || '-'}`).join(' ') };
  }

  root.TaggingType = { render, bind, check };
})(window);
