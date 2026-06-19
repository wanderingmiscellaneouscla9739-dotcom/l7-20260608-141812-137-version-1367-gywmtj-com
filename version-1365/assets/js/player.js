(function() {
  var video = document.querySelector('[data-player-video]');
  var startButton = document.querySelector('[data-player-start]');
  var message = document.querySelector('[data-player-message]');
  var source = window.__MOVIE_SOURCE__;
  var prepared = false;
  var hls = null;

  function setMessage(text) {
    if (message) {
      message.textContent = text || '';
    }
  }

  function playVideo() {
    if (!video) {
      return;
    }

    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function() {
        setMessage('点击视频画面继续播放');
      });
    }
  }

  function prepare() {
    if (!video || !source) {
      setMessage('当前影片暂不可播放');
      return;
    }

    if (startButton) {
      startButton.classList.add('is-hidden');
    }

    setMessage('正在加载影片');

    if (prepared) {
      playVideo();
      return;
    }

    prepared = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.addEventListener('loadedmetadata', function() {
        setMessage('');
        playVideo();
      }, { once: true });
      video.addEventListener('error', function() {
        setMessage('当前浏览器暂不支持播放');
      });
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function() {
        setMessage('');
        playVideo();
      });
      hls.on(window.Hls.Events.ERROR, function(eventName, data) {
        if (data && data.fatal) {
          setMessage('当前浏览器暂不支持播放');
          if (hls) {
            hls.destroy();
            hls = null;
          }
        }
      });
      return;
    }

    setMessage('当前浏览器暂不支持播放');
  }

  if (startButton) {
    startButton.addEventListener('click', prepare);
  }

  if (video) {
    video.addEventListener('click', function() {
      if (!prepared) {
        prepare();
      }
    });
  }
})();
