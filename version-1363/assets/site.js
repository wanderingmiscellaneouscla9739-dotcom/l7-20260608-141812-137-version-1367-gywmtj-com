(function () {
    var mobileButton = document.querySelector("[data-mobile-toggle]");
    var mobilePanel = document.getElementById("mobilePanel");

    if (mobileButton && mobilePanel) {
        mobileButton.addEventListener("click", function () {
            mobilePanel.classList.toggle("is-open");
            mobileButton.setAttribute("aria-expanded", mobilePanel.classList.contains("is-open") ? "true" : "false");
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var prev = document.querySelector("[data-hero-prev]");
    var next = document.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
        if (!slides.length) {
            return;
        }

        index = (nextIndex + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("is-active", slideIndex === index);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("is-active", dotIndex === index);
            dot.setAttribute("aria-pressed", dotIndex === index ? "true" : "false");
        });
    }

    function startHero() {
        if (slides.length <= 1) {
            return;
        }

        clearInterval(timer);
        timer = setInterval(function () {
            showSlide(index + 1);
        }, 5600);
    }

    if (prev) {
        prev.addEventListener("click", function () {
            showSlide(index - 1);
            startHero();
        });
    }

    if (next) {
        next.addEventListener("click", function () {
            showSlide(index + 1);
            startHero();
        });
    }

    dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
            showSlide(dotIndex);
            startHero();
        });
    });

    showSlide(0);
    startHero();

    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    var localSearch = document.querySelector("[data-local-search]");
    var chips = Array.prototype.slice.call(document.querySelectorAll("[data-filter-chip]"));
    var state = document.querySelector("[data-search-state]");
    var currentFilter = "all";

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function applyCards() {
        if (!cards.length) {
            return;
        }

        var query = normalize(localSearch ? localSearch.value : "");
        var shown = 0;

        cards.forEach(function (card) {
            var haystack = normalize([
                card.getAttribute("data-title"),
                card.getAttribute("data-genre"),
                card.getAttribute("data-tags"),
                card.getAttribute("data-year"),
                card.getAttribute("data-region"),
                card.getAttribute("data-type")
            ].join(" "));

            var matchesQuery = !query || haystack.indexOf(query) !== -1;
            var matchesFilter = currentFilter === "all" || haystack.indexOf(normalize(currentFilter)) !== -1;
            var visible = matchesQuery && matchesFilter;

            card.classList.toggle("is-hidden", !visible);

            if (visible) {
                shown += 1;
            }
        });

        if (state) {
            state.classList.toggle("is-visible", shown === 0);
        }
    }

    if (localSearch) {
        var params = new URLSearchParams(window.location.search);
        var queryParam = params.get("q");

        if (queryParam) {
            localSearch.value = queryParam;
        }

        localSearch.addEventListener("input", applyCards);
        applyCards();
    }

    chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
            currentFilter = chip.getAttribute("data-filter-chip") || "all";

            chips.forEach(function (item) {
                item.classList.toggle("is-active", item === chip);
            });

            applyCards();
        });
    });

    var headerForms = Array.prototype.slice.call(document.querySelectorAll("[data-search-form]"));

    headerForms.forEach(function (form) {
        form.addEventListener("submit", function (event) {
            var input = form.querySelector("input[name='q']");
            if (!input || !input.value.trim()) {
                event.preventDefault();
            }
        });
    });
})();
