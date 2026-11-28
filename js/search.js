/* 站内搜索：Pagefind（构建时生成的索引） */
(function () {
  const dlg = document.createElement('dialog');
  dlg.className = 'search';
  dlg.innerHTML =
    '<div class="search-box">' +
    '<div class="search-head">' +
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="15" height="15">' +
    '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/></svg>' +
    '<input class="search-input" type="search" placeholder="搜索文章、说说…" autocomplete="off" spellcheck="false" />' +
    '<span class="search-kbd">Esc</span>' +
    '</div>' +
    '<div class="search-list"></div>' +
    '<div class="search-foot"><span>↑↓ 选择</span><span>↵ 打开</span><span class="search-count">Pagefind</span></div>' +
    '</div>';
  document.body.appendChild(dlg);

  const input = dlg.querySelector('.search-input');
  const list = dlg.querySelector('.search-list');
  const countEl = dlg.querySelector('.search-count');

  let active = 0;
  let shown = [];
  let pagefind = null;
  let loading = null;
  let seq = 0;

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  /** 首次打开时才加载索引脚本 */
  function loadIndex() {
    if (pagefind) return Promise.resolve(pagefind);
    if (loading) return loading;

    loading = import('/pagefind/pagefind.js')
      .then(function (mod) {
        return mod.options({ excerptLength: 28 }).then(function () {
          pagefind = mod;
          return mod;
        });
      })
      .catch(function () {
        loading = null;
        throw new Error('NO_INDEX');
      });

    return loading;
  }

  function showHint(html) {
    list.innerHTML = '<div class="search-empty">' + html + '</div>';
  }

  function paint() {
    if (!shown.length) {
      showHint('没有找到相关结果<br /><span style="font-size:.72rem">换个词试试，比如「Astro」「封面」「WSL」</span>');
      return;
    }
    list.innerHTML = shown
      .map(function (it, i) {
        return (
          '<a class="search-row' + (i === active ? ' is-active' : '') + '" href="' + it.url + '">' +
          '<span class="t">' + esc(it.title) + '</span>' +
          '<span class="e">' + it.excerpt + '</span>' +
          '<span class="m"><span>' + esc(it.meta) + '</span></span>' +
          '</a>'
        );
      })
      .join('');
  }

  async function run(q) {
    const query = q.trim();
    if (!query) {
      shown = [];
      list.innerHTML = '';
      if (countEl) countEl.textContent = 'Pagefind';
      showHint('输入关键词开始搜索<br /><span style="font-size:.72rem">⌘K 或 / 随时打开</span>');
      return;
    }

    let mod;
    try {
      mod = await loadIndex();
    } catch (e) {
      showHint('搜索索引还没生成<br /><span style="font-size:.72rem">本地开发（npm run dev）不产出索引，跑一次 npm run build 后就有了</span>');
      return;
    }

    const mySeq = ++seq;
    const search = await mod.search(query);
    const data = await Promise.all(search.results.slice(0, 12).map(function (r) { return r.data(); }));
    if (mySeq !== seq) return; // 有新输入，丢弃旧结果

    shown = data.map(function (d) {
      return {
        url: d.url,
        title: (d.meta && d.meta.title) || d.url,
        excerpt: d.excerpt,
        meta: d.meta && d.meta.date ? d.meta.date : '',
      };
    });
    active = 0;
    if (countEl) countEl.textContent = shown.length ? search.results.length + ' 条结果' : '无结果';
    paint();
  }

  let timer = null;
  input.addEventListener('input', function () {
    clearTimeout(timer);
    const v = input.value;
    timer = setTimeout(function () { run(v); }, 140);
  });

  function move(step) {
    const rows = list.querySelectorAll('.search-row');
    if (!rows.length) return;
    rows[active] && rows[active].classList.remove('is-active');
    active = (active + step + rows.length) % rows.length;
    rows[active].classList.add('is-active');
    rows[active].scrollIntoView({ block: 'nearest' });
  }

  function open() {
    dlg.showModal();
    input.value = '';
    run('');
    setTimeout(function () { input.focus(); }, 30);
  }

  document.querySelectorAll('.icon-btn[aria-label="搜索"], [data-search]').forEach(function (btn) {
    btn.addEventListener('click', function (e) { e.preventDefault(); open(); });
  });

  input.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
    else if (e.key === 'Enter') {
      const rows = list.querySelectorAll('.search-row');
      if (rows[active]) location.href = rows[active].getAttribute('href');
    }
  });

  dlg.addEventListener('close', function () { input.value = ''; });

  let backdropDown = false;
  dlg.addEventListener('pointerdown', function (e) { backdropDown = (e.target === dlg); });
  dlg.addEventListener('click', function (e) {
    if (backdropDown && e.target === dlg) dlg.close();
    backdropDown = false;
  });

  document.addEventListener('keydown', function (e) {
    const el = document.activeElement;
    const typing = /^(INPUT|TEXTAREA)$/.test(el.tagName) || el.isContentEditable;
    if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) {
      e.preventDefault();
      open();
    }
  });
})();

// 调试用：?s=关键词 直接打开搜索面板
(function () {
  const q = new URLSearchParams(location.search).get('s');
  if (q === null) return;
  const btn = document.querySelector('.icon-btn[aria-label="搜索"]');
  if (btn) btn.click();
  const box = document.querySelector('.search-input');
  if (box) { box.value = q; box.dispatchEvent(new Event('input', { bubbles: true })); }
})();
