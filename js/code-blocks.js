(function () {
  function getCodeText(pre) {
    var code = pre.querySelector('code') || pre;
    return (code.innerText || code.textContent || '').replace(/\n+$/, '') + '\n';
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var input = document.createElement('textarea');
      input.value = text;
      input.setAttribute('readonly', '');
      input.style.position = 'fixed';
      input.style.opacity = '0';
      document.body.appendChild(input);
      input.select();
      var copied = document.execCommand('copy');
      input.remove();
      copied ? resolve() : reject(new Error('Copy failed'));
    });
  }

  document.querySelectorAll('.prose pre').forEach(function (pre) {
    if (pre.hasAttribute('data-music-block') || (pre.parentElement && pre.parentElement.classList.contains('code-block'))) return;

    var code = pre.querySelector('code') || pre;
    var languageClass = Array.from(code.classList).concat(Array.from(pre.classList))
      .find(function (name) { return name.indexOf('language-') === 0; });
    var language = pre.dataset.language || (languageClass ? languageClass.slice(9) : 'text');
    var wrapper = document.createElement('div');
    wrapper.className = 'code-block';
    var bar = document.createElement('div');
    bar.className = 'code-block-bar';
    var label = document.createElement('span');
    label.textContent = language;
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'code-copy-button';
    button.setAttribute('aria-label', '复制代码');
    button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="8" y="8" width="12" height="12" rx="2"></rect><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"></path></svg><span>复制</span>';
    button.addEventListener('click', function () {
      copyText(getCodeText(pre)).then(function () {
        button.classList.add('is-done');
        button.querySelector('span').textContent = '已复制';
        window.setTimeout(function () {
          button.classList.remove('is-done');
          button.querySelector('span').textContent = '复制';
        }, 1500);
      }).catch(function () {
        button.querySelector('span').textContent = '复制失败';
        window.setTimeout(function () { button.querySelector('span').textContent = '复制'; }, 1500);
      });
    });
    bar.append(label, button);
    pre.parentNode.insertBefore(wrapper, pre);
    wrapper.append(bar, pre);
  });
})();
