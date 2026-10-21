/* ============================================================
 * 图形重建渲染器：把区域颜色矩阵画成 SVG，可点击循环填色
 * 颜色码： w=留白  g=绿色  c=花纹
 * ============================================================ */
(function (root) {
  'use strict';

  const FACES = window.FIGFACES || [];
  const CYCLE = ['w', 'g', 'c'];
  let uid = 0;

  function fillOf(code, pid) {
    if (code === 'g') return '#8cc152';
    if (code === 'c') return `url(#${pid})`;
    return 'transparent';
  }

  /**
   * @param {string[]} cols  16 个颜色码
   * @param {number} size   边长 px
   * @param {object} opt    {interactive, diff}
   */
  function svg(cols, size, opt) {
    opt = opt || {};
    const pid = 'figpat' + (++uid);
    const parts = [];
    parts.push(`<svg class="figsvg" viewBox="0 0 1 1" width="${size}" height="${size}">`);
    parts.push(`<defs><pattern id="${pid}" width="0.035" height="0.035" patternUnits="userSpaceOnUse">
      <rect width="0.035" height="0.035" fill="#ffffff"/>
      <circle cx="0.0175" cy="0.0175" r="0.0105" fill="#6c5ce7"/></pattern></defs>`);
    parts.push('<rect width="1" height="1" fill="#ffffff"/>');

    FACES.forEach((f, i) => {
      const pts = f.map(p => p[0] + ',' + p[1]).join(' ');
      const code = cols[i] || 'w';
      const bad = opt.diff && opt.diff[i];
      const stroke = bad ? '#dc2626' : '#9AA6B6';
      const sw = bad ? 0.009 : 0.004;
      const cursor = opt.interactive ? ' style="cursor:pointer"' : '';
      const df = opt.interactive ? ` data-face="${i}"` : '';
      parts.push(`<polygon points="${pts}" fill="${fillOf(code, pid)}" stroke="${stroke}" stroke-width="${sw}"${cursor}${df}/>`);
    });

    parts.push('</svg>');
    return parts.join('');
  }

  function nextColor(code) {
    const k = CYCLE.indexOf(code);
    return CYCLE[(k + 1) % CYCLE.length];
  }

  root.Figure = { svg, nextColor, count: () => FACES.length, ready: () => FACES.length > 0 };
})(window);
