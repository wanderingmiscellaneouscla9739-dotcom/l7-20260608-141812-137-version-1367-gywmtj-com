(function () {
  function openMobileMenu() {
    var button = document.querySelector('[data-menu-button]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function startHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        restart();
      });
    });

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

    restart();
  }

  function readQuery() {
    var params = new URLSearchParams(window.location.search);
    return params.get('q') || '';
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function startFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));
    scopes.forEach(function (scope) {
      var input = scope.querySelector('[data-search-input]');
      var type = scope.querySelector('[data-type-filter]');
      var year = scope.querySelector('[data-year-filter]');
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
      var empty = scope.querySelector('[data-empty-state]');

      if (!cards.length) {
        return;
      }

      if (input && readQuery()) {
        input.value = readQuery();
      }

      function apply() {
        var keyword = normalize(input ? input.value : '');
        var typeValue = normalize(type ? type.value : '');
        var yearValue = normalize(year ? year.value : '');
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-year'),
            card.getAttribute('data-tags')
          ].join(' '));
          var cardType = normalize(card.getAttribute('data-type'));
          var cardYear = normalize(card.getAttribute('data-year'));
          var matched = true;

          if (keyword && haystack.indexOf(keyword) === -1) {
            matched = false;
          }
          if (typeValue && cardType.indexOf(typeValue) === -1) {
            matched = false;
          }
          if (yearValue && cardYear.indexOf(yearValue) === -1) {
            matched = false;
          }

          card.hidden = !matched;
          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      [input, type, year].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });

      apply();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    openMobileMenu();
    startHero();
    startFilters();
  });
}());
