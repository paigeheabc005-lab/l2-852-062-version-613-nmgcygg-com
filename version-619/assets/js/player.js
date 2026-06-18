import { H as Hls } from './hls-vendor-dru42stk.js';

(function () {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

    players.forEach(function (wrap) {
        var video = wrap.querySelector('video');
        var button = wrap.querySelector('[data-play-button]');
        var stream = wrap.getAttribute('data-stream') || '';
        var ready = false;
        var hls = null;

        var attach = function () {
            if (ready || !video || !stream) {
                return Promise.resolve();
            }

            ready = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
                return Promise.resolve();
            }

            if (Hls && Hls.isSupported()) {
                hls = new Hls({
                    maxBufferLength: 30,
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
                return Promise.resolve();
            }

            return Promise.resolve();
        };

        var play = function () {
            attach().then(function () {
                if (!video) {
                    return;
                }
                wrap.classList.add('is-playing');
                var result = video.play();
                if (result && typeof result.catch === 'function') {
                    result.catch(function () {
                        wrap.classList.remove('is-playing');
                    });
                }
            });
        };

        if (button) {
            button.addEventListener('click', play);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    play();
                }
            });

            video.addEventListener('play', function () {
                wrap.classList.add('is-playing');
            });

            video.addEventListener('pause', function () {
                wrap.classList.remove('is-playing');
            });

            video.addEventListener('ended', function () {
                wrap.classList.remove('is-playing');
            });
        }
    });
}());
