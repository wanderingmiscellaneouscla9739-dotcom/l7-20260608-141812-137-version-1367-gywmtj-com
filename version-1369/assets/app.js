(function() {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function() {
        var toggle = document.querySelector(".mobile-toggle");
        var panel = document.querySelector(".mobile-panel");
        if (toggle && panel) {
            toggle.addEventListener("click", function() {
                var expanded = toggle.getAttribute("aria-expanded") === "true";
                toggle.setAttribute("aria-expanded", String(!expanded));
                panel.hidden = expanded;
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        var active = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            active = (index + slides.length) % slides.length;
            slides.forEach(function(slide, i) {
                slide.classList.toggle("is-active", i === active);
            });
            dots.forEach(function(dot, i) {
                dot.classList.toggle("is-active", i === active);
            });
        }

        function startSlides() {
            if (timer) {
                window.clearInterval(timer);
            }
            if (slides.length > 1) {
                timer = window.setInterval(function() {
                    showSlide(active + 1);
                }, 5000);
            }
        }

        dots.forEach(function(dot, index) {
            dot.addEventListener("click", function() {
                showSlide(index);
                startSlides();
            });
        });
        startSlides();

        var localFilter = document.querySelector(".local-filter");
        var typeFilter = document.querySelector(".type-filter");
        var list = document.querySelector(".filter-list");

        function filterCards() {
            if (!list) {
                return;
            }
            var keyword = localFilter ? localFilter.value.trim().toLowerCase() : "";
            var type = typeFilter ? typeFilter.value.trim() : "";
            var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
            cards.forEach(function(card) {
                var text = [
                    card.getAttribute("data-title"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-type"),
                    card.textContent
                ].join(" ").toLowerCase();
                var cardType = card.getAttribute("data-type") || "";
                var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchType = !type || cardType.indexOf(type) !== -1;
                card.classList.toggle("is-hidden-card", !(matchKeyword && matchType));
            });
        }

        if (localFilter) {
            localFilter.addEventListener("input", filterCards);
        }
        if (typeFilter) {
            typeFilter.addEventListener("change", filterCards);
        }

        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        var bigSearch = document.querySelector(".big-search input[name='q']");
        if (bigSearch && query) {
            bigSearch.value = query;
        }

        var results = document.getElementById("search-results");
        var title = document.getElementById("search-title");
        if (results && window.MovieSearchData && query) {
            var words = query.trim().toLowerCase();
            var matches = window.MovieSearchData.filter(function(item) {
                return item.text.toLowerCase().indexOf(words) !== -1;
            }).slice(0, 120);
            if (title) {
                title.textContent = "搜索结果：" + query;
            }
            results.innerHTML = matches.map(function(item) {
                return [
                    '<article class="movie-card">',
                    '<a href="' + item.file + '" class="poster-link" aria-label="' + item.title + '">',
                    '<img src="' + item.cover + '" alt="' + item.title + '" loading="lazy">',
                    '<span class="play-hover">▶</span>',
                    '<span class="type-badge">' + item.type + '</span>',
                    '</a>',
                    '<div class="card-body">',
                    '<h2><a href="' + item.file + '">' + item.title + '</a></h2>',
                    '<p class="meta-line">' + item.region + ' · ' + item.year + '</p>',
                    '<p class="card-desc">' + item.oneLine + '</p>',
                    '</div>',
                    '</article>'
                ].join("");
            }).join("");
            if (!matches.length) {
                results.innerHTML = '<div class="detail-panel"><h2>未找到相关内容</h2><p class="lead-text">可以更换关键词，或返回分类页面继续浏览。</p></div>';
            }
        }
    });
})();
