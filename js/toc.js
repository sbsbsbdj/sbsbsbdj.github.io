/* 目录激活色：取自封面主色，随滚动加深以保证对比度 */
(function () {
  const toc = document.querySelector('.toc');
  if (!toc) return;

  function tick() {
    const y = window.scrollY;
    // 0 → 1：从页面顶部滚到约 580px 处
    const k = Math.min(1, Math.max(0, (y - 60) / 520));

    const fill = 10 + k * 16;        // 蒙版底色：10% → 26%
    const ink = 100 - k * 34;        // 文字/指示线：纯主色 → 混入 34% 墨色（变深）

    toc.style.setProperty('--toc-fill', 'color-mix(in srgb, var(--cover-tint, #5f6d76) ' + fill.toFixed(0) + '%, transparent)');
    toc.style.setProperty('--toc-ink', 'color-mix(in srgb, var(--cover-tint, #5f6d76) ' + ink.toFixed(0) + '%, var(--ink))');
  }

  tick();
  window.addEventListener('scroll', tick, { passive: true });
  window.addEventListener('resize', tick);
})();
