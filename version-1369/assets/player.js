function MovieSitePlayer(videoId, streamUrl, overlayId) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);

    if (!video || !streamUrl) {
        return;
    }

    var attached = false;
    var hlsInstance = null;

    function attachStream() {
        if (attached) {
            return;
        }
        attached = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls();
            hlsInstance.loadSource(streamUrl);
            hlsInstance.attachMedia(video);
        } else {
            video.src = streamUrl;
        }
    }

    function playVideo() {
        attachStream();
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
            promise.catch(function() {});
        }
    }

    if (overlay) {
        overlay.addEventListener("click", playVideo);
    }

    video.addEventListener("click", function() {
        if (video.paused) {
            playVideo();
        }
    });

    video.addEventListener("play", function() {
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
    });

    window.addEventListener("pagehide", function() {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
