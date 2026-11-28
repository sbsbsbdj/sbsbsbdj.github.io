/* 把正文里的 B 站链接就地换成内嵌播放器
   支持：
     https://www.bilibili.com/video/BV1X1421d7ri
     https://www.bilibili.com/video/BV1X1421d7ri?p=2
     https://m.bilibili.com/video/BV1X1421d7ri
*/
(function () {
  var BV_RE = /bilibili\.com\/video\/(BV[0-9A-Za-z]{10})/;

  function makeEmbed(bvid, page) {
    var wrap = document.createElement('span');
    wrap.className = 'bili-embed';

    var iframe = document.createElement('iframe');
    iframe.src =
      'https://player.bilibili.com/player.html?bvid=' + bvid +
      '&page=' + page + '&autoplay=0&high_quality=1&danmaku=0';
    iframe.title = 'bilibili ' + bvid;
    iframe.loading = 'lazy';
    iframe.scrolling = 'no';
    iframe.frameBorder = '0';
    iframe.allowFullscreen = true;
    iframe.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture');

    wrap.appendChild(iframe);
    return wrap;
  }

  function run() {
    var links = document.querySelectorAll(
      '.mp-body a[href*="bilibili.com/video/"], .memo-body a[href*="bilibili.com/video/"], .prose a[href*="bilibili.com/video/"]'
    );

    links.forEach(function (a) {
      var href = a.getAttribute('href') || '';
      var m = href.match(BV_RE);
      if (!m) return;

      var pageMatch = href.match(/[?&]p=(\d+)/);
      var embed = makeEmbed(m[1], pageMatch ? pageMatch[1] : '1');

      // 如果这个链接是段落里唯一的内容，整段替换掉，避免留下空行
      var p = a.parentElement;
      var onlyChild =
        p &&
        p.tagName === 'P' &&
        p.childNodes.length === 1 &&
        p.firstChild === a;

      if (onlyChild) {
        p.parentNode.replaceChild(embed, p);
      } else {
        a.parentNode.replaceChild(embed, a);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
