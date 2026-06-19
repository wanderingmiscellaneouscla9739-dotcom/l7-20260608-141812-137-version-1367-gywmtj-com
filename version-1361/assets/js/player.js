(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var video = document.querySelector('[data-player]');
        var playButton = document.querySelector('[data-play-button]');
        var status = document.querySelector('[data-player-status]');

        if (!video || !playButton) {
            return;
        }

        var source = video.getAttribute('data-video-src');
        var hlsInstance = null;

        function setStatus(message) {
            if (status) {
                status.textContent = message;
            }
        }

        function loadScript(src) {
            return new Promise(function (resolve, reject) {
                var existing = document.querySelector('script[src="' + src + '"]');

                if (existing) {
                    existing.addEventListener('load', resolve);
                    existing.addEventListener('error', reject);
                    if (window.Hls) {
                        resolve();
                    }
                    return;
                }

                var script = document.createElement('script');
                script.src = src;
                script.async = true;
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        }

        function attachNative() {
            video.src = source;
            video.setAttribute('data-ready', '1');
            setStatus('浏览器支持原生 HLS，播放源已载入。');
            return Promise.resolve();
        }

        function attachHls() {
            if (!window.Hls || !window.Hls.isSupported()) {
                return Promise.reject(new Error('当前浏览器未启用 HLS.js 支持'));
            }

            if (hlsInstance) {
                hlsInstance.destroy();
            }

            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });

            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            video.setAttribute('data-ready', '1');
            setStatus('HLS.js 已初始化，播放源已绑定。');
            return Promise.resolve();
        }

        function preparePlayer() {
            if (video.getAttribute('data-ready') === '1') {
                return Promise.resolve();
            }

            if (!source) {
                return Promise.reject(new Error('未找到 m3u8 播放源'));
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                return attachNative();
            }

            if (window.Hls && window.Hls.isSupported()) {
                return attachHls();
            }

            setStatus('正在加载 HLS 播放组件...');
            return loadScript('https://cdn.jsdelivr.net/npm/hls.js@latest')
                .then(attachHls);
        }

        function playVideo() {
            preparePlayer()
                .then(function () {
                    return video.play();
                })
                .then(function () {
                    playButton.classList.add('is-hidden');
                    setStatus('正在播放。');
                })
                .catch(function (error) {
                    setStatus('播放初始化失败：' + error.message);
                });
        }

        playButton.addEventListener('click', playVideo);

        video.addEventListener('play', function () {
            playButton.classList.add('is-hidden');
        });

        video.addEventListener('pause', function () {
            if (!video.ended) {
                playButton.classList.remove('is-hidden');
            }
        });

        video.addEventListener('ended', function () {
            playButton.classList.remove('is-hidden');
            setStatus('播放结束，可重新点击播放。');
        });
    });
})();
