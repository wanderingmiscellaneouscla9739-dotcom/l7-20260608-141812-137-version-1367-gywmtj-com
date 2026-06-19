(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    ready(function () {
        setupNavigation();
        setupHeroCarousel();
        setupFilters();
    });

    function setupNavigation() {
        var toggle = document.querySelector('[data-nav-toggle]');
        var nav = document.querySelector('[data-site-nav]');

        if (!toggle || !nav) {
            return;
        }

        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function setupHeroCarousel() {
        var carousel = document.querySelector('[data-hero-carousel]');

        if (!carousel) {
            return;
        }

        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
        var prev = carousel.querySelector('[data-hero-prev]');
        var next = carousel.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        if (!slides.length) {
            return;
        }

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                start();
            });
        });

        carousel.addEventListener('mouseenter', stop);
        carousel.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function setupFilters() {
        var forms = Array.prototype.slice.call(document.querySelectorAll('[data-filter-form]'));

        forms.forEach(function (form) {
            var panel = form.closest('.search-panel') || document;
            var scope = panel.parentElement ? panel.parentElement.parentElement || document : document;
            var input = form.querySelector('[data-filter-input]');
            var yearSelect = form.querySelector('[data-filter-year]');
            var result = panel.querySelector('[data-filter-result]');
            var items = Array.prototype.slice.call(document.querySelectorAll('.filter-item'));

            function normalize(value) {
                return String(value || '').trim().toLowerCase();
            }

            function applyFilter() {
                var query = normalize(input && input.value);
                var year = normalize(yearSelect && yearSelect.value);
                var visible = 0;

                items.forEach(function (item) {
                    var text = normalize(item.getAttribute('data-search'));
                    var itemYear = normalize(item.getAttribute('data-year'));
                    var matchedQuery = !query || text.indexOf(query) !== -1;
                    var matchedYear = !year || itemYear === year;
                    var matched = matchedQuery && matchedYear;

                    item.classList.toggle('is-hidden', !matched);

                    if (matched) {
                        visible += 1;
                    }
                });

                if (result) {
                    result.textContent = '当前显示 ' + visible + ' 部影片';
                }
            }

            if (input) {
                input.addEventListener('input', applyFilter);
            }

            if (yearSelect) {
                yearSelect.addEventListener('change', applyFilter);
            }

            form.addEventListener('reset', function () {
                window.setTimeout(applyFilter, 0);
            });

            applyFilter();
        });
    }
})();
