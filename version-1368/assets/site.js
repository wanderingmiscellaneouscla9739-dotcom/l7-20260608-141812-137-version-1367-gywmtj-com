(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  ready(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');
    if (toggle && mobileNav) {
      toggle.addEventListener('click', function () {
        mobileNav.classList.toggle('is-open');
      });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
      var current = 0;
      var timer = null;
      var show = function (index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle('is-active', i === current);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle('is-active', i === current);
        });
      };
      var start = function () {
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5600);
      };
      dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
          if (timer) {
            window.clearInterval(timer);
          }
          show(i);
          start();
        });
      });
      if (slides.length > 1) {
        start();
      }
    }

    var heroForm = document.querySelector('[data-hero-search]');
    if (heroForm) {
      heroForm.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = heroForm.querySelector('input');
        var value = input ? input.value.trim() : '';
        var target = value ? 'search.html?q=' + encodeURIComponent(value) : 'search.html';
        window.location.href = target;
      });
    }

    var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));
    scopes.forEach(function (scope) {
      var search = scope.querySelector('[data-filter-search]');
      var type = scope.querySelector('[data-filter-type]');
      var region = scope.querySelector('[data-filter-region]');
      var year = scope.querySelector('[data-filter-year]');
      var category = scope.querySelector('[data-filter-category]');
      var count = scope.querySelector('[data-result-count]');
      var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
      var params = new URLSearchParams(window.location.search);
      var initial = params.get('q');

      if (initial && search) {
        search.value = initial;
      }

      var apply = function () {
        var q = normalize(search && search.value);
        var t = normalize(type && type.value);
        var r = normalize(region && region.value);
        var y = normalize(year && year.value);
        var c = normalize(category && category.value);
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-year'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-tags')
          ].join(' '));
          var ok = true;
          if (q && haystack.indexOf(q) === -1) {
            ok = false;
          }
          if (t && normalize(card.getAttribute('data-type')).indexOf(t) === -1) {
            ok = false;
          }
          if (r && normalize(card.getAttribute('data-region')).indexOf(r) === -1) {
            ok = false;
          }
          if (y && normalize(card.getAttribute('data-year')) !== y) {
            ok = false;
          }
          if (c && normalize(card.getAttribute('data-category')) !== c) {
            ok = false;
          }
          card.classList.toggle('hidden-card', !ok);
          if (ok) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = '筛选结果 ' + visible + ' 部';
        }
      };

      [search, type, region, year, category].forEach(function (el) {
        if (el) {
          el.addEventListener('input', apply);
          el.addEventListener('change', apply);
        }
      });

      apply();
    });
  });
})();
