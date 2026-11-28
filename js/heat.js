/* 热力图：悬停即时提示（原生 title 要等一秒，太钝） */
(function () {
  const grid = document.querySelector('.heat-grid');
  if (!grid) return;

  const tip = document.createElement('div');
  tip.className = 'heat-tip';
  tip.setAttribute('aria-hidden', 'true');
  document.body.appendChild(tip);

  let raf = 0;

  function place(cell) {
    const text = cell.dataset.tip;
    if (!text) return;
    tip.textContent = text;
    tip.classList.add('is-on');

    const r = cell.getBoundingClientRect();
    const tr = tip.getBoundingClientRect();
    let left = r.left + r.width / 2 - tr.width / 2;
    let top = r.top - tr.height - 8;

    // 贴边时收回来，别跑出视口
    left = Math.max(8, Math.min(left, window.innerWidth - tr.width - 8));
    if (top < 8) top = r.bottom + 8;

    tip.style.left = Math.round(left) + 'px';
    tip.style.top = Math.round(top) + 'px';
  }

  function hide() { tip.classList.remove('is-on'); }

  grid.addEventListener('mouseover', function (e) {
    const cell = e.target.closest('.heat-cell');
    if (cell) place(cell);
  });

  grid.addEventListener('mouseout', function (e) {
    if (e.target.closest('.heat-cell')) hide();
  });

  grid.addEventListener('focusin', function (e) {
    const cell = e.target.closest('.heat-cell');
    if (cell) place(cell);
  });
  grid.addEventListener('focusout', hide);

  // 滚动/缩放时收起，避免提示跟位置脱节
  window.addEventListener('scroll', hide, { passive: true });
  window.addEventListener('resize', hide);
})();
