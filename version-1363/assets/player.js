(function () {
    window.initMoviePlayer = function (videoUrl) {
        var video = document.getElementById("moviePlayer");
        var cover = document.getElementById("playerCover");
        var hls = null;
        var attached = false;

        function attachVideo() {
            if (!video || !videoUrl || attached) {
                return;
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = videoUrl;
                attached = true;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(videoUrl);
                hls.attachMedia(video);
                attached = true;
                return;
            }

            video.src = videoUrl;
            attached = true;
        }

        function beginPlay() {
            attachVideo();

            if (cover) {
                cover.classList.add("is-hidden");
            }

            if (video) {
                var promise = video.play();

                if (promise && promise.catch) {
                    promise.catch(function () {
                        if (cover) {
                            cover.classList.remove("is-hidden");
                        }
                    });
                }
            }
        }

        if (cover) {
            cover.addEventListener("click", beginPlay);
        }

        if (video) {
            video.addEventListener("click", function () {
                if (video.paused) {
                    beginPlay();
                }
            });

            video.addEventListener("play", function () {
                if (cover) {
                    cover.classList.add("is-hidden");
                }
            });
        }

        attachVideo();

        window.addEventListener("pagehide", function () {
            if (hls && hls.destroy) {
                hls.destroy();
            }
        });
    };
})();
