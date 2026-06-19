(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var toggle = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-mobile-nav]");
        if (toggle && menu) {
            toggle.addEventListener("click", function () {
                menu.classList.toggle("open");
            });
        }

        var hero = document.querySelector("[data-hero]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var current = 0;
            var timer = null;

            function show(index) {
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("active", slideIndex === current);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("active", dotIndex === current);
                });
            }

            function start() {
                if (timer) {
                    clearInterval(timer);
                }
                timer = setInterval(function () {
                    show(current + 1);
                }, 5200);
            }

            dots.forEach(function (dot, index) {
                dot.addEventListener("click", function () {
                    show(index);
                    start();
                });
            });

            if (slides.length > 1) {
                start();
            }
        }

        document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
            var buttons = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-button]"));
            var results = scope.parentElement.querySelectorAll("[data-filter-item]");
            buttons.forEach(function (button) {
                button.addEventListener("click", function () {
                    var value = button.getAttribute("data-filter-button") || "all";
                    buttons.forEach(function (item) {
                        item.classList.toggle("active", item === button);
                    });
                    results.forEach(function (item) {
                        var text = item.getAttribute("data-filter-item") || "";
                        item.style.display = value === "all" || text.indexOf(value) !== -1 ? "" : "none";
                    });
                });
            });
        });

        var searchResults = document.querySelector("[data-search-results]");
        var searchStatus = document.querySelector("[data-search-status]");
        if (searchResults && searchStatus && Array.isArray(window.SEARCH_INDEX)) {
            var params = new URLSearchParams(window.location.search);
            var query = (params.get("q") || "").trim();
            var input = document.querySelector('.search-page-form input[name="q"]');
            if (input) {
                input.value = query;
            }
            if (query) {
                var lower = query.toLowerCase();
                var matched = window.SEARCH_INDEX.filter(function (item) {
                    return item.text.toLowerCase().indexOf(lower) !== -1;
                }).slice(0, 120);
                searchStatus.textContent = matched.length ? "搜索结果" : "没有找到匹配影片";
                searchResults.innerHTML = matched.map(function (item) {
                    return [
                        '<article class="movie-card">',
                        '<a class="poster-link" href="' + item.url + '">',
                        '<img src="' + item.image + '" alt="' + item.title + '" loading="lazy">',
                        '<span class="poster-badge">' + item.type + '</span>',
                        '<span class="poster-play"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"></path></svg></span>',
                        '</a>',
                        '<div class="movie-card-body">',
                        '<div class="meta-row"><span>' + item.year + '</span><span>' + item.region + '</span></div>',
                        '<h2><a href="' + item.url + '">' + item.title + '</a></h2>',
                        '<p>' + item.description + '</p>',
                        '<div class="tag-row"><span>' + item.genre + '</span></div>',
                        '</div>',
                        '</article>'
                    ].join("");
                }).join("");
            }
        }
    });
}());
