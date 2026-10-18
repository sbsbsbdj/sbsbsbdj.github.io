/* 点赞 / 评论 —— 原型阶段用 localStorage 模拟，接口就位后换成 fetch 即可 */
(function () {
  const KEY = 'alexn_social_v1';

  function read() {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; }
    catch (_) { return {}; }
  }
  function write(db) {
    try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (_) {}
  }
  function bucket(id) {
    const db = read();
    if (!db[id]) db[id] = { likes: 0, liked: false, comments: [] };
    return { db, item: db[id] };
  }

  /* ---------- 文章页：表情反应 ---------- */
  document.querySelectorAll('.wl-reaction-item.wl-like').forEach(function (btn) {
    const id = 'post:' + (document.body.dataset.postId || location.pathname);
    const countEl = btn.querySelector('.wl-reaction-count');
    const base = parseInt(countEl.textContent, 10) || 0;
    const { item } = bucket(id);
    if (item.liked) { btn.classList.add('is-active'); countEl.textContent = base + 1; }

    btn.addEventListener('click', function () {
      const b = bucket(id);
      b.item.liked = !b.item.liked;
      b.item.likes += b.item.liked ? 1 : -1;
      write(b.db);
      btn.classList.toggle('is-active', b.item.liked);
      countEl.textContent = base + (b.item.liked ? 1 : 0);
    });
  });

  /* ---------- 文章页：评论列表 + 提交 ---------- */
  const list = document.getElementById('wl-list');
  const form = document.getElementById('wl-form');
  const countEl = document.querySelector('.comments-count');

  function renderComment(c) {
    const el = document.createElement('div');
    el.className = 'wl-comment';
    el.innerHTML =
      '<div class="wl-avatar">' + (c.name || '匿').slice(0, 1) + '</div>' +
      '<div class="wl-main">' +
        '<div class="wl-meta"><span class="wl-nick"></span><time class="wl-time"></time>' +
          '<span class="wl-time" style="color:var(--ink-3)">· 待审核</span>' +
        '</div>' +
        '<div class="wl-content"><p></p></div>' +
      '</div>';
    el.querySelector('.wl-nick').textContent = c.name || '匿名';
    el.querySelector('.wl-time').textContent = c.time;
    el.querySelector('.wl-content p').textContent = c.body;
    return el;
  }

  if (form && list) {
    const id = 'post:' + (document.body.dataset.postId || location.pathname);
    const { item } = bucket(id);
    (item.comments || []).forEach(function (c) { list.appendChild(renderComment(c)); });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const nick = form.querySelector('[name=nick]').value.trim() || '匿名';
      const body = form.querySelector('[name=comment]').value.trim();
      if (!body) return;

      const time = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const c = { name: nick, body: body, time: time };

      const b = bucket(id);
      b.item.comments.push(c);
      write(b.db);

      list.appendChild(renderComment(c));
      if (countEl) countEl.textContent = String(parseInt(countEl.textContent, 10) + 1);
      form.querySelector('[name=comment]').value = '';
    });
  }

  /* ---------- 说说：底部一行点赞 + 评论数，评论区只在详情页 ---------- */
  const heartSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20.5S4 15.7 4 10.6A4.6 4.6 0 0 1 12 7a4.6 4.6 0 0 1 8 3.6c0 5.1-8 9.9-8 9.9Z"/></svg>';
  const bubbleSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8 8 0 0 1-8 8H8l-5 2.5V11.5a8 8 0 0 1 8-8h2a8 8 0 0 1 8 8Z"/></svg>';

  function memoId(el) {
    const t = el.querySelector('time');
    return 'memo:' + (t ? t.getAttribute('datetime') : Math.random().toString(36).slice(2));
  }

  document.querySelectorAll('.memo').forEach(function (memo) {
    if (memo.querySelector('.memo-foot')) return;

    const id = memoId(memo);
    const { item } = bucket(id);
    const detailUrl = 'memo.html?id=' + encodeURIComponent(id.replace('memo:', ''));

    const foot = document.createElement('div');
    foot.className = 'memo-foot';

    const likeBtn = document.createElement('button');
    likeBtn.type = 'button';
    likeBtn.className = 'memo-act memo-like' + (item.liked ? ' is-liked' : '');
    likeBtn.innerHTML = heartSvg + '<span class="n">' + (item.likes || 0) + '</span>';
    likeBtn.setAttribute('aria-label', '点赞');

    const cmtLink = document.createElement('a');
    cmtLink.className = 'memo-act memo-cmt';
    cmtLink.href = detailUrl;
    cmtLink.innerHTML = bubbleSvg + '<span class="n">' + (item.comments ? item.comments.length : 0) + '</span>';
    cmtLink.setAttribute('aria-label', '查看评论');

    foot.appendChild(likeBtn);
    foot.appendChild(cmtLink);

    likeBtn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      const b = bucket(id);
      b.item.liked = !b.item.liked;
      b.item.likes = (b.item.likes || 0) + (b.item.liked ? 1 : -1);
      write(b.db);
      likeBtn.classList.toggle('is-liked', b.item.liked);
      likeBtn.querySelector('.n').textContent = b.item.likes;
    });

    const timeEl = memo.querySelector('time');
    if (timeEl) timeEl.parentNode.insertBefore(foot, timeEl.nextSibling);
    else memo.appendChild(foot);

    // 整张卡可点进详情（点图片、按钮、链接时除外）
    memo.classList.add('is-link');
    memo.addEventListener('click', function (e) {
      if (e.target.closest('a, button')) return;
      const sel = window.getSelection();
      if (sel && String(sel).length > 0) return;
      location.href = detailUrl;
    });
  });
})();
