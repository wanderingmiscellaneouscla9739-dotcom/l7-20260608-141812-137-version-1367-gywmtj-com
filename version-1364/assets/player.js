(function () {
    var hlsPromise = null;

    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function loadHls() {
        if (window.Hls) {
            return Promise.resolve(window.Hls);
        }
        if (hlsPromise) {
            return hlsPromise;
        }
        hlsPromise = new Promise(function (resolve, reject) {
            var script = document.createElement("script");
            script.src = "https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js";
            script.async = true;
            script.onload = function () {
                resolve(window.Hls);
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
        return hlsPromise;
    }

    ready(function () {
        document.querySelectorAll("[data-player]").forEach(function (player) {
            var video = player.querySelector("video");
            var startButton = player.querySelector("[data-player-start]");
            var toggleButton = player.querySelector("[data-player-toggle]");
            var muteButton = player.querySelector("[data-player-mute]");
            var fullscreenButton = player.querySelector("[data-player-fullscreen]");
            var hls = null;
            var loaded = false;

            function bindNative(url) {
                if (!video.src) {
                    video.src = url;
                }
                return Promise.resolve();
            }

            function bindHls(url) {
                return loadHls().then(function (Hls) {
                    if (Hls && Hls.isSupported()) {
                        if (!hls) {
                            hls = new Hls({ enableWorker: true, lowLatencyMode: true });
                            hls.attachMedia(video);
                        }
                        hls.loadSource(url);
                        return new Promise(function (resolve) {
                            hls.on(Hls.Events.MANIFEST_PARSED, function () {
                                resolve();
                            });
                            setTimeout(resolve, 1600);
                        });
                    }
                    return bindNative(url);
                }).catch(function () {
                    return bindNative(url);
                });
            }

            function ensureLoaded() {
                if (loaded) {
                    return Promise.resolve();
                }
                loaded = true;
                var url = video.getAttribute("data-play-url");
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    return bindNative(url);
                }
                return bindHls(url);
            }

            function play() {
                ensureLoaded().then(function () {
                    var promise = video.play();
                    if (promise && typeof promise.catch === "function") {
                        promise.catch(function () {});
                    }
                });
            }

            function toggle() {
                if (video.paused) {
                    play();
                } else {
                    video.pause();
                }
            }

            if (startButton) {
                startButton.addEventListener("click", play);
            }
            if (toggleButton) {
                toggleButton.addEventListener("click", toggle);
            }
            if (muteButton) {
                muteButton.addEventListener("click", function () {
                    video.muted = !video.muted;
                });
            }
            if (fullscreenButton) {
                fullscreenButton.addEventListener("click", function () {
                    if (document.fullscreenElement) {
                        document.exitFullscreen();
                    } else if (player.requestFullscreen) {
                        player.requestFullscreen();
                    }
                });
            }
            video.addEventListener("click", toggle);
            video.addEventListener("play", function () {
                player.classList.add("playing");
            });
            video.addEventListener("pause", function () {
                player.classList.remove("playing");
            });
        });
    });
}());
