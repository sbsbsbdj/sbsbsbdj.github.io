/* 灯箱：滚轮缩放 / 拖拽平移 / 双击放大 / 双指缩放 */
(function () {
  const dlg = document.getElementById('lightbox');
  if (!dlg) return;
  const img = dlg.querySelector('img');
  const cap = document.getElementById('lightbox-cap');
  const closeBtn = document.getElementById('lightbox-close');

  const MIN = 1;
  const MAX = 8;

  let s = 1, tx = 0, ty = 0;
  let dragging = false, sx = 0, sy = 0, ox = 0, oy = 0;
  const pointers = new Map();
  let pinchStart = 0, pinchScale = 1, pinchMid = null;

  function apply() {
    img.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + s + ')';
    dlg.classList.toggle('zoomed', s > 1.01);
  }

  function reset() {
    s = 1; tx = 0; ty = 0;
    apply();
    img.classList.remove('grabbing');
  }

  function open(a) {
    const inner = a.querySelector('img');
    img.src = a.getAttribute('href');
    img.alt = inner ? inner.alt : '';
    if (cap) cap.textContent = (inner && inner.alt) ? inner.alt : '图片';
    reset();
    dlg.showModal();
  }

  // 提示语
  if (cap && !dlg.querySelector('.lightbox-hint')) {
    const hint = document.createElement('span');
    hint.className = 'lightbox-hint';
    hint.textContent = '滚轮缩放 · 拖拽移动 · 双击还原 · Esc 关闭';
    cap.after(hint);
  }

  document.querySelectorAll('a.shot').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      open(a);
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', function () { dlg.close(); });

  dlg.addEventListener('close', function () {
    img.src = '';
    reset();
  });

  // 滚轮：以光标位置为锚点缩放
  img.addEventListener('wheel', function (e) {
    e.preventDefault();
    const prev = s;
    const k = e.deltaY < 0 ? 1.14 : 1 / 1.14;
    s = Math.min(MAX, Math.max(MIN, s * k));
    if (s <= MIN + 0.001) {
      s = MIN; tx = 0; ty = 0;
    } else {
      const r = img.getBoundingClientRect();
      const cx = e.clientX - r.left;
      const cy = e.clientY - r.top;
      const f = s / prev;
      tx -= cx * (f - 1);
      ty -= cy * (f - 1);
    }
    apply();
  }, { passive: false });

  // 指针按下：开始拖拽 / 记录双指
  img.addEventListener('pointerdown', function (e) {
    if (s <= MIN + 0.01) return;
    e.preventDefault();
    try { img.setPointerCapture(e.pointerId); } catch (_) {}
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 1) {
      dragging = true;
      sx = e.clientX; sy = e.clientY;
      ox = tx; oy = ty;
      img.classList.add('grabbing');
    } else if (pointers.size === 2) {
      const p = Array.from(pointers.values());
      pinchStart = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y);
      pinchScale = s;
      pinchMid = { x: (p[0].x + p[1].x) / 2, y: (p[0].y + p[1].y) / 2 };
      dragging = false;
    }
  });

  img.addEventListener('pointermove', function (e) {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.size === 2) {
      const p = Array.from(pointers.values());
      const d = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y);
      if (pinchStart > 0) {
        const prev = s;
        s = Math.min(MAX, Math.max(MIN, pinchScale * (d / pinchStart)));
        if (s <= MIN + 0.001) { s = MIN; tx = 0; ty = 0; }
        else if (pinchMid) {
          const r = img.getBoundingClientRect();
          const f = s / prev;
          tx -= (pinchMid.x - r.left) * (f - 1);
          ty -= (pinchMid.y - r.top) * (f - 1);
        }
        apply();
      }
      return;
    }

    if (dragging) {
      tx = ox + (e.clientX - sx);
      ty = oy + (e.clientY - sy);
      apply();
    }
  });

  function endPointer(e) {
    pointers.delete(e.pointerId);
    if (pointers.size === 0) {
      dragging = false;
      img.classList.remove('grabbing');
    }
    if (pointers.size < 2) { pinchStart = 0; pinchMid = null; }
  }
  img.addEventListener('pointerup', endPointer);
  img.addEventListener('pointercancel', endPointer);
  img.addEventListener('pointerleave', function (e) {
    if (pointers.has(e.pointerId) && !img.hasPointerCapture(e.pointerId)) endPointer(e);
  });

  // 双击：放大到 2.5 倍 / 还原
  img.addEventListener('dblclick', function (e) {
    e.preventDefault();
    if (s > MIN + 0.01) { reset(); return; }
    const prev = s;
    s = 2.5;
    const r = img.getBoundingClientRect();
    const f = s / prev;
    tx -= (e.clientX - r.left) * (f - 1);
    ty -= (e.clientY - r.top) * (f - 1);
    apply();
  });

  // 点背景关闭（避免拖拽结束时误关）
  let backdropDown = false;
  dlg.addEventListener('pointerdown', function (e) {
    backdropDown = (e.target === dlg || e.target.classList.contains('lightbox-inner'));
  });
  dlg.addEventListener('click', function (e) {
    if (backdropDown && (e.target === dlg || e.target.classList.contains('lightbox-inner'))) dlg.close();
    backdropDown = false;
  });
})();
// 调试用：?lb=1 自动打开第一张
if (new URLSearchParams(location.search).get('lb')) {
  const first = document.querySelector('a.shot');
  if (first) first.click();
}