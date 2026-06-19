function setupPlayer(streamUrl) {
  var run = function () {
    var video = document.getElementById('movie-video');
    var overlay = document.getElementById('movie-play-overlay');
    if (!video || !overlay || !streamUrl) {
      return;
    }

    var attached = false;
    var hls = null;

    var attach = function () {
      if (attached) {
        return;
      }
      attached = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    };

    var start = function () {
      attach();
      video.setAttribute('controls', 'controls');
      overlay.classList.add('is-hidden');
      var attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {
          overlay.classList.remove('is-hidden');
        });
      }
    };

    overlay.addEventListener('click', start);
    video.addEventListener('click', function () {
      if (!attached || video.paused) {
        start();
      } else {
        video.pause();
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
}
