(function() {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function() {
      mobileNav.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var prevButton = document.querySelector('[data-hero-prev]');
  var nextButton = document.querySelector('[data-hero-next]');
  var activeIndex = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeIndex = (index + slides.length) % slides.length;

    slides.forEach(function(slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === activeIndex);
    });

    dots.forEach(function(dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === activeIndex);
    });
  }

  function restartHero() {
    if (!slides.length) {
      return;
    }

    window.clearInterval(timer);
    timer = window.setInterval(function() {
      showSlide(activeIndex + 1);
    }, 5000);
  }

  if (slides.length) {
    showSlide(0);
    restartHero();

    if (prevButton) {
      prevButton.addEventListener('click', function() {
        showSlide(activeIndex - 1);
        restartHero();
      });
    }

    if (nextButton) {
      nextButton.addEventListener('click', function() {
        showSlide(activeIndex + 1);
        restartHero();
      });
    }

    dots.forEach(function(dot) {
      dot.addEventListener('click', function() {
        var nextIndex = Number(dot.getAttribute('data-hero-dot')) || 0;
        showSlide(nextIndex);
        restartHero();
      });
    });
  }

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-page-search]'));

  searchInputs.forEach(function(input) {
    input.addEventListener('input', function() {
      var query = input.value.trim().toLowerCase();
      var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search]'));

      cards.forEach(function(card) {
        var haystack = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
        var matched = !query || haystack.indexOf(query) !== -1;
        card.classList.toggle('is-filter-hidden', !matched);
      });
    });
  });
})();
