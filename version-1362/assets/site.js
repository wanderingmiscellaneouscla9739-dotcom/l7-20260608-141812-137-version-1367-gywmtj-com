import { H as Hls } from "./hls.js";

const getRoot = () => document.body.dataset.root || "";

function initMobileNavigation() {
    const toggle = document.querySelector("[data-nav-toggle]");
    const panel = document.querySelector("[data-mobile-panel]");

    if (!toggle || !panel) {
        return;
    }

    toggle.addEventListener("click", () => {
        panel.classList.toggle("is-open");
    });
}

function initGlobalSearch() {
    const forms = document.querySelectorAll("[data-global-search]");
    const root = getRoot();

    forms.forEach((form) => {
        form.addEventListener("submit", (event) => {
            event.preventDefault();
            const input = form.querySelector("input[name='q']");
            const query = input ? input.value.trim() : "";

            if (query) {
                window.location.href = `${root}search.html?q=${encodeURIComponent(query)}`;
            }
        });
    });
}

function initHeroSlider() {
    const slider = document.querySelector("[data-hero-slider]");

    if (!slider) {
        return;
    }

    const slides = Array.from(slider.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(slider.querySelectorAll("[data-hero-dot]"));
    let activeIndex = 0;
    let timer = null;

    const activate = (index) => {
        activeIndex = (index + slides.length) % slides.length;

        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle("is-active", slideIndex === activeIndex);
        });

        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle("is-active", dotIndex === activeIndex);
        });
    };

    const start = () => {
        timer = window.setInterval(() => {
            activate(activeIndex + 1);
        }, 5200);
    };

    dots.forEach((dot, dotIndex) => {
        dot.addEventListener("click", () => {
            if (timer) {
                window.clearInterval(timer);
            }
            activate(dotIndex);
            start();
        });
    });

    if (slides.length > 1) {
        start();
    }
}

function initPageFilters() {
    const panels = document.querySelectorAll("[data-filter-panel]");

    panels.forEach((panel) => {
        const container = panel.closest("section") || document;
        const cards = Array.from(container.querySelectorAll("[data-filter-card]"));
        const searchInput = panel.querySelector("[data-page-search]");
        const yearSelect = panel.querySelector("[data-year-filter]");
        const typeButtons = Array.from(panel.querySelectorAll("[data-filter-type]"));
        const resultCount = panel.querySelector("[data-result-count]");
        let activeType = "all";

        const applyFilters = () => {
            const query = searchInput ? searchInput.value.trim().toLowerCase() : "";
            const selectedYear = yearSelect ? yearSelect.value : "all";
            let visible = 0;

            cards.forEach((card) => {
                const searchText = (card.dataset.search || "").toLowerCase();
                const cardYear = card.dataset.year || "";
                const cardType = card.dataset.type || "";
                const matchesQuery = !query || searchText.includes(query);
                const matchesYear = selectedYear === "all" || cardYear === selectedYear;
                const matchesType = activeType === "all" || cardType.includes(activeType);
                const shouldShow = matchesQuery && matchesYear && matchesType;

                card.classList.toggle("is-hidden-by-filter", !shouldShow);

                if (shouldShow) {
                    visible += 1;
                }
            });

            if (resultCount) {
                resultCount.textContent = String(visible);
            }
        };

        if (searchInput) {
            searchInput.addEventListener("input", applyFilters);
        }

        if (yearSelect) {
            yearSelect.addEventListener("change", applyFilters);
        }

        typeButtons.forEach((button) => {
            button.addEventListener("click", () => {
                activeType = button.dataset.filterType || "all";
                typeButtons.forEach((item) => item.classList.toggle("is-active", item === button));
                applyFilters();
            });
        });

        applyFilters();
    });
}

function initPlayers() {
    const players = document.querySelectorAll("[data-hls-player]");

    players.forEach((player) => {
        const video = player.querySelector("video");
        const button = player.querySelector("[data-play-button]");
        const message = player.querySelector("[data-player-message]");
        const source = player.dataset.src;
        let hlsInstance = null;
        let isBound = false;

        const showMessage = (text) => {
            if (message) {
                message.textContent = text;
            }
        };

        const bindSource = () => {
            if (!video || !source || isBound) {
                return;
            }

            if (Hls && Hls.isSupported()) {
                hlsInstance = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(Hls.Events.ERROR, (_event, data) => {
                    if (data && data.fatal) {
                        showMessage("视频加载遇到问题，请稍后再试或更换网络环境。 ");
                    }
                });
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else {
                showMessage("当前浏览器暂不支持 HLS 播放。 ");
                return;
            }

            video.controls = true;
            isBound = true;
        };

        const startPlayback = async () => {
            bindSource();

            if (!video || !isBound) {
                return;
            }

            if (button) {
                button.classList.add("is-hidden");
            }

            try {
                await video.play();
            } catch (error) {
                showMessage("浏览器阻止了自动播放，请再次点击播放器开始观看。 ");
            }
        };

        if (button) {
            button.addEventListener("click", startPlayback);
        }

        if (video) {
            video.addEventListener("click", () => {
                if (!isBound) {
                    startPlayback();
                    return;
                }

                if (video.paused) {
                    video.play();
                } else {
                    video.pause();
                }
            });
        }

        window.addEventListener("beforeunload", () => {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
}

function createSearchCard(item, root) {
    const tags = (item.tags || []).slice(0, 3).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");
    const style = `background-image: linear-gradient(180deg, rgba(0, 0, 0, 0.08), rgba(0, 0, 0, 0.64)), url('${root}${item.cover}.jpg');`;

    return `
        <article class="movie-card">
            <a href="${root}movies/${item.id}.html" class="movie-card-link" aria-label="观看${escapeHtml(item.title)}">
                <div class="movie-poster" style="${style}">
                    <span class="movie-badge">${escapeHtml(item.type)}</span>
                    <span class="movie-duration">${escapeHtml(item.duration)}</span>
                    <span class="movie-play">▶</span>
                </div>
                <div class="movie-card-body">
                    <div class="movie-card-meta">
                        <span>${escapeHtml(item.year)}</span>
                        <span>${escapeHtml(item.region)}</span>
                    </div>
                    <h3>${escapeHtml(item.title)}</h3>
                    <p>${escapeHtml(item.description)}</p>
                    <div class="tag-row">${tags}</div>
                </div>
            </a>
        </article>
    `;
}

function escapeHtml(value) {
    return String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function initSearchPage() {
    const page = document.querySelector("[data-search-page]");

    if (!page || !window.SEARCH_INDEX) {
        return;
    }

    const root = getRoot();
    const form = page.querySelector("[data-search-submit]");
    const input = page.querySelector("[data-search-input]");
    const summary = page.querySelector("[data-search-summary]");
    const results = page.querySelector("[data-search-results]");
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get("q") || "";

    if (input) {
        input.value = initialQuery;
    }

    const render = (query) => {
        const keyword = query.trim().toLowerCase();
        const matches = window.SEARCH_INDEX.filter((item) => {
            return !keyword || item.search.toLowerCase().includes(keyword);
        }).slice(0, 120);

        if (summary) {
            summary.textContent = keyword
                ? `“${query}” 找到 ${matches.length} 条结果，最多展示前 120 条。`
                : `输入关键词搜索全站影片；下方默认展示推荐结果 ${matches.length} 条。`;
        }

        if (results) {
            results.innerHTML = matches.map((item) => createSearchCard(item, root)).join("");
        }
    };

    if (form) {
        form.addEventListener("submit", (event) => {
            event.preventDefault();
            const query = input ? input.value.trim() : "";
            const url = query ? `search.html?q=${encodeURIComponent(query)}` : "search.html";
            window.history.replaceState(null, "", url);
            render(query);
        });
    }

    render(initialQuery);
}

function initHeaderShadow() {
    const header = document.querySelector("[data-site-header]");

    if (!header) {
        return;
    }

    const update = () => {
        header.classList.toggle("is-scrolled", window.scrollY > 10);
    };

    window.addEventListener("scroll", update, { passive: true });
    update();
}

document.addEventListener("DOMContentLoaded", () => {
    initMobileNavigation();
    initGlobalSearch();
    initHeroSlider();
    initPageFilters();
    initPlayers();
    initSearchPage();
    initHeaderShadow();
});
