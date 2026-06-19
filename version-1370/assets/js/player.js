(function () {
  function startMoviePlayer() {
    var video = document.querySelector('[data-player]');
    var overlay = document.querySelector('[data-player-overlay]');
    var playButton = document.querySelector('[data-play-button]');

    if (!video) {
      return;
    }

    var stream = video.getAttribute('data-stream') || '';
    var hls = null;
    var ready = false;

    function attachStream() {
      if (ready || !stream) {
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      }

      ready = true;
    }

    function hideOverlay() {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    }

    function playVideo(event) {
      if (event) {
        event.preventDefault();
      }
      attachStream();
      hideOverlay();
      video.controls = true;
      var play = video.play();
      if (play && typeof play.catch === 'function') {
        play.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener('click', playVideo);
    }

    if (playButton) {
      playButton.addEventListener('click', playVideo);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      }
    });

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', startMoviePlayer);
}());
