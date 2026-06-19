
(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initMobileMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-menu]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function initHero() {
    var root = document.querySelector('[data-hero]');
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    var prev = root.querySelector('[data-hero-prev]');
    var next = root.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });
    show(0);
    restart();
  }

  function textForCard(card) {
    return [
      card.getAttribute('data-title'),
      card.getAttribute('data-year'),
      card.getAttribute('data-region'),
      card.getAttribute('data-type'),
      card.getAttribute('data-genre'),
      card.getAttribute('data-tags')
    ].join(' ').toLowerCase();
  }

  function filterTarget(targetId) {
    var target = document.getElementById(targetId);
    if (!target) {
      return;
    }
    var keywordInputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-target="' + targetId + '"]'))
      .filter(function (el) { return el.classList.contains('movie-search'); });
    var filterControls = Array.prototype.slice.call(document.querySelectorAll('[data-filter-field][data-search-target="' + targetId + '"]'));
    var cards = Array.prototype.slice.call(target.querySelectorAll('.movie-card'));
    var count = document.querySelector('[data-count-for="' + targetId + '"]');

    function apply() {
      var keyword = keywordInputs.map(function (input) { return input.value.trim().toLowerCase(); }).join(' ').trim();
      var visible = 0;
      cards.forEach(function (card) {
        var matchedKeyword = !keyword || textForCard(card).indexOf(keyword) !== -1;
        var matchedFilters = filterControls.every(function (control) {
          var value = control.value;
          var field = control.getAttribute('data-filter-field');
          return !value || String(card.getAttribute('data-' + field)) === value;
        });
        var isVisible = matchedKeyword && matchedFilters;
        card.classList.toggle('is-hidden', !isVisible);
        if (isVisible) {
          visible += 1;
        }
      });
      if (count) {
        count.textContent = visible + ' 部';
      }
    }

    keywordInputs.forEach(function (input) {
      input.addEventListener('input', apply);
    });
    filterControls.forEach(function (control) {
      control.addEventListener('change', apply);
    });
    apply();
  }

  function initFilters() {
    var targets = {};
    Array.prototype.slice.call(document.querySelectorAll('[data-search-target]')).forEach(function (el) {
      targets[el.getAttribute('data-search-target')] = true;
    });
    Object.keys(targets).forEach(filterTarget);
  }

  function initPlayers() {
    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (shell) {
      var video = shell.querySelector('video');
      var button = shell.querySelector('[data-play]');
      var message = shell.querySelector('[data-player-message]');
      var source = shell.getAttribute('data-source');
      var loaded = false;
      var hlsInstance = null;

      function setMessage(text) {
        if (message) {
          message.textContent = text || '';
        }
      }

      function loadVideo() {
        if (!video || !source) {
          setMessage('当前影片未检测到播放源。');
          return;
        }
        if (loaded) {
          video.play().catch(function () {});
          return;
        }
        loaded = true;
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setMessage('播放源加载完成。');
            video.play().catch(function () {
              setMessage('播放源已加载，请点击播放器开始播放。');
            });
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (_, data) {
            if (data && data.fatal) {
              setMessage('播放源暂时无法加载，请稍后重试。');
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.addEventListener('loadedmetadata', function () {
            video.play().catch(function () {
              setMessage('播放源已加载，请点击播放器开始播放。');
            });
          }, { once: true });
        } else {
          setMessage('当前浏览器需要支持 HLS 或加载 hls.js 后播放。');
        }
      }

      if (button) {
        button.addEventListener('click', function () {
          shell.classList.add('is-playing');
          loadVideo();
        });
      }
      if (video) {
        video.addEventListener('play', function () {
          shell.classList.add('is-playing');
        });
        video.addEventListener('pause', function () {
          if (!video.currentTime) {
            shell.classList.remove('is-playing');
          }
        });
      }
      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    initMobileMenu();
    initHero();
    initFilters();
    initPlayers();
  });
})();
