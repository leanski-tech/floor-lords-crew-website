/* Auto-play photo slider. Markup: <div class="ps" data-ps='[{"src":"/a.jpg","alt":"..."}]' data-ps-interval="4500"></div> */
(function () {
  var css =
    '.ps{position:relative;width:100%;aspect-ratio:16/10;max-height:78vh;overflow:hidden;background:#000;touch-action:pan-y;user-select:none;outline:none}' +
    '@media(max-width:700px){.ps{aspect-ratio:1/1;max-height:70vh}}' +
    '.ps-slide{position:absolute;inset:0;opacity:0;transition:opacity 1.1s ease}' +
    '.ps-slide.on{opacity:1}' +
    '.ps-bg{position:absolute;inset:-30px;background-size:cover;background-position:center;filter:blur(24px) brightness(.45);transform:scale(1.1)}' +
    '.ps.ps .ps-slide img.ps-img{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;max-width:none!important;margin:0!important;object-fit:contain!important;object-position:50% 50%!important;transform:scale(1);will-change:transform}' +
    '.ps-slide.on img{animation:psZoom 7s ease-out forwards}' +
    '@keyframes psZoom{from{transform:scale(1)}to{transform:scale(1.07)}}' +
    '.ps.paused .ps-slide.on img{animation-play-state:paused}' +
    '.ps-btn{position:absolute;top:50%;transform:translateY(-50%);z-index:3;width:48px;height:48px;border-radius:50%;border:1px solid rgba(255,255,255,.35);' +
    'background:rgba(0,0,0,.45);color:#fff;font-size:26px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0 0 3px}' +
    '.ps-btn:hover{background:rgba(0,0,0,.75)}.ps-prev{left:12px}.ps-next{right:12px}' +
    '.ps-count{position:absolute;right:12px;bottom:12px;z-index:3;padding:5px 10px;border-radius:999px;background:rgba(0,0,0,.55);color:#fff;font:700 12px/1 Arial,sans-serif;letter-spacing:.08em}' +
    '.ps-bar{position:absolute;left:0;bottom:0;height:3px;z-index:3;background:var(--ps-accent,#e63917);width:0}' +
    '.ps-bar.run{transition:width linear}' +
    '@media(prefers-reduced-motion:reduce){.ps-slide{transition:none}.ps-slide.on img{animation:none}}';
  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  function build(root) {
    if (root.dataset.psReady) return;
    root.dataset.psReady = '1';
    var items = [];
    try { items = JSON.parse(root.getAttribute('data-ps') || '[]'); } catch (e) { return; }
    if (!items.length) return;
    var interval = parseInt(root.getAttribute('data-ps-interval') || '4500', 10);
    root.setAttribute('role', 'region');
    root.setAttribute('aria-roledescription', 'carousel');
    root.setAttribute('aria-label', root.getAttribute('aria-label') || 'Photo slideshow');
    root.tabIndex = 0;

    var slides = items.map(function (it, i) {
      var s = document.createElement('div');
      s.className = 'ps-slide';
      s.setAttribute('aria-hidden', 'true');
      s.innerHTML = '<div class="ps-bg"></div><img class="ps-img" alt="">';
      var img = s.querySelector('img');
      img.alt = it.alt || '';
      img.decoding = 'async';
      s._src = it.src;
      root.appendChild(s);
      return s;
    });
    function load(i) {
      var s = slides[(i + slides.length) % slides.length];
      if (s._loaded) return;
      s._loaded = true;
      s.querySelector('img').src = s._src;
      s.querySelector('.ps-bg').style.backgroundImage = 'url("' + s._src + '")';
    }

    root.insertAdjacentHTML('beforeend',
      '<button class="ps-btn ps-prev" type="button" aria-label="Previous photo">&#8249;</button>' +
      '<button class="ps-btn ps-next" type="button" aria-label="Next photo">&#8250;</button>' +
      '<div class="ps-count" aria-live="polite"></div><div class="ps-bar"></div>');
    var count = root.querySelector('.ps-count');
    var bar = root.querySelector('.ps-bar');
    var cur = 0, timer = null, paused = false, visible = true;

    function show(i) {
      slides[cur].classList.remove('on');
      slides[cur].setAttribute('aria-hidden', 'true');
      cur = (i + slides.length) % slides.length;
      load(cur); load(cur + 1); load(cur - 1);
      slides[cur].classList.add('on');
      slides[cur].setAttribute('aria-hidden', 'false');
      count.textContent = (cur + 1) + ' / ' + slides.length;
      restart();
    }
    function restart() {
      clearTimeout(timer);
      bar.classList.remove('run');
      bar.style.width = '0';
      if (paused || !visible) return;
      void bar.offsetWidth;
      bar.classList.add('run');
      bar.style.transitionDuration = interval + 'ms';
      bar.style.width = '100%';
      timer = setTimeout(function () { show(cur + 1); }, interval);
    }
    function pause(p) { paused = p; root.classList.toggle('paused', p); restart(); }

    root.querySelector('.ps-prev').addEventListener('click', function () { show(cur - 1); });
    root.querySelector('.ps-next').addEventListener('click', function () { show(cur + 1); });
    root.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); show(cur - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); show(cur + 1); }
    });
    root.addEventListener('mouseenter', function () { pause(true); });
    root.addEventListener('mouseleave', function () { pause(false); });
    root.addEventListener('focusin', function () { pause(true); });
    root.addEventListener('focusout', function () { pause(false); });

    var sx = 0, sy = 0, touching = false;
    root.addEventListener('touchstart', function (e) {
      sx = e.touches[0].clientX; sy = e.touches[0].clientY; touching = true; pause(true);
    }, { passive: true });
    root.addEventListener('touchend', function (e) {
      if (!touching) return;
      touching = false;
      var t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.2) show(dx < 0 ? cur + 1 : cur - 1);
      pause(false);
    }, { passive: true });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        visible = es[0].isIntersecting;
        restart();
      }, { threshold: 0.25 }).observe(root);
    }
    document.addEventListener('visibilitychange', function () { visible = !document.hidden; restart(); });

    load(0); load(1);
    slides[0].classList.add('on');
    slides[0].setAttribute('aria-hidden', 'false');
    count.textContent = '1 / ' + slides.length;
    restart();
  }

  function boot(tries) {
    var els = document.querySelectorAll('.ps[data-ps]');
    els.forEach(build);
    if (!els.length && (tries || 0) < 80) setTimeout(function () { boot((tries || 0) + 1); }, 100);
  }
  window.PhotoSlider = { build: build };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { boot(0); });
  else boot(0);
})();
