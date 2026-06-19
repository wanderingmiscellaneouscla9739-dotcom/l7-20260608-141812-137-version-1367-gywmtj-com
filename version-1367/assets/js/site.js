(function () {
  var toggle = document.querySelector('.menu-toggle');
  var panel = document.querySelector('.mobile-panel');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      var open = panel.hasAttribute('hidden');
      if (open) {
        panel.removeAttribute('hidden');
      } else {
        panel.setAttribute('hidden', '');
      }
      toggle.setAttribute('aria-expanded', String(open));
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;

    function showHero(next) {
      index = next;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showHero(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showHero((index + 1) % slides.length);
      }, 5000);
    }
  }

  function fillSelect(select, values) {
    if (!select) {
      return;
    }
    values.forEach(function (value) {
      var option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  var filterGrid = document.querySelector('.filter-grid');
  if (filterGrid) {
    var cards = Array.prototype.slice.call(filterGrid.querySelectorAll('.movie-card'));
    var textInput = document.querySelector('.page-filter');
    var typeFilter = document.querySelector('.type-filter');
    var yearFilter = document.querySelector('.year-filter');
    var clear = document.querySelector('.clear-filter');
    var empty = document.querySelector('.empty-state');
    var types = [];
    var years = [];

    cards.forEach(function (card) {
      var type = card.getAttribute('data-type') || '';
      var year = card.getAttribute('data-year') || '';
      if (type && types.indexOf(type) === -1) {
        types.push(type);
      }
      if (year && years.indexOf(year) === -1) {
        years.push(year);
      }
    });

    types.sort();
    years.sort(function (a, b) {
      return Number(b) - Number(a);
    });

    fillSelect(typeFilter, types);
    fillSelect(yearFilter, years);

    function applyFilters() {
      var query = textInput ? textInput.value.trim().toLowerCase() : '';
      var type = typeFilter ? typeFilter.value : '';
      var year = yearFilter ? yearFilter.value : '';
      var shown = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-type'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' ').toLowerCase();
        var okText = !query || haystack.indexOf(query) !== -1;
        var okType = !type || card.getAttribute('data-type') === type;
        var okYear = !year || card.getAttribute('data-year') === year;
        var visible = okText && okType && okYear;
        card.hidden = !visible;
        if (visible) {
          shown += 1;
        }
      });

      if (empty) {
        empty.hidden = shown !== 0;
      }
    }

    [textInput, typeFilter, yearFilter].forEach(function (item) {
      if (item) {
        item.addEventListener('input', applyFilters);
        item.addEventListener('change', applyFilters);
      }
    });

    if (clear) {
      clear.addEventListener('click', function () {
        if (textInput) {
          textInput.value = '';
        }
        if (typeFilter) {
          typeFilter.value = '';
        }
        if (yearFilter) {
          yearFilter.value = '';
        }
        applyFilters();
      });
    }
  }

  var rankList = document.querySelector('[data-rank-list]');
  if (rankList) {
    var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-sort]'));

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        var key = button.getAttribute('data-sort');
        var rows = Array.prototype.slice.call(rankList.querySelectorAll('[data-rank-card]'));

        buttons.forEach(function (btn) {
          btn.classList.toggle('is-active', btn === button);
        });

        rows.sort(function (a, b) {
          return Number(b.getAttribute('data-' + key)) - Number(a.getAttribute('data-' + key));
        });

        rows.forEach(function (row, i) {
          var no = row.querySelector('.rank-no');
          if (no) {
            no.textContent = String(i + 1);
          }
          rankList.appendChild(row);
        });
      });
    });
  }
}());
