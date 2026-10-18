/* 顶栏：滚动后变成居中孤岛，向下滑出，向上滑回 */
(function () {
  const head = document.querySelector('.site-head');
  if (!head) return;

  const root = document.documentElement;

  function measure() {
    // 量的是初始形态的高度（此时还没加 is-island）
    const wasIsland = head.classList.contains('is-island');
    head.classList.remove('is-island');
    const h = head.getBoundingClientRect().height;
    if (wasIsland) head.classList.add('is-island');
    root.style.setProperty('--head-h', Math.round(h) + 'px');
  }

  measure();
  window.addEventListener('resize', measure);

  let lastY = window.scrollY;
  let ticking = false;

  function update() {
    const y = window.scrollY;
    const island = y > 100;

    head.classList.toggle('is-island', island);

    if (island) {
      const down = y > lastY + 2;
      const up = y < lastY - 2;
      if (down && y > 160) head.classList.add('is-hidden');
      else if (up) head.classList.remove('is-hidden');
    } else {
      head.classList.remove('is-hidden');
    }

    lastY = y;
    ticking = false;
  }

  window.addEventListener('scroll', update, { passive: true });

  update();
})();
