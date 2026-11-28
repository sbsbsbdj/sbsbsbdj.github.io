/* 图片不可拖拽（拖到地址栏/新标签会打开图片地址） */
(function () {
  function lock(img) {
    img.draggable = false;
    img.setAttribute('draggable', 'false');
  }

  document.querySelectorAll('img').forEach(lock);

  // 捕获阶段拦截：也覆盖灯箱里动态生成的图片
  document.addEventListener('dragstart', function (e) {
    const t = e.target;
    if (t && t.tagName === 'IMG') {
      e.preventDefault();
      return false;
    }
  }, true);

  // 后续插入的图片（评论、灯箱）自动加锁
  const mo = new MutationObserver(function (records) {
    records.forEach(function (r) {
      r.addedNodes.forEach(function (n) {
        if (n.nodeType !== 1) return;
        if (n.tagName === 'IMG') lock(n);
        else n.querySelectorAll && n.querySelectorAll('img').forEach(lock);
      });
    });
  });
  mo.observe(document.documentElement, { childList: true, subtree: true });
})();
