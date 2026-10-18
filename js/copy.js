/* 代码块复制按钮 */
(function () {
  function label(btn, text, back) {
    btn.textContent = text;
    btn.classList.add('is-done');
    clearTimeout(btn._t);
    btn._t = setTimeout(function () {
      btn.textContent = back;
      btn.classList.remove('is-done');
    }, 1600);
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    // 非 HTTPS 或旧浏览器兜底
    return new Promise(function (resolve, reject) {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy') ? resolve() : reject(new Error('copy failed'));
      } catch (e) {
        reject(e);
      } finally {
        document.body.removeChild(ta);
      }
    });
  }

  document.querySelectorAll('.code').forEach(function (block) {
    const bar = block.querySelector('.bar');
    const pre = block.querySelector('pre');
    if (!bar || !pre) return;

    // 把原来的 <span>Copy</span> 换成真正的按钮
    let btn = bar.querySelector('.copy-btn');
    if (!btn) {
      const old = bar.lastElementChild;
      btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'copy-btn';
      btn.textContent = 'Copy';
      if (old && old !== bar.firstElementChild) old.replaceWith(btn);
      else bar.appendChild(btn);
    }

    btn.addEventListener('click', function () {
      // 行号是 CSS ::before 生成的，不在 textContent 里，所以不用清理
      const text = pre.textContent.replace(/\s+$/, '');
      copyText(text)
        .then(function () { label(btn, 'Copied', 'Copy'); })
        .catch(function () {
          // 兜底：选中代码，让用户手动 Ctrl+C
          const range = document.createRange();
          range.selectNodeContents(pre);
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
          label(btn, 'Ctrl+C', 'Copy');
        });
    });
  });
})();
