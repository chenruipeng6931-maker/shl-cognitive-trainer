/* ============================================================
 * 记忆动画题
 * 先依次闪现若干帧图形，消失后让用户复现目标帧
 * cfg = {
 *   grid: 'hex' | 'square',
 *   frames: [code, code, ...],   // 依次闪现
 *   showMs: 1200,                // 每帧时长
 *   gapMs: 350,                  // 帧间空隙
 *   answer: code,                // 要复现的目标
 *   ask: '最后一帧'               // 提示语
 * }
 * ============================================================ */
(function (root) {
  'use strict';
  const F = window.HEXFACES || [];
  const CYCLE = ['w', 'g', 'c'];
  let uid = 0;

  function fill(code, pid) {
    if (code === 'g') return '#b58a2e';
    if (code === 'c') return `url(#${pid})`;
    return '#ffffff';
  }

  function svg(cols, size, opt) {
    opt = opt || {};
    const pid = 'mempat' + (++uid);
    let out = `<svg viewBox="-1 -1.15 2 2.3" width="${size}" height="${(size * 1.15) | 0}">`;
    out += `<defs><pattern id="${pid}" width="0.09" height="0.09" patternUnits="userSpaceOnUse">
      <rect width="0.09" height="0.09" fill="#fff"/>
      <circle cx="0.045" cy="0.045" r="0.018" fill="#2f5d8a"/></pattern></defs>`;
    F.forEach((f, i) => {
      const pts = f.map(p => p[0] + ',' + p[1]).join(' ');
      const bad = opt.diff && opt.diff[i];
      out += `<polygon points="${pts}" fill="${fill(cols[i] || 'w', pid)}"
        stroke="${bad ? '#9b2c2c' : '#cfd5df'}" stroke-width="${bad ? 0.03 : 0.012}"
        ${opt.interactive ? `data-mf="${i}" style="cursor:pointer"` : ''}/>`;
    });
    return out + '</svg>';
  }

  function render(cfg, st) {
    const ph = st.memPhase || 'ready';     // ready | playing | answer
    let html = '<div class="memcard">';
    if (ph === 'ready') {
      html += `<div class="memprompt">
        <div class="mp-title">记忆 ${cfg.frames.length} 个图形</div>
        <div class="mp-desc">它们会依次闪现，每题 ${(cfg.showMs / 1000).toFixed(1)} 秒，之后请你复现${cfg.ask || '最后一帧'}。</div>
        <button class="btn primary" data-mem="start" type="button">开始</button>
      </div>`;
      return html + '</div>';
    }
    if (ph === 'playing') {
      html += `<div class="memstage" data-mem="stage">
        <div class="memframe" id="memframe">${svg(st.memFrame || 'wwwwwww', 240)}</div>
        <div class="memdots">${cfg.frames.map((_, i) =>
          `<i class="${i === (st.memIdx || 0) ? 'on' : ''}"></i>`).join('')}</div>
      </div>`;
      return html + '</div>';
    }
    const cols = st.memCols || new Array(7).fill('w');
    if (!st.revealed) {
      html += `<div class="memprompt"><div class="mp-title">复现${cfg.ask || '最后一帧'}</div>
        <div class="mp-desc">点击区域填色，可以撤销重来。</div></div>`;
      html += `<div class="memanswer">${svg(cols, 300, { interactive: true })}</div>
        <div class="actions"><div class="right">
          <button class="btn primary" id="btnReveal" type="button">提交答案</button></div></div>`;
      return html + '</div>';
    }
    const ans = cfg.answer || 'wwwwwww';
    const diff = cols.map((c, i) => c !== ans[i]);
    const n = diff.filter(Boolean).length;
    html += `<div class="memcompare">
      <div class="figbox"><div class="figcap">你的作答</div>${svg(cols, 220, { diff })}</div>
      <div class="figbox"><div class="figcap">正确</div>${svg(ans, 220)}</div></div>
      <div class="feedback show ${n ? 'bad' : 'good'}">
        <div class="res">${n ? '✗ 有 ' + n + ' 个区域不同' : '✓ 完全正确'}</div></div>`;
    return html + '</div>';
  }

  function bind(rootEl, cfg, st, onChange) {
    if (!st.memCols) st.memCols = new Array(7).fill('w');

    const startBtn = rootEl.querySelector('[data-mem="start"]');
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        st.memPhase = 'playing';
        st.memIdx = 0;
        playNext(cfg, st, onChange);
      });
      return;
    }

    // 播放由计时器驱动，重渲染不重启（避免死循环）

    rootEl.querySelectorAll('[data-mf]').forEach(el => {
      el.addEventListener('click', () => {
        if (st.revealed) return;
        const i = parseInt(el.dataset.mf, 10);
        const k = CYCLE.indexOf(st.memCols[i]);
        st.memCols[i] = CYCLE[(k + 1) % CYCLE.length];
        onChange();
      });
    });
  }

  function playNext(cfg, st, onChange) {
    const i = st.memIdx || 0;
    st.memFrame = cfg.frames[i];
    // 直接更新 DOM，不触发整卡重渲染
    const fe = document.querySelector('#memframe');
    if (fe) fe.innerHTML = svg(cfg.frames[i], 240);
    document.querySelectorAll('.memdots i').forEach((d, k) => {
      d.classList.toggle('on', k === i);
    });
    if (st._memTimer) clearTimeout(st._memTimer);
    st._memTimer = setTimeout(() => {
      if (i + 1 >= cfg.frames.length) {
        st._memTimer = null;
        st.memPhase = 'answer';
        onChange();
      } else {
        st.memIdx = i + 1;
        playNext(cfg, st, onChange);
      }
    }, cfg.showMs);
  }

  function check(cfg, st) {
    return { ok: (st.memCols || []).join('') === (cfg.answer || '') };
  }

  root.MemoryType = { render, bind, check };
})(window);
